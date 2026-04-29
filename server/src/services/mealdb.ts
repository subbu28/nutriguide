import config from '../config/index.js';
import { prisma } from '../lib/prisma.js';

const MEALDB_API_URL = config.mealdbApiUrl;
const MEALDB_API_KEY = config.mealdbApiKey;

export interface TransformedMeal {
  id: string;
  name: string;
  category: string;
  area: string;
  imageUrl: string;
  instructions?: string[];
  ingredients?: { name: string; measure: string }[];
  tags?: string[];
  dietType?: string;
}

interface FetchMealsOptions {
  category?: string;
  area?: string;
  ingredient?: string;
  random?: boolean;
  count?: number;
}

export async function fetchMealsFromMealDB(options: FetchMealsOptions = {}) {
  try {
    let url: string;

    if (options.random) {
      url = `${MEALDB_API_URL}/randomselection.php`;
    } else if (options.category) {
      url = `${MEALDB_API_URL}/filter.php?c=${encodeURIComponent(options.category)}`;
    } else if (options.area) {
      url = `${MEALDB_API_URL}/filter.php?a=${encodeURIComponent(options.area)}`;
    } else if (options.ingredient) {
      url = `${MEALDB_API_URL}/filter.php?i=${encodeURIComponent(options.ingredient)}`;
    } else {
      url = `${MEALDB_API_URL}/search.php?s=`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!data.meals) return [];

    // Get full details for each meal
    const meals = await Promise.all(
      data.meals.slice(0, options.count || 20).map(async (meal: any) => {
        return getMealById(meal.idMeal);
      })
    );

    return meals.filter(Boolean);
  } catch (error) {
    console.error('Error fetching from MealDB:', error);
    return [];
  }
}

export async function getMealById(id: string) {
  try {
    const response = await fetch(`${MEALDB_API_URL}/lookup.php?i=${id}`);
    const data = await response.json();

    if (!data.meals?.[0]) return null;

    return formatMeal(data.meals[0]);
  } catch (error) {
    console.error('Error fetching meal:', error);
    return null;
  }
}

export async function searchMeals(query: string) {
  try {
    const response = await fetch(`${MEALDB_API_URL}/search.php?s=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data.meals) return [];

    return data.meals.map(formatMeal);
  } catch (error) {
    console.error('Error searching meals:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${MEALDB_API_URL}/categories.php`);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Get all meals from our database (recipes table)
 * This is the primary source for meal planning
 */
export async function getAllMeals(): Promise<TransformedMeal[]> {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { isPublic: true },
      include: { author: true },
    });

    return recipes.map((recipe) => {
      // Determine diet type from tags
      const tags = recipe.tags || [];
      const tagsLower = tags.map(t => t.toLowerCase());
      
      let dietType = 'Non-Vegetarian';
      if (tagsLower.includes('vegan')) {
        dietType = 'Vegan';
      } else if (tagsLower.includes('vegetarian') || tagsLower.includes('veggie')) {
        dietType = 'Vegetarian';
      }

      // Parse ingredients from JSON
      let ingredients: { name: string; measure: string }[] = [];
      if (recipe.ingredients) {
        try {
          const parsed = typeof recipe.ingredients === 'string' 
            ? JSON.parse(recipe.ingredients) 
            : recipe.ingredients;
          ingredients = Array.isArray(parsed) 
            ? parsed.map((ing: any) => ({
                name: ing.name || ing.ingredient || String(ing),
                measure: ing.amount ? `${ing.amount} ${ing.unit || ''}`.trim() : ing.measure || '',
              }))
            : [];
        } catch (e) {
          ingredients = [];
        }
      }

      // Parse instructions
      let instructions: string[] = [];
      if (recipe.instructions) {
        try {
          const parsed = typeof recipe.instructions === 'string'
            ? JSON.parse(recipe.instructions)
            : recipe.instructions;
          instructions = Array.isArray(parsed) ? parsed : [String(recipe.instructions)];
        } catch (e) {
          instructions = [String(recipe.instructions)];
        }
      }

      return {
        id: recipe.id,
        name: recipe.title,
        category: tags[0] || 'Miscellaneous',
        area: recipe.cuisine || 'International',
        imageUrl: recipe.images?.[0] || '',
        instructions,
        ingredients,
        tags,
        dietType,
      };
    });
  } catch (error) {
    console.error('Error fetching all meals from database:', error);
    return [];
  }
}

function formatMeal(meal: any) {
  // Extract ingredients and measures
  const ingredients: { ingredient: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measure: measure?.trim() || '',
      });
    }
  }

  // Parse tags
  const tags = meal.strTags?.split(',').map((t: string) => t.trim()).filter(Boolean) || [];

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    instructions: meal.strInstructions,
    thumbnail: meal.strMealThumb,
    tags,
    youtube: meal.strYoutube,
    source: meal.strSource,
    ingredients,
  };
}
