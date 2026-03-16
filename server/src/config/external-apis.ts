import 'dotenv/config';

/**
 * External API Configuration
 * All external service URLs and keys are centralized here
 */

// TheMealDB API
export const mealDbConfig = {
  baseUrl: process.env.MEALDB_API_URL || 'https://www.themealdb.com/api/json/v1/1',
  apiKey: process.env.MEALDB_API_KEY || '1',
  endpoints: {
    search: '/search.php',
    lookup: '/lookup.php',
    random: '/random.php',
    filterByCategory: '/filter.php',
    filterByArea: '/filter.php',
    categories: '/categories.php',
    listAreas: '/list.php?a=list',
    listCategories: '/list.php?c=list',
    listIngredients: '/list.php?i=list',
  },
};

// Spoonacular API (optional - for enhanced nutrition data)
export const spoonacularConfig = {
  baseUrl: process.env.SPOONACULAR_API_URL || 'https://api.spoonacular.com',
  apiKey: process.env.SPOONACULAR_API_KEY || '',
  enabled: !!process.env.SPOONACULAR_API_KEY,
  endpoints: {
    complexSearch: '/recipes/complexSearch',
    recipeInfo: '/recipes/{id}/information',
    nutrition: '/recipes/{id}/nutritionWidget.json',
    random: '/recipes/random',
    findByIngredients: '/recipes/findByIngredients',
    mealPlan: '/mealplanner/generate',
  },
};

// Edamam API (optional - for detailed nutrition analysis)
export const edamamConfig = {
  baseUrl: process.env.EDAMAM_API_URL || 'https://api.edamam.com/api/recipes/v2',
  appId: process.env.EDAMAM_APP_ID || '',
  appKey: process.env.EDAMAM_APP_KEY || '',
  enabled: !!(process.env.EDAMAM_APP_ID && process.env.EDAMAM_APP_KEY),
  endpoints: {
    search: '',
    recipeById: '/{id}',
    nutritionAnalysis: '/api/nutrition-data',
  },
};

// Tasty API via RapidAPI (optional - for video recipes)
export const tastyConfig = {
  baseUrl: process.env.TASTY_API_URL || 'https://tasty.p.rapidapi.com',
  rapidApiKey: process.env.RAPIDAPI_KEY || '',
  rapidApiHost: 'tasty.p.rapidapi.com',
  enabled: !!process.env.RAPIDAPI_KEY,
  endpoints: {
    list: '/recipes/list',
    details: '/recipes/get-more-info',
    feeds: '/feeds/list',
    tags: '/tags/list',
  },
};

// Gemini AI API
export const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY || '',
  enabled: !!process.env.GEMINI_API_KEY,
};

// Export all configs
export const externalApis = {
  mealDb: mealDbConfig,
  spoonacular: spoonacularConfig,
  edamam: edamamConfig,
  tasty: tastyConfig,
  gemini: geminiConfig,
};

// Helper to check which APIs are available
export function getAvailableApis(): string[] {
  const available: string[] = ['mealDb']; // Always available (free)
  
  if (spoonacularConfig.enabled) available.push('spoonacular');
  if (edamamConfig.enabled) available.push('edamam');
  if (tastyConfig.enabled) available.push('tasty');
  if (geminiConfig.enabled) available.push('gemini');
  
  return available;
}
