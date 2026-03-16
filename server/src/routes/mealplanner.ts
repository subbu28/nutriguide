import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import * as spoonacular from '../services/spoonacular.js';
import * as inHousePlanner from '../services/meal-planner.js';
import * as mealdb from '../services/mealdb.js';

export async function mealPlannerRoutes(fastify: FastifyInstance) {
  // Check planner availability status
  fastify.get('/status', async () => {
    return {
      // Spoonacular status
      spoonacularEnabled: spoonacular.isSpoonacularEnabled(),
      // In-house planner status
      inHouseEnabled: inHousePlanner.isInHousePlannerEnabled(),
      geminiEnabled: inHousePlanner.isGeminiEnabled(),
      // Diet options (combined from both)
      dietOptions: spoonacular.isSpoonacularEnabled() 
        ? spoonacular.DIET_OPTIONS 
        : inHousePlanner.getDietOptions(),
      intoleranceOptions: spoonacular.INTOLERANCE_OPTIONS,
    };
  });

  // Generate meal plan - supports both Spoonacular and in-house
  fastify.post('/generate', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { timeFrame, targetCalories, diet, exclude, source } = request.body as {
      timeFrame: 'day' | 'week';
      targetCalories?: number;
      diet?: string;
      exclude?: string;
      source?: 'spoonacular' | 'inhouse' | 'auto';
    };

    const plannerSource = source || 'auto';

    try {
      // Use Spoonacular if explicitly requested and available
      if (plannerSource === 'spoonacular' && spoonacular.isSpoonacularEnabled()) {
        const mealPlan = await spoonacular.generateMealPlan({
          timeFrame,
          targetCalories,
          diet,
          exclude,
        });
        return { mealPlan, source: 'spoonacular' };
      }

      // Use in-house planner if explicitly requested or as fallback
      if (plannerSource === 'inhouse' || plannerSource === 'auto') {
        const mealPlan = await inHousePlanner.generateMealPlan({
          timeFrame,
          targetCalories,
          diet,
          exclude,
        });
        return { 
          mealPlan, 
          source: inHousePlanner.isGeminiEnabled() ? 'inhouse-gemini' : 'inhouse-rules' 
        };
      }

      // Auto mode: try Spoonacular first, fallback to in-house
      if (spoonacular.isSpoonacularEnabled()) {
        try {
          const mealPlan = await spoonacular.generateMealPlan({
            timeFrame,
            targetCalories,
            diet,
            exclude,
          });
          return { mealPlan, source: 'spoonacular' };
        } catch {
          // Fallback to in-house
        }
      }

      // Fallback: use in-house planner
      const mealPlan = await inHousePlanner.generateMealPlan({
        timeFrame,
        targetCalories,
        diet,
        exclude,
      });
      return { 
        mealPlan, 
        source: inHousePlanner.isGeminiEnabled() ? 'inhouse-gemini' : 'inhouse-rules' 
      };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Regenerate a single meal slot (in-house only)
  fastify.post('/regenerate-meal', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { slot, diet, exclude, excludeMealIds } = request.body as {
      slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      diet?: string;
      exclude?: string;
      excludeMealIds?: string[];
    };

    try {
      const meal = await inHousePlanner.regenerateMeal(
        slot,
        { timeFrame: 'day', diet, exclude },
        excludeMealIds || []
      );

      if (!meal) {
        return reply.status(404).send({ error: 'No suitable meal found' });
      }

      return { meal };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Get recipe details - supports both Spoonacular and MealDB
  fastify.get('/recipe/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { source } = request.query as { source?: string };

    try {
      // If it's a MealDB ID or source is inhouse
      if (source === 'inhouse' || id.startsWith('mealdb-') || !spoonacular.isSpoonacularEnabled()) {
        const meal = await mealdb.getMealById(id);
        if (!meal) {
          return reply.status(404).send({ error: 'Recipe not found' });
        }
        
        // Transform to match expected format
        return {
          recipe: {
            id: meal.id,
            title: meal.name,
            image: meal.imageUrl,
            servings: 4,
            readyInMinutes: 45,
            sourceUrl: meal.youtubeUrl,
            summary: `A delicious ${meal.category} dish from ${meal.area} cuisine.`,
            instructions: meal.instructions?.join('\n'),
            extendedIngredients: meal.ingredients?.map((ing, idx) => ({
              id: idx,
              name: ing.name,
              amount: 1,
              unit: ing.measure,
              original: `${ing.measure} ${ing.name}`,
            })),
            diets: meal.dietType === 'Vegetarian' ? ['vegetarian'] : [],
            dishTypes: [meal.category.toLowerCase()],
          },
          source: 'mealdb',
        };
      }

      // Use Spoonacular
      const recipe = await spoonacular.getRecipeInfo(parseInt(id, 10));
      return { recipe, source: 'spoonacular' };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Save a meal plan
  fastify.post('/plans', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { name, startDate, endDate, targetCalories, diet, excludeIngredients, meals } = request.body as {
      name: string;
      startDate: string;
      endDate: string;
      targetCalories?: number;
      diet?: string;
      excludeIngredients?: string;
      meals: {
        date: string;
        slot: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
        recipeId: string;
        recipeName: string;
        recipeImage?: string;
        recipeData: any;
        servings?: number;
      }[];
    };

    try {
      const mealPlan = await prisma.mealPlan.create({
        data: {
          userId,
          name,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          targetCalories,
          diet,
          excludeIngredients,
          meals: {
            create: meals.map(meal => ({
              date: new Date(meal.date),
              slot: meal.slot,
              recipeId: meal.recipeId,
              recipeName: meal.recipeName,
              recipeImage: meal.recipeImage,
              recipeData: meal.recipeData,
              servings: meal.servings || 1,
            })),
          },
        },
        include: {
          meals: true,
        },
      });

      return { mealPlan };
    } catch (error: any) {
      return reply.status(500).send({ error: error.message });
    }
  });

  // Get user's meal plans
  fastify.get('/plans', { preHandler: [fastify.authenticate] }, async (request) => {
    const userId = (request.user as any).id;

    const mealPlans = await prisma.mealPlan.findMany({
      where: { userId },
      include: {
        meals: {
          orderBy: [{ date: 'asc' }, { slot: 'asc' }],
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return { mealPlans };
  });

  // Get a specific meal plan
  fastify.get('/plans/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as { id: string };

    const mealPlan = await prisma.mealPlan.findFirst({
      where: { id, userId },
      include: {
        meals: {
          orderBy: [{ date: 'asc' }, { slot: 'asc' }],
        },
      },
    });

    if (!mealPlan) {
      return reply.status(404).send({ error: 'Meal plan not found' });
    }

    return { mealPlan };
  });

  // Update a meal plan
  fastify.patch('/plans/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as { id: string };
    const { name, targetCalories, diet, excludeIngredients } = request.body as {
      name?: string;
      targetCalories?: number;
      diet?: string;
      excludeIngredients?: string;
    };

    const existing = await prisma.mealPlan.findFirst({ where: { id, userId } });
    if (!existing) {
      return reply.status(404).send({ error: 'Meal plan not found' });
    }

    const mealPlan = await prisma.mealPlan.update({
      where: { id },
      data: { name, targetCalories, diet, excludeIngredients },
      include: { meals: true },
    });

    return { mealPlan };
  });

  // Delete a meal plan
  fastify.delete('/plans/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as { id: string };

    const existing = await prisma.mealPlan.findFirst({ where: { id, userId } });
    if (!existing) {
      return reply.status(404).send({ error: 'Meal plan not found' });
    }

    await prisma.mealPlan.delete({ where: { id } });
    return { message: 'Meal plan deleted' };
  });

  // Add a meal to a plan
  fastify.post('/plans/:id/meals', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as { id: string };
    const { date, slot, recipeId, recipeName, recipeImage, recipeData, servings } = request.body as {
      date: string;
      slot: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
      recipeId: string;
      recipeName: string;
      recipeImage?: string;
      recipeData: any;
      servings?: number;
    };

    const mealPlan = await prisma.mealPlan.findFirst({ where: { id, userId } });
    if (!mealPlan) {
      return reply.status(404).send({ error: 'Meal plan not found' });
    }

    const meal = await prisma.plannedMeal.create({
      data: {
        mealPlanId: id,
        date: new Date(date),
        slot,
        recipeId,
        recipeName,
        recipeImage,
        recipeData,
        servings: servings || 1,
      },
    });

    return { meal };
  });

  // Update a planned meal
  fastify.patch('/meals/:mealId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { mealId } = request.params as { mealId: string };
    const { servings, completed } = request.body as {
      servings?: number;
      completed?: boolean;
    };

    const meal = await prisma.plannedMeal.findFirst({
      where: { id: mealId },
      include: { mealPlan: true },
    });

    if (!meal || meal.mealPlan.userId !== userId) {
      return reply.status(404).send({ error: 'Meal not found' });
    }

    const updated = await prisma.plannedMeal.update({
      where: { id: mealId },
      data: { servings, completed },
    });

    return { meal: updated };
  });

  // Delete a planned meal
  fastify.delete('/meals/:mealId', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { mealId } = request.params as { mealId: string };

    const meal = await prisma.plannedMeal.findFirst({
      where: { id: mealId },
      include: { mealPlan: true },
    });

    if (!meal || meal.mealPlan.userId !== userId) {
      return reply.status(404).send({ error: 'Meal not found' });
    }

    await prisma.plannedMeal.delete({ where: { id: mealId } });
    return { message: 'Meal removed from plan' };
  });

  // Get current week's meal plan
  fastify.get('/current', { preHandler: [fastify.authenticate] }, async (request) => {
    const userId = (request.user as any).id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        userId,
        startDate: { lte: today },
        endDate: { gte: today },
      },
      include: {
        meals: {
          orderBy: [{ date: 'asc' }, { slot: 'asc' }],
        },
      },
    });

    return { mealPlan };
  });
}
