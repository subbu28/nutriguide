// TheMealDB API Service
// Free API - https://www.themealdb.com/api.php

import { mealDbConfig } from '../config/external-apis.js';

const BASE_URL = mealDbConfig.baseUrl;

export interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
}

export interface MealDBCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface MealDBArea {
  strArea: string;
}

export interface TransformedMeal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: string;
  benefits: string[];
  category: string;
  dietType: string;
  reviews: never[];
  imageUrl: string;
  instructions: string[];
  ingredients: { name: string; measure: string }[];
  area: string;
  tags: string[];
  youtubeUrl?: string;
}

// Extract ingredients from meal object
function extractIngredients(meal: MealDBMeal): { name: string; measure: string }[] {
  const ingredients: { name: string; measure: string }[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}` as keyof MealDBMeal] as string;
    const measure = meal[`strMeasure${i}` as keyof MealDBMeal] as string;
    
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        name: ingredient.trim(),
        measure: measure?.trim() || '',
      });
    }
  }
  
  return ingredients;
}

// Estimate calories based on category (rough estimates)
function estimateCalories(category: string): number {
  const calorieMap: Record<string, number> = {
    'Breakfast': 350,
    'Starter': 200,
    'Side': 180,
    'Dessert': 400,
    'Beef': 450,
    'Chicken': 380,
    'Lamb': 420,
    'Pork': 400,
    'Seafood': 280,
    'Pasta': 420,
    'Vegetarian': 300,
    'Vegan': 280,
    'Goat': 350,
    'Miscellaneous': 350,
  };
  return calorieMap[category] || 350;
}

// Estimate protein based on category
function estimateProtein(category: string): string {
  const proteinMap: Record<string, string> = {
    'Beef': '35g',
    'Chicken': '30g',
    'Lamb': '32g',
    'Pork': '28g',
    'Seafood': '25g',
    'Goat': '30g',
    'Vegetarian': '12g',
    'Vegan': '10g',
    'Pasta': '15g',
    'Breakfast': '18g',
    'Dessert': '5g',
    'Side': '8g',
    'Starter': '10g',
    'Miscellaneous': '15g',
  };
  return proteinMap[category] || '15g';
}

// Get health benefits based on ingredients and category
function getHealthBenefits(meal: MealDBMeal): string[] {
  const benefits: string[] = [];
  const ingredients = extractIngredients(meal).map(i => i.name.toLowerCase());
  
  if (ingredients.some(i => i.includes('salmon') || i.includes('fish') || i.includes('tuna'))) {
    benefits.push('Rich in Omega-3 fatty acids');
  }
  if (ingredients.some(i => i.includes('spinach') || i.includes('kale') || i.includes('broccoli'))) {
    benefits.push('High in vitamins and minerals');
  }
  if (ingredients.some(i => i.includes('chicken') || i.includes('beef') || i.includes('lamb'))) {
    benefits.push('Excellent source of protein');
  }
  if (ingredients.some(i => i.includes('olive oil'))) {
    benefits.push('Heart-healthy fats');
  }
  if (ingredients.some(i => i.includes('garlic') || i.includes('ginger'))) {
    benefits.push('Natural immune boosters');
  }
  if (ingredients.some(i => i.includes('lemon') || i.includes('lime') || i.includes('orange'))) {
    benefits.push('Vitamin C rich');
  }
  if (ingredients.some(i => i.includes('avocado'))) {
    benefits.push('Healthy monounsaturated fats');
  }
  if (ingredients.some(i => i.includes('egg'))) {
    benefits.push('Complete protein source');
  }
  if (ingredients.some(i => i.includes('beans') || i.includes('lentils') || i.includes('chickpea'))) {
    benefits.push('High in fiber and plant protein');
  }
  if (ingredients.some(i => i.includes('tomato'))) {
    benefits.push('Rich in lycopene antioxidants');
  }
  
  // Default benefits if none found
  if (benefits.length === 0) {
    benefits.push('Balanced nutrition', 'Satisfying meal');
  }
  
  return benefits.slice(0, 4);
}

// Determine diet type based on category and ingredients
function determineDietType(meal: MealDBMeal): string {
  const category = meal.strCategory.toLowerCase();
  const ingredients = extractIngredients(meal).map(i => i.name.toLowerCase());
  
  const meatCategories = ['beef', 'chicken', 'lamb', 'pork', 'goat'];
  const seafoodCategory = 'seafood';
  
  if (category === 'vegan') return 'Vegan';
  if (category === 'vegetarian') return 'Vegetarian';
  if (meatCategories.includes(category)) return 'Non-Vegetarian';
  if (category === seafoodCategory) return 'Non-Vegetarian';
  
  // Check ingredients for meat
  const meatKeywords = ['chicken', 'beef', 'pork', 'lamb', 'bacon', 'ham', 'sausage', 'meat', 'fish', 'shrimp', 'prawn', 'salmon', 'tuna'];
  if (ingredients.some(i => meatKeywords.some(m => i.includes(m)))) {
    return 'Non-Vegetarian';
  }
  
  return 'Vegetarian';
}

// Map MealDB category to our app categories
function mapToAppCategory(mealDbCategory: string): string {
  const categoryMap: Record<string, string> = {
    'Breakfast': 'Breakfast',
    'Starter': 'Lunch',
    'Side': 'Lunch',
    'Dessert': 'Dessert',
    'Beef': 'Dinner',
    'Chicken': 'Dinner',
    'Lamb': 'Dinner',
    'Pork': 'Dinner',
    'Seafood': 'Dinner',
    'Pasta': 'Dinner',
    'Vegetarian': 'Lunch',
    'Vegan': 'Lunch',
    'Goat': 'Dinner',
    'Miscellaneous': 'Dinner',
  };
  return categoryMap[mealDbCategory] || 'Dinner';
}

// Transform MealDB meal to our app format
export function transformMeal(meal: MealDBMeal): TransformedMeal {
  const ingredients = extractIngredients(meal);
  const instructions = meal.strInstructions
    .split(/\r\n|\n|\r/)
    .filter(step => step.trim().length > 0)
    .map(step => step.trim());
    
  return {
    id: `mealdb-${meal.idMeal}`,
    name: meal.strMeal,
    description: `${meal.strArea} ${meal.strCategory} dish - ${meal.strMeal}. ${instructions[0] || ''}`.slice(0, 200),
    calories: estimateCalories(meal.strCategory),
    protein: estimateProtein(meal.strCategory),
    benefits: getHealthBenefits(meal),
    category: mapToAppCategory(meal.strCategory),
    dietType: determineDietType(meal),
    reviews: [],
    imageUrl: meal.strMealThumb,
    instructions,
    ingredients,
    area: meal.strArea,
    tags: meal.strTags?.split(',').map(t => t.trim()).filter(Boolean) || [],
    youtubeUrl: meal.strYoutube || undefined,
  };
}

// API Functions
export async function searchMealsByName(name: string): Promise<TransformedMeal[]> {
  try {
    const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(name)}`);
    const data = await response.json();
    
    if (!data.meals) return [];
    return data.meals.map(transformMeal);
  } catch (error) {
    console.error('MealDB search error:', error);
    return [];
  }
}

