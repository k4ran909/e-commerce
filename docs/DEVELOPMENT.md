# Development Guide

Complete guide for developing JewelCommerce locally.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Frontend Development](#frontend-development)
- [Backend Development](#backend-development)
- [Database Development](#database-development)
- [Testing](#testing)
- [Code Style & Conventions](#code-style--conventions)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 10.x or higher
- **PostgreSQL**: 14.x or higher (optional for development)
- **Git**: For version control

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-username/JewelCommerce.git
cd JewelCommerce

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start at `http://localhost:5173`.

### Test Accounts

After starting, you can use these seeded accounts:

**Admin Account:**
- Email: `admin@lumiere.test`
- Password: `admin123`

**Regular User:**
- Register a new account at `/register`

---

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (client + server)
npm run build            # Build for production
npm start                # Run production build

# Database
npm run db:push          # Apply schema changes to database
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Drizzle Studio (DB GUI)

# Type Checking
npm run check            # Type-check all TypeScript files
```

### Development Server

The development server runs both the frontend and backend:

- **Frontend**: React + Vite at `http://localhost:5173`
- **Backend**: Express server integrated via Vite middleware
- **Hot Reload**: Automatic for both client and server code

### File Watching

Changes to these files trigger automatic reload:
- `client/src/**/*` - Frontend code
- `server/**/*` - Backend code
- `shared/**/*` - Shared types

Changes to `package.json` require server restart.

---

## Project Structure

```
JewelCommerce/
├── client/              # Frontend React application
│   ├── public/         # Static assets (images, fonts)
│   └── src/
│       ├── pages/      # Route components
│       ├── components/ # Reusable UI components
│       ├── lib/        # Utilities, contexts, configs
│       ├── App.tsx     # Root component with routes
│       └── main.tsx    # Entry point
│
├── server/             # Backend Express application
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API route handlers
│   ├── storage.ts      # Data layer abstraction
│   ├── db.ts           # Database connection
│   ├── jwt.ts          # JWT utilities
│   ├── middleware.ts   # Express middleware
│   ├── seed.ts         # Database seeding
│   └── vite.ts         # Vite integration
│
├── shared/             # Shared code between client/server
│   └── schema.ts       # Database schema & types
│
├── docs/               # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT.md
│   └── DEPLOY_KOYEB.md
│
└── [config files]      # Various config files
```

---

## Frontend Development

### Tech Stack

- **React 18** - UI library
- **Wouter** - Lightweight routing
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Query** - Server state management
- **Zod** - Schema validation

### Adding a New Page

1. Create page component in `client/src/pages/`:

```typescript
// client/src/pages/my-page.tsx
export default function MyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>My Page</h1>
    </div>
  );
}
```

2. Add route in `client/src/App.tsx`:

```typescript
import MyPage from "./pages/my-page";

// In the App component
<Route path="/my-page" component={MyPage} />
```

### Creating Components

Place reusable components in `client/src/components/`:

```typescript
// client/src/components/my-component.tsx
interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <button onClick={onClick} className="btn btn-primary">
      {title}
    </button>
  );
}
```

### Using Path Aliases

Vite is configured with path aliases:

```typescript
import { Button } from "@/components/ui/button";
import { insertUserSchema } from "@shared/schema";
```

- `@` → `client/src`
- `@shared` → `shared`

### State Management

#### Context API (Auth, Cart, Theme)

```typescript
// Using auth context
import { useAuth } from "@/lib/auth-context";

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  return user ? (
    <button onClick={logout}>Logout</button>
  ) : (
    <button onClick={() => login(email, password)}>Login</button>
  );
}
```

#### React Query (Server Data)

```typescript
import { useQuery } from "@tanstack/react-query";

function ProductList() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      return res.json();
    }
  });

  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Styling with Tailwind

```typescript
// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// Dark mode support
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  {/* Content */}
</div>

// Using custom utilities
<button className="btn btn-primary">
  Click me
</button>
```

### Form Validation

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address")
});

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input {...register("email")} type="email" />
      {errors.email && <span>{errors.email.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Backend Development

### Tech Stack

- **Express 4** - Web framework
- **Drizzle ORM** - TypeScript ORM
- **PostgreSQL** - Database (optional)
- **JWT** - Authentication
- **Zod** - Input validation
- **bcryptjs** - Password hashing

### Adding API Endpoints

Edit `server/routes.ts`:

```typescript
import { Router } from "express";
import { z } from "zod";
import { authenticate, requireAdmin } from "./middleware";

const router = Router();

// Public endpoint
router.get("/api/my-endpoint", async (req, res) => {
  try {
    const data = await storage.getSomeData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Protected endpoint (requires auth)
router.post("/api/protected", authenticate, async (req, res) => {
  const userId = req.userId; // Set by authenticate middleware
  // ... handle request
});

// Admin-only endpoint
router.get("/api/admin-only", authenticate, requireAdmin, async (req, res) => {
  // ... handle admin request
});

export default router;
```

### Request Validation

```typescript
const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  category: z.enum(["rings", "necklaces", "bracelets", "earrings"])
});

router.post("/api/products", authenticate, requireAdmin, async (req, res) => {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await storage.createProduct(data);
    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});
```

### Authentication Middleware

The `authenticate` middleware verifies JWT tokens:

```typescript
// Already implemented in server/middleware.ts
// Usage:
router.get("/api/protected", authenticate, (req, res) => {
  // req.userId contains the authenticated user's ID
  // req.user contains the full user object
});
```

### Error Handling

```typescript
// Consistent error responses
try {
  // ... operation
} catch (error) {
  console.error("Error:", error);
  
  if (error.code === "23505") {
    // PostgreSQL unique violation
    return res.status(409).json({ message: "Resource already exists" });
  }
  
  res.status(500).json({ message: "Internal server error" });
}
```

---

## Database Development

### Using In-Memory Storage (Default)

By default, the application uses in-memory storage. No database setup required.

**Limitations:**
- Data lost on server restart
- No persistence across deployments
- Sessions expire on restart

### Using PostgreSQL

#### Local Setup

```bash
# Install PostgreSQL (macOS)
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb jewelcommerce_dev

# Set environment variable
export DATABASE_URL="postgresql://localhost:5432/jewelcommerce_dev"

# Apply schema
npm run db:push

# Seed data
npm run db:seed
```

#### Schema Changes

1. Edit `shared/schema.ts`:

```typescript
import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const myTable = pgTable("my_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  count: integer("count").default(0)
});
```

2. Push changes to database:

```bash
npm run db:push
```

3. Update TypeScript types (automatic).

#### Database GUI

Open Drizzle Studio for visual database management:

```bash
npm run db:studio
```

Access at `https://local.drizzle.studio`.

### Writing Migrations

For production, use migrations instead of `db:push`:

```bash
# Generate migration
npx drizzle-kit generate:pg

# Apply migrations
npx drizzle-kit migrate
```

---

## Testing

### Manual Testing

Use the test admin account:

```
Email: admin@lumiere.test
Password: admin123
```

### API Testing with cURL

```bash
# Login
curl -X POST http://localhost:5173/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@lumiere.test","password":"admin123"}' \
  -c cookies.txt

# Get products
curl http://localhost:5173/api/products

# Create product (admin only)
curl -X POST http://localhost:5173/api/products \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "price": 100000000,
    "category": "rings",
    "imageUrl": "/test.webp",
    "material": "Gold",
    "inStock": true
  }'
```

### Browser DevTools

1. Open DevTools (F12)
2. **Network tab**: Monitor API requests
3. **Application tab**: Check cookies, localStorage
4. **Console**: View logs and errors

---

## Code Style & Conventions

### TypeScript

- Use `interface` for object shapes
- Use `type` for unions, intersections
- Avoid `any`; prefer `unknown` if type is truly unknown
- Use optional chaining: `user?.name`
- Use nullish coalescing: `value ?? default`

### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`User`, `ProductData`)

### React Components

```typescript
// Good: Functional component with types
interface UserCardProps {
  user: User;
  onDelete?: (id: string) => void;
}

export function UserCard({ user, onDelete }: UserCardProps) {
  return (
    <div>
      <h3>{user.name}</h3>
      {onDelete && <button onClick={() => onDelete(user.id)}>Delete</button>}
    </div>
  );
}

// Bad: Any types, unclear structure
export function UserCard({ user, onDelete }: any) {
  // ...
}
```

### API Routes

```typescript
// Good: Consistent error handling and validation
router.post("/api/resource", authenticate, async (req, res) => {
  try {
    const data = schema.parse(req.body);
    const result = await storage.create(data);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input" });
    }
    console.error("Error creating resource:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
```

### Database Queries

```typescript
// Good: Use transactions for related operations
await db.transaction(async (tx) => {
  const order = await tx.insert(orders).values(orderData).returning();
  await tx.insert(orderItems).values(items);
  return order;
});

// Bad: Separate operations without transaction
const order = await db.insert(orders).values(orderData).returning();
await db.insert(orderItems).values(items); // Risk: Could fail after order created
```

---

## Common Tasks

### Adding a New Product Category

1. Update schema in `shared/schema.ts`:

```typescript
export const categories = ["rings", "necklaces", "bracelets", "earrings", "watches"] as const;
```

2. Update validation schemas accordingly.

3. Frontend will automatically pick up changes.

### Adding a New User Role

1. Update schema:

```typescript
export const roles = ["user", "admin", "moderator"] as const;
```

2. Update middleware if needed:

```typescript
export function requireModerator(req, res, next) {
  if (req.user.role !== "moderator" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}
```

### Changing Currency

Update everywhere currency is displayed:

```typescript
// client/src/lib/utils.ts
export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}
```

### Adding Image Upload

1. Install multer: `npm install multer @types/multer`
2. Configure storage in `server/`:

```typescript
import multer from "multer";

const upload = multer({ dest: "uploads/" });

router.post("/api/upload", upload.single("image"), (req, res) => {
  const file = req.file;
  res.json({ url: `/uploads/${file.filename}` });
});
```

3. Serve static files:

```typescript
app.use("/uploads", express.static("uploads"));
```

---

## Troubleshooting

### Server Won't Start

**Error:** `Port 5173 already in use`

**Solution:**
```bash
# Find process using port
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
PORT=3000 npm run dev
```

### Database Connection Errors

**Error:** `Connection refused to PostgreSQL`

**Solutions:**
1. Check PostgreSQL is running: `brew services list`
2. Verify DATABASE_URL format: `postgresql://user:pass@host:port/dbname`
3. Check database exists: `psql -l`
4. Verify credentials: `psql -d jewelcommerce_dev`

### TypeScript Errors

**Error:** `Cannot find module '@/...'`

**Solution:** Restart TypeScript server in VS Code:
- Cmd+Shift+P → "TypeScript: Restart TS Server"

**Error:** `Property does not exist on type`

**Solution:** Check type definitions in `shared/schema.ts`

### Build Errors

**Error:** `Module not found`

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Hot Reload Not Working

**Solutions:**
1. Check file is in watched directories
2. Restart dev server: Ctrl+C, then `npm run dev`
3. Clear Vite cache: `rm -rf node_modules/.vite`

### Cookie/Auth Issues

**Problem:** User logged out unexpectedly

**Causes:**
- Session cookie expired (browser close)
- Server restarted (in-memory sessions lost)
- Cookie settings incorrect

**Solutions:**
1. Use PostgreSQL for persistent sessions
2. Check cookie settings in browser DevTools
3. Verify JWT_SECRET is set in production

### Slow Development Server

**Solutions:**
1. Reduce file watching: Add `.gitignore` entries
2. Optimize imports: Avoid importing entire libraries
3. Use production build for testing: `npm run build && npm start`

### Database Schema Out of Sync

**Error:** `Column does not exist`

**Solution:**
```bash
# Re-apply schema
npm run db:push

# Or reset database (WARNING: Data loss)
dropdb jewelcommerce_dev
createdb jewelcommerce_dev
npm run db:push
npm run db:seed
```

---

## Environment Variables

Create `.env` file in project root:

```bash
# Database (optional)
DATABASE_URL=postgresql://localhost:5432/jewelcommerce_dev

# JWT Secret (required for production)
JWT_SECRET=your-very-secure-random-secret-key-here

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Server Port (optional)
PORT=5173

# Node Environment
NODE_ENV=development
```

**Never commit `.env` to git!** It's already in `.gitignore`.

---

## Debugging

### Backend Debugging

Add console logs:

```typescript
router.post("/api/orders", authenticate, async (req, res) => {
  console.log("Creating order for user:", req.userId);
  console.log("Order data:", req.body);
  
  try {
    const order = await storage.createOrder(req.body);
    console.log("Order created:", order.id);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Error" });
  }
});
```

### Frontend Debugging

Use React DevTools and browser console:

```typescript
function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    console.log("Component mounted");
    console.log("Current data:", data);
  }, [data]);
  
  return <div>{data}</div>;
}
```

### Network Debugging

Monitor API calls in browser DevTools:

1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Click request to see:
   - Request headers & body
   - Response headers & body
   - Timing information

---

## Performance Tips

### Frontend

- Use `React.memo()` for expensive components
- Implement virtualization for long lists
- Lazy load routes: `const Page = lazy(() => import('./Page'))`
- Optimize images: Use WebP, proper sizing
- Use React Query caching effectively

### Backend

- Add database indexes on frequently queried fields
- Use connection pooling (already configured)
- Implement caching with Redis (optional)
- Use transactions for related operations
- Avoid N+1 queries

### Database

- Keep indexes on: user_id, created_at, status, category
- Use EXPLAIN ANALYZE to debug slow queries
- Regular VACUUM and ANALYZE (PostgreSQL)
- Monitor connection pool usage

---

## Getting Help

1. **Check Documentation**: Read API.md, ARCHITECTURE.md
2. **Search Issues**: GitHub Issues for known problems
3. **Ask Team**: Contact team members
4. **Debug**: Use console.log, DevTools, network tab
5. **Stack Overflow**: Search for similar issues

---

## Next Steps

- Read [API Reference](API.md) for endpoint details
- Review [Architecture](ARCHITECTURE.md) for system design
- Check [Deployment Guide](DEPLOY_KOYEB.md) for production setup
- Explore codebase and experiment!

Happy coding! 🚀
