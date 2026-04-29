import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import config from '../config/index.js';

const stripe = config.stripeSecretKey ? new Stripe(config.stripeSecretKey, { apiVersion: '2024-04-10' }) : null;

export default async function paymentMethodRoutes(fastify: FastifyInstance) {
  // Get saved payment methods
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const methods = await prisma.paymentMethod.findMany({
      where: { userId: request.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ methods });
  });

  // Create setup intent for adding new card
  fastify.post('/setup-intent', { preHandler: authenticate }, async (request, reply) => {
    if (!stripe) {
      return reply.status(503).send({ error: 'Payment service not configured' });
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user!.id },
    });

    let customerId = user?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user!.email,
        name: user!.name,
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: request.user!.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
    });

    return reply.send({ clientSecret: setupIntent.client_secret });
  });

  // Save payment method (called after setup intent succeeds)
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    if (!stripe) {
      return reply.status(503).send({ error: 'Payment service not configured' });
    }

    const schema = z.object({
      paymentMethodId: z.string(),
    });

    try {
      const { paymentMethodId } = schema.parse(request.body);

      const stripeMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

      if (stripeMethod.type !== 'card') {
        return reply.status(400).send({ error: 'Only card payment methods are supported' });
      }

      const card = stripeMethod.card!;

      // If this is the first payment method, set as default
      const existingCount = await prisma.paymentMethod.count({
        where: { userId: request.user!.id },
      });

      const method = await prisma.paymentMethod.create({
        data: {
          userId: request.user!.id,
          stripePaymentMethodId: paymentMethodId,
          brand: card.brand,
          last4: card.last4,
          expMonth: card.exp_month,
          expYear: card.exp_year,
          isDefault: existingCount === 0,
        },
      });

      return reply.status(201).send(method);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Set default payment method
  fastify.patch('/:id/default', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // Unset current default
    await prisma.paymentMethod.updateMany({
      where: {
        userId: request.user!.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Set new default
    await prisma.paymentMethod.updateMany({
      where: {
        id,
        userId: request.user!.id,
      },
      data: { isDefault: true },
    });

    return reply.send({ message: 'Default payment method updated' });
  });

  // Delete payment method
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    if (!stripe) {
      return reply.status(503).send({ error: 'Payment service not configured' });
    }

    const { id } = request.params as { id: string };

    const method = await prisma.paymentMethod.findFirst({
      where: {
        id,
        userId: request.user!.id,
      },
    });

    if (!method) {
      return reply.status(404).send({ error: 'Payment method not found' });
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(method.stripePaymentMethodId);

    await prisma.paymentMethod.delete({
      where: { id },
    });

    return reply.send({ message: 'Payment method deleted' });
  });
}
