# Payment Service

Overview

- Purpose: Handles payment initialization and webhook processing (Paystack) for the distributed commerce system.
- Role in system: Receives `order.created` events to create pending payment records, initializes payment transactions with Paystack, and processes Paystack webhooks to update payment status and emit events for downstream services (e.g., order fulfillment).

Routes

- POST /make-payment/:paymentId
  - Path param: `paymentId` (UUID)
  - Headers:
    - `x-user-id`: string (required)
  - Request body: none (payment record retrieved from DB)
  - Success response (200):
    {
    "Authorization_url": "https://paystack..." // redirect/authorization URL for the payment
    }
  - Notes: Validates that the `paymentId` exists and belongs to the `userId` header, ensures payment is not already `paid`, initializes a Paystack transaction via API (amount in kobo), and returns the Paystack authorization URL.

- POST /webhook
  - Request body: Paystack webhook JSON (raw body required)
  - Headers:
    - `x-paystack-signature`: HMAC-SHA512 signature (required)
  - Success responses:
    - 200 OK when processed (for both success and failure events)
    - 400 Bad Request if signature validation fails
  - Notes: Validates webhook signature using `PAYSTACK_SECRET_KEY` and `req.rawBody`. On `charge.success` sets payment `status = "paid"` and publishes a `payment.success` message to RabbitMQ. For other events sets `status = "failed"` and publishes `payment.failure`.

Message Handling

- Consumes: `order.created` events from `order_exchange` with routing key `order.created`.
  - Handler: `handlers/initializePayment.js` creates a `Payment` record with fields: `amount`, `orderId`, `userId`, `email`, status defaults to `pending`.
- Publishes: on webhook processing publishes to `payment_exchange` with routing keys `payment.success` or `payment.failure`. Message shape:
  {
  "orderId": "uuid",
  "userId": "string",
  "email": "string",
  "totalAmount": number,
  "status": "paid" | "failed"
  }

Models (key fields)

- Payment
  - `id` (UUID), `amount` (float), `status` ("pending" | "paid" | "failed"), `orderId` (UUID, unique), `email` (string), `userId` (string)

Environment / Config

- `PAYSTACK_SECRET_KEY` - Paystack secret for API calls and webhook signature verification
- `PAYMENT_CALLBACK_URL` - callback URL passed to Paystack initialize API
- `RABBITMQ_URL` - RabbitMQ connection string
- DB connection configured in `db/connectdb.js`

Behavior & Notes

- Webhook security: Uses HMAC-SHA512 of raw request body with `PAYSTACK_SECRET_KEY` to validate `x-paystack-signature` header.
- Payment initialization: Amount is sent to Paystack in the smallest currency unit (kobo); code rounds `amount * 100`.
- Concurrency: When a paystack webhook marks a payment `paid`, the service publishes an event so other services (orders, fulfillment) can proceed.
- Error handling: Routes return structured errors and rely on `middleware/error-handler.js` for consistent responses.

Integration

- Called by: API gateway or frontend to initiate checkout flow by requesting `POST /make-payment/:paymentId` and redirecting client to the returned `Authorization_url`.
- Consumed by: `order` service emits `order.created` to initialize payment. `payment` emits `payment.success`/`payment.failure` for downstream processing.

Examples

- Initialize payment (client example):
  POST /make-payment/3fa85f64-5717-4562-b3fc-2c963f66afa6
  Headers:
  x-user-id: user-123

- Webhook: Paystack will POST webhook JSON to `/webhook` with signature header `x-paystack-signature`.

Recommendations / Next steps

- Confirm `PAYMENT_CALLBACK_URL` value and ensure gateway/frontend handles Paystack redirects and finalization.
- Add idempotency checks on payment initialization to avoid duplicate Paystack transactions.
- Consider storing Paystack `reference` in the `Payment` record for traceability.
