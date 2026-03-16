import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  List,
  Flame,
  Dumbbell,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Sun,
  Moon,
  GlassWater,
  Plus,
  Trash2,
  X,
  Loader2,
  Utensils,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { useMealHistoryStore } from '../stores/mealHistoryStore';
import type { MealLog, MealType, DailyStats } from '../types/mealHistory';
import { MealLogModal } from '../components/MealLogModal';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const mealTypeConfig: Record<MealType, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  breakfast: {
    label: 'Breakfast',
    icon: <Coffee className="w-4 h-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  lunch: {
    label: 'Lunch',
    icon: <Sun className="w-4 h-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  dinner: {
    label: 'Dinner',
    icon: <Moon className="w-4 h-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  snack: {
    label: 'Snack',
    icon: <GlassWater className="w-4 h-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function MealHistory() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const {
    history,
    isLoading,
    currentStreak,
    fetchHistory,
    removeLog,
    getCurrentStreak,
    getWeeklyProgress,
    getCalorieTrend,
    getTodaysMeals,
  } = useMealHistoryStore();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterMealType, setFilterMealType] = useState<MealType | 'all'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState<{ daysLogged: number; goalAchievement: number } | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [selectedMealForLog, setSelectedMealForLog] = useState<MealLog['mealData'] | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchHistory('month');
    getCurrentStreak();
    getWeeklyProgress().then(setWeeklyProgress);
  }, [isAuthenticated, navigate, fetchHistory, getCurrentStreak, getWeeklyProgress]);

  // Computed values
  const todaysMeals = getTodaysMeals();
  const calorieTrend = getCalorieTrend();
  
  const filteredHistory = useMemo(() => {
    if (filterMealType === 'all') return history;
    return history.filter((log) => log.mealType === filterMealType);
  }, [history, filterMealType]);

  const dailyStats = useMemo(() => {
    const stats = new Map<string, DailyStats>();
    
    filteredHistory.forEach((log) => {
      const dateKey = log.date.split('T')[0];
      const existing = stats.get(dateKey);
      
      if (existing) {
        existing.totalCalories += log.totalCalories;
        existing.totalProtein += log.totalProtein;
        existing.meals.push(log);
      } else {
        stats.set(dateKey, {
          date: dateKey,
          totalCalories: log.totalCalories,
          totalProtein: log.totalProtein,
          meals: [log],
        });
      }
    });
    
    return stats;
  }, [filteredHistory]);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const navigateMonth = (delta: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const handleDeleteLog = async (logId: string) => {
    setDeletingLogId(logId);
    try {
      await removeLog(logId);
    } finally {
      setDeletingLogId(null);
    }
  };

  const totalCaloriesToday = todaysMeals.reduce((sum, log) => sum + log.totalCalories, 0);
  const totalProteinToday = todaysMeals.reduce((sum, log) => sum + log.totalProtein, 0);

  const renderCalendarView = () => {
    const days = getDaysInMonth(currentDate);
    const today = new Date().toISOString().split('T')[0];

    return (
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold text-stone-800">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-stone-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateKey = getDateKey(day);
            const stats = dailyStats.get(dateKey);
            const isToday = dateKey === today;
            const isSelected = selectedDate === dateKey;
            const hasMeals = stats && stats.meals.length > 0;

            return (
              <motion.button
                key={day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                className={`aspect-square rounded-xl p-2 flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : isToday
                    ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700'
                    : hasMeals
                    ? 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                    : 'hover:bg-stone-50 text-stone-600'
                }`}
              >
                <span className="text-sm font-semibold">{day}</span>
                {hasMeals && (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={`text-[10px] font-medium ${isSelected ? 'text-emerald-100' : 'text-orange-600'}`}>
                      {stats?.totalCalories}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from(new Set(stats?.meals.map((m) => m.mealType))).slice(0, 3).map((type) => (
                        <div
                          key={type}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-emerald-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Day Details */}
        <AnimatePresence>
          {selectedDate && dailyStats.get(selectedDate) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-xl p-4 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-stone-800">
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h4>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>
              <div className="flex gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">{dailyStats.get(selectedDate)?.totalCalories} kcal</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Dumbbell className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">{dailyStats.get(selectedDate)?.totalProtein}g protein</span>
                </div>
              </div>
              <div className="space-y-2">
                {dailyStats.get(selectedDate)?.meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-2 bg-white rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mealTypeConfig[meal.mealType].bgColor}`}>
                        {mealTypeConfig[meal.mealType].icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800 line-clamp-1">{meal.mealData.name}</p>
                        <p className="text-xs text-stone-500">{meal.portions} portion{meal.portions !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLog(meal.id)}
                      disabled={deletingLogId === meal.id}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {deletingLogId === meal.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderListView = () => {
    // Group by date
    const grouped = new Map<string, MealLog[]>();
    [...filteredHistory]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((log) => {
        const dateKey = log.date.split('T')[0];
        const existing = grouped.get(dateKey) || [];
        existing.push(log);
        grouped.set(dateKey, existing);
      });

    return (
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {Array.from(grouped.entries()).map(([date, logs]) => {
          const dateObj = new Date(date);
          const isToday = date === new Date().toISOString().split('T')[0];
          const dayTotal = logs.reduce((sum, log) => sum + log.totalCalories, 0);

          return (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl overflow-hidden"
            >
              <div className="p-4 border-b border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-stone-800">
                      {isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                    </h4>
                    <p className="text-sm text-stone-500">
                      {dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">{dayTotal} <span className="text-sm font-normal">kcal</span></p>
                    <p className="text-xs text-stone-500">{logs.length} meal{logs.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-stone-50">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {log.mealData.imageUrl ? (
                        <img
                          src={log.mealData.imageUrl}
                          alt={log.mealData.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-stone-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-stone-800">{log.mealData.name}</p>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span className={`flex items-center gap-1 ${mealTypeConfig[log.mealType].color}`}>
                            {mealTypeConfig[log.mealType].icon}
                            {mealTypeConfig[log.mealType].label}
                          </span>
                          <span>•</span>
                          <span>{log.portions} portion{log.portions !== 1 ? 's' : ''}</span>
                        </div>
                        {log.notes && (
                          <p className="text-xs text-stone-400 mt-1 line-clamp-1">{log.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-stone-700">{log.totalCalories} kcal</p>
                        <p className="text-xs text-stone-500">{log.totalProtein}g protein</p>
                      </div>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        disabled={deletingLogId === log.id}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {deletingLogId === log.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {grouped.size === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-700 mb-1">No meals logged yet</h3>
            <p className="text-sm text-stone-500">Start logging your meals to see your history</p>
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            Meal History
          </h1>
          <p className="text-stone-600 mt-2">Track your nutrition and build healthy habits</p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          Quick Log
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Streak Card */}
        <div className="glass rounded-2xl p-5 card-hover">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <p className="text-3xl font-bold text-stone-800">{currentStreak}</p>
          <p className="text-xs text-stone-500 font-medium">Day Streak</p>
          <p className="text-xs text-stone-400 mt-1">Keep it up!</p>
        </div>

        {/* Today's Calories */}
        <div className="glass rounded-2xl p-5 card-hover">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-3">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <p className="text-3xl font-bold text-stone-800">{totalCaloriesToday}</p>
          <p className="text-xs text-stone-500 font-medium">Today's Calories</p>
          <p className="text-xs text-stone-400 mt-1">kcal consumed</p>
        </div>

        {/* Today's Protein */}
        <div className="glass rounded-2xl p-5 card-hover">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-3">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <p className="text-3xl font-bold text-stone-800">{totalProteinToday}g</p>
          <p className="text-xs text-stone-500 font-medium">Today's Protein</p>
          <p className="text-xs text-stone-400 mt-1">grams consumed</p>
        </div>

        {/* Weekly Progress */}
        <div className="glass rounded-2xl p-5 card-hover">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <p className="text-3xl font-bold text-stone-800">{weeklyProgress?.daysLogged || 0}/7</p>
          <p className="text-xs text-stone-500 font-medium">Days This Week</p>
          <p className="text-xs text-stone-400 mt-1">{weeklyProgress?.goalAchievement || 0}% of goal</p>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* History View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          {/* View Toggle & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>

            {/* Meal Type Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                {filterMealType === 'all' ? 'All Meals' : mealTypeConfig[filterMealType].label}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showFilterDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-stone-100 z-10"
                  >
                    <button
                      onClick={() => { setFilterMealType('all'); setShowFilterDropdown(false); }}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-stone-50 first:rounded-t-xl ${
                        filterMealType === 'all' ? 'text-emerald-700 font-medium bg-emerald-50' : 'text-stone-700'
                      }`}
                    >
                      All Meals
                    </button>
                    {(Object.keys(mealTypeConfig) as MealType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => { setFilterMealType(type); setShowFilterDropdown(false); }}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-stone-50 last:rounded-b-xl flex items-center gap-2 ${
                          filterMealType === type ? 'text-emerald-700 font-medium bg-emerald-50' : 'text-stone-700'
                        }`}
                      >
                        {mealTypeConfig[type].icon}
                        {mealTypeConfig[type].label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* View Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            viewMode === 'calendar' ? renderCalendarView() : renderListView()
          )}

          {/* Click outside to close filter */}
          {showFilterDropdown && (
            <div
              className="fixed inset-0 z-0"
              onClick={() => setShowFilterDropdown(false)}
            />
          )}
        </motion.div>

        {/* Today's Summary Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Today's Meals */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Today's Meals
            </h3>
            
            {todaysMeals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-stone-500 text-sm">No meals logged today</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-3 text-emerald-600 text-sm font-medium hover:underline"
                >
                  Log your first meal
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mealTypeConfig[meal.mealType].bgColor}`}>
                      {mealTypeConfig[meal.mealType].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{meal.mealData.name}</p>
                      <p className="text-xs text-stone-500">{meal.totalCalories} kcal</p>
                    </div>
                    <button
                      onClick={() => handleDeleteLog(meal.id)}
                      disabled={deletingLogId === meal.id}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      {deletingLogId === meal.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calorie Trend Mini Chart */}
          {calorieTrend.length > 1 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Calorie Trend
              </h3>
              <div className="h-32">
                <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={t * 50}
                      x2="100"
                      y2={t * 50}
                      stroke="#e5e7eb"
                      strokeWidth="0.5"
                    />
                  ))}
                  
                  {/* Line */}
                  {calorieTrend.slice(-7).map((point, i, arr) => {
                    if (i === 0) return null;
                    const max = Math.max(...arr.map((d) => d.calories));
                    const min = Math.min(...arr.map((d) => d.calories));
                    const range = max - min || 1;
                    
                    const x1 = ((i - 1) / (arr.length - 1)) * 100;
                    const y1 = 50 - ((arr[i - 1].calories - min) / range) * 40 - 5;
                    const x2 = (i / (arr.length - 1)) * 100;
                    const y2 = 50 - ((point.calories - min) / range) * 40 - 5;
                    
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    );
                  })}
                  
                  {/* Points */}
                  {calorieTrend.slice(-7).map((point, i, arr) => {
                    const max = Math.max(...arr.map((d) => d.calories));
                    const min = Math.min(...arr.map((d) => d.calories));
                    const range = max - min || 1;
                    
                    const x = (i / (arr.length - 1)) * 100;
                    const y = 50 - ((point.calories - min) / range) * 40 - 5;
                    
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="2"
                        fill="white"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>
              </div>
              <p className="text-xs text-stone-500 text-center mt-2">Last 7 days</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Meal Log Modal */}
      {selectedMealForLog && (
        <MealLogModal
          meal={selectedMealForLog}
          isOpen={!!selectedMealForLog}
          onClose={() => setSelectedMealForLog(null)}
        />
      )}
    </div>
  );
}
