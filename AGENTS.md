# NutriGuide - Agent Development Guide

This document provides essential information for AI coding agents working on the NutriGuide project.

## Project Overview

**NutriGuide** is a healthy meal discovery platform with AI-powered recommendations, family collaboration features, and premium subscription support. It's built as a full-stack TypeScript application with a React frontend and Fastify backend.

### Core Features
- **AI-Powered Meal Discovery** - Personalized meal recommendations using Google Gemini AI
- **Smart Search & Filtering** - Filter by meal category (Breakfast, Lunch, Dinner, Juices) and diet type
- **Family Groups** - Create/join families with invite codes, manage roles (OWNER/ADMIN/MEMBER)
- **Meal Voting Polls** - Vote on what to cook for different meals
- **Real-time Chat** - WebSocket-powered family chat with meal sharing
- **Favorites & Meal Planning** - Save meals and create weekly meal plans
- **Shopping Lists** - Generate shopping lists from meal plans
- **Meal History** - Track consumed meals with nutrition stats
- **Nutrition Dashboard** - Visualize nutrition intake over time
- **Premium Subscriptions** - Stripe-powered premium features with coupons
- **PWA Support** - Installable app with offline functionality

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI Framework |
| TypeScript | 5.8 | Type Safety |
| Vite | 6 | Build tool with HMR |
| React Router | 6 | Client-side routing |
| Zustand | 4 | State management with persist middleware |
| TailwindCSS | 4 | Utility-first styling (CSS-based config) |
| Motion | 12 | Animation library |
| Lucide React | 0.546 | Icon library |
| @stripe/react-stripe-js | 5.6 | Payment integration |
| vite-plugin-pwa | 0.20 | PWA support |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Fastify | 4 | Web framework |
| Prisma | 5 | ORM with PostgreSQL |
| @fastify/jwt | 8 | JWT authentication |
| @fastify/websocket | 10 | WebSocket support |
| @fastify/cors | 9 | CORS handling |
| @fastify/cookie | 9 | Cookie support |
| bcryptjs | 2.4 | Password hashing (12 rounds) |
| Zod | 3.23 | Schema validation |
| Stripe | 15 | Payment processing |
| Resend | 6.9 | Email service |
| @google/genai | 1.29 | Gemini AI integration |

### Database
- **PostgreSQL** 16 - Primary database
- **Prisma Client** - Database access
- **Prisma Studio** - Database GUI (`npm run db:studio`)

### External APIs
- **Google Gemini AI** (`@google/genai`) - AI meal recommendations
- **TheMealDB** - Free recipe database (default)
- **Spoonacular** - Enhanced recipes (optional, 150 free calls/day)

### Infrastructure
- **Docker & Docker Compose** - Local development
- **Google Cloud Run** - Primary deployment target
- **Cloud Build** - CI/CD pipeline
- **Nginx** - Frontend production server
- **Vercel + Railway** - Alternative deployment option

---

## Project Structure

