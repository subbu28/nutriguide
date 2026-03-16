// In-House Meal Planner Service
// Uses Gemini AI with rule-based fallback
// Works alongside Spoonacular integration

import { GoogleGenAI } from '@google/genai';
import { geminiConfig } from '../config/external-apis.js';
import * as mealdb from './mealdb.js';
import { calculateNutrition, estimateMealNutrition, NutritionInfo } from './nutrition-calculator.js';

// Initialize Gemini AI if available
let genAI: GoogleGenAI | null = null;
if (geminiConfig.enabled && geminiConfig.apiKey) {
  genAI = new GoogleGenAI({ apiKey: geminiConfig.apiKey });
}

// Types
export interface MealPlanRequest {
  timeFrame: 'day' | 'week';
  targetCalories?: number;
  diet?: string;
  exclude?: string;
  preferences?: {
    cuisines?: string[];
    maxCookTime?: number;
  };
}

export interface PlannedMeal {
  id: string;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  category: string;
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients?: { name: string; measure: string }[];
  instructions?: string[];
  source: 'mealdb' | 'gemini';
}

export interface DayPlan {
  meals: PlannedMeal[];
  nutrients: NutritionInfo;
}

export interface WeekPlan {
  monday: DayPlan;
  tuesday: DayPlan;
  wednesday: DayPlan;
  thursday: DayPlan;
  friday: DayPlan;
  saturday: DayPlan;
  sunday: DayPlan;
}

// Category mappings for meal slots
const BREAKFAST_CATEGORIES = ['Breakfast', 'Side', 'Starter', 'Miscellaneous'];
const LUNCH_CATEGORIES = ['Chicken', 'Beef', 'Pasta', 'Seafood', 'Vegetarian', 'Lamb', 'Pork', 'Goat'];
const DINNER_CATEGORIES = ['Chicken', 'Beef', 'Pasta', 'Seafood', 'Lamb', 'Pork', 'Vegetarian', 'Miscellaneous', 'Goat'];

// Diet type to category mappings
const DIET_FILTERS: Record<string, { include?: string[]; exclude?: string[] }> = {
  'vegetarian': { include: ['Vegetarian', 'Vegan', 'Pasta', 'Side', 'Breakfast', 'Dessert'] },
  'vegan': { include: ['Vegan', 'Vegetarian'], exclude: ['Beef', 'Chicken', 'Pork', 'Lamb', 'Seafood'] },
  'pescetarian': { include: ['Seafood', 'Vegetarian', 'Pasta', 'Side'], exclude: ['Beef', 'Chicken', 'Pork', 'Lamb'] },
  'low-carb': { exclude: ['Pasta', 'Dessert'] },
  'high-protein': { include: ['Chicken', 'Beef', 'Seafood', 'Lamb', 'Pork'] },
};

// Calorie distribution per slot
const SLOT_CALORIE_RATIO: Record<string, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.30,
  snack: 0.10,
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

/**
 * Check if in-house planner is available
 */
export function isInHousePlannerEnabled(): boolean {
  return true; // Always available (rule-based fallback)
}

/**
 * Check if Gemini AI is available for enhanced planning
 */
export function isGeminiEnabled(): boolean {
  return genAI !== null;
}

/**
 * Filter meals based on diet preferences
 */
function filterMealsByDiet(meals: mealdb.TransformedMeal[], diet?: string, exclude?: string): mealdb.TransformedMeal[] {
  let filtered = [...meals];
  
  if (diet && DIET_FILTERS[diet.toLowerCase()]) {
    const filter = DIET_FILTERS[diet.toLowerCase()];
    
    if (filter.include) {
      filtered = filtered.filter(m => filter.include!.some(cat => 
        m.category.toLowerCase().includes(cat.toLowerCase())
      ));
    }
    
    if (filter.exclude) {
      filtered = filtered.filter(m => !filter.exclude!.some(cat => 
        m.category.toLowerCase().includes(cat.toLowerCase())
      ));
    }
  }
  
  if (exclude) {
    const excludeTerms = exclude.toLowerCase().split(',').map(t => t.trim());
    filtered = filtered.filter(m => {
      const mealText = `${m.name} ${m.category}`.toLowerCase();
      return !excludeTerms.some(term => mealText.includes(term));
    });
  }
  
  return filtered;
}

/**
 * Select a random meal from a category list
 */
