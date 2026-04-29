// Mock API implementation that uses local mock data
import { 
  mockMeals, 
  mockUser, 
  mockCredentials, 
  mockFavorites, 
  mockRecipes, 
  mockReviews, 
  mockFamily, 
  mockMealPlans, 
  mockShoppingLists, 
  mockMealHistory, 
  mockNotifications, 
  mockPolls 
} from './mockData';

// Simulate API delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiClient {
  private token: string | null = null;
  private currentUser = mockUser;

  setToken(token: string | null) {
    this.token = token;
  }

  // Auth
  async register(email: string, password: string, name: string) {
    await delay();
    const user = { ...mockUser, email, name };
    const token = 'mock-jwt-token-' + Date.now();
    this.token = token;
    this.currentUser = user;
    return { user, token };
  }

  async login(email: string, password: string) {
    await delay();
    
    // Check credentials
    const account = mockCredentials.accounts.find(
      acc => acc.email === email && acc.password === password
    );
    
    if (!account) {
      throw new Error('Invalid credentials');
    }
    
    const user = { ...mockUser, email: account.email, name: account.name };
    const token = 'mock-jwt-token-' + Date.now();
    this.token = token;
    this.currentUser = user;
    return { user, token };
  }

  async getMe() {
    await delay(100);
    if (!this.token) throw new Error('Not authenticated');
    return this.currentUser;
  }

  async logout() {
    await delay(100);
    this.token = null;
    return { success: true };
  }

  async updateProfile(data: any) {
    await delay();
    this.currentUser = { ...this.currentUser, ...data };
    return this.currentUser;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    await delay();
    return { success: true };
  }

  // Meals
  async getMeals(params?: any) {
    await delay();
    let meals = [...mockMeals];
    
    // Filter by category
    if (params?.category && params.category !== 'All') {
      meals = meals.filter(m => m.category === params.category);
    }
    
    // Filter by diet
    if (params?.diet) {
      meals = meals.filter(m => m.dietType === params.diet);
    }
    
    // Search
    if (params?.search) {
      const search = params.search.toLowerCase();
      meals = meals.filter(m => 
        m.name.toLowerCase().includes(search) ||
        m.description?.toLowerCase().includes(search)
      );
    }
    
    return { 
      meals, 
      pagination: { total: meals.length, page: 1, limit: 20 } 
    };
  }

  async getRandomMeals(count = 5) {
    await delay();
    const shuffled = [...mockMeals].sort(() => 0.5 - Math.random());
    return { meals: shuffled.slice(0, count) };
  }

  async getMeal(id: string) {
    await delay();
    const meal = mockMeals.find(m => m.id === id);
    if (!meal) throw new Error('Meal not found');
    return { meal };
  }

  async getCuisines() {
    await delay();
    return { cuisines: ['Italian', 'Mexican', 'Asian', 'American', 'Mediterranean'] };
  }

  async getMealRecommendations(params: any) {
    await delay();
    return { meals: mockMeals.slice(0, 5) };
  }

  // Favorites
  async getFavorites(params?: any) {
    await delay();
    return { favorites: mockFavorites, pagination: { total: mockFavorites.length } };
  }

  async addFavorite(data: any) {
    await delay();
    return { success: true };
  }

  async removeFavorite(mealId: string) {
    await delay();
    return { success: true };
  }

  async checkFavorite(mealId: string) {
    await delay();
    const isFavorited = mockFavorites.some(f => f.id === mealId);
    return { isFavorited };
  }

  // Recipes
  async getRecipes(params?: any) {
    await delay();
    return { recipes: mockRecipes, pagination: { total: mockRecipes.length } };
  }

  async getRecipe(id: string) {
    await delay();
    const recipe = mockRecipes.find(r => r.id === id);
    if (!recipe) throw new Error('Recipe not found');
    return recipe;
  }

  async getRecipeDetails(recipeId: string | number, source?: string) {
    await delay();
    const recipe = mockRecipes.find(r => r.id === recipeId.toString());
    return { recipe: recipe || mockRecipes[0] };
  }

  async createRecipe(data: any) {
    await delay();
    return { ...data, id: Date.now().toString(), author: mockUser };
  }

  async updateRecipe(id: string, data: any) {
    await delay();
    return { ...data, id };
  }

  async deleteRecipe(id: string) {
    await delay();
    return { success: true };
  }

  async likeRecipe(id: string) {
    await delay();
    return { liked: true };
  }

  // Reviews
  async getReviews(recipeId: string, params?: any) {
    await delay();
    const reviews = mockReviews.filter(r => r.recipeId === recipeId);
    return { reviews, pagination: { total: reviews.length } };
  }

  async createReview(data: any) {
    await delay();
    return { ...data, id: Date.now().toString(), user: mockUser, createdAt: new Date().toISOString() };
  }

  async markReviewHelpful(id: string) {
    await delay();
    return { marked: true };
  }

  // Families
  async getFamilies() {
    await delay();
    return { families: [mockFamily] };
  }

  async createFamily(name: string) {
    await delay();
    return { ...mockFamily, name, id: Date.now().toString() };
  }

  async getFamily(id: string) {
    await delay();
    return mockFamily;
  }

  async joinFamily(inviteCode: string) {
    await delay();
    return mockFamily;
  }

  async leaveFamily(id: string) {
    await delay();
    return { success: true };
  }

  async regenerateInviteCode(id: string) {
    await delay();
    return { inviteCode: 'NEW' + Date.now() };
  }

  async addFamilyMember(familyId: string, email: string, role: string = 'MEMBER') {
    await delay();
    return { success: true };
  }

  async removeFamilyMember(familyId: string, userId: string) {
    await delay();
    return { success: true };
  }

  async getFamilyMembers(familyId: string) {
    await delay();
    return { members: mockFamily.members };
  }

  // Polls
  async getPolls(familyId: string, status?: string) {
    await delay();
    return { polls: mockPolls };
  }

  async getFamilyPolls(familyId: string, status?: string) {
    return this.getPolls(familyId, status);
  }

  async createPoll(data: any) {
    await delay();
    return { ...data, id: Date.now().toString() };
  }

  async suggestMeal(pollId: string, data: any) {
    await delay();
    return { success: true };
  }

  async vote(pollId: string, suggestionId: string) {
    await delay();
    return { success: true };
  }

  // Messages
  async getMessages(familyId: string, before?: string) {
    await delay();
    return { messages: [] };
  }

  async getFamilyMessages(familyId: string, before?: string) {
    return this.getMessages(familyId, before);
  }

  async sendMessage(familyId: string, content: string, type = 'TEXT') {
    await delay();
    return { id: Date.now().toString(), content, type, user: mockUser, createdAt: new Date().toISOString() };
  }

  async sendFamilyMessage(familyId: string, content: string, type = 'TEXT') {
    return this.sendMessage(familyId, content, type);
  }

  async shareMeal(familyId: string, mealId: string, mealName: string, mealData: any, comment?: string) {
    await delay();
    return { success: true };
  }

  // Notifications
  async getNotifications(unreadOnly = false) {
    await delay();
    const notifications = unreadOnly ? mockNotifications.filter(n => !n.read) : mockNotifications;
    return { notifications, unreadCount: mockNotifications.filter(n => !n.read).length };
  }

  async getUnreadCount() {
    await delay();
    return { count: mockNotifications.filter(n => !n.read).length };
  }

  async markNotificationRead(id: string) {
    await delay();
    return { success: true };
  }

  async markAllNotificationsRead() {
    await delay();
    return { success: true };
  }

  // Meal Plans
  async getMealPlannerStatus() {
    await delay();
    return {
      spoonacularEnabled: false,
      inHouseEnabled: true,
      geminiEnabled: false,
      dietOptions: [
        { value: 'balanced', label: 'Balanced' },
        { value: 'high-protein', label: 'High Protein' },
        { value: 'low-carb', label: 'Low Carb' }
      ]
    };
  }

  async getMealPlans() {
    await delay();
    return { plans: mockMealPlans };
  }

  async generateMealPlan(params: any) {
    await delay();
    return { mealPlan: mockMealPlans[0], source: 'mock' };
  }

  async saveMealPlan(data: any) {
    await delay();
    return { ...data, id: Date.now().toString() };
  }

  async regenerateMeal(params: any) {
    await delay();
    return { meal: mockMeals[0] };
  }

  async getMealPlan(id: string) {
    await delay();
    return mockMealPlans[0];
  }

  async deleteMealPlan(id: string) {
    await delay();
    return { success: true };
  }

  async addMealToPlan(planId: string, data: any) {
    await delay();
    return { success: true };
  }

  // Shopping Lists
  async getShoppingLists() {
    await delay();
    return { lists: mockShoppingLists };
  }

  async getShoppingList(id: string) {
    await delay();
    const list = mockShoppingLists.find(l => l.id === id);
    return list || mockShoppingLists[0];
  }

  async createShoppingList(data: any) {
    await delay();
    return { ...data, id: Date.now().toString(), items: [] };
  }

  async deleteShoppingList(id: string) {
    await delay();
    return { success: true };
  }

  async addShoppingItem(listId: string, data: any) {
    await delay();
    return { success: true };
  }

  async updateShoppingItem(listId: string, itemId: string, data: any) {
    await delay();
    return { success: true };
  }

  // Meal History
  async getMealLogs(params?: any) {
    await delay();
    return { logs: mockMealHistory };
  }

  async getNutritionStats(days = 7) {
    await delay();
    return {
      totalCalories: 8500,
      avgCalories: 1214,
      totalProtein: 420,
      totalCarbs: 950,
      totalFat: 280
    };
  }

  async logMeal(data: any) {
    await delay();
    return { ...data, id: Date.now().toString() };
  }

  // User Settings
  async getSettings() {
    await delay();
    return {
      id: '1',
      userId: mockUser.id,
      theme: 'light',
      notifications: true,
      emailNotifications: true
    };
  }

  async updateSettings(data: any) {
    await delay();
    return data;
  }

  async getUserStats() {
    await delay();
    return {
      favorites: mockFavorites.length,
      recipes: mockRecipes.length,
      reviews: mockReviews.length,
      mealPlans: mockMealPlans.length,
      mealLogs: mockMealHistory.length,
      families: 1
    };
  }

  // AI (mock responses)
  async chatWithAI(message: string, conversationId?: string) {
    await delay(500);
    return {
      response: "I'm a mock AI assistant. The real AI will be available when the backend is connected!",
      conversationId: conversationId || Date.now().toString()
    };
  }

  async getAIConversations() {
    await delay();
    return { conversations: [] };
  }

  async generateMealPlanWithAI(params: any) {
    await delay(1000);
    return { mealPlan: mockMealPlans[0] };
  }

  async generateRecipeFromIngredients(ingredients: string[]) {
    await delay(1000);
    return { recipe: mockRecipes[0] };
  }

  // Social
  async getUserProfile(id: string) {
    await delay();
    return mockUser;
  }

  async followUser(userId: string) {
    await delay();
    return { success: true };
  }

  async unfollowUser(userId: string) {
    await delay();
    return { success: true };
  }

  async getFeed() {
    await delay();
    return { activities: [] };
  }

  async getCollections() {
    await delay();
    return { collections: [] };
  }

  async createCollection(data: any) {
    await delay();
    return { ...data, id: Date.now().toString() };
  }

  async addToCollection(collectionId: string, recipeId: string) {
    await delay();
    return { success: true };
  }

  // Premium
  async createCheckoutSession(data: any) {
    await delay();
    return { url: 'https://mock-checkout-url.com' };
  }

  async getSubscription() {
    await delay();
    return { active: false };
  }

  async cancelSubscription() {
    await delay();
    return { success: true };
  }

  async validateCoupon(code: string) {
    await delay();
    return { valid: code === 'DEMO2026', discount: 20 };
  }
}

export const mockApi = new MockApiClient();
