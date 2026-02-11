# MedusaJS Backend Integration Guide for JewelryCommerce

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Installation](#step-by-step-installation)
4. [Database Setup (PostgreSQL)](#database-setup-postgresql)
5. [Admin Dashboard Setup](#admin-dashboard-setup)
6. [Environment Variables](#environment-variables)
7. [API Usage Examples](#api-usage-examples)
8. [Payment Gateway Integration](#payment-gateway-integration)
9. [Shipping Configuration](#shipping-configuration)
10. [Frontend Integration](#frontend-integration)
11. [Security & Authentication](#security--authentication)
12. [Deployment Guide](#deployment-guide)

---

## Overview

**MedusaJS** is an open-source headless commerce platform that provides:
- ✅ E-commerce REST/GraphQL APIs
- ✅ Product, category & inventory management
- ✅ Order & cart system
- ✅ Customer authentication
- ✅ Payment & shipping integration
- ✅ Admin dashboard

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Your Jewelry Frontend                     │
│                 (Existing React/Vite App)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API / Store APIs
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   MedusaJS Backend                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Store APIs  │  │ Admin APIs   │  │ Admin Dashboard     │ │
│  │ /store/*    │  │ /admin/*     │  │ localhost:9000/app  │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │                     Modules                            │  │
│  │  Products │ Cart │ Orders │ Customers │ Payments       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL + Redis                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before installing MedusaJS, ensure you have:

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | v20+ (LTS) | [Download](https://nodejs.org/) |
| Git | Latest | [Download](https://git-scm.com/) |
| PostgreSQL | 14+ | [Download](https://www.postgresql.org/download/) |
| Redis | 6+ | Optional for development, required for production |

### Windows-Specific Setup

```powershell
# Install Node.js via winget
winget install OpenJS.NodeJS.LTS

# Install PostgreSQL via winget
winget install PostgreSQL.PostgreSQL

# Install Redis via WSL (Windows Subsystem for Linux)
# Or use Docker: docker run -d --name redis -p 6379:6379 redis:alpine
```

---

## Step-by-Step Installation

### Step 1: Create MedusaJS Backend

Open a new terminal and navigate to your desired directory:

```powershell
# Navigate to your project parent directory
cd C:\Users\k4ran\OneDrive\Desktop\temp

# Create a new Medusa application
npx create-medusa-app@latest jewelry-backend

# When prompted:
# - Database name: jewelry_commerce_db (or use default)
# - Install Next.js Storefront?: No (we have our own frontend)
```

### Step 2: Navigate to Your Medusa Project

```powershell
cd jewelry-backend
```

### Step 3: Start the Medusa Server

```powershell
npm run dev
```

**Successful start will show:**
- 🌐 **API Server**: http://localhost:9000
- 🎛️ **Admin Dashboard**: http://localhost:9000/app

### Step 4: Create Admin User (if not created during setup)

```powershell
npx medusa user -e admin@jewelrycommerce.com -p YourSecurePassword123
```

---

## Database Setup (PostgreSQL)

### Option A: Local PostgreSQL

1. **Create Database:**

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE jewelry_commerce_db;

-- Create user with password
CREATE USER jewelry_admin WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE jewelry_commerce_db TO jewelry_admin;

-- Exit
\q
```

2. **Update `.env` file:**

```env
DATABASE_URL=postgresql://jewelry_admin:your_secure_password@localhost:5432/jewelry_commerce_db
```

### Option B: Docker PostgreSQL

```powershell
# Create PostgreSQL container
docker run -d `
  --name jewelry-postgres `
  -e POSTGRES_USER=jewelry_admin `
  -e POSTGRES_PASSWORD=your_secure_password `
  -e POSTGRES_DB=jewelry_commerce_db `
  -p 5432:5432 `
  postgres:16-alpine
```

### Run Database Migrations

```powershell
# In your Medusa project directory
npx medusa db:migrate
```

### Seed Sample Data (Optional)

```powershell
npx medusa seed --seed-file=data/seed.json
```

---

## Admin Dashboard Setup

The Medusa Admin Dashboard is automatically bundled with your Medusa application.

### Accessing the Admin Panel

1. Start your Medusa server: `npm run dev`
2. Navigate to: **http://localhost:9000/app**
3. Login with your admin credentials

### Admin Dashboard Features

| Feature | Description |
|---------|-------------|
| **Products** | Create, edit, delete products with variants, images, pricing |
| **Categories** | Organize products into hierarchical categories |
| **Collections** | Curated product collections |
| **Orders** | View, manage, fulfill orders |
| **Customers** | Customer management and groups |
| **Discounts** | Create percentage/fixed discounts and promo codes |
| **Regions** | Configure currencies, tax rates, payment/shipping providers |
| **Settings** | Store settings, API keys, users |

### Customizing Admin Dashboard

To add custom admin widgets:

```typescript
// src/admin/widgets/jewelry-analytics.tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"

const JewelryAnalyticsWidget = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold">Jewelry Analytics</h2>
      {/* Your custom analytics */}
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
})

export default JewelryAnalyticsWidget
```

---

## Environment Variables

Create a `.env` file in your Medusa project root:

```env
# ============================================
# MEDUSA BACKEND ENVIRONMENT CONFIGURATION
# ============================================

# Node Environment
NODE_ENV=development

# ============================================
# DATABASE
# ============================================
DATABASE_URL=postgresql://jewelry_admin:your_secure_password@localhost:5432/jewelry_commerce_db

# ============================================
# REDIS (Required for production)
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# SECURITY SECRETS (Generate secure random strings!)
# ============================================
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_here_32_chars_minimum
COOKIE_SECRET=your_super_secret_cookie_key_here_32_chars_minimum

# ============================================
# CORS SETTINGS
# ============================================
# Your frontend URLs (comma-separated for multiple)
STORE_CORS=http://localhost:5173,http://localhost:3000
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000

# ============================================
# BACKEND URL
# ============================================
MEDUSA_BACKEND_URL=http://localhost:9000

# ============================================
# STRIPE PAYMENT (Optional)
# ============================================
STRIPE_API_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ============================================
# PAYPAL PAYMENT (Optional)
# ============================================
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
PAYPAL_SANDBOX=true

# ============================================
# RAZORPAY PAYMENT (Optional - India)
# ============================================
RAZORPAY_ID=rzp_test_your_key_id
RAZORPAY_SECRET=your_razorpay_secret
RAZORPAY_ACCOUNT=your_merchant_id
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# ============================================
# FILE STORAGE (Optional - for product images)
# ============================================
# S3 Compatible Storage
S3_URL=https://your-bucket.s3.region.amazonaws.com
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key

# ============================================
# EMAIL (Optional - for notifications)
# ============================================
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM=orders@jewelrycommerce.com

# ============================================
# ADMIN SETTINGS
# ============================================
# Set to true if deploying admin separately
DISABLE_MEDUSA_ADMIN=false
```

### Generate Secure Secrets

Run this command to generate secure random strings:

```powershell
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex')); console.log('COOKIE_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

---

## API Usage Examples

### Base Configuration for Frontend

```typescript
// src/lib/medusa-client.ts
const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || 'http://localhost:9000';

export const medusaClient = {
  baseUrl: MEDUSA_BACKEND_URL,
  
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Include credentials for session-based auth
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  // Store APIs
  store: {
    async getProducts(params?: Record<string, string>) {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return medusaClient.request(`/store/products${query}`);
    },
    
    async getProduct(id: string) {
      return medusaClient.request(`/store/products/${id}`);
    },
    
    async getCategories() {
      return medusaClient.request('/store/product-categories');
    },
    
    async getCollections() {
      return medusaClient.request('/store/collections');
    },
  },
  
  // Cart APIs
  cart: {
    async create() {
      return medusaClient.request('/store/carts', { method: 'POST' });
    },
    
    async get(cartId: string) {
      return medusaClient.request(`/store/carts/${cartId}`);
    },
    
    async addItem(cartId: string, variantId: string, quantity: number) {
      return medusaClient.request(`/store/carts/${cartId}/line-items`, {
        method: 'POST',
        body: JSON.stringify({ variant_id: variantId, quantity }),
      });
    },
    
    async updateItem(cartId: string, lineItemId: string, quantity: number) {
      return medusaClient.request(`/store/carts/${cartId}/line-items/${lineItemId}`, {
        method: 'POST',
        body: JSON.stringify({ quantity }),
      });
    },
    
    async removeItem(cartId: string, lineItemId: string) {
      return medusaClient.request(`/store/carts/${cartId}/line-items/${lineItemId}`, {
        method: 'DELETE',
      });
    },
    
    async update(cartId: string, data: any) {
      return medusaClient.request(`/store/carts/${cartId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },
  
  // Checkout APIs
  checkout: {
    async addShippingMethod(cartId: string, shippingOptionId: string) {
      return medusaClient.request(`/store/carts/${cartId}/shipping-methods`, {
        method: 'POST',
        body: JSON.stringify({ option_id: shippingOptionId }),
      });
    },
    
    async createPaymentSession(cartId: string) {
      return medusaClient.request(`/store/carts/${cartId}/payment-sessions`, {
        method: 'POST',
      });
    },
    
    async complete(cartId: string) {
      return medusaClient.request(`/store/carts/${cartId}/complete`, {
        method: 'POST',
      });
    },
  },
  
  // Customer APIs
  customer: {
    async register(email: string, password: string, firstName: string, lastName: string) {
      return medusaClient.request('/store/customers', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
        }),
      });
    },
    
    async login(email: string, password: string) {
      return medusaClient.request('/store/auth/customer/emailpass', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    
    async getSession() {
      return medusaClient.request('/store/customers/me');
    },
    
    async logout() {
      return medusaClient.request('/store/auth', { method: 'DELETE' });
    },
    
    async getOrders() {
      return medusaClient.request('/store/customers/me/orders');
    },
  },
  
  // Order APIs
  orders: {
    async get(orderId: string) {
      return medusaClient.request(`/store/orders/${orderId}`);
    },
    
    async getByDisplayId(displayId: string) {
      return medusaClient.request(`/store/orders?display_id=${displayId}`);
    },
  },
  
  // Regions (for shipping/payment options)
  regions: {
    async list() {
      return medusaClient.request('/store/regions');
    },
    
    async get(regionId: string) {
      return medusaClient.request(`/store/regions/${regionId}`);
    },
  },
};

export default medusaClient;
```

### 1. Products API

```typescript
// Fetch all products
const { products } = await medusaClient.store.getProducts();

// Fetch products with pagination
const { products, count } = await medusaClient.store.getProducts({
  limit: '12',
  offset: '0',
});

// Fetch product by ID (with all details)
const { product } = await medusaClient.store.getProduct('prod_01ABC123');

// Fetch products by category
const { products } = await medusaClient.store.getProducts({
  category_id: ['pcat_01ABC123'],
});

// Fetch products by collection
const { products } = await medusaClient.store.getProducts({
  collection_id: ['pcol_01ABC123'],
});

// Search products
const { products } = await medusaClient.store.getProducts({
  q: 'diamond ring',
});
```

### 2. Categories API

```typescript
// Fetch all categories
const { product_categories } = await medusaClient.store.getCategories();

// Response structure:
// {
//   product_categories: [
//     {
//       id: "pcat_rings",
//       name: "Rings",
//       handle: "rings",
//       parent_category_id: null,
//       category_children: [...]
//     }
//   ]
// }
```

### 3. Cart API

```typescript
// Create a new cart
const { cart } = await medusaClient.cart.create();
const cartId = cart.id;

// Store cart ID in localStorage
localStorage.setItem('cartId', cartId);

// Add item to cart
const { cart: updatedCart } = await medusaClient.cart.addItem(
  cartId,
  'variant_01ABC123', // Product variant ID
  1 // Quantity
);

// Update item quantity
await medusaClient.cart.updateItem(cartId, 'item_01ABC123', 2);

// Remove item from cart
await medusaClient.cart.removeItem(cartId, 'item_01ABC123');

// Update cart with customer info
await medusaClient.cart.update(cartId, {
  email: 'customer@example.com',
  shipping_address: {
    first_name: 'John',
    last_name: 'Doe',
    address_1: '123 Main St',
    city: 'New York',
    country_code: 'us',
    postal_code: '10001',
    phone: '+1234567890',
  },
  billing_address: {
    first_name: 'John',
    last_name: 'Doe',
    address_1: '123 Main St',
    city: 'New York',
    country_code: 'us',
    postal_code: '10001',
  },
});
```

### 4. Checkout API

```typescript
// Complete checkout flow
async function checkout(cartId: string) {
  // 1. Get shipping options for the cart
  const { shipping_options } = await medusaClient.request(
    `/store/shipping-options?cart_id=${cartId}`
  );
  
  // 2. Add shipping method
  await medusaClient.checkout.addShippingMethod(
    cartId,
    shipping_options[0].id
  );
  
  // 3. Create payment sessions
  const { cart } = await medusaClient.checkout.createPaymentSession(cartId);
  
  // 4. Select payment provider (e.g., Stripe)
  await medusaClient.request(`/store/carts/${cartId}/payment-session`, {
    method: 'POST',
    body: JSON.stringify({ provider_id: 'stripe' }),
  });
  
  // 5. Complete the order
  const { order } = await medusaClient.checkout.complete(cartId);
  
  return order;
}
```

### 5. Orders API

```typescript
// Get order by ID
const { order } = await medusaClient.orders.get('order_01ABC123');

// Get customer's orders (requires authentication)
const { orders } = await medusaClient.customer.getOrders();

// Order response structure
// {
//   order: {
//     id: "order_01ABC123",
//     display_id: 1001,
//     status: "pending",
//     fulfillment_status: "not_fulfilled",
//     payment_status: "awaiting",
//     items: [...],
//     shipping_methods: [...],
//     subtotal: 15000,
//     tax_total: 1500,
//     shipping_total: 500,
//     total: 17000,
//     created_at: "2026-01-20T15:00:00.000Z"
//   }
// }
```

### 6. Customers API

```typescript
// Register new customer
const { customer } = await medusaClient.customer.register(
  'customer@example.com',
  'SecurePassword123!',
  'John',
  'Doe'
);

// Login customer
const { token } = await medusaClient.customer.login(
  'customer@example.com',
  'SecurePassword123!'
);

// Get current customer session
const { customer } = await medusaClient.customer.getSession();

// Update customer profile
await medusaClient.request('/store/customers/me', {
  method: 'POST',
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    phone: '+1234567890',
  }),
});

// Add shipping address
await medusaClient.request('/store/customers/me/addresses', {
  method: 'POST',
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    address_1: '123 Main St',
    city: 'New York',
    country_code: 'us',
    postal_code: '10001',
    phone: '+1234567890',
  }),
});

// Logout
await medusaClient.customer.logout();
```

---

## Payment Gateway Integration

### Stripe Integration

#### 1. Install Stripe Plugin

```powershell
cd jewelry-backend
npm install @medusajs/payment-stripe
```

#### 2. Configure in medusa-config.ts

```typescript
// medusa-config.ts
import { defineConfig, loadEnv } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    {
      resolve: '@medusajs/payment-stripe',
      options: {
        apiKey: process.env.STRIPE_API_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        // capture: true, // Auto-capture payments
      },
    },
  ],
})
```

#### 3. Enable Stripe in Admin Dashboard

1. Go to **Settings → Regions**
2. Select your region (e.g., "NA" or "EU")
3. Add **Stripe** as a payment provider

#### 4. Frontend Stripe Integration

```typescript
// Install Stripe on frontend
// npm install @stripe/stripe-js

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

