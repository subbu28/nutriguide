import { create } from 'zustand';
import { api } from '../lib/api';
import type { MealItem, MealCategory, DietType, Favorite } from '../types';

export type Cuisine = 
  | 'All' | 'American' | 'British' | 'Canadian' | 'Chinese' | 'Croatian'
  | 'Dutch' | 'Egyptian' | 'Filipino' | 'French' | 'Greek' | 'Indian'
  | 'Irish' | 'Italian' | 'Jamaican' | 'Japanese' | 'Kenyan' | 'Malaysian'
  | 'Mexican' | 'Moroccan' | 'Polish' | 'Portuguese' | 'Russian' | 'Spanish'
  | 'Thai' | 'Tunisian' | 'Turkish' | 'Vietnamese';

export const CUISINES: Cuisine[] = [
  'All', 'American', 'British', 'Canadian', 'Chinese', 'Croatian',
  'Dutch', 'Egyptian', 'Filipino', 'French', 'Greek', 'Indian',
  'Irish', 'Italian', 'Jamaican', 'Japanese', 'Kenyan', 'Malaysian',
  'Mexican', 'Moroccan', 'Polish', 'Portuguese', 'Russian', 'Spanish',
  'Thai', 'Tunisian', 'Turkish', 'Vietnamese'
];

interface MealsState {
  meals: MealItem[];
  favorites: Favorite[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  category: MealCategory;
  dietType: DietType;
  cuisine: Cuisine;
  searchQuery: string;

  setCategory: (category: MealCategory) => void;
  setDietType: (dietType: DietType) => void;
  setCuisine: (cuisine: Cuisine) => void;
  setSearchQuery: (query: string) => void;
  fetchMeals: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  addToFavorites: (meal: MealItem) => Promise<void>;
  removeFromFavorites: (mealId: string) => Promise<void>;
  isFavorite: (mealId: string) => boolean;
}

export const useMealsStore = create<MealsState>((set, get) => ({
  meals: [],
  favorites: [],
  favoriteIds: new Set(),
  isLoading: false,
  category: 'Breakfast',
  dietType: 'Vegetarian',
  cuisine: 'All',
  searchQuery: '',

  setCategory: (category) => {
    set({ category, searchQuery: '' });
    get().fetchMeals();
  },

  setDietType: (dietType) => {
    set({ dietType });
    get().fetchMeals();
  },

  setCuisine: (cuisine) => {
    set({ cuisine });
    get().fetchMeals();
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  fetchMeals: async () => {
    const { category, dietType, cuisine } = get();
    set({ isLoading: true });
    
    try {
      const { meals } = await api.getMeals(category, dietType, cuisine);
      set({ meals, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch meals:', error);
      set({ isLoading: false });
    }
  },

  fetchFavorites: async () => {
    try {
      const { favorites } = await api.getFavorites();
      const favoriteIds = new Set(favorites.map((f: Favorite) => f.mealId));
      set({ favorites, favoriteIds });
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  },

  addToFavorites: async (meal) => {
    try {
      await api.addFavorite({
        mealId: meal.id,
        mealName: meal.name,
        mealData: meal,
        category: meal.category,
        dietType: meal.dietType,
      });
      
      const favoriteIds = new Set(get().favoriteIds);
      favoriteIds.add(meal.id);
      set({ favoriteIds });
      
      // Refresh favorites list
      get().fetchFavorites();
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      throw error;
    }
  },

  removeFromFavorites: async (mealId) => {
    try {
      await api.removeFavorite(mealId);
      
      const favoriteIds = new Set(get().favoriteIds);
      favoriteIds.delete(mealId);
      set({ favoriteIds });
      
      // Refresh favorites list
      get().fetchFavorites();
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      throw error;
    }
  },

  isFavorite: (mealId) => get().favoriteIds.has(mealId),
}));
