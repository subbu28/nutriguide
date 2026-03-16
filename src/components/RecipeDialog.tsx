import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Flame, Dumbbell, CheckCircle2, Leaf, Beef, Star, Heart, 
  Share2, Check, Volume2, VolumeX, Pause, Play, Globe
} from 'lucide-react';
import { MealItem } from '../types';
import { ReviewSection } from './ReviewSection';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useAuthStore } from '../stores/authStore';
import { useMealsStore } from '../stores/mealsStore';

const cuisineFlags: Record<string, string> = {
  'American': '🇺🇸', 'British': '🇬🇧', 'Canadian': '🇨🇦', 'Chinese': '🇨🇳',
  'Croatian': '🇭🇷', 'Dutch': '🇳🇱', 'Egyptian': '🇪🇬', 'Filipino': '🇵🇭',
  'French': '🇫🇷', 'Greek': '🇬🇷', 'Indian': '🇮🇳', 'Irish': '🇮🇪',
  'Italian': '🇮🇹', 'Jamaican': '🇯🇲', 'Japanese': '🇯🇵', 'Kenyan': '🇰🇪',
  'Malaysian': '🇲🇾', 'Mexican': '🇲🇽', 'Moroccan': '🇲🇦', 'Polish': '🇵🇱',
  'Portuguese': '🇵🇹', 'Russian': '🇷🇺', 'Spanish': '🇪🇸', 'Thai': '🇹🇭',
  'Tunisian': '🇹🇳', 'Turkish': '🇹🇷', 'Vietnamese': '🇻🇳', 'International': '🌍',
};

interface RecipeDialogProps {
  meal: MealItem | null;
  isOpen: boolean;
  onClose: () => void;
  allMeals: MealItem[];
}

