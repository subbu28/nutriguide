# 🚀 NutriGuide Deployment Checklist

Use this checklist to ensure a smooth deployment to Railway and Vercel.

---

## 📦 Pre-Deployment Preparation

### Code Readiness
- [ ] All features tested locally
- [ ] Database migrations created
- [ ] Environment variables documented
- [ ] No hardcoded secrets in code
- [ ] `.gitignore` includes `.env` files
- [ ] Code pushed to GitHub main branch

### API Keys & Accounts
- [ ] Railway account created
- [ ] Vercel account created
- [ ] Stripe account set up (live mode enabled)
- [ ] Google Gemini API key obtained
- [ ] Resend account created (for emails)
- [ ] GitHub repository is public or connected to Railway/Vercel

---

## 🚂 Railway Deployment (Backend)

### 1. Create Project
- [ ] New Railway project created
- [ ] GitHub repository connected
- [ ] Root directory set to `server`

### 2. Add Database
- [ ] PostgreSQL database added
- [ ] Database is healthy and running
- [ ] `DATABASE_URL` auto-injected

### 3. Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `LOG_LEVEL=info`
- [ ] `JWT_SECRET` (32+ chars, randomly generated)
- [ ] `COOKIE_SECRET` (32+ chars, randomly generated)
- [ ] `CORS_ORIGIN` (will update after Vercel)
- [ ] `STRIPE_SECRET_KEY` (sk_live_...)
- [ ] `STRIPE_WEBHOOK_SECRET` (whsec_...)
- [ ] `STRIPE_PRICE_ID` (price_...)
- [ ] `GEMINI_API_KEY`
- [ ] `RESEND_API_KEY` (re_...)
- [ ] `FROM_EMAIL` (noreply@yourdomain.com)
- [ ] `FRONTEND_URL` (will update after Vercel)
- [ ] `SPOONACULAR_API_KEY` (optional)

### 4. Deploy & Test
- [ ] Initial deployment successful
- [ ] Build logs checked (no errors)
- [ ] Custom domain generated
- [ ] Health endpoint works: `https://your-app.up.railway.app/health`
- [ ] Railway URL copied for Vercel setup

---

## ▲ Vercel Deployment (Frontend)

### 1. Import Project
- [ ] GitHub repository imported
- [ ] Framework detected as Vite
- [ ] Build settings verified

