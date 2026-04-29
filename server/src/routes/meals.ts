import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { fetchMealsFromMealDB, searchMeals, getMealById } from '../services/mealdb.js';
import { getSmartRecommendations } from '../services/gemini.js';
import { optionalAuth } from '../middleware/auth.js';

export default async function mealRoutes(fastify: FastifyInstance) {
  // Get meals with filters
  fastify.get('/', { preHandler: optionalAuth }, async (request, reply) => {
    const querySchema = z.object({
      category: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Juices', 'Dessert', 'Seafood', 'Vegetarian', 'Vegan']).optional(),
      diet: z.string().optional(),
      cuisine: z.string().optional(),
      search: z.string().optional(),
      page: z.string().default('1'),
      limit: z.string().default('20'),
    });

    try {
      const { category, diet, cuisine, search, page, limit } = querySchema.parse(request.query);
      
      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 50);

      let meals;
      
      if (search) {
        meals = await searchMeals(search);
      } else {
        meals = await fetchMealsFromMealDB({
          category,
          area: cuisine,
        });
      }

      // Apply diet filter client-side if specified
      if (diet && meals) {
        meals = meals.filter((meal: any) => {
          const tags = meal.strTags?.toLowerCase() || '';
          return tags.includes(diet.toLowerCase());
        });
      }

      // Pagination
      const start = (pageNum - 1) * limitNum;
      const paginatedMeals = meals?.slice(start, start + limitNum) || [];

      return reply.send({
        meals: paginatedMeals,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: meals?.length || 0,
          hasMore: (meals?.length || 0) > start + limitNum,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Get random meals
  fastify.get('/random', async (request, reply) => {
    const querySchema = z.object({
      count: z.string().default('5'),
    });

    try {
      const { count } = querySchema.parse(request.query);
      const countNum = Math.min(parseInt(count), 20);

      const meals = await fetchMealsFromMealDB({ random: true, count: countNum });
      return reply.send({ meals });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Get meal by ID
  fastify.get('/:id', { preHandler: optionalAuth }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const meal = await getMealById(id);
    
    if (!meal) {
      return reply.status(404).send({ error: 'Meal not found' });
    }

    return reply.send({ meal });
  });

  // Get available cuisines
  fastify.get('/cuisines', async (request, reply) => {
    const cuisines = [
      'American', 'British', 'Canadian', 'Chinese', 'Croatian', 'Dutch',
      'Egyptian', 'Filipino', 'French', 'Greek', 'Indian', 'Irish',
      'Italian', 'Jamaican', 'Japanese', 'Kenyan', 'Malaysian', 'Mexican',
      'Moroccan', 'Polish', 'Portuguese', 'Russian', 'Spanish', 'Thai',
      'Tunisian', 'Turkish', 'Unknown', 'Vietnamese',
    ];

    return reply.send({ cuisines });
  });

  // Get meals by cuisine
  fastify.get('/cuisine/:cuisine', async (request, reply) => {
    const { cuisine } = request.params as { cuisine: string };
    
    const meals = await fetchMealsFromMealDB({ area: cuisine });
    return reply.send({ meals });
  });

  // AI-powered meal recommendations
  fastify.post('/recommendations', { preHandler: optionalAuth }, async (request, reply) => {
    const schema = z.object({
      preferences: z.string().optional(),
      dietaryRestrictions: z.array(z.string()).optional(),
      calories: z.number().int().optional(),
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
    });

    try {
      const params = schema.parse(request.body);
      
      const recommendations = await getSmartRecommendations({
        ...params,
        userId: request.user?.id,
      });

      return reply.send({ recommendations });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });
}
