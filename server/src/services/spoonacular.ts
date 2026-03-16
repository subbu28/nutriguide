// Spoonacular API Service
// Docs: https://spoonacular.com/food-api/docs

import { spoonacularConfig } from '../config/external-apis.js';

const BASE_URL = spoonacularConfig.baseUrl;
const API_KEY = spoonacularConfig.apiKey;

// Types
export interface SpoonacularMeal {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  sourceUrl: string;
}

export interface SpoonacularNutrients {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

export interface MealPlanDay {
  meals: SpoonacularMeal[];
  nutrients: SpoonacularNutrients;
}

export interface MealPlanWeek {
  week: {
    monday: MealPlanDay;
    tuesday: MealPlanDay;
    wednesday: MealPlanDay;
    thursday: MealPlanDay;
    friday: MealPlanDay;
    saturday: MealPlanDay;
    sunday: MealPlanDay;
  };
}

export interface GenerateMealPlanParams {
  timeFrame: 'day' | 'week';
  targetCalories?: number;
  diet?: string; // e.g., 'vegetarian', 'vegan', 'paleo', 'ketogenic'
  exclude?: string; // comma-separated ingredients to exclude
}

export interface RecipeInfo {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  sourceUrl: string;
  summary: string;
  instructions: string;
  extendedIngredients: {
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }[];
  nutrition?: {
    nutrients: {
      name: string;
      amount: number;
      unit: string;
    }[];
  };
  diets: string[];
  dishTypes: string[];
}

// Check if Spoonacular is enabled
export function isSpoonacularEnabled(): boolean {
  return spoonacularConfig.enabled;
}

// Helper for API requests
async function apiRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!isSpoonacularEnabled()) {
    throw new Error('Spoonacular API is not configured. Please set SPOONACULAR_API_KEY in environment variables.');
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('apiKey', API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || `Spoonacular API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Generate a meal plan for a day or week
 */
export async function generateMealPlan(params: GenerateMealPlanParams): Promise<MealPlanDay | MealPlanWeek> {
  const queryParams: Record<string, string> = {
    timeFrame: params.timeFrame,
  };

  if (params.targetCalories) {
    queryParams.targetCalories = params.targetCalories.toString();
  }
  if (params.diet) {
    queryParams.diet = params.diet;
  }
  if (params.exclude) {
    queryParams.exclude = params.exclude;
  }

  return apiRequest('/mealplanner/generate', queryParams);
}

/**
 * Get detailed recipe information
 */
export async function getRecipeInfo(recipeId: number, includeNutrition = true): Promise<RecipeInfo> {
  return apiRequest(`/recipes/${recipeId}/information`, {
    includeNutrition: includeNutrition.toString(),
  });
}

/**
 * Search recipes with various filters
 */
export async function searchRecipes(params: {
  query?: string;
  diet?: string;
  intolerances?: string;
  type?: string;
  maxReadyTime?: number;
  minCalories?: number;
  maxCalories?: number;
  number?: number;
  offset?: number;
}): Promise<{ results: SpoonacularMeal[]; totalResults: number }> {
  const queryParams: Record<string, string> = {};
  
  if (params.query) queryParams.query = params.query;
  if (params.diet) queryParams.diet = params.diet;
  if (params.intolerances) queryParams.intolerances = params.intolerances;
  if (params.type) queryParams.type = params.type;
  if (params.maxReadyTime) queryParams.maxReadyTime = params.maxReadyTime.toString();
  if (params.minCalories) queryParams.minCalories = params.minCalories.toString();
  if (params.maxCalories) queryParams.maxCalories = params.maxCalories.toString();
  if (params.number) queryParams.number = params.number.toString();
  if (params.offset) queryParams.offset = params.offset.toString();

  return apiRequest('/recipes/complexSearch', queryParams);
}

/**
 * Get random recipes
 */
export async function getRandomRecipes(params: {
  number?: number;
  tags?: string;
}): Promise<{ recipes: RecipeInfo[] }> {
  const queryParams: Record<string, string> = {};
  
  if (params.number) queryParams.number = params.number.toString();
  if (params.tags) queryParams.tags = params.tags;

  return apiRequest('/recipes/random', queryParams);
}

/**
 * Find recipes by ingredients
 */
export async function findByIngredients(params: {
  ingredients: string;
  number?: number;
  ranking?: 1 | 2;
  ignorePantry?: boolean;
}): Promise<SpoonacularMeal[]> {
  const queryParams: Record<string, string> = {
    ingredients: params.ingredients,
  };
  
  if (params.number) queryParams.number = params.number.toString();
  if (params.ranking) queryParams.ranking = params.ranking.toString();
  if (params.ignorePantry !== undefined) queryParams.ignorePantry = params.ignorePantry.toString();

  return apiRequest('/recipes/findByIngredients', queryParams);
}

/**
 * Get recipe nutrition information
 */
export async function getRecipeNutrition(recipeId: number): Promise<{
  calories: string;
  carbs: string;
  fat: string;
  protein: string;
  nutrients: { name: string; amount: number; unit: string }[];
}> {
  return apiRequest(`/recipes/${recipeId}/nutritionWidget.json`);
}

// Diet options for meal planning
export const DIET_OPTIONS = [
  { value: '', label: 'No restriction' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'ketogenic', label: 'Ketogenic' },
  { value: 'gluten free', label: 'Gluten Free' },
  { value: 'pescetarian', label: 'Pescetarian' },
  { value: 'lacto-vegetarian', label: 'Lacto-Vegetarian' },
  { value: 'ovo-vegetarian', label: 'Ovo-Vegetarian' },
  { value: 'whole30', label: 'Whole30' },
];

// Intolerance options
export const INTOLERANCE_OPTIONS = [
  'dairy', 'egg', 'gluten', 'grain', 'peanut', 
  'seafood', 'sesame', 'shellfish', 'soy', 
  'sulfite', 'tree nut', 'wheat'
];
