#!/bin/bash
# ============================================
# JEWELRY COMMERCE - VPS DEPLOYMENT SCRIPT
# Run this on your VPS to deploy the Medusa backend
# ============================================

set -e  # Exit on any error

echo "🚀 Jewelry Commerce - Medusa Backend Deployment"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Please run as root or with sudo${NC}"
    exit 1
fi

# ============================================
# STEP 1: Install Dependencies
# ============================================
echo -e "\n${GREEN}Step 1: Installing dependencies...${NC}"

# Update system
apt update && apt upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    apt install docker-compose-plugin -y
fi

# Install other utilities
apt install -y git curl wget certbot

echo -e "${GREEN}✓ Dependencies installed${NC}"

# ============================================
# STEP 2: Clone Repository
# ============================================
echo -e "\n${GREEN}Step 2: Setting up project...${NC}"

PROJECT_DIR="/var/www/jewelry-medusa-backend"

if [ -d "$PROJECT_DIR" ]; then
    echo "Project directory exists, pulling latest changes..."
    cd $PROJECT_DIR
    git pull origin main
else
    echo "Cloning repository..."
    mkdir -p /var/www
    git clone https://github.com/YOUR_USERNAME/jewelry-medusa-backend.git $PROJECT_DIR
    cd $PROJECT_DIR
fi

echo -e "${GREEN}✓ Project ready${NC}"

# ============================================
# STEP 3: Configure Environment
# ============================================
echo -e "\n${GREEN}Step 3: Configuring environment...${NC}"

if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        cp .env.production .env
        echo -e "${YELLOW}⚠ Created .env from .env.production - PLEASE UPDATE WITH YOUR CREDENTIALS${NC}"
    else
        echo -e "${RED}✗ No .env.production file found. Please create .env manually.${NC}"
        exit 1
    fi
fi

# Generate secrets if not set
if grep -q "change_me" .env; then
    echo "Generating secure secrets..."
    JWT_SECRET=$(openssl rand -hex 32)
    COOKIE_SECRET=$(openssl rand -hex 32)
    POSTGRES_PASSWORD=$(openssl rand -hex 16)
    
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i "s/COOKIE_SECRET=.*/COOKIE_SECRET=$COOKIE_SECRET/" .env
    sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" .env
    
    echo -e "${GREEN}✓ Secure secrets generated${NC}"
fi

echo -e "${GREEN}✓ Environment configured${NC}"

# ============================================
# STEP 4: Setup SSL Certificates
# ============================================
echo -e "\n${GREEN}Step 4: Setting up SSL certificates...${NC}"

DOMAIN=${DOMAIN:-"api.jewelrycommerce.com"}
SSL_DIR="$PROJECT_DIR/nginx/ssl"

mkdir -p $SSL_DIR

if [ ! -f "$SSL_DIR/fullchain.pem" ]; then
    echo "Obtaining SSL certificate for $DOMAIN..."
    
    # Stop nginx if running (in case port 80 is in use)
    docker-compose down nginx 2>/dev/null || true
    
    certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos -m admin@jewelrycommerce.com
    
    # Copy certificates
    cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/
    cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/
    
    echo -e "${GREEN}✓ SSL certificates obtained${NC}"
else
    echo "SSL certificates already exist"
fi

# Setup auto-renewal
echo "0 0 1 * * root certbot renew --quiet && docker-compose restart nginx" > /etc/cron.d/certbot-renewal

echo -e "${GREEN}✓ SSL setup complete${NC}"

# ============================================
# STEP 5: Build and Start Services
# ============================================
echo -e "\n${GREEN}Step 5: Building and starting services...${NC}"

# Build images
docker compose build --no-cache

# Start services
docker compose up -d

echo -e "${GREEN}✓ Services started${NC}"

# ============================================
# STEP 6: Run Migrations
# ============================================
echo -e "\n${GREEN}Step 6: Running database migrations...${NC}"

# Wait for database to be ready
echo "Waiting for database..."
sleep 10

# Run migrations
docker compose exec -T medusa yarn medusa migrations run

echo -e "${GREEN}✓ Migrations complete${NC}"

# ============================================
# STEP 7: Create Admin User
# ============================================
echo -e "\n${GREEN}Step 7: Creating admin user...${NC}"

read -p "Enter admin email [admin@jewelrycommerce.com]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@jewelrycommerce.com}

read -sp "Enter admin password: " ADMIN_PASSWORD
echo ""

if [ -n "$ADMIN_PASSWORD" ]; then
    docker compose exec -T medusa yarn medusa user -e "$ADMIN_EMAIL" -p "$ADMIN_PASSWORD"
    echo -e "${GREEN}✓ Admin user created${NC}"
else
    echo -e "${YELLOW}⚠ Skipped admin user creation${NC}"
fi

# ============================================
# STEP 8: Seed Sample Data (Optional)
# ============================================
read -p "Would you like to seed sample data? [y/N]: " SEED_DATA
if [[ "$SEED_DATA" =~ ^[Yy]$ ]]; then
    docker compose exec -T medusa yarn seed
    echo -e "${GREEN}✓ Sample data seeded${NC}"
fi

# ============================================
# STEP 9: Setup Firewall
# ============================================
echo -e "\n${GREEN}Step 9: Configuring firewall...${NC}"

if command -v ufw &> /dev/null; then
    ufw allow 22/tcp   # SSH
    ufw allow 80/tcp   # HTTP
    ufw allow 443/tcp  # HTTPS
    ufw --force enable
    echo -e "${GREEN}✓ Firewall configured${NC}"
fi

# ============================================
# DEPLOYMENT COMPLETE
# ============================================
echo ""
echo "============================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "============================================"
echo ""
echo "Your Medusa backend is now running at:"
echo "  - API: https://$DOMAIN"
echo "  - Admin: https://$DOMAIN/app"
echo ""
echo "Services status:"
docker compose ps
echo ""
echo "Useful commands:"
echo "  - View logs: docker compose logs -f medusa"
echo "  - Restart: docker compose restart"
echo "  - Stop: docker compose down"
echo "  - Update: git pull && docker compose up -d --build"
echo ""
echo -e "${YELLOW}⚠ Remember to update your frontend VITE_MEDUSA_BACKEND_URL to https://$DOMAIN${NC}"
