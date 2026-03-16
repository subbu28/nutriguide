import { create } from 'zustand';
import { api } from '../lib/api';
import type { Review, ReviewSummary, ReviewSortOption } from '../types/reviews';

interface ReviewsState {
  // State
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  distribution: ReviewSummary['distribution'];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  currentMealId: string | null;
  currentSort: ReviewSortOption;

  // Actions
  fetchReviews: (mealId: string, sort?: ReviewSortOption, page?: number, append?: boolean) => Promise<void>;
  submitReview: (mealId: string, rating: number, text: string) => Promise<void>;
  markHelpful: (reviewId: string) => Promise<void>;
  setSort: (sort: ReviewSortOption) => void;
  loadMore: () => Promise<void>;
  reset: () => void;
}

const initialDistribution = {
  5: 0,
  4: 0,
  3: 0,
  2: 0,
  1: 0,
};

export const useReviewsStore = create<ReviewsState>((set, get) => ({
  // Initial state
  reviews: [],
  averageRating: 0,
  totalReviews: 0,
  distribution: { ...initialDistribution },
  isLoading: false,
  isSubmitting: false,
  error: null,
  currentPage: 1,
  hasMore: false,
  currentMealId: null,
  currentSort: 'newest',

  // Fetch reviews for a meal
  fetchReviews: async (mealId: string, sort: ReviewSortOption = 'newest', page: number = 1, append: boolean = false) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.getReviews(mealId, sort, page);
      
      set((state) => ({
        reviews: append ? [...state.reviews, ...response.reviews] : response.reviews,
        averageRating: response.summary.averageRating,
        totalReviews: response.summary.totalReviews,
        distribution: response.summary.distribution,
        hasMore: response.hasMore,
        currentPage: response.page,
        currentMealId: mealId,
        currentSort: sort,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch reviews',
        isLoading: false 
      });
    }
  },

  // Submit a new review
  submitReview: async (mealId: string, rating: number, text: string) => {
    set({ isSubmitting: true, error: null });
    
    try {
      const { review, summary } = await api.submitReview(mealId, rating, text);
      
      set((state) => ({
        reviews: [review, ...state.reviews],
        averageRating: summary.averageRating,
        totalReviews: summary.totalReviews,
        distribution: summary.distribution,
        isSubmitting: false,
      }));
    } catch (error) {
      console.error('Failed to submit review:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to submit review',
        isSubmitting: false 
      });
      throw error;
    }
  },

  // Mark a review as helpful
  markHelpful: async (reviewId: string) => {
    try {
      const { helpful, isHelpful } = await api.markReviewHelpful(reviewId);
      
      set((state) => ({
        reviews: state.reviews.map((review) =>
          review.id === reviewId
            ? { ...review, helpful, isHelpful }
            : review
        ),
      }));
    } catch (error) {
      console.error('Failed to mark review as helpful:', error);
      // Don't set global error for this action
    }
  },

  // Change sort order
  setSort: (sort: ReviewSortOption) => {
    const { currentMealId } = get();
    if (currentMealId) {
      get().fetchReviews(currentMealId, sort, 1, false);
    }
  },

  // Load more reviews (pagination)
  loadMore: async () => {
    const { currentMealId, currentSort, currentPage, hasMore, isLoading } = get();
    
    if (!currentMealId || !hasMore || isLoading) return;
    
    await get().fetchReviews(currentMealId, currentSort, currentPage + 1, true);
  },

  // Reset state
  reset: () => {
    set({
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      distribution: { ...initialDistribution },
      isLoading: false,
      isSubmitting: false,
      error: null,
      currentPage: 1,
      hasMore: false,
      currentMealId: null,
      currentSort: 'newest',
    });
  },
}));
