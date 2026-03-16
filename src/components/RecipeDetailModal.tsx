import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Clock, Users, Flame, Dumbbell, ChefHat, 
  ExternalLink, Heart, ShoppingCart, Check, Loader2,
  Wheat, Droplets
} from 'lucide-react';
import { api } from '../lib/api';

interface RecipeDetailModalProps {
  recipeId: number | string | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToShoppingList?: (ingredients: any[]) => void;
  source?: string;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipeId,
  isOpen,
  onClose,
  onAddToShoppingList,
  source,
}) => {
  const [recipe, setRecipe] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedToList, setAddedToList] = useState(false);

  useEffect(() => {
    if (isOpen && recipeId) {
      loadRecipe();
    }
    return () => {
      setRecipe(null);
      setAddedToList(false);
    };
  }, [isOpen, recipeId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const loadRecipe = async () => {
    if (!recipeId) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const { recipe: data } = await api.getRecipeDetails(recipeId, source);
      setRecipe(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToShoppingList = () => {
    if (recipe?.extendedIngredients && onAddToShoppingList) {
      onAddToShoppingList(recipe.extendedIngredients);
      setAddedToList(true);
      setTimeout(() => setAddedToList(false), 2000);
    }
  };

  const getNutrient = (name: string) => {
    return recipe?.nutrition?.nutrients?.find((n: any) => 
      n.name.toLowerCase() === name.toLowerCase()
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-stone-500 hover:text-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={loadRecipe}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : recipe ? (
              <div className="overflow-y-auto max-h-[90vh]">
                {/* Hero Image */}
                <div className="relative h-64 w-full">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Title on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{recipe.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      {recipe.diets?.map((diet: string) => (
                        <span
                          key={diet}
                          className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white"
                        >
                          {diet}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-orange-50 rounded-xl">
                      <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-orange-600">{recipe.readyInMinutes}</div>
                      <div className="text-xs text-orange-500">minutes</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                      <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-blue-600">{recipe.servings}</div>
                      <div className="text-xs text-blue-500">servings</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-xl">
                      <Flame className="w-5 h-5 text-red-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-red-600">
                        {Math.round(getNutrient('calories')?.amount || 0)}
                      </div>
                      <div className="text-xs text-red-500">calories</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-xl">
                      <Dumbbell className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-emerald-600">
                        {Math.round(getNutrient('protein')?.amount || 0)}g
                      </div>
                      <div className="text-xs text-emerald-500">protein</div>
                    </div>
                  </div>

                  {/* Nutrition Details */}
                  {recipe.nutrition?.nutrients && (
                    <div className="mb-6 p-4 bg-stone-50 rounded-xl">
                      <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">
                        Nutrition per serving
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Carbohydrates', 'Fat', 'Fiber', 'Sugar'].map((nutrient) => {
                          const n = getNutrient(nutrient);
                          return n ? (
                            <div key={nutrient} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span className="text-sm text-stone-600">
                                {nutrient}: <strong>{Math.round(n.amount)}{n.unit}</strong>
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {recipe.summary && (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">
                        About this recipe
                      </h3>
                      <div 
                        className="text-stone-600 text-sm leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: recipe.summary }}
                      />
                    </div>
                  )}

                  {/* Ingredients */}
                  {recipe.extendedIngredients && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">
                          Ingredients ({recipe.extendedIngredients.length})
                        </h3>
                        {onAddToShoppingList && (
                          <button
                            onClick={handleAddToShoppingList}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              addedToList
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-stone-100 text-stone-600 hover:bg-emerald-100 hover:text-emerald-700'
                            }`}
                          >
                            {addedToList ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                            {addedToList ? 'Added!' : 'Add to list'}
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        {recipe.extendedIngredients.map((ing: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg"
                          >
                            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                            <span className="text-sm text-stone-700">{ing.original}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  {recipe.instructions && (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">
                        Instructions
                      </h3>
                      <div 
                        className="text-stone-600 text-sm leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: recipe.instructions }}
                      />
                    </div>
                  )}

                  {/* Source Link */}
                  {recipe.sourceUrl && (
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View original recipe
                    </a>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
