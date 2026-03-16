import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import type { ShoppingItem, ShoppingCategory } from '../types/shopping';
import { guessCategory } from '../types/shopping';

interface GroupedItems {
  [category: string]: ShoppingItem[];
}

interface ShoppingListState {
  items: ShoppingItem[];
  isLoading: boolean;
  error: string | null;
  
  // Getters (computed)
  categories: GroupedItems;
  totalItems: number;
  checkedItems: number;
  uncheckedItems: number;
  
  // Actions
  fetchShoppingList: () => Promise<void>;
  addItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
  removeItem: (itemId: string) => void;
  toggleChecked: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: string) => void;
  updateCategory: (itemId: string, category: ShoppingCategory) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  generateFromMealPlan: (mealPlanId: string) => Promise<void>;
  generateFromFavorites: () => Promise<void>;
  addIngredients: (ingredients: any[], mealId?: string, mealName?: string) => void;
  mergeItems: (newItems: ShoppingItem[], replace: boolean) => void;
}

// Generate unique ID
const generateId = () => `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Parse ingredient and create shopping item
const parseIngredient = (
  ingredient: any,
  mealId?: string,
  mealName?: string
): ShoppingItem => {
  const name = ingredient.name || ingredient.originalName || 'Unknown Item';
  const amount = ingredient.amount || ingredient.measures?.metric?.amount || 1;
  const unit = ingredient.unit || ingredient.measures?.metric?.unitShort || '';
  const aisle = ingredient.aisle || '';
  
  // Try to guess category from name and aisle
  let category = guessCategory(name);
  if (aisle) {
    const aisleCategory = guessCategory(aisle);
    if (aisleCategory !== 'other') {
      category = aisleCategory;
    }
  }
  
  return {
    id: generateId(),
    name: name.charAt(0).toUpperCase() + name.slice(1),
    quantity: unit ? `${amount} ${unit}` : `${amount}`,
    category,
    checked: false,
    mealId,
    mealName,
  };
};

export const useShoppingListStore = create<ShoppingListState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      
      // Computed getters
      get categories() {
        const { items } = get();
        const grouped: GroupedItems = {
          produce: [],
          dairy: [],
          meat: [],
          seafood: [],
          pantry: [],
          frozen: [],
          bakery: [],
          other: [],
        };
        
        items.forEach((item) => {
          if (!grouped[item.category]) {
            grouped[item.category] = [];
          }
          grouped[item.category].push(item);
        });
        
        // Sort items within each category: unchecked first, then by name
        Object.keys(grouped).forEach((key) => {
          grouped[key].sort((a, b) => {
            if (a.checked === b.checked) {
              return a.name.localeCompare(b.name);
            }
            return a.checked ? 1 : -1;
          });
        });
        
        return grouped;
      },
      
      get totalItems() {
        return get().items.length;
      },
      
      get checkedItems() {
        return get().items.filter((item) => item.checked).length;
      },
      
      get uncheckedItems() {
        return get().items.filter((item) => !item.checked).length;
      },
      
      // Actions
      fetchShoppingList: async () => {
        // Shopping list is persisted locally via Zustand persist middleware
        // Future: sync with backend when API endpoint is available
        set({ isLoading: false });
      },
      
      addItem: (item) => {
        const newItem: ShoppingItem = {
          ...item,
          id: generateId(),
          checked: false,
        };
        
        // Check for duplicate and merge if same name and category
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) => i.name.toLowerCase() === item.name.toLowerCase() && i.category === item.category
        );
        
        if (existingIndex >= 0) {
          // Merge quantities (simple concatenation for now)
          const existing = items[existingIndex];
          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...existing,
            quantity: `${existing.quantity} + ${item.quantity}`,
          };
          set({ items: updatedItems });
        } else {
          set({ items: [...items, newItem] });
        }
      },
      
      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },
      
      toggleChecked: (itemId) => {
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        });
      },
      
      updateQuantity: (itemId, quantity) => {
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },
      
      updateCategory: (itemId, category) => {
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, category } : item
          ),
        });
      },
      
      clearCompleted: () => {
        set({ items: get().items.filter((item) => !item.checked) });
      },
      
      clearAll: () => {
        set({ items: [] });
      },
      
      generateFromMealPlan: async (mealPlanId) => {
        set({ isLoading: true, error: null });
        try {
          // Fetch meal plan details
          const response = await api.getMealPlan?.(mealPlanId);
          const mealPlan = response?.mealPlan;
          if (!mealPlan?.meals || !Array.isArray(mealPlan.meals)) {
            throw new Error('Meal plan not found');
          }
          
          const newItems: ShoppingItem[] = [];
          
          for (const meal of mealPlan.meals) {
            // Fetch recipe details to get ingredients
            const { recipe } = await api.getRecipeDetails(meal.recipeId);
            if (recipe?.extendedIngredients) {
              const ingredients = recipe.extendedIngredients.map((ing: any) =>
                parseIngredient(ing, meal.recipeId, meal.recipeName)
              );
              newItems.push(...ingredients);
            }
          }
          
          set((state) => ({ items: [...state.items, ...newItems], isLoading: false }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to generate shopping list', isLoading: false });
        }
      },
      
      generateFromFavorites: async () => {
        set({ isLoading: true, error: null });
        try {
          const { favorites } = await api.getFavorites();
          const newItems: ShoppingItem[] = [];
          
          for (const favorite of favorites) {
            // Try to get ingredients from mealData
            const mealData = favorite.mealData;
            if (mealData?.ingredients) {
              const ingredients = mealData.ingredients.map((ing: any) =>
                parseIngredient(ing, favorite.mealId, favorite.mealName)
              );
              newItems.push(...ingredients);
            }
          }
          
          set((state) => ({ items: [...state.items, ...newItems], isLoading: false }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to generate from favorites', isLoading: false });
        }
      },
      
      addIngredients: (ingredients, mealId, mealName) => {
        const newItems = ingredients.map((ing) =>
          parseIngredient(ing, mealId, mealName)
        );
        
        set((state) => {
          // Merge with existing items, avoiding exact duplicates
          const existing = new Set(
            state.items.map((i) => `${i.name.toLowerCase()}_${i.category}`)
          );
          const uniqueNewItems = newItems.filter(
            (i) => !existing.has(`${i.name.toLowerCase()}_${i.category}`)
          );
          
          return { items: [...state.items, ...uniqueNewItems] };
        });
      },
      
      mergeItems: (newItems, replace) => {
        if (replace) {
          set({ items: newItems });
        } else {
          set((state) => {
            const existing = new Set(
              state.items.map((i) => `${i.name.toLowerCase()}_${i.category}`)
            );
            const uniqueNewItems = newItems.filter(
              (i) => !existing.has(`${i.name.toLowerCase()}_${i.category}`)
            );
            return { items: [...state.items, ...uniqueNewItems] };
          });
        }
      },
    }),
    {
      name: 'nutriguide-shopping-list',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
