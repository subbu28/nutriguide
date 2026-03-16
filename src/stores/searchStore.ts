import { create } from 'zustand';
import { api } from '../lib/api';
import type { MealItem, MealCategory, DietType } from '../types';
import type { Cuisine } from './mealsStore';
import type { SearchFilters, RecentSearch, SearchResult } from '../types/search';

const RECENT_SEARCHES_KEY = 'nutriguide_recent_searches';
const MAX_RECENT_SEARCHES = 10;

interface SearchState {
  // Search state
  query: string;
  filters: SearchFilters;
  results: MealItem[];
  loading: boolean;
  hasMore: boolean;
  page: number;
  totalResults: number;
  
  // UI state
  isExpanded: boolean;
  showFilters: boolean;
  suggestions: string[];
  
  // Actions
  setQuery: (query: string) => void;
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  
  // Search actions
  search: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  
  // UI actions
  setExpanded: (expanded: boolean) => void;
  setShowFilters: (show: boolean) => void;
  
  // Recent searches
  recentSearches: RecentSearch[];
  addRecentSearch: (search: Omit<RecentSearch, 'id' | 'timestamp'>) => void;
  removeRecentSearch: (id: string) => void;
  clearRecentSearches: () => void;
  loadRecentSearches: () => void;
  
  // Suggestions
  fetchSuggestions: (query: string) => Promise<void>;
}

const defaultFilters: SearchFilters = {
  query: '',
  dietType: 'All',
  category: 'All',
  cuisine: 'All',
  calorieRange: null,
  proteinRange: null,
  cookingTime: null,
  includeIngredients: [],
  excludeIngredients: [],
};

