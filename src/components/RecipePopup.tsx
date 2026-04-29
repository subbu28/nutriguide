import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Clock, Users, ChefHat, Flame, Play, Pause, Volume2,
  VolumeX, Heart, Share2, Bookmark, Star, Check, Loader2
} from 'lucide-react';
import { api } from '../lib/api';

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  optional?: boolean;
}

interface Recipe {
  id: string;
  title: string;
  description?: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  cuisine?: string;
  images?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  ingredients?: Ingredient[];
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags?: string[];
}

interface RecipePopupProps {
  recipeId: string;
  onClose: () => void;
}

export function RecipePopup({ recipeId, onClose }: RecipePopupProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'instructions'>('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    loadRecipe();
    return () => {
      // Stop speech when component unmounts
      window.speechSynthesis.cancel();
    };
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      setIsLoading(true);
      const data = await api.getRecipe(recipeId);
      setRecipe(data);
    } catch (error) {
      console.error('Failed to load recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIngredient = (id: string) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getTextToRead = () => {
    if (!recipe) return '';
    
    let text = `Recipe: ${recipe.title}. `;
    if (recipe.description) {
      text += `${recipe.description}. `;
    }
    text += `Preparation time: ${recipe.prepTime} minutes. Cooking time: ${recipe.cookTime} minutes. Serves ${recipe.servings}. `;
    
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      text += 'Ingredients: ';
      recipe.ingredients.forEach((ing, idx) => {
        text += `${ing.amount} ${ing.unit} of ${ing.name}${idx < recipe.ingredients!.length - 1 ? ', ' : '. '}`;
      });
    }
    
    text += 'Instructions: ' + recipe.instructions.replace(/\n/g, '. ');
    
    return text;
  };

  const toggleAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const text = getTextToRead();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = isMuted ? 0 : 1;
      
      // Try to use a nice voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes('Samantha') || 
        v.name.includes('Google') || 
        v.name.includes('Female')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (speechRef.current) {
      speechRef.current.volume = isMuted ? 1 : 0;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'HARD': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-stone-500/20 text-stone-400 border-stone-500/30';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop with blur */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl flex flex-col"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
            </div>
          ) : recipe ? (
            <>
              {/* Header Image */}
              <div className="relative h-64 overflow-hidden">
                {recipe.images?.[0] ? (
                  <img
                    src={recipe.images[0]}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                    <ChefHat className="w-20 h-20 text-white/30" />
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white hover:bg-black/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Audio controls */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <button
                    onClick={toggleAudio}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border transition-all ${
                      isPlaying 
                        ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-300' 
                        : 'bg-black/30 border-white/10 text-white hover:bg-black/50'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span className="text-sm font-medium">Playing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-medium">Listen</span>
                      </>
                    )}
                  </button>
                  
                  {isPlaying && (
                    <button
                      onClick={toggleMute}
                      className="p-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white hover:bg-black/50 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {recipe.cuisine && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/10">
                        {recipe.cuisine}
                      </span>
                    )}
                    {recipe.difficulty && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(recipe.difficulty)}`}>
                        {recipe.difficulty.toLowerCase()}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">{recipe.title}</h2>
                  {recipe.author && (
                    <p className="text-white/70 text-sm">by {recipe.author.name}</p>
                  )}
                </div>
              </div>

              {/* Stats bar */}
              <div className="flex items-center justify-around py-4 border-b border-white/10 bg-white/5">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{recipe.prepTime}m</span>
                  </div>
                  <p className="text-xs text-white/50 mt-1">Prep</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-orange-400">
                    <Flame className="w-4 h-4" />
                    <span className="font-semibold">{recipe.cookTime}m</span>
                  </div>
                  <p className="text-xs text-white/50 mt-1">Cook</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-400">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{recipe.servings}</span>
                  </div>
                  <p className="text-xs text-white/50 mt-1">Servings</p>
                </div>
                {recipe.calories && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-pink-400">
                      <span className="font-semibold">{Math.round(recipe.calories)}</span>
                    </div>
                    <p className="text-xs text-white/50 mt-1">Calories</p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {(['overview', 'ingredients', 'instructions'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === tab 
                        ? 'text-emerald-400' 
                        : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {recipe.description && (
                        <p className="text-white/80 leading-relaxed">{recipe.description}</p>
                      )}
                      
                      {/* Nutrition */}
                      {(recipe.protein || recipe.carbs || recipe.fat) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          {recipe.protein && (
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                              <p className="text-lg font-bold text-blue-400">{Math.round(recipe.protein)}g</p>
                              <p className="text-xs text-white/50">Protein</p>
                            </div>
                          )}
                          {recipe.carbs && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                              <p className="text-lg font-bold text-amber-400">{Math.round(recipe.carbs)}g</p>
                              <p className="text-xs text-white/50">Carbs</p>
                            </div>
                          )}
                          {recipe.fat && (
                            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center">
                              <p className="text-lg font-bold text-pink-400">{Math.round(recipe.fat)}g</p>
                              <p className="text-xs text-white/50">Fat</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {recipe.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-xs rounded-full bg-white/10 text-white/70 border border-white/10"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'ingredients' && (
                    <motion.div
                      key="ingredients"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-2"
                    >
                      {recipe.ingredients && recipe.ingredients.length > 0 ? (
                        recipe.ingredients.map((ing) => (
                          <button
                            key={ing.id}
                            onClick={() => toggleIngredient(ing.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                              checkedIngredients.has(ing.id)
                                ? 'bg-emerald-500/20 border border-emerald-500/30'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              checkedIngredients.has(ing.id)
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/10 border border-white/20'
                            }`}>
                              {checkedIngredients.has(ing.id) && <Check className="w-3 h-3" />}
                            </div>
                            <span className={`flex-1 text-left transition-all ${
                              checkedIngredients.has(ing.id)
                                ? 'text-white/50 line-through'
                                : 'text-white'
                            }`}>
                              <span className="font-medium text-emerald-400">{ing.amount} {ing.unit}</span>
                              {' '}{ing.name}
                              {ing.optional && <span className="text-white/40 text-sm ml-2">(optional)</span>}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="text-white/50 text-center py-8">No ingredients listed</p>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'instructions' && (
                    <motion.div
                      key="instructions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {recipe.instructions.split('\n').filter(line => line.trim()).map((step, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                            <span className="text-sm font-bold text-emerald-400">{idx + 1}</span>
                          </div>
                          <p className="text-white/80 leading-relaxed pt-1">
                            {step.replace(/^\d+\.\s*/, '')}
                          </p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-between p-4 border-t border-white/10 bg-black/20">
                <div className="flex gap-2">
                  <button className="p-2 rounded-xl bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-xl bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-xl bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={toggleAudio}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                    isPlaying
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      Read Recipe
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-white/50">
              <ChefHat className="w-16 h-16 mb-4 opacity-50" />
              <p>Recipe not found</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
