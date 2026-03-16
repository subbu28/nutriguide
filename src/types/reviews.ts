export interface Review {
  id: string;
  userId: string;
  user: { 
    name: string; 
    avatar?: string;
  };
  mealId: string;
  rating: number;
  text: string;
  helpful: number;
  createdAt: string;
  isVerified: boolean;
  isHelpful?: boolean; // Whether current user marked this as helpful
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export type ReviewSortOption = 'newest' | 'highest' | 'lowest' | 'most_helpful';

export interface ReviewsResponse {
  reviews: Review[];
  summary: ReviewSummary;
  hasMore: boolean;
  page: number;
}
