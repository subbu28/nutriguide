import React, { useState } from 'react';
import { MealItem } from '../types';
import { Flame, Dumbbell, Share2, Check, Leaf, Beef, Star, Heart, Eye, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RecipeDialog } from './RecipeDialog';
import { useAuthStore } from '../stores/authStore';
import { useMealsStore } from '../stores/mealsStore';
import { QuickLogButton } from './QuickLogButton';
import { MealLogModal } from './MealLogModal';

const cuisineFlags: Record<string, string> = {
  'American': '🇺🇸', 'British': '🇬🇧', 'Canadian': '🇨🇦', 'Chinese': '🇨🇳',
  'Croatian': '🇭🇷', 'Dutch': '🇳🇱', 'Egyptian': '🇪🇬', 'Filipino': '🇵🇭',
  'French': '🇫🇷', 'Greek': '🇬🇷', 'Indian': '🇮🇳', 'Irish': '🇮🇪',
  'Italian': '🇮🇹', 'Jamaican': '🇯🇲', 'Japanese': '🇯🇵', 'Kenyan': '🇰🇪',
  'Malaysian': '🇲🇾', 'Mexican': '🇲🇽', 'Moroccan': '🇲🇦', 'Polish': '🇵🇱',
  'Portuguese': '🇵🇹', 'Russian': '🇷🇺', 'Spanish': '🇪🇸', 'Thai': '🇹🇭',
  'Tunisian': '🇹🇳', 'Turkish': '🇹🇷', 'Vietnamese': '🇻🇳', 'International': '🌍',
};

interface MealCardProps {
  meal: MealItem;
  allMeals: MealItem[];
}

export const MealCard: React.FC<MealCardProps> = ({ meal, allMeals }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isShared, setIsShared] = useState(false);
  // Reviews are now managed by ReviewSection component using reviewsStore
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, addToFavorites, removeFromFavorites } = useMealsStore();
  const isLiked = isFavorite(meal.id);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || isFavoriting) return;
    
    setIsFavoriting(true);
    try {
      if (isLiked) {
        await removeFromFavorites(meal.id);
      } else {
        await addToFavorites(meal);
      }
    } catch (error) {
      console.error('Failed to update favorite:', error);
    } finally {
      setIsFavoriting(false);
    }
  };

  const averageRating = meal.reviews && meal.reviews.length > 0
    ? meal.reviews.reduce((acc, curr) => acc + curr.rating, 0) / meal.reviews.length
    : 0;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: `Healthy Meal: ${meal.name}`,
      text: `Check out this healthy ${meal.category} option: ${meal.name} (${meal.calories} kcal, ${meal.protein} protein). ${meal.description}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleCardClick = () => {
    setIsDialogOpen(true);
  };



  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={handleCardClick}
      className="recipe-card glass shadow-soft hover:shadow-elevated flex flex-col h-full cursor-pointer group"
    >
      {meal.imageUrl ? (
        <div className="relative h-52 w-full overflow-hidden rounded-t-2xl">
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 recipe-image-overlay" />
          
          {/* Quick Log Button - Floating */}
          {isAuthenticated && (
            <div className="absolute bottom-3 right-3 z-20">
              <QuickLogButton meal={meal} variant="floating" />
            </div>
          )}
          
          {/* Floating badges container */}
          <div className="absolute inset-x-0 top-0 p-3 flex justify-between items-start">
            {/* Cuisine Badge */}
            {(meal as any).cuisine && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-full text-xs font-bold text-stone-700 shadow-soft"
              >
                <span className="text-base">{cuisineFlags[(meal as any).cuisine] || cuisineFlags[(meal as any).area] || '🌍'}</span>
                <span>{(meal as any).cuisine || (meal as any).area}</span>
              </motion.div>
            )}
            {/* Source Badge */}
            {(meal as any).source === 'gemini' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white shadow-glow-purple"
              >
                ✨ AI Generated
              </motion.div>
            )}
            {(meal as any).source === 'static' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-xs font-bold text-white shadow-glow"
              >
                ⭐ Curated
              </motion.div>
            )}
          </div>
          
          {/* Bottom gradient info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex gap-2">
              <div className="nutrition-badge calories">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-orange-700">{meal.calories} kcal</span>
              </div>
              <div className="nutrition-badge protein">
                <Dumbbell className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-700">{meal.protein}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-52 w-full bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center relative rounded-t-2xl">
          <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center opacity-20">
            <Flame className="w-10 h-10 text-white" />
          </div>
          {/* Cuisine Badge for non-image cards */}
          {(meal as any).cuisine && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 glass rounded-full text-xs font-bold text-stone-700">
              <span className="text-base">{cuisineFlags[(meal as any).cuisine] || '🌍'}</span>
              <span>{(meal as any).cuisine}</span>
            </div>
          )}
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-3">
        <div className="flex-grow pr-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-stone-800 leading-tight group-hover:text-gradient transition-all duration-300">
              {meal.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 transition-colors ${
                    i < Math.round(averageRating) 
                      ? 'fill-amber-400 text-amber-400 drop-shadow-sm' 
                      : 'text-stone-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-stone-500">
              {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
              {meal.reviews && meal.reviews.length > 0 && <span className="text-stone-400"> ({meal.reviews.length})</span>}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isAuthenticated && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFavorite}
              disabled={isFavoriting}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                isLiked 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                  : 'text-stone-400 hover:bg-red-50 hover:text-red-500'
              }`}
              title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="p-2.5 rounded-xl hover:bg-cyan-50 text-stone-400 hover:text-cyan-600 transition-all duration-300 relative"
            title="Share meal"
          >
            {isShared ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            <AnimatePresence>
              {isShared && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -20 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600 whitespace-nowrap"
                >
                  Copied!
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <div className="text-stone-400 group-hover:text-emerald-600 transition-colors">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-4">
        {meal.dietType === 'Vegetarian' ? (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
            <Leaf className="w-3 h-3" />
            Vegetarian
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-100">
            <Beef className="w-3 h-3" />
            Non-Veg
          </div>
        )}
      </div>
      
      <p className="text-stone-600 text-sm mb-6 flex-grow">{meal.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 bg-orange-50 p-2 rounded-lg">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-medium text-orange-700">{meal.calories} kcal</span>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 p-2 rounded-lg">
          <Dumbbell className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-700">{meal.protein} protein</span>
        </div>
      </div>

      <p className="text-[10px] text-stone-400 text-center mt-2 group-hover:text-emerald-500 transition-colors">
        Click to view full recipe
      </p>
      </div>
    </motion.div>

    <RecipeDialog
      meal={meal}
      isOpen={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      allMeals={allMeals}
    />
    </>
  );
};
