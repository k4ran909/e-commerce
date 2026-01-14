# Architecture Documentation

## System Overview

JewelCommerce is a full-stack e-commerce platform built with a monorepo structure. The application uses React for the frontend, Express for the backend, and supports both in-memory and PostgreSQL data persistence.

## Architecture Diagram

```mermaid
%%{ init: { 'flowchart': { 'curve': 'stepAfter' } } }%%
flowchart LR
    %% --- Styling ---
    classDef browser fill:#e1f5fe,stroke:#0277bd,stroke-width:2px;
    classDef server fill:#fff9c4,stroke:#fbc02d,stroke-width:2px;
    classDef db fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;

    %% --- Nodes ---
    A[Browser UI]:::browser
    
    subgraph Backend
        direction TB
        B[/Express Server/]:::server
        G[Receipt Gen]:::server
        H{{Payment Sim}}:::server
    end

    subgraph Data
        direction TB
        D[(Products DB)]:::db
        E[(Users DB)]:::db
        F[(Orders DB)]:::db
    end

    %% --- Connections ---
    A -->|HTTP GET| B
    B --> C[index.html]:::browser
    
    A -->|XHR: Products| D
    A -->|XHR: Auth| E
    A -->|XHR: Orders| F
    
    A -->|POST| G
    A -->|POST| H
```

## Data Model & ERD

### Entity Relationship Diagram

```mermaid
erDiagram
  USER ||--o{ ORDER : places
  USER ||--o{ CART_ITEM : has
  USER ||--o{ SESSION : has
  ORDER ||--o{ ORDER_ITEM : contains
  PRODUCT ||--o{ ORDER_ITEM : "ordered as"
  PRODUCT ||--o{ CART_ITEM : "in cart"

  USER {
    string id PK
    string name
    string email
    string passwordHash
    string role
    date createdAt
  }
  PRODUCT {
    string id PK
    string name
    string description
    int price_cents
    string category "idx"
    string material
    bool inStock "idx"
    int stockQuantity
  }
  ORDER {
    string id PK
    string userId FK "idx, cascade"
    string customerName
    string customerEmail
    string shippingAddress
    string shippingCity
    string shippingPostalCode
    string shippingCountry
    int totalAmount_cents
    string status "idx"
    string paymentStatus
    string idempotencyKey "unique"
    date createdAt "idx"
  }
  ORDER_ITEM {
    string id PK
    string orderId FK "idx, cascade"
    string productId FK "idx"
    string productName
    int productPrice_cents
    int quantity
    string size
  }
  CART_ITEM {
    string id PK
    string productId FK "idx, cascade"
    string userId FK "idx, cascade"
    int quantity
    string size
  }
  SESSION {
    string sid PK
    string userId FK "idx, cascade"
    date createdAt
  }
```

### Database Schema Details

#### Users Table
- **Primary Key**: `id` (UUID)
- **Unique Constraint**: `email` (prevents duplicate registrations)
- **Fields**: name, email, passwordHash, role (user|admin), createdAt
- **Indexes**: email (unique)

#### Products Table
- **Primary Key**: `id` (UUID)
- **Fields**: name, description, price (in cents), category, imageUrl, images[], material, isPreOrder, inStock, stockQuantity, sizes[]
- **Indexes**: category, inStock
- **Notes**: Price stored in IDR cents (1 IDR = 100 cents)

#### Orders Table
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: userId → users.id (cascade delete)
- **Unique Constraint**: `idempotencyKey` (prevents duplicate orders)
- **Fields**: Customer details, shipping info, totalAmount (cents), status, paymentStatus, createdAt
- **Indexes**: userId, createdAt, status
- **Status Flow**: pending → processing → completed | cancelled

#### OrderItems Table
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - orderId → orders.id (cascade delete)
  - productId → products.id
- **Fields**: productName, productPrice (cents), quantity, size
- **Indexes**: orderId, productId
- **Notes**: Product name and price are snapshotted at time of order

#### CartItems Table
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - productId → products.id (cascade delete)
  - userId → users.id (cascade delete)
- **Fields**: quantity, size
- **Indexes**: userId, productId

#### Sessions Table
- **Primary Key**: `sid` (session ID)
- **Foreign Keys**: userId → users.id (cascade delete)
- **Fields**: createdAt
- **Indexes**: userId
- **Notes**: Table exists for audit trail; JWT tokens used for authentication

## Data Flow Diagrams

### Context Diagram (Level 0)

