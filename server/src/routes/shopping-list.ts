import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const categories = [
  'Produce', 'Dairy', 'Meat', 'Seafood', 'Bakery',
  'Frozen', 'Pantry', 'Beverages', 'Household', 'Other',
];

export default async function shoppingListRoutes(fastify: FastifyInstance) {
  // Get user's shopping lists
  fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
    const lists = await prisma.shoppingList.findMany({
      where: { userId: request.user!.id },
      include: {
        items: {
          orderBy: [{ category: 'asc' }, { name: 'asc' }],
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return reply.send({ lists });
  });

  // Get single shopping list
  fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const list = await prisma.shoppingList.findFirst({
      where: {
        id,
        userId: request.user!.id,
      },
      include: {
        items: {
          orderBy: [{ category: 'asc' }, { name: 'asc' }],
        },
      },
    });

    if (!list) {
      return reply.status(404).send({ error: 'Shopping list not found' });
    }

    return reply.send(list);
  });

  // Create shopping list
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      name: z.string().min(1).max(100),
      isTemplate: z.boolean().default(false),
      items: z.array(z.object({
        name: z.string().min(1),
        amount: z.number().positive().optional(),
        unit: z.string().optional(),
        category: z.enum(categories as [string, ...string[]]).default('Other'),
        notes: z.string().optional(),
      })).optional(),
    });

    try {
      const data = schema.parse(request.body);

      const list = await prisma.shoppingList.create({
        data: {
          userId: request.user!.id,
          name: data.name,
          isTemplate: data.isTemplate,
          items: data.items ? {
            create: data.items,
          } : undefined,
        },
        include: {
          items: true,
        },
      });

      return reply.status(201).send(list);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Update shopping list
  fastify.patch('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const schema = z.object({
      name: z.string().min(1).max(100).optional(),
    });

    try {
      const data = schema.parse(request.body);

      const list = await prisma.shoppingList.updateMany({
        where: {
          id,
          userId: request.user!.id,
        },
        data,
      });

      if (list.count === 0) {
        return reply.status(404).send({ error: 'Shopping list not found' });
      }

      return reply.send({ message: 'Shopping list updated' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Delete shopping list
  fastify.delete('/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.shoppingList.deleteMany({
      where: {
        id,
        userId: request.user!.id,
      },
    });

    return reply.send({ message: 'Shopping list deleted' });
  });

  // Add item to list
  fastify.post('/:id/items', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const schema = z.object({
      name: z.string().min(1),
      amount: z.number().positive().optional(),
      unit: z.string().optional(),
      category: z.enum(categories as [string, ...string[]]).default('Other'),
      notes: z.string().optional(),
    });

    try {
      const data = schema.parse(request.body);

      const list = await prisma.shoppingList.findFirst({
        where: {
          id,
          userId: request.user!.id,
        },
      });

      if (!list) {
        return reply.status(404).send({ error: 'Shopping list not found' });
      }

      const item = await prisma.shoppingItem.create({
        data: {
          listId: id,
          ...data,
        },
      });

      return reply.status(201).send(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Update item
  fastify.patch('/:id/items/:itemId', { preHandler: authenticate }, async (request, reply) => {
    const { id, itemId } = request.params as { id: string; itemId: string };
    const schema = z.object({
      name: z.string().min(1).optional(),
      amount: z.number().positive().optional().nullable(),
      unit: z.string().optional().nullable(),
      category: z.enum(categories as [string, ...string[]]).optional(),
      checked: z.boolean().optional(),
      notes: z.string().optional().nullable(),
    });

    try {
      const data = schema.parse(request.body);

      const list = await prisma.shoppingList.findFirst({
        where: {
          id,
          userId: request.user!.id,
        },
      });

      if (!list) {
        return reply.status(404).send({ error: 'Shopping list not found' });
      }

      const item = await prisma.shoppingItem.update({
        where: { id: itemId },
        data,
      });

      return reply.send(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Delete item
  fastify.delete('/:id/items/:itemId', { preHandler: authenticate }, async (request, reply) => {
    const { id, itemId } = request.params as { id: string; itemId: string };

    const list = await prisma.shoppingList.findFirst({
      where: {
        id,
        userId: request.user!.id,
      },
    });

    if (!list) {
      return reply.status(404).send({ error: 'Shopping list not found' });
    }

    await prisma.shoppingItem.delete({
      where: { id: itemId },
    });

    return reply.send({ message: 'Item deleted' });
  });

  // Generate from meal plan
  fastify.post('/generate-from-plan', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      mealPlanId: z.string(),
    });

    try {
      const { mealPlanId } = schema.parse(request.body);

      const mealPlan = await prisma.mealPlan.findFirst({
        where: {
          id: mealPlanId,
          userId: request.user!.id,
        },
        include: {
          meals: true,
        },
      });

      if (!mealPlan) {
        return reply.status(404).send({ error: 'Meal plan not found' });
      }

      // Extract ingredients from meals (simplified)
      const items = mealPlan.meals.map((meal: any) => ({
        name: meal.recipeName,
        category: 'Other',
      }));

      const list = await prisma.shoppingList.create({
        data: {
          userId: request.user!.id,
          name: `Shopping for ${mealPlan.name}`,
          items: {
            create: items,
          },
        },
        include: {
          items: true,
        },
      });

      return reply.send(list);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });
}
