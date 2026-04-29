import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.authorization;
    let token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;
    
    // If no token in header, try cookie
    if (!token) {
      token = request.cookies.token;
    }

    if (!token) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    // Verify JWT
    const decoded = await request.jwtVerify<{ userId: string }>();
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { settings: true },
    });

    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }

    request.user = user;
    done();
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
}

export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  try {
    const authHeader = request.headers.authorization;
    let token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;
    
    if (!token) {
      token = request.cookies.token;
    }

    if (!token) {
      done();
      return;
    }

    const decoded = await request.jwtVerify<{ userId: string }>();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { settings: true },
    });

    if (user) {
      request.user = user;
    }
    done();
  } catch {
    done();
  }
}

export function requirePremium(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  if (!request.user?.isPremium) {
    return reply.status(403).send({ error: 'Premium subscription required' });
  }
  done();
}
