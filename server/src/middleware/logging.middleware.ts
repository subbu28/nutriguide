/**
 * Logging Middleware - Request/Response Logging for Fastify
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger, logRequest } from '../lib/logger.js';

export async function loggingMiddleware(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    request.startTime = Date.now();
    logger.debug({
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
    }, 'Incoming request');
  });

  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const responseTime = Date.now() - (request.startTime || Date.now());
    logRequest(request, reply, responseTime);
  });

  fastify.addHook('onError', async (request: FastifyRequest, reply: FastifyReply, error: Error) => {
    logger.error({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    }, 'Request error');
  });
}

declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number;
  }
}
