import React from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Heart, 
  Database, 
  AlertCircle, 
  Users,
  ChefHat,
  ShoppingBag,
  Bell,
  Star,
  Calendar,
  MessageCircle,
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Preset configurations for common empty states
export const EmptyStatePresets = {
  noResults: {
    icon: Search,
    title: 'No results found',
    description: 'We couldn\'t find any items matching your search. Try different keywords or filters.',
    gradient: 'from-orange-400 to-amber-500',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  noFavorites: {
    icon: Heart,
    title: 'No favorites yet',
    description: 'Start exploring meals and save your favorites by tapping the heart icon.',
    gradient: 'from-rose-400 to-pink-500',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
  },
  noData: {
    icon: Database,
    title: 'No data available',
    description: 'There\'s nothing here yet. Check back later or create something new.',
    gradient: 'from-stone-400 to-stone-500',
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-500',
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'We encountered an error while loading this content. Please try again.',
    gradient: 'from-red-400 to-orange-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  noFamily: {
    icon: Users,
    title: 'No family groups yet',
    description: 'Create a family group or join an existing one to start planning meals together.',
    gradient: 'from-emerald-400 to-teal-500',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  noMeals: {
    icon: ChefHat,
    title: 'No meals planned',
    description: 'Start building your meal plan by adding delicious recipes to your schedule.',
    gradient: 'from-violet-400 to-purple-500',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
  },
  noShoppingList: {
    icon: ShoppingBag,
    title: 'Your shopping list is empty',
    description: 'Add ingredients from meals to create your shopping list.',
    gradient: 'from-cyan-400 to-blue-500',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-500',
  },
  noNotifications: {
    icon: Bell,
    title: 'No notifications',
    description: 'You\'re all caught up! Check back later for updates.',
    gradient: 'from-amber-400 to-yellow-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  noReviews: {
    icon: Star,
    title: 'No reviews yet',
    description: 'Be the first to share your thoughts and help others discover great meals.',
    gradient: 'from-yellow-400 to-amber-500',
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-500',
  },
  noEvents: {
    icon: Calendar,
    title: 'No upcoming events',
    description: 'Schedule meal plans or family events to see them here.',
    gradient: 'from-indigo-400 to-blue-500',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
  },
  noMessages: {
    icon: MessageCircle,
    title: 'No messages yet',
    description: 'Start the conversation with your family members.',
    gradient: 'from-teal-400 to-cyan-500',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-500',
  },
} as const;

export type EmptyStatePreset = keyof typeof EmptyStatePresets;

// Action button configuration
interface ActionButton {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: LucideIcon;
}

// Empty state props
interface EmptyStateProps {
  // Use preset or custom configuration
  preset?: EmptyStatePreset;
  
  // Custom configuration (overrides preset)
  icon?: LucideIcon;
  title?: string;
  description?: string;
  gradient?: string;
  iconBg?: string;
  iconColor?: string;
  
  // Action buttons
  actions?: ActionButton[];
  primaryAction?: ActionButton;
  secondaryAction?: ActionButton;
  
  // Compact mode for inline empty states
  compact?: boolean;
  
  // Custom content
  children?: React.ReactNode;
  
  // Additional classes
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  preset,
  icon: customIcon,
  title: customTitle,
  description: customDescription,
  gradient: customGradient,
  iconBg: customIconBg,
  iconColor: customIconColor,
  actions,
  primaryAction,
  secondaryAction,
  compact = false,
  children,
  className = '',
}) => {
  // Get preset values or use defaults
  const presetConfig = preset ? EmptyStatePresets[preset] : null;
  
  const Icon = customIcon || presetConfig?.icon || Search;
  const title = customTitle || presetConfig?.title || 'No data';
  const description = customDescription || presetConfig?.description || '';
  const gradient = customGradient || presetConfig?.gradient || 'from-stone-400 to-stone-500';
  const iconBg = customIconBg || presetConfig?.iconBg || 'bg-stone-100';
  const iconColor = customIconColor || presetConfig?.iconColor || 'text-stone-500';

  // Build action buttons array
  const actionButtons: ActionButton[] = actions || [];
  if (primaryAction) actionButtons.unshift(primaryAction);
  if (secondaryAction) actionButtons.push(secondaryAction);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-4 p-4 rounded-xl bg-white/50 ${className}`}
      >
        <div className={`${iconBg} p-3 rounded-xl`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-stone-800">{title}</h4>
          <p className="text-sm text-stone-500">{description}</p>
        </div>
        {actionButtons.length > 0 && (
          <div className="flex gap-2">
            {actionButtons.slice(0, 1).map((action, i) => (
              <ActionButtonComponent key={i} action={action} size="sm" />
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
    >
      {/* Icon */}
      <div className="relative mb-6">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-full blur-xl opacity-30`} />
        <div className={`relative w-20 h-20 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center shadow-lg`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-stone-800 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-stone-500 max-w-sm mb-6">
        {description}
      </p>

      {/* Custom children */}
      {children}

      {/* Action Buttons */}
      {actionButtons.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          {actionButtons.map((action, i) => (
            <ActionButtonComponent key={i} action={action} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Action button component
const ActionButtonComponent: React.FC<{ 
  action: ActionButton;
  size?: 'sm' | 'md';
}> = ({ action, size = 'md' }) => {
  const { label, onClick, href, variant = 'primary', icon: ActionIcon } = action;

  const baseClasses = size === 'sm'
    ? 'px-4 py-2 text-sm font-medium rounded-lg'
    : 'px-6 py-3 text-sm font-semibold rounded-xl';

  const variantClasses = {
    primary: 'btn-vibrant text-white',
    secondary: 'bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors',
    outline: 'border-2 border-stone-200 text-stone-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors',
  };

  const content = (
    <>
      {ActionIcon && <ActionIcon className={`${size === 'sm' ? 'w-4 h-4' : 'w-4 h-4'}`} />}
      <span>{label}</span>
      {variant === 'primary' && !ActionIcon && <ArrowRight className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />}
    </>
  );

  const classes = `${baseClasses} ${variantClasses[variant]} flex items-center justify-center gap-2`;

  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={classes}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={classes}
    >
      {content}
    </motion.button>
  );
};

// Specialized empty state components for convenience
export const NoResultsEmptyState: React.FC<Omit<EmptyStateProps, 'preset' | 'icon' | 'title' | 'description'>> = (props) => (
  <EmptyState preset="noResults" {...props} />
);

export const NoFavoritesEmptyState: React.FC<Omit<EmptyStateProps, 'preset' | 'icon' | 'title' | 'description'>> = (props) => (
  <EmptyState preset="noFavorites" {...props} />
);

export const NoDataEmptyState: React.FC<Omit<EmptyStateProps, 'preset' | 'icon' | 'title' | 'description'>> = (props) => (
  <EmptyState preset="noData" {...props} />
);

export const ErrorEmptyState: React.FC<Omit<EmptyStateProps, 'preset' | 'icon' | 'title' | 'description'> & { 
  onRetry?: () => void;
}> = ({ onRetry, ...props }) => (
  <EmptyState 
    preset="error" 
    {...props}
    primaryAction={onRetry ? {
      label: 'Try Again',
      onClick: onRetry,
      icon: RefreshCw,
      variant: 'primary',
    } : undefined}
  />
);

export const NoFamilyEmptyState: React.FC<Omit<EmptyStateProps, 'preset' | 'icon' | 'title' | 'description'> & {
  onCreate?: () => void;
  onJoin?: () => void;
}> = ({ onCreate, onJoin, ...props }) => (
  <EmptyState 
    preset="noFamily" 
    {...props}
    primaryAction={onCreate ? {
      label: 'Create Family',
      onClick: onCreate,
      icon: Plus,
      variant: 'primary',
    } : undefined}
    secondaryAction={onJoin ? {
      label: 'Join Family',
      onClick: onJoin,
      variant: 'outline',
    } : undefined}
  />
);

export const NoMealsEmptyState: React.FC<Omit<EmptyStateProps, 'preset' | 'icon' | 'title' | 'description'> & {
  onExplore?: () => void;
}> = ({ onExplore, ...props }) => (
  <EmptyState 
    preset="noMeals" 
    {...props}
    primaryAction={onExplore ? {
      label: 'Explore Meals',
      onClick: onExplore,
      icon: ChefHat,
      variant: 'primary',
    } : undefined}
  />
);

export const NoShoppingListEmptyState: React.FC<Omit<EmptyStateProps, 'preset' | 'icon' | 'title' | 'description'> & {
  onBrowse?: () => void;
}> = ({ onBrowse, ...props }) => (
  <EmptyState 
    preset="noShoppingList" 
    {...props}
    primaryAction={onBrowse ? {
      label: 'Browse Meals',
      onClick: onBrowse,
      icon: ChefHat,
      variant: 'primary',
    } : undefined}
  />
);

export const NoNotificationsEmptyState: React.FC<Omit<EmptyStateProps, 'preset' | 'icon' | 'title' | 'description'>> = (props) => (
  <EmptyState preset="noNotifications" {...props} />
);

export const NoReviewsEmptyState: React.FC<Omit<EmptyStateProps, 'preset' | 'icon' | 'title' | 'description'> & {
  onWriteReview?: () => void;
}> = ({ onWriteReview, ...props }) => (
  <EmptyState 
    preset="noReviews" 
    {...props}
    primaryAction={onWriteReview ? {
      label: 'Write a Review',
      onClick: onWriteReview,
      icon: Star,
      variant: 'primary',
    } : undefined}
  />
);

export default EmptyState;
