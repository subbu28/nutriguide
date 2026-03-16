import { create } from 'zustand';
import { api } from '../lib/api';
import { wsClient } from '../lib/websocket';
import type { Family, MealPoll, Message } from '../types';

interface FamilyState {
  families: Family[];
  currentFamily: Family | null;
  polls: MealPoll[];
  messages: Message[];
  isLoading: boolean;
  typingUsers: Set<string>;

  fetchFamilies: () => Promise<void>;
  fetchFamily: (familyId: string) => Promise<void>;
  createFamily: (name: string) => Promise<Family>;
  joinFamily: (inviteCode: string) => Promise<string>;
  leaveFamily: (familyId: string) => Promise<void>;
  
  fetchPolls: (familyId: string) => Promise<void>;
  createPoll: (data: { familyId: string; category: string; date: string; closesAt: string }) => Promise<void>;
  suggestMeal: (pollId: string, meal: any) => Promise<void>;
  vote: (pollId: string, suggestionId: string) => Promise<void>;
  
  fetchMessages: (familyId: string) => Promise<void>;
  sendMessage: (familyId: string, content: string) => Promise<void>;
  shareMeal: (familyId: string, meal: any, comment?: string) => Promise<void>;
  
  addMessage: (message: Message) => void;
  updatePoll: (poll: MealPoll) => void;
  setTypingUser: (userId: string) => void;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  families: [],
  currentFamily: null,
  polls: [],
  messages: [],
  isLoading: false,
  typingUsers: new Set(),

  fetchFamilies: async () => {
    try {
      const { families } = await api.getFamilies();
      set({ families });
    } catch (error) {
      console.error('Failed to fetch families:', error);
    }
  },

  fetchFamily: async (familyId) => {
    set({ isLoading: true });
    try {
      const { family, myRole } = await api.getFamily(familyId);
      set({ currentFamily: { ...family, myRole }, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch family:', error);
      set({ isLoading: false });
    }
  },

  createFamily: async (name) => {
    const { family } = await api.createFamily(name);
    set({ families: [...get().families, family] });
    wsClient.joinFamily(family.id);
    return family;
  },

  joinFamily: async (inviteCode) => {
    const { familyId } = await api.joinFamily(inviteCode);
    await get().fetchFamilies();
    wsClient.joinFamily(familyId);
    return familyId;
  },

  leaveFamily: async (familyId) => {
    await api.leaveFamily(familyId);
    set({ families: get().families.filter(f => f.id !== familyId) });
    wsClient.leaveFamily(familyId);
    if (get().currentFamily?.id === familyId) {
      set({ currentFamily: null });
    }
  },

  fetchPolls: async (familyId) => {
    try {
      const { polls } = await api.getFamilyPolls(familyId);
      set({ polls });
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    }
  },

  createPoll: async (data) => {
    const { poll } = await api.createPoll(data);
    set({ polls: [...get().polls, poll] });
  },

  suggestMeal: async (pollId, meal) => {
    await api.suggestMeal(pollId, {
      mealId: meal.id,
      mealName: meal.name,
      mealData: meal,
    });
    // Poll will be updated via WebSocket
  },

  vote: async (pollId, suggestionId) => {
    await api.vote(pollId, suggestionId);
    // Poll will be updated via WebSocket
  },

  fetchMessages: async (familyId) => {
    try {
      const { messages } = await api.getMessages(familyId);
      set({ messages });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  },

  sendMessage: async (familyId, content) => {
    await api.sendMessage(familyId, content);
    // Message will be added via WebSocket
  },

  shareMeal: async (familyId, meal, comment) => {
    await api.shareMeal(familyId, meal.id, meal.name, meal, comment);
  },

  addMessage: (message) => {
    set({ messages: [...get().messages, message] });
  },

  updatePoll: (updatedPoll) => {
    set({
      polls: get().polls.map(p => p.id === updatedPoll.id ? updatedPoll : p)
    });
  },

  setTypingUser: (userId) => {
    const typingUsers = new Set(get().typingUsers);
    typingUsers.add(userId);
    set({ typingUsers });
    
    // Remove after 3 seconds
    setTimeout(() => {
      const users = new Set(get().typingUsers);
      users.delete(userId);
      set({ typingUsers: users });
    }, 3000);
  },
}));
