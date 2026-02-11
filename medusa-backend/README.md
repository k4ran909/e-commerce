# 💎 Jewelry Commerce - Medusa Backend

Production-ready MedusaJS v2 backend for the Jewelry Commerce e-commerce platform.

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20+ (LTS)
- **PostgreSQL** 14+ (or use Docker)
- **Redis** 6+ (optional for development, required for production)

### Local Development

```bash
# 1. Install dependencies
yarn install

# 2. Start PostgreSQL (using Docker)
docker run -d --name jewelry-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=jewelry_commerce_db \
  -p 5432:5432 \
  postgres:16-alpine

# 3. Start Redis (optional for development)
docker run -d --name jewelry-redis -p 6379:6379 redis:7-alpine

# 4. Run database migrations
yarn medusa migrations run

# 5. Seed sample data (optional)
yarn seed

# 6. Create admin user
yarn medusa user -e admin@example.com -p your_password

# 7. Start development server
yarn dev
```

**Server URLs:**
- 🌐 **API**: http://localhost:9000
- 🎛️ **Admin Dashboard**: http://localhost:9000/app

---

## 📁 Project Structure

```
jewelry-medusa-backend/
├── src/
│   ├── admin/           # Admin dashboard customizations
│   ├── api/             # Custom API routes
│   ├── jobs/            # Scheduled jobs
│   ├── links/           # Module links
│   ├── modules/         # Custom modules
│   ├── scripts/         # CLI scripts
│   ├── subscribers/     # Event subscribers
│   └── workflows/       # Custom workflows
├── nginx/               # Nginx configuration
├── scripts/             # Deployment scripts
├── docker-compose.yml   # Docker stack
├── Dockerfile           # Production Docker image
├── medusa-config.ts     # Medusa configuration
└── .env                 # Environment variables
```

---

## ⚙️ Configuration

### Environment Variables

Copy `.env.template` to `.env` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | Production |
| `JWT_SECRET` | JWT signing secret (32+ chars) | ✅ |
| `COOKIE_SECRET` | Cookie signing secret (32+ chars) | ✅ |
| `STORE_CORS` | Frontend URLs (comma-separated) | ✅ |
| `ADMIN_CORS` | Admin URLs (comma-separated) | ✅ |
| `STRIPE_API_KEY` | Stripe secret key | For payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | For payments |

### Generate Secure Secrets

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 💳 Payment Integration

### Stripe Setup

1. Get API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Add to `.env`:
   ```env
   STRIPE_API_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
3. In Admin Dashboard → Settings → Regions → Add Stripe as payment provider

### Webhook Setup

Configure webhook in Stripe Dashboard:
- **Endpoint URL**: `https://your-domain.com/hooks/payment/stripe`
- **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## 🐳 Docker Deployment

### Quick Deploy

```bash
# Start all services
docker compose up -d

# Run migrations
docker compose exec medusa yarn medusa migrations run

# Create admin user
docker compose exec medusa yarn medusa user -e admin@example.com -p password

# View logs
docker compose logs -f medusa
```

### Production with Separate Worker

```bash
docker compose --profile production up -d
```

### With Nginx

```bash
docker compose --profile with-nginx up -d
```

---

## 🖥️ VPS Deployment

### One-Command Deploy

```bash
# SSH into your VPS as root
ssh root@your-server-ip

# Clone repository
git clone https://github.com/your-username/jewelry-medusa-backend.git /var/www/jewelry-medusa-backend
cd /var/www/jewelry-medusa-backend

# Make script executable and run
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Manual Steps

1. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```

2. **Clone & Configure**
   ```bash
   git clone ... /var/www/jewelry-medusa-backend
   cd /var/www/jewelry-medusa-backend
   cp .env.production .env
   # Edit .env with your values
   ```

3. **Generate SSL Certificate**
   ```bash
   certbot certonly --standalone -d api.yourdomain.com
   cp /etc/letsencrypt/live/api.yourdomain.com/*.pem nginx/ssl/
   ```

4. **Start Services**
   ```bash
   docker compose --profile with-nginx up -d
   docker compose exec medusa yarn medusa migrations run
   docker compose exec medusa yarn medusa user -e admin@example.com -p password
   ```

---

## 🔌 API Reference

### Store APIs (Customer-facing)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/store/products` | GET | List products |
| `/store/products/:id` | GET | Get product |
| `/store/product-categories` | GET | List categories |
| `/store/collections` | GET | List collections |
| `/store/carts` | POST | Create cart |
| `/store/carts/:id` | GET/POST | Get/Update cart |
| `/store/carts/:id/line-items` | POST | Add item to cart |
| `/store/carts/:id/complete` | POST | Complete checkout |
| `/store/customers` | POST | Register customer |
| `/store/auth/customer/emailpass` | POST | Login |

### Admin APIs

All admin endpoints require authentication and are prefixed with `/admin`.

---

## 🔒 Security

### Production Checklist

- [ ] Strong `JWT_SECRET` and `COOKIE_SECRET` (32+ random chars)
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS restricted to your domains only
- [ ] Rate limiting enabled (via Nginx or Cloudflare)
- [ ] Database access restricted to internal network
- [ ] Redis protected with password (in production)
- [ ] Regular backups configured
- [ ] Monitoring and alerting set up

---

## 📊 Monitoring

### Health Check

```bash
curl https://your-domain.com/health
```

### Logs

```bash
# All services
docker compose logs -f

# Medusa only
docker compose logs -f medusa

# Last 100 lines
docker compose logs --tail=100 medusa
```

---

## 🔄 Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Run any new migrations
docker compose exec medusa yarn medusa migrations run
```

---

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Connect to database
docker compose exec postgres psql -U jewelry_admin -d jewelry_commerce_db
```

### Redis Connection Issues

```bash
# Check Redis is running
docker compose exec redis redis-cli ping
# Should return: PONG
```

### Container Issues

```bash
# Restart all services
docker compose restart

# Rebuild from scratch
docker compose down -v
docker compose up -d --build
```

---

## 📞 Support

- 📚 [MedusaJS Documentation](https://docs.medusajs.com)
- 💬 [Discord Community](https://discord.gg/medusajs)
- 🐛 [GitHub Issues](https://github.com/medusajs/medusa/issues)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