```
nutriguide/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── Layout.tsx            # Main layout wrapper
│   │   ├── MealCard.tsx          # Meal display card
│   │   ├── ProtectedRoute.tsx    # Auth guard component
│   │   ├── ErrorBoundary.tsx     # Error handling
│   │   ├── SearchFilters.tsx     # Meal filtering UI
│   │   ├── RecipeDetailModal.tsx # Recipe details modal
│   │   ├── ReviewCard.tsx        # User review display
│   │   ├── ShoppingList.tsx      # Shopping list component
│   │   ├── PWAInstallPrompt.tsx  # PWA install UI
│   │   ├── OfflineIndicator.tsx  # Offline status indicator
│   │   └── ...
│   ├── pages/                    # Route-level pages
│   │   ├── Home.tsx              # Browse meals (main page)
│   │   ├── Auth.tsx              # Login/register
│   │   ├── Family.tsx            # Family management
│   │   ├── Favorites.tsx         # Saved meals
│   │   ├── MealPlanner.tsx       # Meal planning
│   │   ├── MealHistory.tsx       # Consumed meals log
│   │   ├── NutritionDashboard.tsx # Nutrition stats
│   │   ├── ShoppingListPage.tsx  # Shopping list page
│   │   ├── Premium.tsx           # Premium subscription
│   │   ├── PaymentMethods.tsx    # Saved payment methods
│   │   ├── Settings.tsx          # User settings
│   │   ├── Profile.tsx           # User profile
│   │   ├── Notifications.tsx     # User notifications
│   │   └── VerifyEmail.tsx       # Email verification
│   ├── stores/                   # Zustand state stores
│   │   ├── authStore.ts          # Auth state (persisted)
│   │   ├── familyStore.ts        # Family state
│   │   ├── mealsStore.ts         # Meals browsing state
│   │   ├── mealHistoryStore.ts   # Meal logging state
│   │   ├── notificationStore.ts  # Notifications state
│   │   ├── reviewsStore.ts       # Reviews state
│   │   ├── searchStore.ts        # Search state
│   │   └── shoppingListStore.ts  # Shopping list state
│   ├── lib/                      # Utilities & API
│   │   ├── api.ts                # API client (singleton pattern)
│   │   ├── websocket.ts          # WebSocket client
│   │   ├── logger.ts             # Application logging
│   │   ├── fp.ts                 # Functional programming utilities
│   │   └── reactive.ts           # Reactive state utilities
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAsync.ts           # Async operation handling
│   │   ├── useDataFetching.ts    # Data fetching hook
│   │   ├── usePWA.ts             # PWA-related hook
│   │   ├── useTextToSpeech.ts    # TTS functionality
│   │   └── useObservable.ts      # Observable pattern hook
│   ├── services/                 # External service integrations
│   │   └── geminiService.ts      # Gemini AI wrapper
│   ├── types/                    # TypeScript type definitions
│   │   ├── index.ts              # Core types
│   │   ├── search.ts             # Search-related types
│   │   ├── reviews.ts            # Review types
│   │   ├── shopping.ts           # Shopping list types
│   │   └── mealHistory.ts        # Meal history types
│   ├── index.css                 # Tailwind v4 CSS configuration
│   ├── main.tsx                  # App entry point
│   └── App.tsx                   # Root component with routes
│
├── server/                       # Backend Fastify application
│   ├── src/
│   │   ├── routes/               # API route handlers
│   │   │   ├── auth.ts           # Authentication endpoints
│   │   │   ├── meals.ts          # Meal data endpoints
│   │   │   ├── favorites.ts      # Favorites management
│   │   │   ├── family.ts         # Family management
│   │   │   ├── polls.ts          # Meal voting polls
│   │   │   ├── chat.ts           # Chat messages
│   │   │   ├── payments.ts       # Stripe payments
│   │   │   ├── payment-methods.ts # Saved payment methods
│   │   │   ├── coupons.ts        # Coupon system
│   │   │   ├── notifications.ts  # User notifications
│   │   │   ├── profile.ts        # User profile
│   │   │   └── mealplanner.ts    # Meal planning
│   │   ├── services/             # Business logic layer
│   │   │   ├── auth.service.ts
│   │   │   ├── base.service.ts
│   │   │   ├── meal-planner.ts
│   │   │   ├── mealdb.ts
│   │   │   ├── spoonacular.ts
│   │   │   ├── nutrition-calculator.ts
│   │   │   └── email.service.ts
│   │   ├── repositories/         # Data access layer
│   │   │   ├── base.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   └── index.ts
│   │   ├── websocket/            # WebSocket handlers
│   │   │   └── index.ts
│   │   ├── middleware/           # Fastify middleware
│   │   │   ├── logging.middleware.ts
│   │   │   └── index.ts
│   │   ├── config/               # Environment configuration
│   │   │   ├── index.ts          # Main config
│   │   │   └── external-apis.ts
│   │   ├── lib/                  # Shared utilities
│   │   │   ├── prisma.ts         # Prisma client singleton
│   │   │   └── logger.ts         # Pino logger
│   │   ├── utils/                # Helper utilities
│   │   │   ├── result.ts         # Result pattern
│   │   │   ├── option.ts         # Option pattern
│   │   │   ├── pipe.ts           # Pipe utility
│   │   │   └── index.ts
│   │   ├── types/                # TypeScript declarations
│   │   │   └── fastify.d.ts
│   │   └── index.ts              # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── seed.ts               # Seed data
│   ├── package.json              # Backend dependencies
│   └── Dockerfile                # Backend container
│
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icons/                    # PWA icons
│
├── docker-compose.yml            # Local development stack
├── cloudbuild.yaml               # GCP CI/CD configuration
├── vercel.json                   # Vercel deployment config
├── nginx.conf                    # Production nginx config
├── Dockerfile                    # Frontend production container
├── Dockerfile.dev                # Frontend development container
├── vite.config.ts                # Vite configuration with PWA
├── tsconfig.json                 # TypeScript config
└── package.json                  # Frontend dependencies
```

