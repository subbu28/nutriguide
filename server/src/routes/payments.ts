import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import config from '../config/index.js';

const stripe = config.stripeSecretKey ? new Stripe(config.stripeSecretKey, { apiVersion: '2024-04-10' }) : null;

export default async function paymentRoutes(fastify: FastifyInstance) {
  // Create checkout session
  fastify.post('/create-checkout-session', { preHandler: authenticate }, async (request, reply) => {
    if (!stripe) {
      return reply.status(503).send({ error: 'Payment service not configured' });
    }

    const schema = z.object({
      priceId: z.string().optional(),
      successUrl: z.string().url(),
      cancelUrl: z.string().url(),
      couponCode: z.string().optional(),
    });

    try {
      const { priceId, successUrl, cancelUrl, couponCode } = schema.parse(request.body);
      const effectivePriceId = priceId || config.stripePriceId;

      if (!effectivePriceId) {
        return reply.status(400).send({ error: 'Price ID not configured' });
      }

      // Get or create Stripe customer
      let user = await prisma.user.findUnique({
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

      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: effectivePriceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId: request.user!.id,
        },
      };

      // Apply coupon if provided
      if (couponCode) {
        const coupon = await prisma.coupon.findUnique({
          where: { code: couponCode.toUpperCase() },
        });

        if (coupon?.stripeCouponId) {
          sessionConfig.discounts = [
            {
              coupon: coupon.stripeCouponId,
            },
          ];
        }
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      return reply.send({ sessionId: session.id, url: session.url });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      console.error('Stripe error:', error);
      return reply.status(500).send({ error: 'Payment processing error' });
    }
  });

  // Get subscription status
  fastify.get('/subscription', { preHandler: authenticate }, async (request, reply) => {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: request.user!.id },
    });

    return reply.send({ subscription });
  });

  // Cancel subscription
  fastify.post('/cancel-subscription', { preHandler: authenticate }, async (request, reply) => {
    if (!stripe) {
      return reply.status(503).send({ error: 'Payment service not configured' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: request.user!.id },
    });

    if (!subscription) {
      return reply.status(404).send({ error: 'No active subscription' });
    }

    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        cancelAtPeriodEnd: true,
      },
    });

    return reply.send({ message: 'Subscription will be canceled at the end of the billing period' });
  });

  // Get payment history
  fastify.get('/history', { preHandler: authenticate }, async (request, reply) => {
    const payments = await prisma.payment.findMany({
      where: { userId: request.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ payments });
  });

  // Webhook handler
  fastify.post('/webhook', { config: { rawBody: true } }, async (request, reply) => {
    if (!stripe || !config.stripeWebhookSecret) {
      return reply.status(503).send({ error: 'Webhook not configured' });
    }

    const sig = request.headers['stripe-signature'] as string;
    const payload = request.body as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, config.stripeWebhookSecret);
    } catch (err: any) {
      return reply.status(400).send({ error: `Webhook Error: ${err.message}` });
    }

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              status: subscription.status.toUpperCase() as any,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              status: subscription.status.toUpperCase() as any,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: { isPremium: true },
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.customer && invoice.amount_paid > 0) {
          await prisma.payment.create({
            data: {
              stripePaymentId: invoice.id,
              userId: invoice.metadata?.userId || '',
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'SUCCEEDED',
              type: 'SUBSCRIPTION',
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'CANCELED' },
        });

        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (sub) {
          await prisma.user.update({
            where: { id: sub.userId },
            data: { isPremium: false },
          });
        }
        break;
      }
    }

    return reply.send({ received: true });
  });
}