export const useSearchStore = create<SearchState>((set, get) => ({
  // Initial state
  query: '',
  filters: { ...defaultFilters },
  results: [],
  loading: false,
  hasMore: false,
  page: 1,
  totalResults: 0,
  isExpanded: false,
  showFilters: false,
  suggestions: [],
  recentSearches: [],

  // Setters
  setQuery: (query) => {
    set({ query });
    if (query.length >= 2) {
      get().fetchSuggestions(query);
    } else {
      set({ suggestions: [] });
    }
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({ filters: { ...defaultFilters, query: get().query } });
  },

  resetFilters: () => {
    set({ 
      filters: { ...defaultFilters },
      query: '',
      results: [],
      hasMore: false,
      page: 1,
      totalResults: 0,
    });
  },

  // Search functionality
  search: async (reset = true) => {
    const { query, filters, page } = get();
    const currentPage = reset ? 1 : page;
    
    set({ loading: true });
    
    try {
      let meals: MealItem[] = [];
      
      // Use search API if there's a query, otherwise use meals API
      if (query.trim()) {
        const response = await api.searchMeals(
          query, 
          filters.dietType === 'All' ? '' : filters.dietType
        );
        meals = response.meals || [];
      } else {
        const response = await api.getMeals(
          filters.category === 'All' ? 'Breakfast' : filters.category,
          filters.dietType === 'All' ? 'Vegetarian' : filters.dietType,
          filters.cuisine
        );
        meals = response.meals || [];
      }
      
      // Apply client-side filtering for advanced filters
      let filteredMeals = meals;
      
      // Filter by cuisine if specified and not using API
      if (filters.cuisine !== 'All' && query.trim()) {
        filteredMeals = filteredMeals.filter((meal: any) => 
          meal.cuisine === filters.cuisine || meal.area === filters.cuisine
        );
      }
      
      // Filter by calorie range
      if (filters.calorieRange) {
        filteredMeals = filteredMeals.filter((meal) => 
          meal.calories >= filters.calorieRange!.min && 
          meal.calories <= filters.calorieRange!.max
        );
      }
      
      // Filter by protein range (parse protein string like "20g")
      if (filters.proteinRange) {
        filteredMeals = filteredMeals.filter((meal) => {
          const proteinMatch = meal.protein.match(/(\d+)/);
          if (!proteinMatch) return true;
          const protein = parseInt(proteinMatch[1], 10);
          return protein >= filters.proteinRange!.min && protein <= filters.proteinRange!.max;
        });
      }
      
      // Filter by cooking time if available
      if (filters.cookingTime) {
        filteredMeals = filteredMeals.filter((meal: any) => {
          if (!meal.cookingTime) return true;
          return meal.cookingTime >= filters.cookingTime!.min && 
                 meal.cookingTime <= filters.cookingTime!.max;
        });
      }
      
      // Filter by included ingredients
      if (filters.includeIngredients.length > 0) {
        filteredMeals = filteredMeals.filter((meal: any) => {
          const ingredients = (meal.ingredients || []).map((i: string) => i.toLowerCase());
          return filters.includeIngredients.every(ing => 
            ingredients.some((i: string) => i.includes(ing.toLowerCase()))
          );
        });
      }
      
      // Filter by excluded ingredients
      if (filters.excludeIngredients.length > 0) {
        filteredMeals = filteredMeals.filter((meal: any) => {
          const ingredients = (meal.ingredients || []).map((i: string) => i.toLowerCase());
          return !filters.excludeIngredients.some(ing => 
            ingredients.some((i: string) => i.includes(ing.toLowerCase()))
          );
        });
      }
      
      // Pagination (client-side for now)
      const pageSize = 20;
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMeals = filteredMeals.slice(startIndex, endIndex);
      
      set({
        results: reset ? paginatedMeals : [...get().results, ...paginatedMeals],
        hasMore: endIndex < filteredMeals.length,
        page: currentPage,
        totalResults: filteredMeals.length,
        loading: false,
      });
      
      // Add to recent searches if there's a query
      if (query.trim() && reset) {
        get().addRecentSearch({
          query,
          filters: { ...filters },
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      set({ loading: false, results: [], hasMore: false });
    }
  },

  loadMore: async () => {
    const { hasMore, loading, page } = get();
    if (!hasMore || loading) return;
    
    set({ page: page + 1 });
    await get().search(false);
  },

  // UI actions
  setExpanded: (isExpanded) => set({ isExpanded }),
  setShowFilters: (showFilters) => set({ showFilters }),

  // Recent searches
  addRecentSearch: (search) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSearch: RecentSearch = {
      ...search,
      id,
      timestamp: Date.now(),
    };
    
    set((state) => {
      const filtered = state.recentSearches.filter(
        (s) => s.query.toLowerCase() !== search.query.toLowerCase()
      );
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      
      // Persist to localStorage
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      
      return { recentSearches: updated };
    });
  },

  removeRecentSearch: (id) => {
    set((state) => {
      const updated = state.recentSearches.filter((s) => s.id !== id);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return { recentSearches: updated };
    });
  },

  clearRecentSearches: () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    set({ recentSearches: [] });
  },

  loadRecentSearches: () => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ recentSearches: parsed });
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  },

  // Suggestions
  fetchSuggestions: async (query) => {
    // This would ideally call an API endpoint for suggestions
    // For now, we'll provide some static suggestions based on the query
    const suggestions: string[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Common meal suggestions
    const commonMeals = [
      'Chicken Curry', 'Vegetable Stir Fry', 'Pasta Primavera', 
      'Grilled Salmon', 'Quinoa Bowl', 'Caesar Salad',
      'Beef Tacos', 'Mushroom Risotto', 'Thai Green Curry',
      'Mediterranean Bowl', 'Buddha Bowl', 'Protein Smoothie'
    ];
    
    // Common ingredients
    const commonIngredients = [
      'chicken', 'rice', 'pasta', 'salmon', 'broccoli',
      'spinach', 'tomato', 'avocado', 'quinoa', 'lentils'
    ];
    
    // Add matching meals
    commonMeals
      .filter(m => m.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .forEach(m => suggestions.push(m));
    
    // Add matching ingredients
    commonIngredients
      .filter(i => i.includes(lowerQuery))
      .slice(0, 2)
      .forEach(i => suggestions.push(`Recipes with ${i}`));
    
    set({ suggestions: suggestions.slice(0, 5) });
  },
}));
