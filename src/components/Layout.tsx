import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { useNotificationStore } from '../stores/notificationStore.js';
import { Footer } from './Footer.js';
import { 
  Home, 
  Heart, 
  Users, 
  Calendar, 
  ShoppingCart, 
  Sparkles, 
  ChefHat, 
  User, 
  Bell,
  Menu,
  X,
  Crown
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function Layout() {
  const { user, logout } = useAuthStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Recipes', href: '/recipes', icon: ChefHat },
    { name: 'Favorites', href: '/favorites', icon: Heart },
    { name: 'Family', href: '/family', icon: Users },
    { name: 'Meal Planner', href: '/meal-planner', icon: Calendar },
    { name: 'Shopping', href: '/shopping-lists', icon: ShoppingCart },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Sparkles, badge: 'NEW' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">NutriGuide</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname === item.href
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                  {item.badge && (
                    <span className="bg-amber-400 text-amber-900 text-xs px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Premium Badge */}
              {user?.isPremium && (
                <Link
                  to="/premium"
                  className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 rounded-lg text-sm font-medium"
                >
                  <Crown className="w-4 h-4" />
                  Premium
                </Link>
              )}

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 pr-3 rounded-lg hover:bg-gray-100">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="py-1">
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Settings
                    </Link>
                    {!user?.isPremium && (
                      <Link to="/premium" className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50">
                        <Crown className="w-4 h-4" />
                        Upgrade to Premium
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium ${
                    location.pathname === item.href
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[calc(100vh-200px)]">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
