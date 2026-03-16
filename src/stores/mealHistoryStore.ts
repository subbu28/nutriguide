import { create } from 'zustand';
import { api } from '../lib/api';
import type { MealLog, DailyStats, MealStats, WeeklyProgress, LogMealData, MealType } from '../types/mealHistory';

interface MealHistoryState {
  history: MealLog[];
  stats: MealStats | null;
  isLoading: boolean;
  currentStreak: number;
  error: string | null;

  // Computed getters (computed in selectors)
  getTodaysMeals: () => MealLog[];
  getThisWeekMeals: () => MealLog[];
  getCalorieTrend: () => { date: string; calories: number }[];

  // Actions
  fetchHistory: (period: 'week' | 'month' | 'year') => Promise<void>;
  logMeal: (data: LogMealData) => Promise<MealLog>;
  removeLog: (logId: string) => Promise<void>;
  getStats: (period: 'week' | 'month' | 'year') => Promise<MealStats>;
  getCurrentStreak: () => Promise<number>;
  getWeeklyProgress: () => Promise<WeeklyProgress>;
  isMealLoggedToday: (mealId: string) => boolean;
}

const calculateTotalNutrition = (mealData: LogMealData['mealData'], portions: number) => {
  // Parse protein value (e.g., "25g" -> 25)
  const proteinMatch = mealData.protein.match(/(\d+(?:\.\d+)?)/);
  const proteinPerPortion = proteinMatch ? parseFloat(proteinMatch[1]) : 0;
  
  return {
    totalCalories: Math.round(mealData.calories * portions),
    totalProtein: Math.round(proteinPerPortion * portions),
  };
};

const getStartOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return getStartOfDay(new Date(d.setDate(diff)));
};

const isSameDay = (date1: string | Date, date2: string | Date): boolean => {
  const d1 = getStartOfDay(new Date(date1));
  const d2 = getStartOfDay(new Date(date2));
  return d1.getTime() === d2.getTime();
};

const isThisWeek = (date: string | Date): boolean => {
  const checkDate = new Date(date);
  const weekStart = getStartOfWeek(new Date());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return checkDate >= weekStart && checkDate < weekEnd;
};

export const useMealHistoryStore = create<MealHistoryState>((set, get) => ({
  history: [],
  stats: null,
  isLoading: false,
  currentStreak: 0,
  error: null,

  getTodaysMeals: () => {
    const today = new Date();
    return get().history.filter((log) => isSameDay(log.date, today));
  },

  getThisWeekMeals: () => {
    return get().history.filter((log) => isThisWeek(log.date));
  },

  getCalorieTrend: () => {
    const { history } = get();
    const dailyMap = new Map<string, number>();

    // Aggregate calories by date
    history.forEach((log) => {
      const dateKey = log.date.split('T')[0];
      const current = dailyMap.get(dateKey) || 0;
      dailyMap.set(dateKey, current + log.totalCalories);
    });

    // Convert to sorted array
    return Array.from(dailyMap.entries())
      .map(([date, calories]) => ({ date, calories }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  fetchHistory: async (period) => {
    set({ isLoading: true, error: null });
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const { history } = await api.getMealHistory(
        startDate.toISOString().split('T')[0],
        endDate
      );
      
      set({ history, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch meal history:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch history',
        isLoading: false 
      });
    }
  },

  logMeal: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { totalCalories, totalProtein } = calculateTotalNutrition(data.mealData, data.portions);
      
      const logData = {
        ...data,
        totalCalories,
        totalProtein,
      };

      const { log } = await api.logMeal(logData);
      
      set((state) => ({
        history: [log, ...state.history].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        isLoading: false,
      }));

      // Refresh streak after logging
      get().getCurrentStreak();

      return log;
    } catch (error) {
      console.error('Failed to log meal:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to log meal',
        isLoading: false 
      });
      throw error;
    }
  },

  removeLog: async (logId) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteMealLog(logId);
      
      set((state) => ({
        history: state.history.filter((log) => log.id !== logId),
        isLoading: false,
      }));

      // Refresh streak after removing
      get().getCurrentStreak();
    } catch (error) {
      console.error('Failed to remove log:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to remove log',
        isLoading: false 
      });
      throw error;
    }
  },

  getStats: async (period) => {
    try {
      const stats = await api.getMealStats(period);
      set({ stats });
      return stats;
    } catch (error) {
      console.error('Failed to get stats:', error);
      throw error;
    }
  },

  getCurrentStreak: async () => {
    try {
      const { history } = get();
      if (history.length === 0) {
        set({ currentStreak: 0 });
        return 0;
      }

      // Get unique dates with logged meals, sorted descending
      const loggedDates = [...new Set(
        history.map((log) => log.date.split('T')[0])
      )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let streak = 0;
      const today = getStartOfDay(new Date());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if logged today or yesterday (streak is still active if logged yesterday)
      const lastLoggedDate = new Date(loggedDates[0]);
      const isStreakActive = isSameDay(lastLoggedDate, today) || isSameDay(lastLoggedDate, yesterday);

      if (!isStreakActive) {
        set({ currentStreak: 0 });
        return 0;
      }

      // Calculate consecutive days
      for (let i = 0; i < loggedDates.length; i++) {
        const currentDate = new Date(loggedDates[i]);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);

        if (isSameDay(currentDate, expectedDate)) {
          streak++;
        } else if (i === 0 && isSameDay(currentDate, yesterday)) {
          // Started yesterday
          streak++;
        } else {
          break;
        }
      }

      set({ currentStreak: streak });
      return streak;
    } catch (error) {
      console.error('Failed to calculate streak:', error);
      return 0;
    }
  },

  getWeeklyProgress: async () => {
    const weekStart = getStartOfWeek(new Date());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const thisWeekMeals = get().getThisWeekMeals();
    
    // Get unique days logged this week
    const loggedDays = new Set(
      thisWeekMeals.map((log) => log.date.split('T')[0])
    );

    const totalCalories = thisWeekMeals.reduce(
      (sum, log) => sum + log.totalCalories,
      0
    );

    // Assume a default goal of 2000 calories per day
    const dailyGoal = 2000;
    const daysSoFar = Math.min(
      Math.floor((new Date().getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      7
    );
    const weeklyGoal = dailyGoal * daysSoFar;
    const goalAchievement = weeklyGoal > 0 ? Math.min((totalCalories / weeklyGoal) * 100, 100) : 0;

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      daysLogged: loggedDays.size,
      totalCalories,
      goalAchievement: Math.round(goalAchievement),
    };
  },

  isMealLoggedToday: (mealId) => {
    const todaysMeals = get().getTodaysMeals();
    return todaysMeals.some((log) => log.mealId === mealId);
  },
}));
