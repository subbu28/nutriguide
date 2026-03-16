import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function notificationRoutes(fastify: FastifyInstance) {
  // Get user's notifications
  fastify.get('/', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { unreadOnly = false, limit = 50 } = request.query as { 
      unreadOnly?: boolean; 
      limit?: number;
    };

    const where: any = { userId: request.user.id };
    if (unreadOnly) {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    return { notifications };
  });

  // Get unread count
  fastify.get('/unread-count', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const count = await prisma.notification.count({
      where: { userId: request.user.id, read: false }
    });

    return { count };
  });

  // Mark notification as read
  fastify.patch('/:notificationId/read', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { notificationId } = request.params as { notificationId: string };

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== request.user.id) {
      return reply.status(404).send({ error: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    return { message: 'Marked as read' };
  });

  // Mark all as read
  fastify.patch('/read-all', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    await prisma.notification.updateMany({
      where: { userId: request.user.id, read: false },
      data: { read: true }
    });

    return { message: 'All notifications marked as read' };
  });

  // Delete notification
  fastify.delete('/:notificationId', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { notificationId } = request.params as { notificationId: string };

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== request.user.id) {
      return reply.status(404).send({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    return { message: 'Deleted' };
  });

  // Clear all notifications
  fastify.delete('/clear-all', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    await prisma.notification.deleteMany({
      where: { userId: request.user.id }
    });

    return { message: 'All notifications cleared' };
  });
}
