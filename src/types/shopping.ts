export type ShoppingCategory =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'seafood'
  | 'pantry'
  | 'frozen'
  | 'bakery'
  | 'other';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: ShoppingCategory;
  checked: boolean;
  mealId?: string;
  mealName?: string;
}

export interface CategoryConfig {
  id: ShoppingCategory;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface ShoppingListState {
  items: ShoppingItem[];
  isLoading: boolean;
  error: string | null;
}

export const SHOPPING_CATEGORIES: CategoryConfig[] = [
  {
    id: 'produce',
    label: 'Produce',
    icon: 'Carrot',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'dairy',
    label: 'Dairy',
    icon: 'Milk',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'meat',
    label: 'Meat',
    icon: 'Beef',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  {
    id: 'seafood',
    label: 'Seafood',
    icon: 'Fish',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  {
    id: 'pantry',
    label: 'Pantry',
    icon: 'Package',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  {
    id: 'frozen',
    label: 'Frozen',
    icon: 'Snowflake',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  {
    id: 'bakery',
    label: 'Bakery',
    icon: 'Croissant',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'other',
    label: 'Other',
    icon: 'ShoppingBag',
    color: 'text-stone-600',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-200',
  },
];

export function guessCategory(name: string): ShoppingCategory {
  const lowerName = name.toLowerCase();
  
  // Check for common keywords in the name
  const keywords: Record<ShoppingCategory, string[]> = {
    produce: ['apple', 'banana', 'carrot', 'lettuce', 'tomato', 'onion', 'garlic', 'potato', 'lemon', 'lime', 'orange', 'grape', 'berry', 'berries', 'spinach', 'kale', 'cucumber', 'pepper', 'broccoli', 'cauliflower', 'zucchini', 'squash', 'mushroom', 'avocado', 'ginger', 'cilantro', 'parsley', 'basil', 'mint', 'thyme', 'rosemary', 'salad', 'greens'],
    dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'eggs', 'mozzarella', 'cheddar', 'parmesan', 'feta', 'ricotta', 'sour cream', 'whipped cream', 'cottage cheese'],
    meat: ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'bacon', 'sausage', 'ham', 'steak', 'ground beef', 'ground turkey', 'ribs', 'roast', 'drumstick', 'breast', 'thigh'],
    seafood: ['fish', 'salmon', 'tuna', 'shrimp', 'prawn', 'crab', 'lobster', 'scallop', 'cod', 'tilapia', 'mahi', 'sardine', 'anchovy', 'clam', 'mussel', 'oyster', 'seafood'],
    pantry: ['rice', 'pasta', 'noodle', 'flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'sauce', 'canned', 'can', 'bean', 'lentil', 'chickpea', 'tofu', 'honey', 'syrup', 'nut', 'almond', 'walnut', 'cashew', 'seed', 'spice', 'herb dried', 'broth', 'stock', 'cereal', 'oat', 'granola', 'cracker', 'chip'],
    frozen: ['frozen', 'ice cream', 'pizza', 'frozen dinner', 'frozen meal', 'frozen vegetable', 'frozen fruit'],
    bakery: ['bread', 'bun', 'roll', 'bagel', 'croissant', 'muffin', 'baguette', 'pita', 'tortilla', 'wrap', 'sliced bread', 'loaf'],
    other: [],
  };
  
  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (lowerName.includes(word)) {
        return category as ShoppingCategory;
      }
    }
  }
  
  return 'other';
}
