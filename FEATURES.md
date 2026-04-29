# NutriGuide - Complete Feature Specification & Monetization Strategy

## Executive Summary

NutriGuide is positioned as a comprehensive **AI-powered healthy meal discovery and family collaboration platform** with multiple revenue streams. This document outlines all features, identifies gaps, and defines the monetization strategy.

---

## 🎯 Core Value Propositions

1. **AI Meal Discovery** - Personalized meal recommendations using Gemini AI
2. **Family Collaboration** - Vote on meals, chat, share recipes
3. **Health Tracking** - Nutrition dashboard, meal history, calorie goals
4. **Meal Planning** - Weekly meal plans with shopping lists
5. **Social Discovery** - Community recipes, reviews, chef following

---

## 📊 Current State Analysis

### ✅ Already Configured
- Database schema (Prisma) with core entities
- Authentication system (JWT, email verification)
- Payment infrastructure (Stripe with subscriptions, coupons)
- PWA configuration (service worker, manifest)
- Docker setup for local development
- CI/CD pipeline (Cloud Build)

### ❌ Missing/Gaps Identified

#### Critical Gaps
1. **No Recipe Model** - Users can't create/share their own recipes
2. **No Social Features** - Can't follow users, no activity feed
3. **No Shopping List Model** - Schema missing dedicated shopping list entity
4. **No Meal History Model** - Missing nutrition tracking tables
5. **No Review System Implementation** - Schema has no Review model
6. **No AI Chat Interface** - No conversational meal planning
7. **No Ingredient Database** - No structured ingredient management

#### Feature Gaps
1. **No Recipe Scaling** - Can't adjust serving sizes
2. **No Nutrition Calculator** - Missing detailed nutrition analysis
3. **No Meal Prep Mode** - No batch cooking features
4. **No Dietitian Integration** - No expert consultations
5. **No Grocery Store Integration** - No price comparison
6. **No Voice Commands** - No hands-free cooking mode

---

## 🚀 New Features to Implement

### Phase 1: Core Foundation (MVP)

#### 1. Recipe Management System
```
- Create custom recipes with rich text editor
- Upload recipe photos (multiple per recipe)
- Recipe versioning (track changes)
- Recipe privacy (public/unlisted/private)
- Recipe categories and tags
- Difficulty levels and prep times
- Recipe scaling (auto-adjust ingredients)
- Recipe print view (PDF export)
- Recipe import from URL (scraper)
```

#### 2. Enhanced Social Features
```
- User profiles with activity stats
- Follow/unfollow users
- Activity feed (following tab + discover tab)
- Recipe collections (curated lists)
- Recipe remixing (fork recipes)
- Chef verification badges
- Recipe contests/challenges
```

#### 3. Shopping List System
```
- Auto-generate from meal plans
- Categorize by store section
- Check-off items while shopping
- Share lists with family members
- Save favorite lists as templates
- Integration with grocery delivery APIs
- Price tracking across stores
```

#### 4. Meal History & Nutrition
```
- Log consumed meals with portions
- Daily/weekly nutrition summaries
- Calorie and macro tracking
- Weight progress integration
- Nutrition goal setting
- Streak tracking for healthy eating
- Weekly reports with insights
```

### Phase 2: AI-Powered Features

#### 5. AI Meal Assistant
```
- Conversational interface for meal planning
- "What can I cook with [ingredients]?"
- "Suggest low-carb dinners"
- "Create a meal plan for weight loss"
- AI-generated shopping lists
- Smart substitutions ("I don't have eggs")
```

#### 6. Smart Recipe Recommendations
```
- "Because you liked X" suggestions
- Seasonal recipe recommendations
- Leftover utilization suggestions
- Dietary restriction learning
- Taste preference profiling
- Family preference aggregation
```

#### 7. AI Recipe Generator
```
- Generate recipes from ingredients photo
- Create recipes matching nutrition targets
- Cultural fusion recipe creation
- Dietary-specific recipe adaptation
```

### Phase 3: Advanced Features

#### 8. Meal Prep Mode
```
- Batch cooking planning
- Prep timeline generator
- Storage instructions
- Reheating guides
- Container labeling system
```

#### 9. Community Features
```
- Recipe challenges (monthly themes)
- Cooking clubs (scheduled cook-alongs)
- Video recipe support
- Live cooking streams
- Q&A with verified chefs
```

#### 10. Health Integrations
```
- Apple Health / Google Fit sync
- Fitness app integrations (MyFitnessPal, Cronometer)
- Smart scale integration
- Glucose monitor integration
- Doctor report sharing
```

---

## 💰 Monetization Strategy

### Revenue Streams

#### 1. Subscription Tiers

**Free Tier**
- Browse meals and recipes
- Save up to 50 favorites
- Join 1 family group
- Basic meal planning (1 week)
- Basic nutrition tracking
- Ads supported

**Premium - $9.99/month or $79.99/year**
- Unlimited favorites
- Unlimited family groups
- Advanced meal planning (4 weeks)
- AI meal assistant (100 queries/month)
- Shopping list generation
- Meal history analytics
- Nutrition dashboard
- No ads

