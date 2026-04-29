import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET!,
  cookieSecret: process.env.COOKIE_SECRET!,
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // External APIs
  geminiApiKey: process.env.GEMINI_API_KEY,
  mealdbApiUrl: process.env.MEALDB_API_URL || 'https://www.themealdb.com/api/json/v1/1',
  mealdbApiKey: process.env.MEALDB_API_KEY || '1',
  spoonacularApiKey: process.env.SPOONACULAR_API_KEY,
  
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceId: process.env.STRIPE_PRICE_ID,
  
  // Email
  resendApiKey: process.env.RESEND_API_KEY,
};

export default config;
