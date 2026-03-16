import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

// Base Skeleton component with pulse animation
interface SkeletonProps {
  className?: string;
  variant?: 'pulse' | 'shimmer' | 'wave';
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'pulse' 
}) => {
  const baseClasses = 'bg-stone-200 rounded-lg';
  
  const variantClasses = {
    pulse: 'animate-pulse',
    shimmer: 'skeleton',
    wave: 'animate-pulse bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]',
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};

// Full page loader with animated spinner
interface PageLoaderProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Loading...', 
  subMessage,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[400px] flex flex-col items-center justify-center gap-6 p-6"
    >
      <div className="relative">
        <div className="absolute inset-0 gradient-aurora rounded-full blur-xl opacity-50 animate-pulse" />
        <div className={`relative ${sizeClasses[size]} gradient-primary rounded-full flex items-center justify-center shadow-glow`}>
          <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-stone-700">
          {message}
        </p>
        {subMessage && (
          <p className="text-sm text-stone-500 mt-1">
            {subMessage}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Card skeleton for meal cards
interface CardSkeletonProps {
  count?: number;
  layout?: 'grid' | 'list';
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  count = 1,
  layout = 'grid'
}) => {
  const containerClass = layout === 'grid' 
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    : 'space-y-4';

  return (
    <div className={containerClass}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-2xl overflow-hidden shadow-soft"
        >
          {/* Image placeholder */}
          <Skeleton className="w-full h-52 rounded-none" />
          
          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Title */}
            <Skeleton className="h-6 w-3/4" />
            
            {/* Rating */}
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="w-4 h-4 rounded-full" />
              ))}
            </div>
            
            {/* Description lines */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            
            {/* Nutrition badges */}
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// List skeleton for generic lists
interface ListSkeletonProps {
  count?: number;
  itemHeight?: string;
  showAvatar?: boolean;
  showAction?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  count = 3,
  itemHeight = 'h-16',
  showAvatar = true,
  showAction = true
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`glass rounded-xl ${itemHeight} flex items-center gap-4 px-4`}
        >
          {showAvatar && (
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {showAction && (
            <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Chart skeleton for analytics
interface ChartSkeletonProps {
  type?: 'bar' | 'line' | 'pie' | 'donut';
  height?: string;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ 
  type = 'bar',
  height = 'h-64'
}) => {
  if (type === 'pie' || type === 'donut') {
    return (
      <div className={`glass rounded-2xl p-6 ${height} flex items-center justify-center`}>
        <div className="relative">
          <Skeleton className="w-40 h-40 rounded-full" />
          {type === 'donut' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`glass rounded-2xl p-6 ${height}`}>
      <div className="h-full flex items-end justify-between gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full rounded-t-lg"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
    </div>
  );
};

// Text skeleton for text blocks
interface TextSkeletonProps {
  lines?: number;
  lineHeight?: string;
  lastLineWidth?: string;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({ 
  lines = 3,
  lineHeight = 'h-4',
  lastLineWidth = 'w-2/3'
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`${lineHeight} ${i === lines - 1 ? lastLineWidth : 'w-full'}`}
        />
      ))}
    </div>
  );
};

// Image skeleton with aspect ratio
interface ImageSkeletonProps {
  aspectRatio?: 'square' | 'video' | 'wide' | 'portrait' | 'auto';
  className?: string;
  showOverlay?: boolean;
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ 
  aspectRatio = 'video',
  className = '',
  showOverlay = true
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-stone-100 ${aspectClasses[aspectRatio]} ${className}`}>
      <Skeleton className="absolute inset-0 rounded-none" variant="shimmer" />
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-stone-200/50 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-stone-300/50" />
          </div>
        </div>
      )}
    </div>
  );
};

// Stats skeleton for statistics cards
interface StatsSkeletonProps {
  count?: number;
  layout?: 'grid' | 'row';
}

export const StatsSkeleton: React.FC<StatsSkeletonProps> = ({ 
  count = 4,
  layout = 'grid'
}) => {
  const containerClass = layout === 'grid'
    ? 'grid grid-cols-2 md:grid-cols-4 gap-4'
    : 'flex flex-wrap gap-4';

  return (
    <div className={containerClass}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="glass rounded-xl p-4 text-center"
        >
          <Skeleton className="w-10 h-10 rounded-xl mx-auto mb-2" />
          <Skeleton className="h-8 w-16 mx-auto mb-1" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </motion.div>
      ))}
    </div>
  );
};

// Table skeleton
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5,
  columns = 4,
  showHeader = true
}) => {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      {showHeader && (
        <div className="flex gap-4 p-4 border-b border-stone-200 bg-stone-50/50">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-5 flex-1" />
          ))}
        </div>
      )}
      <div className="divide-y divide-stone-100">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 p-4 items-center">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div key={colIdx} className="flex-1">
                {colIdx === 0 ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-full" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Profile skeleton
interface ProfileSkeletonProps {
  showStats?: boolean;
  showActions?: boolean;
}

export const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({ 
  showStats = true,
  showActions = true
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Skeleton className="w-28 h-28 rounded-full" />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-32" />
          </div>
          {showActions && (
            <Skeleton className="h-10 w-32 rounded-xl" />
          )}
        </div>
      </div>

      {/* Stats */}
      {showStats && <StatsSkeleton count={4} />}

      {/* Content sections */}
      <div className="glass rounded-2xl p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Button skeleton
interface ButtonSkeletonProps {
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ButtonSkeleton: React.FC<ButtonSkeletonProps> = ({ 
  count = 1,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-24',
    md: 'h-10 w-32',
    lg: 'h-12 w-40',
  };

  return (
    <div className="flex gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${sizeClasses[size]} rounded-xl`} />
      ))}
    </div>
  );
};

// Combined export for convenience
export const LoadingStates = {
  Skeleton,
  PageLoader,
  CardSkeleton,
  ListSkeleton,
  ChartSkeleton,
  TextSkeleton,
  ImageSkeleton,
  StatsSkeleton,
  TableSkeleton,
  ProfileSkeleton,
  ButtonSkeleton,
};

export default LoadingStates;
