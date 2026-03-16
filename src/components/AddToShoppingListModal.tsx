import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Users,
  Utensils,
  Merge,
  Replace,
  Search,
} from 'lucide-react';
import { useShoppingListStore } from '../stores/shoppingListStore';
import { SHOPPING_CATEGORIES, guessCategory, ShoppingItem, ShoppingCategory } from '../types/shopping';

interface MealOption {
  id: string;
  name: string;
  servings: number;
  image?: string;
  ingredients: any[];
  selected: boolean;
}

interface AddToShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  meals?: MealOption[];
  mealPlanId?: string;
  source?: 'mealPlan' | 'favorites' | 'recipe';
  title?: string;
}

export const AddToShoppingListModal: React.FC<AddToShoppingListModalProps> = ({
  isOpen,
  onClose,
  meals: initialMeals = [],
  mealPlanId,
  source = 'recipe',
  title = 'Add to Shopping List',
}) => {
  const [meals, setMeals] = useState<MealOption[]>(initialMeals);
  const [servings, setServings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'preview'>('select');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [previewItems, setPreviewItems] = useState<ShoppingItem[]>([]);

  const { items: existingItems, mergeItems, addIngredients } = useShoppingListStore();

  // Initialize servings from meals
  useEffect(() => {
    const initialServings: Record<string, number> = {};
    initialMeals.forEach((meal) => {
      initialServings[meal.id] = meal.servings || 4;
    });
    setServings(initialServings);
    setMeals(initialMeals.map((m) => ({ ...m, selected: true })));
  }, [initialMeals]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setReplaceExisting(false);
      setError(null);
      setPreviewItems([]);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleMealSelection = (mealId: string) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, selected: !m.selected } : m))
    );
  };

  const updateServings = (mealId: string, delta: number) => {
    setServings((prev) => ({
      ...prev,
      [mealId]: Math.max(1, (prev[mealId] || 4) + delta),
    }));
  };

  const toggleExpanded = (mealId: string) => {
    const newExpanded = new Set(expandedMeals);
    if (newExpanded.has(mealId)) {
      newExpanded.delete(mealId);
    } else {
      newExpanded.add(mealId);
    }
    setExpandedMeals(newExpanded);
  };

  const selectedMeals = meals.filter((m) => m.selected);
  const totalItems = useMemo(() => {
    return selectedMeals.reduce((acc, meal) => acc + meal.ingredients.length, 0);
  }, [selectedMeals]);

  const generatePreviewItems = (): ShoppingItem[] => {
    const items: ShoppingItem[] = [];
    const itemMap = new Map<string, ShoppingItem>();

    selectedMeals.forEach((meal) => {
      const mealServings = servings[meal.id] || 4;
      const baseServings = meal.servings || 4;
      const multiplier = mealServings / baseServings;

      meal.ingredients.forEach((ing) => {
        const name = (ing.name || ing.originalName || 'Unknown').toLowerCase().trim();
        const category = guessCategory(name);
        
        // Parse amount
        let amount = ing.amount || 1;
        if (typeof amount === 'string') {
          amount = parseFloat(amount) || 1;
        }
        amount = Math.round(amount * multiplier * 100) / 100;
        
        const unit = ing.unit || ing.measures?.metric?.unitShort || '';
        const quantity = unit ? `${amount} ${unit}` : `${amount}`;

        // Check if similar item already exists
        const existingKey = `${name}_${category}`;
        if (itemMap.has(existingKey)) {
          const existing = itemMap.get(existingKey)!;
          existing.quantity = `${existing.quantity} + ${quantity}`;
        } else {
          const newItem: ShoppingItem = {
            id: `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            quantity,
            category,
            checked: false,
            mealId: meal.id,
            mealName: meal.name,
          };
          itemMap.set(existingKey, newItem);
          items.push(newItem);
        }
      });
    });

    return items;
  };

  const handlePreview = () => {
    if (selectedMeals.length === 0) {
      setError('Please select at least one meal');
      return;
    }
    const items = generatePreviewItems();
    setPreviewItems(items);
    setStep('preview');
    setError(null);
  };

  const handleAddToList = () => {
    if (previewItems.length === 0) return;

    if (replaceExisting) {
      mergeItems(previewItems, true);
    } else {
      // Add items one by one to handle merging
      previewItems.forEach((item) => {
        useShoppingListStore.getState().addItem({
          name: item.name,
          quantity: item.quantity,
          category: item.category,
          mealId: item.mealId,
          mealName: item.mealName,
        });
      });
    }

    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const filteredMeals = meals.filter((meal) =>
    meal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group preview items by category
  const groupedPreview = useMemo(() => {
    const grouped: Record<string, ShoppingItem[]> = {};
    SHOPPING_CATEGORIES.forEach((cat) => {
      grouped[cat.id] = [];
    });
    previewItems.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [previewItems]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-800">{title}</h2>
                  <p className="text-sm text-stone-500">
                    {step === 'select' 
                      ? `${selectedMeals.length} of ${meals.length} meals selected`
                      : `${previewItems.length} items to add`
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mt-6">
              <div className={`flex items-center gap-2 ${step === 'select' ? 'text-emerald-600' : 'text-stone-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === 'select' ? 'bg-emerald-100' : 'bg-emerald-500 text-white'
                }`}>
                  {step === 'select' ? '1' : <Check className="w-4 h-4" />}
                </div>
                <span className="text-sm font-medium">Select Meals</span>
              </div>
              <div className="flex-1 h-0.5 bg-stone-200">
                <div className={`h-full bg-emerald-500 transition-all ${step === 'preview' ? 'w-full' : 'w-0'}`} />
              </div>
              <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-emerald-600' : 'text-stone-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === 'preview' ? 'bg-emerald-100' : 'bg-stone-100'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Preview</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Content */}
          <div className="overflow-y-auto max-h-[50vh] p-6">
            {step === 'select' ? (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search meals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border-0 text-stone-700 placeholder-stone-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Select All / None */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setMeals(meals.map((m) => ({ ...m, selected: true })))}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setMeals(meals.map((m) => ({ ...m, selected: false })))}
                    className="text-sm text-stone-500 hover:text-stone-600"
                  >
                    Deselect All
                  </button>
                </div>

                {/* Meals List */}
                <div className="space-y-3">
                  {filteredMeals.map((meal) => (
                    <motion.div
                      key={meal.id}
                      layout
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        meal.selected
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-stone-100 bg-white hover:border-stone-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleMealSelection(meal.id)}
                          className={`mt-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            meal.selected
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-stone-300 hover:border-emerald-500'
                          }`}
                        >
                          {meal.selected && <Check className="w-3 h-3" />}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            {meal.image && (
                              <img
                                src={meal.image}
                                alt={meal.name}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-bold truncate ${meal.selected ? 'text-stone-800' : 'text-stone-500'}`}>
                                {meal.name}
                              </h3>
                              <p className="text-xs text-stone-500">
                                {meal.ingredients.length} ingredients
                              </p>
                            </div>
                          </div>

                          {/* Servings Control */}
                          {meal.selected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-3 flex items-center gap-4"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-stone-600">Servings:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateServings(meal.id, -1)}
                                    className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-8 text-center font-medium text-stone-700">
                                    {servings[meal.id] || 4}
                                  </span>
                                  <button
                                    onClick={() => updateServings(meal.id, 1)}
                                    className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              <button
                                onClick={() => toggleExpanded(meal.id)}
                                className="flex items-center gap-1 text-sm text-stone-500 hover:text-emerald-600"
                              >
                                {expandedMeals.has(meal.id) ? (
                                  <>
                                    <ChevronUp className="w-4 h-4" />
                                    Hide ingredients
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4" />
                                    Show ingredients
                                  </>
                                )}
                              </button>
                            </motion.div>
                          )}

                          {/* Ingredients Preview */}
                          <AnimatePresence>
                            {expandedMeals.has(meal.id) && meal.selected && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 overflow-hidden"
                              >
                                <div className="p-3 bg-white rounded-xl border border-stone-100">
                                  <div className="flex flex-wrap gap-2">
                                    {meal.ingredients.slice(0, 8).map((ing, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded-full"
                                      >
                                        {ing.name || ing.originalName}
                                      </span>
                                    ))}
                                    {meal.ingredients.length > 8 && (
                                      <span className="text-xs px-2 py-1 bg-stone-100 text-stone-400 rounded-full">
                                        +{meal.ingredients.length - 8} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredMeals.length === 0 && (
                  <div className="text-center py-8">
                    <Utensils className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                    <p className="text-stone-500">No meals found</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Merge/Replace Toggle */}
                {existingItems.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-sm text-amber-800 mb-3">
                      You have {existingItems.length} items in your shopping list
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setReplaceExisting(false)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          !replaceExisting
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-stone-600 border border-stone-200'
                        }`}
                      >
                        <Merge className="w-4 h-4" />
                        Merge
                      </button>
                      <button
                        onClick={() => setReplaceExisting(true)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          replaceExisting
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-stone-600 border border-stone-200'
                        }`}
                      >
                        <Replace className="w-4 h-4" />
                        Replace
                      </button>
                    </div>
                  </div>
                )}

                {/* Preview by Category */}
                <div className="space-y-3">
                  {Object.entries(groupedPreview)
                    .filter(([_, items]) => items.length > 0)
                    .map(([categoryId, items]) => {
                      const category = SHOPPING_CATEGORIES.find((c) => c.id === categoryId);
                      if (!category) return null;

                      return (
                        <div
                          key={categoryId}
                          className={`p-3 rounded-xl ${category.bgColor} ${category.borderColor} border`}
                        >
                          <h4 className={`text-sm font-bold ${category.color} mb-2`}>
                            {category.label} ({items.length})
                          </h4>
                          <div className="space-y-1">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-stone-700">{item.name}</span>
                                <span className="text-stone-500">{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {previewItems.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                    <p className="text-stone-500">No items to add</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-stone-100 bg-stone-50">
            {step === 'select' ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 text-stone-600 font-medium hover:text-stone-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePreview}
                  disabled={selectedMeals.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Preview ({totalItems} items)
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('select')}
                  className="flex items-center gap-2 px-6 py-2.5 text-stone-600 font-medium hover:text-stone-800 transition-colors"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                  Back
                </button>
                <button
                  onClick={handleAddToList}
                  disabled={previewItems.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {replaceExisting ? 'Replace & Add' : 'Add to List'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
