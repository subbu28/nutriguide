import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Utensils,
  Scale,
  Target,
  AlertTriangle,
  Save,
  Loader2,
  Check,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Paleo',
  'Gluten-Free',
  'Dairy-Free',
  'Low-Carb',
  'High-Protein',
];

const ALLERGY_OPTIONS = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame',
];

const CUISINES = [
  'All',
  'American',
  'British',
  'Chinese',
  'French',
  'Indian',
  'Italian',
  'Japanese',
  'Mexican',
  'Thai',
];

export const Settings: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Settings state
  const [settings, setSettings] = useState({
    dietaryPreferences: [] as string[],
    allergies: [] as string[],
    calorieGoal: null as number | null,
    proteinGoal: null as number | null,
    emailNotifications: true,
    pushNotifications: true,
    pollReminders: true,
    familyUpdates: true,
    theme: 'system',
    language: 'en',
    measurementUnit: 'metric',
    defaultCuisine: null as string | null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    loadSettings();
  }, [isAuthenticated, navigate]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleDietaryPreference = (pref: string) => {
    setSettings(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(pref)
        ? prev.dietaryPreferences.filter(p => p !== pref)
        : [...prev.dietaryPreferences, pref],
    }));
  };

  const toggleAllergy = (allergy: string) => {
    setSettings(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          Settings
        </h1>
        <p className="text-stone-600 mt-2">Customize your NutriGuide experience</p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Dietary Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-emerald-600" />
            Dietary Preferences
          </h2>
          <p className="text-sm text-stone-600 mb-4">Select your dietary preferences to get personalized meal recommendations.</p>
          
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map(pref => (
              <button
                key={pref}
                onClick={() => toggleDietaryPreference(pref)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  settings.dietaryPreferences.includes(pref)
                    ? 'bg-emerald-500 text-white shadow-glow'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Allergies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Allergies & Intolerances
          </h2>
          <p className="text-sm text-stone-600 mb-4">We'll filter out recipes containing these ingredients.</p>
          
          <div className="flex flex-wrap gap-2">
            {ALLERGY_OPTIONS.map(allergy => (
              <button
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  settings.allergies.includes(allergy)
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {allergy}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Nutrition Goals */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-600" />
            Daily Nutrition Goals
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Daily Calorie Goal
              </label>
              <input
                type="number"
                value={settings.calorieGoal || ''}
                onChange={e => setSettings(prev => ({ 
                  ...prev, 
                  calorieGoal: e.target.value ? parseInt(e.target.value) : null 
                }))}
                placeholder="e.g., 2000"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Daily Protein Goal (g)
              </label>
              <input
                type="number"
                value={settings.proteinGoal || ''}
                onChange={e => setSettings(prev => ({ 
                  ...prev, 
                  proteinGoal: e.target.value ? parseInt(e.target.value) : null 
                }))}
                placeholder="e.g., 150"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get notifications on your device' },
              { key: 'pollReminders', label: 'Poll Reminders', desc: 'Remind me before polls close' },
              { key: 'familyUpdates', label: 'Family Updates', desc: 'Notify when family members join or share meals' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-stone-800">{item.label}</p>
                  <p className="text-sm text-stone-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    settings[item.key as keyof typeof settings] ? 'bg-emerald-500' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      settings[item.key as keyof typeof settings] ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* App Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            App Preferences
          </h2>
          
          <div className="space-y-4">
            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Theme</label>
              <div className="flex gap-2">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Smartphone, label: 'System' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSettings(prev => ({ ...prev, theme: option.value }))}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      settings.theme === option.value
                        ? 'bg-indigo-500 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Measurement Unit */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Measurement Unit</label>
              <div className="flex gap-2">
                {[
                  { value: 'metric', label: 'Metric (g, ml)' },
                  { value: 'imperial', label: 'Imperial (oz, cups)' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSettings(prev => ({ ...prev, measurementUnit: option.value }))}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      settings.measurementUnit === option.value
                        ? 'bg-indigo-500 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Cuisine */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Default Cuisine</label>
              <select
                value={settings.defaultCuisine || 'All'}
                onChange={e => setSettings(prev => ({ 
                  ...prev, 
                  defaultCuisine: e.target.value === 'All' ? null : e.target.value 
                }))}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                {CUISINES.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Language</label>
              <select
                value={settings.language}
                onChange={e => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </motion.section>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex justify-end"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 gradient-primary text-white font-semibold rounded-xl shadow-glow hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saved ? (
              <Check className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};
