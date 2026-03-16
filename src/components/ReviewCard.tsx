import React, { useState } from 'react';
import { Star, ThumbsUp, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Review } from '../types/reviews';

interface ReviewCardProps {
  review: Review;
  onMarkHelpful?: (reviewId: string) => void;
  isAuthenticated?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onMarkHelpful,
  isAuthenticated = false,
}) => {
  const [isHelpfulAnimating, setIsHelpfulAnimating] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const handleMarkHelpful = () => {
    if (!isAuthenticated || review.isHelpful) return;
    
    setIsHelpfulAnimating(true);
    onMarkHelpful?.(review.id);
    
    setTimeout(() => setIsHelpfulAnimating(false), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-stone-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header: Avatar, Name, Date, Rating */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {review.user.avatar ? (
            <img
              src={review.user.avatar}
              alt={review.user.name}
              className="w-10 h-10 rounded-full object-cover border border-stone-200"
            />
          ) : (
            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-stone-400" />
            </div>
          )}

          {/* Name and Date */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-800">
                {review.user.name}
              </span>
              {review.isVerified && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <span className="text-[11px] text-stone-400">
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                i < review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-stone-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Review Text */}
      <p className="text-sm text-stone-600 leading-relaxed mb-4">
        {review.text}
      </p>

      {/* Footer: Helpful Button */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-50">
        <motion.button
          onClick={handleMarkHelpful}
          disabled={!isAuthenticated || review.isHelpful}
          whileTap={isAuthenticated && !review.isHelpful ? { scale: 0.95 } : undefined}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            review.isHelpful
              ? 'text-emerald-600'
              : isAuthenticated
              ? 'text-stone-500 hover:text-emerald-600'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          <motion.div
            animate={isHelpfulAnimating ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <ThumbsUp
              className={`w-4 h-4 ${review.isHelpful ? 'fill-emerald-500 text-emerald-500' : ''}`}
            />
          </motion.div>
          <span>
            Helpful {review.helpful > 0 && `(${review.helpful})`}
          </span>
        </motion.button>

        {review.isHelpful && (
          <span className="text-[10px] text-emerald-600 font-medium">
            You found this helpful
          </span>
        )}
      </div>
    </motion.div>
  );
};