export const RecipeDialog: React.FC<RecipeDialogProps> = ({
  meal,
  isOpen,
  onClose,
  allMeals,
}) => {
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, addToFavorites, removeFromFavorites } = useMealsStore();
  const { speakRecipe, stop, pause, resume, isSpeaking, isPaused, isSupported, currentSection } = useTextToSpeech();
  
  const [isShared, setIsShared] = React.useState(false);
  const [isFavoriting, setIsFavoriting] = React.useState(false);

  const isLiked = meal ? isFavorite(meal.id) : false;

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Stop audio when dialog closes
  useEffect(() => {
    if (!isOpen && isSpeaking) {
      stop();
    }
  }, [isOpen, isSpeaking, stop]);

  if (!meal) return null;

  const averageRating = meal?.reviews && meal.reviews.length > 0
    ? meal.reviews.reduce((acc, curr) => acc + curr.rating, 0) / meal.reviews.length
    : 0;

  const relatedMeals = allMeals
    .filter((m) => m.id !== meal.id)
    .sort((a, b) => Math.abs(a.calories - meal.calories) - Math.abs(b.calories - meal.calories))
    .slice(0, 3);

  const handleListen = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      const recipeData = {
        name: meal.name,
        description: meal.description,
        ingredients: (meal as any).ingredients || [],
        instructions: meal.instructions || [],
      };
      speakRecipe(recipeData);
    }
  };

  const handleFavorite = async () => {
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

  const handleShare = async () => {
    const shareData = {
      title: `Healthy Meal: ${meal.name}`,
      text: `Check out this healthy ${meal.category} option: ${meal.name} (${meal.calories} kcal, ${meal.protein} protein).`,
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: 0.4 
            }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
            }}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 text-stone-500 hover:text-stone-800 hover:bg-white transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[90vh] overscroll-contain">
              {/* Hero Image */}
              {meal.imageUrl && (
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={meal.imageUrl}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {(meal as any).cuisine && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-stone-700 shadow-lg">
                        <span className="text-base">{cuisineFlags[(meal as any).cuisine] || '🌍'}</span>
                        <span>{(meal as any).cuisine}</span>
                      </div>
                    )}
                    {(meal as any).source === 'gemini' && (
                      <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white shadow-lg">
                        ✨ AI Generated
                      </div>
                    )}
                  </div>

                  {/* Bottom info on image */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-2">{meal.name}</h2>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-white/50'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-white/90">
                          {averageRating > 0 ? averageRating.toFixed(1) : 'New'} 
                          {meal?.reviews && meal.reviews.length > 0 && ` (${meal.reviews.length} reviews)`}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl flex items-center gap-2 shadow-lg">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-bold text-orange-700">{meal.calories} kcal</span>
                      </div>
                      <div className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl flex items-center gap-2 shadow-lg">
                        <Dumbbell className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-700">{meal.protein}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Action Buttons */}
                <div className="flex items-center gap-3 pb-4 border-b border-stone-200/50">
                  {meal.dietType === 'Vegetarian' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                      <Leaf className="w-3.5 h-3.5" />
                      Vegetarian
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">
                      <Beef className="w-3.5 h-3.5" />
                      Non-Veg
                    </div>
                  )}
                  
                  <div className="flex-1" />

                  {isSupported && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleListen}
                        className={`p-2.5 rounded-xl transition-all duration-300 ${
                          isSpeaking 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
                            : 'bg-stone-100 text-stone-600 hover:bg-emerald-100 hover:text-emerald-600'
                        }`}
                      >
                        {isSpeaking ? (isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />) : <Volume2 className="w-5 h-5" />}
                      </motion.button>
                      {isSpeaking && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={stop}
                          className="p-2.5 rounded-xl bg-stone-100 text-stone-600 hover:bg-red-100 hover:text-red-500 transition-all"
                        >
                          <VolumeX className="w-5 h-5" />
                        </motion.button>
                      )}
                    </>
                  )}

                  {isAuthenticated && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFavorite}
                      disabled={isFavoriting}
                      className={`p-2.5 rounded-xl transition-all duration-300 ${
                        isLiked 
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                          : 'bg-stone-100 text-stone-600 hover:bg-red-100 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="p-2.5 rounded-xl bg-stone-100 text-stone-600 hover:bg-cyan-100 hover:text-cyan-600 transition-all"
                  >
                    {isShared ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
                  </motion.button>
                </div>

                {/* Audio Progress */}
                {isSpeaking && currentSection && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Volume2 className="w-5 h-5 text-emerald-600" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-wider font-bold text-emerald-600">
                          Now Reading: {currentSection}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {['Introduction', 'Ingredients', 'Preparation', 'Complete'].map((section) => (
                            <div 
                              key={section}
                              className={`h-1.5 flex-1 rounded-full transition-colors ${
                                currentSection === section 
                                  ? 'bg-emerald-500' 
                                  : ['Introduction', 'Ingredients', 'Preparation', 'Complete'].indexOf(section) < 
                                    ['Introduction', 'Ingredients', 'Preparation', 'Complete'].indexOf(currentSection)
                                    ? 'bg-emerald-300'
                                    : 'bg-stone-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Description */}
                <div>
                  <p className="text-stone-600 leading-relaxed">{meal.description}</p>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-stone-400">Health Benefits</h3>
                  <div className="grid gap-2">
                    {meal.benefits.map((benefit, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-xl"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-stone-700">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Ingredients */}
                {(meal as any).ingredients && (meal as any).ingredients.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-stone-400">Ingredients</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(meal as any).ingredients.map((ingredient: { name: string; measure: string }, idx: number) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100"
                        >
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-stone-800 block truncate">{ingredient.name}</span>
                            {ingredient.measure && (
                              <span className="text-xs text-stone-500">{ingredient.measure}</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cooking Instructions */}
                {meal.instructions && meal.instructions.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-stone-400">Preparation Steps</h3>
                    <div className="space-y-3">
                      {meal.instructions.map((step, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                            {idx + 1}
                          </div>
                          <p className="text-sm text-stone-700 leading-relaxed pt-1.5">{step}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                <ReviewSection mealId={meal.id} />

                {/* Related Meals */}
                {relatedMeals.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-stone-200/50">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-stone-400">You might also like</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {relatedMeals.map((related) => (
                        <div 
                          key={related.id}
                          className="group bg-stone-50 rounded-xl p-2 border border-stone-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer"
                        >
                          {related.imageUrl && (
                            <div className="h-20 w-full rounded-lg overflow-hidden mb-2">
                              <img 
                                src={related.imageUrl} 
                                alt={related.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <p className="text-xs font-bold text-stone-800 line-clamp-1 group-hover:text-emerald-700">{related.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-stone-400">{related.calories} kcal</span>
                            <span className="text-[10px] text-stone-300">•</span>
                            <span className="text-[10px] text-stone-400">{related.protein}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
