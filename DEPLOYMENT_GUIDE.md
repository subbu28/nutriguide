# NutriGuide Deployment Guide
## Railway (Backend) + Vercel (Frontend)

This guide will walk you through deploying NutriGuide to production.

---

## 📋 Prerequisites

Before deploying, ensure you have:
- [ ] GitHub account with NutriGuide repository
- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)
- [ ] Stripe account for payments
- [ ] Google Gemini API key
- [ ] Resend account for emails (optional but recommended)

---

## 🚂 Part 1: Deploy Backend to Railway

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `nutriguide` repository
5. Railway will detect the monorepo structure

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically create a database
4. Note: Railway will auto-inject `DATABASE_URL` into your backend service

### Step 3: Configure Backend Service

1. Click on your backend service
2. Go to **"Settings"** → **"Root Directory"**
3. Set root directory to: `server`
4. Go to **"Variables"** and add these environment variables:

```bash
# Auto-injected by Railway (don't add manually)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Required - Add these manually
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# JWT Secrets (generate strong random strings!)
JWT_SECRET=<generate-a-strong-random-32-char-string>
COOKIE_SECRET=<generate-a-strong-random-32-char-string>

# CORS - Will update after Vercel deployment
CORS_ORIGIN=https://your-app.vercel.app

# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID=price_your_premium_price_id

# Google Gemini AI (get from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key

# Email Service - Resend (get from https://resend.com)
RESEND_API_KEY=re_your_resend_api_key
FROM_EMAIL=NutriGuide <noreply@yourdomain.com>

# Frontend URL - Will update after Vercel deployment
FRONTEND_URL=https://your-app.vercel.app

# External APIs (optional)
SPOONACULAR_API_KEY=your_spoonacular_key
```

### Step 4: Generate Strong Secrets

Run these commands locally to generate secure secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate COOKIE_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Deploy Backend

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** in the Railway dashboard
3. Wait for build to complete (~3-5 minutes)
4. Once deployed, click **"Settings"** → **"Networking"**
5. Click **"Generate Domain"** to get your backend URL
6. **Copy this URL** - you'll need it for Vercel: `https://your-app.up.railway.app`

### Step 6: Add Health Check Endpoint

The backend already has a health check at `/health`. Verify it works:

```bash
curl https://your-app.up.railway.app/health
# Should return: {"status":"ok"}
```

---

## ▲ Part 2: Deploy Frontend to Vercel

### Step 1: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your `nutriguide` repository
4. Vercel will auto-detect it's a Vite project

### Step 2: Configure Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `./` (leave as root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

```bash
# Backend API URL (use your Railway URL from Step 5)
VITE_API_URL=https://your-app.up.railway.app/api

# WebSocket URL (same Railway URL but with wss://)
VITE_WS_URL=wss://your-app.up.railway.app

# Stripe Publishable Key (get from Stripe dashboard)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Once deployed, Vercel will give you a URL: `https://your-app.vercel.app`
4. **Copy this URL** - you need to update Railway with it

### Step 5: Update Railway CORS Settings

1. Go back to Railway
2. Update these environment variables with your Vercel URL:
   - `CORS_ORIGIN=https://your-app.vercel.app`
   - `FRONTEND_URL=https://your-app.vercel.app`
3. Railway will automatically redeploy

---

## 🔐 Part 3: Configure Stripe Webhooks

### Step 1: Create Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter your Railway URL: `https://your-app.up.railway.app/api/payments/webhook`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**

### Step 2: Get Webhook Secret

1. Click on your newly created webhook
2. Copy the **"Signing secret"** (starts with `whsec_`)
3. Add it to Railway as `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Part 4: Test Production Deployment

### Test Checklist

- [ ] Visit your Vercel URL: `https://your-app.vercel.app`
- [ ] Register a new account
- [ ] Verify email works (check spam folder)
- [ ] Browse meals
- [ ] Create a family group
- [ ] Test AI meal recommendations
- [ ] Try to upgrade to premium (use Stripe test card: 4242 4242 4242 4242)
- [ ] Verify payment webhook works
- [ ] Test WebSocket chat in family groups

### Test Stripe Payment

Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

---

## 🔧 Part 5: Post-Deployment Configuration

### Add Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `nutriguide.com`)
3. Follow DNS configuration instructions

**Railway:**
1. Go to Settings → Networking → Custom Domain
2. Add your API subdomain (e.g., `api.nutriguide.com`)
3. Update Vercel env vars with new domain

### Enable Production Mode Features

