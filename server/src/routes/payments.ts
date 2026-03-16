import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';

const stripe = new Stripe(config.stripeSecretKey);

export async function paymentRoutes(fastify: FastifyInstance) {
  // Create checkout session for premium subscription
  fastify.post('/create-checkout-session', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id }
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    if (user.isPremium) {
      return reply.status(400).send({ error: 'Already a premium member' });
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id }
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: config.stripePriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${config.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/payment/cancel`,
      metadata: { userId: user.id }
    });

    return { sessionId: session.id, url: session.url };
  });

  // Create one-time payment (e.g., for meal plans)
  fastify.post('/create-payment-intent', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { amount, description } = request.body as { amount: number; description?: string };

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: { userId: request.user.id },
      description: description || 'NutriGuide Purchase',
    });

    return { clientSecret: paymentIntent.client_secret };
  });

  // Webhook handler for Stripe events
  fastify.post('/webhook', {
    config: { rawBody: true }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const sig = request.headers['stripe-signature'] as string;
    const rawBody = (request as any).rawBody;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, config.stripeWebhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return reply.status(400).send({ error: 'Webhook Error' });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

          await prisma.user.update({
            where: { id: userId },
            data: { isPremium: true }
          });

          await prisma.subscription.create({
            data: {
              userId,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              status: 'ACTIVE',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
          });

          await prisma.payment.create({
            data: {
              stripePaymentId: session.payment_intent as string,
              userId,
              amount: session.amount_total || 0,
              currency: session.currency || 'usd',
              status: 'SUCCEEDED',
              type: 'SUBSCRIPTION',
            }
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status.toUpperCase() as any,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          }
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id }
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'CANCELED' }
          });

          await prisma.user.update({
            where: { id: sub.userId },
            data: { isPremium: false }
          });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata?.userId;

        if (userId) {
          await prisma.payment.create({
            data: {
              stripePaymentId: paymentIntent.id,
              userId,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              status: 'SUCCEEDED',
              type: 'ONE_TIME',
            }
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata?.userId;

        if (userId) {
          await prisma.payment.create({
            data: {
              stripePaymentId: paymentIntent.id,
              userId,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              status: 'FAILED',
              type: 'ONE_TIME',
            }
          });
        }
        break;
      }
    }

    return { received: true };
  });

  // Get user's subscription status
  fastify.get('/subscription', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: request.user.id }
    });

    return { subscription, isPremium: request.user.isPremium };
  });

  // Cancel subscription
  fastify.post('/cancel-subscription', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: request.user.id }
    });

    if (!subscription) {
      return reply.status(404).send({ error: 'No active subscription' });
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true }
    });

    return { message: 'Subscription will be canceled at period end' };
  });

  // Get payment history
  fastify.get('/history', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const payments = await prisma.payment.findMany({
      where: { userId: request.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return { payments };
  });
}
