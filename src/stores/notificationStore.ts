import { create } from 'zustand';
import { api } from '../lib/api.js';
import { Notification } from '../types/index.js';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (unreadOnly = false) => {
    set({ isLoading: true });
    try {
      const response = await api.getNotifications(unreadOnly);
      set({ notifications: response.notifications, unreadCount: response.unreadCount, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.getUnreadCount();
      set({ unreadCount: response.count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (id) => {
    try {
      await api.markNotificationRead(id);
      set({
        notifications: get().notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.markAllNotificationsRead();
      set({
        notifications: get().notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.deleteNotification(id);
      const notification = get().notifications.find(n => n.id === id);
      set({
        notifications: get().notifications.filter(n => n.id !== id),
        unreadCount: notification?.read ? get().unreadCount : Math.max(0, get().unreadCount - 1),
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },
}));