**Family Premium - $14.99/month or $119.99/year**
- Everything in Premium
- Up to 6 family members
- Shared meal plans
- Collaborative shopping lists
- Family nutrition reports
- Priority support

**Pro Chef - $29.99/month**
- Everything in Family Premium
- Unlimited AI queries
- Recipe monetization (earn from views)
- Verified chef badge
- Analytics dashboard
- Featured recipe placement
- Early access to features

#### 2. One-Time Purchases
- Recipe packs (themed collections) - $4.99 each
- AI query packs (100 additional queries) - $4.99
- Custom meal plan generation - $9.99
- Nutrition consultation report - $19.99

#### 3. Affiliate Revenue
- Ingredient delivery partnerships (Instacart, Amazon Fresh)
- Kitchen equipment recommendations
- Cookware affiliate links
- Supplement recommendations

#### 4. B2B Revenue
- **NutriGuide for Dietitians** - $49/month per practitioner
- **NutriGuide for Gyms** - Custom pricing
- **Corporate Wellness** - $10/employee/year
- **API Access** - Usage-based pricing

### Pricing Psychology
- Annual plans save 33% (strong incentive)
- Free trial for 14 days (no credit card required)
- Student discount: 50% off
- Referral program: 1 month free per referral

---

## 🏗️ Technical Implementation

### New Database Models

```prisma
// Recipe System
model Recipe {
  id              String   @id @default(cuid())
  authorId        String
  title           String
  description     String?
  instructions    String
  prepTime        Int      // minutes
  cookTime        Int      // minutes
  servings        Int
  difficulty      Difficulty
  privacy         PrivacyLevel @default(PUBLIC)
  images          String[]
  videoUrl        String?
  tags            String[]
  cuisine         String?
  
  // Nutrition (per serving)
  calories        Float?
  protein         Float?
  carbs           Float?
  fat             Float?
  fiber           Float?
  
  // Engagement
  viewCount       Int      @default(0)
  likeCount       Int      @default(0)
  saveCount       Int      @default(0)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  author          User     @relation(fields: [authorId], references: [id])
  ingredients     RecipeIngredient[]
  reviews         Review[]
  collections     CollectionRecipe[]
}

model RecipeIngredient {
  id          String   @id @default(cuid())
  recipeId    String
  name        String
  amount      Float
  unit        String
  optional    Boolean  @default(false)
  notes       String?
  
  recipe      Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}

model Review {
  id          String   @id @default(cuid())
  recipeId    String
  userId      String
  rating      Int      // 1-5
  comment     String?
  images      String[]
  helpful     Int      @default(0)
  createdAt   DateTime @default(now())
  
  recipe      Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Social Features
model Follow {
  id          String   @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())
  
  @@unique([followerId, followingId])
}

model Collection {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  recipes     CollectionRecipe[]
}

// Shopping List
model ShoppingList {
  id          String   @id @default(cuid())
  userId      String
  name        String
  items       ShoppingItem[]
  isTemplate  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ShoppingItem {
  id          String   @id @default(cuid())
  listId      String
  name        String
  amount      Float?
  unit        String?
  category    String   // Produce, Dairy, etc.
  checked     Boolean  @default(false)
  notes       String?
}

// Meal History
model MealLog {
  id          String   @id @default(cuid())
  userId      String
  recipeId    String?
  mealName    String
  mealData    Json
  servings    Float    @default(1)
  mealSlot    MealSlot
  consumedAt  DateTime
  calories    Float?
  protein     Float?
  carbs       Float?
  fat         Float?
  mood        String?  // How did you feel?
  notes       String?
  createdAt   DateTime @default(now())
}
```

---

## 📈 Success Metrics

### Key Performance Indicators

**User Engagement**
- DAU/MAU ratio (target: 30%)
- Average session duration (target: 8+ minutes)
- Recipes saved per user (target: 10+)
- Meal plans created per month (target: 2+)

**Monetization**
- Free-to-paid conversion rate (target: 5%)
- Monthly recurring revenue (MRR)
- Average revenue per user (ARPU)
- Churn rate (target: <5% monthly)

**Content**
- User-generated recipes (target: 1000+ in first 6 months)
- Average recipe rating (target: 4.2+)
- Recipe reviews per recipe (target: 3+)

**Social**
- Family groups created (target: 500+ in first 3 months)
- Follows per active user (target: 5+)
- Recipes shared (target: 1000+ monthly)

---

## 🌍 Deployment Strategy

### Vercel (Frontend)
- Auto-deploy from main branch
- Preview deployments for PRs
- Edge network for global performance
- Analytics integration

### Railway (Backend)
- PostgreSQL database
- Auto-scaling based on load
- Environment variable management
- Custom domains with SSL

### Domain Setup
- Primary: nutriguide.app
- API: api.nutriguide.app
- CDN: cdn.nutriguide.app

---

## 📝 Content Strategy

### Launch Content
- 500+ curated recipes from TheMealDB
- 50+ AI-enhanced premium recipes
- 10 themed recipe collections
- 5 complete meal plans

### Content Generation Plan
- Weekly recipe drops (10 new recipes)
- Monthly themed challenges
- User recipe contests
- Seasonal collections

---

*Document Version: 1.0*
*Last Updated: 2026-03-18*
