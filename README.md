# JewelCommerce (Lumière Jewelry)

Elegant full-stack jewelry e-commerce platform with React, Express, and PostgreSQL.

## ✨ Features

- 🛍️ **Product Catalog** - Browse jewelry by category with search
- 🛒 **Shopping Cart** - Persistent cart with size variants (login required)
- 💳 **Secure Checkout** - Complete order flow with simulated payments
- 👤 **User Dashboard** - Order history with downloadable receipts
- 🔐 **Authentication** - Secure JWT-based auth with session management
- 📊 **Admin Panel** - Product & order management, sales analytics
- 🌍 **Multi-Language Support** - Full i18n with 4 languages (EN, ES, FR, ID)
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Production Ready** - Concurrency handling, rate limiting, transaction safety

## 🚀 Quick Start

**Prerequisites:** Node.js 18+, npm 10+

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build
npm start
```

**Test Account:**
- Email: `admin@lumiere.test`
- Password: `admin123`

## 🗄️ Database Setup (Optional)

By default, uses in-memory storage. For persistence with PostgreSQL:

```bash
# Set database URL
export DATABASE_URL="postgres://user:pass@host:5432/dbname"

# Apply schema
npm run db:push

# Seed sample data
npm run db:seed
```

## 🔒 Production Configuration

```bash
# Required: Set secret for JWT tokens
export JWT_SECRET="your-secure-random-secret-key"

# Optional: PostgreSQL for persistence
export DATABASE_URL="postgres://..."

# Optional: Redis for distributed rate limiting
export REDIS_URL="redis://localhost:6379"
```

## 📁 Project Structure

```
client/         # React frontend (Vite + Tailwind)
  src/
    pages/      # Route components
    components/ # UI components (Radix UI)
    lib/        # Contexts, utilities
server/         # Express backend
  routes.ts     # API endpoints
  storage.ts    # Data layer (memory/Postgres)
  db.ts         # Database configuration
shared/
  schema.ts     # Shared types & validation
```

## 📚 Documentation

- **[API Reference](docs/API.md)** - Complete REST API documentation
- **[Architecture](docs/ARCHITECTURE.md)** - System design, ERD, data flows
- **[Development Guide](docs/DEVELOPMENT.md)** - Setup, conventions, troubleshooting
- **[Internationalization (i18n)](docs/I18N.md)** - Multi-language support guide
- **[Deployment](docs/DEPLOY_KOYEB.md)** - Production deployment guide

## 🛠️ Tech Stack

**Frontend:** React 18, Wouter, Tailwind CSS, Radix UI, React Query  
**Backend:** Express, Drizzle ORM, Zod validation  
**Database:** PostgreSQL (optional), in-memory fallback  
**Auth:** JWT tokens, HTTP-only cookies

## 🎯 Key Features Explained

### For Users
- Browse products without login
- Add to cart & checkout (requires authentication)
- View order history with receipt downloads
- Switch between 4 languages (English, Spanish, French, Indonesian)
- Secure account management

### For Admins
- Product management (CRUD operations)
- Order processing (pending → processing → completed)
- Sales analytics with interactive charts
- Customer order oversight

## 🔐 Security Features

- JWT-based authentication with HTTP-only cookies
- Rate limiting (5 registrations, 10 logins per 15 min)
- Transaction-safe order processing
- Idempotent API requests
- Secure account deletion with multi-step confirmation

## 🚦 Performance

Handles **500-1000 concurrent users** with:
- Database connection pooling
- Atomic inventory operations
- Race condition prevention
- Optimized queries with indexes


## 📄 License

MIT
