import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { broadcastToFamily } from '../websocket/index.js';

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  type: z.enum(['TEXT', 'MEAL_SHARE']).default('TEXT'),
  metadata: z.any().optional(),
});

export async function chatRoutes(fastify: FastifyInstance) {
  // Get messages for a family
  fastify.get('/family/:familyId', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { familyId } = request.params as { familyId: string };
    const { limit = 50, before } = request.query as { limit?: number; before?: string };

    // Verify membership
    const membership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user.id,
          familyId,
        }
      }
    });

    if (!membership) {
      return reply.status(403).send({ error: 'Not a member of this family' });
    }

    const where: any = { familyId };
    if (before) {
      where.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    return { messages: messages.reverse() };
  });

  // Send a message
  fastify.post('/family/:familyId', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { familyId } = request.params as { familyId: string };
    const body = sendMessageSchema.parse(request.body);

    // Verify membership
    const membership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user.id,
          familyId,
        }
      }
    });

    if (!membership) {
      return reply.status(403).send({ error: 'Not a member of this family' });
    }

    const message = await prisma.message.create({
      data: {
        familyId,
        userId: request.user.id,
        content: body.content,
        type: body.type,
        metadata: body.metadata,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    // Broadcast to family members
    broadcastToFamily(familyId, {
      type: 'NEW_MESSAGE',
      payload: message
    });

    // Create notifications for offline members (handled by WebSocket logic)
    const offlineMembers = await prisma.familyMember.findMany({
      where: { 
        familyId,
        userId: { not: request.user.id }
      }
    });

    // We'll batch create notifications for members not currently connected
    // This is a simplified version - in production you'd check WebSocket connections
    await prisma.notification.createMany({
      data: offlineMembers.map(m => ({
        userId: m.userId,
        title: `New message in family chat`,
        body: `${request.user.name}: ${body.content.slice(0, 50)}${body.content.length > 50 ? '...' : ''}`,
        type: 'NEW_MESSAGE' as const,
        data: { familyId, messageId: message.id },
      }))
    });

    return { message };
  });

  // Share a meal in chat
  fastify.post('/family/:familyId/share-meal', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { familyId } = request.params as { familyId: string };
    const { mealId, mealName, mealData, comment } = request.body as {
      mealId: string;
      mealName: string;
      mealData: any;
      comment?: string;
    };

    // Verify membership
    const membership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user.id,
          familyId,
        }
      }
    });

    if (!membership) {
      return reply.status(403).send({ error: 'Not a member of this family' });
    }

    const message = await prisma.message.create({
      data: {
        familyId,
        userId: request.user.id,
        content: comment || `Check out this meal: ${mealName}`,
        type: 'MEAL_SHARE',
        metadata: { mealId, mealName, mealData },
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    broadcastToFamily(familyId, {
      type: 'NEW_MESSAGE',
      payload: message
    });

    return { message };
  });

  // Delete a message (only own messages)
  fastify.delete('/:messageId', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { messageId } = request.params as { messageId: string };

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return reply.status(404).send({ error: 'Message not found' });
    }

    if (message.userId !== request.user.id) {
      return reply.status(403).send({ error: 'Can only delete own messages' });
    }

    await prisma.message.delete({ where: { id: messageId } });

    broadcastToFamily(message.familyId, {
      type: 'MESSAGE_DELETED',
      payload: { messageId }
    });

    return { message: 'Deleted' };
  });
}
