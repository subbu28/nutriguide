import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export default async function chatRoutes(fastify: FastifyInstance) {
  // Get messages for a family
  fastify.get('/family/:familyId', { preHandler: authenticate }, async (request, reply) => {
    const { familyId } = request.params as { familyId: string };
    const querySchema = z.object({
      before: z.string().datetime().optional(),
      limit: z.string().default('50'),
    });

    const { before, limit } = querySchema.parse(request.query);
    const limitNum = Math.min(parseInt(limit), 100);

    // Check membership
    const member = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user!.id,
          familyId,
        },
      },
    });

    if (!member) {
      return reply.status(403).send({ error: 'Not a member of this family' });
    }

    const where: any = { familyId };
    if (before) {
      where.createdAt = { lt: new Date(before) };
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return reply.send({ messages: messages.reverse() });
  });

  // Send message
  fastify.post('/family/:familyId', { preHandler: authenticate }, async (request, reply) => {
    const { familyId } = request.params as { familyId: string };
    const schema = z.object({
      content: z.string().min(1).max(2000),
      type: z.enum(['TEXT', 'MEAL_SHARE', 'POLL_CREATED', 'POLL_RESULT', 'MEMBER_JOINED']).default('TEXT'),
      metadata: z.record(z.any()).optional(),
    });

    try {
      const { content, type, metadata } = schema.parse(request.body);

      // Check membership
      const member = await prisma.familyMember.findUnique({
        where: {
          userId_familyId: {
            userId: request.user!.id,
            familyId,
          },
        },
      });

      if (!member) {
        return reply.status(403).send({ error: 'Not a member of this family' });
      }

      const message = await prisma.message.create({
        data: {
          familyId,
          userId: request.user!.id,
          content,
          type,
          metadata: metadata || {},
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // Get all family members except sender and create notifications
      const familyMembers = await prisma.familyMember.findMany({
        where: {
          familyId,
          userId: { not: request.user!.id },
        },
        select: { userId: true },
      });

      const family = await prisma.family.findUnique({
        where: { id: familyId },
        select: { name: true },
      });

      // Create notifications for all other family members
      if (familyMembers.length > 0) {
        await prisma.notification.createMany({
          data: familyMembers.map(member => ({
            userId: member.userId,
            type: 'NEW_MESSAGE',
            title: `New message in ${family?.name || 'Family'}`,
            body: `${message.user.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
            data: { familyId, messageId: message.id },
          })),
        });
      }

      return reply.status(201).send(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Share meal
  fastify.post('/family/:familyId/share-meal', { preHandler: authenticate }, async (request, reply) => {
    const { familyId } = request.params as { familyId: string };
    const schema = z.object({
      mealId: z.string(),
      mealName: z.string(),
      mealData: z.record(z.any()),
      comment: z.string().max(500).optional(),
    });

    try {
      const { mealId, mealName, mealData, comment } = schema.parse(request.body);

      // Check membership
      const member = await prisma.familyMember.findUnique({
        where: {
          userId_familyId: {
            userId: request.user!.id,
            familyId,
          },
        },
      });

      if (!member) {
        return reply.status(403).send({ error: 'Not a member of this family' });
      }

      const message = await prisma.message.create({
        data: {
          familyId,
          userId: request.user!.id,
          content: comment || `Shared a meal: ${mealName}`,
          type: 'MEAL_SHARE',
          metadata: { mealId, mealName, mealData },
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      return reply.status(201).send(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });
}
