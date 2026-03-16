import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { broadcastToFamily } from '../websocket/index.js';

const createPollSchema = z.object({
  familyId: z.string(),
  category: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'JUICES']),
  date: z.string().transform(s => new Date(s)),
  closesAt: z.string().transform(s => new Date(s)),
});

const suggestMealSchema = z.object({
  mealId: z.string(),
  mealName: z.string(),
  mealData: z.any(),
});

export async function pollRoutes(fastify: FastifyInstance) {
  // Create a meal poll
  fastify.post('/', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createPollSchema.parse(request.body);

    // Verify membership
    const membership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user.id,
          familyId: body.familyId,
        }
      }
    });

    if (!membership) {
      return reply.status(403).send({ error: 'Not a member of this family' });
    }

    // Check for existing poll
    const existing = await prisma.mealPoll.findUnique({
      where: {
        familyId_category_date: {
          familyId: body.familyId,
          category: body.category,
          date: body.date,
        }
      }
    });

    if (existing) {
      return reply.status(400).send({ error: 'Poll already exists for this meal' });
    }

    const poll = await prisma.mealPoll.create({
      data: {
        familyId: body.familyId,
        category: body.category,
        date: body.date,
        closesAt: body.closesAt,
      },
      include: {
        family: { select: { name: true } }
      }
    });

    // Notify family members
    const members = await prisma.familyMember.findMany({
      where: { familyId: body.familyId, userId: { not: request.user.id } }
    });

    await prisma.notification.createMany({
      data: members.map(m => ({
        userId: m.userId,
        title: 'New Meal Poll',
        body: `${request.user.name} started a poll for ${body.category.toLowerCase()}`,
        type: 'POLL_CREATED',
        data: { pollId: poll.id, familyId: body.familyId },
      }))
    });

    // Broadcast real-time update
    broadcastToFamily(body.familyId, {
      type: 'POLL_CREATED',
      payload: { poll, createdBy: request.user.name }
    });

    return { poll };
  });

  // Get active polls for a family
  fastify.get('/family/:familyId', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { familyId } = request.params as { familyId: string };

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

    const polls = await prisma.mealPoll.findMany({
      where: { familyId, status: 'ACTIVE' },
      include: {
        suggestions: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            votes: { select: { userId: true } },
            _count: { select: { votes: true } }
          }
        }
      },
      orderBy: [{ date: 'asc' }, { category: 'asc' }]
    });

    // Add user's vote status
    const pollsWithVoteStatus = polls.map(poll => ({
      ...poll,
      myVote: poll.suggestions.find(s => 
        s.votes.some(v => v.userId === request.user.id)
      )?.id || null,
    }));

    return { polls: pollsWithVoteStatus };
  });

  // Suggest a meal for a poll
  fastify.post('/:pollId/suggest', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { pollId } = request.params as { pollId: string };
    const body = suggestMealSchema.parse(request.body);

    const poll = await prisma.mealPoll.findUnique({
      where: { id: pollId },
      include: { family: true }
    });

    if (!poll) {
      return reply.status(404).send({ error: 'Poll not found' });
    }

    if (poll.status !== 'ACTIVE') {
      return reply.status(400).send({ error: 'Poll is no longer active' });
    }

    // Verify membership
    const membership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user.id,
          familyId: poll.familyId,
        }
      }
    });

    if (!membership) {
      return reply.status(403).send({ error: 'Not a member of this family' });
    }

    const suggestion = await prisma.mealSuggestion.create({
      data: {
        pollId,
        userId: request.user.id,
        mealId: body.mealId,
        mealName: body.mealName,
        mealData: body.mealData,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { votes: true } }
      }
    });

    // Broadcast to family
    broadcastToFamily(poll.familyId, {
      type: 'MEAL_SUGGESTED',
      payload: { pollId, suggestion }
    });

    return { suggestion };
  });

  // Vote for a meal suggestion
  fastify.post('/:pollId/vote/:suggestionId', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { pollId, suggestionId } = request.params as { pollId: string; suggestionId: string };

    const poll = await prisma.mealPoll.findUnique({
      where: { id: pollId }
    });

    if (!poll || poll.status !== 'ACTIVE') {
      return reply.status(400).send({ error: 'Poll is not active' });
    }

    // Remove existing vote if any
    await prisma.vote.deleteMany({
      where: { userId: request.user.id, pollId }
    });

    // Add new vote
    const vote = await prisma.vote.create({
      data: {
        userId: request.user.id,
        pollId,
        suggestionId,
      }
    });

    // Get updated vote counts
    const suggestions = await prisma.mealSuggestion.findMany({
      where: { pollId },
      include: { _count: { select: { votes: true } } }
    });

    // Broadcast update
    broadcastToFamily(poll.familyId, {
      type: 'VOTE_CAST',
      payload: { pollId, suggestionId, userId: request.user.id, voteCounts: suggestions }
    });

    return { vote, suggestions };
  });

  // Close poll and determine winner
  fastify.post('/:pollId/close', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { pollId } = request.params as { pollId: string };

    const poll = await prisma.mealPoll.findUnique({
      where: { id: pollId },
      include: {
        family: true,
        suggestions: {
          include: { _count: { select: { votes: true } } }
        }
      }
    });

    if (!poll) {
      return reply.status(404).send({ error: 'Poll not found' });
    }

    // Verify ownership
    const membership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user.id,
          familyId: poll.familyId,
        }
      }
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return reply.status(403).send({ error: 'Only admins can close polls' });
    }

    // Find winner
    const winner = poll.suggestions.reduce((best, current) => 
      current._count.votes > (best?._count?.votes || 0) ? current : best
    , poll.suggestions[0]);

    await prisma.mealPoll.update({
      where: { id: pollId },
      data: { status: 'COMPLETED' }
    });

    // Notify all members
    const members = await prisma.familyMember.findMany({
      where: { familyId: poll.familyId }
    });

    await prisma.notification.createMany({
      data: members.map(m => ({
        userId: m.userId,
        title: 'Poll Results',
        body: winner ? `${winner.mealName} won the ${poll.category.toLowerCase()} poll!` : 'No winner determined',
        type: 'POLL_RESULT',
        data: { pollId, winnerId: winner?.id, winnerName: winner?.mealName },
      }))
    });

    // Broadcast result
    broadcastToFamily(poll.familyId, {
      type: 'POLL_CLOSED',
      payload: { pollId, winner }
    });

    return { winner, poll };
  });

  // Get poll history
  fastify.get('/family/:familyId/history', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { familyId } = request.params as { familyId: string };
    const { limit = 20, offset = 0 } = request.query as { limit?: number; offset?: number };

    const polls = await prisma.mealPoll.findMany({
      where: { familyId, status: 'COMPLETED' },
      include: {
        suggestions: {
          include: {
            user: { select: { name: true } },
            _count: { select: { votes: true } }
          }
        }
      },
      orderBy: { date: 'desc' },
      take: Number(limit),
      skip: Number(offset)
    });

    return { polls };
  });
}