---

## Development Commands

### Frontend (Root Directory)
```bash
# Development
npm run dev              # Start dev server (port 3000, host 0.0.0.0)

# Building
npm run build            # Build for production (outputs to dist/)
npm run preview          # Preview production build
npm run clean            # Remove dist folder

# Type Checking
npm run lint             # TypeScript check (tsc --noEmit)
```

### Backend (server/ Directory)
```bash
# Development
npm run dev              # Start with hot reload (tsx watch)

# Building
npm run build            # Compile TypeScript to dist/
npm run start            # Run compiled code (production)

# Database
npm run db:push          # Push schema changes to database (dev)
npm run db:migrate       # Create migration files
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio GUI (port 5555)
npm run db:seed          # Run seed script
```

### Full Stack (Docker)
```bash
# Database only
docker-compose up -d db

# Full stack (DB + API + Web)
docker-compose up

# Stop and reset
docker-compose down -v   # Stop and remove volumes (reset data)
```

### Quick Commands (Root)
```bash
npm run server:dev       # Start backend dev server
npm run server:build     # Build backend
npm run db:push          # Push database schema
npm run db:migrate       # Create migrations
```

---

## Environment Configuration

### Frontend (.env)
```env
# Required
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001

# Optional
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
GEMINI_API_KEY=xxx                    # Build-time injection
```

### Backend (server/.env)
```env
# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# Database (Required)
DATABASE_URL=postgresql://user:pass@localhost:5555/nutriguide

# Authentication (Required - min 32 chars)
JWT_SECRET=minimum-32-characters-long-jwt-secret
COOKIE_SECRET=minimum-32-characters-long-cookie-secret

# CORS (Required)
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# External Services (Optional)
GEMINI_API_KEY=xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx
RESEND_API_KEY=re_xxx

# Recipe APIs
MEALDB_API_URL=https://www.themealdb.com/api/json/v1/1
MEALDB_API_KEY=1
SPOONACULAR_API_KEY=xxx
```

---

## Database Schema

Key entities in `server/prisma/schema.prisma`:

| Entity | Description |
|--------|-------------|
| **User** | Authentication, profile, premium status, email verification |
| **UserSettings** | Dietary preferences, allergies, notification settings, theme |
| **Family** | Family groups with auto-generated invite codes |
| **FamilyMember** | Many-to-many with roles (OWNER/ADMIN/MEMBER) |
| **Favorite** | Saved meals (stores mealData as JSON) |
| **MealPoll** | Voting polls for meal categories (BREAKFAST/LUNCH/DINNER/JUICES) |
| **MealSuggestion** | Suggested meals in polls |
| **Vote** | User votes on suggestions (unique per user per poll) |
| **Message** | Family chat messages with types (TEXT/MEAL_SHARE/POLL_CREATED/POLL_RESULT/MEMBER_JOINED) |
| **Notification** | User notifications with types and read status |
| **Subscription** | Stripe subscription tracking |
| **Payment** | Payment history |
| **Coupon** | Discount codes (PERCENTAGE/FIXED_AMOUNT) |
| **PaymentMethod** | Saved Stripe payment methods |
| **MealPlan** | User meal plans with date ranges |
| **PlannedMeal** | Individual meals in a plan (BREAKFAST/LUNCH/DINNER/SNACK) |

### Database Commands
```bash
# After schema changes
cd server && npm run db:push     # Dev: push changes directly
cd server && npm run db:migrate  # Prod: create migration files

# View data
cd server && npm run db:studio   # Open Prisma Studio
```

---

## Code Style Guidelines

### TypeScript Configuration
- **Target**: ES2022
- **Module**: ESNext with `"type": "module"`
- **Module Resolution**: bundler
- **JSX**: react-jsx
- **Strict mode enabled** - No implicit any