```mermaid
flowchart LR
  extUser[Customer/User]
  extAdmin[Admin]
  subgraph System[JewelCommerce]
    procAPI[/REST API/]
    storeP[(Products)]
    storeO[(Orders)]
    storeU[(Users)]
    storeS[(Sessions)]
  end
  extUser -->|Browse/Search, Auth, Order| procAPI
  extAdmin -->|Auth, Admin Summary| procAPI
  procAPI --> storeP
  procAPI --> storeO
  procAPI --> storeU
  procAPI --> storeS
  procAPI -->|JSON responses| extUser
  procAPI -->|JSON responses| extAdmin
```

### Level 1 DFD (Process Decomposition)

```mermaid
flowchart TB
  U[User]
  A[Admin]
  P1["1. Browse Products"]
  P2["2. Search Products"]
  P3["3. Manage Cart"]
  P4["4. Authenticate"]
  P5["5. Create Order"]
  P6["6. Simulate Payment"]
  P7["7. View User Orders"]
  P8["8. Generate Receipt"]
  P9["9. Admin Summary"]
  P10["10. Admin Order Mgmt"]
  P11["11. Admin Sales Analytics"]
  P12["12. Delete Account"]

  D1[(Products)]
  D2[(Orders)]
  D3[(Users)]
  D4[(Sessions)]
  D5[(CartItems)]

  U --> P1 --> D1 --> P1 --> U
  U --> P2 --> D1 --> P2 --> U
  U --> P3 --> D5
  U --> P4 --> D3
  P4 --> D4
  U --> P5 --> D2 --> U
  P5 --> P6 --> U
  U --> P7 --> D2 --> U
  U --> P8 --> D2 --> U
  A --> P9 --> D1
  P9 --> D2
  A --> P10 --> D2
  A --> P11 --> D2
  U --> P12 --> D3
  P12 --> D4
```

### Process Descriptions