1. **Email Verification**: Ensure `RESEND_API_KEY` is set
2. **Error Tracking**: Add Sentry (optional)
3. **Analytics**: Add Vercel Analytics or Google Analytics
4. **Monitoring**: Set up Railway alerts for downtime

### Database Backups

Railway automatically backs up PostgreSQL, but you can also:
1. Go to Railway Database → Backups
2. Enable automated backups
3. Set backup retention period

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: 500 Internal Server Error
```bash
# Check Railway logs
railway logs --service backend

# Common fixes:
# 1. Verify DATABASE_URL is set correctly
# 2. Check Prisma migrations ran: npx prisma db push
# 3. Verify all required env vars are set
```

**Problem**: CORS errors
```bash
# Verify CORS_ORIGIN matches your Vercel URL exactly
# Include https:// and no trailing slash
CORS_ORIGIN=https://your-app.vercel.app
```

**Problem**: Database connection failed
```bash
# Railway auto-injects DATABASE_URL
# Make sure you're using: ${{Postgres.DATABASE_URL}}
# Not a hardcoded connection string
```

### Frontend Issues

**Problem**: API calls failing
```bash
# Check VITE_API_URL in Vercel
# Should be: https://your-app.up.railway.app/api
# NOT: https://your-app.up.railway.app (missing /api)
```

**Problem**: WebSocket not connecting
```bash
# Check VITE_WS_URL uses wss:// not ws://
VITE_WS_URL=wss://your-app.up.railway.app
```

**Problem**: Stripe not working
```bash
# Verify you're using LIVE keys in production
# pk_live_... for frontend
# sk_live_... for backend
```

### Stripe Webhook Issues

**Problem**: Webhooks not received
```bash
# 1. Check webhook URL is correct
# 2. Verify signing secret matches
# 3. Check Railway logs for webhook errors
# 4. Test webhook in Stripe dashboard
```

---

## 📊 Monitoring & Maintenance

### Railway Monitoring

1. Go to Railway project → Metrics
2. Monitor:
   - CPU usage
   - Memory usage
   - Request count
   - Error rate

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor:
   - Page views
   - Performance metrics
   - Error tracking

### Database Maintenance

```bash
# Connect to production database (be careful!)
railway connect Postgres

# Check database size
SELECT pg_size_pretty(pg_database_size('nutriguide'));

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🚀 Continuous Deployment

Both Railway and Vercel support automatic deployments:

### Automatic Deployments

1. **Push to main branch** → Auto-deploy to production
2. **Push to dev branch** → Create preview deployment (Vercel)
3. **Pull requests** → Create preview deployments

### Deployment Workflow

```bash
# Development
git checkout dev
git add .
git commit -m "Add new feature"
git push origin dev
# → Creates preview deployment on Vercel

# Production
git checkout main
git merge dev
git push origin main
# → Deploys to production on Railway + Vercel
```

---

## 📝 Environment Variables Checklist

### Railway (Backend)

```bash
✅ DATABASE_URL=${{Postgres.DATABASE_URL}}
✅ NODE_ENV=production
✅ PORT=3001
✅ LOG_LEVEL=info
✅ JWT_SECRET=<32-char-random-string>
✅ COOKIE_SECRET=<32-char-random-string>
✅ CORS_ORIGIN=https://your-app.vercel.app
✅ STRIPE_SECRET_KEY=sk_live_...
✅ STRIPE_WEBHOOK_SECRET=whsec_...
✅ STRIPE_PRICE_ID=price_...
✅ GEMINI_API_KEY=...
✅ RESEND_API_KEY=re_...
✅ FROM_EMAIL=NutriGuide <noreply@yourdomain.com>
✅ FRONTEND_URL=https://your-app.vercel.app
```

### Vercel (Frontend)

```bash
✅ VITE_API_URL=https://your-app.up.railway.app/api
✅ VITE_WS_URL=wss://your-app.up.railway.app
✅ VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🎉 Success!

Your NutriGuide application is now live! 

- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-app.up.railway.app
- **Admin**: https://dashboard.stripe.com (payments)

### Next Steps

1. Set up custom domain
2. Add error tracking (Sentry)
3. Enable email marketing (Resend campaigns)
4. Set up analytics (Google Analytics)
5. Create user documentation
6. Launch marketing campaign! 🚀

---

## 📞 Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Check Vercel deployment logs
3. Review this troubleshooting guide
4. Check Stripe webhook logs
5. Verify all environment variables are set correctly

Good luck with your launch! 🎊
