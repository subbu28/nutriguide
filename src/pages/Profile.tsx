import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { api } from '../lib/api.js';
import { 
  User, 
  Mail, 
  Calendar, 
  ChefHat, 
  Heart, 
  Users, 
  BookOpen,
  Loader2,
  Camera
} from 'lucide-react';

export function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [stats, setStats] = useState({
    favorites: 0,
    recipes: 0,
    reviews: 0,
    mealPlans: 0,
    mealLogs: 0,
    families: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { label: 'Favorites', value: stats.favorites, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Recipes', value: stats.recipes, icon: ChefHat, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Reviews', value: stats.reviews, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Meal Plans', value: stats.mealPlans, icon: Calendar, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: 'Meals Logged', value: stats.mealLogs, icon: User, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Families', value: stats.families, icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-50' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600" />
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row md:items-end -mt-16 mb-6">
            <div className="relative">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=128`}
                alt={user?.name}
                className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg"
              />
              {isEditing && (
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-2xl font-bold text-gray-900 border-b-2 border-emerald-500 focus:outline-none bg-transparent"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              )}
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user?.createdAt || '').toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          {isEditing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          ) : (
            <p className="text-gray-600">
              {user?.bio || 'No bio yet. Click Edit Profile to add one.'}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Account Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive updates about your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive push notifications on your device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Premium Status</p>
              <p className="text-sm text-gray-600">
                {user?.isPremium ? 'You have Premium access' : 'Upgrade to Premium for more features'}
              </p>
            </div>
            {user?.isPremium ? (
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                Premium
              </span>
            ) : (
              <a
                href="/premium"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Upgrade
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
