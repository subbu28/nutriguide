import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMealsStore } from '../stores/mealsStore';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Trash2, Coffee, Sun, Moon, GlassWater, ArrowLeft, X, Clock, Flame, Dumbbell } from 'lucide-react';
import { PageLoader, CardSkeleton } from '../components/LoadingStates';
import { EmptyState } from '../components/EmptyState';
import type { MealCategory, Meal } from '../types';

const categoryIcons: Record<string, any> = {
  Breakfast: Coffee,
  Lunch: Sun,
  Dinner: Moon,
  Juices: GlassWater,
};

export function Favorites() {
  const { favorites, fetchFavorites, removeFromFavorites } = useMealsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<MealCategory | 'all'>('all');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  useEffect(() => {
    const load = async () => {
      await fetchFavorites();
      setIsLoading(false);
    };
    load();
  }, []);

  const filteredFavorites = filter === 'all' 
    ? favorites 
    : favorites.filter(f => f.category === filter);

  const handleRemove = async (mealId: string) => {
    try {
      await removeFromFavorites(mealId);
    } catch (error) {
      console.error('Failed to remove:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-stone-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">My Favorites</h1>
              <p className="text-sm text-stone-500">Loading your favorites...</p>
            </div>
          </div>
        </div>
        <PageLoader message="Loading favorites..." size="md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CardSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">My Favorites</h1>
            <p className="text-sm text-stone-500">{favorites.length} saved meals</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-emerald-600 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All ({favorites.length})
        </button>
        {(['Breakfast', 'Lunch', 'Dinner', 'Juices'] as MealCategory[]).map((cat) => {
          const count = favorites.filter(f => f.category === cat).length;
          const Icon = categoryIcons[cat];
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Favorites Grid */}
      <AnimatePresence mode="popLayout">
        {filteredFavorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <EmptyState
              preset="noFavorites"
              primaryAction={{
                label: 'Explore Meals',
                href: '/',
                variant: 'primary',
              }}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFavorites.map((favorite) => {
              const meal = favorite.mealData;
              const Icon = categoryIcons[favorite.category];
              
              return (
                <motion.div
                  key={favorite.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedMeal(meal)}
                  className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
                >
                  {meal.imageUrl ? (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <button
                        onClick={() => handleRemove(favorite.mealId)}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative h-40 bg-stone-100 flex items-center justify-center">
                      <Icon className="w-12 h-12 text-stone-300" />
                      <button
                        onClick={() => handleRemove(favorite.mealId)}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                        favorite.dietType === 'Vegetarian' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {favorite.dietType}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-stone-100 text-stone-600">
                        {favorite.category}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-stone-900 mb-1 line-clamp-1">
                      {meal.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mb-3">
                      {meal.description}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span className="font-medium text-orange-600">{meal.calories} kcal</span>
                      <span>•</span>
                      <span className="font-medium text-emerald-600">{meal.protein} protein</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Recipe Detail Popup */}
      <AnimatePresence>
        {selectedMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMeal(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            >
              {/* Header Image */}
              <div className="relative h-64">
                {selectedMeal.imageUrl ? (
                  <img
                    src={selectedMeal.imageUrl}
                    alt={selectedMeal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Heart className="w-16 h-16 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button
                  onClick={() => setSelectedMeal(null)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5 text-stone-700" />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedMeal.name}</h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                      {favorites.find(f => f.mealData.id === selectedMeal.id)?.category}
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                      {favorites.find(f => f.mealData.id === selectedMeal.id)?.dietType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Nutrition Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-orange-50 rounded-xl text-center">
                    <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-orange-600">{selectedMeal.calories}</p>
                    <p className="text-xs text-orange-600/70">Calories</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl text-center">
                    <Dumbbell className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-emerald-600">{selectedMeal.protein}</p>
                    <p className="text-xs text-emerald-600/70">Protein</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-blue-600">{selectedMeal.prepTime || '15'}</p>
                    <p className="text-xs text-blue-600/70">Minutes</p>
                  </div>
                </div>

                {/* Description */}
                {selectedMeal.description && (
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-2">Description</h3>
                    <p className="text-stone-600 leading-relaxed">{selectedMeal.description}</p>
                  </div>
                )}

                {/* Ingredients */}
                {selectedMeal.ingredients && selectedMeal.ingredients.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-3">Ingredients</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedMeal.ingredients.map((ing: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-sm text-stone-700">
                            {typeof ing === 'string' ? ing : `${ing.amount || ''} ${ing.unit || ''} ${ing.name || ing.ingredient || ''}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {selectedMeal.instructions && (
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-3">Instructions</h3>
                    <div className="space-y-3">
                      {(Array.isArray(selectedMeal.instructions) 
                        ? selectedMeal.instructions 
                        : String(selectedMeal.instructions).split('\n').filter(Boolean)
                      ).map((step: string, idx: number) => (
                        <div key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <p className="text-stone-600 text-sm leading-relaxed">{String(step).replace(/^\d+\.\s*/, '')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={() => {
                    const fav = favorites.find(f => f.mealData.id === selectedMeal.id);
                    if (fav) {
                      handleRemove(fav.mealId);
                      setSelectedMeal(null);
                    }
                  }}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove from Favorites
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
