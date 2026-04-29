# Production Environment Variables Template
## Copy these to Railway Environment Variables

```bash
# ===========================================
# RAILWAY BACKEND ENVIRONMENT VARIABLES
# ===========================================

# Database (Auto-injected by Railway - DO NOT ADD MANUALLY)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Server Configuration
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Authentication Secrets (GENERATE STRONG RANDOM STRINGS!)
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=REPLACE_WITH_32_CHAR_RANDOM_STRING
COOKIE_SECRET=REPLACE_WITH_32_CHAR_RANDOM_STRING

# CORS & Frontend (UPDATE AFTER VERCEL DEPLOYMENT)
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app

# Stripe Payment Configuration
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRICE_ID=price_your_premium_subscription_price_id

# Google Gemini AI
# Get from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Email Service (Resend)
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_your_resend_api_key_here
FROM_EMAIL=NutriGuide <noreply@yourdomain.com>

# External Recipe APIs (Optional)
MEALDB_API_URL=https://www.themealdb.com/api/json/v1/1
MEALDB_API_KEY=1

# Spoonacular (Optional - 150 free calls/day)
# Get from: https://spoonacular.com/food-api/console#Dashboard
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
```

---

## How to Generate Secure Secrets

### JWT_SECRET and COOKIE_SECRET

Run this command locally to generate secure random strings:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate COOKIE_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it for `JWT_SECRET` and `COOKIE_SECRET`.

---

## Required vs Optional Variables

### ✅ REQUIRED (App won't work without these)
- `DATABASE_URL` (auto-injected by Railway)
- `NODE_ENV`
- `PORT`
- `JWT_SECRET`
- `COOKIE_SECRET`
- `CORS_ORIGIN`
- `FRONTEND_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `GEMINI_API_KEY`

### ⚠️ RECOMMENDED (Features won't work without these)
- `STRIPE_WEBHOOK_SECRET` (for subscription webhooks)
- `RESEND_API_KEY` (for email verification)
- `FROM_EMAIL` (for sending emails)

### 📦 OPTIONAL (Nice to have)
- `LOG_LEVEL` (defaults to 'info')
- `SPOONACULAR_API_KEY` (for enhanced recipes)
- `MEALDB_API_URL` (defaults to free tier)
- `MEALDB_API_KEY` (defaults to '1')

---

## Step-by-Step Setup in Railway

1. **Go to your Railway project**
2. **Click on your backend service**
3. **Go to "Variables" tab**
4. **Click "+ New Variable"**
5. **Add each variable from the template above**
6. **For `DATABASE_URL`, use**: `${{Postgres.DATABASE_URL}}`
7. **Click "Deploy"** to apply changes

---

## Verification

After setting all variables, verify they're loaded:

```bash
# In Railway, go to your service logs
# You should see: "Server listening on port 3001"
# No errors about missing environment variables
```

---

## Security Notes

⚠️ **NEVER commit these values to Git!**
⚠️ **Use strong, unique secrets for production**
⚠️ **Rotate secrets regularly**
⚠️ **Use Stripe LIVE keys (sk_live_...) not test keys**
⚠️ **Verify CORS_ORIGIN matches your Vercel URL exactly**

---

## Troubleshooting

### "Missing environment variable" error
- Check variable name spelling
- Ensure no extra spaces
- Verify variable is set in Railway

### "Database connection failed"
- Verify `DATABASE_URL` is set to `${{Postgres.DATABASE_URL}}`
- Check PostgreSQL service is running
- Verify database is healthy in Railway

### "CORS error" in browser
- Verify `CORS_ORIGIN` matches Vercel URL exactly
- Include `https://` and no trailing slash
- Redeploy after changing CORS_ORIGIN

---

Last Updated: 2026-04-18
