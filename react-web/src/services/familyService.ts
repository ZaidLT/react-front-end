import axios from 'axios';

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

// Family member interface based on the new API response format
export interface FamilyMember {
  id: string;
  accountId: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  displayName: string;
  language: number;
  avatarImagePath: string;
  displayMode: number;
  activeUser: boolean;
  address: string;
  streetName: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  birthday: string;
  workplace: string;
  cellPhoneNumber: string;
  homePhoneNumber: string;
  propertySituation: string;
  activeFamily: boolean;
  activeFamilyMember: boolean;
}

// Family service
const familyService = {
  /**
   * Get all family members for an account
   * @param accountId - The account ID to get family members for
   * @returns Promise resolving to an array of family members
   */
  getFamilyMembers: async (accountId: string): Promise<FamilyMember[]> => {
    try {
      console.log('[LIFE_TAB_DEBUG] 🌐 API CALL: GET /users/account/' + accountId + '/all');
      console.log(`Fetching family members for account: ${accountId}`);

      const response = await axios.get(`${API_BASE_URL}/users/account/${accountId}/all`, {
        headers: getHeaders()
      });
      console.log('[LIFE_TAB_DEBUG] ✅ API RESPONSE: GET /users/account/' + accountId + '/all - Success');

      if (response.data && Array.isArray(response.data)) {
        console.log(`Successfully fetched ${response.data.length} family members`);
        return response.data;
      } else {
        console.warn('API response is not in expected format:', response.data);
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching family members:', error.message);
      
      // Return empty array on error to prevent app crashes
      return [];
    }
  },

  /**
   * Get active family members only (filtered by activeUser and activeFamilyMember flags)
   * @param accountId - The account ID to get family members for
   * @returns Promise resolving to an array of active family members
   */
  getActiveFamilyMembers: async (accountId: string): Promise<FamilyMember[]> => {
    try {
      const allMembers = await familyService.getFamilyMembers(accountId);
      
      // Filter out inactive users based on the same logic as the old React Native app
      const activeMembers = allMembers.filter((member) =>
        member.activeFamilyMember ? member.activeUser : true
      );
      
      console.log(`Filtered to ${activeMembers.length} active family members`);
      return activeMembers;
    } catch (error: any) {
      console.error('Error fetching active family members:', error.message);
      return [];
    }
  }
};

export default familyService;