async function handleStripePayment(cartId: string) {
  const stripe = await stripePromise;
  
  // Create payment session
  const { cart } = await medusaClient.checkout.createPaymentSession(cartId);
  
  // Select Stripe as payment provider
  await medusaClient.request(`/store/carts/${cartId}/payment-session`, {
    method: 'POST',
    body: JSON.stringify({ provider_id: 'stripe' }),
  });
  
  // Get the client secret
  const { cart: updatedCart } = await medusaClient.cart.get(cartId);
  const clientSecret = updatedCart.payment_session?.data?.client_secret;
  
  // Confirm payment with Stripe
  const { error } = await stripe!.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement, // From Stripe Elements
      billing_details: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    },
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Complete the order
  const { order } = await medusaClient.checkout.complete(cartId);
  return order;
}
```

### PayPal Integration

#### 1. Install PayPal Plugin

```powershell
npm install @medusajs/payment-paypal
```

#### 2. Configure in medusa-config.ts

```typescript
modules: [
  {
    resolve: '@medusajs/payment-paypal',
    options: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      webhookId: process.env.PAYPAL_WEBHOOK_ID,
      sandbox: process.env.PAYPAL_SANDBOX === 'true',
    },
  },
],
```

### Razorpay Integration (India)

#### 1. Install Razorpay Plugin

```powershell
npm install @sgftech/payment-razorpay
# or
npm install @tsc_tech/medusa-plugin-razorpay-payment
```

#### 2. Configure in medusa-config.ts

```typescript
modules: [
  {
    resolve: '@sgftech/payment-razorpay',
    options: {
      key_id: process.env.RAZORPAY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
      razorpay_account: process.env.RAZORPAY_ACCOUNT,
      webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
    },
  },
],
```

---

## Shipping Configuration

### 1. Configure Shipping in Admin Dashboard

1. Go to **Settings → Regions**
2. Select your region
3. Add **Shipping Options**:
   - **Standard Shipping** - $5.00, 5-7 business days
   - **Express Shipping** - $15.00, 1-2 business days
   - **Free Shipping** - $0.00, orders over $100

### 2. Create Custom Fulfillment Provider

```typescript
// src/modules/custom-fulfillment/service.ts
import { AbstractFulfillmentService } from '@medusajs/framework/utils'

