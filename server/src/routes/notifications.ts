import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export default async function notificationRoutes(fastify: FastifyInstance) {
  // Get notifications
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const querySchema = z.object({
      unreadOnly: z.enum(['true', 'false']).default('false'),
      page: z.string().default('1'),
      limit: z.string().default('20'),
    });

    const { unreadOnly, page, limit } = querySchema.parse(request.query);
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);

    const where: any = { userId: request.user!.id };
    if (unreadOnly === 'true') {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.notification.count({ where: { userId: request.user!.id } }),
      prisma.notification.count({ where: { userId: request.user!.id, read: false } }),
    ]);

    return reply.send({
      notifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: total > pageNum * limitNum,
      },
    });
  });

  // Get unread count
  fastify.get('/unread-count', { preHandler: authenticate }, async (request, reply) => {
    try {
      const count = await prisma.notification.count({
        where: {
          userId: request.user!.id,
          read: false,
        },
      });

      if (!reply.sent) {
        return reply.send({ count });
      }
    } catch (error) {
      if (!reply.sent) {
        return reply.status(500).send({ error: 'Failed to get unread count' });
      }
    }
  });

  // Mark as read
  fastify.patch('/:id/read', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.notification.updateMany({
      where: {
        id,
        userId: request.user!.id,
      },
      data: { read: true },
    });

    return reply.send({ message: 'Marked as read' });
  });

  // Mark all as read
  fastify.patch('/read-all', { preHandler: authenticate }, async (request, reply) => {
    await prisma.notification.updateMany({
      where: {
        userId: request.user!.id,
        read: false,
      },
      data: { read: true },
    });

    return reply.send({ message: 'All notifications marked as read' });
  });

  // Delete notification
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.notification.deleteMany({
      where: {
        id,
        userId: request.user!.id,
      },
    });

    return reply.send({ message: 'Notification deleted' });
  });
}
