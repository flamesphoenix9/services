# User Service

Overview
- Purpose: Handles user registration, OTP generation/verification, and authentication (login) within the distributed commerce system.
- Role in system: Responsible for managing user identities and issuing JWT access/refresh tokens consumed by other services (orders, payments, cart). Stores users, OTPs and refresh tokens in the service database.

Routes
- POST /register
  - Request body (JSON):
    {
      "firstname": "string",
      "lastname": "string",
      "email": "string",
      "password": "string"
    }
  - Success response (200):
    {
      "message": "User created",
      "code": "123456"    
    }
  - Notes: Creates a user (hashed password) and generates an OTP. If the email already exists returns 400.

- POST /verify
  - Request body (JSON):
    {
      "email": "string",
      "code": "string"  // 6-digit OTP
    }
  - Success response (200):
    {
      "message": "account verified"
    }
  - Notes: Verifies OTP exists and is not expired (10 minutes). Marks user `verified = true` and deletes the OTP. Returns 400 for invalid/expired OTP and 404 if user already verified.

- POST /get-otp
  - Request body (JSON):
    {
      "email": "string"
    }
  - Success response (200):
    {
      "message": "OTP sent to mail"
    }
  - Notes: Re-generates an OTP for unverified users. Implementation currently returns key `meaaage` in code (typo); intended key is `message`.

- POST /login
  - Request body (JSON):
    {
      "email": "string",
      "password": "string"
    }
  - Success response (200):
    {
      "message": "Login successful",
      "refreshToken": "<jwt-refresh-token>",
      "accessToken": "<jwt-access-token>"
    }
  - Notes: Validates password and verified status. Creates a refresh token entry and issues an access token JWT. Access token payload includes `userId`, `role`, `email`, `firstname`, `lastname`, `picture`, `verified`.

Models (key fields)
- User
  - `id` (int), `firstname` (string), `lastname` (string), `email` (string, unique), `password` (hashed string), `picture` (string, optional), `verified` (boolean, default false), `role` ("user"|"admin"|"moderator").

- Otp
  - `id`, `code` (6-digit string), `email` (string, unique), `expiresAt` (Date). OTP expiry default = 10 minutes.

- RefreshToken
  - `id`, `email` (string, unique), `token` (JWT string). Refresh tokens generated with `REFRESH_SECRET` and default 7d expiry.

Environment / Config
- `ACCESS_SECRET` - secret used to sign access tokens
- `ACCESS_EXPIRY` - access token expiry (e.g. `15m`)
- `REFRESH_SECRET` - secret for refresh tokens
- DB connection configured in `db/connectDB.js` (service uses Sequelize)

Behavior & Notes
- OTP generation: `utils/gentoken.js` creates a 6-digit OTP, saves it in `otps` table and sets expiry to 10 minutes.
- Tokens: Access JWT contains user claims used by downstream services for authorization; refresh tokens are stored in DB and signed with `REFRESH_SECRET`.
- Errors: The service throws structured errors (BadRequest, NotFound) and relies on middleware `middleware/error-handler.js` for formatted responses.
- Security: Passwords are hashed with `bcrypt` before storing. OTP and token expiry values are implemented in models and utils.

Integration
- Called by: any client or gateway service that needs user sign-up, verification or authentication (e.g., frontend, API gateway, or other internal services).
- Consumed by: other microservices validate access JWTs for authorization and may call user service indirectly via tokens.

Examples
- Register example request:
  POST /register
  {
    "firstname": "Alice",
    "lastname": "Smith",
    "email": "alice@example.com",
    "password": "P@ssw0rd"
  }

- Login example request:
  POST /login
  {
    "email": "alice@example.com",
    "password": "P@ssw0rd"
  }

Contact / Next steps
- To improve: ensure `get-otp` response key typo fixed (`meaaage` → `message`) and confirm `login` returns newly-created refresh token value.
