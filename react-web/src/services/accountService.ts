/**
 * Account Service
 * 
 * This service handles account-related operations including deletion.
 */

import axios from 'axios';

// API configuration
const API_BASE_URL = '/api'; // Use local proxy

// Required headers for API requests
const REQUIRED_HEADERS = {
  'Content-Type': 'application/json',
};

// Get auth headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    ...REQUIRED_HEADERS,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Types for account deletion
export interface AccountDeletionRequest {
  accountId: string;
  emailAddress: string;
}

export interface AccountDeletionValidationRequest {
  accountId: string;
  emailAddress: string;
  deletionCode: string;
}

export interface AccountPurgeRequest {
  accountId: string;
  deletionCode: string;
}

export interface AccountDeletionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

const accountService = {
  /**
   * Send account deletion email
   */
  sendDeletionEmail: async (request: AccountDeletionRequest): Promise<AccountDeletionResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/delete`, request, {
        headers: getAuthHeaders()
      });

      return response.data;
    } catch (error: any) {
      // Log minimal error info for debugging but don't expose sensitive details
      if (process.env.NODE_ENV === 'development') {
        console.error('Account deletion email error:', error.message || 'Unknown error');
      }

      // Handle different error scenarios
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'You must be logged in to delete your account.'
        };
      }

      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'You do not have permission to delete this account.'
        };
      }

      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Account not found.'
        };
      }

      // Generic error message for all other cases
      return {
        success: false,
        error: 'Unable to send deletion email. Please try again later.'
      };
    }
  },

  /**
   * Validate account deletion code
   */
  validateDeletionCode: async (request: AccountDeletionValidationRequest): Promise<AccountDeletionResponse> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/accounts/delete`, request, {
        headers: getAuthHeaders()
      });

      return response.data;
    } catch (error: any) {
      // Log minimal error info for debugging but don't expose sensitive details
      if (process.env.NODE_ENV === 'development') {
        console.error('Account deletion validation error:', error.message || 'Unknown error');
      }

      // Handle different error scenarios
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'You must be logged in to validate the deletion code.'
        };
      }

      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'Invalid deletion code or you do not have permission to delete this account.'
        };
      }

      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Account not found.'
        };
      }

      // Generic error message for all other cases
      return {
        success: false,
        error: 'Unable to validate deletion code. Please try again later.'
      };
    }
  },

  /**
   * Permanently delete account
   */
  purgeAccount: async (request: AccountPurgeRequest): Promise<AccountDeletionResponse> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/accounts/delete`, {
        headers: getAuthHeaders(),
        data: request
      });

      return response.data;
    } catch (error: any) {
      // Log minimal error info for debugging but don't expose sensitive details
      if (process.env.NODE_ENV === 'development') {
        console.error('Account purge error:', error.message || 'Unknown error');
      }

      // Handle different error scenarios
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'You must be logged in to delete your account.'
        };
      }

      if (error.response?.status === 403) {
        return {
          success: false,
          error: 'Invalid deletion code or you do not have permission to delete this account.'
        };
      }

      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Account not found.'
        };
      }

      // Generic error message for all other cases
      return {
        success: false,
        error: 'Unable to delete account. Please try again later.'
      };
    }
  }
};

export default accountService;