### 2. Environment Variables
- [ ] `VITE_API_URL=https://your-app.up.railway.app/api`
- [ ] `VITE_WS_URL=wss://your-app.up.railway.app`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` (pk_live_...)

### 3. Deploy & Test
- [ ] Initial deployment successful
- [ ] Build logs checked (no errors)
- [ ] Vercel URL copied
- [ ] Site loads correctly
- [ ] No console errors in browser

---

## 🔄 Post-Deployment Updates

### Update Railway with Vercel URL
- [ ] `CORS_ORIGIN` updated to Vercel URL
- [ ] `FRONTEND_URL` updated to Vercel URL
- [ ] Railway redeployed automatically
- [ ] CORS working (no errors in browser console)

---

## 💳 Stripe Configuration

### Webhook Setup
- [ ] Webhook endpoint created in Stripe dashboard
- [ ] URL: `https://your-app.up.railway.app/api/payments/webhook`
- [ ] Events selected:
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Webhook signing secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` updated in Railway
- [ ] Webhook tested in Stripe dashboard

### Product & Pricing
- [ ] Premium subscription product created
- [ ] Price ID copied
- [ ] `STRIPE_PRICE_ID` set in Railway
- [ ] Test payment completed successfully

---

## 📧 Email Configuration (Resend)

- [ ] Domain verified in Resend
- [ ] `FROM_EMAIL` matches verified domain
- [ ] Test email sent successfully
- [ ] Email templates reviewed

---

## 🧪 End-to-End Testing

### Authentication
- [ ] User registration works
- [ ] Email verification received
- [ ] Login works
- [ ] Logout works
- [ ] Password reset works

### Core Features
- [ ] Browse meals
- [ ] AI meal recommendations
- [ ] Search and filters
- [ ] Meal details modal
- [ ] Add to favorites
- [ ] Create meal plan
- [ ] View saved plans

### Family Features
- [ ] Create family group
- [ ] Generate invite code
- [ ] Join family with code
- [ ] Add family member
- [ ] Family chat (WebSocket)
- [ ] Create meal poll
- [ ] Vote on poll
- [ ] Share meal

### Premium Features
- [ ] View pricing page
- [ ] Upgrade to premium (test card)
- [ ] Payment successful
- [ ] Subscription active
- [ ] Premium features unlocked
- [ ] Manage payment methods
- [ ] Cancel subscription

### Additional Features
- [ ] Shopping list generation
- [ ] Meal history logging
- [ ] Nutrition dashboard
- [ ] User profile update
- [ ] Notifications working
- [ ] PWA install prompt

---

## 🔒 Security Checklist

- [ ] HTTPS enabled (automatic on Railway/Vercel)
- [ ] CORS restricted to Vercel domain
- [ ] JWT secrets are strong and unique
- [ ] No secrets in client-side code
- [ ] Stripe webhook signature verified
- [ ] SQL injection protected (Prisma ORM)
- [ ] XSS protection headers set
- [ ] Rate limiting considered (optional)

---

## 📊 Monitoring Setup

### Railway
- [ ] Deployment notifications enabled
- [ ] Error alerts configured
- [ ] Resource usage monitored

### Vercel
- [ ] Analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active

### External (Optional)
- [ ] Sentry for error tracking
- [ ] Google Analytics
- [ ] UptimeRobot for uptime monitoring

---

## 🌐 Custom Domain (Optional)

### Frontend (Vercel)
- [ ] Custom domain added
- [ ] DNS configured
- [ ] SSL certificate issued
- [ ] Domain verified

### Backend (Railway)
- [ ] API subdomain added (api.yourdomain.com)
- [ ] DNS configured
- [ ] SSL certificate issued
- [ ] Environment variables updated with new domain

---

## 📝 Documentation

- [ ] Deployment guide reviewed
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] User guide created
- [ ] Admin documentation written

---

## 🎉 Launch Preparation

### Pre-Launch
- [ ] All tests passing
- [ ] Performance optimized
- [ ] SEO meta tags added
- [ ] Social sharing images set
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Contact/support page created

### Launch Day
- [ ] Final smoke test
- [ ] Monitoring active
- [ ] Support channels ready
- [ ] Marketing materials prepared
- [ ] Social media posts scheduled
- [ ] Email announcement ready

---

## 🐛 Troubleshooting Quick Reference

### Backend Not Responding
```bash
# Check Railway logs
railway logs

# Verify database connection
railway run npx prisma db push

# Check environment variables
railway variables
```

### Frontend API Errors
```bash
# Verify VITE_API_URL is correct
# Should end with /api
# Example: https://your-app.up.railway.app/api

# Check browser console for CORS errors
# Verify CORS_ORIGIN in Railway matches Vercel URL
```

### Stripe Webhooks Failing
```bash
# Check webhook URL in Stripe dashboard
# Verify signing secret matches Railway env var
# Test webhook in Stripe dashboard
# Check Railway logs for webhook errors
```

---

## ✅ Deployment Complete!

Once all items are checked:

- [ ] **Frontend Live**: https://your-app.vercel.app
- [ ] **Backend Live**: https://your-app.up.railway.app
- [ ] **Database**: Running on Railway
- [ ] **Payments**: Stripe configured
- [ ] **Emails**: Resend configured
- [ ] **Monitoring**: Active
- [ ] **Documentation**: Complete

**Congratulations! NutriGuide is now live! 🎊**

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Fastify Docs**: https://www.fastify.io/docs

---

**Last Updated**: {{ DATE }}
**Deployment Version**: 1.0.0
