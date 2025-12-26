import axios from 'axios';

// Base URL for API - use Next.js API route to proxy requests
const API_BASE_URL = '/api';

// Headers for API requests
const REQUIRED_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// Types
export interface LoginResponse {
  emailAddress: string;
  loginSuccessful: boolean;
  token?: string;
  refreshToken?: string;
  userId?: string;
  accountId?: string;
  firstName?: string;
  lastName?: string;
  // Some backends include avatarImagePath at the top level
  avatarImagePath?: string;
  error?: string;
  user?: {
    id: string;
    accountId: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    // Some backends include avatarImagePath within the user object
    avatarImagePath?: string;
    language?: number;
    displayMode?: number;
    activeUser?: boolean;
    activeFamilyMember?: boolean;
  };
}

export interface RegisterResponse {
  success: boolean;
  userId?: string;
  oauthUrl?: string;
  error?: string;
}

export interface OAuthInitiateResponse {
  emailAddress: string;
  loginSuccessful: boolean;
  oauthUrl?: string;
  error?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  isValid?: boolean;
  error?: string;
}

export interface UserExistsResponse {
  exists: boolean;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  accountId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  error?: string;
  user?: {
    id: string;
    accountId: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    language?: number;
    displayMode?: number;
    activeUser?: boolean;
    activeFamilyMember?: boolean;
  };
}

