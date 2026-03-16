import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import websocket from '@fastify/websocket';
import { config } from './config/index.js';
import { authRoutes } from './routes/auth.js';
import { mealsRoutes } from './routes/meals.js';
import { favoritesRoutes } from './routes/favorites.js';
import { familyRoutes } from './routes/family.js';
import { pollRoutes } from './routes/polls.js';
import { chatRoutes } from './routes/chat.js';
import { paymentRoutes } from './routes/payments.js';
import { notificationRoutes } from './routes/notifications.js';
import { profileRoutes } from './routes/profile.js';
import { mealPlannerRoutes } from './routes/mealplanner.js';
import { websocketHandler } from './websocket/index.js';
import { prisma } from './lib/prisma.js';
import { logger } from './lib/logger.js';
import { loggingMiddleware } from './middleware/logging.middleware.js';

const fastify = Fastify({
  logger: false, // Using custom logger
});

async function start() {
  try {
    // Register plugins
    await fastify.register(cors, {
      origin: config.corsOrigin,
      credentials: true
    });

    await fastify.register(cookie, {
      secret: config.cookieSecret,
      parseOptions: {}
    });

    await fastify.register(jwt, {
      secret: config.jwtSecret,
      cookie: {
        cookieName: 'token',
        signed: false
      }
    });

    await fastify.register(websocket);

    // Register logging middleware
    await loggingMiddleware(fastify);

    // Decorate with prisma
    fastify.decorate('prisma', prisma);

    // Auth decorator
    fastify.decorate('authenticate', async function(request: any, reply: any) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    });

    // Health check
    fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

    // Register routes
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(mealsRoutes, { prefix: '/api/meals' });
    await fastify.register(favoritesRoutes, { prefix: '/api/favorites' });
    await fastify.register(familyRoutes, { prefix: '/api/family' });
    await fastify.register(pollRoutes, { prefix: '/api/polls' });
    await fastify.register(chatRoutes, { prefix: '/api/chat' });
    await fastify.register(paymentRoutes, { prefix: '/api/payments' });
    await fastify.register(notificationRoutes, { prefix: '/api/notifications' });
    await fastify.register(profileRoutes, { prefix: '/api/user' });
    await fastify.register(mealPlannerRoutes, { prefix: '/api/mealplanner' });

    // WebSocket for real-time features
    fastify.register(async function(fastify) {
      fastify.get('/ws', { websocket: true }, websocketHandler);
    });

    // Start server
    await fastify.listen({ 
      port: config.port, 
      host: '0.0.0.0' 
    });

    logger.info({ port: config.port }, '🚀 Server running');
  } catch (err) {
    logger.error({ err }, 'Server startup failed');
    process.exit(1);
  }
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach(signal => {
  process.on(signal, async () => {
    logger.info({ signal }, 'Graceful shutdown initiated');
    await fastify.close();
    await prisma.$disconnect();
    logger.info('Server shutdown complete');
    process.exit(0);
  });
});

start();
