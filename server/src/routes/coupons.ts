import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export default async function couponRoutes(fastify: FastifyInstance) {
  // Validate coupon
  fastify.post('/validate', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      code: z.string(),
    });

    try {
      const { code } = schema.parse(request.body);

      const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!coupon) {
        return reply.status(404).send({ error: 'Invalid coupon code' });
      }

      if (!coupon.isActive) {
        return reply.status(400).send({ error: 'Coupon is no longer active' });
      }

      if (coupon.validUntil && new Date() > coupon.validUntil) {
        return reply.status(400).send({ error: 'Coupon has expired' });
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return reply.status(400).send({ error: 'Coupon usage limit reached' });
      }

      // Check if user already redeemed
      const existingRedemption = await prisma.couponRedemption.findUnique({
        where: {
          couponId_userId: {
            couponId: coupon.id,
            userId: request.user!.id,
          },
        },
      });

      if (existingRedemption) {
        return reply.status(400).send({ error: 'You have already used this coupon' });
      }

      return reply.send({
        valid: true,
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });
}
