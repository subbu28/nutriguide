import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { broadcastToFamily } from '../websocket/index.js';

const createFamilySchema = z.object({
  name: z.string().min(2).max(50),
});

export async function familyRoutes(fastify: FastifyInstance) {
  // Create a family group
  fastify.post('/', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createFamilySchema.parse(request.body);

    const family = await prisma.family.create({
      data: {
        name: body.name,
        ownerId: request.user.id,
        members: {
          create: {
            userId: request.user.id,
            role: 'OWNER',
          }
        }
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, avatar: true } } }
        }
      }
    });

    return { family };
  });

  // Get user's families
  fastify.get('/', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const memberships = await prisma.familyMember.findMany({
      where: { userId: request.user.id },
      include: {
        family: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, avatar: true } } }
            },
            _count: { select: { mealPolls: true, messages: true } }
          }
        }
      }
    });

    const families = memberships.map(m => ({
      ...m.family,
      myRole: m.role,
    }));

    return { families };
  });

  // Get family by ID
  fastify.get('/:familyId', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { familyId } = request.params as { familyId: string };

    const membership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user.id,
          familyId,
        }
      }
    });

    if (!membership) {
      return reply.status(403).send({ error: 'Not a member of this family' });
    }

    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, avatar: true, email: true } } }
        },
        mealPolls: {
          where: { status: 'ACTIVE' },
          include: {
            suggestions: {
              include: {
                user: { select: { id: true, name: true } },
                _count: { select: { votes: true } }
              }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    return { family, myRole: membership.role };
  });

  // Join family by invite code
  fastify.post('/join', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { inviteCode } = request.body as { inviteCode: string };

    const family = await prisma.family.findUnique({
      where: { inviteCode }
    });

    if (!family) {
      return reply.status(404).send({ error: 'Invalid invite code' });
    }

    const existingMember = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user.id,
          familyId: family.id,
        }
      }
    });

    if (existingMember) {
      return reply.status(400).send({ error: 'Already a member of this family' });
    }

    await prisma.familyMember.create({
      data: {
        userId: request.user.id,
        familyId: family.id,
        role: 'MEMBER',
      }
    });

    // Create notification for family members
    const members = await prisma.familyMember.findMany({
      where: { familyId: family.id, userId: { not: request.user.id } }
    });

    await prisma.notification.createMany({
      data: members.map(m => ({
        userId: m.userId,
        title: 'New Family Member',
        body: `${request.user.name} has joined ${family.name}`,
        type: 'FAMILY_INVITE',
        data: { familyId: family.id },
      }))
    });

    // Broadcast to family
    broadcastToFamily(family.id, {
      type: 'MEMBER_JOINED',
      payload: { userId: request.user.id, userName: request.user.name, familyId: family.id }
    });

    return { message: 'Joined family successfully', familyId: family.id };
  });

  // Leave family
  fastify.delete('/:familyId/leave', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { familyId } = request.params as { familyId: string };

    const membership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user.id,
          familyId,
        }
      }
    });

    if (!membership) {
      return reply.status(404).send({ error: 'Not a member of this family' });
    }

    if (membership.role === 'OWNER') {
      // Transfer ownership or delete family
      const otherMembers = await prisma.familyMember.findMany({
        where: { familyId, userId: { not: request.user.id } },
        orderBy: { joinedAt: 'asc' }
      });

      if (otherMembers.length > 0) {
        // Transfer to oldest member
        await prisma.familyMember.update({
          where: { id: otherMembers[0].id },
          data: { role: 'OWNER' }
        });
        await prisma.family.update({
          where: { id: familyId },
          data: { ownerId: otherMembers[0].userId }
        });
      } else {
        // Delete family if no other members
        await prisma.family.delete({ where: { id: familyId } });
        return { message: 'Family deleted' };
      }
    }

    await prisma.familyMember.delete({
      where: { id: membership.id }
    });

    return { message: 'Left family successfully' };
  });

  // Remove member (admin/owner only)
  fastify.delete('/:familyId/members/:memberId', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { familyId, memberId } = request.params as { familyId: string; memberId: string };

    const myMembership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user.id,
          familyId,
        }
      }
    });

    if (!myMembership || (myMembership.role !== 'OWNER' && myMembership.role !== 'ADMIN')) {
      return reply.status(403).send({ error: 'Not authorized to remove members' });
    }

    const targetMember = await prisma.familyMember.findFirst({
      where: { familyId, userId: memberId }
    });

    if (!targetMember) {
      return reply.status(404).send({ error: 'Member not found' });
    }

    if (targetMember.role === 'OWNER') {
      return reply.status(403).send({ error: 'Cannot remove the owner' });
    }

    await prisma.familyMember.delete({
      where: { id: targetMember.id }
    });

    return { message: 'Member removed' };
  });

  // Regenerate invite code
  fastify.post('/:familyId/regenerate-invite', {
    preHandler: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { familyId } = request.params as { familyId: string };

    const membership = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user.id,
          familyId,
        }
      }
    });

    if (!membership || membership.role !== 'OWNER') {
      return reply.status(403).send({ error: 'Only owner can regenerate invite code' });
    }

    const family = await prisma.family.update({
      where: { id: familyId },
      data: { inviteCode: crypto.randomUUID().slice(0, 8).toUpperCase() }
    });

    return { inviteCode: family.inviteCode };
  });
}
