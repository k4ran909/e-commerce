# API Reference

Complete REST API documentation for JewelCommerce.

**Base URL (Development):** `http://localhost:5173`

## Table of Contents

- [Authentication](#authentication)
- [Products](#products)
- [Orders](#orders)
- [Cart](#cart)
- [Receipts](#receipts)
- [Admin](#admin)
- [Payment](#payment)
- [Account Management](#account-management)
- [Error Responses](#error-responses)

---

## Authentication

All authentication endpoints use HTTP-only cookies for session management with JWT tokens.

### Register User

**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-here",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "user",
  "createdAt": "2026-01-09T12:00:00.000Z"
}
```

**Errors:**
- `400` - Invalid input (name/email/password validation failed)
- `409` - Email already registered
- `429` - Too many registration attempts (rate limit: 5 per 15 min)

**Example:**
```bash
curl -X POST http://localhost:5173/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Jane","email":"jane@test.com","password":"secret123"}'
```

---

### Login

**POST** `/api/auth/login`

Authenticate a user and receive a session cookie.

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-here",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "user",
  "createdAt": "2026-01-09T12:00:00.000Z"
}
```

**Errors:**
- `400` - Invalid input
- `401` - Invalid credentials
- `429` - Too many login attempts (rate limit: 10 per 15 min)

**Example:**
```bash
curl -X POST http://localhost:5173/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@lumiere.test","password":"admin123"}' \
  -c cookies.txt
```

---

### Get Current User

**GET** `/api/auth/me`

Get the currently authenticated user.

**Response (200 OK):**
```json
{
  "id": "uuid-here",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "user",
  "createdAt": "2026-01-09T12:00:00.000Z"
}
```

**Errors:**
- `401` - Not authenticated

**Example:**
```bash
curl http://localhost:5173/api/auth/me \
  -b cookies.txt
```

---

### Logout

**POST** `/api/auth/logout`

End the current session.

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:5173/api/auth/logout \
  -b cookies.txt
```

---

## Products

### List Products

**GET** `/api/products`

Get all products.

**Query Parameters:**
- `category` (optional) - Filter by category (rings, necklaces, bracelets, earrings)

**Response (200 OK):**
```json
[
  {
    "id": "uuid-here",
    "name": "Diamond Ring",
    "description": "18K gold diamond ring",
    "price": 500000000,
    "category": "rings",
    "imageUrl": "/diamond_ring.png",
    "images": ["/diamond_ring.png", "/diamond_ring_2.png"],
    "material": "18K Gold",
    "isPreOrder": false,
    "inStock": true,
    "stockQuantity": 100,
    "sizes": ["6", "7", "8", "9"]
  }
]
```

**Example:**
```bash
# All products
curl http://localhost:5173/api/products

# Filter by category
curl http://localhost:5173/api/products?category=rings
```

---

### Get Single Product

**GET** `/api/products/:id`

Get a specific product by ID.

**Response (200 OK):**
```json
{
  "id": "uuid-here",
  "name": "Diamond Ring",
  "description": "18K gold diamond ring",
  "price": 500000000,
  "category": "rings",
  "imageUrl": "/diamond_ring.png",
  "images": ["/diamond_ring.png"],
  "material": "18K Gold",
  "isPreOrder": false,
  "inStock": true,
  "stockQuantity": 100,
  "sizes": ["6", "7", "8", "9"]
}
```

**Errors:**
- `404` - Product not found

**Example:**
```bash
curl http://localhost:5173/api/products/abc-123
```

---

### Search Products

**GET** `/api/search`

Search products by name, description, material, or category.

**Query Parameters:**
- `q` (required) - Search query

**Response (200 OK):**
```json
[
  {
    "id": "uuid-here",
    "name": "Diamond Ring",
    "description": "18K gold diamond ring",
    "price": 500000000,
    "category": "rings",
    "imageUrl": "/diamond_ring.png",
    "images": ["/diamond_ring.png"],
    "material": "18K Gold",
    "isPreOrder": false,
    "inStock": true,
    "stockQuantity": 100,
    "sizes": ["6", "7", "8", "9"]
  }
]
```

**Example:**
```bash
curl "http://localhost:5173/api/search?q=diamond"
```

---

### Create Product

**POST** `/api/products`

Create a new product. **Requires admin role.**

**Request Body:**
```json
{
  "name": "Ruby Necklace",
  "description": "24K gold ruby necklace",
  "price": 800000000,
  "category": "necklaces",
  "imageUrl": "/ruby_necklace.png",
  "images": ["/ruby_necklace.png"],
  "material": "24K Gold",
  "isPreOrder": false,
  "inStock": true,
  "stockQuantity": 50,
  "sizes": []
}
```

**Response (201 Created):**
```json
{
  "id": "new-uuid",
  "name": "Ruby Necklace",
  ...
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized (not admin)
- `400` - Invalid input

---

### Update Product

**PATCH** `/api/products/:id`

Update an existing product. **Requires admin role.**

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "price": 900000000,
  "inStock": false
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-here",
  "name": "Updated Name",
  ...
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized
- `404` - Product not found

---

### Delete Product

**DELETE** `/api/products/:id`

Delete a product. **Requires admin role.**

**Response (204 No Content)**

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized
- `404` - Product not found

---

## Orders

### List All Orders

**GET** `/api/orders`

Get all orders. **Requires admin role.**

**Query Parameters:**
- `status` (optional) - Filter by status (pending, processing, completed, cancelled)

**Response (200 OK):**
```json
[
  {
    "id": "uuid-here",
    "userId": "user-uuid",
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "customerPhone": "+62123456789",
    "shippingAddress": "123 Main St",
    "shippingCity": "Jakarta",
    "shippingPostalCode": "12345",
    "shippingCountry": "Indonesia",
    "totalAmount": 500000000,
    "status": "pending",
    "isPreOrder": false,
    "paymentStatus": "pending",
    "idempotencyKey": "unique-key",
    "createdAt": "2026-01-09T12:00:00.000Z",
    "items": [
      {
        "id": "item-uuid",
        "orderId": "order-uuid",
        "productId": "product-uuid",
        "productName": "Diamond Ring",
        "productPrice": 500000000,
        "quantity": 1,
        "size": "7"
      }
    ]
  }
]
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized (not admin)

---

### Get Single Order

**GET** `/api/orders/:id`

Get a specific order. Users can only view their own orders; admins can view all.

**Response (200 OK):**
```json
{
  "id": "uuid-here",
  "userId": "user-uuid",
  "customerName": "Jane Doe",
  ...
  "items": [...]
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized
- `404` - Order not found

---

### Get User Orders

**GET** `/api/user/orders`

Get all orders for the authenticated user.

**Response (200 OK):**
```json
[
  {
    "id": "uuid-here",
    "userId": "user-uuid",
    ...
    "items": [...]
  }
]
```

**Errors:**
- `401` - Not authenticated

**Example:**
```bash
curl http://localhost:5173/api/user/orders \
  -b cookies.txt
```

---

### Create Order

**POST** `/api/orders`

Create a new order. **Requires authentication.**

**Request Body:**
```json
{
  "idempotencyKey": "unique-uuid-v4",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 1,
      "size": "7"
    }
  ],
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "+62123456789",
  "shippingAddress": "123 Main St",
  "shippingCity": "Jakarta",
  "shippingPostalCode": "12345",
  "shippingCountry": "Indonesia"
}
```

**Response (201 Created):**
```json
{
  "id": "new-order-uuid",
  "userId": "user-uuid",
  ...
  "items": [...]
}
```

**Errors:**
- `401` - Not authenticated
- `400` - Invalid input or empty cart
- `409` - Insufficient stock or duplicate order (idempotency key exists)
- `503` - Database connection pool exhausted

**Example:**
```bash
curl -X POST http://localhost:5173/api/orders \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{
    "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
    "items": [{"productId": "abc", "quantity": 1, "size": "7"}],
    "customerName": "Jane Doe",
    "customerEmail": "jane@test.com",
    "customerPhone": "+62123456789",
    "shippingAddress": "123 Main St",
    "shippingCity": "Jakarta",
    "shippingPostalCode": "12345",
    "shippingCountry": "Indonesia"
  }'
```

---

### Update Order Status

**PATCH** `/api/orders/:id/status`

Update order status. **Requires admin role.**

**Request Body:**
```json
{
  "status": "processing"
}
```

**Valid Status Transitions:**
- pending → processing
- processing → completed
- pending/processing → cancelled

**Response (200 OK):**
```json
{
  "id": "order-uuid",
  "status": "processing",
  ...
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized
- `404` - Order not found
- `400` - Invalid status transition

---

## Cart

Cart operations are currently client-side with localStorage, but the API supports database-backed carts for authenticated users.

### Get Cart Items

**GET** `/api/cart`

Get cart items for authenticated user.

**Response (200 OK):**
```json
[
  {
    "id": "cart-item-uuid",
    "productId": "product-uuid",
    "userId": "user-uuid",
    "quantity": 2,
    "size": "7"
  }
]
```

**Errors:**
- `401` - Not authenticated

---

### Add to Cart

**POST** `/api/cart`

Add item to cart. **Requires authentication.**

**Request Body:**
```json
{
  "productId": "product-uuid",
  "quantity": 1,
  "size": "7"
}
```

**Response (201 Created):**
```json
{
  "id": "cart-item-uuid",
  "productId": "product-uuid",
  "userId": "user-uuid",
  "quantity": 1,
  "size": "7"
}
```

**Errors:**
- `401` - Not authenticated
- `400` - Invalid input

---

### Update Cart Item

**PATCH** `/api/cart/:id`

Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "id": "cart-item-uuid",
  "quantity": 3,
  ...
}
```

---

### Delete Cart Item

**DELETE** `/api/cart/:id`

Remove item from cart.

**Response (204 No Content)**

---

### Clear Cart

**DELETE** `/api/cart`

Remove all items from cart.

**Response (204 No Content)**

---

## Receipts

### Generate Receipt

**POST** `/api/receipt/generate`

Generate HTML receipt for an order. Users can only generate receipts for their own orders; admins can generate for any order.

**Request Body:**
```json
{
  "orderId": "order-uuid"
}
```

**Response (200 OK):**
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Receipt - Order #123</title>
    ...
  </head>
  <body>
    <!-- Receipt HTML with print-ready styling -->
  </body>
</html>
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized (not your order)
- `404` - Order not found

**Example:**
```bash
curl -X POST http://localhost:5173/api/receipt/generate \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{"orderId": "order-uuid"}' \
  > receipt.html
```

---

## Admin

### Get Admin Summary

**GET** `/api/admin/summary`

Get overview statistics. **Requires admin role.**

**Response (200 OK):**
```json
{
  "products": 25,
  "orders": 150,
  "revenue": 75000000000
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized (not admin)

**Example:**
```bash
curl http://localhost:5173/api/admin/summary \
  -b cookies.txt
```

---

### Get Sales Analytics

**GET** `/api/admin/sales`

Get sales data for charts. **Requires admin role.**

**Query Parameters:**
- `period` - week | month | quarter (default: week)

**Response (200 OK):**
```json
{
  "period": "week",
  "data": [
    {
      "date": "2026-01-03",
      "orders": 5,
      "revenue": 2500000000
    },
    {
      "date": "2026-01-04",
      "orders": 8,
      "revenue": 4000000000
    }
  ]
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized
- `400` - Invalid period

**Example:**
```bash
curl "http://localhost:5173/api/admin/sales?period=month" \
  -b cookies.txt
```

---

## Payment

### Simulate Payment

**POST** `/api/payment/simulate`

Simulate payment processing (95% success rate, ~1.5s latency).

**Request Body:**
```json
{
  "amount": 500000000,
  "orderId": "order-uuid"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "transactionId": "txn-uuid",
  "message": "Payment successful"
}
```

**Response (400 Bad Request):** (5% of the time)
```json
{
  "success": false,
  "message": "Payment failed - insufficient funds"
}
```

**Example:**
```bash
curl -X POST http://localhost:5173/api/payment/simulate \
  -H 'Content-Type: application/json' \
  -d '{"amount": 500000000, "orderId": "order-123"}'
```

---

## Account Management

### Delete Account

**POST** `/api/account/delete`

Delete user account. **Requires authentication. Admin accounts cannot be deleted.**

**Request Body:**
```json
{
  "password": "user-password",
  "confirm": "DELETE"
}
```

**Response (200 OK):**
```json
{
  "message": "Account deleted successfully"
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Admin accounts cannot be deleted
- `400` - Invalid password or confirmation
- `429` - Too many attempts (rate limit: 5 per 15 min, 15-min lockout)

**Example:**
```bash
curl -X POST http://localhost:5173/api/account/delete \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{"password": "mypassword", "confirm": "DELETE"}'
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "message": "Error description",
  "error": "Optional error details"
}
```

### Common HTTP Status Codes

- **200 OK** - Request succeeded
- **201 Created** - Resource created successfully
- **204 No Content** - Request succeeded, no content to return
- **400 Bad Request** - Invalid input or validation error
- **401 Unauthorized** - Authentication required or invalid
- **403 Forbidden** - Authenticated but not authorized
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Resource conflict (duplicate, insufficient stock)
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error
- **503 Service Unavailable** - Service temporarily unavailable (e.g., DB pool exhausted)

### Rate Limit Headers

Rate-limited endpoints include headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1704816000
```

---

## Authentication Flow

1. **Register/Login** - Receive JWT token in HTTP-only cookie
2. **Make Authenticated Requests** - Cookie automatically sent with requests
3. **Token Validation** - Server validates token on protected routes
4. **Logout** - Cookie cleared, session ended

**Cookie Details:**
- Name: `token`
- HttpOnly: `true`
- SameSite: `Lax`
- Path: `/`
- Expires: Session (browser close)

---

## Data Formats

### Currency

All monetary values are in **IDR cents** (Indonesian Rupiah cents).

**Example:**
- API: `500000000` cents
- Display: Rp 5,000,000.00

**Client-side formatting:**
```javascript
new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR"
}).format(cents / 100);
```

### Dates

All dates are in **ISO 8601** format:
- `2026-01-09T12:00:00.000Z`

---

## Pagination

Currently, no endpoints implement pagination. All list endpoints return complete results. For future scalability, consider implementing:

```
GET /api/products?page=1&limit=20
```

---

## API Testing

### Using cURL

Save cookies for session persistence:
```bash
# Login and save cookies
curl -X POST http://localhost:5173/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@lumiere.test","password":"admin123"}' \
  -c cookies.txt

# Use cookies in subsequent requests
curl http://localhost:5173/api/auth/me \
  -b cookies.txt
```

### Using Postman/Insomnia

1. Send login request to `/api/auth/login`
2. Cookie automatically saved
3. Subsequent requests include cookie automatically

### Using JavaScript/Fetch

```javascript
// Login
const response = await fetch('http://localhost:5173/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'admin@lumiere.test',
    password: 'admin123'
  })
});

// Authenticated request
const user = await fetch('http://localhost:5173/api/auth/me', {
  credentials: 'include' // Include cookies
});
```

---

## Webhook Events (Future)

Currently not implemented, but planned webhook events:

- `order.created` - New order placed
- `order.status_changed` - Order status updated
- `payment.succeeded` - Payment successful
- `payment.failed` - Payment failed
- `user.registered` - New user account created

---

## API Versioning

Current version: **v1** (implicit, no version prefix in URLs)

Future versions will use URL prefixing:
- v1: `/api/...` (current)
- v2: `/api/v2/...` (future)
