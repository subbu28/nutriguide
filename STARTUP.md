# NutriGuide - Startup Guide

## Prerequisites
- Node.js v20+ 
- Docker & Docker Compose
- PostgreSQL (via Docker)

---

## Quick Start (All Services)

```bash
# 1. Start database
docker-compose up -d db

# 2. Start backend (new terminal)
cd server && npm run dev

# 3. Start frontend (new terminal)
npm run dev
```

---

## Individual Services

### 1. Database (PostgreSQL)

```bash
# Start database only
docker-compose up -d db

# Check if running
docker ps

# View logs
docker-compose logs -f db

# Stop database
docker-compose down

# Reset database (delete all data)
docker-compose down -v
```

**Connection:** `localhost:5555`

---

### 2. Backend (Fastify API)

```bash
# Navigate to server directory
cd server

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Or build and run production
npm run build
npm start
```

**URL:** http://localhost:3001

**Database Commands:**
```bash
cd server

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

---

### 3. Frontend (React + Vite)

```bash
# From project root
cd /Users/vm/Documents/Projects/nutriguide

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**URL:** http://localhost:3000

---

## Docker Compose (Full Stack)

```bash
# Start all services (DB + Backend + Frontend)
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all
docker-compose down

# Rebuild and start
docker-compose up --build
```

---

## Sample Credentials

| Account | Email | Password |
|---------|-------|----------|
| Demo (Premium) | demo@nutriguide.com | password123 |
| John Smith | john@example.com | password123 |
| Jane Smith | jane@example.com | password123 |
| Mike Johnson | mike@example.com | password123 |

**Family Invite Codes:**
- The Smith Family: `SMITH123`
- Healthy Eaters Club: `HEALTH99`

---

## Environment Variables

### Backend (`server/.env`)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5555/nutriguide"
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
GEMINI_API_KEY="your-gemini-key"
RESEND_API_KEY="your-resend-key"
```

### Frontend (`.env`)
```env
VITE_API_URL="http://localhost:3001/api"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Database connection failed:**
```bash
# Ensure Docker is running
docker ps

# Restart database
docker-compose restart db
```

**Prisma client issues:**
```bash
cd server
rm -rf node_modules
npm install
npx prisma generate
```
