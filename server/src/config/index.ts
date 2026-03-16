import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  isDev: process.env.NODE_ENV !== 'production',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // JWT & Auth
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'your-cookie-secret-change-in-production',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripePriceId: process.env.STRIPE_PRICE_ID || '',
  
  // Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  
  // Frontend URL (for redirects)
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
