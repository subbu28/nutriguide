import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export default async function pollRoutes(fastify: FastifyInstance) {
  // Get family polls
  fastify.get('/family/:familyId', { preHandler: authenticate }, async (request, reply) => {
    const { familyId } = request.params as { familyId: string };
    const querySchema = z.object({
      status: z.enum(['ACTIVE', 'CLOSED', 'COMPLETED']).optional(),
    });

    const { status } = querySchema.parse(request.query);

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
    if (status) where.status = status;

    const polls = await prisma.mealPoll.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        suggestions: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
            _count: {
              select: { votes: true },
            },
          },
        },
        votes: {
          where: { userId: request.user!.id },
        },
      },
    });

    return reply.send({ polls });
  });

  // Create poll
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      familyId: z.string(),
      category: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'JUICES']),
      date: z.string().datetime(),
      closesAt: z.string().datetime(),
    });

    try {
      const { familyId, category, date, closesAt } = schema.parse(request.body);

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

      const poll = await prisma.mealPoll.create({
        data: {
          familyId,
          category,
          date: new Date(date),
          closesAt: new Date(closesAt),
        },
        include: {
          suggestions: true,
        },
      });

      return reply.status(201).send(poll);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(400).send({ error: 'A poll for this category and date already exists' });
      }
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Suggest meal
  fastify.post('/:id/suggest', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const schema = z.object({
      mealId: z.string(),
      mealName: z.string(),
      mealData: z.record(z.any()),
    });

    try {
      const data = schema.parse(request.body);

      const poll = await prisma.mealPoll.findUnique({
        where: { id },
        include: { family: true },
      });

      if (!poll) {
        return reply.status(404).send({ error: 'Poll not found' });
      }

      if (poll.status !== 'ACTIVE') {
        return reply.status(400).send({ error: 'Poll is not active' });
      }

      // Check membership
      const member = await prisma.familyMember.findUnique({
        where: {
          userId_familyId: {
            userId: request.user!.id,
            familyId: poll.familyId,
          },
        },
      });

      if (!member) {
        return reply.status(403).send({ error: 'Not a member of this family' });
      }

      const suggestion = await prisma.mealSuggestion.create({
        data: {
          pollId: id,
          userId: request.user!.id,
          ...data,
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      return reply.status(201).send(suggestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Vote
  fastify.post('/:id/vote/:suggestionId', { preHandler: authenticate }, async (request, reply) => {
    const { id, suggestionId } = request.params as { id: string; suggestionId: string };

    const poll = await prisma.mealPoll.findUnique({
      where: { id },
      include: { family: true },
    });

    if (!poll) {
      return reply.status(404).send({ error: 'Poll not found' });
    }

    if (poll.status !== 'ACTIVE') {
      return reply.status(400).send({ error: 'Poll is not active' });
    }

    // Check membership
    const member = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user!.id,
          familyId: poll.familyId,
        },
      },
    });

    if (!member) {
      return reply.status(403).send({ error: 'Not a member of this family' });
    }

    try {
      const vote = await prisma.vote.upsert({
        where: {
          userId_pollId: {
            userId: request.user!.id,
            pollId: id,
          },
        },
        create: {
          userId: request.user!.id,
          pollId: id,
          suggestionId,
        },
        update: {
          suggestionId,
        },
      });

      return reply.send(vote);
    } catch (error: any) {
      if (error.code === 'P2003') {
        return reply.status(400).send({ error: 'Invalid suggestion' });
      }
      throw error;
    }
  });

  // Close poll
  fastify.post('/:id/close', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const poll = await prisma.mealPoll.findUnique({
      where: { id },
      include: { family: true },
    });

    if (!poll) {
      return reply.status(404).send({ error: 'Poll not found' });
    }

    // Only owner or admin can close
    const member = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user!.id,
          familyId: poll.familyId,
        },
      },
    });

    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      return reply.status(403).send({ error: 'Not authorized' });
    }

    const updated = await prisma.mealPoll.update({
      where: { id },
      data: { status: 'CLOSED' },
      include: {
        suggestions: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
    });

    return reply.send(updated);
  });
}