class CustomFulfillmentService extends AbstractFulfillmentService {
  static identifier = 'custom-fulfillment'
  
  async getFulfillmentOptions() {
    return [
      {
        id: 'standard-shipping',
        name: 'Standard Shipping',
        price_type: 'flat_rate',
        data: {
          days: '5-7',
        },
      },
      {
        id: 'express-shipping',
        name: 'Express Shipping',
        price_type: 'flat_rate',
        data: {
          days: '1-2',
        },
      },
    ]
  }
  
  async calculatePrice(optionData: any, data: any, cart: any) {
    if (optionData.id === 'express-shipping') {
      return 1500 // $15.00 in cents
    }
    
    // Free shipping for orders over $100
    if (cart.subtotal >= 10000) {
      return 0
    }
    
    return 500 // $5.00 in cents
  }
  
  async createFulfillment(data: any, items: any, order: any) {
    // Integration with shipping carrier API
    return {
      tracking_number: `JWL-${Date.now()}`,
      tracking_url: `https://track.carrier.com/JWL-${Date.now()}`,
    }
  }
  
  async cancelFulfillment(fulfillment: any) {
    // Cancel shipment with carrier
    return {}
  }
}

export default CustomFulfillmentService
```

### 3. Get Shipping Options in Frontend

```typescript
// Get shipping options for cart
const { shipping_options } = await medusaClient.request(
  `/store/shipping-options?cart_id=${cartId}`
);

