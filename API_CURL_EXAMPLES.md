# API curl examples (core endpoints)

User service

- Register

```
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Alice","lastname":"Smith","email":"alice@example.com","password":"P@ssw0rd"}'
```

- Verify

```
curl -X POST http://localhost:8001/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","code":"123456"}'
```

- Get OTP

```
curl -X POST http://localhost:8001/get-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com"}'
```

- Login

```
curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"P@ssw0rd"}'
```

Product service

- List products

```
curl http://localhost:8003/
```

- Add product

```
curl -X POST http://localhost:8003/ \
  -H "Content-Type: application/json" \
  -d '{"name":"T-shirt","price":19.99,"stock":50,"description":"Cotton","categoryId":3}'
```

- Get product

```
curl http://localhost:8003/<productId>
```

- Check stock

```
curl http://localhost:8003/<productId>/stock
```

Cart service

- Add item

```
curl -X POST http://localhost:8002/add \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{"productId":"<productId>","quantity":2}'
```

- View cart

```
curl -H "x-user-id: user-123" http://localhost:8002/view
```

- Remove item

```
curl -X DELETE http://localhost:8002/remove \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{"productId":"<productId>"}'
```

- Checkout

```
curl -X POST http://localhost:8002/checkout \
  -H "x-user-id: user-123" \
  -H "x-email: buyer@example.com"
```

Order service

- Admin update status

```
curl -X POST http://localhost:8005/update-status \
  -H "Content-Type: application/json" \
  -H "x-user-role: admin" \
  -d '{"orderId":"<orderId>","status":"shipped"}'
```

Payment service

- Initialize payment

```
curl -X POST http://localhost:8006/make-payment/<paymentId> \
  -H "x-user-id: user-123"
```

- Webhook (example)

```
curl -X POST http://localhost:8006/webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: <signature>" \
  -d '<paystack-webhook-json>'
```

Auth service

- Validate token

```
curl -X POST http://localhost:8008/validate \
  -H "Authorization: Bearer <accessToken>"
```
