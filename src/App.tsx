import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Favorites } from './pages/Favorites';
import { Family } from './pages/Family';
import { Premium } from './pages/Premium';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { MealPlanner } from './pages/MealPlanner';
import { ShoppingListPage } from './pages/ShoppingListPage';
import { Notifications } from './pages/Notifications';
import { NutritionDashboard } from './pages/NutritionDashboard';
import { MealHistory } from './pages/MealHistory';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  return (
    <ErrorBoundary>
      <OfflineIndicator />
      <PWAInstallPrompt />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="auth" element={<Auth />} />
          <Route path="premium" element={<Premium />} />
          <Route
            path="favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="family"
            element={
              <ProtectedRoute>
                <Family />
              </ProtectedRoute>
            }
          />
          <Route
            path="family/:familyId"
            element={
              <ProtectedRoute>
                <Family />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="meal-planner"
            element={
              <ProtectedRoute>
                <MealPlanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="shopping-list"
            element={
              <ProtectedRoute>
                <ShoppingListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="nutrition-dashboard"
            element={
              <ProtectedRoute>
                <NutritionDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="meal-history"
            element={
              <ProtectedRoute>
                <MealHistory />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
