export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Juices';
export type DietType = 'Vegetarian' | 'Non-Vegetarian';

// Search types
export * from './search';

// Re-export new review types
export * from './reviews';

// Re-export shopping types
export * from './shopping';

// Re-export meal history types
export * from './mealHistory';

// Legacy Review type for backward compatibility
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MealItem {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: string;
  benefits: string[];
  category: MealCategory;
  dietType: DietType;
  reviews: Review[];
  imageUrl?: string;
  instructions?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPremium: boolean;
  createdAt?: string;
}

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  members: FamilyMember[];
  myRole?: FamilyRole;
  _count?: {
    mealPolls: number;
    messages: number;
  };
}

export interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  role: FamilyRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
}

export type FamilyRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Favorite {
  id: string;
  userId: string;
  mealId: string;
  mealName: string;
  mealData: MealItem;
  category: string;
  dietType: string;
  createdAt: string;
}

export interface MealPoll {
  id: string;
  familyId: string;
  category: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'JUICES';
  date: string;
  status: 'ACTIVE' | 'CLOSED' | 'COMPLETED';
  closesAt: string;
  suggestions: MealSuggestion[];
  myVote?: string;
}

export interface MealSuggestion {
  id: string;
  pollId: string;
  userId: string;
  mealId: string;
  mealName: string;
  mealData: MealItem;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  votes?: { userId: string }[];
  _count?: {
    votes: number;
  };
}

export interface Message {
  id: string;
  familyId: string;
  userId: string;
  content: string;
  type: 'TEXT' | 'MEAL_SHARE' | 'POLL_CREATED' | 'POLL_RESULT' | 'MEMBER_JOINED';
  metadata?: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIALING';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}
