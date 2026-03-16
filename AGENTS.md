# NutriGuide - Agent Development Guide

This document provides essential information for AI coding agents working on the NutriGuide project.

## Project Overview

**NutriGuide** is a healthy meal discovery platform with AI-powered recommendations, family collaboration features, and premium subscription support. It's built as a full-stack TypeScript application with a React frontend and Fastify backend.

### Core Features
- AI-powered meal recommendations (Gemini AI)
- Family groups with meal voting polls
- Real-time chat via WebSocket
- Favorites and meal planning
- Stripe-powered premium subscriptions
- PWA support with offline functionality

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite 6** - Build tool with HMR
- **React Router 6** - Client-side routing
- **Zustand** - State management (with persist middleware)
- **TailwindCSS 4** - Utility-first styling
- **Motion** - Animation library
- **Lucide React** - Icon library

### Backend
- **Fastify 4** - Web framework
- **Prisma 5** - ORM with PostgreSQL
- **@fastify/jwt** - JWT authentication
- **@fastify/websocket** - WebSocket support
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **Stripe** - Payment processing

### External APIs
- **Gemini AI** (`@google/genai`) - Meal recommendations
- **TheMealDB** - Free recipe database
- **Spoonacular** - Enhanced recipes (optional)

### Infrastructure
- **Docker & Docker Compose** - Local development
- **Google Cloud Run** - Primary deployment target
- **Cloud Build** - CI/CD pipeline
- **Vercel + Railway** - Alternative deployment

## Project Structure

```
nutriguide/
├── src/                          # Frontend React application
│   ├── components/               # Reusable UI components
│   │   ├── Layout.tsx            # Main layout wrapper
│   │   ├── MealCard.tsx          # Meal display card
│   │   ├── ProtectedRoute.tsx    # Auth guard
│   │   └── ...
│   ├── pages/                    # Route-level pages
│   │   ├── Home.tsx              # Browse meals
│   │   ├── Auth.tsx              # Login/register
│   │   ├── Family.tsx            # Family management
│   │   ├── Favorites.tsx         # Saved meals
│   │   └── ...
│   ├── stores/                   # Zustand state stores
│   │   ├── authStore.ts          # Auth state
│   │   ├── familyStore.ts        # Family state
│   │   └── ...
│   ├── lib/                      # Utilities & API
│   │   ├── api.ts                # API client (singleton)
│   │   ├── websocket.ts          # WebSocket client
│   │   └── ...
│   ├── services/                 # External service integrations
│   │   └── geminiService.ts      # Gemini AI wrapper
│   ├── types/                    # TypeScript types
│   │   └── index.ts              # Shared type definitions
│   └── main.tsx                  # App entry point
│
├── server/                       # Backend Fastify application
│   ├── src/
│   │   ├── routes/               # API route handlers
│   │   │   ├── auth.ts           # Authentication endpoints
│   │   │   ├── meals.ts          # Meal data endpoints
│   │   │   ├── family.ts         # Family management
│   │   │   └── ...
│   │   ├── services/             # Business logic
│   │   ├── repositories/         # Data access layer
│   │   ├── websocket/            # WebSocket handlers
│   │   ├── config/               # Environment configuration
│   │   └── index.ts              # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── seed.ts               # Seed data
│   └── package.json              # Backend dependencies
│
├── public/                       # Static assets
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   └── icons/                    # PWA icons
│
├── docker-compose.yml            # Local development stack
├── cloudbuild.yaml               # GCP CI/CD configuration
├── vercel.json                   # Vercel deployment config
└── nginx.conf                    # Production nginx config
```

## Development Commands

### Frontend (Root Directory)
```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # TypeScript check (tsc --noEmit)
npm run clean            # Remove dist folder
```

### Backend (server/ Directory)
```bash
npm run dev              # Start with hot reload (tsx watch)
npm run build            # Compile TypeScript to dist/
npm run start            # Run compiled code

# Database
npm run db:push          # Push schema changes to database
npm run db:migrate       # Create migration files
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio (GUI)
```

### Database (Docker)
```bash
docker-compose up -d db              # Start PostgreSQL only
docker-compose up                     # Start full stack (db + api + web)
docker-compose down -v                # Stop and remove volumes (reset data)
```

## Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
GEMINI_API_KEY=xxx                    # Build-time injection
```

### Backend (server/.env)
```env
# Required
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5555/nutriguide
JWT_SECRET=minimum-32-characters-long
COOKIE_SECRET=minimum-32-characters-long
CORS_ORIGIN=http://localhost:3000