### Path Aliases
- **Frontend**: `@/` maps to `src/`
- **Backend**: `@/` maps to project root

### Import Conventions
```typescript
// Frontend - use @/ alias
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

// Backend - use .js extensions for ESM
import { prisma } from '../lib/prisma.js';
import { config } from './config/index.js';
```

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MealCard.tsx`, `ProtectedRoute.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `usePWA.ts` |
| Stores | camelCase with `Store` suffix | `authStore.ts`, `familyStore.ts` |
| API Routes | kebab-case | `payment-methods.ts`, `mealplanner.ts` |
| Services | camelCase | `email.service.ts` |
| Utilities | camelCase | `result.ts`, `option.ts` |

### React Patterns
- **Functional components** with hooks only
- **Zustand stores** for global state (persist middleware for auth)
- **Custom hooks** in `src/hooks/` for reusable logic
- **Route components** in `src/pages/`
- **Error boundaries** for error handling

### Backend Patterns
- **Route handlers** in `server/src/routes/`
- **Service layer** for business logic
- **Repository pattern** for data access (base repository provided)
- **Fastify plugins** for middleware
- **Zod validation** for input schemas

### CSS/Tailwind v4
- **CSS-based configuration** (no tailwind.config.js)
- Custom theme defined in `src/index.css` using `@theme`
- Custom utility classes for gradients, animations, glassmorphism

---

## API Architecture

### REST Endpoints
All API routes are prefixed with `/api`:

```
POST   /api/auth/register              # User registration
POST   /api/auth/login                 # User login
GET    /api/auth/verify-email?token=xxx # Email verification
POST   /api/auth/resend-verification   # Resend verification email
GET    /api/auth/me                    # Current user
PATCH  /api/auth/profile               # Update profile
POST   /api/auth/logout                # Logout

GET    /api/meals                      # Browse meals
GET    /api/meals/search               # Search meals
GET    /api/meals/random               # Random meals
GET    /api/meals/cuisines             # Available cuisines
GET    /api/meals/cuisine/:cuisine     # Meals by cuisine

GET    /api/favorites                  # Get favorites
POST   /api/favorites                  # Add favorite
DELETE /api/favorites/:mealId          # Remove favorite
GET    /api/favorites/check/:mealId    # Check if favorited

GET    /api/family                     # Get user's families
POST   /api/family                     # Create family
POST   /api/family/join                # Join family
GET    /api/family/:id                 # Get family details
DELETE /api/family/:id/leave           # Leave family
POST   /api/family/:id/regenerate-invite # New invite code

GET    /api/polls/family/:familyId     # Get family polls
POST   /api/polls                      # Create poll
POST   /api/polls/:id/suggest          # Suggest meal
POST   /api/polls/:id/vote/:suggestionId # Vote
POST   /api/polls/:id/close            # Close poll

GET    /api/chat/family/:familyId      # Get messages
POST   /api/chat/family/:familyId      # Send message
POST   /api/chat/family/:familyId/share-meal # Share meal

GET    /api/notifications              # Get notifications
GET    /api/notifications/unread-count # Unread count
PATCH  /api/notifications/:id/read     # Mark as read
PATCH  /api/notifications/read-all     # Mark all read

POST   /api/payments/create-checkout-session # Start subscription
GET    /api/payments/subscription      # Get subscription status
POST   /api/payments/cancel-subscription # Cancel subscription
GET    /api/payments/history           # Payment history

GET    /api/user/profile               # Get profile
PATCH  /api/user/profile               # Update profile
POST   /api/user/profile/password      # Change password
DELETE /api/user/profile               # Delete account
GET    /api/user/profile/stats         # User stats
GET    /api/user/settings              # Get settings
PATCH  /api/user/settings              # Update settings

GET    /api/mealplanner/status         # Get planner status
POST   /api/mealplanner/generate       # Generate meal plan
POST   /api/mealplanner/regenerate-meal # Regenerate single meal
GET    /api/mealplanner/recipe/:id     # Get recipe details
GET    /api/mealplanner/plans          # Get all plans
POST   /api/mealplanner/plans          # Save meal plan
GET    /api/mealplanner/plans/:id      # Get specific plan
DELETE /api/mealplanner/plans/:id      # Delete plan
PATCH  /api/mealplanner/meals/:id      # Update planned meal
DELETE /api/mealplanner/meals/:id      # Delete planned meal

GET    /api/reviews/meal/:mealId       # Get reviews
POST   /api/reviews                    # Submit review
POST   /api/reviews/:id/helpful        # Mark helpful
DELETE /api/reviews/:id                # Delete review

GET    /api/meal-history               # Get meal history
POST   /api/meal-history/log           # Log meal
DELETE /api/meal-history/log/:id       # Delete log
GET    /api/meal-history/stats         # Nutrition stats

POST   /api/coupons/validate           # Validate coupon

GET    /api/payment-methods            # Get saved methods
POST   /api/payment-methods            # Add payment method
POST   /api/payment-methods/setup-intent # Get setup intent
PATCH  /api/payment-methods/:id/default # Set default
DELETE /api/payment-methods/:id        # Delete method

GET    /health                         # Health check
```