export async function getMealsByCategory(category: string): Promise<TransformedMeal[]> {
  try {
    // Get meal list by category
    const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
    const data = await response.json();
    
    if (!data.meals) return [];
    
    // Fetch full details for each meal (limit to 8 for performance)
    const mealIds = data.meals.slice(0, 8).map((m: { idMeal: string }) => m.idMeal);
    const detailedMeals = await Promise.all(
      mealIds.map(async (id: string) => {
        const detailResponse = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
        const detailData = await detailResponse.json();
        return detailData.meals?.[0];
      })
    );
    
    return detailedMeals.filter(Boolean).map(transformMeal);
  } catch (error) {
    console.error('MealDB category error:', error);
    return [];
  }
}

export async function getMealsByArea(area: string): Promise<TransformedMeal[]> {
  try {
    const response = await fetch(`${BASE_URL}/filter.php?a=${encodeURIComponent(area)}`);
    const data = await response.json();
    
    if (!data.meals) return [];
    
    // Fetch full details for ALL meals from this area (up to 20)
    const mealIds = data.meals.slice(0, 20).map((m: { idMeal: string }) => m.idMeal);
    const detailedMeals = await Promise.all(
      mealIds.map(async (id: string) => {
        const detailResponse = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
        const detailData = await detailResponse.json();
        return detailData.meals?.[0];
      })
    );
    
    return detailedMeals.filter(Boolean).map(transformMeal);
  } catch (error) {
    console.error('MealDB area error:', error);
    return [];
  }
}

export async function getRandomMeal(): Promise<TransformedMeal | null> {
  try {
    const response = await fetch(`${BASE_URL}/random.php`);
    const data = await response.json();
    
    if (!data.meals?.[0]) return null;
    return transformMeal(data.meals[0]);
  } catch (error) {
    console.error('MealDB random error:', error);
    return null;
  }
}

export async function getMultipleRandomMeals(count: number): Promise<TransformedMeal[]> {
  try {
    const meals = await Promise.all(
      Array(count).fill(null).map(() => getRandomMeal())
    );
    return meals.filter((m): m is TransformedMeal => m !== null);
  } catch (error) {
    console.error('MealDB multiple random error:', error);
    return [];
  }
}

export async function getMealById(id: string): Promise<TransformedMeal | null> {
  try {
    const mealId = id.replace('mealdb-', '');
    const response = await fetch(`${BASE_URL}/lookup.php?i=${mealId}`);
    const data = await response.json();
    
    if (!data.meals?.[0]) return null;
    return transformMeal(data.meals[0]);
  } catch (error) {
    console.error('MealDB lookup error:', error);
    return null;
  }
}

export async function getAllCategories(): Promise<MealDBCategory[]> {
  try {
    const response = await fetch(`${BASE_URL}/categories.php`);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('MealDB categories error:', error);
    return [];
  }
}

