import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Utensils,
  Clock,
  Flame,
  Dumbbell,
  Minus,
  Plus,
  FileText,
  Check,
  Loader2,
} from 'lucide-react';
import type { MealItem } from '../types';
import type { MealType, LogMealData } from '../types/mealHistory';
import { useMealHistoryStore } from '../stores/mealHistoryStore';

interface MealLogModalProps {
  meal: MealItem;
  isOpen: boolean;
  onClose: () => void;
  initialMealType?: MealType;
}

const mealTypeConfig: Record<MealType, { label: string; icon: React.ReactNode; color: string }> = {
  breakfast: {
    label: 'Breakfast',
    icon: <Clock className="w-4 h-4" />,
    color: 'from-orange-500 to-amber-500',
  },
  lunch: {
    label: 'Lunch',
    icon: <Utensils className="w-4 h-4" />,
    color: 'from-emerald-500 to-teal-500',
  },
  dinner: {
    label: 'Dinner',
    icon: <Utensils className="w-4 h-4" />,
    color: 'from-blue-500 to-indigo-500',
  },
  snack: {
    label: 'Snack',
    icon: <Clock className="w-4 h-4" />,
    color: 'from-purple-500 to-pink-500',
  },
};

export const MealLogModal: React.FC<MealLogModalProps> = ({
  meal,
  isOpen,
  onClose,
  initialMealType = 'lunch',
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [portions, setPortions] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { logMeal } = useMealHistoryStore();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setMealType(initialMealType);
      setPortions(1);
      setNotes('');
      setShowSuccess(false);
    }
  }, [isOpen, initialMealType]);

  // Calculate nutrition based on portions
  const proteinMatch = meal.protein.match(/(\d+(?:\.\d+)?)/);
  const proteinPerPortion = proteinMatch ? parseFloat(proteinMatch[1]) : 0;
  const totalCalories = Math.round(meal.calories * portions);
  const totalProtein = Math.round(proteinPerPortion * portions);

  const handlePortionChange = (delta: number) => {
    setPortions((prev) => Math.max(0.5, Math.min(5, prev + delta)));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const logData: LogMealData = {
        mealId: meal.id,
        mealData: meal,
        date,
        mealType,
        portions,
        notes: notes.trim() || undefined,
      };

      await logMeal(logData);
      setShowSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to log meal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current hour to suggest meal type
  const getSuggestedMealType = (): MealType => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-elevated overflow-hidden pointer-events-auto max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="relative h-32 bg-gradient-to-br from-emerald-500 to-teal-600 p-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-white mb-1">{meal.name}</h2>
                <p className="text-emerald-100 text-sm">Log this meal to your history</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {showSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                      <Check className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-800">Meal Logged!</h3>
                    <p className="text-stone-500 text-center mt-2">
                      Your meal has been added to your history
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Date Picker */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 input-focus text-stone-700"
                      />
                    </div>

                    {/* Meal Type Selector */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                        <Utensils className="w-4 h-4" />
                        Meal Type
                        {mealType === getSuggestedMealType() && (
                          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Suggested
                          </span>
                        )}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(mealTypeConfig) as MealType[]).map((type) => {
                          const config = mealTypeConfig[type];
                          const isSelected = mealType === type;
                          return (
                            <button
                              key={type}
                              onClick={() => setMealType(type)}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                                isSelected
                                  ? `border-transparent bg-gradient-to-r ${config.color} text-white shadow-lg`
                                  : 'border-stone-200 hover:border-emerald-200 hover:bg-emerald-50/50 text-stone-700'
                              }`}
                            >
                              {config.icon}
                              <span className="font-medium text-sm">{config.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Portion Size Adjuster */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                        <Flame className="w-4 h-4" />
                        Portions
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handlePortionChange(-0.5)}
                          disabled={portions <= 0.5}
                          className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="flex-1 text-center">
                          <span className="text-2xl font-bold text-stone-800">{portions}</span>
                          <span className="text-sm text-stone-500 ml-1">
                            {portions === 1 ? 'portion' : 'portions'}
                          </span>
                        </div>
                        <button
                          onClick={() => handlePortionChange(0.5)}
                          disabled={portions >= 5}
                          className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Nutrition Preview */}
                    <div className="bg-stone-50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-stone-600 mb-3">Nutrition Summary</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Flame className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-stone-800">{totalCalories}</p>
                            <p className="text-xs text-stone-500">calories</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Dumbbell className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-stone-800">{totalProtein}g</p>
                            <p className="text-xs text-stone-500">protein</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Field */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-2">
                        <FileText className="w-4 h-4" />
                        Notes (optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How was the meal? Any modifications?"
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 input-focus text-stone-700 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          Log Meal
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
