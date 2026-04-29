// API client with automatic fallback to mock data
import { api } from './api';
import { mockApi } from './mockApi';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

class ApiWithFallback {
  private useMock = USE_MOCK_DATA;
  private backendAvailable = true;

  setToken(token: string | null) {
    api.setToken(token);
    mockApi.setToken(token);
  }

  private async tryApi<T>(apiCall: () => Promise<T>, mockCall: () => Promise<T>): Promise<T> {
    // If explicitly using mock data, skip real API
    if (this.useMock) {
      return mockCall();
    }

    // If backend was previously unavailable, use mock
    if (!this.backendAvailable) {
      return mockCall();
    }

    try {
      return await apiCall();
    } catch (error) {
      // Check if it's a network error (backend unavailable)
      if (error instanceof TypeError || 
          (error as Error).message?.includes('fetch') ||
          (error as Error).message?.includes('NetworkError')) {
        console.warn('Backend unavailable, falling back to mock data');
        this.backendAvailable = false;
        return mockCall();
      }
      // Re-throw other errors (like validation errors)
      throw error;
    }
  }

  // Auth
  async register(email: string, password: string, name: string) {
    return this.tryApi(
      () => api.register(email, password, name),
      () => mockApi.register(email, password, name)
    );
  }

  async login(email: string, password: string) {
    return this.tryApi(
      () => api.login(email, password),
      () => mockApi.login(email, password)
    );
  }

  async getMe() {
    return this.tryApi(
      () => api.getMe(),
      () => mockApi.getMe()
    );
  }

  async logout() {
    return this.tryApi(
      () => api.logout(),
      () => mockApi.logout()
    );
  }

  async updateProfile(data: any) {
    return this.tryApi(
      () => api.updateProfile(data),
      () => mockApi.updateProfile(data)
    );
  }

  // Meals
  async getMeals(params?: any) {
    return this.tryApi(
      () => api.getMeals(params),
      () => mockApi.getMeals(params)
    );
  }

  async getRandomMeals(count?: number) {
    return this.tryApi(
      () => api.getRandomMeals(count),
      () => mockApi.getRandomMeals(count)
    );
  }

  async getMeal(id: string) {
    return this.tryApi(
      () => api.getMeal(id),
      () => mockApi.getMeal(id)
    );
  }

  // Favorites
  async getFavorites(params?: any) {
    return this.tryApi(
      () => api.getFavorites(params),
      () => mockApi.getFavorites(params)
    );
  }

  async addFavorite(data: any) {
    return this.tryApi(
      () => api.addFavorite(data),
      () => mockApi.addFavorite(data)
    );
  }

  async removeFavorite(mealId: string) {
    return this.tryApi(
      () => api.removeFavorite(mealId),
      () => mockApi.removeFavorite(mealId)
    );
  }

  async checkFavorite(mealId: string) {
    return this.tryApi(
      () => api.checkFavorite(mealId),
      () => mockApi.checkFavorite(mealId)
    );
  }

  // Recipes
  async getRecipes(params?: any) {
    return this.tryApi(
      () => api.getRecipes(params),
      () => mockApi.getRecipes(params)
    );
  }

  async getRecipe(id: string) {
    return this.tryApi(
      () => api.getRecipe(id),
      () => mockApi.getRecipe(id)
    );
  }

  // Families
  async getFamilies() {
    return this.tryApi(
      () => api.getFamilies(),
      () => mockApi.getFamilies()
    );
  }

  async getFamily(id: string) {
    return this.tryApi(
      () => api.getFamily(id),
      () => mockApi.getFamily(id)
    );
  }

  // Notifications
  async getNotifications(unreadOnly?: boolean) {
    return this.tryApi(
      () => api.getNotifications(unreadOnly),
      () => mockApi.getNotifications(unreadOnly)
    );
  }

  async getUnreadCount() {
    return this.tryApi(
      () => api.getUnreadCount(),
      () => mockApi.getUnreadCount()
    );
  }

  // Meal Plans
  async getMealPlans() {
    return this.tryApi(
      () => api.getMealPlans(),
      () => mockApi.getMealPlans()
    );
  }

  // Shopping Lists
  async getShoppingLists() {
    return this.tryApi(
      () => api.getShoppingLists(),
      () => mockApi.getShoppingLists()
    );
  }

  // Meal History
  async getMealLogs(params?: any) {
    return this.tryApi(
      () => api.getMealLogs(params),
      () => mockApi.getMealLogs(params)
    );
  }

  // Delegate all other methods to the real API (they'll fail gracefully)
  [key: string]: any;
}

// Create proxy to forward all methods
const apiWithFallback = new ApiWithFallback();

// Forward all methods from api to apiWithFallback
Object.getOwnPropertyNames(Object.getPrototypeOf(api)).forEach(method => {
  if (method !== 'constructor' && typeof (api as any)[method] === 'function' && !(apiWithFallback as any)[method]) {
    (apiWithFallback as any)[method] = async (...args: any[]) => {
      return apiWithFallback.tryApi(
        () => (api as any)[method](...args),
        () => (mockApi as any)[method] ? (mockApi as any)[method](...args) : Promise.reject(new Error('Not implemented in mock'))
      );
    };
  }
});

export { apiWithFallback as api };