// Response:
// {
//   shipping_options: [
//     {
//       id: "so_01ABC123",
//       name: "Standard Shipping",
//       amount: 500,
//       data: { days: "5-7" }
//     },
//     {
//       id: "so_01DEF456",
//       name: "Express Shipping",
//       amount: 1500,
//       data: { days: "1-2" }
//     }
//   ]
// }
```

---

## Frontend Integration

### 1. Update Your Frontend Environment

Add to your frontend `.env` file:

```env
# Frontend .env
VITE_MEDUSA_BACKEND_URL=http://localhost:9000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

### 2. Create React Hooks for Medusa

```typescript
// src/hooks/useMedusa.ts
import { useState, useEffect, useCallback } from 'react';
import medusaClient from '../lib/medusa-client';

// Products Hook
export function useProducts(params?: Record<string, string>) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const { products } = await medusaClient.store.getProducts(params);
        setProducts(products);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, [JSON.stringify(params)]);
  
  return { products, loading, error };
}

// Cart Hook
export function useCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const cartId = localStorage.getItem('cartId');
  
  useEffect(() => {
    async function fetchCart() {
      if (!cartId) {
        setLoading(false);
        return;
      }
      
      try {
        const { cart } = await medusaClient.cart.get(cartId);
        setCart(cart);
      } catch (err) {
        localStorage.removeItem('cartId');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCart();
  }, [cartId]);
  
  const createCart = useCallback(async () => {
    const { cart } = await medusaClient.cart.create();
    localStorage.setItem('cartId', cart.id);
    setCart(cart);
    return cart;
  }, []);
  
  const addItem = useCallback(async (variantId: string, quantity: number) => {
    let currentCartId = cartId;
    
    if (!currentCartId) {
      const newCart = await createCart();
      currentCartId = newCart.id;
    }
    
    const { cart: updatedCart } = await medusaClient.cart.addItem(
      currentCartId!,
      variantId,
      quantity
    );
    
    setCart(updatedCart);
    return updatedCart;
  }, [cartId, createCart]);
  
  const updateItem = useCallback(async (lineItemId: string, quantity: number) => {
    if (!cartId) return;
    
    const { cart: updatedCart } = await medusaClient.cart.updateItem(
      cartId,
      lineItemId,
      quantity
    );
    
    setCart(updatedCart);
    return updatedCart;
  }, [cartId]);
  
  const removeItem = useCallback(async (lineItemId: string) => {
    if (!cartId) return;
    
    const { cart: updatedCart } = await medusaClient.cart.removeItem(
      cartId,
      lineItemId
    );
    
    setCart(updatedCart);
    return updatedCart;
  }, [cartId]);
  
  return {
    cart,
    loading,
    createCart,
    addItem,
    updateItem,
    removeItem,
    itemCount: cart?.items?.length || 0,
    total: cart?.total || 0,
  };
}

// Customer Hook
export function useCustomer() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCustomer() {
      try {
        const { customer } = await medusaClient.customer.getSession();
        setCustomer(customer);
      } catch (err) {
        // Not logged in
      } finally {
        setLoading(false);
      }
    }
    
    fetchCustomer();
  }, []);
  
  const login = useCallback(async (email: string, password: string) => {
    await medusaClient.customer.login(email, password);
    const { customer } = await medusaClient.customer.getSession();
    setCustomer(customer);
    return customer;
  }, []);
  
  const register = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const { customer } = await medusaClient.customer.register(
      email,
      password,
      firstName,
      lastName
    );
    setCustomer(customer);
    return customer;
  }, []);
  
  const logout = useCallback(async () => {
    await medusaClient.customer.logout();
    setCustomer(null);
  }, []);
  
  return {
    customer,
    loading,
    isAuthenticated: !!customer,
    login,
    register,
    logout,
  };
}
```

