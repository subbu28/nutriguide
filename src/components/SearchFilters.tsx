import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Flame,
  Dumbbell,
  Clock,
  UtensilsCrossed,
  Leaf,
  Beef,
  Coffee,
  Sun,
  Moon,
  GlassWater,
  Globe,
  Plus,
  Trash2,
} from 'lucide-react';
import { useSearchStore } from '../stores/searchStore';
import { CUISINES, type Cuisine } from '../stores/mealsStore';
import type { MealCategory, DietType } from '../types';
import type { SearchFilters as SearchFiltersType } from '../types/search';

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-stone-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-1 hover:bg-stone-50/50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-stone-400">{icon}</span>
          <span className="font-semibold text-stone-700">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 px-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: { min: number; max: number } | null;
  onChange: (value: { min: number; max: number } | null) => void;
  unit?: string;
  icon: React.ReactNode;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
  unit = '',
  icon,
}) => {
  const currentMin = value?.min ?? min;
  const currentMax = value?.max ?? max;
  
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(parseInt(e.target.value), currentMax - step);
    onChange({ min: newMin, max: currentMax });
  };
  
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(parseInt(e.target.value), currentMin + step);
    onChange({ min: currentMin, max: newMax });
  };
  
  const clearRange = () => onChange(null);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-stone-600">{label}</span>
        </div>
        {value && (
          <button
            onClick={clearRange}
            className="text-xs text-stone-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="px-1">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={currentMin}
              onChange={handleMinChange}
              className="w-full accent-emerald-500"
            />
          </div>
          <div className="flex-1">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={currentMax}
              onChange={handleMaxChange}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm font-medium text-stone-600">
          <span className="bg-stone-100 px-2 py-1 rounded-md">
            {currentMin}{unit}
          </span>
          <span className="text-stone-400">-</span>
          <span className="bg-stone-100 px-2 py-1 rounded-md">
            {currentMax}{unit}
          </span>
        </div>
      </div>
    </div>
  );
};