function selectMealForSlot(
  meals: mealdb.TransformedMeal[],
  categories: string[],
  usedIds: Set<string>
): mealdb.TransformedMeal | null {
  const eligible = meals.filter(m => 
    categories.some(cat => m.category.toLowerCase().includes(cat.toLowerCase())) &&
    !usedIds.has(m.id)
  );
  
  if (eligible.length === 0) {
    // Fallback to any unused meal
    const fallback = meals.filter(m => !usedIds.has(m.id));
    if (fallback.length === 0) return null;
    return fallback[Math.floor(Math.random() * fallback.length)];
  }
  
  return eligible[Math.floor(Math.random() * eligible.length)];
}

/**
 * Convert MealDB meal to PlannedMeal
 */
function toPlannedMeal(
  meal: mealdb.TransformedMeal,
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack'
): PlannedMeal {
  return {
    id: meal.id,
    title: meal.name,
    image: meal.imageUrl,
    readyInMinutes: 30 + Math.floor(Math.random() * 30), // Estimate 30-60 mins
    servings: 4,
    category: meal.category,
    slot,
    ingredients: meal.ingredients,
    instructions: meal.instructions,
    source: 'mealdb',
  };
}

/**
 * Generate a single day's meal plan using rule-based algorithm
 */
async function generateDayPlanRuleBased(
  request: MealPlanRequest,
  usedMealIds: Set<string> = new Set()
): Promise<DayPlan> {
  // Fetch meals from MealDB
  const allMeals = await mealdb.getAllMeals();
  const filteredMeals = filterMealsByDiet(allMeals, request.diet, request.exclude);
  
  const targetCalories = request.targetCalories || 2000;
  const meals: PlannedMeal[] = [];
  let totalNutrients: NutritionInfo = { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };
  
  // Select breakfast
  const breakfastMeal = selectMealForSlot(filteredMeals, BREAKFAST_CATEGORIES, usedMealIds);
  if (breakfastMeal) {
    usedMealIds.add(breakfastMeal.id);
    const planned = toPlannedMeal(breakfastMeal, 'breakfast');
    const nutrition = breakfastMeal.ingredients?.length 
      ? calculateNutrition(breakfastMeal.ingredients)
      : estimateMealNutrition('breakfast', request.diet);
    meals.push(planned);
    totalNutrients.calories += nutrition.calories;
    totalNutrients.protein += nutrition.protein;
    totalNutrients.carbohydrates += nutrition.carbohydrates;
    totalNutrients.fat += nutrition.fat;
  }
  
  // Select lunch
  const lunchMeal = selectMealForSlot(filteredMeals, LUNCH_CATEGORIES, usedMealIds);
  if (lunchMeal) {
    usedMealIds.add(lunchMeal.id);
    const planned = toPlannedMeal(lunchMeal, 'lunch');
    const nutrition = lunchMeal.ingredients?.length 
      ? calculateNutrition(lunchMeal.ingredients)
      : estimateMealNutrition('lunch', request.diet);
    meals.push(planned);
    totalNutrients.calories += nutrition.calories;
    totalNutrients.protein += nutrition.protein;
    totalNutrients.carbohydrates += nutrition.carbohydrates;
    totalNutrients.fat += nutrition.fat;
  }
  
  // Select dinner
  const dinnerMeal = selectMealForSlot(filteredMeals, DINNER_CATEGORIES, usedMealIds);
  if (dinnerMeal) {
    usedMealIds.add(dinnerMeal.id);
    const planned = toPlannedMeal(dinnerMeal, 'dinner');
    const nutrition = dinnerMeal.ingredients?.length 
      ? calculateNutrition(dinnerMeal.ingredients)
      : estimateMealNutrition('dinner', request.diet);
    meals.push(planned);
    totalNutrients.calories += nutrition.calories;
    totalNutrients.protein += nutrition.protein;
    totalNutrients.carbohydrates += nutrition.carbohydrates;
    totalNutrients.fat += nutrition.fat;
  }
  
  return { meals, nutrients: totalNutrients };
}

/**
 * Generate meal plan using Gemini AI
 */
