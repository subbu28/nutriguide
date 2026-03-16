import type { MealItem, MealCategory, DietType } from './index';
import type { Cuisine } from '../stores/mealsStore';

export interface SearchFilters {
  query: string;
  dietType: DietType | 'All';
  category: MealCategory | 'All';
  cuisine: Cuisine;
  calorieRange: { min: number; max: number } | null;
  proteinRange: { min: number; max: number } | null;
  cookingTime: { min: number; max: number } | null;
  includeIngredients: string[];
  excludeIngredients: string[];
}

export interface SearchResult {
  meals: MealItem[];
  total: number;
  hasMore: boolean;
  page: number;
}

export interface RecentSearch {
  id: string;
  query: string;
  filters: Partial<SearchFilters>;
  timestamp: number;
}

export interface SearchSuggestion {
  id: string;
  type: 'meal' | 'ingredient' | 'cuisine' | 'recent';
  text: string;
  highlight?: string;
  metadata?: Record<string, any>;
}
