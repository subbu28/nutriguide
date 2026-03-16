const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(data: { email: string; password: string; name: string }) {
    const result = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async login(data: { email: string; password: string }) {
    const result = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(result.token);
    return result;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  async updateProfile(data: { name?: string; avatar?: string }) {
    return this.request<{ user: any }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Meals
  async getMeals(category: string, dietType: string, cuisine: string = 'All') {
    return this.request<{ meals: any[]; cuisine?: string }>('/meals', {
      params: { category, dietType, cuisine },
    });
  }

  async searchMeals(query: string, dietType: string) {
    return this.request<{ meals: any[] }>('/meals/search', {
      params: { q: query, dietType },
    });
  }

  async getRandomMeals(count: number = 5) {
    return this.request<{ meals: any[] }>('/meals/random', {
      params: { count: count.toString() },
    });
  }

  async getCuisines() {
    return this.request<{ cuisines: string[] }>('/meals/cuisines');
  }

  async getMealsByCuisine(cuisine: string) {
    return this.request<{ meals: any[]; area: string }>(`/meals/cuisine/${cuisine}`);
  }

  // Favorites
  async getFavorites(filters?: { category?: string; dietType?: string }) {
    return this.request<{ favorites: any[] }>('/favorites', {
      params: filters as Record<string, string>,
    });
  }

  async addFavorite(data: { mealId: string; mealName: string; mealData: any; category: string; dietType: string }) {
    return this.request<{ favorite: any }>('/favorites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeFavorite(mealId: string) {
    return this.request<{ message: string }>(`/favorites/${mealId}`, {
      method: 'DELETE',
    });
  }

  async checkFavorite(mealId: string) {
    return this.request<{ isFavorite: boolean }>(`/favorites/check/${mealId}`);
  }

  // Family
  async getFamilies() {
    return this.request<{ families: any[] }>('/family');
  }

  async getFamily(familyId: string) {
    return this.request<{ family: any; myRole: string }>(`/family/${familyId}`);
  }

  async createFamily(name: string) {
    return this.request<{ family: any }>('/family', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async joinFamily(inviteCode: string) {
    return this.request<{ message: string; familyId: string }>('/family/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  }

  async leaveFamily(familyId: string) {
    return this.request<{ message: string }>(`/family/${familyId}/leave`, {
      method: 'DELETE',
    });
  }

  async regenerateInviteCode(familyId: string) {
    return this.request<{ inviteCode: string }>(`/family/${familyId}/regenerate-invite`, {
      method: 'POST',
    });
  }

  // Polls
  async getFamilyPolls(familyId: string) {
    return this.request<{ polls: any[] }>(`/polls/family/${familyId}`);
  }

  async createPoll(data: { familyId: string; category: string; date: string; closesAt: string }) {
    return this.request<{ poll: any }>('/polls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async suggestMeal(pollId: string, data: { mealId: string; mealName: string; mealData: any }) {
    return this.request<{ suggestion: any }>(`/polls/${pollId}/suggest`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async vote(pollId: string, suggestionId: string) {
    return this.request<{ vote: any; suggestions: any[] }>(`/polls/${pollId}/vote/${suggestionId}`, {
      method: 'POST',
    });
  }

  async closePoll(pollId: string) {
    return this.request<{ winner: any; poll: any }>(`/polls/${pollId}/close`, {
      method: 'POST',
    });
  }

  // Chat
  async getMessages(familyId: string, before?: string) {
    const params: Record<string, string> = {};
    if (before) params.before = before;
    return this.request<{ messages: any[] }>(`/chat/family/${familyId}`, { params });
  }

  async sendMessage(familyId: string, content: string, type: string = 'TEXT', metadata?: any) {
    return this.request<{ message: any }>(`/chat/family/${familyId}`, {
      method: 'POST',
      body: JSON.stringify({ content, type, metadata }),
    });
  }

  async shareMeal(familyId: string, mealId: string, mealName: string, mealData: any, comment?: string) {
    return this.request<{ message: any }>(`/chat/family/${familyId}/share-meal`, {
      method: 'POST',
      body: JSON.stringify({ mealId, mealName, mealData, comment }),
    });
  }

  // Notifications
  async getNotifications(unreadOnly: boolean = false) {
    return this.request<{ notifications: any[] }>('/notifications', {
      params: { unreadOnly: String(unreadOnly) },
    });
  }

  async getUnreadCount() {
    return this.request<{ count: number }>('/notifications/unread-count');
  }

  async markAsRead(notificationId: string) {
    return this.request<{ message: string }>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllAsRead() {
    return this.request<{ message: string }>('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // Payments
  async createCheckoutSession() {
    return this.request<{ sessionId: string; url: string }>('/payments/create-checkout-session', {
      method: 'POST',
    });
  }

  async getSubscription() {
    return this.request<{ subscription: any; isPremium: boolean }>('/payments/subscription');
  }

  async cancelSubscription() {
    return this.request<{ message: string }>('/payments/cancel-subscription', {
      method: 'POST',
    });
  }

  async getPaymentHistory() {
    return this.request<{ payments: any[] }>('/payments/history');
  }

  // Profile
  async getProfile() {
    return this.request<{
      id: string;
      email: string;
      name: string;
      avatar: string | null;
      isPremium: boolean;
      createdAt: string;
      favoritesCount: number;
      familiesCount: number;
    }>('/user/profile');
  }

  async updateUserProfile(data: { name?: string; email?: string; avatar?: string }) {
    return this.request<{ id: string; email: string; name: string; avatar: string | null }>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request<{ message: string }>('/user/profile/password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount() {
    return this.request<{ message: string }>('/user/profile', {
      method: 'DELETE',
    });
  }

  async getProfileStats() {
    return this.request<{
      favorites: number;
      families: number;
      votes: number;
      suggestions: number;
    }>('/user/profile/stats');
  }

  // Settings
  async getSettings() {
    return this.request<{
      id: string;
      dietaryPreferences: string[];
      allergies: string[];
      calorieGoal: number | null;
      proteinGoal: number | null;
      emailNotifications: boolean;
      pushNotifications: boolean;
      pollReminders: boolean;
      familyUpdates: boolean;
      theme: string;
      language: string;
      measurementUnit: string;
      defaultCuisine: string | null;
    }>('/user/settings');
  }

  async updateSettings(data: {
    dietaryPreferences?: string[];
    allergies?: string[];
    calorieGoal?: number | null;
    proteinGoal?: number | null;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    pollReminders?: boolean;
    familyUpdates?: boolean;
    theme?: string;
    language?: string;
    measurementUnit?: string;
    defaultCuisine?: string | null;
  }) {
    return this.request<any>('/user/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Meal Planner
  async getMealPlannerStatus() {
    return this.request<{
      spoonacularEnabled: boolean;
      inHouseEnabled: boolean;
      geminiEnabled: boolean;
      dietOptions: { value: string; label: string }[];
      intoleranceOptions: string[];
    }>('/mealplanner/status');
  }

  async generateMealPlan(params: {
    timeFrame: 'day' | 'week';
    targetCalories?: number;
    diet?: string;
    exclude?: string;
    source?: 'spoonacular' | 'inhouse' | 'auto';
  }) {
    return this.request<{ mealPlan: any; source: string }>('/mealplanner/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async regenerateMeal(params: {
    slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    diet?: string;
    exclude?: string;
    excludeMealIds?: string[];
  }) {
    return this.request<{ meal: any }>('/mealplanner/regenerate-meal', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getRecipeDetails(recipeId: number | string, source?: string) {
    const url = source 
      ? `/mealplanner/recipe/${recipeId}?source=${source}`
      : `/mealplanner/recipe/${recipeId}`;
    return this.request<{ recipe: any; source: string }>(url);
  }

  async getMealPlans() {
    return this.request<{ mealPlans: any[] }>('/mealplanner/plans');
  }

  async getMealPlan(id: string) {
    return this.request<{ mealPlan: any }>(`/mealplanner/plans/${id}`);
  }

  async getCurrentMealPlan() {
    return this.request<{ mealPlan: any | null }>('/mealplanner/current');
  }

  async saveMealPlan(data: {
    name: string;
    startDate: string;
    endDate: string;
    targetCalories?: number;
    diet?: string;
    excludeIngredients?: string;
    meals: {
      date: string;
      slot: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
      recipeId: string;
      recipeName: string;
      recipeImage?: string;
      recipeData: any;
      servings?: number;
    }[];
  }) {
    return this.request<{ mealPlan: any }>('/mealplanner/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteMealPlan(id: string) {
    return this.request<{ message: string }>(`/mealplanner/plans/${id}`, {
      method: 'DELETE',
    });
  }

  async updatePlannedMeal(mealId: string, data: { servings?: number; completed?: boolean }) {
    return this.request<{ meal: any }>(`/mealplanner/meals/${mealId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePlannedMeal(mealId: string) {
    return this.request<{ message: string }>(`/mealplanner/meals/${mealId}`, {
      method: 'DELETE',
    });
  }

  // Reviews
  async getReviews(mealId: string, sort: string = 'newest', page: number = 1) {
    return this.request<{
      reviews: any[];
      summary: {
        averageRating: number;
        totalReviews: number;
        distribution: {
          5: number;
          4: number;
          3: number;
          2: number;
          1: number;
        };
      };
      hasMore: boolean;
      page: number;
    }>(`/reviews/meal/${mealId}`, {
      params: { sort, page: page.toString() },
    });
  }

  async submitReview(mealId: string, rating: number, text: string) {
    return this.request<{
      review: any;
      summary: {
        averageRating: number;
        totalReviews: number;
        distribution: {
          5: number;
          4: number;
          3: number;
          2: number;
          1: number;
        };
      };
    }>('/reviews', {
      method: 'POST',
      body: JSON.stringify({ mealId, rating, text }),
    });
  }

  async markReviewHelpful(reviewId: string) {
    return this.request<{
      helpful: number;
      isHelpful: boolean;
    }>(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  }

  async deleteReview(reviewId: string) {
    return this.request<{ message: string }>(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Meal History
  async getMealHistory(startDate: string, endDate: string) {
    return this.request<{ history: any[] }>('/meal-history', {
      params: { startDate, endDate },
    });
  }

  async logMeal(data: {
    mealId: string;
    mealData: any;
    date: string;
    mealType: string;
    portions: number;
    totalCalories: number;
    totalProtein: number;
    notes?: string;
  }) {
    return this.request<{ log: any }>('/meal-history/log', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteMealLog(logId: string) {
    return this.request<{ message: string }>(`/meal-history/log/${logId}`, {
      method: 'DELETE',
    });
  }

  async getMealStats(period: 'week' | 'month' | 'year') {
    return this.request<any>('/meal-history/stats', {
      params: { period },
    });
  }
}

export const api = new ApiClient(API_BASE);
