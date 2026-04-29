import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export default async function favoriteRoutes(fastify: FastifyInstance) {
  // Get user's favorites
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const querySchema = z.object({
      category: z.string().optional(),
      page: z.string().default('1'),
      limit: z.string().default('20'),
    });

    const { category, page, limit } = querySchema.parse(request.query);
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);

    const where: any = { userId: request.user!.id };
    if (category) {
      where.category = category;
    }

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.favorite.count({ where }),
    ]);

    return reply.send({
      favorites,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: total > pageNum * limitNum,
      },
    });
  });

  // Add to favorites
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      mealId: z.string(),
      mealName: z.string(),
      mealData: z.record(z.any()),
      category: z.string().optional(),
      dietType: z.string().optional(),
    });

    try {
      const data = schema.parse(request.body);

      const favorite = await prisma.favorite.upsert({
        where: {
          userId_mealId: {
            userId: request.user!.id,
            mealId: data.mealId,
          },
        },
        create: {
          userId: request.user!.id,
          ...data,
        },
        update: data,
      });

      return reply.send(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Remove from favorites
  fastify.delete('/:mealId', { preHandler: authenticate }, async (request, reply) => {
    const { mealId } = request.params as { mealId: string };

    await prisma.favorite.deleteMany({
      where: {
        userId: request.user!.id,
        mealId,
      },
    });

    return reply.send({ message: 'Removed from favorites' });
  });

  // Check if meal is favorited
  fastify.get('/check/:mealId', { preHandler: authenticate }, async (request, reply) => {
    const { mealId } = request.params as { mealId: string };

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_mealId: {
          userId: request.user!.id,
          mealId,
        },
      },
    });

    return reply.send({ isFavorited: !!favorite });
  });
}
