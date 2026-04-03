# Product Service

Overview

- Purpose: Manages product and category data (create, read, update, delete-lite) for the distributed commerce system.
- Role in system: Provides product catalog data and stock information consumed by cart, order and payment services. Uses Sequelize for persistence and exposes simple HTTP JSON APIs.

Routes

- GET / (list products)
  - Query params: none
  - Success response (200):
    {
    "count": number,
    "products": [ { product }, ... ]
    }
  - Notes: Returns all products.

- POST / (add product)
  - Request body (JSON):
    {
    "name": "string",
    "price": number (decimal),
    "stock": integer,
    "description": "string",
    "categoryId": integer
    }
  - Success response (201):
    {
    "message": "Product added",
    "product": { product }
    }
  - Notes: Validates `categoryId` exists and uses `findOrCreate` so duplicate (name + category) is rejected (400).

- GET /:productId (get single product)
  - Path param: `productId` (UUID)
  - Success response (200):
    {
    "product": { product }
    }
  - Notes: Returns 404 if product not found.

- PATCH /:productId (edit product)
  - Path param: `productId` (UUID)
  - Request body (JSON):
    {
    "name"?: "string",
    "price"?: number,
    "stock"?: integer,
    "description"?: "string",
    "newCategoryId"?: integer
    }
  - Success response (200):
    {
    "message": "Product updated",
    "categoryChange": "string",
    "product": {
    "productId": "...",
    "name": "...",
    "price": ...,
    "stock": ...,
    "description": "...",
    "categoryId": integer
    }
    }
  - Notes: If `newCategoryId` is provided and exists, product's category is updated; if not, category remains unchanged.

- GET /:productId/stock (check stock)
  - Path param: `productId` (UUID)
  - Success response (200):
    {
    "id": "...",
    "stock": integer,
    "price": number
    }
  - Notes: Intended as a lightweight stock/price check for other services (e.g., cart/order validation).

Category Routes

- POST /categories
  - Request body (JSON):
    { "categoryName": "string" }
  - Success response (200):
    {
    "message": "Category added|Category already exists",
    "category": { category }
    }

- GET /categories
  - Success response (200):
    {
    "count": number,
    "categories": [ { category }, ... ]
    }

- DELETE /categories
  - Request body (JSON):
    { "categoryId": integer }
  - Success response (200):
    {
    "message": "Category deleted. Products moved to \"Uncategorized\"."
    }
  - Notes: On delete, products referencing the deleted category are reassigned to or create an "Uncategorized" category.

Models (key fields)

- Product
  - `id` (UUID), `name` (string), `price` (decimal), `stock` (int), `description` (text), `categoryId` (int), `productPicture` (string)

- Category
  - `id` (int), `name` (string, unique)

Environment / Config

- DB connection configured in `db/connectDB.js` (Sequelize). Service depends on DB migration/state for category/product tables.

Behavior & Notes

- Product creation uses `findOrCreate` by `name` + `categoryId` to avoid duplicates.
- Product edits return a `categoryChange` flag and the new product representation; ensure callers handle the message strings.
- `checkStock` returns minimal info (id, stock, price) for fast validation by cart/order services.
- Deleting categories moves affected products to an `Uncategorized` category (created if missing).
- Errors: Uses custom error classes (`BadRequestError`, `NotFoundError`) and `middleware/error-handler.js` for responses.

Integration

- Called by: frontend, API gateway, cart, order and payment services to read product data and check availability/pricing.
- Consumed by: `cart` and `order` services should call `/:productId/stock` or `/:productId` to validate items before checkout.

Examples

- Add product example:
  POST / (body)
  {
  "name": "T-shirt",
  "price": 19.99,
  "stock": 50,
  "description": "100% cotton",
  "categoryId": 3
  }

- Check stock example:
  GET /<productId>/stock

Notes / Next steps

- Consider adding pagination and filtering to `GET /` for large catalogs.
- Standardize numeric types in API docs (price formatting) and ensure consistent status codes (201 for creation).
