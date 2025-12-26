import axios from 'axios';
import { User } from './types';
import familyService, { FamilyMember } from './familyService';

// Base URL for API - use Next.js API route to proxy requests
const API_BASE_URL = '/api';

// Headers for API requests
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// User service
const userService = {
  /**
   * Get user by ID
   * @param userId - The user ID to get
   * @param accountId - The account ID (optional, will try to get from localStorage if not provided)
   * @returns Promise resolving to a user
   */
  getUserById: async (userId: string, accountId?: string): Promise<User | null> => {
    try {
      // Get accountId from parameter or localStorage
      const finalAccountId = accountId || (typeof window !== 'undefined' ? localStorage.getItem('accountId') : null);

      if (!finalAccountId) {
        console.error('Account ID is required for getUserById');
        return null;
      }

      const response = await axios.get(`${API_BASE_URL}/users/${userId}?accountId=${finalAccountId}`, {
        headers: getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      return null;
    }
  },

  /**
   * Get current user (based on auth token)
   * @returns Promise resolving to the current user
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Error fetching current user:', error.message);
      return null;
    }
  },

  /**
   * Update user profile
   * @param user - The user data to update
   * @returns Promise resolving to the updated user
   */
  updateUser: async (user: Partial<User>): Promise<User | null> => {
    try {
      // Use the user's ID for the update endpoint
      // AuthContext uses 'id' field, but User type has 'UniqueId'
      const userId = (user as any).id || user.UniqueId;

      // Debug logging
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('updateUser called with user:', user);
        console.log('userId extracted:', userId);
        console.log('user.id:', (user as any).id);
        console.log('user.UniqueId:', user.UniqueId);
      }

      if (!userId) {
        console.error('User object:', user);
        throw new Error('User ID is required for update');
      }

      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, user, {
        headers: getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error.message);
      return null;
    }
  },

  /**
   * Check if a user exists by email
   * @param email - The email to check
   * @returns Promise resolving to whether the user exists
   */
  checkUserExists: async (email: string): Promise<{ exists: boolean }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/exists/${email}`, {
        headers: getHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Error checking if user exists:', error.message);
      return { exists: false };
    }
  },

  /**
   * Get all family members for an account
   * @param accountId - The account ID to get family members for
   * @returns Promise resolving to an array of family members
   */
  getFamilyMembers: async (accountId: string): Promise<FamilyMember[]> => {
    return familyService.getFamilyMembers(accountId);
  },

  /**
   * Get active family members only
   * @param accountId - The account ID to get family members for
   * @returns Promise resolving to an array of active family members
   */
  getActiveFamilyMembers: async (accountId: string): Promise<FamilyMember[]> => {
    return familyService.getActiveFamilyMembers(accountId);
  },

  /**
   * Create a new user
   * @param userData - The user data to create
   * @returns Promise resolving to the created user
   */
  createUser: async (userData: {
    accountId: string;
    emailAddress: string;
    firstName: string;
    lastName?: string;
    displayName?: string;
    language?: number;
    avatarImagePath?: string;
    displayMode?: number;
    activeUser?: boolean;
    address?: string;
    streetName?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    birthday?: string;
    workplace?: string;
    cellPhoneNumber?: string;
    homePhoneNumber?: string;
    propertySituation?: string;
    activeFamily?: boolean;
    activeFamilyMember?: boolean;
  }): Promise<User | null> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData, {
        headers: getHeaders()
      });

      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      return null;
    }
  }
};

export default userService;
