import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, ChefHat, Sparkles, Clock, Users, Flame, 
  ChevronLeft, ChevronRight, Plus, Trash2, Check, X,
  Coffee, Sun, Moon, Cookie, AlertCircle, Loader2,
  Download, Save, RefreshCw, Shuffle, Eye, ShoppingCart,
  BarChart3, Printer, Share2, Settings, ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { RecipeDetailModal } from '../components/RecipeDetailModal';
import { ShoppingList } from '../components/ShoppingList';
import { NutritionChart } from '../components/NutritionChart';
import { SwapMealModal } from '../components/SwapMealModal';

interface Meal {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
}

interface DayPlan {
  meals: Meal[];
  nutrients: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
}

interface WeekPlan {
  [key: string]: DayPlan;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', 
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
};

const SLOT_ICONS = {
  BREAKFAST: Coffee,
  LUNCH: Sun,
  DINNER: Moon,
  SNACK: Cookie,
};

const SLOT_COLORS = {
  BREAKFAST: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  LUNCH: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
  DINNER: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  SNACK: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
};

type ViewMode = 'calendar' | 'list' | 'nutrition';

type PlannerSource = 'auto' | 'spoonacular' | 'inhouse';

export const MealPlanner: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Planner availability
  const [spoonacularEnabled, setSpoonacularEnabled] = useState(false);
  const [inHouseEnabled, setInHouseEnabled] = useState(false);
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  const [plannerSource, setPlannerSource] = useState<PlannerSource>('auto');
  const [lastUsedSource, setLastUsedSource] = useState<string>('');
  
  const [dietOptions, setDietOptions] = useState<{ value: string; label: string }[]>([]);
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  
  // Generation settings
  const [timeFrame, setTimeFrame] = useState<'day' | 'week'>('week');
  const [targetCalories, setTargetCalories] = useState<number>(2000);
  const [selectedDiet, setSelectedDiet] = useState<string>('');
  const [excludeIngredients, setExcludeIngredients] = useState<string>('');
  
  const [showSettings, setShowSettings] = useState(true);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [planName, setPlanName] = useState('');
  
  // Recipe detail modal
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | string | null>(null);
  const [recipeSource, setRecipeSource] = useState<string>('');
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  
  // Shopping list
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [showShoppingList, setShowShoppingList] = useState(false);
  
  // Swap meal modal
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapMealData, setSwapMealData] = useState<{ meal: any; day: string; index: number } | null>(null);
  const [swappingMealId, setSwappingMealId] = useState<string | null>(null);
  
  // Ref to prevent double saves
  const isSavingRef = useRef(false);

  useEffect(() => {
    checkStatus();
    if (isAuthenticated) {
      loadSavedPlans();
    }
  }, [isAuthenticated]);

  const checkStatus = async () => {
    try {
      const status = await api.getMealPlannerStatus();
      setSpoonacularEnabled(status.spoonacularEnabled);
      setInHouseEnabled(status.inHouseEnabled);
      setGeminiEnabled(status.geminiEnabled);
      setDietOptions(status.dietOptions);
    } catch (err) {
      console.error('Failed to check meal planner status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedPlans = async () => {
    try {
      const { plans } = await api.getMealPlans();
      setSavedPlans(plans || []);
    } catch (err) {
      console.error('Failed to load saved plans:', err);
      setSavedPlans([]);
    }
  };

  const loadSavedPlan = (plan: any) => {
    // Convert saved plan meals back to week plan format
    const newWeekPlan: WeekPlan = {};
    
    if (plan.meals && plan.meals.length > 0) {
      // Group meals by day
      plan.meals.forEach((meal: any) => {
        const mealDate = new Date(meal.date);
        const dayIndex = Math.floor((mealDate.getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24));
        const dayName = DAYS[dayIndex] || DAYS[0];
        
        if (!newWeekPlan[dayName]) {
          newWeekPlan[dayName] = {
            meals: [],
            nutrients: { calories: 0, protein: 0, carbohydrates: 0, fat: 0 }
          };
        }
        
        // Convert saved meal to display format
        const mealData = meal.recipeData || {};
        newWeekPlan[dayName].meals.push({
          id: meal.recipeId,
          title: meal.recipeName,
          image: meal.recipeImage || mealData.image || '',
          readyInMinutes: mealData.readyInMinutes || 30,
          servings: meal.servings || mealData.servings || 4,
          calories: mealData.calories || 0,
          protein: mealData.protein || 0,
          fat: mealData.fat || 0,
          carbohydrates: mealData.carbohydrates || 0,
          slot: meal.slot?.toLowerCase() || 'dinner',
        });
        
        // Update nutrients
        newWeekPlan[dayName].nutrients.calories += mealData.calories || 0;
        newWeekPlan[dayName].nutrients.protein += mealData.protein || 0;
        newWeekPlan[dayName].nutrients.carbohydrates += mealData.carbohydrates || 0;
        newWeekPlan[dayName].nutrients.fat += mealData.fat || 0;
      });
    }
    
    setWeekPlan(newWeekPlan);
    setPlanName(plan.name);
    setSelectedDiet(plan.diet || '');
    setTargetCalories(plan.targetCalories || 2000);
    setExcludeIngredients(plan.excludeIngredients || '');
    setShowSettings(false);
    setSelectedDay('monday');
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const { mealPlan, source } = await api.generateMealPlan({
        timeFrame,
        targetCalories,
        diet: selectedDiet || undefined,
        exclude: excludeIngredients || undefined,
        source: plannerSource,
      });
      
      setLastUsedSource(source);
      
      if (timeFrame === 'week' && mealPlan.week) {
        setWeekPlan(mealPlan.week);
      } else if (timeFrame === 'day') {
        setWeekPlan({ [selectedDay]: mealPlan });
      } else if (mealPlan.meals) {
        // In-house planner returns day plan directly
        setWeekPlan({ [selectedDay]: mealPlan });
      }
      
      setShowSettings(false);
    } catch (err: any) {
      setError(err.message || 'Failed to generate meal plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = async () => {
    if (!weekPlan || !planName.trim() || isSaving || isSavingRef.current) return;
    
    isSavingRef.current = true;
    setIsSaving(true);
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay() + 1); // Monday
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Sunday
      
      const meals: any[] = [];
      Object.entries(weekPlan).forEach(([day, dayPlan]) => {
        const dayIndex = DAYS.indexOf(day);
        const mealDate = new Date(startDate);
        mealDate.setDate(startDate.getDate() + dayIndex);
        
        dayPlan.meals.forEach((meal, idx) => {
          const slots = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
          meals.push({
            date: mealDate.toISOString(),
            slot: slots[idx] || 'SNACK',
            recipeId: meal.id.toString(),
            recipeName: meal.title,
            recipeImage: meal.image || '',
            recipeData: meal,
            servings: meal.servings || 1,
          });
        });
      });
      
      await api.saveMealPlan({
        name: planName,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        targetCalories,
        diet: selectedDiet || '',
        excludeIngredients: excludeIngredients || '',
        meals,
      });
      
      setPlanName('');
      loadSavedPlans();
    } catch (err: any) {
      setError(err.message || 'Failed to save meal plan');
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  };

  // View recipe details
  const viewRecipe = (recipeId: number | string, source?: string) => {
    setSelectedRecipeId(recipeId);
    setRecipeSource(source || lastUsedSource);
    setShowRecipeModal(true);
  };

  // Open swap modal
  const openSwapModal = (meal: any, day: string, index: number) => {
    setSwapMealData({ meal, day, index });
    setShowSwapModal(true);
  };

  // Handle meal swap with animation
  const handleMealSwap = (newMeal: any) => {
    if (!swapMealData || !weekPlan) return;
    
    const { day, index } = swapMealData;
    
    // Set swapping state for animation
    setSwappingMealId(swapMealData.meal.id?.toString());
    
    // After animation delay, update the meal
    setTimeout(() => {
      setWeekPlan(prev => {
        if (!prev) return prev;
        
        const newPlan = { ...prev };
        const dayPlan = { ...newPlan[day] };
        const newMeals = [...dayPlan.meals];
        
        // Swap the meal
        newMeals[index] = {
          ...newMeal,
          id: newMeal.id,
          title: newMeal.title,
          image: newMeal.image,
          readyInMinutes: newMeal.readyInMinutes || 30,
          servings: newMeal.servings || 4,
          calories: newMeal.calories || 0,
          protein: newMeal.protein || 0,
          fat: newMeal.fat || 0,
          carbohydrates: newMeal.carbohydrates || 0,
        };
        
        dayPlan.meals = newMeals;
        newPlan[day] = dayPlan;
        
        return newPlan;
      });
      
      setSwappingMealId(null);
      setSwapMealData(null);
    }, 300);
  };

  // Add ingredients to shopping list
  const addToShoppingList = (ingredients: any[]) => {
    setShoppingList(prev => [...prev, ...ingredients]);
  };

  // Remove from shopping list
  const removeFromShoppingList = (index: number) => {
    setShoppingList(prev => prev.filter((_, i) => i !== index));
  };

  // Clear shopping list
  const clearShoppingList = () => {
    setShoppingList([]);
  };

  // Get nutrition data for chart
  const getNutritionData = () => {
    if (!weekPlan) return { data: [], labels: [] };
    
    const data = DAYS.map(day => {
      const dayPlan = weekPlan[day];
      return dayPlan?.nutrients || { calories: 0, protein: 0, carbohydrates: 0, fat: 0 };
    });
    
    return { data, labels: DAYS.map(d => DAY_LABELS[d]) };
  };

  // Print meal plan
  const printMealPlan = () => {
    window.print();
  };

  // Regenerate single meal
  const regenerateMeal = async (day: string, mealIndex: number) => {
    const slots: ('breakfast' | 'lunch' | 'dinner')[] = ['breakfast', 'lunch', 'dinner'];
    const slot = slots[mealIndex] || 'dinner';
    
    // Get current meal IDs to exclude
    const currentMealIds = weekPlan 
      ? Object.values(weekPlan).flatMap(d => d.meals.map(m => m.id.toString()))
      : [];
    
    setIsGenerating(true);
    try {
      // Try to regenerate just the single meal using in-house planner
      const { meal } = await api.regenerateMeal({
        slot,
        diet: selectedDiet || undefined,
        exclude: excludeIngredients || undefined,
        excludeMealIds: currentMealIds,
      });
      
      if (weekPlan && weekPlan[day] && meal) {
        const updatedMeals = [...weekPlan[day].meals];
        updatedMeals[mealIndex] = meal;
        
        setWeekPlan({
          ...weekPlan,
          [day]: {
            ...weekPlan[day],
            meals: updatedMeals,
          },
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate meal');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Both planners unavailable (should rarely happen since in-house is always available)
  if (!spoonacularEnabled && !inHouseEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800 mb-4">Meal Planner Not Available</h1>
            <p className="text-stone-600 mb-6">
              The meal planning service is currently unavailable. Please try again later.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Meal Planner</h1>
              <p className="text-emerald-100">Plan your meals for the week with AI assistance</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="glass rounded-3xl p-6 shadow-soft">
                <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  Generate Your Meal Plan
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Time Frame */}
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">Plan Duration</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTimeFrame('day')}
                        className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                          timeFrame === 'day'
                            ? 'bg-emerald-500 text-white shadow-glow'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        Day
                      </button>
                      <button
                        onClick={() => setTimeFrame('week')}
                        className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                          timeFrame === 'week'
                            ? 'bg-emerald-500 text-white shadow-glow'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        Week
                      </button>
                    </div>
                  </div>

                  {/* Target Calories */}
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">
                      Daily Calories: {targetCalories}
                    </label>
                    <input
                      type="range"
                      min="1200"
                      max="4000"
                      step="100"
                      value={targetCalories}
                      onChange={(e) => setTargetCalories(parseInt(e.target.value))}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Diet Type */}
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">Diet Type</label>
                    <select
                      value={selectedDiet}
                      onChange={(e) => setSelectedDiet(e.target.value)}
                      className="w-full py-2 px-4 rounded-xl bg-stone-100 border-0 text-stone-700 focus:ring-2 focus:ring-emerald-500"
                    >
                      {dietOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Exclude Ingredients */}
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">Exclude</label>
                    <input
                      type="text"
                      value={excludeIngredients}
                      onChange={(e) => setExcludeIngredients(e.target.value)}
                      placeholder="e.g., shellfish, olives"
                      className="w-full py-2 px-4 rounded-xl bg-stone-100 border-0 text-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Planner Source Selection */}
                <div className="mb-6 p-4 bg-stone-50 rounded-xl">
                  <label className="block text-sm font-medium text-stone-600 mb-3">Meal Plan Engine</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setPlannerSource('auto')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        plannerSource === 'auto'
                          ? 'bg-emerald-500 text-white shadow-glow'
                          : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Auto (Best Available)
                    </button>
                    
                    <button
                      onClick={() => setPlannerSource('inhouse')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        plannerSource === 'inhouse'
                          ? 'bg-emerald-500 text-white shadow-glow'
                          : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      <ChefHat className="w-4 h-4" />
                      In-House {geminiEnabled ? '+ AI' : ''}
                    </button>
                    
                    {spoonacularEnabled && (
                      <button
                        onClick={() => setPlannerSource('spoonacular')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          plannerSource === 'spoonacular'
                            ? 'bg-emerald-500 text-white shadow-glow'
                            : 'bg-white text-stone-600 border border-stone-200 hover:border-emerald-300'
                        }`}
                      >
                        <ArrowRight className="w-4 h-4" />
                        Spoonacular API
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-2">
                    {plannerSource === 'auto' && 'Automatically selects the best available meal planning engine.'}
                    {plannerSource === 'inhouse' && `Uses our recipe database${geminiEnabled ? ' with Gemini AI for smart recommendations' : ' with rule-based matching'}.`}
                    {plannerSource === 'spoonacular' && 'Uses Spoonacular\'s extensive recipe database (500K+ recipes).'}
                  </p>
                </div>

                {/* Source indicator */}
                {lastUsedSource && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Last plan generated using: <strong>{lastUsedSource}</strong>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={generatePlan}
                  disabled={isGenerating}
                  className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Meal Plan
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Plan Section - Show when plan exists */}
        {weekPlan && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                  <Save className="w-5 h-5 text-emerald-600" />
                  Save This Meal Plan
                </h3>
                <p className="text-sm text-stone-500 mt-1">Give your plan a name to save it for later</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                  placeholder="e.g., Week 1 Healthy Plan"
                  className="flex-1 sm:w-64 py-3 px-4 rounded-xl bg-white border border-emerald-200 text-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={savePlan}
                  disabled={isSaving || !planName.trim()}
                  className="flex items-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Plan
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Week View */}
        {weekPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white rounded-2xl border border-stone-100">
              {/* Left: View Mode & Settings */}
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex bg-stone-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'calendar'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                    title="Calendar View"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                    title="List View"
                  >
                    <ChefHat className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('nutrition')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'nutrition'
                        ? 'bg-white text-emerald-600 shadow-sm'
                        : 'text-stone-500 hover:text-stone-700'
                    }`}
                    title="Nutrition View"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl transition-colors ${
                    showSettings 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                <button
                  onClick={generatePlan}
                  disabled={isGenerating}
                  className="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-emerald-100 hover:text-emerald-600 transition-colors disabled:opacity-50"
                  title="Regenerate Plan"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={printMealPlan}
                  className="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                  title="Print"
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Day Tabs - Only show in calendar/list mode */}
            {viewMode !== 'nutrition' && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {DAYS.map((day) => {
                  const dayData = weekPlan[day];
                  const hasData = dayData && dayData.meals && dayData.meals.length > 0;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`relative px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        selectedDay === day
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-glow'
                          : hasData
                          ? 'bg-white text-stone-700 border border-stone-200 hover:border-emerald-300'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      <span className="block text-xs opacity-70 mb-0.5">{DAY_LABELS[day]}</span>
                      <span className="block font-bold capitalize">{day.slice(0, 3)}</span>
                      {hasData && selectedDay !== day && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Nutrition View */}
            {viewMode === 'nutrition' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <NutritionChart 
                  data={getNutritionData().data}
                  labels={getNutritionData().labels}
                  targetCalories={targetCalories}
                />
              </motion.div>
            )}

            {/* Calendar/List View Content */}
            {viewMode !== 'nutrition' && (
              <AnimatePresence mode="wait">
                {weekPlan[selectedDay] && (
                  <motion.div
                    key={selectedDay}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Nutrients Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-medium text-orange-600">Calories</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-700">
                          {Math.round(weekPlan[selectedDay].nutrients.calories)}
                        </div>
                        <div className="text-xs text-orange-500">kcal</div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-emerald-600">Protein</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-700">
                          {Math.round(weekPlan[selectedDay].nutrients.protein)}g
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-amber-600">Carbs</span>
                        </div>
                        <div className="text-2xl font-bold text-amber-700">
                          {Math.round(weekPlan[selectedDay].nutrients.carbohydrates)}g
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-purple-600">Fat</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-700">
                          {Math.round(weekPlan[selectedDay].nutrients.fat)}g
                        </div>
                      </motion.div>
                    </div>

                    {/* Meals Grid */}
                    <div className={viewMode === 'calendar' ? 'grid md:grid-cols-3 gap-4' : 'space-y-4'}>
                      {weekPlan[selectedDay].meals.map((meal, idx) => {
                        const slots = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
                        const slot = slots[idx] || 'SNACK';
                        const SlotIcon = SLOT_ICONS[slot];
                        const colors = SLOT_COLORS[slot];
                        
                        const isSwapping = swappingMealId === meal.id?.toString();
                        
                        return (
                          <motion.div
                            key={meal.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ 
                              opacity: isSwapping ? 0 : 1, 
                              y: isSwapping ? -20 : 0,
                              scale: isSwapping ? 0.95 : 1,
                              rotateY: isSwapping ? 90 : 0,
                            }}
                            transition={{ 
                              delay: isSwapping ? 0 : idx * 0.1,
                              type: 'spring',
                              damping: 20,
                              stiffness: 300,
                            }}
                            className={`bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-soft hover:shadow-elevated transition-all group ${
                              viewMode === 'list' ? 'flex' : ''
                            }`}
                          >
                            {/* Image */}
                            <div className={`relative overflow-hidden ${
                              viewMode === 'calendar' ? 'h-40' : 'w-40 h-40 flex-shrink-0'
                            }`}>
                              <img
                                src={meal.image}
                                alt={meal.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                              
                              {/* Slot Badge */}
                              <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                                <SlotIcon className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase">{slot}</span>
                              </div>
                              
                              {/* Action buttons on hover */}
                              <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => viewRecipe(meal.id)}
                                  className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-stone-600 hover:text-emerald-600 transition-colors shadow-lg"
                                  title="View Recipe"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <motion.button
                                  onClick={() => openSwapModal(meal, selectedDay, idx)}
                                  whileHover={{ scale: 1.1, rotate: 180 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 rounded-full bg-white/90 backdrop-blur-sm text-stone-600 hover:text-amber-600 transition-colors shadow-lg"
                                  title="Swap Meal"
                                >
                                  <Shuffle className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-4 flex-1">
                              <h3 
                                onClick={() => viewRecipe(meal.id)}
                                className="font-bold text-stone-800 group-hover:text-emerald-600 transition-colors cursor-pointer line-clamp-2 mb-2"
                              >
                                {meal.title}
                              </h3>
                              
                              <div className="flex items-center gap-3 text-sm text-stone-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{meal.readyInMinutes}m</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{meal.servings}</span>
                                </div>
                              </div>
                              
                              {viewMode === 'list' && (
                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={() => viewRecipe(meal.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    View Recipe
                                  </button>
                                  <button
                                    onClick={() => regenerateMeal(selectedDay, idx)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                                  >
                                    <Shuffle className="w-3.5 h-3.5" />
                                    Swap
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        )}

        {/* Saved Plans */}
        {isAuthenticated && savedPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h2 className="text-xl font-bold text-stone-800 mb-4">Saved Meal Plans</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => loadSavedPlan(plan)}
                  className="glass rounded-2xl p-4 shadow-soft hover:shadow-elevated transition-all cursor-pointer hover:border-emerald-300 border-2 border-transparent"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-stone-800">{plan.name}</h3>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await api.deleteMealPlan(plan.id);
                        loadSavedPlans();
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {plan.diet && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      {plan.diet}
                    </span>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-stone-400">
                      {plan.meals?.length || 0} meals planned
                    </span>
                    <span className="text-xs text-emerald-600 font-medium">
                      Click to view →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!weekPlan && !showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">No Meal Plan Generated</h2>
            <p className="text-stone-500 mb-6">Generate a new meal plan to get started</p>
            <button
              onClick={() => setShowSettings(true)}
              className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
            >
              Create Meal Plan
            </button>
          </motion.div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipeId={selectedRecipeId}
        isOpen={showRecipeModal}
        onClose={() => setShowRecipeModal(false)}
        onAddToShoppingList={addToShoppingList}
        source={recipeSource}
      />

      {/* Shopping List */}
      <ShoppingList
        ingredients={shoppingList}
        onRemove={removeFromShoppingList}
        onClear={clearShoppingList}
        isOpen={showShoppingList}
        onToggle={() => setShowShoppingList(!showShoppingList)}
      />

      {/* Swap Meal Modal */}
      <SwapMealModal
        isOpen={showSwapModal}
        onClose={() => {
          setShowSwapModal(false);
          setSwapMealData(null);
        }}
        currentMeal={swapMealData?.meal}
        slot={swapMealData?.index !== undefined ? ['breakfast', 'lunch', 'dinner'][swapMealData.index] || 'dinner' : 'dinner'}
        diet={selectedDiet}
        onSwap={handleMealSwap}
      />
    </div>
  );
};
