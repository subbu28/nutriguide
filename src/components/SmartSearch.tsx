import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  SlidersHorizontal,
  Clock,
  TrendingUp,
  History,
  Sparkles,
  ChefHat,
  Globe,
  Flame,
  Dumbbell,
  Leaf,
  Beef,
  ArrowRight,
  Loader2,
  ChevronDown,
  UtensilsCrossed,
} from 'lucide-react';
import { useSearchStore } from '../stores/searchStore';
import { SearchFilters, ActiveFiltersBar } from './SearchFilters';
import { MealCard } from './MealCard';
import type { MealItem } from '../types';
import type { RecentSearch } from '../types/search';

// Highlight matching text component
interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
}

const HighlightText: React.FC<HighlightTextProps> = ({ text, query, className = '' }) => {
  if (!query.trim()) return <span className={className}>{text}</span>;
  
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  
  return (
    <span className={className}>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-amber-200 text-amber-900 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

// Recent Search Item Component
interface RecentSearchItemProps {
  search: RecentSearch;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
}

const RecentSearchItem: React.FC<RecentSearchItemProps> = ({ search, onClick, onRemove }) => {
  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  const hasFilters = 
    search.filters.dietType !== 'All' ||
    search.filters.category !== 'All' ||
    search.filters.cuisine !== 'All';
  
  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 group transition-colors text-left"
    >
      <div className="p-2 bg-stone-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
        <History className="w-4 h-4 text-stone-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-700 truncate">{search.query}</p>
        <p className="text-xs text-stone-400 flex items-center gap-2">
          {timeAgo(search.timestamp)}
          {hasFilters && (
            <span className="flex items-center gap-1 text-emerald-600">
              <SlidersHorizontal className="w-3 h-3" />
              Filters
            </span>
          )}
        </p>
      </div>
      <button
        onClick={onRemove}
        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
      >
        <X className="w-4 h-4 text-stone-400 hover:text-red-500" />
      </button>
    </motion.button>
  );
};

// Search Suggestion Item Component
interface SuggestionItemProps {
  suggestion: string;
  query: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ suggestion, query, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 group transition-colors text-left"
    >
      <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
        {icon || <Search className="w-4 h-4 text-emerald-500" />}
      </div>
      <div className="flex-1">
        <HighlightText text={suggestion} query={query} className="font-medium text-stone-700" />
      </div>
      <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-500 transition-colors" />
    </button>
  );
};

// Empty State Component
const EmptyState: React.FC<{ query: string; onClear: () => void }> = ({ query, onClear }) => {
  const suggestions = [
    { icon: <Leaf className="w-5 h-5 text-emerald-500" />, text: 'Try searching for "vegetarian pasta"' },
    { icon: <Flame className="w-5 h-5 text-orange-500" />, text: 'Search by calories: "under 500 kcal"' },
    { icon: <Globe className="w-5 h-5 text-blue-500" />, text: 'Explore cuisines: "Italian" or "Indian"' },
    { icon: <Clock className="w-5 h-5 text-purple-500" />, text: 'Quick meals: "30 minute dinner"' },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 gradient-sunset rounded-full blur-xl opacity-30" />
        <div className="relative w-24 h-24 gradient-warm rounded-full flex items-center justify-center">
          <Search className="w-12 h-12 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">No recipes found</h3>
      <p className="text-stone-500 max-w-sm mb-8">
        We couldn't find any meals matching "<span className="font-semibold text-stone-700">{query}</span>". 
        Try adjusting your search or filters.
      </p>
      
      <div className="w-full max-w-md">
        <p className="text-sm font-semibold text-stone-600 mb-4">Try these suggestions:</p>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onClear()}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-stone-100 hover:border-emerald-200 hover:shadow-soft transition-all"
            >
              <div className="p-2 bg-stone-50 rounded-lg">{s.icon}</div>
              <span className="text-sm text-stone-600">{s.text}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Loading Skeleton Component
const SearchSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="recipe-card glass rounded-2xl overflow-hidden">
          <div className="h-52 skeleton" />
          <div className="p-5 space-y-3">
            <div className="h-4 skeleton rounded w-3/4" />
            <div className="h-3 skeleton rounded w-full" />
            <div className="h-3 skeleton rounded w-2/3" />
            <div className="flex gap-2 pt-2">
              <div className="h-8 skeleton rounded-lg flex-1" />
              <div className="h-8 skeleton rounded-lg flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Infinite Scroll Loader
const InfiniteScrollLoader: React.FC<{ hasMore: boolean; loading: boolean; onLoadMore: () => void }> = ({ 
  hasMore, 
  loading, 
  onLoadMore 
}) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);
  
  if (!hasMore) return null;
  
  return (
    <div ref={loaderRef} className="flex justify-center py-8">
      {loading ? (
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
          <span className="text-sm text-stone-500">Loading more recipes...</span>
        </div>
      ) : (
        <div className="h-10" />
      )}
    </div>
  );
};

