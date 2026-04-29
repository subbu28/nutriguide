import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

export default async function familyRoutes(fastify: FastifyInstance) {
  // Get user's families
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const families = await prisma.family.findMany({
      where: {
        OR: [
          { ownerId: request.user!.id },
          { members: { some: { userId: request.user!.id } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    return reply.send({ families });
  });

  // Create family
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      name: z.string().min(2).max(50),
    });

    try {
      const { name } = schema.parse(request.body);

      const family = await prisma.family.create({
        data: {
          name,
          ownerId: request.user!.id,
          members: {
            create: {
              userId: request.user!.id,
              role: 'OWNER',
            },
          },
        },
        include: {
          owner: {
            select: { id: true, name: true, avatar: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
      });

      return reply.send(family);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Get family details
  fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const family = await prisma.family.findFirst({
      where: {
        id,
        OR: [
          { ownerId: request.user!.id },
          { members: { some: { userId: request.user!.id } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        mealPolls: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!family) {
      return reply.status(404).send({ error: 'Family not found' });
    }

    // Find current user's role in this family
    const myMembership = family.members.find(m => m.userId === request.user!.id);
    const myRole = myMembership?.role || (family.ownerId === request.user!.id ? 'OWNER' : null);

    return reply.send({ ...family, myRole });
  });

  // Join family with invite code
  fastify.post('/join', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      inviteCode: z.string(),
    });

    try {
      const { inviteCode } = schema.parse(request.body);

      const family = await prisma.family.findUnique({
        where: { inviteCode },
      });

      if (!family) {
        return reply.status(404).send({ error: 'Invalid invite code' });
      }

      // Check if already a member
      const existingMember = await prisma.familyMember.findUnique({
        where: {
          userId_familyId: {
            userId: request.user!.id,
            familyId: family.id,
          },
        },
      });

      if (existingMember) {
        return reply.status(400).send({ error: 'Already a member of this family' });
      }

      await prisma.familyMember.create({
        data: {
          userId: request.user!.id,
          familyId: family.id,
          role: 'MEMBER',
        },
      });

      return reply.send({ message: 'Joined family successfully', familyId: family.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Leave family
  fastify.delete('/:id/leave', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const family = await prisma.family.findUnique({
      where: { id },
    });

    if (!family) {
      return reply.status(404).send({ error: 'Family not found' });
    }

    if (family.ownerId === request.user!.id) {
      return reply.status(400).send({ error: 'Owner cannot leave family. Transfer ownership or delete family.' });
    }

    await prisma.familyMember.deleteMany({
      where: {
        userId: request.user!.id,
        familyId: id,
      },
    });

    return reply.send({ message: 'Left family successfully' });
  });

  // Regenerate invite code
  fastify.post('/:id/regenerate-invite', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const family = await prisma.family.findFirst({
      where: {
        id,
        ownerId: request.user!.id,
      },
    });

    if (!family) {
      return reply.status(404).send({ error: 'Family not found or not authorized' });
    }

    const updatedFamily = await prisma.family.update({
      where: { id },
      data: {
        inviteCode: crypto.randomUUID(),
      },
      select: { inviteCode: true },
    });

    return reply.send(updatedFamily);
  });

  // Update member role
  fastify.patch('/:id/members/:userId/role', { preHandler: authenticate }, async (request, reply) => {
    const { id, userId } = request.params as { id: string; userId: string };
    const schema = z.object({
      role: z.enum(['ADMIN', 'MEMBER']),
    });

    try {
      const { role } = schema.parse(request.body);

      const family = await prisma.family.findFirst({
        where: {
          id,
          OR: [
            { ownerId: request.user!.id },
          ],
        },
      });

      if (!family) {
        return reply.status(403).send({ error: 'Not authorized' });
      }

      const member = await prisma.familyMember.update({
        where: {
          userId_familyId: {
            userId,
            familyId: id,
          },
        },
        data: { role },
      });

      return reply.send(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Remove member
  fastify.delete('/:id/members/:userId', { preHandler: authenticate }, async (request, reply) => {
    const { id, userId } = request.params as { id: string; userId: string };

    const family = await prisma.family.findFirst({
      where: {
        id,
        ownerId: request.user!.id,
      },
    });

    if (!family) {
      return reply.status(403).send({ error: 'Not authorized' });
    }

    await prisma.familyMember.delete({
      where: {
        userId_familyId: {
          userId,
          familyId: id,
        },
      },
    });

    return reply.send({ message: 'Member removed' });
  });

  // Add member by login email
  fastify.post('/:id/members', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const schema = z.object({
      email: z.string().email(),
      role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
    });

    try {
      const { email, role } = schema.parse(request.body);

      // Check if requester is owner or admin
      const requesterMembership = await prisma.familyMember.findFirst({
        where: {
          familyId: id,
          userId: request.user!.id,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      });

      if (!requesterMembership) {
        return reply.status(403).send({ error: 'Only owners and admins can add members' });
      }

      // Find user by email (login ID)
      const userToAdd = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, avatar: true },
      });

      if (!userToAdd) {
        return reply.status(404).send({ error: 'User not found with this email' });
      }

      // Check if already a member
      const existingMember = await prisma.familyMember.findUnique({
        where: {
          userId_familyId: {
            userId: userToAdd.id,
            familyId: id,
          },
        },
      });

      console.log('Add member check:', { 
        email, 
        userToAddId: userToAdd.id, 
        familyId: id, 
        existingMember: existingMember ? 'YES' : 'NO' 
      });

      if (existingMember) {
        return reply.status(400).send({ error: 'User is already a member of this family' });
      }

      // Add member
      const member = await prisma.familyMember.create({
        data: {
          userId: userToAdd.id,
          familyId: id,
          role,
        },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // Get family details for notification
      const family = await prisma.family.findUnique({
        where: { id },
        select: { name: true },
      });

      // Create notification for the added user (ignore errors)
      try {
        await prisma.notification.create({
          data: {
            userId: userToAdd.id,
            type: 'FAMILY_INVITE',
            title: 'Added to Family',
            body: `You were added to ${family?.name || 'a family group'}`,
            data: { familyId: id },
          },
        });
      } catch (notifyErr: any) {
        console.log('Notification creation failed:', notifyErr.code, notifyErr.message);
      }

      // Create system message in family chat (ignore errors)
      try {
        await prisma.message.create({
          data: {
            familyId: id,
            userId: request.user!.id,
            content: `${userToAdd.name} joined the family`,
            type: 'MEMBER_JOINED',
            metadata: { addedUserId: userToAdd.id, addedUserName: userToAdd.name },
          },
        });
      } catch (msgErr: any) {
        console.log('Message creation failed:', msgErr.code, msgErr.message);
      }

      return reply.status(201).send(member);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      if (error.code === 'P2002') {
        return reply.status(400).send({ error: 'User is already a member of this family' });
      }
      throw error;
    }
  });

  // Get family members
  fastify.get('/:id/members', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    // Check membership
    const isMember = await prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId: request.user!.id,
          familyId: id,
        },
      },
    });

    if (!isMember) {
      return reply.status(403).send({ error: 'Not a member of this family' });
    }

    const members = await prisma.familyMember.findMany({
      where: { familyId: id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: [
        { role: 'asc' },
        { joinedAt: 'asc' },
      ],
    });

    return reply.send({ members });
  });
}
