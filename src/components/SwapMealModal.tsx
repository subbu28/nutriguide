import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Filter,
  Loader2,
  Clock,
  Flame,
  ChefHat,
  Sparkles,
  ArrowLeftRight,
  Check,
} from 'lucide-react';
import { api } from '../lib/api.js';

interface SwapMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMeal: any;
  slot: string;
  diet?: string;
  onSwap: (newMeal: any) => void;
}

const DIET_OPTIONS = [
  { value: '', label: 'All Diets' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten-free', label: 'Gluten Free' },
  { value: 'low-carb', label: 'Low Carb' },
];

const SLOT_OPTIONS = [
  { value: '', label: 'Any Meal' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
];

export function SwapMealModal({
  isOpen,
  onClose,
  currentMeal,
  slot,
  diet: initialDiet,
  onSwap,
}: SwapMealModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState(initialDiet || '');
  const [selectedSlot, setSelectedSlot] = useState(slot || '');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      // Get multiple suggestions for the slot
      const suggestions: any[] = [];
      for (let i = 0; i < 6; i++) {
        const { meal } = await api.regenerateMeal({
          slot: selectedSlot || slot,
          diet: selectedDiet,
          excludeMealIds: [currentMeal?.id, ...suggestions.map(s => s.id)].filter(Boolean),
        });
        if (meal) suggestions.push(meal);
      }
      setResults(suggestions);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // Search with filters
      const suggestions: any[] = [];
      for (let i = 0; i < 6; i++) {
        const { meal } = await api.regenerateMeal({
          slot: selectedSlot || slot,
          diet: selectedDiet,
          exclude: searchQuery,
          excludeMealIds: [currentMeal?.id, ...suggestions.map(s => s.id)].filter(Boolean),
        });
        if (meal) suggestions.push(meal);
      }
      setResults(suggestions);
    } catch (err) {
      console.error('Failed to search:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!selectedMeal) return;
    
    setIsSwapping(true);
    
    // Add a small delay for the animation effect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSwap(selectedMeal);
    setIsSwapping(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Swap Meal</h2>
                  <p className="text-emerald-100 text-sm">
                    Replace "{currentMeal?.title}" with a new recipe
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search recipes..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-colors ${
                  showFilters ? 'bg-white text-emerald-600' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <button
                onClick={handleSearch}
                className="px-6 py-3 rounded-xl bg-white text-emerald-600 font-semibold hover:bg-emerald-50 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
                    <div className="flex-1">
                      <label className="block text-emerald-100 text-sm mb-1">Diet Type</label>
                      <select
                        value={selectedDiet}
                        onChange={(e) => setSelectedDiet(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        {DIET_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} className="text-stone-800">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-emerald-100 text-sm mb-1">Meal Type</label>
                      <select
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        {SLOT_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} className="text-stone-800">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Current Meal */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-stone-500 mb-2">Current Meal</h3>
              <motion.div
                animate={isSwapping ? { x: -100, opacity: 0 } : { x: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border-2 border-stone-200"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-200 flex-shrink-0">
                  {currentMeal?.image ? (
                    <img src={currentMeal.image} alt={currentMeal.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-8 h-8 text-stone-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-stone-800">{currentMeal?.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-stone-500">
                    {currentMeal?.readyInMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {currentMeal.readyInMinutes} min
                      </span>
                    )}
                    {currentMeal?.calories && (
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {currentMeal.calories} kcal
                      </span>
                    )}
                  </div>
                </div>
                <ArrowLeftRight className="w-6 h-6 text-emerald-500" />
              </motion.div>
            </div>

            {/* Results */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-stone-500">
                  {isLoading ? 'Finding alternatives...' : 'Select a replacement'}
                </h3>
                {!isLoading && (
                  <button
                    onClick={loadSuggestions}
                    className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get new suggestions
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
                  <p className="text-stone-500">Finding delicious alternatives...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {results.map((meal, idx) => (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedMeal(meal)}
                      className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${
                        selectedMeal?.id === meal.id
                          ? 'border-emerald-500 shadow-lg shadow-emerald-100 scale-[1.02]'
                          : 'border-transparent hover:border-emerald-200 hover:shadow-md'
                      }`}
                    >
                      {/* Selection Indicator */}
                      <AnimatePresence>
                        {selectedMeal?.id === meal.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute top-3 right-3 z-10 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="aspect-[4/3] bg-stone-200">
                        {meal.image ? (
                          <img src={meal.image} alt={meal.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="w-10 h-10 text-stone-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-white">
                        <h4 className="font-medium text-stone-800 truncate">{meal.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                          {meal.readyInMinutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {meal.readyInMinutes}m
                            </span>
                          )}
                          {meal.calories && (
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              {meal.calories} kcal
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {!isLoading && results.length === 0 && (
                <div className="text-center py-12">
                  <ChefHat className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">No alternatives found. Try different filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-stone-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSwap}
                disabled={!selectedMeal || isSwapping}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSwapping ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-5 h-5" />
                    Swap Meal
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
