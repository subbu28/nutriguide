import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const addFavoriteSchema = z.object({
  mealId: z.string(),
  mealName: z.string(),
  mealData: z.any(),
  category: z.string(),
  dietType: z.string(),
});

export async function favoritesRoutes(fastify: FastifyInstance) {
  // Get user's favorites
  fastify.get('/', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { category, dietType } = request.query as { category?: string; dietType?: string };

    const where: any = { userId: request.user.id };
    if (category) where.category = category;
    if (dietType) where.dietType = dietType;

    const favorites = await prisma.favorite.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return { favorites };
  });

  // Add to favorites
  fastify.post('/', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = addFavoriteSchema.parse(request.body);

      const existing = await prisma.favorite.findUnique({
        where: {
          userId_mealId: {
            userId: request.user.id,
            mealId: body.mealId,
          }
        }
      });

      if (existing) {
        return reply.status(400).send({ error: 'Meal already in favorites' });
      }

      const favorite = await prisma.favorite.create({
        data: {
          userId: request.user.id,
          mealId: body.mealId,
          mealName: body.mealName,
          mealData: body.mealData,
          category: body.category,
          dietType: body.dietType,
        }
      });

      return { favorite };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      throw error;
    }
  });

  // Remove from favorites
  fastify.delete('/:mealId', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { mealId } = request.params as { mealId: string };

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_mealId: {
          userId: request.user.id,
          mealId,
        }
      }
    });

    if (!favorite) {
      return reply.status(404).send({ error: 'Favorite not found' });
    }

    await prisma.favorite.delete({
      where: { id: favorite.id }
    });

    return { message: 'Removed from favorites' };
  });

  // Check if meal is favorited
  fastify.get('/check/:mealId', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { mealId } = request.params as { mealId: string };

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_mealId: {
          userId: request.user.id,
          mealId,
        }
      }
    });

    return { isFavorite: !!favorite };
  });

  // Get favorites count
  fastify.get('/count', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const count = await prisma.favorite.count({
      where: { userId: request.user.id }
    });

    return { count };
  });
}
