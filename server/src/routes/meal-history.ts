import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export default async function mealHistoryRoutes(fastify: FastifyInstance) {
  // Get meal logs
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const querySchema = z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      page: z.string().default('1'),
      limit: z.string().default('30'),
    });

    const { startDate, endDate, page, limit } = querySchema.parse(request.query);
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);

    const where: any = { userId: request.user!.id };
    
    if (startDate || endDate) {
      where.consumedAt = {};
      if (startDate) where.consumedAt.gte = new Date(startDate);
      if (endDate) where.consumedAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.mealLog.findMany({
        where,
        orderBy: { consumedAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
              images: true,
            },
          },
        },
      }),
      prisma.mealLog.count({ where }),
    ]);

    return reply.send({
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        hasMore: total > pageNum * limitNum,
      },
    });
  });

  // Get nutrition stats
  fastify.get('/stats', { preHandler: authenticate }, async (request, reply) => {
    const querySchema = z.object({
      days: z.string().default('7'),
    });

    const { days } = querySchema.parse(request.query);
    const daysNum = parseInt(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const logs = await prisma.mealLog.findMany({
      where: {
        userId: request.user!.id,
        consumedAt: {
          gte: startDate,
        },
      },
    });

    // Calculate totals and averages
    const totals = logs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0) * log.servings,
      protein: acc.protein + (log.protein || 0) * log.servings,
      carbs: acc.carbs + (log.carbs || 0) * log.servings,
      fat: acc.fat + (log.fat || 0) * log.servings,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const daysWithData = new Set(logs.map(l => l.consumedAt.toDateString())).size || 1;

    return reply.send({
      period: daysNum,
      totals,
      dailyAverage: {
        calories: Math.round(totals.calories / daysWithData),
        protein: Math.round(totals.protein / daysWithData),
        carbs: Math.round(totals.carbs / daysWithData),
        fat: Math.round(totals.fat / daysWithData),
      },
      mealCount: logs.length,
      daysTracked: daysWithData,
    });
  });

  // Get daily breakdown
  fastify.get('/daily', { preHandler: authenticate }, async (request, reply) => {
    const querySchema = z.object({
      date: z.string().datetime(),
    });

    const { date } = querySchema.parse(request.query);
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const logs = await prisma.mealLog.findMany({
      where: {
        userId: request.user!.id,
        consumedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
      orderBy: { consumedAt: 'asc' },
    });

    const totals = logs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0) * log.servings,
      protein: acc.protein + (log.protein || 0) * log.servings,
      carbs: acc.carbs + (log.carbs || 0) * log.servings,
      fat: acc.fat + (log.fat || 0) * log.servings,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return reply.send({
      date: startOfDay,
      meals: logs,
      totals,
    });
  });

  // Log a meal
  fastify.post('/log', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      recipeId: z.string().optional(),
      mealName: z.string().min(1),
      mealData: z.record(z.any()),
      servings: z.number().positive().default(1),
      mealSlot: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
      consumedAt: z.string().datetime().optional(),
      calories: z.number().positive().optional(),
      protein: z.number().positive().optional(),
      carbs: z.number().positive().optional(),
      fat: z.number().positive().optional(),
      mood: z.string().optional(),
      notes: z.string().optional(),
    });

    try {
      const data = schema.parse(request.body);

      const log = await prisma.mealLog.create({
        data: {
          ...data,
          userId: request.user!.id,
          consumedAt: data.consumedAt ? new Date(data.consumedAt) : new Date(),
        },
        include: {
          recipe: {
            select: {
              id: true,
              title: true,
              images: true,
            },
          },
        },
      });

      return reply.status(201).send(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Update meal log
  fastify.patch('/log/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const schema = z.object({
      servings: z.number().positive().optional(),
      consumedAt: z.string().datetime().optional(),
      mood: z.string().optional(),
      notes: z.string().optional(),
    });

    try {
      const data = schema.parse(request.body);

      const log = await prisma.mealLog.findFirst({
        where: {
          id,
          userId: request.user!.id,
        },
      });

      if (!log) {
        return reply.status(404).send({ error: 'Meal log not found' });
      }

      const updated = await prisma.mealLog.update({
        where: { id },
        data: {
          ...data,
          consumedAt: data.consumedAt ? new Date(data.consumedAt) : undefined,
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

  // Delete meal log
  fastify.delete('/log/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.mealLog.deleteMany({
      where: {
        id,
        userId: request.user!.id,
      },
    });

    return reply.send({ message: 'Meal log deleted' });
  });
}
