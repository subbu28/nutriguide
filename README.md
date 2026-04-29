# 🥗 NutriGuide - Healthy Meal Discovery Platform

A production-ready, enterprise-grade meal planning and family collaboration platform powered by Gemini AI. Built with React, Fastify, PostgreSQL, and deployed on Google Cloud Run.

## ✨ Features

### Core Features
- **AI-Powered Meal Discovery** - Get personalized healthy meal recommendations using Gemini AI
- **Smart Search & Filtering** - Filter by meal category (Breakfast, Lunch, Dinner, Juices) and diet type (Vegetarian, Non-Veg)
- **Detailed Nutrition Info** - Calories, protein, health benefits, and cooking instructions

### User Features
- **User Authentication** - Secure JWT-based registration and login
- **My Favorites** - Save and organize your favorite meals
- **Premium Subscription** - Stripe-powered premium features

### Family Collaboration
- **Family Groups** - Create or join family groups with invite codes
- **Meal Voting** - Vote on what to cook for breakfast, lunch, or dinner
- **Real-time Chat** - WebSocket-powered family chat with meal sharing
- **Smart Notifications** - Get notified about polls, votes, and messages

### Technical Features
- **PWA Support** - Install as a native app, works offline
- **Real-time Updates** - WebSocket for instant notifications
- **Scalable Architecture** - Microservices-ready with Docker & Cloud Run

## 🏗️ Architecture

```
nutriguide/
├── src/                    # React Frontend (Vite + TypeScript)
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route pages
│   ├── stores/             # Zustand state management
│   ├── lib/                # API client & utilities
│   └── types/              # TypeScript types
├── server/                 # Fastify Backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── websocket/      # Real-time WebSocket handler
│   │   ├── lib/            # Prisma client & utilities
│   │   └── config/         # Environment configuration
│   └── prisma/             # Database schema & migrations
├── public/                 # Static assets & PWA files
└── docker-compose.yml      # Local development setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or use Docker)
- Gemini API Key
- Stripe Account (for payments)

### Local Development

1. **Clone and install dependencies**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Set up environment variables**
   ```bash
   # Frontend (.env)
   cp .env.example .env
   
   # Backend (server/.env)
   cp server/.env.example server/.env
   ```

3. **Start PostgreSQL (via Docker)**
   ```bash
   docker-compose up db -d
   ```

4. **Initialize the database**
   ```bash
   cd server
   npm run db:push
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Backend
   cd server && npm run dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

6. **Open the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Using Docker Compose (Full Stack)

```bash
# Start all services (DB, API, Web)
docker-compose up

# Or run in background
docker-compose up -d
```

## 🔧 Environment Variables

### Frontend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Backend (server/.env)
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/nutriguide
JWT_SECRET=your-secret-key
COOKIE_SECRET=your-cookie-secret
CORS_ORIGIN=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx
FRONTEND_URL=http://localhost:3000
```

## 📦 Deployment to Google Cloud Run

### Prerequisites
- Google Cloud Project with billing enabled
- Cloud Run API enabled
- Cloud Build API enabled
- Secret Manager for sensitive data

### Deploy with Cloud Build

1. **Create secrets in Secret Manager**
   ```bash
   gcloud secrets create nutriguide-db-url --data-file=-
   gcloud secrets create nutriguide-jwt-secret --data-file=-
   gcloud secrets create nutriguide-stripe-key --data-file=-
   gcloud secrets create nutriguide-gemini-key --data-file=-
   ```

2. **Deploy using Cloud Build**
   ```bash
   gcloud builds submit --config=cloudbuild.yaml
   ```

3. **Set up Cloud SQL (PostgreSQL)**
   ```bash
   gcloud sql instances create nutriguide-db \
     --database-version=POSTGRES_15 \
     --tier=db-f1-micro \
     --region=us-central1
   ```

### Manual Docker Deployment

```bash
# Build and push backend
docker build -t gcr.io/PROJECT_ID/nutriguide-api -f server/Dockerfile server/
docker push gcr.io/PROJECT_ID/nutriguide-api

# Build and push frontend
docker build -t gcr.io/PROJECT_ID/nutriguide-web .
docker push gcr.io/PROJECT_ID/nutriguide-web

# Deploy to Cloud Run
gcloud run deploy nutriguide-api --image gcr.io/PROJECT_ID/nutriguide-api
gcloud run deploy nutriguide-web --image gcr.io/PROJECT_ID/nutriguide-web
```

## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Meals
- `GET /api/meals` - Get meals by category & diet type
- `GET /api/meals/search` - Search meals

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:mealId` - Remove from favorites

### Family
- `GET /api/family` - Get user's families
- `POST /api/family` - Create family
- `POST /api/family/join` - Join family with invite code
- `GET /api/family/:id` - Get family details

### Polls
- `GET /api/polls/family/:familyId` - Get active polls
- `POST /api/polls` - Create meal poll
- `POST /api/polls/:id/suggest` - Suggest a meal
- `POST /api/polls/:id/vote/:suggestionId` - Vote for meal

### Payments
- `POST /api/payments/create-checkout-session` - Start subscription
- `GET /api/payments/subscription` - Get subscription status

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router** - Navigation
- **Zustand** - State Management
- **TailwindCSS** - Styling
- **Lucide Icons** - Icons
- **Motion** - Animations

### Backend
- **Fastify** - Web Framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **WebSocket** - Real-time
- **Stripe** - Payments
- **Zod** - Validation

### Infrastructure
- **Docker** - Containerization
- **Google Cloud Run** - Serverless Deployment
- **Cloud Build** - CI/CD
- **Cloud SQL** - Managed PostgreSQL

## 📄 License

Apache-2.0 License - See LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---




✅ How to Improve Deliverability
For Production (Custom Domain)
When you deploy and use your own domain (ynutriguide.space):

Verify Domain in Resend
Add SPF, DKIM, and DMARC records
This authenticates your emails
Warm Up Your Domain
Start with low volume
Gradually increase sending
Builds sender reputation
Best Practices
Include unsubscribe link
Add physical address in footer
Avoid spam trigger words
Keep good text-to-image ratio
For Now (Testing)
Tell users to:

Check spam folder
Mark email as "Not Spam"
Add sender to contacts
This trains their email filter