### WebSocket
- **Endpoint**: `/ws`
- **Authentication**: JWT in query parameter (`?token=xxx`)
- **Features**: Real-time chat, notifications, poll updates
- **Client**: `src/lib/websocket.ts`
- **Server**: `server/src/websocket/index.ts`

### API Client
Centralized in `src/lib/api.ts` as a singleton `ApiClient` class:
```typescript
import { api } from '@/lib/api';
const user = await api.getMe();
const meals = await api.getMeals('Breakfast', 'Vegetarian');
```

---

## Testing Strategy

Currently, this project does not have automated tests configured. When adding tests:

- **Frontend**: Vitest (aligns with Vite ecosystem)
- **Backend**: Node.js built-in test runner or Jest
- **E2E**: Playwright or Cypress

Recommended test locations:
```
src/__tests__/          # Frontend tests
server/src/__tests__/   # Backend tests
e2e/                    # E2E tests
```

---

## Security Considerations

### Authentication
- JWT tokens stored in `localStorage` (frontend) and cookies (backend)
- `@fastify/jwt` for token verification
- Passwords hashed with bcrypt (12 rounds in production)
- Email verification required for new accounts

### CORS
- Configured via `CORS_ORIGIN` environment variable
- Credentials enabled for cookie support

### Environment Secrets
- **Never commit `.env` files** - both are in `.gitignore`
- Use Google Secret Manager for production (Cloud Build)
- Railway/Vercel environment variables for alternative deployment

### Security Headers
Nginx configuration includes:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## Deployment

### Google Cloud Run (Primary)
```bash
gcloud builds submit --config=cloudbuild.yaml
```
Builds and deploys both frontend and backend containers. Uses Secret Manager for sensitive data.

### Vercel + Railway (Alternative)
1. **Frontend**: Deploy root directory to Vercel
2. **Backend**: Deploy `server/` directory to Railway
3. Set corresponding environment variables in both platforms
4. Update `CORS_ORIGIN` to match Vercel frontend URL

### Docker Compose (Local Production)
```bash
docker-compose -f docker-compose.yml up --build
```

---

## Common Issues & Troubleshooting

### Port Conflicts
| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Vite dev server |
| Backend | 3001 | Fastify API |
| Database | 5555 | PostgreSQL container |
| Prisma Studio | 5555 | (different process) |

### Database Connection Issues
Ensure Docker is running and database is healthy:
```bash
docker-compose up -d db
docker-compose logs db
```

### WebSocket in Production
- Use `wss://` (secure WebSocket) in production
- Same domain as API for Cloud Run deployment
- Separate WebSocket URL config for Railway (`VITE_WS_URL=wss://...`)

### Build Failures
1. Check TypeScript errors: `npm run lint`
2. Ensure Prisma client is generated: `npm run db:generate`
3. Clear node_modules and reinstall if needed

---

## Useful Resources

- **Vite PWA**: Uses `vite-plugin-pwa` for service worker generation
- **Prisma ERD**: Run `npm run db:generate` to update `prisma/erd.svg`
- **Tailwind v4**: Uses new CSS-based configuration (no tailwind.config.js)
- **PWA Manifest**: Configured in `vite.config.ts` and `public/manifest.json`

---

## Related Documentation

- `README.md` - Project overview and quick start
- `DEVELOPMENT.md` - Detailed development guide
- `DEPLOYMENT.md` - Deployment instructions

---

*Last updated: 2026-03-18*
