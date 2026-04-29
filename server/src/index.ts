import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import websocket from '@fastify/websocket';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';
import { setupWebSocket } from './websocket/index.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import mealRoutes from './routes/meals.js';
import favoriteRoutes from './routes/favorites.js';
import familyRoutes from './routes/family.js';
import pollRoutes from './routes/polls.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import paymentRoutes from './routes/payments.js';
import couponRoutes from './routes/coupons.js';
import paymentMethodRoutes from './routes/payment-methods.js';
import mealPlannerRoutes from './routes/mealplanner.js';
import recipeRoutes from './routes/recipes.js';
import reviewRoutes from './routes/reviews.js';
import shoppingListRoutes from './routes/shopping-list.js';
import mealHistoryRoutes from './routes/meal-history.js';
import socialRoutes from './routes/social.js';
import aiRoutes from './routes/ai.js';
import healthRoutes from './routes/health.js';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    } : undefined,
  },
});

// Register plugins
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET!,
  cookie: {
    cookieName: 'token',
    signed: true,
  },
});

await fastify.register(cookie, {
  secret: process.env.COOKIE_SECRET!,
  parseOptions: {},
});

await fastify.register(websocket);

// Register routes
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(userRoutes, { prefix: '/api/user' });
await fastify.register(mealRoutes, { prefix: '/api/meals' });
await fastify.register(favoriteRoutes, { prefix: '/api/favorites' });
await fastify.register(familyRoutes, { prefix: '/api/family' });
await fastify.register(pollRoutes, { prefix: '/api/polls' });
await fastify.register(chatRoutes, { prefix: '/api/chat' });
await fastify.register(notificationRoutes, { prefix: '/api/notifications' });
await fastify.register(paymentRoutes, { prefix: '/api/payments' });
await fastify.register(couponRoutes, { prefix: '/api/coupons' });
await fastify.register(paymentMethodRoutes, { prefix: '/api/payment-methods' });
await fastify.register(mealPlannerRoutes, { prefix: '/api/mealplanner' });
await fastify.register(recipeRoutes, { prefix: '/api/recipes' });
await fastify.register(reviewRoutes, { prefix: '/api/reviews' });
await fastify.register(shoppingListRoutes, { prefix: '/api/shopping-lists' });
await fastify.register(mealHistoryRoutes, { prefix: '/api/meal-history' });
await fastify.register(socialRoutes, { prefix: '/api/social' });
await fastify.register(aiRoutes, { prefix: '/api/ai' });
await fastify.register(healthRoutes, { prefix: '/health' });

// WebSocket setup
setupWebSocket(fastify);

// Graceful shutdown
const closeGracefully = async (signal: string) => {
  fastify.log.info(`Received signal ${signal}, closing server gracefully...`);
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

// Start server
try {
  const port = parseInt(process.env.PORT || '3001');
  await fastify.listen({ port, host: '0.0.0.0' });
  fastify.log.info(`Server listening on port ${port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
