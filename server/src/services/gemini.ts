import { GoogleGenAI } from '@google/genai';
import config from '../config/index.js';

const genAI = config.geminiApiKey ? new GoogleGenAI({ apiKey: config.geminiApiKey }) : null;

interface RecommendationParams {
  preferences?: string;
  dietaryRestrictions?: string[];
  calories?: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  userId?: string;
}

export async function getSmartRecommendations(params: RecommendationParams) {
  if (!genAI) {
    return getFallbackRecommendations(params);
  }

  try {
    const prompt = buildRecommendationPrompt(params);

    const model = genAI.models;
    const result = await model.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const responseText = result.text || '';

    // Try to parse JSON response
    let recommendations;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If parsing fails, return fallback
    }

    return recommendations || getFallbackRecommendations(params);
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackRecommendations(params);
  }
}

function buildRecommendationPrompt(params: RecommendationParams): string {
  return `As a nutrition expert, recommend 5 healthy meals based on these preferences:

${params.preferences ? `User preferences: ${params.preferences}` : ''}
${params.dietaryRestrictions?.length ? `Dietary restrictions: ${params.dietaryRestrictions.join(', ')}` : ''}
${params.calories ? `Target calories per serving: ${params.calories}` : ''}
${params.mealType ? `Meal type: ${params.mealType}` : ''}

Return a JSON object with this exact structure:
{
  "recommendations": [
    {
      "name": "Meal name",
      "description": "Brief description of the meal",
      "calories": 450,
      "protein": 25,
      "carbs": 45,
      "fat": 18,
      "prepTime": 20,
      "cookTime": 25,
      "difficulty": "Easy",
      "keyIngredients": ["ingredient1", "ingredient2"],
      "healthBenefits": ["benefit1", "benefit2"],
      "whyRecommended": "Explanation of why this matches the preferences"
    }
  ]
}`;
}

function getFallbackRecommendations(params: RecommendationParams) {
  const mealType = params.mealType || 'dinner';
  
  const recommendations: Record<string, any[]> = {
    breakfast: [
      {
        name: 'Overnight Oats with Berries',
        description: 'Healthy oats soaked overnight with Greek yogurt, chia seeds, and fresh berries',
        calories: 350,
        protein: 18,
        carbs: 52,
        fat: 8,
        prepTime: 10,
        cookTime: 0,
        difficulty: 'Easy',
        keyIngredients: ['oats', 'greek yogurt', 'chia seeds', 'mixed berries'],
        healthBenefits: ['High fiber', 'Protein-rich', 'Antioxidants'],
        whyRecommended: 'Perfect healthy breakfast with balanced macros',
      },
      {
        name: 'Avocado Toast with Eggs',
        description: 'Whole grain toast topped with smashed avocado and poached eggs',
        calories: 420,
        protein: 22,
        carbs: 35,
        fat: 24,
        prepTime: 5,
        cookTime: 10,
        difficulty: 'Easy',
        keyIngredients: ['whole grain bread', 'avocado', 'eggs'],
        healthBenefits: ['Healthy fats', 'Complete protein', 'Fiber'],
        whyRecommended: 'Balanced breakfast with healthy fats and protein',
      },
    ],
    lunch: [
      {
        name: 'Mediterranean Quinoa Bowl',
        description: 'Quinoa with cucumber, tomatoes, olives, feta, and lemon dressing',
        calories: 480,
        protein: 16,
        carbs: 58,
        fat: 22,
        prepTime: 15,
        cookTime: 15,
        difficulty: 'Easy',
        keyIngredients: ['quinoa', 'cucumber', 'cherry tomatoes', 'olives', 'feta'],
        healthBenefits: ['Complete protein', 'Heart healthy', 'Fiber rich'],
        whyRecommended: 'Nutrient-dense vegetarian option',
      },
    ],
    dinner: [
      {
        name: 'Grilled Salmon with Vegetables',
        description: 'Wild-caught salmon fillet with roasted asparagus and sweet potato',
        calories: 520,
        protein: 42,
        carbs: 38,
        fat: 22,
        prepTime: 10,
        cookTime: 25,
        difficulty: 'Medium',
        keyIngredients: ['salmon', 'asparagus', 'sweet potato', 'olive oil'],
        healthBenefits: ['Omega-3 fatty acids', 'High protein', 'Vitamin rich'],
        whyRecommended: 'Heart-healthy dinner with premium protein',
      },
      {
        name: 'Chicken Stir-Fry',
        description: 'Lean chicken breast with colorful vegetables in light ginger sauce',
        calories: 450,
        protein: 38,
        carbs: 42,
        fat: 14,
        prepTime: 15,
        cookTime: 15,
        difficulty: 'Easy',
        keyIngredients: ['chicken breast', 'bell peppers', 'broccoli', 'brown rice'],
        healthBenefits: ['Lean protein', 'High fiber', 'Low fat'],
        whyRecommended: 'Quick, balanced meal with lean protein',
      },
    ],
    snack: [
      {
        name: 'Apple Slices with Almond Butter',
        description: 'Fresh apple slices with natural almond butter',
        calories: 200,
        protein: 6,
        carbs: 22,
        fat: 12,
        prepTime: 5,
        cookTime: 0,
        difficulty: 'Easy',
        keyIngredients: ['apple', 'almond butter'],
        healthBenefits: ['Natural sugars', 'Healthy fats', 'Fiber'],
        whyRecommended: 'Perfect balanced snack',
      },
    ],
  };

  return {
    recommendations: recommendations[mealType] || recommendations.dinner,
  };
}

export async function analyzeNutrition(ingredients: string[]) {
  if (!genAI) {
    return null;
  }

  try {
    const prompt = `Analyze the nutrition for these ingredients and return estimated values per serving:

Ingredients: ${ingredients.join(', ')}

Return JSON:
{
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fat": 0,
  "fiber": 0,
  "analysis": "Brief nutritional analysis"
}`;

    const model = genAI.models;
    const result = await model.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const responseText = result.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Nutrition analysis error:', error);
  }

  return null;
}
