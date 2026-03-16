# NutriGuide Development Guide

Complete guide for setting up and running the NutriGuide application locally.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Running the Application](#running-the-application)
- [Stopping the Application](#stopping-the-application)
- [Database Management](#database-management)
- [API Keys Configuration](#api-keys-configuration)
- [Troubleshooting](#troubleshooting)
- [Useful Commands](#useful-commands)

---

## Prerequisites

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| Node.js | 18+ | `brew install node` or [nodejs.org](https://nodejs.org) |
| npm | 9+ | Comes with Node.js |
| Docker Desktop | Latest | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |

### Verify Installation

```bash
node --version    # Should show v18.x or higher
npm --version     # Should show 9.x or higher
docker --version  # Should show Docker version
```

---

## Quick Start

```bash
# 1. Clone and install dependencies
git clone <repository-url>
cd nutriguide
npm install
cd server && npm install && cd ..

# 2. Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your API keys

# 3. Start database (Docker must be running)
docker-compose up -d db

# 4. Run database migrations
cd server && npx prisma db push && cd ..

# 5. Start both servers (from project root: nutriguide/)
# Open TWO separate terminal windows

# Terminal 1 - Frontend (port 3000)
cd /Users/vm/Documents/Projects/nutriguide
npm run dev

# Terminal 2 - Backend (port 3001)
cd /Users/vm/Documents/Projects/nutriguide
npm run server:dev

# 6. Open browser
open http://localhost:3000
```

---

## Detailed Setup

### Step 1: Install Dependencies

**Root project (Frontend):**
```bash
cd nutriguide
npm install
```

**Server (Backend):**
```bash
cd server
npm install
```

### Step 2: Environment Configuration

1. Copy the example environment file:
```bash
cp server/.env.example server/.env
```

2. Edit `server/.env` with your values:
```env
# Required
DATABASE_URL="postgresql://nutriguide:nutriguide_dev_password@localhost:5555/nutriguide?schema=public"
JWT_SECRET=your-secret-key-min-32-characters-long
COOKIE_SECRET=your-cookie-secret-min-32-chars

# Optional API Keys (for enhanced features)
SPOONACULAR_API_KEY=your_spoonacular_key
GEMINI_API_KEY=your_gemini_key
```

### Step 3: Database Setup

**Start PostgreSQL with Docker:**
```bash
# Make sure Docker Desktop is running first!
docker-compose up -d db
```

**Run migrations:**
```bash
cd server
npx prisma db push
```

**Generate Prisma client:**
```bash
cd server
npx prisma generate
```

---

## Running the Application

### Option 1: Run Separately (Recommended for Development)

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
Server runs at: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd nutriguide  # root folder
npm run dev
```
Frontend runs at: `http://localhost:5173`

### Option 2: Run with Docker Compose (All Services)

```bash
docker-compose up
```
This starts: Database (5555), Backend (3001), Frontend (3000)

### Option 3: Run from Root

```bash
# From root folder
npm run dev           # Frontend only
npm run server:dev    # Backend only (if script exists)
```

---

## Stopping the Application

### Stop Development Servers

Press `Ctrl + C` in each terminal running a server.

### Stop Docker Database

```bash
docker-compose down        # Stop containers
docker-compose down -v     # Stop and remove volumes (deletes data!)
```

### Stop All Docker Containers

```bash
docker stop $(docker ps -q)
```

---

## Database Management

### Start Database
```bash
docker-compose up -d db
```

### Stop Database
```bash
docker-compose stop db
```

### View Database Logs
```bash
docker logs nutriguide-db
```

### Reset Database (Delete All Data)
```bash
docker-compose down -v
docker-compose up -d db
cd server && npx prisma db push
```

### Open Prisma Studio (Database GUI)
```bash
cd server
npx prisma studio
```
Opens at: `http://localhost:5555`

### Run Migrations
```bash
cd server
npx prisma db push        # Push schema changes
npx prisma migrate dev    # Create migration files
npx prisma generate       # Regenerate client
```

---

## API Keys Configuration

### Required vs Optional Keys

| Key | Required | Purpose |
|-----|----------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection |
| `JWT_SECRET` | ✅ Yes | Authentication tokens |
| `COOKIE_SECRET` | ✅ Yes | Session cookies |
| `SPOONACULAR_API_KEY` | ❌ Optional | Enhanced meal planning (500K+ recipes) |
| `GEMINI_API_KEY` | ❌ Optional | AI-powered meal recommendations |
| `STRIPE_*` | ❌ Optional | Payment processing |

### Getting API Keys

**Spoonacular:**
1. Go to [spoonacular.com/food-api](https://spoonacular.com/food-api)
2. Sign up for free (150 requests/day)
3. Copy API key to `SPOONACULAR_API_KEY`

**Gemini AI:**
1. Go to [ai.google.dev](https://ai.google.dev)
2. Create API key
3. Copy to `GEMINI_API_KEY`

---

## Troubleshooting

### Database Connection Errors

**Error:** `Can't reach database server at localhost:5555`

**Solution:**
1. Check Docker is running: `docker ps`
2. Start database: `docker-compose up -d db`
3. Wait 5 seconds, then retry

### Prisma Command Not Found

**Error:** `sh: prisma: command not found`

**Solution:** Use npx:
```bash
npx prisma db push
```

### Port Already in Use

**Error:** `Port 3001 is already in use`

**Solution:**
```bash
# Find process using the port
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Docker Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:** Open Docker Desktop application, wait for it to start.

### Module Not Found Errors

**Solution:** Reinstall dependencies:
```bash
rm -rf node_modules
rm -rf server/node_modules
npm install
cd server && npm install
```

### Spoonacular Not Showing in UI

**Solution:**
1. Verify `SPOONACULAR_API_KEY` is set in `server/.env`
2. Make sure line is NOT commented (no `#` at start)
3. Restart the backend server

---

## Useful Commands

### Development
```bash
npm run dev                    # Start frontend
npm run server:dev             # Start backend
npm run build                  # Build for production
npm run lint                   # Run linter
npm run test                   # Run tests
```

### Database
```bash
npx prisma db push             # Sync schema to database
npx prisma studio              # Open database GUI
npx prisma generate            # Generate Prisma client
npx prisma migrate reset       # Reset database completely
```

### Docker
```bash
docker-compose up -d db        # Start database only
docker-compose up              # Start all services
docker-compose down            # Stop all services
docker-compose logs -f db      # Follow database logs
docker ps                      # List running containers
```

### Cleanup
```bash
docker system prune            # Remove unused Docker data
rm -rf node_modules            # Remove dependencies
npm cache clean --force        # Clear npm cache
```

---

## Project Structure

```
nutriguide/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   ├── stores/             # Zustand state stores
│   └── lib/                # Utilities and API client
├── server/                 # Backend Fastify application
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── config/         # Configuration
│   ├── prisma/             # Database schema
│   └── .env                # Environment variables (not in git)
├── docker-compose.yml      # Docker services configuration
└── package.json            # Frontend dependencies
```

---

## Ports Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (Fastify) | 3001 | http://localhost:3001 |
| Database (PostgreSQL) | 5555 | localhost:5555 |
| Prisma Studio | 5555 | http://localhost:5555 |

---

## Need Help?

1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs: `docker logs nutriguide-db` or check terminal output
3. Ensure all prerequisites are installed
4. Verify environment variables are set correctly