# Optional (for enhanced features)
GEMINI_API_KEY=xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SPOONACULAR_API_KEY=xxx
```

## Database Schema

Key entities (see `server/prisma/schema.prisma` for full schema):

- **User** - Authentication, profile, premium status
- **UserSettings** - Dietary preferences, notification settings
- **Family** - Family groups with invite codes
- **FamilyMember** - Many-to-many with roles (OWNER/ADMIN/MEMBER)
- **Favorite** - Saved meals (stores mealData as JSON)
- **MealPoll** - Voting polls for meal categories
- **MealSuggestion** - Suggested meals in polls
- **Vote** - User votes on suggestions
- **Message** - Family chat messages
- **Notification** - User notifications
- **Subscription** - Stripe subscription tracking
- **MealPlan** - User meal plans with planned meals

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** - No implicit any
- **Path alias**: `@/` maps to `src/` (frontend) or root (backend)
- **ES Modules**: `"type": "module"` in both package.json files
- **File extensions**: Use `.js` for imports (NodeNext resolution)

### React Patterns
- **Functional components** with hooks
- **Zustand stores** for global state
- **Custom hooks** for reusable logic (see `src/hooks/`)
- **Route components** in `src/pages/`

### Backend Patterns
- **Route handlers** in `server/src/routes/`
- **Service layer** for business logic
- **Repository pattern** for data access
- **Fastify plugins** for middleware

### Naming Conventions
- **Components**: PascalCase (e.g., `MealCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Stores**: camelCase with `Store` suffix (e.g., `authStore.ts`)
- **API routes**: kebab-case (e.g., `/meal-planner.ts`)

## Testing Strategy

Currently, this project does not have automated tests configured. When adding tests:

- **Frontend**: Vitest (follows Vite ecosystem)
- **Backend**: Node.js built-in test runner or Jest
- **E2E**: Playwright or Cypress

## API Architecture

### REST Endpoints
All API routes are prefixed with `/api`:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user
- `GET /api/meals` - Browse meals
- `GET /api/favorites` - User favorites
- `GET /api/family` - Family groups
- `POST /api/polls` - Create meal poll
- `GET /api/notifications` - User notifications
- `POST /api/payments/*` - Stripe integration

### WebSocket
- Endpoint: `/ws`
- Authentication via JWT in query parameter
- Supports: real-time chat, notifications, poll updates
- Client: `src/lib/websocket.ts`
- Server: `server/src/websocket/index.ts`

### API Client
Centralized in `src/lib/api.ts` as a singleton `ApiClient` class:
```typescript
import { api } from '@/lib/api';
const user = await api.getMe();
```

## Security Considerations

### Authentication
- JWT tokens stored in localStorage (frontend) and cookies (backend)
- `@fastify/jwt` for token verification
- Passwords hashed with bcrypt (10 rounds)

### CORS
- Configured via `CORS_ORIGIN` environment variable
- Credentials enabled for cookie support

### Environment Secrets
- Never commit `.env` files
- Use Google Secret Manager for production (Cloud Build)
- Railway/Vercel environment variables for alternative deployment

## Deployment

### Google Cloud Run (Primary)
```bash
gcloud builds submit --config=cloudbuild.yaml
```
Builds and deploys both frontend and backend containers.

### Vercel + Railway (Alternative)
- Frontend: Deploy `root/` to Vercel
- Backend: Deploy `server/` to Railway
- Set corresponding environment variables
- Update CORS_ORIGIN after deployment

### Docker Compose (Local Production)
```bash
docker-compose -f docker-compose.yml up --build
```

## Common Issues

### Port Conflicts
- Frontend: 3000 (Vite dev server)
- Backend: 3001 (Fastify)
- Database: 5555 (PostgreSQL container)

### Database Connection
Ensure Docker is running and database is healthy:
```bash
docker-compose up -d db
docker-compose logs db
```

### WebSocket in Production
- Use `wss://` (secure WebSocket) in production
- Same domain as API for Cloud Run deployment
- Separate WebSocket URL config for Railway

## Useful Resources

- **Vite PWA**: Uses `vite-plugin-pwa` for service worker generation
- **Prisma ERD**: Run `npm run db:generate` to update `prisma/erd.svg`
- **Tailwind v4**: Uses new CSS-based configuration (no tailwind.config.js)

---

*Last updated: 2026-03-15*
