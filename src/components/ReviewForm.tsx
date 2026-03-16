import React, { useState } from 'react';
import { Star, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewFormProps {
  onSubmit: (rating: number, text: string) => Promise<void>;
  isSubmitting?: boolean;
  maxLength?: number;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  onSubmit,
  isSubmitting = false,
  maxLength = 1000,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }

    if (text.trim().length < 3) {
      setError('Review must be at least 3 characters long');
      return;
    }

    try {
      await onSubmit(rating, text.trim());
      // Reset form on success
      setRating(0);
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  const remainingChars = maxLength - text.length;
  const isOverLimit = remainingChars < 0;

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="bg-stone-50 rounded-xl p-5 space-y-4 overflow-hidden"
    >
      <h4 className="text-sm font-bold text-stone-800">Write a Review</h4>

      {/* Star Rating Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-500">
          Your Rating *
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`w-7 h-7 transition-colors duration-150 ${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-stone-300'
                }`}
              />
            </motion.button>
          ))}
          <span className="ml-2 text-sm font-medium text-stone-600">
            {rating > 0 && (
              <>
                {rating === 5 && 'Excellent!'}
                {rating === 4 && 'Very Good'}
                {rating === 3 && 'Good'}
                {rating === 2 && 'Fair'}
                {rating === 1 && 'Poor'}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Review Text */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-stone-500">
          Your Review *
        </label>
        <div
          className={`relative rounded-lg transition-shadow ${
            isFocused ? 'ring-2 ring-emerald-500 ring-offset-0' : ''
          }`}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Share your experience with this meal..."
            maxLength={maxLength}
            rows={4}
            className={`w-full px-4 py-3 text-sm bg-white border rounded-lg focus:outline-none resize-none transition-colors ${
              isOverLimit
                ? 'border-red-300 focus:border-red-500'
                : 'border-stone-200 focus:border-emerald-500'
            }`}
          />
          <div className="absolute bottom-2 right-2 text-[10px] text-stone-400">
            {text.length}/{maxLength}
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs font-medium text-red-500 bg-red-50 px-3 py-2 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting || isOverLimit || rating === 0 || text.trim().length < 3}
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
          isSubmitting || isOverLimit || rating === 0 || text.trim().length < 3
            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
            : 'bg-stone-900 text-white hover:bg-stone-800 shadow-md hover:shadow-lg'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Submit Review
          </>
        )}
      </motion.button>
    </motion.form>
  );
};
