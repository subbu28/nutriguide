import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

export default async function recipeRoutes(fastify: FastifyInstance) {
  // Get recipes with filters
  fastify.get('/', { preHandler: optionalAuth }, async (request, reply) => {
    const querySchema = z.object({
      search: z.string().optional(),
      cuisine: z.string().optional(),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
      tags: z.string().optional(), // comma-separated
      authorId: z.string().optional(),
      privacy: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).optional(),
      page: z.string().default('1'),
      limit: z.string().default('20'),
      sortBy: z.enum(['newest', 'popular', 'liked']).default('newest'),
    });

    const { search, cuisine, difficulty, tags, authorId, privacy, page, limit, sortBy } = querySchema.parse(request.query);
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);

    const where: any = {};
    
    // Privacy filter
    if (request.user) {
      if (privacy === 'PRIVATE') {
        where.authorId = request.user.id;
        where.privacy = 'PRIVATE';
      } else {
        where.OR = [
          { privacy: 'PUBLIC' },
          { privacy: 'UNLISTED' },
          { authorId: request.user.id, privacy: 'PRIVATE' },
        ];
      }
    } else {
      where.privacy = 'PUBLIC';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (cuisine) where.cuisine = cuisine;
    if (difficulty) where.difficulty = difficulty;
    if (tags) where.tags = { hasSome: tags.split(',') };
    if (authorId) where.authorId = authorId;

    const orderBy: any = {};
    switch (sortBy) {
      case 'popular':
        orderBy.viewCount = 'desc';
        break;
      case 'liked':
        orderBy.likeCount = 'desc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.recipe.count({ where }),
    ]);

    return reply.send({
      recipes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: total > pageNum * limitNum,
      },
    });
  });

  // Get single recipe
  fastify.get('/:id', { preHandler: optionalAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, bio: true },
        },
        ingredients: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    if (!recipe) {
      return reply.status(404).send({ error: 'Recipe not found' });
    }

    // Check privacy
    if (recipe.privacy === 'PRIVATE' && recipe.authorId !== request.user?.id) {
      return reply.status(403).send({ error: 'Recipe is private' });
    }

    // Increment view count
    await prisma.recipe.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Check if user liked/saved
    let isLiked = false;
    let isSaved = false;
    if (request.user) {
      const [like, save] = await Promise.all([
        prisma.recipeLike.findUnique({
          where: { recipeId_userId: { recipeId: id, userId: request.user.id } },
        }),
        // Check if in any collection
        prisma.collectionRecipe.findFirst({
          where: {
            recipeId: id,
            collection: { userId: request.user.id },
          },
        }),
      ]);
      isLiked = !!like;
      isSaved = !!save;
    }

    return reply.send({
      ...recipe,
      isLiked,
      isSaved,
    });
  });

  // Create recipe
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      title: z.string().min(2).max(100),
      description: z.string().max(1000).optional(),
      instructions: z.string().min(10),
      prepTime: z.number().int().min(1),
      cookTime: z.number().int().min(0),
      servings: z.number().int().min(1),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
      privacy: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).default('PUBLIC'),
      images: z.array(z.string().url()).max(10),
      videoUrl: z.string().url().optional(),
      tags: z.array(z.string()).max(20),
      cuisine: z.string().optional(),
      calories: z.number().positive().optional(),
      protein: z.number().positive().optional(),
      carbs: z.number().positive().optional(),
      fat: z.number().positive().optional(),
      fiber: z.number().positive().optional(),
      ingredients: z.array(z.object({
        name: z.string().min(1),
        amount: z.number().positive(),
        unit: z.string().min(1),
        optional: z.boolean().default(false),
        notes: z.string().optional(),
      })).min(1),
    });

    try {
      const data = schema.parse(request.body);

      const recipe = await prisma.recipe.create({
        data: {
          ...data,
          authorId: request.user!.id,
          ingredients: {
            create: data.ingredients,
          },
        },
        include: {
          ingredients: true,
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      return reply.status(201).send(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Update recipe
  fastify.patch('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return reply.status(404).send({ error: 'Recipe not found' });
    }

    if (recipe.authorId !== request.user!.id) {
      return reply.status(403).send({ error: 'Not authorized' });
    }

    const schema = z.object({
      title: z.string().min(2).max(100).optional(),
      description: z.string().max(1000).optional(),
      instructions: z.string().min(10).optional(),
      prepTime: z.number().int().min(1).optional(),
      cookTime: z.number().int().min(0).optional(),
      servings: z.number().int().min(1).optional(),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
      privacy: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).optional(),
      images: z.array(z.string().url()).max(10).optional(),
      videoUrl: z.string().url().optional().nullable(),
      tags: z.array(z.string()).max(20).optional(),
      cuisine: z.string().optional().nullable(),
      calories: z.number().positive().optional().nullable(),
      protein: z.number().positive().optional().nullable(),
      carbs: z.number().positive().optional().nullable(),
      fat: z.number().positive().optional().nullable(),
      fiber: z.number().positive().optional().nullable(),
    });

    try {
      const data = schema.parse(request.body);

      const updated = await prisma.recipe.update({
        where: { id },
        data,
        include: {
          ingredients: true,
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      return reply.send(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Delete recipe
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const recipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!recipe) {
      return reply.status(404).send({ error: 'Recipe not found' });
    }

    if (recipe.authorId !== request.user!.id) {
      return reply.status(403).send({ error: 'Not authorized' });
    }

    await prisma.recipe.delete({
      where: { id },
    });

    return reply.send({ message: 'Recipe deleted' });
  });

  // Like/unlike recipe
  fastify.post('/:id/like', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await prisma.recipeLike.findUnique({
      where: {
        recipeId_userId: {
          recipeId: id,
          userId: request.user!.id,
        },
      },
    });

    if (existing) {
      // Unlike
      await prisma.recipeLike.delete({
        where: { id: existing.id },
      });
      await prisma.recipe.update({
        where: { id },
        data: { likeCount: { decrement: 1 } },
      });
      return reply.send({ liked: false });
    } else {
      // Like
      await prisma.recipeLike.create({
        data: {
          recipeId: id,
          userId: request.user!.id,
        },
      });
      await prisma.recipe.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      });
      return reply.send({ liked: true });
    }
  });
}