export async function getAllAreas(): Promise<string[]> {
  try {
    const response = await fetch(`${BASE_URL}/list.php?a=list`);
    const data = await response.json();
    return data.meals?.map((a: MealDBArea) => a.strArea) || [];
  } catch (error) {
    console.error('MealDB areas error:', error);
    return [];
  }
}

// Get meals matching our app categories
export async function getMealsForAppCategory(
  appCategory: 'Breakfast' | 'Lunch' | 'Dinner' | 'Juices',
  dietType: 'Vegetarian' | 'Non-Vegetarian',
  cuisine?: string
): Promise<TransformedMeal[]> {
  // If cuisine is specified, fetch by area first then filter
  if (cuisine && cuisine !== 'All') {
    const areaMeals = await getMealsByArea(cuisine);
    
    // Filter by diet type
    let filteredMeals = areaMeals.filter(meal => {
      if (dietType === 'Vegetarian') {
        return meal.dietType === 'Vegetarian' || meal.dietType === 'Vegan';
      }
      return true;
    });
    
    // Filter by app category (map MealDB categories to app categories)
    filteredMeals = filteredMeals.filter(meal => {
      if (appCategory === 'Breakfast') {
        return meal.category === 'Breakfast' || 
               meal.tags.some(t => t.toLowerCase().includes('breakfast'));
      }
      if (appCategory === 'Lunch') {
        return meal.category === 'Lunch' || 
               ['Starter', 'Side', 'Vegetarian', 'Vegan'].some(c => 
                 meal.category.includes(c) || meal.tags.some(t => t.toLowerCase().includes('lunch'))
               );
      }
      if (appCategory === 'Dinner') {
        return meal.category === 'Dinner' || 
               !['Breakfast', 'Dessert'].includes(meal.category);
      }
      return false; // Juices handled by Gemini
    });
    
    return filteredMeals.slice(0, 10);
  }
  
  // Default behavior without cuisine filter
  const categoryMapping: Record<string, string[]> = {
    'Breakfast': ['Breakfast'],
    'Lunch': ['Starter', 'Side', 'Vegetarian', 'Vegan'],
    'Dinner': ['Beef', 'Chicken', 'Lamb', 'Pork', 'Seafood', 'Pasta', 'Goat'],
    'Juices': [], // MealDB doesn't have juices, we'll use Gemini for this
  };
  
  const mealDbCategories = categoryMapping[appCategory] || [];
  
  if (mealDbCategories.length === 0) {
    return []; // Return empty for Juices category
  }
  
  // Fetch from multiple categories and combine
  const allMeals: TransformedMeal[] = [];
  
  for (const cat of mealDbCategories.slice(0, 2)) { // Limit to 2 categories for speed
    const meals = await getMealsByCategory(cat);
    allMeals.push(...meals);
  }
  
  // Filter by diet type
  const filteredMeals = allMeals.filter(meal => {
    if (dietType === 'Vegetarian') {
      return meal.dietType === 'Vegetarian' || meal.dietType === 'Vegan';
    }
    return true; // Non-Vegetarian shows all
  });
  
  // Return unique meals (by ID)
  const uniqueMeals = filteredMeals.reduce((acc, meal) => {
    if (!acc.find(m => m.id === meal.id)) {
      acc.push(meal);
    }
    return acc;
  }, [] as TransformedMeal[]);
  
  return uniqueMeals.slice(0, 10);
}

// Get all meals from multiple categories (for meal planner)
export async function getAllMeals(): Promise<TransformedMeal[]> {
  const categories = ['Beef', 'Chicken', 'Seafood', 'Pasta', 'Vegetarian', 'Breakfast', 'Lamb', 'Pork', 'Side', 'Starter'];
  const allMeals: TransformedMeal[] = [];
  
  try {
    // Fetch from each category (limited for performance)
    for (const category of categories.slice(0, 6)) {
      const meals = await getMealsByCategory(category);
      allMeals.push(...meals);
    }
    
    // Remove duplicates by ID
    const uniqueMeals = allMeals.reduce((acc, meal) => {
      if (!acc.find(m => m.id === meal.id)) {
        acc.push(meal);
      }
      return acc;
    }, [] as TransformedMeal[]);
    
    return uniqueMeals;
  } catch (error) {
    console.error('MealDB getAllMeals error:', error);
    return [];
  }
}

// All available cuisines
export const CUISINES = [
  'All',
  'American',
  'British', 
  'Canadian',
  'Chinese',
  'Croatian',
  'Dutch',
  'Egyptian',
  'Filipino',
  'French',
  'Greek',
  'Indian',
  'Irish',
  'Italian',
  'Jamaican',
  'Japanese',
  'Kenyan',
  'Malaysian',
  'Mexican',
  'Moroccan',
  'Polish',
  'Portuguese',
  'Russian',
  'Spanish',
  'Thai',
  'Tunisian',
  'Turkish',
  'Vietnamese'
] as const;

export type Cuisine = typeof CUISINES[number];
