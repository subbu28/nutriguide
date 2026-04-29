import { User, UserSettings, Meal, Recipe, Review, Family, MealPoll, Message, Notification, MealPlan, ShoppingList, MealLog, Collection, AIConversation } from '../types/index.js';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api`;

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string, name: string) {
    return this.fetch<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.fetch<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.fetch<User>('/auth/me');
  }

  async logout() {
    return this.fetch('/auth/logout', { method: 'POST' });
  }

  async updateProfile(data: Partial<User>) {
    return this.fetch<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.fetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // User Settings
  async getSettings() {
    return this.fetch<UserSettings>('/user/settings');
  }

  async updateSettings(data: Partial<UserSettings>) {
    return this.fetch<UserSettings>('/user/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUserStats() {
    return this.fetch<{
      favorites: number;
      recipes: number;
      reviews: number;
      mealPlans: number;
      mealLogs: number;
      families: number;
    }>('/user/stats');
  }

  // Meals
  async getMeals(params?: { category?: string; diet?: string; cuisine?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.diet) query.set('diet', params.diet);
    if (params?.cuisine) query.set('cuisine', params.cuisine);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    return this.fetch<{ meals: Meal[]; pagination: any }>(`/meals?${query}`);
  }

  async getRandomMeals(count = 5) {
    return this.fetch<{ meals: Meal[] }>(`/meals/random?count=${count}`);
  }

  async getMeal(id: string) {
    return this.fetch<{ meal: Meal }>(`/meals/${id}`);
  }

  async getCuisines() {
    return this.fetch<{ cuisines: string[] }>('/meals/cuisines');
  }

  async getMealRecommendations(params: { preferences?: string; dietaryRestrictions?: string[]; calories?: number; mealType?: string }) {
    return this.fetch('/meals/recommendations', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Favorites
  async getFavorites(params?: { category?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    return this.fetch<{ favorites: any[]; pagination: any }>(`/favorites?${query}`);
  }

  async addFavorite(data: { mealId: string; mealName: string; mealData: any; category?: string; dietType?: string }) {
    return this.fetch('/favorites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeFavorite(mealId: string) {
    return this.fetch(`/favorites/${mealId}`, { method: 'DELETE' });
  }

  async checkFavorite(mealId: string) {
    return this.fetch<{ isFavorited: boolean }>(`/favorites/check/${mealId}`);
  }

  // Recipes
  async getRecipes(params?: { search?: string; cuisine?: string; difficulty?: string; tags?: string; authorId?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.cuisine) query.set('cuisine', params.cuisine);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.tags) query.set('tags', params.tags);
    if (params?.authorId) query.set('authorId', params.authorId);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    return this.fetch<{ recipes: Recipe[]; pagination: any }>(`/recipes?${query}`);
  }

  async getRecipe(id: string) {
    return this.fetch<Recipe>(`/recipes/${id}`);
  }

  async getRecipeDetails(recipeId: string | number, source?: string) {
    const query = source ? `?source=${source}` : '';
    return this.fetch<{ recipe: any }>(`/mealplanner/recipe/${recipeId}${query}`);
  }

  async createRecipe(data: Partial<Recipe>) {
    return this.fetch<Recipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecipe(id: string, data: Partial<Recipe>) {
    return this.fetch<Recipe>(`/recipes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRecipe(id: string) {
    return this.fetch(`/recipes/${id}`, { method: 'DELETE' });
  }

  async likeRecipe(id: string) {
    return this.fetch<{ liked: boolean }>(`/recipes/${id}/like`, { method: 'POST' });
  }

  // Reviews
  async getReviews(recipeId: string, params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    return this.fetch<{ reviews: Review[]; pagination: any }>(`/reviews/recipe/${recipeId}?${query}`);
  }

  async createReview(data: { recipeId: string; rating: number; comment?: string; images?: string[] }) {
    return this.fetch<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markReviewHelpful(id: string) {
    return this.fetch<{ marked: boolean }>(`/reviews/${id}/helpful`, { method: 'POST' });
  }

  // Families
  async getFamilies() {
    return this.fetch<{ families: Family[] }>('/family');
  }

  async createFamily(name: string) {
    return this.fetch<Family>('/family', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async getFamily(id: string) {
    return this.fetch<Family>(`/family/${id}`);
  }

  async joinFamily(inviteCode: string) {
    return this.fetch('/family/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  }

  async leaveFamily(id: string) {
    return this.fetch(`/family/${id}/leave`, { method: 'DELETE' });
  }

  async regenerateInviteCode(id: string) {
    return this.fetch<{ inviteCode: string }>(`/family/${id}/regenerate-invite`, { method: 'POST' });
  }

  async addFamilyMember(familyId: string, email: string, role: string = 'MEMBER') {
    return this.fetch(`/family/${familyId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  }

  async removeFamilyMember(familyId: string, userId: string) {
    return this.fetch(`/family/${familyId}/members/${userId}`, { method: 'DELETE' });
  }

  async getFamilyMembers(familyId: string) {
    return this.fetch(`/family/${familyId}/members`);
  }

  // Chat/Messages
  async getFamilyMessages(familyId: string, before?: string) {
    const query = before ? `?before=${before}` : '';
    return this.fetch(`/chat/family/${familyId}${query}`);
  }

  async sendFamilyMessage(familyId: string, content: string, type: string = 'TEXT') {
    return this.fetch(`/chat/family/${familyId}`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  }

  // Polls
  async getPolls(familyId: string, status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.fetch<{ polls: MealPoll[] }>(`/polls/family/${familyId}${query}`);
  }

  async getFamilyPolls(familyId: string, status?: string) {
    return this.getPolls(familyId, status);
  }

  async createPoll(data: { familyId: string; category: string; date: string; closesAt: string }) {
    return this.fetch<MealPoll>('/polls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async suggestMeal(pollId: string, data: { mealId: string; mealName: string; mealData: any }) {
    return this.fetch(`/polls/${pollId}/suggest`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async vote(pollId: string, suggestionId: string) {
    return this.fetch(`/polls/${pollId}/vote/${suggestionId}`, { method: 'POST' });
  }

  // Chat
  async getMessages(familyId: string, before?: string) {
    const query = before ? `?before=${before}` : '';
    return this.fetch<{ messages: Message[] }>(`/chat/family/${familyId}${query}`);
  }

  async sendMessage(familyId: string, content: string, type = 'TEXT') {
    return this.fetch<Message>(`/chat/family/${familyId}`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  }

  async shareMeal(familyId: string, mealId: string, mealName: string, mealData: any, comment?: string) {
    return this.fetch<Message>(`/chat/family/${familyId}/share-meal`, {
      method: 'POST',
      body: JSON.stringify({ mealId, mealName, mealData, comment }),
    });
  }

  // Notifications
  async getNotifications(unreadOnly = false) {
    return this.fetch<{ notifications: Notification[]; unreadCount: number }>(`/notifications?unreadOnly=${unreadOnly}`);
  }

  async getUnreadCount() {
    return this.fetch<{ count: number }>('/notifications/unread-count');
  }

  async markNotificationRead(id: string) {
    return this.fetch(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllNotificationsRead() {
    return this.fetch('/notifications/read-all', { method: 'PATCH' });
  }

  // Meal Plans
  async getMealPlannerStatus() {
    return this.fetch<{
      spoonacularEnabled: boolean;
      inHouseEnabled: boolean;
      geminiEnabled: boolean;
      dietOptions: { value: string; label: string }[];
    }>('/mealplanner/status');
  }

  async getMealPlans() {
    return this.fetch<{ plans: MealPlan[] }>('/mealplanner/plans');
  }

  async generateMealPlan(params: {
    timeFrame: 'day' | 'week';
    targetCalories: number;
    diet?: string;
    exclude?: string;
    source?: string;
  }) {
    return this.fetch<{ mealPlan: any; source: string }>('/mealplanner/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async saveMealPlan(data: any) {
    return this.fetch('/mealplanner/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async regenerateMeal(params: {
    slot: string;
    diet?: string;
    exclude?: string;
    excludeMealIds?: string[];
  }) {
    return this.fetch<{ meal: any }>('/mealplanner/regenerate-meal', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getMealPlan(id: string) {
    return this.fetch<MealPlan>(`/mealplanner/plans/${id}`);
  }

  async deleteMealPlan(id: string) {
    return this.fetch(`/mealplanner/plans/${id}`, { method: 'DELETE' });
  }

  async addMealToPlan(planId: string, data: Partial<MealPlan['meals'][0]>) {
    return this.fetch(`/mealplanner/plans/${planId}/meals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Shopping Lists
  async getShoppingLists() {
    return this.fetch<{ lists: ShoppingList[] }>('/shopping-lists');
  }

  async getShoppingList(id: string) {
    return this.fetch<ShoppingList>(`/shopping-lists/${id}`);
  }

  async createShoppingList(data: { name: string; isTemplate?: boolean; items?: any[] }) {
    return this.fetch<ShoppingList>('/shopping-lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteShoppingList(id: string) {
    return this.fetch(`/shopping-lists/${id}`, { method: 'DELETE' });
  }

  async addShoppingItem(listId: string, data: Partial<ShoppingList['items'][0]>) {
    return this.fetch(`/shopping-lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateShoppingItem(listId: string, itemId: string, data: Partial<ShoppingList['items'][0]>) {
    return this.fetch(`/shopping-lists/${listId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Meal History
  async getMealLogs(params?: { startDate?: string; endDate?: string }) {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);

    return this.fetch<{ logs: MealLog[] }>(`/meal-history?${query}`);
  }

  async getNutritionStats(days = 7) {
    return this.fetch(`/meal-history/stats?days=${days}`);
  }

  async logMeal(data: Partial<MealLog>) {
    return this.fetch<MealLog>('/meal-history/log', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI
  async chatWithAI(message: string, conversationId?: string) {
    return this.fetch<{ response: string; conversationId: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  }

  async getAIConversations() {
    return this.fetch<{ conversations: AIConversation[] }>('/ai/conversations');
  }

  async generateMealPlanWithAI(params: { days?: number; calorieTarget?: number; dietaryRestrictions?: string[] }) {
    return this.fetch('/ai/generate-meal-plan', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async generateRecipeFromIngredients(ingredients: string[]) {
    return this.fetch('/ai/generate-recipe', {
      method: 'POST',
      body: JSON.stringify({ ingredients }),
    });
  }

  // Social
  async getUserProfile(id: string) {
    return this.fetch(`/social/users/${id}`);
  }

  async followUser(userId: string) {
    return this.fetch(`/social/follow/${userId}`, { method: 'POST' });
  }

  async unfollowUser(userId: string) {
    return this.fetch(`/social/follow/${userId}`, { method: 'DELETE' });
  }

  async getFeed() {
    return this.fetch('/social/feed');
  }

  async getCollections() {
    return this.fetch<{ collections: Collection[] }>('/social/collections');
  }

  async createCollection(data: { name: string; description?: string; isPublic?: boolean }) {
    return this.fetch<Collection>('/social/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addToCollection(collectionId: string, recipeId: string) {
    return this.fetch(`/social/collections/${collectionId}/recipes`, {
      method: 'POST',
      body: JSON.stringify({ recipeId }),
    });
  }

  // Premium
  async createCheckoutSession(data: { successUrl: string; cancelUrl: string; couponCode?: string }) {
    return this.fetch('/payments/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSubscription() {
    return this.fetch('/payments/subscription');
  }

  async cancelSubscription() {
    return this.fetch('/payments/cancel-subscription', { method: 'POST' });
  }

  async validateCoupon(code: string) {
    return this.fetch('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }
}

export const api = new ApiClient();
