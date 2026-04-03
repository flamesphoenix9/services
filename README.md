# Commerce Microservices — Overview

Lightweight documentation index for the local microservices in this workspace. Click a service below to open its service README.

Services: [Auth Service](auth/README.md) | [User Service](user/README.md) | [Product Service](product/README.md) | [Cart Service](cart/README.md) | [Order Service](order/README.md) | [Payment Service](payment/README.md) | [API curl examples](API_CURL_EXAMPLES.md)

What this repo contains

- Independent services for a small e-commerce platform (JWT auth, products, cart, orders, payments).
- Synchronous HTTP APIs for CRUD and verification logic, plus asynchronous flows via RabbitMQ for order/payment orchestration.

Quick start

- Ensure environment variables are set (DB, Redis, RabbitMQ, Paystack keys) in each service `.env`.
- From the workspace root run:

```bash
docker compose up -d --build
```

How to use

- Open any service README from the links above for service-specific endpoints, request/response examples, and environment variables.
- Use `services/API_CURL_EXAMPLES.md` for runnable curl commands and `openapi.yaml` for the combined API spec.

Notes & recommendations

- Webhook security: payment webhooks validate HMAC signatures — keep `PAYSTACK_SECRET_KEY` secret.
- Reduce trust on headers: services currently use headers like `x-user-id` and `x-user-role`; replace with authenticated middleware for production.
- Next improvements: add OpenAPI per-service, pagination on product listing, and authentication middleware.

Contact

- For changes or questions, update the service README you edited and open a PR with your changes.
