import { FastifyRequest } from 'fastify';
import { User } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string };
    user: User;
  }
}
