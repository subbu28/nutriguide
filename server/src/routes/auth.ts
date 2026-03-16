import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = registerSchema.parse(request.body);
      
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email }
      });

      if (existingUser) {
        return reply.status(400).send({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(body.password, 12);

      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          isPremium: true,
          createdAt: true,
        }
      });

      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
      });

      reply
        .setCookie('token', token, {
          path: '/',
          httpOnly: true,
          secure: !config.isDev,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
        .send({ user, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      throw error;
    }
  });

  // Login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = loginSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { email: body.email }
      });

      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(body.password, user.password);

      if (!validPassword) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
        isPremium: user.isPremium,
      });

      reply
        .setCookie('token', token, {
          path: '/',
          httpOnly: true,
          secure: !config.isDev,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
        })
        .send({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isPremium: user.isPremium,
            avatar: user.avatar,
          },
          token
        });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Invalid input', details: error.errors });
      }
      throw error;
    }
  });

  // Logout
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    reply
      .clearCookie('token', { path: '/' })
      .send({ message: 'Logged out successfully' });
  });

  // Get current user
  fastify.get('/me', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
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
          }
        }
      }
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return { user };
  });

  // Update profile
  fastify.patch('/profile', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      avatar: z.string().url().optional(),
    });

    const body = updateSchema.parse(request.body);

    const user = await prisma.user.update({
      where: { id: request.user.id },
      data: body,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isPremium: true,
      }
    });

    return { user };
  });

  // Change password
  fastify.post('/change-password', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const schema = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8),
    });

    const body = schema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { id: request.user.id }
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(body.currentPassword, user.password);

    if (!validPassword) {
      return reply.status(400).send({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 12);

    await prisma.user.update({
      where: { id: request.user.id },
      data: { password: hashedPassword }
    });

    return { message: 'Password changed successfully' };
  });
}