interface IngredientInputProps {
  label: string;
  ingredients: string[];
  onAdd: (ingredient: string) => void;
  onRemove: (ingredient: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
}

const IngredientInput: React.FC<IngredientInputProps> = ({
  label,
  ingredients,
  onAdd,
  onRemove,
  placeholder = 'Add ingredient...',
  icon,
}) => {
  const [input, setInput] = useState('');
  
  const handleAdd = () => {
    if (input.trim() && !ingredients.includes(input.trim())) {
      onAdd(input.trim());
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-stone-600">{label}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="px-3 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ing) => (
            <motion.span
              key={ing}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg"
            >
              {ing}
              <button
                onClick={() => onRemove(ing)}
                className="hover:text-emerald-900"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
};

export const SearchFilters: React.FC = () => {
  const { filters, setFilter, clearFilters, setShowFilters, search } = useSearchStore();
  
  const dietTypes: { id: DietType | 'All'; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'All', label: 'All Types', icon: <UtensilsCrossed className="w-4 h-4" />, color: 'bg-stone-500' },
    { id: 'Vegetarian', label: 'Vegetarian', icon: <Leaf className="w-4 h-4" />, color: 'bg-emerald-500' },
    { id: 'Non-Vegetarian', label: 'Non-Veg', icon: <Beef className="w-4 h-4" />, color: 'bg-orange-500' },
  ];
  
  const categories: { id: MealCategory | 'All'; label: string; icon: React.ReactNode }[] = [
    { id: 'All', label: 'All Meals', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'Breakfast', label: 'Breakfast', icon: <Coffee className="w-4 h-4" /> },
    { id: 'Lunch', label: 'Lunch', icon: <Sun className="w-4 h-4" /> },
    { id: 'Dinner', label: 'Dinner', icon: <Moon className="w-4 h-4" /> },
    { id: 'Juices', label: 'Juices', icon: <GlassWater className="w-4 h-4" /> },
  ];
  
  const cuisineFlags: Record<string, string> = {
    'All': '🌍', 'American': '🇺🇸', 'British': '🇬🇧', 'Canadian': '🇨🇦', 'Chinese': '🇨🇳',
    'Croatian': '🇭🇷', 'Dutch': '🇳🇱', 'Egyptian': '🇪🇬', 'Filipino': '🇵🇭', 'French': '🇫🇷',
    'Greek': '🇬🇷', 'Indian': '🇮🇳', 'Irish': '🇮🇪', 'Italian': '🇮🇹', 'Jamaican': '🇯🇲',
    'Japanese': '🇯🇵', 'Kenyan': '🇰🇪', 'Malaysian': '🇲🇾', 'Mexican': '🇲🇽', 'Moroccan': '🇲🇦',
    'Polish': '🇵🇱', 'Portuguese': '🇵🇹', 'Russian': '🇷🇺', 'Spanish': '🇪🇸', 'Thai': '🇹🇭',
    'Tunisian': '🇹🇳', 'Turkish': '🇹🇷', 'Vietnamese': '🇻🇳',
  };
  
  const hasActiveFilters = 
    filters.dietType !== 'All' ||
    filters.category !== 'All' ||
    filters.cuisine !== 'All' ||
    filters.calorieRange !== null ||
    filters.proteinRange !== null ||
    filters.cookingTime !== null ||
    filters.includeIngredients.length > 0 ||
    filters.excludeIngredients.length > 0;
  
  const activeFilterCount = [
    filters.dietType !== 'All',
    filters.category !== 'All',
    filters.cuisine !== 'All',
    filters.calorieRange !== null,
    filters.proteinRange !== null,
    filters.cookingTime !== null,
    filters.includeIngredients.length > 0,
    filters.excludeIngredients.length > 0,
  ].filter(Boolean).length;
  
  const handleApply = () => {
    search(true);
    setShowFilters(false);
  };
  
  const handleCancel = () => {
    setShowFilters(false);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-elevated z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-bold text-stone-800">Filters</h2>
            {activeFilterCount > 0 && (
              <p className="text-xs text-stone-500">{activeFilterCount} active</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>
      </div>
      
      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Diet Type */}
        <FilterSection title="Diet Type" icon={<Leaf className="w-4 h-4" />} defaultOpen>
          <div className="grid grid-cols-3 gap-2">
            {dietTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setFilter('dietType', type.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  filters.dietType === type.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-stone-100 hover:border-emerald-200 hover:bg-stone-50'
                }`}
              >
                <span className={filters.dietType === type.id ? 'text-emerald-600' : 'text-stone-400'}>
                  {type.icon}
                </span>
                <span className={`text-xs font-medium ${
                  filters.dietType === type.id ? 'text-emerald-700' : 'text-stone-600'
                }`}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </FilterSection>
        
        {/* Category */}
        <FilterSection title="Meal Category" icon={<UtensilsCrossed className="w-4 h-4" />}>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter('category', cat.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filters.category === cat.id
                    ? 'bg-emerald-500 text-white shadow-glow'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </FilterSection>
        
        {/* Cuisine */}
        <FilterSection title="Cuisine" icon={<Globe className="w-4 h-4" />}>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {CUISINES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter('cuisine', c)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                  filters.cuisine === c
                    ? 'bg-emerald-500 text-white'
                    : 'hover:bg-stone-100 text-stone-600'
                }`}
              >
                <span className="text-lg">{cuisineFlags[c]}</span>
                <span className="font-medium">{c}</span>
              </button>
            ))}
          </div>
        </FilterSection>
        
        {/* Calorie Range */}
        <FilterSection title="Calories" icon={<Flame className="w-4 h-4 text-orange-500" />}>
          <RangeSlider
            label="Calorie Range"
            min={0}
            max={1500}
            step={50}
            value={filters.calorieRange}
            onChange={(value) => setFilter('calorieRange', value)}
            unit=" kcal"
            icon={<Flame className="w-4 h-4 text-orange-500" />}
          />
        </FilterSection>
        
        {/* Protein Range */}
        <FilterSection title="Protein" icon={<Dumbbell className="w-4 h-4 text-emerald-500" />}>
          <RangeSlider
            label="Protein Range"
            min={0}
            max={100}
            step={5}
            value={filters.proteinRange}
            onChange={(value) => setFilter('proteinRange', value)}
            unit="g"
            icon={<Dumbbell className="w-4 h-4 text-emerald-500" />}
          />
        </FilterSection>
        
        {/* Cooking Time */}
        <FilterSection title="Cooking Time" icon={<Clock className="w-4 h-4 text-blue-500" />}>
          <RangeSlider
            label="Time Range"
            min={5}
            max={120}
            step={5}
            value={filters.cookingTime}
            onChange={(value) => setFilter('cookingTime', value)}
            unit=" min"
            icon={<Clock className="w-4 h-4 text-blue-500" />}
          />
        </FilterSection>
        
        {/* Include Ingredients */}
        <FilterSection title="Include Ingredients" icon={<Plus className="w-4 h-4 text-emerald-500" />}>
          <IngredientInput
            label="Must include"
            ingredients={filters.includeIngredients}
            onAdd={(ing) => setFilter('includeIngredients', [...filters.includeIngredients, ing])}
            onRemove={(ing) => setFilter('includeIngredients', filters.includeIngredients.filter(i => i !== ing))}
            placeholder="e.g., spinach, chicken"
            icon={<Plus className="w-4 h-4 text-emerald-500" />}
          />
        </FilterSection>
        
        {/* Exclude Ingredients */}
        <FilterSection title="Exclude Ingredients" icon={<X className="w-4 h-4 text-red-500" />}>
          <IngredientInput
            label="Must exclude"
            ingredients={filters.excludeIngredients}
            onAdd={(ing) => setFilter('excludeIngredients', [...filters.excludeIngredients, ing])}
            onRemove={(ing) => setFilter('excludeIngredients', filters.excludeIngredients.filter(i => i !== ing))}
            placeholder="e.g., nuts, gluten"
            icon={<X className="w-4 h-4 text-red-500" />}
          />
        </FilterSection>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-stone-100 bg-stone-50">
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 text-sm font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 shadow-glow transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Active Filter Badge Component
interface ActiveFilterBadgeProps {
  label: string;
  onRemove: () => void;
  color?: 'emerald' | 'orange' | 'blue' | 'purple';
}

export const ActiveFilterBadge: React.FC<ActiveFilterBadgeProps> = ({ 
  label, 
  onRemove, 
  color = 'emerald' 
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  
  return (
    <motion.span
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${colorClasses[color]}`}
    >
      {label}
      <button
        onClick={onRemove}
        className="hover:opacity-70 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.span>
  );
};

// Active Filters Bar Component
export const ActiveFiltersBar: React.FC = () => {
  const { filters, setFilter, clearFilters } = useSearchStore();
  
  const activeFilters: { key: string; label: string; onRemove: () => void; color: 'emerald' | 'orange' | 'blue' | 'purple' }[] = [];
  
  if (filters.dietType !== 'All') {
    activeFilters.push({
      key: 'diet',
      label: filters.dietType,
      onRemove: () => setFilter('dietType', 'All'),
      color: filters.dietType === 'Vegetarian' ? 'emerald' : 'orange',
    });
  }
  
  if (filters.category !== 'All') {
    activeFilters.push({
      key: 'category',
      label: filters.category,
      onRemove: () => setFilter('category', 'All'),
      color: 'purple',
    });
  }
  
  if (filters.cuisine !== 'All') {
    activeFilters.push({
      key: 'cuisine',
      label: filters.cuisine,
      onRemove: () => setFilter('cuisine', 'All'),
      color: 'blue',
    });
  }
  
  if (filters.calorieRange) {
    activeFilters.push({
      key: 'calories',
      label: `${filters.calorieRange.min}-${filters.calorieRange.max} kcal`,
      onRemove: () => setFilter('calorieRange', null),
      color: 'orange',
    });
  }
  
  if (filters.proteinRange) {
    activeFilters.push({
      key: 'protein',
      label: `${filters.proteinRange.min}-${filters.proteinRange.max}g protein`,
      onRemove: () => setFilter('proteinRange', null),
      color: 'emerald',
    });
  }
  
  if (filters.cookingTime) {
    activeFilters.push({
      key: 'time',
      label: `${filters.cookingTime.min}-${filters.cookingTime.max} min`,
      onRemove: () => setFilter('cookingTime', null),
      color: 'blue',
    });
  }
  
  filters.includeIngredients.forEach((ing) => {
    activeFilters.push({
      key: `include-${ing}`,
      label: `+${ing}`,
      onRemove: () => setFilter('includeIngredients', filters.includeIngredients.filter(i => i !== ing)),
      color: 'emerald',
    });
  });
  
  filters.excludeIngredients.forEach((ing) => {
    activeFilters.push({
      key: `exclude-${ing}`,
      label: `-${ing}`,
      onRemove: () => setFilter('excludeIngredients', filters.excludeIngredients.filter(i => i !== ing)),
      color: 'orange',
    });
  });
  
  if (activeFilters.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 py-3"
    >
      <span className="text-xs font-medium text-stone-500 mr-1">Active filters:</span>
      <AnimatePresence mode="popLayout">
        {activeFilters.map((filter) => (
          <ActiveFilterBadge
            key={filter.key}
            label={filter.label}
            onRemove={filter.onRemove}
            color={filter.color}
          />
        ))}
      </AnimatePresence>
      <button
        onClick={clearFilters}
        className="text-xs font-medium text-stone-400 hover:text-red-500 ml-2 transition-colors"
      >
        Clear all
      </button>
    </motion.div>
  );
};