// Main SmartSearch Component
interface SmartSearchProps {
  syncWithStore?: boolean;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({ syncWithStore = false }) => {
  const {
    query,
    filters,
    results,
    loading,
    hasMore,
    totalResults,
    isExpanded,
    showFilters,
    suggestions,
    recentSearches,
    setQuery,
    setExpanded,
    setShowFilters,
    search,
    loadMore,
    loadRecentSearches,
    removeRecentSearch,
  } = useSearchStore();
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, [loadRecentSearches]);
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setShowRecentSearches(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle search submission
  const handleSearch = useCallback((searchQuery: string = query) => {
    setQuery(searchQuery);
    setShowSuggestions(false);
    setShowRecentSearches(false);
    search(true);
  }, [query, setQuery, search]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowRecentSearches(false);
    setShowSuggestions(value.length >= 2);
  };
  
  // Handle input focus
  const handleInputFocus = () => {
    setExpanded(true);
    if (query.length >= 2) {
      setShowSuggestions(true);
    } else if (recentSearches.length > 0 && !query) {
      setShowRecentSearches(true);
    }
  };
  
  // Handle recent search click
  const handleRecentSearchClick = (recent: RecentSearch) => {
    setQuery(recent.query);
    if (recent.filters) {
      Object.entries(recent.filters).forEach(([key, value]) => {
        if (value !== undefined) {
          useSearchStore.getState().setFilter(key as keyof typeof filters, value);
        }
      });
    }
    handleSearch(recent.query);
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    const cleanSuggestion = suggestion.replace(/^Recipes with\s+/i, '');
    setQuery(cleanSuggestion);
    handleSearch(cleanSuggestion);
  };
  
  // Clear search
  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    useSearchStore.getState().resetFilters();
    inputRef.current?.focus();
  };
  
