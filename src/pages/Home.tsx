import { useState, useEffect } from 'react';
import { useMealsStore, CUISINES, type Cuisine } from '../stores/mealsStore';
import { useAuthStore } from '../stores/authStore';
import { MealCard } from '../components/MealCard';
import { PageLoader, CardSkeleton } from '../components/LoadingStates';
import { EmptyState } from '../components/EmptyState';
import { Search, X, Coffee, Sun, Moon, GlassWater, Leaf, Beef, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { MealCategory, DietType } from '../types';

const categories: { id: MealCategory; icon: any; label: string }[] = [
  { id: 'Breakfast', icon: Coffee, label: 'Breakfast' },
  { id: 'Lunch', icon: Sun, label: 'Lunch' },
  { id: 'Dinner', icon: Moon, label: 'Dinner' },
  { id: 'Juices', icon: GlassWater, label: 'Juices' },
];

const dietTypes: { id: DietType; icon: any; label: string }[] = [
  { id: 'Vegetarian', icon: Leaf, label: 'Vegetarian' },
  { id: 'Non-Vegetarian', icon: Beef, label: 'Non-Veg' },
];

const cuisineFlags: Record<string, string> = {
  'All': '🌍',
  'American': '🇺🇸',
  'British': '🇬🇧',
  'Canadian': '🇨🇦',
  'Chinese': '🇨🇳',
  'Croatian': '🇭🇷',
  'Dutch': '🇳🇱',
  'Egyptian': '🇪🇬',
  'Filipino': '🇵🇭',
  'French': '🇫🇷',
  'Greek': '🇬🇷',
  'Indian': '🇮🇳',
  'Irish': '🇮🇪',
  'Italian': '🇮🇹',
  'Jamaican': '🇯🇲',
  'Japanese': '🇯🇵',
  'Kenyan': '🇰🇪',
  'Malaysian': '🇲🇾',
  'Mexican': '🇲🇽',
  'Moroccan': '🇲🇦',
  'Polish': '🇵🇱',
  'Portuguese': '🇵🇹',
  'Russian': '🇷🇺',
  'Spanish': '🇪🇸',
  'Thai': '🇹🇭',
  'Tunisian': '🇹🇳',
  'Turkish': '🇹🇷',
  'Vietnamese': '🇻🇳',
};

export function Home() {
  const { 
    meals, 
    isLoading, 
    category, 
    dietType,
    cuisine,
    searchQuery,
    setCategory, 
    setDietType,
    setCuisine,
    setSearchQuery,
    fetchMeals,
    fetchFavorites 
  } = useMealsStore();
  
  const { isAuthenticated } = useAuthStore();
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);

  useEffect(() => {
    fetchMeals();
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, []);

  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meal.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Hero Section with Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
          <span className="text-gradient">Discover</span>{' '}
          <span className="text-stone-800">Delicious</span>{' '}
          <span className="text-gradient-warm">Recipes</span>
        </h1>
        <p className="text-stone-500 text-lg max-w-xl mx-auto">
          Explore healthy meals from around the world, crafted with love 🍳
        </p>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex gap-2 p-2 glass rounded-2xl shadow-soft">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                category === cat.id
                  ? 'text-white shadow-glow'
                  : 'text-stone-500 hover:text-emerald-600 hover:bg-white/50'
              }`}
            >
              {category === cat.id && (
                <motion.div
                  layoutId="active-cat"
                  className="absolute inset-0 gradient-primary rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cuisine Selector */}
      <div className="flex justify-center">
        <div className="relative">
          <button
            onClick={() => setShowCuisineDropdown(!showCuisineDropdown)}
            className="flex items-center gap-3 px-5 py-3 glass rounded-2xl text-sm font-semibold hover:shadow-glow transition-all duration-300 group"
          >
            <span className="text-2xl animate-float">{cuisineFlags[cuisine]}</span>
            <span className="text-stone-700 group-hover:text-emerald-600 transition-colors">
              {cuisine === 'All' ? 'All Cuisines' : `${cuisine} Cuisine`}
            </span>
            <ChevronDown className={`w-4 h-4 text-stone-400 group-hover:text-emerald-500 transition-all duration-300 ${showCuisineDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showCuisineDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-96 max-h-96 overflow-y-auto glass rounded-2xl shadow-elevated z-50 p-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  {CUISINES.map((c) => (
                    <motion.button
                      key={c}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCuisine(c);
                        setShowCuisineDropdown(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all duration-200 ${
                        cuisine === c
                          ? 'gradient-primary text-white shadow-glow font-bold'
                          : 'hover:bg-emerald-50 text-stone-700 hover:text-emerald-700'
                      }`}
                    >
                      <span className="text-xl">{cuisineFlags[c]}</span>
                      <span>{c}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Diet Type & Search Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 max-w-lg relative group w-full">
          <div className="absolute inset-0 gradient-aurora opacity-20 blur-xl rounded-2xl group-focus-within:opacity-40 transition-opacity duration-500" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search meals, ingredients, or cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 glass rounded-2xl text-sm font-medium placeholder:text-stone-400 input-focus border-2 border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-50 rounded-full transition-all duration-200 group/clear"
              >
                <X className="w-4 h-4 text-stone-400 group-hover/clear:text-red-500" />
              </button>
            )}
          </div>
        </div>

        <div className="flex glass p-1.5 rounded-2xl shadow-soft">
          {dietTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setDietType(type.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                dietType === type.id
                  ? 'text-white'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {dietType === type.id && (
                <motion.div
                  layoutId="active-diet"
                  className={`absolute inset-0 rounded-xl ${type.id === 'Vegetarian' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <type.icon className="w-4 h-4" />
                {type.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PageLoader 
                message="Curating recipes..."
                subMessage={`${cuisine !== 'All' ? `${cuisine} ` : ''}${dietType} ${category.toLowerCase()} dishes`}
              />
              <div className="mt-8">
                <CardSkeleton count={8} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {filteredMeals.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-stone-500">
                      <span className="font-bold text-emerald-600">{filteredMeals.length}</span> delicious recipes found
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMeals.map((meal, idx) => (
                      <motion.div
                        key={meal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.4 }}
                      >
                        <MealCard meal={meal} allMeals={meals} />
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  preset={searchQuery ? 'noResults' : 'noData'}
                  description={
                    searchQuery
                      ? `We couldn't find any meals matching "${searchQuery}". Try a different keyword or filter.`
                      : undefined
                  }
                  primaryAction={
                    searchQuery
                      ? {
                          label: 'Clear Search',
                          onClick: () => setSearchQuery(''),
                          variant: 'primary',
                        }
                      : undefined
                  }
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
