import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      return reply.send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
      });
    } catch (error) {
      return reply.status(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      });
    }
  });
}
