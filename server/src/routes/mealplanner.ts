import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

// Sample meals database for in-house planner with diet type
interface SampleMeal {
  id: string;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  dietType: 'vegetarian' | 'vegan' | 'non-vegetarian';
}

const SAMPLE_MEALS: Record<string, SampleMeal[]> = {
  BREAKFAST: [
    { id: 'b1', title: 'Avocado Toast with Eggs', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400', readyInMinutes: 15, servings: 2, calories: 380, protein: 14, fat: 22, carbohydrates: 32, dietType: 'vegetarian' },
    { id: 'b2', title: 'Greek Yogurt Parfait', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', readyInMinutes: 10, servings: 1, calories: 320, protein: 18, fat: 8, carbohydrates: 48, dietType: 'vegetarian' },
    { id: 'b3', title: 'Overnight Oats', image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400', readyInMinutes: 5, servings: 1, calories: 350, protein: 12, fat: 10, carbohydrates: 55, dietType: 'vegan' },
    { id: 'b4', title: 'Smoothie Bowl', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400', readyInMinutes: 10, servings: 1, calories: 290, protein: 8, fat: 6, carbohydrates: 52, dietType: 'vegan' },
    { id: 'b5', title: 'Veggie Omelette', image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400', readyInMinutes: 15, servings: 1, calories: 340, protein: 22, fat: 24, carbohydrates: 8, dietType: 'vegetarian' },
    { id: 'b6', title: 'Banana Pancakes', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', readyInMinutes: 20, servings: 2, calories: 420, protein: 10, fat: 12, carbohydrates: 68, dietType: 'vegetarian' },
    { id: 'b7', title: 'Veggie Breakfast Burrito', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', readyInMinutes: 20, servings: 1, calories: 480, protein: 20, fat: 22, carbohydrates: 48, dietType: 'vegetarian' },
  ],
  LUNCH: [
    { id: 'l1', title: 'Garden Fresh Salad', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', readyInMinutes: 15, servings: 2, calories: 280, protein: 12, fat: 14, carbohydrates: 28, dietType: 'vegan' },
    { id: 'l2', title: 'Quinoa Buddha Bowl', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', readyInMinutes: 30, servings: 2, calories: 450, protein: 18, fat: 16, carbohydrates: 58, dietType: 'vegan' },
    { id: 'l3', title: 'Grilled Chicken Wrap', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', readyInMinutes: 15, servings: 1, calories: 380, protein: 28, fat: 14, carbohydrates: 35, dietType: 'non-vegetarian' },
    { id: 'l4', title: 'Mediterranean Mezze', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', readyInMinutes: 20, servings: 2, calories: 520, protein: 16, fat: 32, carbohydrates: 42, dietType: 'vegetarian' },
    { id: 'l5', title: 'Veggie Noodle Bowl', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', readyInMinutes: 25, servings: 2, calories: 380, protein: 14, fat: 12, carbohydrates: 58, dietType: 'vegan' },
    { id: 'l6', title: 'Caprese Sandwich', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', readyInMinutes: 10, servings: 1, calories: 440, protein: 18, fat: 22, carbohydrates: 42, dietType: 'vegetarian' },
    { id: 'l7', title: 'Lentil Soup', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', readyInMinutes: 35, servings: 4, calories: 320, protein: 18, fat: 8, carbohydrates: 48, dietType: 'vegan' },
    { id: 'l8', title: 'Falafel Pita', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', readyInMinutes: 20, servings: 2, calories: 420, protein: 16, fat: 18, carbohydrates: 52, dietType: 'vegan' },
  ],
  DINNER: [
    { id: 'd1', title: 'Grilled Salmon with Vegetables', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', readyInMinutes: 30, servings: 2, calories: 520, protein: 42, fat: 28, carbohydrates: 22, dietType: 'non-vegetarian' },
    { id: 'd2', title: 'Tofu Stir Fry', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', readyInMinutes: 25, servings: 4, calories: 320, protein: 22, fat: 14, carbohydrates: 28, dietType: 'vegan' },
    { id: 'd3', title: 'Pasta Primavera', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400', readyInMinutes: 30, servings: 4, calories: 420, protein: 14, fat: 16, carbohydrates: 58, dietType: 'vegetarian' },
    { id: 'd4', title: 'Black Bean Tacos', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400', readyInMinutes: 25, servings: 4, calories: 380, protein: 18, fat: 12, carbohydrates: 52, dietType: 'vegan' },
    { id: 'd5', title: 'Vegetable Curry', image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400', readyInMinutes: 35, servings: 4, calories: 380, protein: 12, fat: 18, carbohydrates: 45, dietType: 'vegan' },
    { id: 'd6', title: 'Mushroom Risotto', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400', readyInMinutes: 40, servings: 4, calories: 450, protein: 12, fat: 18, carbohydrates: 62, dietType: 'vegetarian' },
    { id: 'd7', title: 'Eggplant Parmesan', image: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400', readyInMinutes: 45, servings: 4, calories: 380, protein: 16, fat: 20, carbohydrates: 38, dietType: 'vegetarian' },
    { id: 'd8', title: 'Stuffed Bell Peppers', image: 'https://images.unsplash.com/photo-1601000938365-f182c5ec2f2a?w=400', readyInMinutes: 50, servings: 4, calories: 340, protein: 14, fat: 12, carbohydrates: 48, dietType: 'vegetarian' },
  ],
};

// Helper to filter meals by diet type
function filterMealsByDiet(meals: SampleMeal[], diet?: string): SampleMeal[] {
  if (!diet) return meals;
  
  const dietLower = diet.toLowerCase();
  
  if (dietLower === 'vegetarian') {
    return meals.filter(m => m.dietType === 'vegetarian' || m.dietType === 'vegan');
  }
  if (dietLower === 'vegan') {
    return meals.filter(m => m.dietType === 'vegan');
  }
  
  return meals;
}

const DIET_OPTIONS = [
  { value: '', label: 'No Restriction' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'low-carb', label: 'Low Carb' },
];

export default async function mealPlannerRoutes(fastify: FastifyInstance) {
  // Get meal planner status
  fastify.get('/status', async (request, reply) => {
    return reply.send({
      spoonacularEnabled: !!process.env.SPOONACULAR_API_KEY,
      inHouseEnabled: true, // Always available
      geminiEnabled: !!process.env.GEMINI_API_KEY,
      dietOptions: DIET_OPTIONS,
    });
  });

  // Generate meal plan
  fastify.post('/generate', { preHandler: optionalAuth }, async (request, reply) => {
    const schema = z.object({
      timeFrame: z.enum(['day', 'week']).default('week'),
      targetCalories: z.number().int().positive().default(2000),
      diet: z.string().optional(),
      exclude: z.string().optional(),
      source: z.enum(['auto', 'spoonacular', 'inhouse']).default('auto'),
    });

    const { timeFrame, targetCalories, diet, exclude, source } = schema.parse(request.body);

    // Generate using in-house planner with diet filtering
    const generateDayPlan = (usedIds: Set<string> = new Set()) => {
      const selectMeal = (slot: 'BREAKFAST' | 'LUNCH' | 'DINNER') => {
        // First filter by diet, then by used IDs
        const dietFiltered = filterMealsByDiet(SAMPLE_MEALS[slot], diet);
        const meals = dietFiltered.filter(m => !usedIds.has(m.id));
        const meal = meals[Math.floor(Math.random() * meals.length)] || dietFiltered[0];
        if (meal) usedIds.add(meal.id);
        return meal;
      };

      const breakfast = selectMeal('BREAKFAST');
      const lunch = selectMeal('LUNCH');
      const dinner = selectMeal('DINNER');

      return {
        meals: [breakfast, lunch, dinner],
        nutrients: {
          calories: breakfast.calories + lunch.calories + dinner.calories,
          protein: breakfast.protein + lunch.protein + dinner.protein,
          fat: breakfast.fat + lunch.fat + dinner.fat,
          carbohydrates: breakfast.carbohydrates + lunch.carbohydrates + dinner.carbohydrates,
        },
      };
    };

    if (timeFrame === 'day') {
      return reply.send({
        mealPlan: generateDayPlan(),
        source: 'inhouse',
      });
    }

    // Generate week plan
    const usedIds = new Set<string>();
    const week: Record<string, any> = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      week[day] = generateDayPlan(usedIds);
    }

    return reply.send({
      mealPlan: { week },
      source: 'inhouse',
    });
  });

  // Regenerate single meal
  fastify.post('/regenerate-meal', { preHandler: optionalAuth }, async (request, reply) => {
    const schema = z.object({
      slot: z.enum(['breakfast', 'lunch', 'dinner']),
      diet: z.string().optional(),
      exclude: z.string().optional(),
      excludeMealIds: z.array(z.string()).optional(),
    });

    const { slot, diet, excludeMealIds = [] } = schema.parse(request.body);
    const slotKey = slot.toUpperCase() as 'BREAKFAST' | 'LUNCH' | 'DINNER';
    
    // Filter by diet first, then exclude used IDs
    const dietFiltered = filterMealsByDiet(SAMPLE_MEALS[slotKey], diet);
    const meals = dietFiltered.filter(m => !excludeMealIds.includes(m.id));
    const meal = meals[Math.floor(Math.random() * meals.length)] || dietFiltered[0];

    return reply.send({ meal });
  });

  // Get recipe details
  fastify.get('/recipe/:recipeId', { preHandler: optionalAuth }, async (request, reply) => {
    const { recipeId } = request.params as { recipeId: string };
    const { source } = request.query as { source?: string };

    // Check in sample meals first
    for (const slot of ['BREAKFAST', 'LUNCH', 'DINNER'] as const) {
      const meal = SAMPLE_MEALS[slot].find(m => m.id === recipeId);
      if (meal) {
        return reply.send({
          recipe: {
            id: meal.id,
            title: meal.title,
            image: meal.image,
            readyInMinutes: meal.readyInMinutes,
            servings: meal.servings,
            nutrition: {
              calories: meal.calories,
              protein: meal.protein,
              fat: meal.fat,
              carbohydrates: meal.carbohydrates,
            },
            extendedIngredients: [],
            instructions: 'Recipe details coming soon.',
          },
        });
      }
    }

    // Check in database recipes
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { author: true },
    });

    if (recipe) {
      return reply.send({
        recipe: {
          id: recipe.id,
          title: recipe.title,
          image: recipe.images?.[0],
          readyInMinutes: (recipe.prepTime || 0) + (recipe.cookTime || 0),
          servings: recipe.servings,
          nutrition: {
            calories: recipe.calories,
            protein: recipe.protein,
            fat: recipe.fat,
            carbohydrates: recipe.carbs,
          },
          extendedIngredients: recipe.ingredients,
          instructions: recipe.instructions,
        },
      });
    }
  });

  // Get all meal plans for user
  fastify.get('/plans', { preHandler: authenticate }, async (request, reply) => {
    try {
      const plans = await prisma.mealPlan.findMany({
        where: { userId: request.user!.id },
        orderBy: { createdAt: 'desc' },
        include: {
          meals: {
            orderBy: [{ date: 'asc' }, { slot: 'asc' }],
          },
          _count: {
            select: { meals: true },
          },
        },
      });

      if (!reply.sent) {
        return reply.send({ plans });
      }
    } catch (error) {
      if (!reply.sent) {
        return reply.status(500).send({ error: 'Failed to fetch meal plans' });
      }
    }
  });

  // Get specific meal plan
  fastify.get('/plans/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const plan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId: request.user!.id,
      },
      include: {
        meals: {
          orderBy: [{ date: 'asc' }, { slot: 'asc' }],
        },
      },
    });

    if (!plan) {
      return reply.status(404).send({ error: 'Meal plan not found' });
    }

    return reply.send(plan);
  });

  // Create meal plan
  fastify.post('/plans', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      name: z.string().min(1).max(100),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      targetCalories: z.number().int().positive().optional(),
      diet: z.string().optional(),
      excludeIngredients: z.string().optional(),
      meals: z.array(z.object({
        date: z.string().datetime(),
        slot: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
        recipeId: z.string(),
        recipeName: z.string(),
        recipeImage: z.string().optional(),
        recipeData: z.record(z.any()),
        servings: z.number().int().positive().default(1),
      })).optional(),
    });

    try {
      const data = schema.parse(request.body);

      const plan = await prisma.mealPlan.create({
        data: {
          userId: request.user!.id,
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          targetCalories: data.targetCalories,
          diet: data.diet,
          excludeIngredients: data.excludeIngredients,
          meals: data.meals ? {
            create: data.meals.map(m => ({
              ...m,
              date: new Date(m.date),
            })),
          } : undefined,
        },
        include: {
          meals: true,
        },
      });

      return reply.status(201).send(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Delete meal plan
  fastify.delete('/plans/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.mealPlan.deleteMany({
      where: {
        id,
        userId: request.user!.id,
      },
    });

    return reply.send({ message: 'Meal plan deleted' });
  });

  // Add meal to plan
  fastify.post('/plans/:id/meals', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const schema = z.object({
      date: z.string().datetime(),
      slot: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
      recipeId: z.string(),
      recipeName: z.string(),
      recipeImage: z.string().optional(),
      recipeData: z.record(z.any()),
      servings: z.number().int().positive().default(1),
    });

    try {
      const data = schema.parse(request.body);

      const plan = await prisma.mealPlan.findFirst({
        where: {
          id,
          userId: request.user!.id,
        },
      });

      if (!plan) {
        return reply.status(404).send({ error: 'Meal plan not found' });
      }

      const meal = await prisma.plannedMeal.create({
        data: {
          mealPlanId: id,
          ...data,
          date: new Date(data.date),
        },
      });

      return reply.status(201).send(meal);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(400).send({ error: 'A meal is already planned for this slot' });
      }
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Update planned meal
  fastify.patch('/meals/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const schema = z.object({
      servings: z.number().int().positive().optional(),
      completed: z.boolean().optional(),
    });

    try {
      const data = schema.parse(request.body);

      const meal = await prisma.plannedMeal.findFirst({
        where: {
          id,
          mealPlan: { userId: request.user!.id },
        },
      });

      if (!meal) {
        return reply.status(404).send({ error: 'Planned meal not found' });
      }

      const updated = await prisma.plannedMeal.update({
        where: { id },
        data,
      });

      return reply.send(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });

  // Delete planned meal
  fastify.delete('/meals/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.plannedMeal.deleteMany({
      where: {
        id,
        mealPlan: { userId: request.user!.id },
      },
    });

    return reply.send({ message: 'Meal removed from plan' });
  });
}
