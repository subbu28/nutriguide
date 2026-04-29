import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSearchStore } from '../stores/searchStore';
import { useMealsStore } from '../stores/mealsStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search as SearchIcon, 
  Filter, 
  X, 
  Clock, 
  Flame, 
  Heart,
  ChefHat,
  Loader2,
  SlidersHorizontal
} from 'lucide-react';
import { RecipePopup } from '../components/RecipePopup';
import type { MealItem } from '../types';

export function Search() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const { 
    query, 
    setQuery, 
    results, 
    loading, 
    search, 
    filters, 
    setFilter,
    clearFilters,
    totalResults,
    recentSearches,
    loadRecentSearches,
    removeRecentSearch
  } = useSearchStore();
  
  const { addToFavorites, removeFromFavorites, favorites } = useMealsStore();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [localQuery, setLocalQuery] = useState(initialQuery);

  useEffect(() => {
    loadRecentSearches();
    if (initialQuery) {
      setQuery(initialQuery);
      search(true);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setQuery(localQuery);
      search(true);
    }
  };

  const handleRecentSearch = (recentQuery: string) => {
    setLocalQuery(recentQuery);
    setQuery(recentQuery);
    search(true);
  };

  const isFavorite = (mealId: string) => {
    return favorites.some(f => f.mealId === mealId);
  };

  const toggleFavorite = async (meal: MealItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFavorite(meal.id)) {
        await removeFromFavorites(meal.id);
      } else {
        await addToFavorites(meal, 'Lunch', 'Vegetarian');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const dietTypes = ['All', 'Vegetarian', 'Non-Vegetarian', 'Vegan'];
  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Juices', 'Smoothies'];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search recipes, ingredients, cuisines..."
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-base focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border transition-colors flex items-center gap-2 ${
              showFilters 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 mt-6 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Diet Type */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Diet Type</label>
                  <select
                    value={filters.dietType}
                    onChange={(e) => setFilter('dietType', e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  >
                    {dietTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilter('category', e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Calorie Range */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Max Calories</label>
                  <select
                    value={filters.calorieRange?.max || ''}
                    onChange={(e) => setFilter('calorieRange', e.target.value ? { min: 0, max: parseInt(e.target.value) } : null)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  >
                    <option value="">Any</option>
                    <option value="200">Under 200</option>
                    <option value="400">Under 400</option>
                    <option value="600">Under 600</option>
                    <option value="800">Under 800</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-900">Recent Searches</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.slice(0, 6).map((recent) => (
              <button
                key={recent.id}
                onClick={() => handleRecentSearch(recent.query)}
                className="group flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-full text-sm text-stone-700 transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {recent.query}
                <X 
                  className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentSearch(recent.id);
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        {query && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900">
              {loading ? 'Searching...' : `${totalResults} results for "${query}"`}
            </h2>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((meal) => (
              <motion.div
                key={meal.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedRecipeId(meal.id)}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
              >
                <div className="relative h-40">
                  {meal.imageUrl ? (
                    <img
                      src={meal.imageUrl}
                      alt={meal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <ChefHat className="w-12 h-12 text-emerald-300" />
                    </div>
                  )}
                  <button
                    onClick={(e) => toggleFavorite(meal, e)}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
                      isFavorite(meal.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-stone-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(meal.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-stone-900 mb-1 line-clamp-1">{meal.name}</h3>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-3">{meal.description}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-orange-600">
                      <Flame className="w-4 h-4" />
                      {meal.calories} kcal
                    </span>
                    <span className="text-emerald-600 font-medium">{meal.protein}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20">
            <SearchIcon className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2">No results found</h3>
            <p className="text-stone-500 mb-4">Try different keywords or filters</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <SearchIcon className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2">Search for recipes</h3>
            <p className="text-stone-500">Find meals by name, ingredients, or cuisine</p>
          </div>
        )}
      </div>

      {/* Recipe Popup */}
      {selectedRecipeId && (
        <RecipePopup
          recipeId={selectedRecipeId}
          onClose={() => setSelectedRecipeId(null)}
        />
      )}
    </div>
  );
}
