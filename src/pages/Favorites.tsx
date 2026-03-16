import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMealsStore } from '../stores/mealsStore';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Trash2, Coffee, Sun, Moon, GlassWater, ArrowLeft } from 'lucide-react';
import { PageLoader, CardSkeleton } from '../components/LoadingStates';
import { EmptyState } from '../components/EmptyState';
import type { MealCategory } from '../types';

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
                  className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden group"
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
    </div>
  );
}
