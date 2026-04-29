import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export default async function userRoutes(fastify: FastifyInstance) {
  // Get user settings
  fastify.get('/settings', { preHandler: authenticate }, async (request, reply) => {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: request.user!.id },
    });

    return reply.send(settings);
  });

  // Update settings
  fastify.patch('/settings', { preHandler: authenticate }, async (request, reply) => {
    const settingsSchema = z.object({
      dietaryPreferences: z.array(z.string()).optional(),
      allergies: z.array(z.string()).optional(),
      calorieGoal: z.number().int().positive().optional(),
      proteinGoal: z.number().int().positive().optional(),
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      pollReminders: z.boolean().optional(),
      familyUpdates: z.boolean().optional(),
      theme: z.enum(['light', 'dark', 'system']).optional(),
      language: z.string().optional(),
      measurementUnit: z.enum(['metric', 'imperial']).optional(),
      defaultCuisine: z.string().optional(),
    });

    try {
      const data = settingsSchema.parse(request.body);

      const settings = await prisma.userSettings.upsert({
        where: { userId: request.user!.id },
        create: {
          userId: request.user!.id,
          ...data,
        },
        update: data,
      });

      return reply.send(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Get user stats
  fastify.get('/stats', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user!.id;

    const [
      favoritesCount,
      recipesCount,
      reviewsCount,
      mealPlansCount,
      mealLogsCount,
      familiesCount,
    ] = await Promise.all([
      prisma.favorite.count({ where: { userId } }),
      prisma.recipe.count({ where: { authorId: userId } }),
      prisma.review.count({ where: { userId } }),
      prisma.mealPlan.count({ where: { userId } }),
      prisma.mealLog.count({ where: { userId } }),
      prisma.familyMember.count({ where: { userId } }),
    ]);

    return reply.send({
      favorites: favoritesCount,
      recipes: recipesCount,
      reviews: reviewsCount,
      mealPlans: mealPlansCount,
      mealLogs: mealLogsCount,
      families: familiesCount,
    });
  });

  // Delete account
  fastify.delete('/profile', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      password: z.string(),
    });

    try {
      const { password } = schema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: request.user!.id },
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const bcrypt = await import('bcryptjs');
      const validPassword = await bcrypt.default.compare(password, user.password);
      if (!validPassword) {
        return reply.status(401).send({ error: 'Password is incorrect' });
      }

      await prisma.user.delete({
        where: { id: user.id },
      });

      reply.clearCookie('token');
      return reply.send({ message: 'Account deleted successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });
}