async function generateWithGemini(
  request: MealPlanRequest,
  availableMeals: mealdb.TransformedMeal[]
): Promise<{ mealIds: string[]; reasoning: string } | null> {
  if (!genAI) return null;
  
  try {
    const mealList = availableMeals.slice(0, 100).map(m => ({
      id: m.id,
      name: m.name,
      category: m.category,
      area: m.area,
    }));
    
    const prompt = `You are a nutritionist creating a personalized meal plan.

Available meals from our database:
${JSON.stringify(mealList, null, 2)}

User requirements:
- Target daily calories: ${request.targetCalories || 2000}
- Diet preference: ${request.diet || 'no specific diet'}
- Foods to exclude: ${request.exclude || 'none'}

Select 3 meals for a balanced day (breakfast, lunch, dinner) from the available meals.
Consider nutritional balance, variety, and the user's preferences.

Respond with ONLY valid JSON:
{
  "mealIds": ["id1", "id2", "id3"],
  "reasoning": "Brief explanation of your choices"
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    const text = response.text || '';
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Gemini meal planning error:', error);
    return null;
  }
}

/**
 * Generate a day's meal plan with Gemini AI enhancement
 */
async function generateDayPlanWithAI(
  request: MealPlanRequest,
  usedMealIds: Set<string> = new Set()
): Promise<DayPlan> {
  const allMeals = await mealdb.getAllMeals();
  const filteredMeals = filterMealsByDiet(allMeals, request.diet, request.exclude);
  
  // Try Gemini AI first
  const aiResult = await generateWithGemini(request, filteredMeals);
  
  if (aiResult && aiResult.mealIds) {
    const meals: PlannedMeal[] = [];
    let totalNutrients: NutritionInfo = { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };
    const slots: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];
    
    for (let i = 0; i < aiResult.mealIds.length; i++) {
      const mealId = aiResult.mealIds[i];
      const meal = filteredMeals.find(m => m.id === mealId);
      
      if (meal && !usedMealIds.has(meal.id)) {
        usedMealIds.add(meal.id);
        const slot = slots[i] || 'dinner';
        const planned = toPlannedMeal(meal, slot);
        planned.source = 'gemini';
        
        const nutrition = meal.ingredients?.length 
          ? calculateNutrition(meal.ingredients)
          : estimateMealNutrition(slot, request.diet);
        
        meals.push(planned);
        totalNutrients.calories += nutrition.calories;
        totalNutrients.protein += nutrition.protein;
        totalNutrients.carbohydrates += nutrition.carbohydrates;
        totalNutrients.fat += nutrition.fat;
      }
    }
    
    if (meals.length >= 2) {
      return { meals, nutrients: totalNutrients };
    }
  }
  
  // Fallback to rule-based
  return generateDayPlanRuleBased(request, usedMealIds);
}

/**
 * Generate complete meal plan (day or week)
 */
export async function generateMealPlan(request: MealPlanRequest): Promise<DayPlan | { week: WeekPlan }> {
  if (request.timeFrame === 'day') {
    // Use AI for single day
    return generateDayPlanWithAI(request);
  }
  
  // Generate week plan
  const usedMealIds = new Set<string>();
  const weekPlan: Partial<WeekPlan> = {};
  
  for (const day of DAYS) {
    // Alternate between AI and rule-based for variety
    const useAI = genAI && Math.random() > 0.3; // 70% chance to use AI if available
    
    if (useAI) {
      weekPlan[day] = await generateDayPlanWithAI(request, usedMealIds);
    } else {
      weekPlan[day] = await generateDayPlanRuleBased(request, usedMealIds);
    }
  }
  
  return { week: weekPlan as WeekPlan };
}

/**
 * Regenerate a single meal slot
 */
export async function regenerateMeal(
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  request: MealPlanRequest,
  excludeMealIds: string[] = []
): Promise<PlannedMeal | null> {
  const allMeals = await mealdb.getAllMeals();
  const filteredMeals = filterMealsByDiet(allMeals, request.diet, request.exclude);
  const usedIds = new Set(excludeMealIds);
  
  const categories = slot === 'breakfast' ? BREAKFAST_CATEGORIES :
                     slot === 'lunch' ? LUNCH_CATEGORIES :
                     slot === 'dinner' ? DINNER_CATEGORIES :
                     BREAKFAST_CATEGORIES;
  
  const meal = selectMealForSlot(filteredMeals, categories, usedIds);
  
  if (meal) {
    return toPlannedMeal(meal, slot);
  }
  
  return null;
}

/**
 * Get diet options for the planner
 */
export function getDietOptions(): { value: string; label: string }[] {
  return [
    { value: '', label: 'No restriction' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pescetarian', label: 'Pescetarian' },
    { value: 'low-carb', label: 'Low Carb' },
    { value: 'high-protein', label: 'High Protein' },
  ];
}
