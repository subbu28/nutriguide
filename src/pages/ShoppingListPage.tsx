import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShoppingList } from '../components/ShoppingList';
import { AddToShoppingListModal } from '../components/AddToShoppingListModal';
import { useMealsStore } from '../stores/mealsStore';

export const ShoppingListPage: React.FC = () => {
  const navigate = useNavigate();
  const { favorites } = useMealsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalMeals, setModalMeals] = useState<any[]>([]);

  const handleAddFromFavorites = () => {
    const meals = favorites.map((fav) => ({
      id: fav.mealId,
      name: fav.mealName,
      servings: 4,
      image: fav.mealData?.imageUrl,
      ingredients: fav.mealData?.ingredients || [],
      selected: true,
    }));

    setModalMeals(meals);
    setShowAddModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Shopping List</h1>
              <p className="text-emerald-100">Manage your grocery shopping</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap gap-4"
        >
          <button
            onClick={handleAddFromFavorites}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Add from Favorites
          </button>
        </motion.div>

        {/* Shopping List Component */}
        <ShoppingList standalone />

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          <div className="glass rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-stone-800 mb-2">Organized by Category</h3>
            <p className="text-sm text-stone-500">
              Items are automatically grouped by store section to make your shopping trip more efficient.
            </p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="font-bold text-stone-800 mb-2">Sync Across Devices</h3>
            <p className="text-sm text-stone-500">
              Your shopping list is saved locally and will be synced when you're logged in.
            </p>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-stone-800 mb-2">Track Progress</h3>
            <p className="text-sm text-stone-500">
              Check off items as you shop and see your progress in real-time.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Add from Favorites Modal */}
      <AddToShoppingListModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        meals={modalMeals}
        source="favorites"
        title="Add from Favorites"
      />
    </div>
  );
};
