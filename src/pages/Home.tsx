import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { useMealsStore } from '../stores/mealsStore.js';
import { api } from '../lib/api.js';
import { motion } from 'motion/react';
import { 
  Search, 
  ChefHat, 
  Sparkles, 
  Clock, 
  Flame,
  ArrowRight,
  Loader2,
  Calendar,
  ShoppingCart,
  Heart,
  Users,
  TrendingUp,
  Target,
  Utensils,
  Coffee,
  Moon,
  Sun,
  BarChart3,
  Award,
  Zap
} from 'lucide-react';

export function Home() {
  const { user } = useAuthStore();
  const { favorites, fetchFavorites } = useMealsStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ mealPlans: 0, shoppingLists: 0, familyMembers: 0 });
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await fetchFavorites();
      // Load today's meals from saved plans
      try {
        const { plans } = await api.getMealPlans();
        const today = new Date().toISOString().split('T')[0];
        // Find meals planned for today from any saved plan
        const todaysMeals: any[] = [];
        for (const plan of (plans || [])) {
          if (plan.meals) {
            for (const meal of plan.meals) {
              const mealDate = new Date(meal.date).toISOString().split('T')[0];
              if (mealDate === today) {
                todaysMeals.push({
                  name: meal.recipeName,
                  imageUrl: meal.recipeImage,
                  mealType: meal.slot?.toLowerCase(),
                  calories: meal.recipeData?.calories,
                });
              }
            }
          }
        }
        setTodayMeals(todaysMeals);
      } catch (e) {
        setTodayMeals([]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    { 
      title: 'Plan Your Week', 
      description: 'Create a meal plan for the week',
      href: '/meal-planner', 
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Browse Recipes', 
      description: 'Discover new healthy meals',
      href: '/recipes', 
      icon: ChefHat,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    { 
      title: 'Shopping List', 
      description: 'Generate from your meal plan',
      href: '/shopping-lists', 
      icon: ShoppingCart,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    },
    { 
      title: 'AI Assistant', 
      description: 'Get personalized recommendations',
      href: '/ai-assistant', 
      icon: Sparkles,
      color: 'bg-violet-500',
      bgColor: 'bg-violet-50'
    },
  ];

  const categoryShortcuts = [
    { name: 'Breakfast', icon: Coffee, color: 'bg-amber-100 text-amber-700', href: '/recipes?category=breakfast' },
    { name: 'Lunch', icon: Sun, color: 'bg-emerald-100 text-emerald-700', href: '/recipes?category=lunch' },
    { name: 'Dinner', icon: Moon, color: 'bg-indigo-100 text-indigo-700', href: '/recipes?category=dinner' },
    { name: 'Snacks', icon: Utensils, color: 'bg-orange-100 text-orange-700', href: '/recipes?category=snacks' },
  ];

  const features = [
    { 
      title: 'Track Nutrition', 
      description: 'Monitor your daily intake and reach your health goals',
      icon: BarChart3,
      href: '/nutrition'
    },
    { 
      title: 'Meal History', 
      description: 'View what you\'ve eaten and discover patterns',
      icon: Clock,
      href: '/meal-history'
    },
    { 
      title: 'Family Groups', 
      description: 'Plan meals together with family members',
      icon: Users,
      href: '/family'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/50 to-transparent" />
        <div className="relative px-8 py-12 md:py-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-emerald-200 text-sm font-medium mb-2">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-emerald-100 text-lg mb-6">
                Ready to plan some healthy meals? Let's make today delicious.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.form 
              onSubmit={handleSearch} 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search recipes, ingredients, cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-4 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Search
              </button>
            </motion.form>
          </div>

          {/* Stats Cards */}
          <motion.div 
            className="mt-8 grid grid-cols-3 gap-4 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Heart className="w-5 h-5 text-red-300 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{favorites.length}</p>
              <p className="text-xs text-emerald-200">Favorites</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Calendar className="w-5 h-5 text-blue-300 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{todayMeals.length}</p>
              <p className="text-xs text-emerald-200">Today's Meals</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <Award className="w-5 h-5 text-amber-300 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{user?.isPremium ? '∞' : '50'}</p>
              <p className="text-xs text-emerald-200">Recipe Limit</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <Link
                to={action.href}
                className={`block ${action.bgColor} rounded-2xl p-5 hover:shadow-lg transition-all group`}
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-stone-900">{action.title}</h3>
                <p className="text-sm text-stone-600 mt-1">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Category Shortcuts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-stone-900">Browse by Category</h2>
          <Link to="/recipes" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm">
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryShortcuts.map((cat) => (
            <Link
              key={cat.name}
              to={cat.href}
              className={`flex items-center gap-3 p-4 ${cat.color} rounded-xl hover:shadow-md transition-all`}
            >
              <cat.icon className="w-6 h-6" />
              <span className="font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Today's Plan */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900">Today's Meal Plan</h2>
              <p className="text-sm text-stone-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <Link to="/meal-planner" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
            Manage Plan
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : todayMeals.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {todayMeals.map((meal, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <div className="w-14 h-14 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0">
                  {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-stone-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-emerald-600 uppercase">{meal.mealType}</p>
                  <p className="font-medium text-stone-900 truncate">{meal.name}</p>
                  <p className="text-xs text-stone-500">{meal.calories || '~'} kcal</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-600 mb-3">No meals planned for today</p>
            <Link
              to="/meal-planner"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Plan Your Day
            </Link>
          </div>
        )}
      </section>

      {/* AI Assistant Promo */}
      <section className="relative bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium text-violet-200">AI-Powered</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Need Meal Ideas?</h2>
            <p className="text-violet-200 text-sm mb-4 max-w-md">
              Ask our AI assistant for personalized recipe recommendations based on your preferences, 
              dietary needs, or available ingredients.
            </p>
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-violet-600 rounded-lg font-semibold hover:bg-violet-50 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Try AI Assistant
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-white/80" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-xl font-bold text-stone-900 mb-4">Explore More</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.href}
              className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
                <feature.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-stone-600">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* My Favorites Preview */}
      {favorites.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="font-bold text-stone-900">My Favorites</h2>
            </div>
            <Link to="/favorites" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
              View all ({favorites.length})
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {favorites.slice(0, 4).map((fav) => (
              <Link
                key={fav.id}
                to="/favorites"
                className="group"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 mb-2">
                  {fav.mealData?.imageUrl ? (
                    <img 
                      src={fav.mealData.imageUrl} 
                      alt={fav.mealData.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-8 h-8 text-stone-300" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-stone-900 truncate">{fav.mealData?.name}</p>
                <p className="text-xs text-stone-500">{fav.category}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
