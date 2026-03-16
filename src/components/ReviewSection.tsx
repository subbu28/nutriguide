import React, { useState, useEffect, useCallback } from 'react';
import { Star, ChevronDown, MessageSquare, Loader2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { useReviewsStore } from '../stores/reviewsStore';
import { useAuthStore } from '../stores/authStore';
import type { ReviewSortOption } from '../types/reviews';

interface ReviewSectionProps {
  mealId: string;
}

const sortOptions: { value: ReviewSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'most_helpful', label: 'Most Helpful' },
];

export const ReviewSection: React.FC<ReviewSectionProps> = ({ mealId }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = React.useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuthStore();
  const {
    reviews,
    averageRating,
    totalReviews,
    distribution,
    isLoading,
    isSubmitting,
    hasMore,
    currentSort,
    fetchReviews,
    submitReview,
    markHelpful,
    setSort,
    loadMore,
  } = useReviewsStore();

  // Fetch reviews on mount and when mealId changes
  useEffect(() => {
    if (mealId) {
      fetchReviews(mealId, 'newest', 1, false);
    }
    
    return () => {
      // Reset when unmounting
      useReviewsStore.getState().reset();
    };
  }, [mealId, fetchReviews]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmitReview = useCallback(async (rating: number, text: string) => {
    await submitReview(mealId, rating, text);
    setIsFormOpen(false);
  }, [mealId, submitReview]);

  const handleSortChange = (sort: ReviewSortOption) => {
    setSort(sort);
    setShowSortDropdown(false);
  };

  // Calculate rating percentages
  const getRatingPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="mt-8 pt-8 border-t border-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-stone-400" />
          <h3 className="text-lg font-bold text-stone-800">
            Reviews
            {totalReviews > 0 && (
              <span className="ml-2 text-sm font-normal text-stone-500">
                ({totalReviews})
              </span>
            )}
          </h3>
        </div>
        
        {isAuthenticated && !isFormOpen && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
          >
            Write a Review
          </motion.button>
        )}
      </div>

      {/* Rating Summary */}
      {totalReviews > 0 && (
        <div className="bg-stone-50 rounded-xl p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Average Rating */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-stone-800">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(averageRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-stone-600 w-3">
                    {stars}
                  </span>
                  <Star className="w-3 h-3 text-stone-400" />
                  <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getRatingPercentage(distribution[stars as keyof typeof distribution])}%` }}
                      transition={{ duration: 0.5, delay: 0.1 * (5 - stars) }}
                      className={`h-full rounded-full ${
                        stars >= 4
                          ? 'bg-emerald-500'
                          : stars === 3
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-stone-400 w-8 text-right">
                    {distribution[stars as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <ReviewForm
              onSubmit={handleSubmitReview}
              isSubmitting={isSubmitting}
            />
            <button
              onClick={() => setIsFormOpen(false)}
              className="mt-3 text-xs font-medium text-stone-500 hover:text-stone-700"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Options */}
      {totalReviews > 0 && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-stone-600">
            {isLoading && reviews.length === 0
              ? 'Loading reviews...'
              : `${reviews.length} of ${totalReviews} reviews`}
          </span>

          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:border-emerald-500 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              {sortOptions.find((o) => o.value === currentSort)?.label}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSortDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-1 w-44 bg-white border border-stone-200 rounded-lg shadow-lg z-10 overflow-hidden"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        currentSort === option.value
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading && reviews.length === 0 ? (
          // Loading Skeleton
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-stone-100 rounded-xl p-4 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-stone-200 rounded-full" />
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-stone-200 rounded" />
                  <div className="w-16 h-2 bg-stone-200 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-stone-200 rounded" />
                <div className="w-3/4 h-3 bg-stone-200 rounded" />
              </div>
            </div>
          ))
        ) : reviews.length === 0 ? (
          // Empty State
          <div className="text-center py-10">
            <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-500">
              No reviews yet
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          // Reviews
          <>
            <AnimatePresence mode="popLayout">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onMarkHelpful={markHelpful}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </AnimatePresence>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-white border border-stone-200 text-stone-600 text-sm font-medium rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    'Load More Reviews'
                  )}
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