1. **Browse Products** - GET /api/products, /api/products/:id
2. **Search Products** - GET /api/search?q=...
3. **Manage Cart** - Client-side only (localStorage + database-backed)
4. **Authenticate User** - /api/auth/* endpoints
5. **Create Order** - POST /api/orders (requires auth)
6. **Simulate Payment** - POST /api/payment/simulate
7. **View User Orders** - GET /api/user/orders (requires auth)
8. **Generate Receipt** - POST /api/receipt/generate (requires auth)
9. **Admin Summary** - GET /api/admin/summary (admin only)
10. **Admin Order Management** - GET /api/orders, PATCH /api/orders/:id/status (admin only)
11. **Admin Sales Analytics** - GET /api/admin/sales (admin only)
12. **Delete Account** - POST /api/account/delete (requires auth)

## Application Flow

### User Journey Flow

```mermaid
flowchart TD
    Start([User Visits Site]) --> Browse[Browse Products]
    Browse --> Search{Search Products?}
    Search -->|Yes| SearchResults[View Search Results]
    Search -->|No| ViewProduct[View Product Details]
    SearchResults --> ViewProduct
    
    ViewProduct --> AddCart{Add to Cart?}
    AddCart -->|Yes| CheckAuth{Logged In?}
    CheckAuth -->|No| Login[Login/Register]
    CheckAuth -->|Yes| CartAdded[Product Added to Cart]
    Login --> CartAdded
    
    CartAdded --> Checkout{Proceed to Checkout?}
    Checkout -->|Yes| CheckoutForm[Fill Checkout Form]
    Checkout -->|No| Browse
    
    CheckoutForm --> Payment[Simulated Payment]
    Payment --> Success{Payment Success?}
    Success -->|Yes| OrderConfirm[Order Confirmation]
    Success -->|No| PaymentFail[Payment Failed]
    PaymentFail --> Checkout
    
    OrderConfirm --> ViewHistory[View Purchase History]
    ViewHistory --> Receipt[Download Receipt]
    Receipt --> End([End])
    
    AddCart -->|No| Browse
```

### Admin Flow

```mermaid
flowchart TD
    AdminStart([Admin Login]) --> Dashboard[Admin Dashboard]
    Dashboard --> Choice{Select Action}
    
    Choice -->|Products| ProductMgmt[Product Management]
    ProductMgmt --> ProdAction{Action?}
    ProdAction -->|Create| CreateProd[Create New Product]
    ProdAction -->|Edit| EditProd[Edit Product]
    ProdAction -->|Delete| DeleteProd[Delete Product]
    ProdAction -->|View| ViewProd[View Products]
    
    Choice -->|Orders| OrderMgmt[Order Management]
    OrderMgmt --> OrderAction{Action?}
    OrderAction -->|View All| ViewOrders[View All Orders]
    OrderAction -->|Update Status| UpdateStatus[Update Order Status]
    OrderAction -->|Filter| FilterOrders[Filter by Status]
    
    Choice -->|Analytics| Analytics[Sales Analytics]
    Analytics --> Period{Select Period}
    Period -->|Week| WeekChart[Weekly Chart]
    Period -->|Month| MonthChart[Monthly Chart]
    Period -->|Quarter| QuarterChart[Quarterly Chart]
    
    CreateProd --> Dashboard
    EditProd --> Dashboard
    DeleteProd --> Dashboard
    ViewProd --> Dashboard
    ViewOrders --> Dashboard
    UpdateStatus --> Dashboard
    FilterOrders --> Dashboard
    WeekChart --> Dashboard
    MonthChart --> Dashboard
    QuarterChart --> Dashboard
```

## Frontend Architecture

### Component Structure

```
client/src/
├── pages/                    # Route components
│   ├── home.tsx             # Landing page
│   ├── products.tsx         # Product listing
│   ├── product-detail.tsx   # Single product
│   ├── checkout.tsx         # Checkout flow
│   ├── order-success.tsx    # Order confirmation
│   ├── login.tsx            # Login page
│   ├── register.tsx         # Registration
│   ├── user-dashboard.tsx   # User account
│   ├── purchase-history.tsx # Order history
│   ├── admin-dashboard.tsx  # Admin overview
│   ├── admin-orders.tsx     # Order management
│   └── admin-product-form.tsx # Product CRUD
│
├── components/
│   ├── header.tsx           # Navigation
│   ├── cart-sheet.tsx       # Shopping cart
│   ├── product-card.tsx     # Product display
│   ├── theme-toggle.tsx     # Dark mode switch
│   ├── modals/              # Modal dialogs
│   └── ui/                  # Radix UI components
│
└── lib/
    ├── auth-context.tsx     # Auth state
    ├── cart-context.tsx     # Cart state
    ├── theme-context.tsx    # Theme state
    ├── queryClient.ts       # React Query config
    └── utils.ts             # Helper functions
```

### State Management

- **Authentication**: Context API with JWT tokens (HTTP-only cookies)
- **Cart**: Context API + localStorage + database persistence
- **Server State**: React Query for data fetching and caching
- **Theme**: Context API for dark/light mode
- **Forms**: Zod validation with React Hook Form

### Routing

Using Wouter for client-side routing:
- `/` - Home page
- `/products` - Product listing (supports ?category=...)
- `/product/:id` - Product detail
- `/checkout` - Checkout (auth required)
- `/order-success` - Order confirmation
- `/login`, `/register` - Authentication
- `/dashboard` - User dashboard (auth required)
- `/purchase-history` - Order history (auth required)
- `/admin` - Admin dashboard (admin only)
- `/admin/orders` - Order management (admin only)
- `/admin/products/new` - Create product (admin only)
- `/admin/products/:id/edit` - Edit product (admin only)

## Backend Architecture

### Server Structure

```
server/
├── index.ts          # Server bootstrap & middleware setup
├── routes.ts         # REST API endpoints
├── storage.ts        # Data layer abstraction
├── db.ts            # PostgreSQL connection & pool
├── jwt.ts           # JWT token utilities
├── middleware.ts    # Auth & rate limiting middleware
├── seed.ts          # Database seeding script
└── vite.ts          # Vite dev server integration
```

### Middleware Stack

1. **Request Logging** - Logs all incoming requests
2. **CORS** - Cross-origin resource sharing
3. **JSON Parser** - Parses JSON request bodies
4. **URL Encoded Parser** - Parses form data
5. **Cookie Parser** - Parses cookies from requests
6. **Rate Limiting** - IP-based rate limits
7. **Authentication** - JWT token verification
8. **Vite Dev Server** - Development mode only

### Data Layer

The storage layer provides a unified interface that automatically switches between in-memory and PostgreSQL storage based on the `DATABASE_URL` environment variable.

**Interface:**
```typescript
interface Storage {
  // Users
  getUser(id: string): Promise<User | null>
  getUserByEmail(email: string): Promise<User | null>
  createUser(data: InsertUser): Promise<User>
  deleteUser(id: string): Promise<void>
  
  // Products
  getProducts(): Promise<Product[]>
  getProduct(id: string): Promise<Product | null>
  createProduct(data: InsertProduct): Promise<Product>
  updateProduct(id: string, data: Partial<Product>): Promise<Product>
  deleteProduct(id: string): Promise<void>
  searchProducts(query: string): Promise<Product[]>
  
  // Orders
  getOrders(): Promise<Order[]>
  getOrder(id: string): Promise<Order | null>
  getUserOrders(userId: string): Promise<Order[]>
  createOrder(data: InsertOrder, items: InsertOrderItem[]): Promise<Order>
  updateOrderStatus(id: string, status: string): Promise<Order>
  
  // Cart
  getCartItems(userId: string): Promise<CartItem[]>
  addCartItem(data: InsertCartItem): Promise<CartItem>
  updateCartItem(id: string, quantity: number): Promise<CartItem>
  deleteCartItem(id: string): Promise<void>
  clearCart(userId: string): Promise<void>
}
```

### Authentication & Security

- **JWT Tokens**: Stored in HTTP-only cookies
- **Password Hashing**: bcrypt with salt rounds
- **Session Expiry**: Expires on browser close
- **Rate Limiting**: 
  - Registration: 5 attempts per 15 minutes per IP
  - Login: 10 attempts per 15 minutes per IP
  - Account deletion: 5 attempts per 15 minutes per IP

### Concurrency Handling

1. **Database Transactions**: All write operations use transactions
2. **Connection Pooling**: Max 20 concurrent connections
3. **Idempotency Keys**: Prevent duplicate orders
4. **Atomic Operations**: Inventory decrements use SQL transactions
5. **Unique Constraints**: Email uniqueness at database level

## Deployment Architecture

### Production Setup

```
[Load Balancer]
      |
      v
[Application Server(s)]
      |
      +-- [PostgreSQL Database]
      +-- [Redis Cache] (optional)
      +-- [Static Assets]
```

### Environment Variables

**Required:**
- `JWT_SECRET` - Secret for JWT token signing

**Optional:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PORT` - Server port (default: 5173)
- `NODE_ENV` - Environment (production|development)

### Performance Metrics

- **Capacity**: 500-1000 concurrent users
- **Throughput**: 100-200 requests/second
- **Response Time**: <100ms (average)
- **Database Pool**: 20 connections max
- **Rate Limits**: Varies by endpoint

## Monitoring & Observability

### Key Metrics to Monitor

1. **Application Metrics**
   - Request rate
   - Response time
   - Error rate
   - Active users

2. **Database Metrics**
   - Connection pool usage
   - Query performance
   - Transaction rate
   - Lock contention

3. **Business Metrics**
   - Orders per hour
   - Conversion rate
   - Cart abandonment
   - Revenue tracking

### Health Check Endpoint

Add to `server/routes.ts` for monitoring:

```typescript
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/api/health/db", async (req, res) => {
  const stats = await getPoolStats();
  res.json(stats);
});
```

## Security Considerations

### Best Practices Implemented

1. ✅ Password hashing with bcrypt
2. ✅ HTTP-only cookies for JWT tokens
3. ✅ Rate limiting on sensitive endpoints
4. ✅ SQL injection prevention (parameterized queries)
5. ✅ XSS prevention (React escaping)
6. ✅ CSRF protection (SameSite cookies)
7. ✅ Input validation with Zod
8. ✅ Unique constraints on critical fields
9. ✅ Transaction isolation for concurrent writes
10. ✅ Secure account deletion with confirmation

### Recommendations for Production

- Enable HTTPS/TLS
- Set secure `JWT_SECRET` (32+ random characters)
- Configure proper CORS origins
- Enable request logging
- Set up error tracking (e.g., Sentry)
- Regular security audits
- Database backups
- Implement request signing for sensitive operations

## Technology Stack Details

### Frontend Dependencies

- **react** (18.x) - UI library
- **wouter** (3.x) - Lightweight router
- **@tanstack/react-query** (5.x) - Server state management
- **tailwindcss** (3.x) - Utility-first CSS
- **@radix-ui/react-\*** - Accessible component primitives
- **zod** (3.x) - Schema validation
- **recharts** (2.x) - Charts for analytics

### Backend Dependencies

- **express** (4.x) - Web framework
- **drizzle-orm** (0.x) - TypeScript ORM
- **pg** (8.x) - PostgreSQL client
- **bcryptjs** (2.x) - Password hashing
- **jsonwebtoken** (9.x) - JWT tokens
- **zod** (3.x) - Schema validation

### Development Tools

- **vite** (5.x) - Build tool
- **typescript** (5.x) - Type safety
- **tsx** (4.x) - TypeScript execution
- **drizzle-kit** (0.x) - Database migrations
- **esbuild** (0.x) - Fast bundler
