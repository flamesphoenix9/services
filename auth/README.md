# Auth Service

Overview

- Purpose: Validates JWT access tokens and exposes a lightweight token-validation endpoint for other services (gateway, microservices) in the distributed system.
- Role in system: Central token validation service — other services call it to verify a bearer token and receive user identity claims in response headers.

Routes

- POST /validate
  - Headers:
    - `Authorization`: `Bearer <accessToken>` (required)
  - Request body: none
  - Success response (200):
    - Empty body; identity claims are returned in response headers:
      - `x-user-id`: string
      - `x-user-role`: string (e.g., `user`, `admin`, `moderator`)
      - `x-verified`: boolean
      - `x-email`: string
  - Failure responses:
    - 401 Unauthorized if `Authorization` header is missing or token verification fails
  - Notes: Implementation verifies tokens using `process.env.JWT_SECRET` and `jsonwebtoken`.

Behavior & Notes

- The endpoint extracts the bearer token from the `Authorization` header, verifies it with `jwt.verify(token, JWT_SECRET)`, and maps token payload fields to response headers for callers to consume.
- This service returns only headers (no JSON payload) on success and returns `401` for missing/invalid tokens.
- Keep `JWT_SECRET` secure and consistent across services that issue or validate tokens.

Integration

- Called by: API gateway, frontend (rarely), or internal services that need to validate tokens before performing protected actions. Typical usage pattern:
  - Service receives client request with `Authorization: Bearer <token>`
  - Service forwards or proxies validation request to `POST /validate` or uses shared JWT secret to validate locally
  - On 200, service reads `x-user-id`, `x-user-role`, `x-verified`, `x-email` headers to authorize the request

Environment / Config

- `JWT_SECRET` (or `process.env.JWT_SECRET`) — secret used to verify JWTs
- `PORT` — service listens on `process.env.PORT` or defaults to `8008`

Recommendations

- Consider returning JSON with claims in addition to headers for easier client debugging.
- Add rate-limiting and authentication between internal services to avoid abuse.
- If performance is important, prefer local JWT verification (shared secret/public key) over an HTTP roundtrip to this service.
