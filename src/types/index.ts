export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  isPremium: boolean;
  isEmailVerified: boolean;
  settings?: UserSettings;
  createdAt: string;
}

export interface UserSettings {
  id: string;
  dietaryPreferences: string[];
  allergies: string[];
  calorieGoal?: number;
  proteinGoal?: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  pollReminders: boolean;
  familyUpdates: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  measurementUnit: 'metric' | 'imperial';
  defaultCuisine?: string;
}

export interface Meal {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string;
  thumbnail: string;
  tags: string[];
  youtube?: string;
  source?: string;
  ingredients: {
    ingredient: string;
    measure: string;
  }[];
}

export interface Recipe {
  id: string;
  authorId: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  title: string;
  description?: string;
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  privacy: 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
  images: string[];
  videoUrl?: string;
  tags: string[];
  cuisine?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  viewCount: number;
  likeCount: number;
  saveCount: number;
  ingredients: RecipeIngredient[];
  reviews?: Review[];
  isLiked?: boolean;
  isSaved?: boolean;
  _count?: {
    reviews: number;
  };
  createdAt: string;
}

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  optional: boolean;
  notes?: string;
}

export interface Review {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment?: string;
  images: string[];
  helpful: number;
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  members: FamilyMember[];
  mealPolls?: MealPoll[];
  messages?: Message[];
  _count?: {
    members: number;
  };
  myRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface MealPoll {
  id: string;
  familyId: string;
  category: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'JUICES';
  date: string;
  status: 'ACTIVE' | 'CLOSED' | 'COMPLETED';
  closesAt: string;
  suggestions: MealSuggestion[];
  votes?: Vote[];
  createdAt: string;
}

export interface MealSuggestion {
  id: string;
  pollId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  mealId: string;
  mealName: string;
  mealData: Record<string, any>;
  votes: Vote[];
  _count?: {
    votes: number;
  };
  createdAt: string;
}

export interface Vote {
  id: string;
  userId: string;
  pollId: string;
  suggestionId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  familyId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  type: 'TEXT' | 'MEAL_SHARE' | 'POLL_CREATED' | 'POLL_RESULT' | 'MEMBER_JOINED';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'POLL_CREATED' | 'POLL_ENDING' | 'POLL_RESULT' | 'FAMILY_INVITE' | 'NEW_MESSAGE' | 'MEAL_SUGGESTION';
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  targetCalories?: number;
  diet?: string;
  excludeIngredients?: string;
  meals: PlannedMeal[];
  createdAt: string;
}

export interface PlannedMeal {
  id: string;
  mealPlanId: string;
  date: string;
  slot: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  recipeId: string;
  recipeName: string;
  recipeImage?: string;
  recipeData: Record<string, any>;
  servings: number;
  completed: boolean;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingItem[];
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  listId: string;
  name: string;
  amount?: number;
  unit?: string;
  category: string;
  checked: boolean;
  notes?: string;
}

export interface MealLog {
  id: string;
  userId: string;
  recipeId?: string;
  recipe?: {
    id: string;
    title: string;
    images: string[];
  };
  mealName: string;
  mealData: Record<string, any>;
  servings: number;
  mealSlot: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  consumedAt: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mood?: string;
  notes?: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  recipes?: CollectionRecipe[];
  _count?: {
    recipes: number;
  };
}

export interface CollectionRecipe {
  id: string;
  collectionId: string;
  recipeId: string;
  recipe?: Recipe;
  addedAt: string;
  notes?: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title?: string;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