### 3. Example Product List Component

```tsx
// src/components/ProductList.tsx
import { useProducts } from '../hooks/useMedusa';
import { useCart } from '../hooks/useMedusa';

export function ProductList() {
  const { products, loading, error } = useProducts({ limit: '12' });
  const { addItem } = useCart();
  
  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products</div>;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product: any) => (
        <div key={product.id} className="bg-white rounded-lg shadow p-4">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-48 object-cover rounded"
          />
          <h3 className="font-semibold mt-2">{product.title}</h3>
          <p className="text-gray-600">
            ${(product.variants[0]?.prices[0]?.amount / 100).toFixed(2)}
          </p>
          <button
            onClick={() => addItem(product.variants[0].id, 1)}
            className="w-full mt-2 bg-gold-500 text-white py-2 rounded hover:bg-gold-600"
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Security & Authentication

### 1. JWT Authentication Flow

```typescript
// Token-based authentication for your frontend
const authClient = {
  async login(email: string, password: string) {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth/customer/emailpass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const { token } = await response.json();
    
    // Store JWT token
    localStorage.setItem('medusa_token', token);
    
    return token;
  },
  
  getAuthHeaders() {
    const token = localStorage.getItem('medusa_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
```

### 2. Publishable API Keys

For production, use Publishable API Keys to scope store requests:

```typescript
// In your frontend requests
const headers = {
  'Content-Type': 'application/json',
  'x-publishable-api-key': import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY,
};
```

### 3. Rate Limiting

MedusaJS has built-in rate limiting. For additional protection, configure in your reverse proxy (Nginx):

```nginx
# nginx.conf
limit_req_zone $binary_remote_addr zone=medusa_limit:10m rate=10r/s;

server {
    location /store/ {
        limit_req zone=medusa_limit burst=20 nodelay;
        proxy_pass http://localhost:9000;
    }
}
```

### 4. CORS Configuration

Ensure your CORS settings in `.env` only allow your frontend domains:

```env
# Production CORS settings
STORE_CORS=https://jewelrycommerce.com,https://www.jewelrycommerce.com
ADMIN_CORS=https://admin.jewelrycommerce.com
AUTH_CORS=https://jewelrycommerce.com
```

---

## Deployment Guide

### Option 1: Docker Deployment (Recommended)

#### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.medusa ./.medusa

EXPOSE 9000

CMD ["npm", "run", "start"]
```

#### 2. Create docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: jewelry-postgres
    environment:
      POSTGRES_USER: jewelry_admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: jewelry_commerce_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U jewelry_admin -d jewelry_commerce_db"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - jewelry-network

  redis:
    image: redis:7-alpine
    container_name: jewelry-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - jewelry-network

  medusa:
    build: .
    container_name: jewelry-medusa
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://jewelry_admin:${POSTGRES_PASSWORD}@postgres:5432/jewelry_commerce_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      COOKIE_SECRET: ${COOKIE_SECRET}
      STORE_CORS: ${STORE_CORS}
      ADMIN_CORS: ${ADMIN_CORS}
      AUTH_CORS: ${AUTH_CORS}
      STRIPE_API_KEY: ${STRIPE_API_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
    ports:
      - "9000:9000"
    networks:
      - jewelry-network

volumes:
  postgres_data:
  redis_data:

networks:
  jewelry-network:
    driver: bridge
```

#### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d --build

# Run migrations
docker-compose exec medusa npx medusa db:migrate

# Create admin user
docker-compose exec medusa npx medusa user -e admin@jewelrycommerce.com -p YourSecurePassword

# View logs
docker-compose logs -f medusa
```

### Option 2: VPS Deployment (Manual)

#### 1. Server Setup

```bash
# SSH into your VPS
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install Redis
apt install redis-server -y

# Install Nginx
apt install nginx -y

# Install PM2 (Process Manager)
npm install -g pm2
```

#### 2. PostgreSQL Setup

```bash
# Login as postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE jewelry_commerce_db;
CREATE USER jewelry_admin WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE jewelry_commerce_db TO jewelry_admin;
\q
```

#### 3. Clone and Setup Medusa

```bash
# Clone your Medusa project
git clone https://github.com/your-username/jewelry-backend.git /var/www/jewelry-backend
cd /var/www/jewelry-backend

# Install dependencies
npm ci --only=production

# Setup environment variables
cp .env.example .env
nano .env  # Edit with your production values

# Build the application
npm run build

# Run migrations
npx medusa db:migrate

# Start with PM2
pm2 start npm --name "jewelry-medusa" -- run start
pm2 save
pm2 startup
```

#### 4. Nginx Configuration

```nginx
# /etc/nginx/sites-available/jewelry-backend
server {
    listen 80;
    server_name api.jewelrycommerce.com;
    
    location / {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/jewelry-backend /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Setup SSL with Certbot
apt install certbot python3-certbot-nginx -y
certbot --nginx -d api.jewelrycommerce.com
```

### Option 3: Coolify Deployment

#### 1. Setup Coolify

```bash
# Install Coolify on your VPS
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

#### 2. Add Your Application

1. Open Coolify dashboard (usually at `https://your-vps-ip:8000`)
2. Create new project → "Import from Git"
3. Select your repository
4. Configure build settings:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Port**: `9000`

#### 3. Add Environment Variables

In Coolify dashboard → Settings → Environment Variables:
- Add all variables from your `.env` file

#### 4. Add PostgreSQL & Redis

1. Create PostgreSQL database in Coolify
2. Create Redis instance in Coolify
3. Link them to your Medusa application

---

## Production Checklist

Before going live, ensure:

- [ ] **Database**: PostgreSQL is properly configured with backups
- [ ] **Redis**: Redis is running for caching and sessions
- [ ] **Secrets**: JWT_SECRET and COOKIE_SECRET are secure random strings
- [ ] **CORS**: Only your production domains are allowed
- [ ] **SSL**: HTTPS is enabled with valid certificate
- [ ] **Rate Limiting**: Enabled at reverse proxy level
- [ ] **Logging**: Proper logging configured
- [ ] **Monitoring**: Set up health checks and alerts
- [ ] **Backups**: Database backups are automated
- [ ] **CDN**: Static assets served via CDN
- [ ] **Payment Webhooks**: Payment provider webhooks are configured
- [ ] **Admin User**: Secure admin credentials are set

---

## Quick Reference

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/store/products` | GET | List all products |
| `/store/products/:id` | GET | Get single product |
| `/store/product-categories` | GET | List categories |
| `/store/collections` | GET | List collections |
| `/store/carts` | POST | Create cart |
| `/store/carts/:id` | GET | Get cart |
| `/store/carts/:id/line-items` | POST | Add item to cart |
| `/store/carts/:id/complete` | POST | Complete checkout |
| `/store/customers` | POST | Register customer |
| `/store/auth/customer/emailpass` | POST | Login customer |
| `/store/orders/:id` | GET | Get order |

### Admin API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/products` | GET/POST | List/Create products |
| `/admin/orders` | GET | List orders |
| `/admin/customers` | GET | List customers |
| `/admin/auth/user/emailpass` | POST | Admin login |

---

## Support & Resources

- 📚 [MedusaJS Documentation](https://docs.medusajs.com)
- 💬 [Discord Community](https://discord.gg/medusajs)
- 🐛 [GitHub Issues](https://github.com/medusajs/medusa/issues)
- 📹 [YouTube Tutorials](https://www.youtube.com/@MedusaJS)

---

*This guide was created for JewelryCommerce integration with MedusaJS v2*
