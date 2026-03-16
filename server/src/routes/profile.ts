import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

interface UpdateProfileBody {
  name?: string;
  email?: string;
  avatar?: string;
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

interface UpdateSettingsBody {
  dietaryPreferences?: string[];
  allergies?: string[];
  calorieGoal?: number | null;
  proteinGoal?: number | null;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  pollReminders?: boolean;
  familyUpdates?: boolean;
  theme?: string;
  language?: string;
  measurementUnit?: string;
  defaultCuisine?: string | null;
}

export async function profileRoutes(fastify: FastifyInstance) {
  // Get current user profile
  fastify.get('/profile', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isPremium: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            familyMemberships: true,
          },
        },
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return {
      ...user,
      favoritesCount: user._count.favorites,
      familiesCount: user._count.familyMemberships,
    };
  });

  // Update profile
  fastify.patch<{ Body: UpdateProfileBody }>('/profile', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { name, email, avatar } = request.body;

    // Check if email is taken
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: request.user.id },
        },
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'Email already in use' });
      }
    }

    const user = await prisma.user.update({
      where: { id: request.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isPremium: true,
      },
    });

    return user;
  });

  // Change password
  fastify.post<{ Body: ChangePasswordBody }>('/profile/password', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body;

    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return reply.status(400).send({ error: 'Current password is incorrect' });
    }

    if (newPassword.length < 6) {
      return reply.status(400).send({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: request.user.id },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  });

  // Delete account
  fastify.delete('/profile', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    await prisma.user.delete({
      where: { id: request.user.id },
    });

    return { message: 'Account deleted successfully' };
  });

  // Get user settings
  fastify.get('/settings', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    let settings = await prisma.userSettings.findUnique({
      where: { userId: request.user.id },
    });

    // Create default settings if not exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId: request.user.id },
      });
    }

    return settings;
  });

  // Update user settings
  fastify.patch<{ Body: UpdateSettingsBody }>('/settings', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const {
      dietaryPreferences,
      allergies,
      calorieGoal,
      proteinGoal,
      emailNotifications,
      pushNotifications,
      pollReminders,
      familyUpdates,
      theme,
      language,
      measurementUnit,
      defaultCuisine,
    } = request.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId: request.user.id },
      create: {
        userId: request.user.id,
        ...(dietaryPreferences && { dietaryPreferences }),
        ...(allergies && { allergies }),
        ...(calorieGoal !== undefined && { calorieGoal }),
        ...(proteinGoal !== undefined && { proteinGoal }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
        ...(pollReminders !== undefined && { pollReminders }),
        ...(familyUpdates !== undefined && { familyUpdates }),
        ...(theme && { theme }),
        ...(language && { language }),
        ...(measurementUnit && { measurementUnit }),
        ...(defaultCuisine !== undefined && { defaultCuisine }),
      },
      update: {
        ...(dietaryPreferences && { dietaryPreferences }),
        ...(allergies && { allergies }),
        ...(calorieGoal !== undefined && { calorieGoal }),
        ...(proteinGoal !== undefined && { proteinGoal }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
        ...(pollReminders !== undefined && { pollReminders }),
        ...(familyUpdates !== undefined && { familyUpdates }),
        ...(theme && { theme }),
        ...(language && { language }),
        ...(measurementUnit && { measurementUnit }),
        ...(defaultCuisine !== undefined && { defaultCuisine }),
      },
    });

    return settings;
  });

  // Get user stats
  fastify.get('/profile/stats', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const [favorites, families, votes, suggestions] = await Promise.all([
      prisma.favorite.count({ where: { userId: request.user.id } }),
      prisma.familyMember.count({ where: { userId: request.user.id } }),
      prisma.vote.count({ where: { userId: request.user.id } }),
      prisma.mealSuggestion.count({ where: { userId: request.user.id } }),
    ]);

    return {
      favorites,
      families,
      votes,
      suggestions,
    };
  });
}
