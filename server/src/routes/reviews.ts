import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export default async function reviewRoutes(fastify: FastifyInstance) {
  // Get reviews for a recipe
  fastify.get('/recipe/:recipeId', async (request, reply) => {
    const { recipeId } = request.params as { recipeId: string };
    const querySchema = z.object({
      page: z.string().default('1'),
      limit: z.string().default('10'),
      sortBy: z.enum(['newest', 'helpful', 'rating']).default('newest'),
    });

    const { page, limit, sortBy } = querySchema.parse(request.query);
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);

    const orderBy: any = {};
    switch (sortBy) {
      case 'helpful':
        orderBy.helpful = 'desc';
        break;
      case 'rating':
        orderBy.rating = 'desc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { recipeId },
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.review.count({ where: { recipeId } }),
    ]);

    return reply.send({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: total > pageNum * limitNum,
      },
    });
  });

  // Create review
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      recipeId: z.string(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(2000).optional(),
      images: z.array(z.string().url()).max(5).optional(),
    });

    try {
      const data = schema.parse(request.body);

      // Check if recipe exists
      const recipe = await prisma.recipe.findUnique({
        where: { id: data.recipeId },
      });

      if (!recipe) {
        return reply.status(404).send({ error: 'Recipe not found' });
      }

      // Check if user already reviewed
      const existing = await prisma.review.findUnique({
        where: {
          recipeId_userId: {
            recipeId: data.recipeId,
            userId: request.user!.id,
          },
        },
      });

      if (existing) {
        return reply.status(400).send({ error: 'You have already reviewed this recipe' });
      }

      const review = await prisma.review.create({
        data: {
          ...data,
          userId: request.user!.id,
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      return reply.status(201).send(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Mark review as helpful
  fastify.post('/:id/helpful', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return reply.status(404).send({ error: 'Review not found' });
    }

    const existing = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId: id,
          userId: request.user!.id,
        },
      },
    });

    if (existing) {
      // Remove helpful mark
      await prisma.reviewHelpful.delete({
        where: { id: existing.id },
      });
      await prisma.review.update({
        where: { id },
        data: { helpful: { decrement: 1 } },
      });
      return reply.send({ marked: false });
    } else {
      // Add helpful mark
      await prisma.reviewHelpful.create({
        data: {
          reviewId: id,
          userId: request.user!.id,
        },
      });
      await prisma.review.update({
        where: { id },
        data: { helpful: { increment: 1 } },
      });
      return reply.send({ marked: true });
    }
  });

  // Delete review
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return reply.status(404).send({ error: 'Review not found' });
    }

    if (review.userId !== request.user!.id) {
      return reply.status(403).send({ error: 'Not authorized' });
    }

    await prisma.review.delete({
      where: { id },
    });

    return reply.send({ message: 'Review deleted' });
  });
}
