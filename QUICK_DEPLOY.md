# 🚀 Quick Deploy Guide
## Get NutriGuide Live in 30 Minutes

This is the fastest path to deployment. For detailed instructions, see `DEPLOYMENT_GUIDE.md`.

---

## ⏱️ Timeline

- **Railway Setup**: 10 minutes
- **Vercel Setup**: 5 minutes
- **Stripe Setup**: 10 minutes
- **Testing**: 5 minutes
- **Total**: ~30 minutes

---

## 🎯 Step 1: Railway (Backend) - 10 min

### 1.1 Create Project (2 min)
1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select `nutriguide` repository
4. Railway will start building

### 1.2 Add Database (1 min)
1. Click "+ New" → "Database" → "PostgreSQL"
2. Wait for database to be ready (green checkmark)

### 1.3 Configure Service (2 min)
1. Click on your service (not database)
2. Settings → Root Directory → Set to: `server`
3. Click "Redeploy"

### 1.4 Add Environment Variables (5 min)
Click "Variables" tab and add these (copy from `server/ENV_PRODUCTION_TEMPLATE.md`):

**Critical Variables:**
```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
COOKIE_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
CORS_ORIGIN=https://your-app.vercel.app  # Update after Vercel
FRONTEND_URL=https://your-app.vercel.app  # Update after Vercel
GEMINI_API_KEY=<get from https://aistudio.google.com/app/apikey>
STRIPE_SECRET_KEY=<get from https://dashboard.stripe.com/apikeys>
STRIPE_PRICE_ID=<create product in Stripe first>
```

**Optional but Recommended:**
```bash
RESEND_API_KEY=<get from https://resend.com>
FROM_EMAIL=NutriGuide <noreply@yourdomain.com>
```

### 1.5 Get Railway URL
1. Settings → Networking → "Generate Domain"
2. **Copy this URL**: `https://your-app.up.railway.app`
3. Test health: Visit `https://your-app.up.railway.app/health`

---

## ▲ Step 2: Vercel (Frontend) - 5 min

### 2.1 Import Project (2 min)
1. Go to https://vercel.com/new
2. Import your `nutriguide` repository
3. Vercel auto-detects Vite

### 2.2 Add Environment Variables (2 min)
In "Environment Variables" section, add:

```bash
VITE_API_URL=https://your-app.up.railway.app/api
VITE_WS_URL=wss://your-app.up.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=<get from Stripe dashboard>
```

### 2.3 Deploy (1 min)
1. Click "Deploy"
2. Wait for build (~2 min)
3. **Copy Vercel URL**: `https://your-app.vercel.app`

---

## 🔄 Step 3: Update Railway CORS - 2 min

1. Go back to Railway
2. Update these variables with your Vercel URL:
   ```bash
   CORS_ORIGIN=https://your-app.vercel.app
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will auto-redeploy

---

## 💳 Step 4: Stripe Webhooks - 10 min

### 4.1 Create Product & Price (5 min)
1. Go to https://dashboard.stripe.com/products
2. Click "+ Add product"
3. Name: "NutriGuide Premium"
4. Price: $9.99/month (recurring)
5. **Copy Price ID** (starts with `price_`)
6. Add to Railway: `STRIPE_PRICE_ID=price_...`

### 4.2 Create Webhook (5 min)
1. Go to https://dashboard.stripe.com/webhooks
2. Click "+ Add endpoint"
3. URL: `https://your-app.up.railway.app/api/payments/webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. **Copy Signing Secret** (starts with `whsec_`)
7. Add to Railway: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## 🧪 Step 5: Test Everything - 5 min

### 5.1 Basic Test
1. Visit your Vercel URL
2. Register a new account
3. Browse meals
4. Create a family group

### 5.2 Payment Test
1. Go to Premium page
2. Click "Upgrade to Premium"
3. Use test card: `4242 4242 4242 4242`
4. Verify subscription activates

### 5.3 Verify Webhook
1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook
3. Check "Recent events" - should show successful deliveries

---

## ✅ Deployment Complete!

Your app is now live at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-app.up.railway.app

---

## 🐛 Quick Troubleshooting

### "Internal Server Error"
```bash
# Check Railway logs
# Most common: Missing environment variable
# Fix: Add missing variables in Railway
```

### "CORS Error" in Browser
```bash
# Verify CORS_ORIGIN in Railway matches Vercel URL exactly
CORS_ORIGIN=https://your-app.vercel.app  # No trailing slash!
```

### "Can't connect to database"
```bash
# Verify PostgreSQL is running in Railway
# Check: DATABASE_URL is set to ${{Postgres.DATABASE_URL}}
```

### Stripe Payment Fails
```bash
# Verify you're using LIVE keys (sk_live_... and pk_live_...)
# Check webhook secret matches
# Test webhook in Stripe dashboard
```

---

## 📚 Next Steps

1. ✅ **Add Custom Domain** (optional)
   - Vercel: Project Settings → Domains
   - Railway: Settings → Networking → Custom Domain

2. ✅ **Enable Monitoring**
   - Vercel Analytics
   - Railway Metrics
   - Consider Sentry for errors

3. ✅ **Set up Email**
   - Verify domain in Resend
   - Test email verification flow

4. ✅ **Launch Marketing**
   - Share on social media
   - Submit to product directories
   - Create blog post

---

## 🎉 Congratulations!

Your NutriGuide app is live and ready for users!

For detailed documentation, see:
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Comprehensive checklist
- `server/ENV_PRODUCTION_TEMPLATE.md` - Environment variables

**Need help?** Check the troubleshooting sections in the deployment guide.

---

**Deployed**: {{ DATE }}
**Version**: 1.0.0
