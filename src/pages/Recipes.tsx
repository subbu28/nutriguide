import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Recipe } from '../types/index.js';
import { Search, Plus, Clock, Users, ChefHat, Loader2, Filter, Coffee, Utensils, Moon, Cookie, GlassWater, Apple, X } from 'lucide-react';
import { RecipePopup } from '../components/RecipePopup.js';

export function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const cuisines = ['Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'American'];
  const difficulties = ['EASY', 'MEDIUM', 'HARD'];
  
  const categories = [
    { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'bg-amber-500' },
    { id: 'lunch', label: 'Lunch', icon: Utensils, color: 'bg-emerald-500' },
    { id: 'dinner', label: 'Dinner', icon: Moon, color: 'bg-indigo-500' },
    { id: 'snacks', label: 'Snacks', icon: Cookie, color: 'bg-orange-500' },
    { id: 'juices', label: 'Juices', icon: GlassWater, color: 'bg-red-500' },
    { id: 'smoothies', label: 'Smoothies', icon: Apple, color: 'bg-pink-500' },
  ];

  useEffect(() => {
    loadRecipes();
  }, [selectedCuisine, selectedDifficulty, selectedCategory]);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      const response = await api.getRecipes({
        cuisine: selectedCuisine || undefined,
        difficulty: selectedDifficulty || undefined,
        tags: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: 20,
      });
      setRecipes(response.recipes);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadRecipes();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Recipes</h1>
          <p className="text-stone-500">Discover and share delicious recipes</p>
        </div>
        <Link
          to="/recipes/create"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Recipe
        </Link>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? '' : cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all ${
                isSelected
                  ? `${cat.color} text-white shadow-lg scale-105`
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300 hover:shadow'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
              {isSelected && <X className="w-3.5 h-3.5 ml-1" />}
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
          >
            <option value="">All Cuisines</option>
            {cuisines.map((cuisine) => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2.5 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
          >
            <option value="">All Difficulties</option>
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>{diff.charAt(0) + diff.slice(1).toLowerCase()}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-6 py-2.5 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Recipe Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20">
          <ChefHat className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 mb-2">No recipes yet</h3>
          <p className="text-stone-500 mb-4">Be the first to share a recipe!</p>
          <Link
            to="/recipes/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-5 h-5" />
            Create Recipe
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe: any) => {
            const imageUrl = recipe.images?.[0] || recipe.imageUrl;
            return (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipeId(recipe.id)}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={recipe.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-stone-100 flex items-center justify-center">
                    <ChefHat className="w-12 h-12 text-stone-300" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {recipe.cuisine && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                        {recipe.cuisine}
                      </span>
                    )}
                    {recipe.difficulty && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        recipe.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                        recipe.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {recipe.difficulty.toLowerCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-stone-900 mb-1">{recipe.title}</h3>
                  <p className="text-sm text-stone-500 line-clamp-2 mb-3">{recipe.description}</p>
                  <div className="flex items-center gap-4 text-sm text-stone-500">
                    {recipe.prepTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {recipe.prepTime + (recipe.cookTime || 0)} min
                      </span>
                    )}
                    {recipe.servings && (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {recipe.servings} servings
                      </span>
                    )}
                  </div>
                  {recipe.author && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-emerald-600">
                          {recipe.author.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <span className="text-xs text-stone-500">{recipe.author.name}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
