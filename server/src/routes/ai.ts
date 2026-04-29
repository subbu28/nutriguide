import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, requirePremium } from '../middleware/auth.js';
import { GoogleGenAI } from '@google/genai';
import config from '../config/index.js';

const genAI = config.geminiApiKey ? new GoogleGenAI({ apiKey: config.geminiApiKey }) : null;

export default async function aiRoutes(fastify: FastifyInstance) {
  // AI meal chat/conversation
  fastify.post('/chat', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      message: z.string().min(1).max(2000),
      conversationId: z.string().optional(),
    });

    try {
      const { message, conversationId } = schema.parse(request.body);

      // Check AI query limit for non-premium users
      if (!request.user!.isPremium) {
        const queryCount = await prisma.aIConversation.count({
          where: {
            userId: request.user!.id,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
            },
          },
        });

        if (queryCount >= 20) {
          return reply.status(403).send({ 
            error: 'AI query limit reached. Upgrade to premium for unlimited queries.',
            code: 'QUERY_LIMIT_REACHED',
          });
        }
      }

      if (!genAI) {
        return reply.status(503).send({ error: 'AI service not configured' });
      }

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await prisma.aIConversation.findFirst({
          where: {
            id: conversationId,
            userId: request.user!.id,
          },
        });
      }

      const messages = conversation?.messages as any[] || [];
      messages.push({ role: 'user', content: message, timestamp: new Date() });

      // Build prompt with user context
      const userSettings = await prisma.userSettings.findUnique({
        where: { userId: request.user!.id },
      });

      const systemPrompt = `You are NutriGuide AI, a helpful meal planning assistant. 
User preferences: ${userSettings?.dietaryPreferences?.join(', ') || 'None specified'}
Allergies: ${userSettings?.allergies?.join(', ') || 'None'}
Calorie goal: ${userSettings?.calorieGoal || 'Not set'}

Provide helpful, specific meal suggestions with ingredients and basic instructions. Keep responses concise but informative.`;

      const model = genAI.models;
      const result = await model.generateContent({
        model: 'gemini-2.0-flash',
        contents: `${systemPrompt}\n\nUser: ${message}`,
      });

      const responseText = result.text || 'I apologize, but I could not generate a response at this time.';

      messages.push({ role: 'assistant', content: responseText, timestamp: new Date() });

      // Save conversation
      if (conversation) {
        await prisma.aIConversation.update({
          where: { id: conversation.id },
          data: { messages: messages as any },
        });
      } else {
        conversation = await prisma.aIConversation.create({
          data: {
            userId: request.user!.id,
            title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
            messages: messages as any,
          },
        });
      }

      return reply.send({
        response: responseText,
        conversationId: conversation.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      console.error('AI Error:', error);
      return reply.status(500).send({ error: 'AI service error' });
    }
  });

  // Get conversation history
  fastify.get('/conversations', { preHandler: authenticate }, async (request, reply) => {
    const conversations = await prisma.aIConversation.findMany({
      where: { userId: request.user!.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return reply.send({ conversations });
  });

  fastify.get('/conversations/:id', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id,
        userId: request.user!.id,
      },
    });

    if (!conversation) {
      return reply.status(404).send({ error: 'Conversation not found' });
    }

    return reply.send(conversation);
  });

  // Generate meal plan with AI
  fastify.post('/generate-meal-plan', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      days: z.number().int().min(1).max(14).default(7),
      calorieTarget: z.number().int().positive().optional(),
      dietaryRestrictions: z.array(z.string()).optional(),
      cuisinePreference: z.string().optional(),
      excludeIngredients: z.array(z.string()).optional(),
    });

    try {
      const params = schema.parse(request.body);

      if (!genAI) {
        return reply.status(503).send({ error: 'AI service not configured' });
      }

      const prompt = `Generate a ${params.days}-day meal plan${params.calorieTarget ? ` targeting ${params.calorieTarget} calories per day` : ''}.
${params.dietaryRestrictions?.length ? `Dietary restrictions: ${params.dietaryRestrictions.join(', ')}` : ''}
${params.cuisinePreference ? `Preferred cuisine: ${params.cuisinePreference}` : ''}
${params.excludeIngredients?.length ? `Exclude: ${params.excludeIngredients.join(', ')}` : ''}

Return a JSON object with this structure:
{
  "days": [
    {
      "day": 1,
      "meals": {
        "breakfast": { "name": "...", "calories": 400, "protein": 20, "carbs": 50, "fat": 10 },
        "lunch": { "name": "...", "calories": 500, "protein": 30, "carbs": 60, "fat": 15 },
        "dinner": { "name": "...", "calories": 600, "protein": 35, "carbs": 70, "fat": 20 },
        "snack": { "name": "...", "calories": 200, "protein": 10, "carbs": 25, "fat": 8 }
      },
      "dailyTotals": { "calories": 1700, "protein": 95, "carbs": 205, "fat": 53 }
    }
  ]
}`;

      const model = genAI.models;
      const result = await model.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const responseText = result.text || '';
      
      // Try to parse JSON from response
      let mealPlan;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          mealPlan = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fallback: return raw text
      }

      return reply.send({
        mealPlan,
        rawResponse: responseText,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      console.error('AI Error:', error);
      return reply.status(500).send({ error: 'AI service error' });
    }
  });

  // Generate recipe from ingredients
  fastify.post('/generate-recipe', { preHandler: authenticate }, async (request, reply) => {
    const schema = z.object({
      ingredients: z.array(z.string()).min(1).max(10),
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
      dietaryPreference: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    });

    try {
      const { ingredients, mealType, dietaryPreference, difficulty } = schema.parse(request.body);

      if (!genAI) {
        return reply.status(503).send({ error: 'AI service not configured' });
      }

      const prompt = `Create a recipe using these ingredients: ${ingredients.join(', ')}
${mealType ? `Meal type: ${mealType}` : ''}
${dietaryPreference ? `Dietary preference: ${dietaryPreference}` : ''}
${difficulty ? `Difficulty: ${difficulty}` : ''}

Return a JSON object with:
{
  "title": "Recipe name",
  "description": "Brief description",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "difficulty": "EASY",
  "ingredients": [
    { "name": "ingredient", "amount": 1, "unit": "cup" }
  ],
  "instructions": "Step by step instructions...",
  "nutrition": { "calories": 400, "protein": 20, "carbs": 50, "fat": 10 }
}`;

      const model = genAI.models;
      const result = await model.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const responseText = result.text || '';
      
      let recipe;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recipe = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fallback
      }

      return reply.send({
        recipe,
        rawResponse: responseText,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors[0].message });
      }
      throw error;
    }
  });
}
