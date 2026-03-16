import type { MealItem } from './index';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealLog {
  id: string;
  mealId: string;
  mealData: MealItem;
  date: string;
  mealType: MealType;
  portions: number;
  totalCalories: number;
  totalProtein: number;
  notes?: string;
  createdAt: string;
}

export interface DailyStats {
  date: string;
  totalCalories: number;
  totalProtein: number;
  meals: MealLog[];
}

export interface MealStats {
  period: 'week' | 'month' | 'year';
  totalMeals: number;
  totalCalories: number;
  averageCalories: number;
  totalProtein: number;
  averageProtein: number;
  dailyBreakdown: DailyStats[];
  mealTypeBreakdown: Record<MealType, { count: number; calories: number }>;
}

export interface WeeklyProgress {
  weekStart: string;
  weekEnd: string;
  daysLogged: number;
  totalCalories: number;
  goalAchievement: number;
}

export interface LogMealData {
  mealId: string;
  mealData: MealItem;
  date: string;
  mealType: MealType;
  portions: number;
  notes?: string;
}
