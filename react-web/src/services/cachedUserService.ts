import { User } from './types';
import userService from './userService';

// Cached user service that uses Zustand store for caching
class CachedUserService {
  private getStore() {
    // Dynamically import and get store state to avoid SSR issues
    if (typeof window === 'undefined') return null;

    try {
      // Use require for synchronous import in client-side context
      const { useUserProfileStore } = require('../context/store');
      return useUserProfileStore.getState();
    } catch (error) {
      console.warn('Failed to access user profile store:', error);
      return null;
    }
  }

  /**
   * Get user by ID with caching
   * @param userId - The user ID to get
   * @param accountId - The account ID (optional, will try to get from localStorage if not provided)
   * @param forceRefresh - Force refresh from API even if cached data exists
   * @returns Promise resolving to a user
   */
  async getUserById(userId: string, accountId?: string, forceRefresh: boolean = false): Promise<User | null> {
    try {
      const store = this.getStore();

      // If no store available (SSR), fall back to direct API call
      if (!store) {
        return await userService.getUserById(userId, accountId);
      }

      // Check cache first (unless force refresh)
      if (!forceRefresh && store.isCacheValid(userId)) {
        const cachedUser = store.getUserProfile(userId);
        if (cachedUser) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Cache HIT for user ${userId}`);
          }
          return cachedUser;
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`Cache MISS for user ${userId}, fetching from API`);
      }

      // Fetch from API
      const user = await userService.getUserById(userId, accountId);

      // Cache the result if successful
      if (user) {
        store.setUserProfile(userId, user);
      }

      return user;
    } catch (error) {
      console.error('Error in cached getUserById:', error);
      return null;
    }
  }

  /**
   * Update user and invalidate cache
   * @param user - The user data to update
   * @returns Promise resolving to the updated user
   */
  async updateUser(user: Partial<User>): Promise<User | null> {
    try {
      // Update via API
      const updatedUser = await userService.updateUser(user);

      // Invalidate and update cache for this user
      const store = this.getStore();
      if (updatedUser && store) {
        const userId = (updatedUser as any).id || updatedUser.UniqueId;
        if (userId) {
          store.invalidateUser(userId);
          // Immediately cache the updated user
          store.setUserProfile(userId, updatedUser);
        }
      }

      return updatedUser;
    } catch (error) {
      console.error('Error in cached updateUser:', error);
      return null;
    }
  }

  /**
   * Create user (no caching needed for creation)
   * @param userData - The user data to create
   * @returns Promise resolving to the created user
   */
  async createUser(userData: any): Promise<User | null> {
    return await userService.createUser(userData);
  }

  /**
   * Get current user with caching
   * @returns Promise resolving to the current user
   */
  async getCurrentUser(): Promise<User | null> {
    // For current user, we could cache by a special key like 'current'
    // but for now, just use the regular API call since it's less frequent
    return await userService.getCurrentUser();
  }

  /**
   * Clear cache for a specific user or all users
   * @param userId - Optional user ID to clear, if not provided clears all
   */
  clearCache(userId?: string): void {
    const store = this.getStore();
    if (store) {
      store.clearCache(userId);
    }
  }

  /**
   * Check if user data is cached and valid
   * @param userId - The user ID to check
   * @returns boolean indicating if cache is valid
   */
  isCached(userId: string): boolean {
    const store = this.getStore();
    if (!store) return false;
    return store.isCacheValid(userId);
  }

  /**
   * Preload user data into cache
   * @param userId - The user ID to preload
   * @param accountId - The account ID
   */
  async preloadUser(userId: string, accountId?: string): Promise<void> {
    try {
      await this.getUserById(userId, accountId);
    } catch (error) {
      // Preload failures are non-critical
      if (process.env.NODE_ENV === 'development') {
        console.log('User preload failed (non-critical):', error);
      }
    }
  }
}

// Export singleton instance
export default new CachedUserService();