// Authentication service
const authService = {
  /**
   * Login with email and password
   */
  login: async (
    emailAddress: string,
    password: string
  ): Promise<LoginResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          emailAddress,
          password,
          provider: 'email',
        },
        {
          headers: REQUIRED_HEADERS,
        }
      );

      // Add detailed logging in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log(
          'Full login response structure:',
          JSON.stringify(response.data, null, 2)
        );

        // Check if token exists in response or headers
        if (response.data.token) {
          console.log('Token found in response data');
        } else if (response.headers['authorization']) {
          console.log('Token found in authorization header');
        } else if (response.headers['x-auth-token']) {
          console.log('Token found in x-auth-token header');
        } else {
          console.log('No token found in response or headers');
        }
      }

      return response.data;
    } catch (error: any) {
      // Log minimal error info for debugging but don't expose sensitive details
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error.message || 'Unknown error');
      }

      // Check for specific error types to provide better user feedback
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          return {
            emailAddress,
            loginSuccessful: false,
            error: 'Invalid email or password. Please try again.',
          };
        } else if (error.response.status === 404) {
          return {
            emailAddress,
            loginSuccessful: false,
            error:
              'Account not found. Please check your email or create an account.',
          };
        }
      } else if (error.request) {
        // The request was made but no response was received
        return {
          emailAddress,
          loginSuccessful: false,
          error:
            'Unable to connect to the server. Please check your internet connection and try again.',
        };
      }

      // Generic error message for all other cases
      return {
        emailAddress,
        loginSuccessful: false,
        error: 'Unable to login. Please try again later.',
      };
    }
  },

  /**
   * Register a new user with email and password
   */
  register: async (
    emailAddress: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<RegisterResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          emailAddress,
          password,
          firstName,
          lastName,
          provider: 'email',
        },
        {
          headers: REQUIRED_HEADERS,
        }
      );

      return response.data;
    } catch (error: any) {
      // Log minimal error info for debugging but don't expose sensitive details
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', error.message || 'Unknown error');
      }

      // Check for specific error types to provide better user feedback
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 409) {
          return {
            success: false,
            error:
              'An account with this email already exists. Please use a different email or try logging in.',
          };
        } else if (error.response.status === 400) {
          return {
            success: false,
            error:
              'Invalid registration information. Please check your details and try again.',
          };
        }
      } else if (error.request) {
        // The request was made but no response was received
        return {
          success: false,
          error:
            'Unable to connect to the server. Please check your internet connection and try again.',
        };
      }

      // Generic error message for all other cases
      return {
        success: false,
        error: 'Unable to create your account. Please try again later.',
      };
    }
  },

  /**
   * Initiate OAuth login
   */
  initiateOAuthLogin: async (
    provider: 'google' | 'apple',
    redirectUrl: string = ''
  ): Promise<OAuthInitiateResponse> => {
    try {
      // Get the origin for the redirect URL
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const defaultRedirectUrl = `${origin}/oauth-callback`;
      const finalRedirectUrl = redirectUrl || defaultRedirectUrl;

      console.log(
        `Initiating OAuth login with ${provider} and redirect URL ${finalRedirectUrl}`
      );

      // Use the registration endpoint for OAuth login
      // This is a workaround because the backend API doesn't have a dedicated OAuth login endpoint
      const response = await axios.post(`/api/auth/register`, {
        emailAddress: 'placeholder@example.com', // This is required by the API but will be overridden by the OAuth provider
        firstName: 'Placeholder', // This is required by the API but will be overridden by the OAuth provider
        lastName: 'User', // This is required by the API but will be overridden by the OAuth provider
        provider,
        redirectUrl: finalRedirectUrl,
      });

      console.log('OAuth login response:', response.data);

      // Convert the registration response to a login response
      return {
        emailAddress: '',
        loginSuccessful: response.data.success,
        oauthUrl: response.data.oauthUrl,
        error: response.data.error,
      };
    } catch (error: any) {
      // Log minimal error info for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'OAuth initiation error:',
          error.message || 'Unknown error'
        );
      }

      // Generic error message
      return {
        emailAddress: '',
        loginSuccessful: false,
        error: 'Unable to connect with your account. Please try again later.',
      };
    }
  },

  /**
   * Handle OAuth login callback
   */
  handleOAuthLoginCallback: async (token: string): Promise<LoginResponse> => {
    try {
      console.log('handleOAuthLoginCallback called with token:', token);

      // Try multiple endpoint formats and parameter names
      const endpointFormats = [
        // Format 1: /auth/oauth/callback with token
        {
          url: `${API_BASE_URL}/auth/oauth/callback`,
          data: { token },
        },
        // Format 2: /auth/login/oauth/callback with token
        {
          url: `${API_BASE_URL}/auth/login/oauth/callback`,
          data: { token },
        },
        // Format 3: /auth/oauth/callback with code
        {
          url: `${API_BASE_URL}/auth/oauth/callback`,
          data: { code: token },
        },
        // Format 4: /auth/login/oauth/callback with code
        {
          url: `${API_BASE_URL}/auth/login/oauth/callback`,
          data: { code: token },
        },
        // Format 5: /auth/oauth/callback with auth_token
        {
          url: `${API_BASE_URL}/auth/oauth/callback`,
          data: { auth_token: token },
        },
        // Format 6: /auth/login/oauth/callback with auth_token
        {
          url: `${API_BASE_URL}/auth/login/oauth/callback`,
          data: { auth_token: token },
        },
        // Format 7: /auth/oauth/callback/token
        {
          url: `${API_BASE_URL}/auth/oauth/callback/token`,
          data: { token },
        },
        // Format 8: /auth/callback
        {
          url: `${API_BASE_URL}/auth/callback`,
          data: { token },
        },
      ];

      // Try each endpoint format
      let lastError = null;
      for (const endpoint of endpointFormats) {
        try {
          console.log(
            `Trying OAuth callback endpoint: ${endpoint.url} with data:`,
            endpoint.data
          );
          const response = await axios.post(endpoint.url, endpoint.data, {
            headers: REQUIRED_HEADERS,
          });
          console.log(
            `OAuth callback endpoint ${endpoint.url} succeeded with response:`,
            response.data
          );
          return response.data;
        } catch (error: any) {
          console.error(
            `OAuth callback endpoint ${endpoint.url} failed: ${error.message}`
          );
          if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
          }
          lastError = error;
        }
      }

      // If we get here, all endpoint formats failed
      throw (
        lastError || new Error('All OAuth callback endpoint formats failed')
      );
    } catch (error: any) {
      // Log error info for debugging
      console.error('OAuth callback error:', error.message || 'Unknown error');
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }

      // Generic error message
      return {
        emailAddress: '',
        loginSuccessful: false,
        error: 'Unable to complete authentication. Please try again.',
      };
    }
  },

  /**
   * Request password reset code
   */
  requestPasswordResetCode: async (
    emailAddress: string,
    redirectUrl: string
  ): Promise<PasswordResetResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/request-password-reset-code`,
        {
          emailAddress,
          redirectUrl,
        },
        {
          headers: REQUIRED_HEADERS,
        }
      );

      return response.data;
    } catch (error: any) {
      // Log minimal error info for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'Password reset request error:',
          error.message || 'Unknown error'
        );
      }

      if (error.response && error.response.status === 404) {
        return {
          success: false,
          error:
            'Email address not found. Please check your email or create an account.',
        };
      }

      // Generic error message
      return {
        success: false,
        error: 'Unable to send password reset email. Please try again later.',
      };
    }
  },

  /**
   * Validate reset code
   */
  validateResetCode: async (
    emailAddress: string,
    code: string
  ): Promise<PasswordResetResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password-with-code`,
        {
          emailAddress,
          code,
        },
        {
          headers: REQUIRED_HEADERS,
        }
      );

      return response.data;
    } catch (error: any) {
      // Log minimal error info for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'Code validation error:',
          error.message || 'Unknown error'
        );
      }

      if (error.response && error.response.status === 400) {
        return {
          success: false,
          error:
            'Invalid or expired code. Please try again or request a new code.',
        };
      }

      // Generic error message
      return {
        success: false,
        error: 'Unable to verify your code. Please try again.',
      };
    }
  },

  /**
   * Reset password with code
   */
  resetPasswordWithCode: async (
    emailAddress: string,
    code: string,
    newPassword: string
  ): Promise<PasswordResetResponse> => {
    const payload = {
      emailAddress,
      code,
      newPassword,
    };

    try {
      // Check if we have a recovery token from email link
      const accessToken = localStorage.getItem('auth_token');
      const headers = {
        ...REQUIRED_HEADERS,
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      };

      console.log('\n=== PASSWORD RESET API CALL DEBUG ===');
      console.log('URL:', `${API_BASE_URL}/auth/reset-password-with-code`);
      console.log('Method: POST');
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('Recovery Token Available:', !!accessToken);
      console.log('Note: Using recovery token if available from email link');
      console.log('=====================================\n');

      const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password-with-code`,
        payload,
        {
          headers,
        }
      );

      console.log('\n=== PASSWORD RESET API SUCCESS ===');
      console.log('Status:', response.status);
      console.log('Response Data:', JSON.stringify(response.data, null, 2));
      console.log('==================================\n');

      return response.data;
    } catch (error: any) {
      console.log('\n=== PASSWORD RESET API ERROR ===');
      console.log('Error Message:', error.message);
      console.log('Status Code:', error.response?.status);
      console.log('Request URL:', error.config?.url);
      console.log('Request Method:', error.config?.method?.toUpperCase());
      console.log('Request Payload:', JSON.stringify(payload, null, 2));
      console.log(
        'Request Headers:',
        JSON.stringify(error.config?.headers || {}, null, 2)
      );
      console.log('Response Status:', error.response?.status);
      console.log(
        'Response Headers:',
        JSON.stringify(error.response?.headers || {}, null, 2)
      );
      console.log(
        'Response Data:',
        JSON.stringify(error.response?.data || {}, null, 2)
      );
      console.log('Full Error Object:', error);
      console.log('================================\n');

      if (error.response) {
        if (error.response.status === 400) {
          return {
            success: false,
            error:
              error.response.data?.message ||
              error.response.data?.error ||
              'Invalid code or password. Please check your information and try again.',
          };
        }
      }

      // Generic error message
      return {
        success: false,
        error: 'Unable to reset your password. Please try again later.',
      };
    }
  },

  /**
   * Check if a user exists by email
   */
  checkUserExists: async (email: string): Promise<UserExistsResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/exists/${email}`,
        {
          headers: REQUIRED_HEADERS,
        }
      );

      return response.data;
    } catch (error: any) {
      // Log minimal error info for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'User existence check error:',
          error.message || 'Unknown error'
        );
      }

      // Return false as default for any error
      return {
        exists: false,
      };
    }
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh-token`,
        {
          refreshToken,
        },
        {
          headers: REQUIRED_HEADERS,
        }
      );

      return response.data;
    } catch (error: any) {
      // Log minimal error info for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Token refresh error:', error.message || 'Unknown error');
      }

      if (error.response && error.response.status === 401) {
        return {
          success: false,
          error: 'Your session has expired. Please login again.',
        };
      }

      // Generic error message
      return {
        success: false,
        error: 'Unable to refresh your session. Please login again.',
      };
    }
  },

  /**
   * Revoke refresh token (logout)
   */
  revokeToken: async (
    refreshToken: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/revoke-token`,
        {
          refreshToken,
        },
        {
          headers: REQUIRED_HEADERS,
        }
      );

      return response.data;
    } catch (error: any) {
      // Log minimal error info for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'Token revocation error:',
          error.message || 'Unknown error'
        );
      }

      // Always return success for logout attempts, even if the server call fails
      // This ensures the user can still log out locally even if the server is unreachable
      return {
        success: true,
        message: 'Logged out successfully.',
      };
    }
  },
};

export default authService;
