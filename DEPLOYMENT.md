# NutriGuide Deployment Guide

## Architecture Overview

```
┌─────────────────────┐     ┌─────────────────────┐
│      Vercel         │     │      Railway        │
│  ┌───────────────┐  │     │  ┌───────────────┐  │
│  │   Frontend    │  │────▶│  │   Backend     │  │
│  │  (React/Vite) │  │     │  │  (Fastify)    │  │
│  └───────────────┘  │     │  └───────┬───────┘  │
└─────────────────────┘     │          │          │
                            │  ┌───────▼───────┐  │
                            │  │   PostgreSQL  │  │
                            │  │   (Database)  │  │
                            │  └───────────────┘  │
                            └─────────────────────┘
```

---

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account & Project

1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Choose the `server` folder as the root directory

### 1.2 Add PostgreSQL Database

1. In your Railway project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway will automatically create and connect the database
3. The `DATABASE_URL` will be auto-injected

### 1.3 Configure Environment Variables

In Railway dashboard → Your service → **Variables** tab, add:

| Variable | Value |
|----------|-------|
| `PORT` | `3001` (Railway may override this) |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference) |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` |
| `COOKIE_SECRET` | Generate: `openssl rand -base64 32` |
| `CORS_ORIGIN` | `https://your-app.vercel.app` (update after Vercel deploy) |
| `FRONTEND_URL` | `https://your-app.vercel.app` (update after Vercel deploy) |
| `GEMINI_API_KEY` | Your Gemini API key |
| `STRIPE_SECRET_KEY` | Your Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Your Stripe webhook secret |
| `STRIPE_PRICE_ID` | Your Stripe price ID |

### 1.4 Configure Build Settings

Railway should auto-detect, but verify:
- **Root Directory**: `server`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma db push && npm start`

### 1.5 Deploy & Get URL

1. Click **"Deploy"**
2. Once deployed, go to **Settings** → **Networking** → **Generate Domain**
3. Copy your Railway URL (e.g., `https://nutriguide-server.up.railway.app`)

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account & Project

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository

### 2.2 Configure Build Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (root) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 2.3 Configure Environment Variables

In Vercel dashboard → **Settings** → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-railway-url.up.railway.app/api` |
| `VITE_WS_URL` | `wss://your-railway-url.up.railway.app` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` |

### 2.4 Deploy

1. Click **"Deploy"**
2. Copy your Vercel URL (e.g., `https://nutriguide.vercel.app`)

---

## Step 3: Update CORS Settings

After both are deployed, update Railway environment variables:

1. Go to Railway → Your service → **Variables**
2. Update `CORS_ORIGIN` to your Vercel URL
3. Update `FRONTEND_URL` to your Vercel URL
4. Redeploy the service

---

## Step 4: Configure Stripe Webhooks (Optional)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-railway-url.up.railway.app/api/payments/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.*`
4. Copy webhook secret to Railway's `STRIPE_WEBHOOK_SECRET`

---

## CLI Deployment (Alternative)

### Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Deploy from project root
cd /path/to/nutriguide
vercel

# Follow prompts, then for production:
vercel --prod
```

### Railway CLI

```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
cd /path/to/nutriguide/server
railway link

# Deploy
railway up
```

---

## Troubleshooting

### CORS Errors
- Verify `CORS_ORIGIN` in Railway matches your Vercel URL exactly
- Include protocol: `https://your-app.vercel.app` (no trailing slash)

### Database Connection Issues
- Check Railway logs for Prisma errors
- Ensure `DATABASE_URL` uses the Railway reference: `${{Postgres.DATABASE_URL}}`

### WebSocket Not Connecting
- Use `wss://` (not `ws://`) for production
- Railway supports WebSockets on the same port

### Build Failures
- Check Node.js version compatibility
- Ensure all dependencies are in `package.json`

---

## Environment Variables Checklist

### Railway (Backend)
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `COOKIE_SECRET`
- [ ] `CORS_ORIGIN`
- [ ] `FRONTEND_URL`
- [ ] `GEMINI_API_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `STRIPE_PRICE_ID`

### Vercel (Frontend)
- [ ] `VITE_API_URL`
- [ ] `VITE_WS_URL`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`

---

## Estimated Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Vercel** | 100GB bandwidth/mo | ~$20/mo Pro |
| **Railway** | $5 credit/mo | ~$5-20/mo usage |
| **Total** | Free for small apps | ~$10-40/mo |
