import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Loader2, Clock, Utensils } from 'lucide-react';
import type { MealItem } from '../types';
import type { MealType } from '../types/mealHistory';
import { useMealHistoryStore } from '../stores/mealHistoryStore';

interface QuickLogButtonProps {
  meal: MealItem;
  variant?: 'floating' | 'inline' | 'icon-only';
  className?: string;
  onLog?: () => void;
}

export const QuickLogButton: React.FC<QuickLogButtonProps> = ({
  meal,
  variant = 'floating',
  className = '',
  onLog,
}) => {
  const [isLogging, setIsLogging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showMealTypeSelector, setShowMealTypeSelector] = useState(false);

  const { logMeal, isMealLoggedToday } = useMealHistoryStore();
  const isLoggedToday = isMealLoggedToday(meal.id);

  // Get current hour to suggest meal type
  const getSuggestedMealType = (): MealType => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  const handleQuickLog = async (mealType: MealType) => {
    setIsLogging(true);
    setShowMealTypeSelector(false);

    try {
      await logMeal({
        mealId: meal.id,
        mealData: meal,
        date: new Date().toISOString().split('T')[0],
        mealType,
        portions: 1,
      });

      setShowSuccess(true);
      onLog?.();

      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to quick log meal:', error);
    } finally {
      setIsLogging(false);
    }
  };

  const mealTypeOptions: { type: MealType; label: string; icon: React.ReactNode }[] = [
    { type: 'breakfast', label: 'Breakfast', icon: <Clock className="w-3 h-3" /> },
    { type: 'lunch', label: 'Lunch', icon: <Utensils className="w-3 h-3" /> },
    { type: 'dinner', label: 'Dinner', icon: <Utensils className="w-3 h-3" /> },
    { type: 'snack', label: 'Snack', icon: <Clock className="w-3 h-3" /> },
  ];

  // Floating variant (for meal cards)
  if (variant === 'floating') {
    return (
      <div className={`relative ${className}`}>
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
            >
              <Check className="w-5 h-5 text-white" />
            </motion.div>
          ) : showMealTypeSelector ? (
            <motion.div
              key="selector"
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 10 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-elevated border border-stone-100 p-1.5 min-w-[120px]"
            >
              <div className="space-y-0.5">
                {mealTypeOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleQuickLog(option.type)}
                    disabled={isLogging}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      option.type === getSuggestedMealType()
                        ? 'text-emerald-700 bg-emerald-50'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                <div className="w-2 h-2 bg-white rotate-45 border-r border-b border-stone-100" />
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMealTypeSelector(true)}
              disabled={isLogging || isLoggedToday}
              className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isLoggedToday
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-stone-200'
              }`}
              title={isLoggedToday ? 'Already logged today' : 'Quick log meal'}
            >
              {isLogging ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLoggedToday ? (
                <Check className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Click outside to close selector */}
        {showMealTypeSelector && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMealTypeSelector(false)}
          />
        )}
      </div>
    );
  }

  // Inline variant (for lists or tables)
  if (variant === 'inline') {
    return (
      <div className={`relative ${className}`}>
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              Logged!
            </motion.div>
          ) : showMealTypeSelector ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex items-center gap-1 bg-white rounded-xl shadow-soft border border-stone-100 p-1"
            >
              {mealTypeOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleQuickLog(option.type)}
                  disabled={isLogging}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    option.type === getSuggestedMealType()
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.button
              key="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMealTypeSelector(true)}
              disabled={isLogging || isLoggedToday}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isLoggedToday
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
              }`}
            >
              {isLogging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isLoggedToday ? (
                <>
                  <Check className="w-4 h-4" />
                  Logged Today
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Quick Log
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Click outside to close selector */}
        {showMealTypeSelector && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMealTypeSelector(false)}
          />
        )}
      </div>
    );
  }

  // Icon-only variant (compact)
  return (
    <button
      onClick={() => handleQuickLog(getSuggestedMealType())}
      disabled={isLogging || isLoggedToday}
      className={`p-2 rounded-lg transition-colors ${
        isLoggedToday
          ? 'text-emerald-600 bg-emerald-50'
          : 'text-stone-400 hover:text-emerald-600 hover:bg-emerald-50'
      } ${className}`}
      title={isLoggedToday ? 'Already logged today' : 'Quick log meal'}
    >
      {isLogging ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isLoggedToday ? (
        <Check className="w-4 h-4" />
      ) : (
        <Plus className="w-4 h-4" />
      )}
    </button>
  );
};
