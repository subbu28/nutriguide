import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../services/email.service.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', async (request, reply) => {
    try {
      const { email, password, name } = registerSchema.parse(request.body);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user with settings
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          settings: {
            create: {},
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          isPremium: true,
          isEmailVerified: true,
          createdAt: true,
        },
      });

      // Generate JWT
      const token = fastify.jwt.sign({ userId: user.id });

      // Set cookie
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Send welcome email (non-blocking)
      sendWelcomeEmail(user.email, user.name).catch((error) => {
        fastify.log.error('Failed to send welcome email:', error);
      });

      return reply.send({
        user,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: { settings: true },
      });

      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = fastify.jwt.sign({ userId: user.id });

      // Set cookie
      reply.setCookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          isPremium: user.isPremium,
          isEmailVerified: user.isEmailVerified,
          settings: user.settings,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Get current user
  fastify.get('/me', { preHandler: authenticate }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.id },
      include: { settings: true },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.send({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      isPremium: user.isPremium,
      isEmailVerified: user.isEmailVerified,
      settings: user.settings,
    });
  });

  // Logout
  fastify.post('/logout', async (request, reply) => {
    reply.clearCookie('token');
    return reply.send({ message: 'Logged out successfully' });
  });

  // Update profile
  fastify.patch('/profile', { preHandler: authenticate }, async (request, reply) => {
    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      avatar: z.string().url().optional(),
      bio: z.string().max(500).optional(),
    });

    try {
      const data = updateSchema.parse(request.body);

      const user = await prisma.user.update({
        where: { id: request.user!.id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          bio: true,
          isPremium: true,
          isEmailVerified: true,
        },
      });

      return reply.send(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Change password
  fastify.post('/change-password', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    });

    try {
      const { currentPassword, newPassword } = schema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { id: request.user!.id },
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return reply.status(401).send({ error: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      return reply.send({ message: 'Password updated successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });
}
