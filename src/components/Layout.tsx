import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, Heart, Users, Bell, Crown, User, LogOut, 
  Menu, X, Home, Settings, Calendar, ShoppingCart
} from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const { user, isAuthenticated, logout, checkAuth, isLoading } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/meal-planner', icon: Calendar, label: 'Meal Planner' },
    { to: '/meal-history', icon: Utensils, label: 'History', auth: true },
    { to: '/shopping-list', icon: ShoppingCart, label: 'Shopping' },
    { to: '/favorites', icon: Heart, label: 'Favorites', auth: true },
    { to: '/family', icon: Users, label: 'Family', auth: true },
    { to: '/premium', icon: Crown, label: 'Premium' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-stone-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F8F7F4]/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-xl">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight text-stone-900">NutriGuide</h1>
                <p className="text-[10px] text-stone-500 font-medium uppercase tracking-widest">
                  Healthy Meal Discovery
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.auth && !isAuthenticated) return null;
                const isActive = location.pathname === item.to || 
                  (item.to !== '/' && location.pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Logout Button - Always Visible */}
                  <button
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>

                  {/* Notifications */}
                  <Link
                    to="/notifications"
                    className="relative p-2 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5 text-stone-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      {user?.isPremium && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden z-50"
                        >
                          <div className="p-3 border-b border-stone-100">
                            <p className="font-semibold text-stone-900">{user?.name}</p>
                            <p className="text-xs text-stone-500">{user?.email}</p>
                          </div>
                          <div className="p-1">
                            <Link
                              to="/profile"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg"
                            >
                              <User className="w-4 h-4" />
                              Profile
                            </Link>
                            <Link
                              to="/settings"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg"
                            >
                              <Settings className="w-4 h-4" />
                              Settings
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5 text-stone-600" />
                ) : (
                  <Menu className="w-5 h-5 text-stone-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden mt-4 overflow-hidden"
              >
                <div className="flex flex-col gap-1 py-2">
                  {navItems.map((item) => {
                    if (item.auth && !isAuthenticated) return null;
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowMobileMenu(false)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <Link to="/about" className="text-sm text-stone-500 hover:text-stone-700">About</Link>
            <Link to="/privacy" className="text-sm text-stone-500 hover:text-stone-700">Privacy</Link>
            <Link to="/terms" className="text-sm text-stone-500 hover:text-stone-700">Terms</Link>
            <Link to="/contact" className="text-sm text-stone-500 hover:text-stone-700">Contact</Link>
          </div>
          <p className="text-stone-400 text-sm">
            Powered by Gemini AI • Nutrition data is approximate
          </p>
          <p className="text-stone-300 text-xs mt-2">
            © {new Date().getFullYear()} NutriGuide. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Click outside to close menus */}
      {(showUserMenu || showMobileMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </div>
  );
}
