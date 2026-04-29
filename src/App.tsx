import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore.js';
import { Layout } from './components/Layout.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

// Pages
import { Home } from './pages/Home.js';
import { Auth } from './pages/Auth.js';
import { Profile } from './pages/Profile.js';
import { Settings } from './pages/Settings.js';
import { Favorites } from './pages/Favorites.js';
import { Family } from './pages/Family.js';
import { FamilyDetail } from './pages/FamilyDetail.js';
import { MealPlanner } from './pages/MealPlanner.js';
import { MealHistory } from './pages/MealHistory.js';
import { NutritionDashboard } from './pages/NutritionDashboard.js';
import { ShoppingLists } from './pages/ShoppingLists.js';
import { Recipes } from './pages/Recipes.js';
import { RecipeDetail } from './pages/RecipeDetail.js';
import { CreateRecipe } from './pages/CreateRecipe.js';
import { Premium } from './pages/Premium.js';
import { Notifications } from './pages/Notifications.js';
import { AIAssistant } from './pages/AIAssistant.js';
import { Landing } from './pages/Landing.js';
import { NotFound } from './pages/NotFound.js';
import { Search } from './pages/Search.js';

function App() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/landing" element={!user ? <Landing /> : <Navigate to="/" />} />
      <Route path="/login" element={!user ? <Auth mode="login" /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Auth mode="register" /> : <Navigate to="/" />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/recipes/create" element={<CreateRecipe />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/family" element={<Family />} />
          <Route path="/family/:id" element={<FamilyDetail />} />
          <Route path="/meal-planner" element={<MealPlanner />} />
          <Route path="/meal-history" element={<MealHistory />} />
          <Route path="/nutrition" element={<NutritionDashboard />} />
          <Route path="/shopping-lists" element={<ShoppingLists />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/search" element={<Search />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
