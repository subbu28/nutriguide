import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export default async function socialRoutes(fastify: FastifyInstance) {
  // Get user profile
  fastify.get('/users/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            recipes: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.send(user);
  });

  // Follow user
  fastify.post('/follow/:userId', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.params as { userId: string };

    if (userId === request.user!.id) {
      return reply.status(400).send({ error: 'Cannot follow yourself' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return reply.status(404).send({ error: 'User not found' });
    }

    try {
      await prisma.follow.create({
        data: {
          followerId: request.user!.id,
          followingId: userId,
        },
      });

      return reply.send({ following: true });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(400).send({ error: 'Already following this user' });
      }
      throw error;
    }
  });

  // Unfollow user
  fastify.delete('/follow/:userId', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.params as { userId: string };

    await prisma.follow.deleteMany({
      where: {
        followerId: request.user!.id,
        followingId: userId,
      },
    });

    return reply.send({ following: false });
  });

  // Check if following
  fastify.get('/follow/:userId/status', { preHandler: authenticate }, async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: request.user!.id,
          followingId: userId,
        },
      },
    });

    return reply.send({ following: !!follow });
  });

  // Get followers
  fastify.get('/users/:id/followers', async (request, reply) => {
    const { id } = request.params as { id: string };
    const querySchema = z.object({
      page: z.string().default('1'),
      limit: z.string().default('20'),
    });

    const { page, limit } = querySchema.parse(request.query);
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: id },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          follower: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.follow.count({ where: { followingId: id } }),
    ]);

    return reply.send({
      followers: followers.map(f => f.follower),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: total > pageNum * limitNum,
      },
    });
  });

  // Get following
  fastify.get('/users/:id/following', async (request, reply) => {
    const { id } = request.params as { id: string };
    const querySchema = z.object({
      page: z.string().default('1'),
      limit: z.string().default('20'),
    });

    const { page, limit } = querySchema.parse(request.query);
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: id },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          following: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.follow.count({ where: { followerId: id } }),
    ]);

    return reply.send({
      following: following.map(f => f.following),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: total > pageNum * limitNum,
      },
    });
  });

  // Get activity feed
  fastify.get('/feed', { preHandler: authenticate }, async (request, reply) => {
    const querySchema = z.object({
      page: z.string().default('1'),
      limit: z.string().default('20'),
    });

    const { page, limit } = querySchema.parse(request.query);
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);

    // Get following IDs
    const following = await prisma.follow.findMany({
      where: { followerId: request.user!.id },
      select: { followingId: true },
    });

    const followingIds = following.map(f => f.followingId);

    // Get recent recipes from following + own
    const recipes = await prisma.recipe.findMany({
      where: {
        authorId: { in: [...followingIds, request.user!.id] },
        privacy: 'PUBLIC',
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    return reply.send({
      items: recipes.map(r => ({
        type: 'RECIPE_CREATED',
        actor: r.author,
        target: r,
        createdAt: r.createdAt,
      })),
    });
  });

  // Collections
  fastify.get('/collections', { preHandler: authenticate }, async (request, reply) => {
    const collections = await prisma.collection.findMany({
      where: { userId: request.user!.id },
      include: {
        _count: {
          select: { recipes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ collections });
  });

  fastify.post('/collections', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      isPublic: z.boolean().default(false),
    });

    try {
      const data = schema.parse(request.body);

      const collection = await prisma.collection.create({
        data: {
          ...data,
          userId: request.user!.id,
        },
      });

      return reply.status(201).send(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  fastify.post('/collections/:id/recipes', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const schema = z.object({
      recipeId: z.string(),
      notes: z.string().optional(),
    });

    try {
      const { recipeId, notes } = schema.parse(request.body);

      const collection = await prisma.collection.findFirst({
        where: {
          id,
          userId: request.user!.id,
        },
      });

      if (!collection) {
        return reply.status(404).send({ error: 'Collection not found' });
      }

      const item = await prisma.collectionRecipe.create({
        data: {
          collectionId: id,
          recipeId,
          notes,
        },
      });

      // Update recipe save count
      await prisma.recipe.update({
        where: { id: recipeId },
        data: { saveCount: { increment: 1 } },
      });

      return reply.status(201).send(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  fastify.delete('/collections/:id/recipes/:recipeId', { preHandler: authenticate }, async (request, reply) => {
    const { id, recipeId } = request.params as { id: string; recipeId: string };

    await prisma.collectionRecipe.deleteMany({
      where: {
        collectionId: id,
        recipeId,
        collection: { userId: request.user!.id },
      },
    });

    // Update recipe save count
    await prisma.recipe.update({
      where: { id: recipeId },
      data: { saveCount: { decrement: 1 } },
    });

    return reply.send({ message: 'Recipe removed from collection' });
  });
}
