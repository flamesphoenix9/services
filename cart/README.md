# Cart Service

Overview

- Purpose: Manages per-user shopping carts stored in Redis, validates product availability, and publishes checkout events to start order creation.
- Role in system: Acts as a fast, ephemeral cart store used by frontends and as the entry point to create orders (publishes `cart.checked_out` to RabbitMQ).

Routes

- POST /add
  - Headers:
    - `x-user-id`: string (required)
  - Request body (JSON):
    {
    "productId": "uuid",
    "quantity": integer
    }
  - Success response (200):
    {
    "message": "Item added to Redis cart",
    "cart": { "<productId>": "<quantity>", ... }
    }
  - Notes: Validates `x-user-id`, checks product availability by calling the Product service `/:productId/stock`, stores cart as Redis hash `cart:<userId>` and expires it after 7 days of inactivity.

- GET /view
  - Headers:
    - `x-user-id`: string (required)
  - Success response (200):
    {
    "cart": { "<productId>": "<quantity>", ... }
    }
  - Notes: Returns 404 if the cart is empty.

- DELETE /remove
  - Headers:
    - `x-user-id`: string (required)
  - Request body (JSON):
    { "productId": "uuid" }
  - Success response (200):
    {
    "message": "Item removed from Redis cart",
    "cart": { updated cart }
    }
  - Notes: Removes the product from user's Redis hash; returns 404 if the item wasn't in the cart.

- POST /checkout
  - Headers:
    - `x-user-id`: string (required)
    - `x-email`: string (required, used for order/payment)
  - Request body: none
  - Success response (200):
    {
    "message": "Checkout successful, order placed"
    }
  - Notes: Fetches current cart from Redis, calls Product service for each item to get current price and name, computes `totalAmount` and `items` array, publishes message to `cart-exchange` with routing key `cart.checked_out`, then clears the Redis cart.

Published Event (`cart.checked_out`)

- Exchange: `cart-exchange`, Routing key: `cart.checked_out`
- Message shape:
  {
  "userId": "string",
  "email": "string",
  "items": [ { "productId": "uuid", "price": number, "quantity": integer, "name": "string" }, ... ],
  "totalAmount": number
  }

Storage

- Uses Redis hashes per user: key `cart:<userId>` with fields `productId -> quantity`.

Behavior & Notes

- Availability check: `add` endpoint queries Product service `/:productId/stock` to ensure enough stock before adding.
- Price & product info fetched at `checkout` time to avoid stale pricing or product removals.
- Cart expiry: 7 days (TTL set on Redis key) to remove stale carts.
- Uses RabbitMQ to publish checkout events; the `order` service consumes these to create orders.
- Error handling: uses service `errors` and `middleware/error-handler.js` for consistent responses.

Environment / Config

- `PRODUCT_SERVICE_URL` - base URL used when calling the Product service for stock/price
- `RABBITMQ_URL` - RabbitMQ connection string
- Redis client configured in `redisClient.js`

Examples

- Add item:
  POST /add
  Headers: `x-user-id: user-123`
  Body:
  {
  "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "quantity": 2
  }

- Checkout flow (client):
  POST /checkout
  Headers: `x-user-id: user-123`, `x-email: buyer@example.com`

Recommendations / Next steps

- Add authentication to replace reliance on `x-user-id` and `x-email` headers.
- Return detailed item objects (price, name) in `GET /view` to reduce extra client requests.
- Add rate limiting and request validation to prevent abuse.
