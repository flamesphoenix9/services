# Order Service

Overview

- Purpose: Creates and manages orders in the distributed commerce system. Listens for cart checkout events to persist orders and listens for payment success events to mark orders as paid.
- Role in system: Acts as the authoritative record for orders and emits `order.created` events for downstream services (payment, fulfillment). Consumes `cart.checked_out` and `payment.success` events from RabbitMQ.

Routes

- POST /update-status
  - Request body (JSON):
    {
    "orderId": "uuid",
    "status": "cancelled" | "shipped" | "delivered"
    }
  - Headers:
    - `x-user-role`: must be `admin` to authorize this endpoint
  - Success response (200):
    - Returns the updated `order` object JSON
  - Notes: Admin-only endpoint. Validates status value and that the order is already paid before allowing status change.

Event Consumers

- cart checkout → `cart-exchange` `cart.checked_out`
  - Handler: `handlers/createOrder.js`
  - Expected message shape (from cart service):
    {
    "userId": "string",
    "email": "string",
    "items": [ { "productId": "uuid", "quantity": number, "price": number }, ... ],
    "totalAmount": number
    }
  - Behavior: Persists a new `Order` record with `status: pending` and publishes `order.created` to `order_exchange` with:
    {
    "orderId": "uuid",
    "userId": "string",
    "email": "string",
    "totalAmount": number,
    "status": "pending"
    }

- payment success → `payment_exchange` `payment.success`
  - Handler: `handlers/updateOrder.js`
  - Expected message shape (from payment service):
    {
    "orderId": "uuid",
    "userId": "string",
    "email": "string",
    "totalAmount": number,
    "status": "paid"
    }
  - Behavior: Locates the order by `orderId` and `userId` and marks it paid (implementation scaffold present in `updateOrder.js`).

Models (key fields)

- Order
  - `id` (UUID), `userId` (string), `email` (string), `items` (JSONB), `status` ("pending" | "cancelled" | "shipped" | "delivered"), `paid` (boolean), `totalAmount` (decimal)

Environment / Config

- `RABBITMQ_URL` - RabbitMQ connection string
- DB connection configured in `db/connectdb.js` (Sequelize)

Behavior & Notes

- Orders are created from `cart.checked_out` events and immediately emit `order.created` for downstream services (payment initialization).
- `items` are stored as `JSONB` — ensure the cart publishes a clean JSON structure for items.
- Admin status updates require `x-user-role: admin` header and will only allow status changes for paid orders.
- Error handling and response formatting use the service's custom error classes and `middleware/error-handler.js`.

Integration

- Called by: not directly called by clients for creation — orders are created via events from the `cart` service. Admins may update order status via the HTTP endpoint.
- Consumed by: payment service consumes `order.created` to initialize payments; fulfillment/notification services can subscribe to `order.created` and `payment.success`.

Examples

- Cart checkout message (published by cart service):
  {
  "userId": "user-123",
  "email": "buyer@example.com",
  "items": [ { "productId": "uuid", "quantity": 2, "price": 19.99 } ],
  "totalAmount": 39.98
  }

- Admin update request example:
  POST /update-status
  Headers: `x-user-role: admin`
  Body:
  {
  "orderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "shipped"
  }

Recommendations / Next steps

- Implement marking orders as `paid` in `handlers/updateOrder.js` and emit events when payment is confirmed.
- Add authentication/authorization middleware rather than relying solely on `x-user-role` header.
- Consider exposing read endpoints (GET /:orderId, GET /user/:userId) for order lookup by users and services.