  // Check if any search has been performed
  const hasSearched = results.length > 0 || loading || (query && !loading && results.length === 0);
  
  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Bar */}
      <div className={`relative transition-all duration-300 ${isExpanded ? 'z-50' : 'z-10'}`}>
        <div className={`absolute inset-0 gradient-aurora opacity-20 blur-xl rounded-3xl transition-opacity duration-500 ${isExpanded ? 'opacity-40' : ''}`} />
        
        <div className="relative flex items-center gap-2">
          {/* Main Search Input */}
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className={`w-5 h-5 transition-colors duration-300 ${isExpanded ? 'text-emerald-500' : 'text-stone-400'}`} />
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search meals, ingredients, or cuisines..."
              className="w-full pl-12 pr-24 py-4 glass rounded-2xl text-sm font-medium placeholder:text-stone-400 input-focus border-2 border-transparent"
            />
            
            {/* Right Actions */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <button
                  onClick={handleClear}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                >
                  <X className="w-4 h-4 text-stone-400 group-hover:text-red-500" />
                </button>
              )}
              
              <button
                onClick={() => setShowFilters(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  Object.values(filters).some(v => 
                    v !== 'All' && v !== '' && 
                    !(Array.isArray(v) && v.length === 0) &&
                    v !== null
                  )
                    ? 'bg-emerald-500 text-white shadow-glow'
                    : 'hover:bg-stone-100 text-stone-500'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Suggestions & Recent Searches Dropdown */}
        <AnimatePresence>
          {(showSuggestions || showRecentSearches) && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl shadow-elevated overflow-hidden z-50"
            >
              {showSuggestions && suggestions.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Suggestions
                  </div>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, i) => (
                      <SuggestionItem
                        key={i}
                        suggestion={suggestion}
                        query={query}
                        icon={suggestion.startsWith('Recipes with') ? <ChefHat className="w-4 h-4 text-emerald-500" /> : undefined}
                        onClick={() => handleSuggestionClick(suggestion)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {showRecentSearches && recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                      <History className="w-3 h-3" />
                      Recent Searches
                    </div>
                    <button
                      onClick={() => useSearchStore.getState().clearRecentSearches()}
                      className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    <AnimatePresence>
                      {recentSearches.map((search) => (
                        <RecentSearchItem
                          key={search.id}
                          search={search}
                          onClick={() => handleRecentSearchClick(search)}
                          onRemove={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(search.id);
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              
              {/* Quick Filters */}
              <div className="border-t border-stone-100 p-3">
                <p className="text-xs font-semibold text-stone-400 mb-2">Quick filters:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      useSearchStore.getState().setFilter('dietType', 'Vegetarian');
                      handleSearch();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium hover:bg-emerald-100 transition-colors"
                  >
                    <Leaf className="w-3 h-3" />
                    Vegetarian
                  </button>
                  <button
                    onClick={() => {
                      useSearchStore.getState().setFilter('category', 'Breakfast');
                      handleSearch();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-100 transition-colors"
                  >
                    <UtensilsCrossed className="w-3 h-3" />
                    Breakfast
                  </button>
                  <button
                    onClick={() => {
                      useSearchStore.getState().setFilter('calorieRange', { min: 0, max: 500 });
                      handleSearch();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    <Flame className="w-3 h-3" />
                    Under 500 kcal
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Active Filters Bar */}
      <ActiveFiltersBar />
      
      {/* Search Results */}
      <AnimatePresence mode="wait">
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-stone-800">
                  {loading && results.length === 0 ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      Searching...
                    </span>
                  ) : (
                    <>
                      <span className="text-emerald-600">{totalResults}</span> recipes found
                    </>
                  )}
                </h2>
                {query && (
                  <p className="text-sm text-stone-500">
                    for "<span className="font-medium text-stone-700">{query}</span>"
                  </p>
                )}
              </div>
              
              {!loading && results.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>Sorted by relevance</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              )}
            </div>
            
            {/* Results Grid or Empty State */}
            {loading && results.length === 0 ? (
              <SearchSkeleton />
            ) : results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.map((meal, idx) => (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.4 }}
                    >
                      <MealCard meal={meal} allMeals={results} />
                    </motion.div>
                  ))}
                </div>
                
                <InfiniteScrollLoader
                  hasMore={hasMore}
                  loading={loading}
                  onLoadMore={loadMore}
                />
              </>
            ) : (
              <EmptyState query={query} onClear={handleClear} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setShowFilters(false)}
            />
            <SearchFilters />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Compact Smart Search for Header Integration
export const CompactSmartSearch: React.FC = () => {
  const { query, setQuery, setExpanded, search } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(query);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(localQuery);
    search(true);
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <Search className="w-4 h-4 text-stone-400" />
      </div>
      <input
        type="text"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        onFocus={() => setExpanded(true)}
        placeholder="Search recipes..."
        className="w-full pl-9 pr-4 py-2 glass rounded-xl text-sm placeholder:text-stone-400 input-focus"
      />
      {localQuery && (
        <button
          type="button"
          onClick={() => setLocalQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="w-4 h-4 text-stone-400 hover:text-stone-600" />
        </button>
      )}
    </form>
  );
};

export default SmartSearch;
