// Nutrition Calculator Service
// Estimates nutrition values based on ingredients

// Common ingredient nutrition data (per 100g)
const NUTRITION_DATABASE: Record<string, {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}> = {
  // Proteins
  'chicken': { calories: 239, protein: 27, carbs: 0, fat: 14 },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'beef': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'ground beef': { calories: 254, protein: 17, carbs: 0, fat: 20 },
  'pork': { calories: 242, protein: 27, carbs: 0, fat: 14 },
  'fish': { calories: 206, protein: 22, carbs: 0, fat: 12 },
  'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13 },
  'tuna': { calories: 132, protein: 28, carbs: 0, fat: 1 },
  'shrimp': { calories: 99, protein: 24, carbs: 0, fat: 0.3 },
  'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  'lamb': { calories: 294, protein: 25, carbs: 0, fat: 21 },
  'turkey': { calories: 189, protein: 29, carbs: 0, fat: 7 },
  
  // Dairy
  'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  'cheese': { calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  'cream': { calories: 340, protein: 2, carbs: 3, fat: 36 },
  'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.7 },
  'cottage cheese': { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  
  // Grains & Carbs
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  'flour': { calories: 364, protein: 10, carbs: 76, fat: 1 },
  'oats': { calories: 389, protein: 17, carbs: 66, fat: 7 },
  'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  'potatoes': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  'noodles': { calories: 138, protein: 4.5, carbs: 25, fat: 2.1 },
  
  // Vegetables
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  'tomatoes': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  'onion': { calories: 40, protein: 1.1, carbs: 9, fat: 0.1 },
  'garlic': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5 },
  'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  'carrots': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  'lettuce': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  'pepper': { calories: 31, protein: 1, carbs: 6, fat: 0.3 },
  'bell pepper': { calories: 31, protein: 1, carbs: 6, fat: 0.3 },
  'cucumber': { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 },
  'mushroom': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  'mushrooms': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  'zucchini': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  'eggplant': { calories: 25, protein: 1, carbs: 6, fat: 0.2 },
  'cabbage': { calories: 25, protein: 1.3, carbs: 6, fat: 0.1 },
  'celery': { calories: 16, protein: 0.7, carbs: 3, fat: 0.2 },
  'corn': { calories: 86, protein: 3.3, carbs: 19, fat: 1.4 },
  'peas': { calories: 81, protein: 5.4, carbs: 14, fat: 0.4 },
  'beans': { calories: 347, protein: 21, carbs: 63, fat: 1.2 },
  'lentils': { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  'chickpeas': { calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
  
  // Fruits
  'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  'lemon': { calories: 29, protein: 1.1, carbs: 9, fat: 0.3 },
  'lime': { calories: 30, protein: 0.7, carbs: 11, fat: 0.2 },
  'strawberry': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
  'blueberry': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  'pineapple': { calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15 },
  'coconut': { calories: 354, protein: 3.3, carbs: 15, fat: 33 },
  
  // Oils & Fats
  'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'vegetable oil': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'coconut oil': { calories: 862, protein: 0, carbs: 0, fat: 100 },
  
  // Nuts & Seeds
  'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50 },
  'peanuts': { calories: 567, protein: 26, carbs: 16, fat: 49 },
  'walnuts': { calories: 654, protein: 15, carbs: 14, fat: 65 },
  'cashews': { calories: 553, protein: 18, carbs: 30, fat: 44 },
  
  // Condiments & Others
  'sugar': { calories: 387, protein: 0, carbs: 100, fat: 0 },
  'honey': { calories: 304, protein: 0.3, carbs: 82, fat: 0 },
  'salt': { calories: 0, protein: 0, carbs: 0, fat: 0 },
  'soy sauce': { calories: 53, protein: 8, carbs: 5, fat: 0 },
  'vinegar': { calories: 18, protein: 0, carbs: 0.04, fat: 0 },
  'mayonnaise': { calories: 680, protein: 1, carbs: 1, fat: 75 },
  'ketchup': { calories: 112, protein: 1.7, carbs: 26, fat: 0.1 },
  'mustard': { calories: 66, protein: 4.4, carbs: 5.3, fat: 3.6 },
};

// Parse amount from string (e.g., "200g", "1 cup", "2 tbsp")
function parseAmount(amountStr: string): { value: number; unit: string } {
  const normalized = amountStr.toLowerCase().trim();
  
  // Extract number
  const numberMatch = normalized.match(/^([\d.\/]+)/);
  let value = 1;
  
  if (numberMatch) {
    const numStr = numberMatch[1];
    if (numStr.includes('/')) {
      const [num, denom] = numStr.split('/');
      value = parseInt(num) / parseInt(denom);
    } else {
      value = parseFloat(numStr);
    }
  }
  
  // Determine unit and convert to grams
  const unitConversions: Record<string, number> = {
    'g': 1,
    'gram': 1,
    'grams': 1,
    'kg': 1000,
    'oz': 28.35,
    'lb': 453.6,
    'pound': 453.6,
    'cup': 240,
    'cups': 240,
    'tbsp': 15,
    'tablespoon': 15,
    'tsp': 5,
    'teaspoon': 5,
    'ml': 1,
    'l': 1000,
    'liter': 1000,
    'piece': 100,
    'pieces': 100,
    'slice': 30,
    'slices': 30,
    'clove': 3,
    'cloves': 3,
  };
  
  for (const [unit, multiplier] of Object.entries(unitConversions)) {
    if (normalized.includes(unit)) {
      return { value: value * multiplier, unit };
    }
  }
  
  // Default: assume 100g portions for whole items
  return { value: value * 100, unit: 'portion' };
}

// Find matching ingredient in database
function findIngredient(name: string): { calories: number; protein: number; carbs: number; fat: number } | null {
  const normalized = name.toLowerCase().trim();
  
  // Direct match
  if (NUTRITION_DATABASE[normalized]) {
    return NUTRITION_DATABASE[normalized];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(NUTRITION_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }
  
  return null;
}

export interface Ingredient {
  name: string;
  measure?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
}

/**
 * Calculate nutrition for a list of ingredients
 */
export function calculateNutrition(ingredients: Ingredient[]): NutritionInfo {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  for (const ingredient of ingredients) {
    const nutritionData = findIngredient(ingredient.name);
    
    if (nutritionData) {
      const amount = parseAmount(ingredient.measure || '100g');
      const factor = amount.value / 100; // Nutrition data is per 100g
      
      totalCalories += nutritionData.calories * factor;
      totalProtein += nutritionData.protein * factor;
      totalCarbs += nutritionData.carbs * factor;
      totalFat += nutritionData.fat * factor;
    } else {
      // Estimate based on average food values
      const amount = parseAmount(ingredient.measure || '100g');
      const factor = amount.value / 100;
      
      totalCalories += 100 * factor; // Average estimate
      totalProtein += 5 * factor;
      totalCarbs += 15 * factor;
      totalFat += 3 * factor;
    }
  }
  
  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbohydrates: Math.round(totalCarbs),
    fat: Math.round(totalFat),
  };
}

/**
 * Estimate nutrition for a meal based on category and diet type
 */
export function estimateMealNutrition(
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  dietType?: string
): NutritionInfo {
  // Base estimates by meal type
  const mealEstimates: Record<string, NutritionInfo> = {
    breakfast: { calories: 400, protein: 15, carbohydrates: 50, fat: 15 },
    lunch: { calories: 600, protein: 30, carbohydrates: 60, fat: 20 },
    dinner: { calories: 700, protein: 35, carbohydrates: 65, fat: 25 },
    snack: { calories: 200, protein: 8, carbohydrates: 25, fat: 8 },
  };
  
  let nutrition = { ...mealEstimates[category] };
  
  // Adjust for diet type
  if (dietType) {
    switch (dietType.toLowerCase()) {
      case 'ketogenic':
      case 'keto':
        nutrition.carbohydrates = Math.round(nutrition.carbohydrates * 0.2);
        nutrition.fat = Math.round(nutrition.fat * 2);
        break;
      case 'vegetarian':
      case 'vegan':
        nutrition.protein = Math.round(nutrition.protein * 0.8);
        break;
      case 'high-protein':
        nutrition.protein = Math.round(nutrition.protein * 1.5);
        break;
      case 'low-carb':
        nutrition.carbohydrates = Math.round(nutrition.carbohydrates * 0.5);
        break;
    }
  }
  
  return nutrition;
}

/**
 * Scale nutrition to target calories
 */
export function scaleToTargetCalories(
  nutrition: NutritionInfo,
  targetCalories: number
): NutritionInfo {
  const factor = targetCalories / nutrition.calories;
  
  return {
    calories: targetCalories,
    protein: Math.round(nutrition.protein * factor),
    carbohydrates: Math.round(nutrition.carbohydrates * factor),
    fat: Math.round(nutrition.fat * factor),
  };
}
