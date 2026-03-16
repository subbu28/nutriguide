import { useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Check,
  CheckCheck,
  Vote,
  Users,
  MessageCircle,
  Utensils,
  ArrowLeft,
  Loader2,
  Inbox,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useNotificationStore } from '../stores/notificationStore';
import { useAuthStore } from '../stores/authStore';
import type { Notification } from '../types';

type NotificationType = 
  | 'POLL_CREATED' 
  | 'POLL_ENDING' 
  | 'POLL_RESULT' 
  | 'FAMILY_INVITE' 
  | 'NEW_MESSAGE' 
  | 'MEAL_SUGGESTION' 
  | string;

interface NotificationConfig {
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  label: string;
}

const notificationConfig: Record<string, NotificationConfig> = {
  POLL_CREATED: {
    icon: Vote,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-500',
    label: 'New Poll',
  },
  POLL_ENDING: {
    icon: Clock,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-500',
    label: 'Poll Ending',
  },
  POLL_RESULT: {
    icon: Check,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    label: 'Poll Results',
  },
  FAMILY_INVITE: {
    icon: Users,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    label: 'Family Invite',
  },
  NEW_MESSAGE: {
    icon: MessageCircle,
    bgColor: 'bg-cyan-50',
    iconColor: 'text-cyan-500',
    label: 'New Message',
  },
  MEAL_SUGGESTION: {
    icon: Utensils,
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-500',
    label: 'Meal Suggestion',
  },
};

const getNotificationConfig = (type: NotificationType): NotificationConfig => {
  return notificationConfig[type] || {
    icon: Bell,
    bgColor: 'bg-stone-100',
    iconColor: 'text-stone-500',
    label: 'Notification',
  };
};

const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isYesterday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

interface GroupedNotifications {
  today: Notification[];
  yesterday: Notification[];
  earlier: Notification[];
}

const groupNotificationsByDate = (notifications: Notification[]): GroupedNotifications => {
  return notifications.reduce(
    (acc, notification) => {
      if (isToday(notification.createdAt)) {
        acc.today.push(notification);
      } else if (isYesterday(notification.createdAt)) {
        acc.yesterday.push(notification);
      } else {
        acc.earlier.push(notification);
      }
      return acc;
    },
    { today: [], yesterday: [], earlier: [] } as GroupedNotifications
  );
};

const NotificationSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/50">
        <div className="w-12 h-12 rounded-xl skeleton flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 skeleton rounded" />
          <div className="h-3 w-1/2 skeleton rounded" />
        </div>
        <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
      <Inbox className="w-10 h-10 text-stone-300" />
    </div>
    <h3 className="text-xl font-bold text-stone-800 mb-2">No notifications yet</h3>
    <p className="text-stone-500 max-w-xs">
      When you get notifications about polls, messages, or family updates, they'll appear here.
    </p>
    <Link
      to="/"
      className="mt-6 px-6 py-3 gradient-primary text-white rounded-xl font-medium hover:shadow-lg transition-all"
    >
      Explore Meals
    </Link>
  </motion.div>
);

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick: (notification: Notification) => void;
}

const NotificationItem = ({ notification, onMarkAsRead, onClick }: NotificationItemProps) => {
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the mark as read button
    if ((e.target as HTMLElement).closest('.mark-read-btn')) {
      e.stopPropagation();
      return;
    }
    onClick(notification);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onClick={handleClick}
      className={`
        group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer
        transition-all duration-200
        ${notification.read 
          ? 'bg-white/50 hover:bg-white' 
          : 'bg-white hover:bg-emerald-50/50 border border-emerald-100/50'
        }
      `}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
      )}

      {/* Icon */}
      <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
        ${config.bgColor}
      `}>
        <Icon className={`w-6 h-6 ${config.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={`font-semibold text-stone-800 ${!notification.read ? 'text-stone-900' : ''}`}>
              {notification.title}
            </p>
            <p className="text-sm text-stone-500 mt-0.5 line-clamp-2">
              {notification.body}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-stone-400">
                {formatNotificationTime(notification.createdAt)}
              </span>
              <span className={`
                text-[10px] px-2 py-0.5 rounded-full font-medium
                ${config.bgColor} ${config.iconColor}
              `}>
                {config.label}
              </span>
            </div>
          </div>

          {/* Mark as read button */}
          {!notification.read && (
            <button
              onClick={handleMarkAsRead}
              className="
                mark-read-btn
                p-2 rounded-lg text-stone-400 hover:text-emerald-600 
                hover:bg-emerald-100 transition-colors opacity-0 group-hover:opacity-100
              "
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chevron for navigation hint */}
      <ChevronRight className="w-5 h-5 text-stone-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

interface NotificationGroupProps {
  title: string;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationGroup = ({ 
  title, 
  notifications, 
  onMarkAsRead, 
  onNotificationClick 
}: NotificationGroupProps) => {
  if (notifications.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider px-4">
        {title}
      </h3>
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onClick={onNotificationClick}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export function Notifications() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    fetchNotifications();
    fetchUnreadCount();
  }, [isAuthenticated, navigate, fetchNotifications, fetchUnreadCount]);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(notifications);
  }, [notifications]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    await markAllAsRead();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.data) {
      const { familyId, pollId, mealId } = notification.data;

      switch (notification.type) {
        case 'POLL_CREATED':
        case 'POLL_ENDING':
        case 'POLL_RESULT':
          if (familyId) {
            navigate(`/family/${familyId}`);
          }
          break;
        case 'FAMILY_INVITE':
          if (familyId) {
            navigate(`/family/${familyId}`);
          } else {
            navigate('/family');
          }
          break;
        case 'NEW_MESSAGE':
          if (familyId) {
            navigate(`/family/${familyId}`);
          }
          break;
        case 'MEAL_SUGGESTION':
          if (mealId) {
            // Could navigate to meal detail if available
            navigate('/');
          }
          break;
        default:
          // No navigation for unknown types
          break;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl skeleton" />
            <div className="space-y-2">
              <div className="h-8 w-48 skeleton rounded" />
              <div className="h-4 w-32 skeleton rounded" />
            </div>
          </div>
        </div>
        <NotificationSkeleton />
      </div>
    );
  }

  const hasNotifications = notifications.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <Link 
            to="/" 
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center relative">
              <Bell className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            Notifications
          </h1>
        </div>
        <p className="text-stone-600 ml-16">
          {unreadCount > 0 
            ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
            : 'Stay updated with polls, messages, and family activity'
          }
        </p>
      </motion.div>

      {/* Actions Bar */}
      {hasNotifications && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-400" />
            <span className="text-sm text-stone-500">
              {notifications.length} notification{notifications.length === 1 ? '' : 's'}
            </span>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="
                flex items-center gap-2 px-4 py-2 text-sm font-medium
                text-emerald-600 hover:text-emerald-700
                hover:bg-emerald-50 rounded-lg transition-colors
              "
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </motion.div>
      )}

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {hasNotifications ? (
          <>
            <NotificationGroup
              title="Today"
              notifications={groupedNotifications.today}
              onMarkAsRead={handleMarkAsRead}
              onNotificationClick={handleNotificationClick}
            />
            <NotificationGroup
              title="Yesterday"
              notifications={groupedNotifications.yesterday}
              onMarkAsRead={handleMarkAsRead}
              onNotificationClick={handleNotificationClick}
            />
            <NotificationGroup
              title="Earlier"
              notifications={groupedNotifications.earlier}
              onMarkAsRead={handleMarkAsRead}
              onNotificationClick={handleNotificationClick}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </motion.div>
    </div>
  );
}
