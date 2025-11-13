# Lumière Jewelry - Elegant E-commerce Store

An elegant and minimalist jewelry e-commerce website inspired by Pandora US, featuring a sophisticated rose gold color palette and refined design aesthetics.

## Project Overview

Lumière is a full-stack jewelry e-commerce application built with React, TypeScript, Express, and Tailwind CSS. The application provides a complete shopping experience including product browsing, cart management, and a simulated checkout process.

## Features

### Customer-Facing Features
- **Hero Section**: Elegant landing page with lifestyle jewelry photography
- **Product Catalog**: Browse jewelry by category (Rings, Necklaces, Bracelets, Earrings)
- **Advanced Filtering**: Filter by category and sort by price or name
- **Product Details**: Comprehensive product pages with image galleries, size selection, and detailed descriptions
- **Shopping Cart**: Persistent cart with real-time updates and quantity management
- **Checkout Flow**: Complete checkout process with shipping information and simulated payment
- **Pre-Order System**: Special handling for pre-order items with appropriate badges and messaging
- **Dark Mode**: Full dark mode support with elegant color transitions
- **Responsive Design**: Optimized for all devices from mobile to desktop

### Technical Features
- **Type-Safe**: Full TypeScript implementation across frontend and backend
- **Form Validation**: React Hook Form with Zod validation
- **State Management**: React Context for cart state
- **API Integration**: RESTful API with proper error handling
- **In-Memory Storage**: Fast data persistence using MemStorage
- **Image Assets**: AI-generated elegant jewelry photography
- **Accessibility**: Proper ARIA labels and semantic HTML

## Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Wouter**: Lightweight client-side routing
- **TanStack Query**: Data fetching and caching
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **Shadcn UI**: High-quality component library
- **Lucide Icons**: Beautiful icon library

### Backend
- **Express**: Node.js web framework
- **TypeScript**: Server-side type safety
- **Drizzle ORM**: Type-safe database schema definitions
- **In-Memory Storage**: Fast data persistence for development

## Design System

### Color Palette
- **Primary**: Rose Gold (#d4a574) - Warm, elegant accent color
- **Background**: Pure white in light mode, warm dark gray in dark mode
- **Foreground**: Warm dark brown for text
- **Muted**: Soft neutrals for secondary information

### Typography
- **Headings**: Playfair Display (elegant serif)
- **Body**: Montserrat (clean sans-serif)
- **Font Weights**: Light for headlines, Medium for emphasis

### Spacing
- Consistent spacing scale: 3, 4, 6, 8, 12, 16, 20
- Generous whitespace for luxury feel
- Product grid: 2 columns mobile, 4 columns desktop

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # Shadcn UI components
│   │   │   ├── header.tsx   # Navigation header
│   │   │   ├── product-card.tsx
│   │   │   ├── cart-sheet.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── lib/
│   │   │   ├── cart-context.tsx  # Cart state management
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   ├── pages/           # Page components
│   │   │   ├── home.tsx
│   │   │   ├── products.tsx
│   │   │   ├── product-detail.tsx
│   │   │   ├── checkout.tsx
│   │   │   └── order-success.tsx
│   │   ├── App.tsx
│   │   └── index.css        # Global styles and design tokens
│   └── index.html
├── server/
│   ├── index.ts             # Express server setup
│   ├── routes.ts            # API endpoints
│   └── storage.ts           # In-memory data storage
├── shared/
│   └── schema.ts            # Shared TypeScript schemas
└── attached_assets/
    └── generated_images/    # AI-generated product images
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product

### Cart
- `GET /api/cart/:sessionId` - Get cart items
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove cart item
- `DELETE /api/cart/session/:sessionId` - Clear entire cart

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status

### Payment
- `POST /api/payment/simulate` - Simulated payment processing (demo only)

## Data Models

### Product
- id, name, description, price (in cents)
- category (rings, necklaces, bracelets, earrings)
- imageUrl, images[], material
- isPreOrder, inStock, sizes[]

### Cart Item
- id, productId, quantity, size, sessionId

### Order
- id, customer information (name, email, phone)
- shipping address details
- items (JSON), totalAmount, status
- isPreOrder, paymentStatus, createdAt

## Development Guidelines

### Design Principles
1. **Generous Whitespace**: Create breathing room and luxury feel
2. **Product Photography First**: Images are the hero element
3. **Refined Typography**: Light weights for headlines, readable body text
4. **Subtle Interactions**: Gentle hover effects, smooth transitions
5. **Consistent Spacing**: Use defined spacing scale throughout

### Component Patterns
- Use Shadcn UI components for consistency
- Implement hover-elevate and active-elevate-2 for interactions
- Always include data-testid attributes for testing
- Follow responsive design patterns (mobile-first)

### State Management
- Cart state managed via React Context
- Server state managed via TanStack Query
- Form state managed via React Hook Form

## Running the Application

The application is configured to run automatically:
- Frontend: Vite dev server
- Backend: Express server
- Both servers run concurrently via `npm run dev`
- The app binds to port 5000

## Future Enhancements

Potential features for future development:
- User authentication and accounts
- Order history and tracking
- Wishlist functionality
- Product search with autocomplete
- Product reviews and ratings
- Email notifications
- PostgreSQL database persistence
- Real Stripe payment integration
- Admin dashboard for product management
- Inventory management system

## User Preferences

- Language: Bahasa Indonesia (for UI text where applicable)
- Design Style: Elegant, minimalist, inspired by Pandora US
- Color Palette: Rose gold, champagne, soft neutrals
- Payment: Simulated (no real payment gateway integration)
