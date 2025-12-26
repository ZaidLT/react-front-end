'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import authService from '../services/authService';
import { isTokenExpired, extractUserFromToken, extractUserMetadata, hasUserMetadata } from '../util/jwtUtils';
import cachedUserService from '../services/cachedUserService';

import { initAnalytics, setAnalyticsUser, clearAnalyticsUser, trackEvent, AmplitudeEvents } from '../services/analytics';

// Import session debugger only in debug mode
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
  import('../util/sessionDebugger');
}

interface AuthUser {
  accountId?: string;
  avatarImagePath?: string;
  email: string;
  firstName: string;
  id: string;
  language: string;
  lastName: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  validateResetCode: (email: string, code: string) => Promise<boolean>;
  initiateOAuthLogin: (provider: 'google' | 'apple') => Promise<string | null>;
  updateUser: (updatedUserData: Partial<AuthUser>) => void;
  refreshUserData: () => Promise<boolean>;
  clearError: () => void;
  isProcessingUrlToken: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Get current pathname for route change detection
  const pathname = usePathname();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Track if auth has been initialized
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  // Track current URL to detect changes
  const [currentUrl, setCurrentUrl] = useState('');

  // Track if URL token processing is in progress
  const [isProcessingUrlToken, setIsProcessingUrlToken] = useState(false);

  // REMOVED: Auth check completion tracking ref

  // Function to get user data from localStorage
  const getUserDataFromStorage = (): AuthUser | null => {
    try {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('📖 getUserDataFromStorage called');
      }

      const userData = localStorage.getItem('user_data');
      const userId = localStorage.getItem('user_id');
      const accountId = localStorage.getItem('account_id');
      const userMetadata = localStorage.getItem('user_metadata');

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('  Session storage status:');
        console.log('    user_data exists:', !!userData);
        console.log('    user_id:', userId);
        console.log('    account_id:', accountId);
        console.log('    user_metadata exists:', !!userMetadata);
        if (userMetadata) {
          try {
            console.log('    user_metadata content:', JSON.parse(userMetadata));
          } catch (e) {
            console.log('    user_metadata parse error:', e);
          }
        }
      }

      if (userData) {
        const parsedData = JSON.parse(userData);
        if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
          console.log('  ✅ Retrieved user data from localStorage:', parsedData);
        }
        return parsedData;
      }

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('  ❌ No user data found in localStorage');
      }
      return null;
    } catch (error) {
      console.error('❌ Error retrieving user data from localStorage:', error);
      return null;
    }
  };

  // Function to store user data with proper metadata handling
  const storeUserData = (userData: AuthUser, token?: string) => {
    try {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('💾 storeUserData called');
        console.log('  User data:', userData);
        console.log('  Token provided:', !!token);
        console.log('  Token has user_metadata:', token ? hasUserMetadata(token) : false);
      }

      // Store user data in localStorage for persistence
      localStorage.setItem('user_data', JSON.stringify(userData));
      localStorage.setItem('user_id', userData.id);
      localStorage.setItem('account_id', userData.accountId || '');

      // Set cookies with appropriate security attributes
      document.cookie = `user_id=${userData.id}; path=/; max-age=86400; SameSite=Strict`;
      document.cookie = `account_id=${userData.accountId || ''}; path=/; max-age=86400; SameSite=Strict`;

      // If token is provided, also store token metadata for future reference
      if (token && hasUserMetadata(token)) {
        const userMetadata = extractUserMetadata(token);
        if (userMetadata) {
          localStorage.setItem('user_metadata', JSON.stringify(userMetadata));
          if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
            console.log('  ✅ Stored user_metadata from token:', userMetadata);
          }
        }
      }

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('✅ Successfully stored user session data');
        console.log('  localStorage keys set:', ['user_data', 'user_id', 'account_id']);
        console.log('  Cookies set:', ['user_id', 'account_id']);

      }

      // Initialize and attribute Amplitude user context (outside debug logging)
      try {
        initAnalytics();
        setAnalyticsUser(userData.id, userData.accountId);
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Amplitude attribution failed (non-blocking):', e);
        }
      }

    } catch (error) {
      console.error('❌ Error storing user data:', error);
    }
  };

  // Function to check if user data is incomplete
  const isUserDataIncomplete = (user: AuthUser | null): boolean => {
    if (!user) return true;

    // Check if essential fields are missing or empty

    const hasEmptyName = !user.firstName?.trim() || !user.lastName?.trim();
    const hasEmptyEmail = !user.email?.trim();

    return hasEmptyName || hasEmptyEmail;
  };

  // Function to silently refresh user data
  const silentlyRefreshUserData = async (): Promise<AuthUser | null> => {
    try {
      const accessToken = localStorage.getItem('auth_token');
      if (!accessToken) {
        console.log('No access token available for silent refresh');
        return null;
      }

      console.log('Silently refreshing user data...');

      // Call the getUser API endpoint
      const response = await fetch('/api/users/getUser', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        console.error('Failed to refresh user data:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();

      if (data.success && data.user) {
        const refreshedUser: AuthUser = {
          id: data.user.id,
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          email: data.user.emailAddress || data.user.email || '',
          accountId: data.user.accountId || '',
          avatarImagePath: data.user.avatarImagePath || '',
          language: data.user.language || 'en',
        };

        console.log('Successfully refreshed user data:', refreshedUser);

        // Update localStorage with fresh data
        localStorage.setItem('user_data', JSON.stringify(refreshedUser));
        localStorage.setItem('user_id', refreshedUser.id);
        localStorage.setItem('account_id', refreshedUser.accountId || '');

        // Update cookies
        document.cookie = `user_id=${refreshedUser.id}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `account_id=${refreshedUser.accountId || ''}; path=/; max-age=86400; SameSite=Strict`;

        return refreshedUser;
      } else {
        console.error('Invalid response format from user data refresh:', data);
        return null;
      }
    } catch (error) {
      console.error('Error during silent user data refresh:', error);
      return null;
    }
  };

  // Helper to reset all in-memory Zustand stores and caches for a clean session
  const resetApplicationState = (): void => {
    try {
      if (typeof window === 'undefined') return;

      // Dynamically require to avoid SSR issues
      const stores = require('../context/store');

      // Reset list-based stores
      stores.useEventStore?.setState?.({ events: [] });
      stores.useTaskStore?.setState?.({ tasks: [] });
      stores.useTileStore?.setState?.({ tiles: [] });
      stores.useNoteStore?.setState?.({ notes: [] });
      stores.useContactStore?.setState?.({ contacts: [] });
      stores.useUserStore?.setState?.({ users: [], user: null });
      stores.useFamilyStore?.setState?.({ family: [] });
      stores.useEventUsersStore?.setState?.({ eventUsers: [] });
      stores.useTileFileStore?.setState?.({ tileFiles: [] });
      stores.useMemberFileStore?.setState?.({ memberFiles: [] });
      stores.useFileStore?.setState?.({ files: [] });
      stores.useProviderStore?.setState?.({ providers: [] });
      stores.useContactFileStore?.setState?.({ contactFiles: [] });
      stores.useActivityStore?.setState?.({ activities: [] });
      stores.useEventTimeStore?.setState?.({ eventTimes: [] });

      // Reset cache metadata so pages know to refetch
      stores.useCacheStore?.setState?.({
        tasks: { lastFetched: 0, isRefreshing: false },
        events: { lastFetched: 0, isRefreshing: false },
        tiles: { lastFetched: 0, isRefreshing: false },
      });

      // Clear user/profile-specific caches
      stores.useUserProfileStore?.getState?.().clearCache();
      stores.usePropertyInfoStore?.getState?.().clearCache();

      // Also clear any service-level caches
      try { cachedUserService.clearCache(); } catch {}
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('resetApplicationState failed:', e);
      }
    }
  };

  // Helper function to aggressively clear all browser storage and reset app state
  const clearAllStorage = (reason: string): void => {

    if (process.env.NODE_ENV === 'development') {
      console.log(`Clearing browser storage - Reason: ${reason}`);
    }

    // First reset in-memory state to avoid stale UI during same-session transitions
    resetApplicationState();

    // Clear localStorage and sessionStorage
    try { localStorage.clear(); } catch {}
    try { sessionStorage.clear(); } catch {}

    // Clear cookies related to authentication
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';

    // Explicitly remove commonly used user keys (defensive)
    try {
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_id');
      localStorage.removeItem('account_id');
      localStorage.removeItem('user_metadata');
    } catch {}


  };

  // We now rely entirely on JWT token data for user information
  // No need for separate user data fetching
  // Check for existing token on mount and on route changes


  useEffect(() => {
    // Skip if already initialized to prevent infinite loops
    if (isAuthInitialized) {
      return;
    }

    const checkAuth = async () => {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('🔄 Auth check triggered');
        console.log('  Pathname:', pathname);
        console.log('  Is auth initialized:', isAuthInitialized);
        console.log('  Current auth state:', {
          isAuthenticated: authState.isAuthenticated,
          userId: authState.user?.id,
          userEmail: authState.user?.email
        });
      }

      // Only run in browser environment
      if (typeof window === 'undefined') {
        if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
          console.log('  ❌ Skipping auth check - not in browser environment');
        }
        return;
      }

      // Check if URL contains token parameters
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');

      if (urlToken) {
        // Efficient validation check - only validate if something actually changed
        let urlUserId = urlParams.get('userId');
        const currentToken = localStorage.getItem('auth_token');
        const currentUserId = localStorage.getItem('user_id');
        const currentUser = getUserDataFromStorage();

        // Smart userId handling: if URL userId is empty but we have a stored one and token hasn't changed, use stored
        if (!urlUserId && currentUserId && currentToken === urlToken) {
          urlUserId = currentUserId;
        }

        // Check if we need to validate
        const tokenChanged = currentToken !== urlToken;
        const userChanged = currentUserId !== urlUserId;
        const tokenExpired = currentToken ? isTokenExpired(currentToken) : true;
        const noExistingSession = !currentUser || !currentUser.id || !currentUser.email;

        const needsValidation = tokenChanged || userChanged || tokenExpired || noExistingSession;



        if (!needsValidation) {

          // Clean up URL parameters since we don't need them
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('token');
          newUrl.searchParams.delete('userId');
          window.history.replaceState({}, '', newUrl.toString());
          // Continue with normal auth check (which will be fast since we have valid data)
        } else {



          setIsProcessingUrlToken(true);
          // Don't proceed with normal auth check - let URL token processing handle it
          return;
        }
      }

      // URL token processing is now handled by a separate useEffect
      // This ensures it works on all pages, not just during auth checks

      // Check for access token in storage
      let accessToken = localStorage.getItem('auth_token');
      if (!accessToken) {
        const accessTokenCookie = document.cookie.split('; ').find(row => row.startsWith('auth_token='));
        if (accessTokenCookie) {
          accessToken = accessTokenCookie.split('=')[1];
          localStorage.setItem('auth_token', accessToken);
        }
      }

      // Check for refresh token
      let refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        const refreshTokenCookie = document.cookie.split('; ').find(row => row.startsWith('refresh_token='));
        if (refreshTokenCookie) {
          refreshToken = refreshTokenCookie.split('=')[1];
          localStorage.setItem('refresh_token', refreshToken);
        }
      }

      // If no refresh token is found, user is not authenticated
      if (!refreshToken) {
        console.log('No refresh token found, user is not authenticated');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        setIsAuthInitialized(true);
        return;
      }

      // Try to get user data from localStorage
      let userData = getUserDataFromStorage();

      // Check if access token is valid and not expired
      let needsRefresh = true;

      if (accessToken) {
        try {
          // Check if token is expired or about to expire (with a 5-minute buffer)
          const tokenExpired = isTokenExpired(accessToken, 300); // 5 minutes buffer

          if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
            console.log('🔑 Token validation during auth check:');
            console.log('  Access token exists:', !!accessToken);
            console.log('  Token expired (5min buffer):', tokenExpired);
            console.log('  User data exists:', !!userData);
            console.log('  Has user_metadata:', hasUserMetadata(accessToken));
            if (hasUserMetadata(accessToken)) {
              const metadata = extractUserMetadata(accessToken);
              console.log('  Token user_metadata:', metadata);
            }
          }

          if (!tokenExpired && userData) {
            if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
              console.log('  ✅ Access token is still valid, using cached user data');
            }
            needsRefresh = false;

            // Use the existing token and user data
            setAuthState({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // Preload user data into cache for faster subsequent page loads
            if (userData.id && userData.accountId) {
              cachedUserService.preloadUser(userData.id, userData.accountId).catch(error => {
                // Preload failures are non-critical, just log them
                if (process.env.NODE_ENV === 'development') {
                  console.log('User preload during auth init failed (non-critical):', error);
                }
              });
            }
          } else {
            console.log('Access token is expired or about to expire, refreshing...');
          }
        } catch (error) {
          console.error('Error validating access token:', error);
          // Continue to refresh if token validation fails
        }
      }

      // Only refresh the token if needed
      if (needsRefresh) {
        try {
          console.log('Refreshing token with backend');
          const refreshResponse = await authService.refreshToken(refreshToken);

          if (refreshResponse.success && refreshResponse.accessToken) {
            console.log('Token refresh successful');

            // Update tokens in storage with secure practices
            localStorage.setItem('auth_token', refreshResponse.accessToken);

            // Set cookies with appropriate security attributes
            // Access token: 7 days (604800 seconds)
            document.cookie = `auth_token=${refreshResponse.accessToken}; path=/; max-age=604800; SameSite=Strict; secure`;

            if (refreshResponse.refreshToken) {
              localStorage.setItem('refresh_token', refreshResponse.refreshToken);
              // Refresh token: 30 days (2592000 seconds)
              document.cookie = `refresh_token=${refreshResponse.refreshToken}; path=/; max-age=2592000; SameSite=Strict; secure`;
            }

            // Extract user data from refresh response
            userData = {
              id: refreshResponse.userId || (refreshResponse.user && refreshResponse.user.id) || '',
              firstName: refreshResponse.firstName || (refreshResponse.user && refreshResponse.user.firstName) || '',
              lastName: refreshResponse.lastName || (refreshResponse.user && refreshResponse.user.lastName) || '',
              email: refreshResponse.email || (refreshResponse.user && refreshResponse.user.emailAddress) || '',
              accountId: refreshResponse.accountId || (refreshResponse.user && refreshResponse.user.accountId) || '',
              language: refreshResponse.user && refreshResponse.user.language ? String(refreshResponse.user.language) : 'en',
            };

            // Store user data in localStorage for persistence
            localStorage.setItem('user_data', JSON.stringify(userData));

            // Also store user ID in a separate key for easier access
            localStorage.setItem('user_id', userData.id);
            localStorage.setItem('account_id', userData.accountId || '');

            // Set a cookie with the user ID for cross-page persistence
            document.cookie = `user_id=${userData.id}; path=/; max-age=86400; SameSite=Strict`;
            document.cookie = `account_id=${userData.accountId || ''}; path=/; max-age=86400; SameSite=Strict`;

            if (process.env.NODE_ENV === 'development') {
              console.log('Auth data stored in localStorage and cookies:', {
                userId: userData.id,
                accountId: userData.accountId,
                name: `${userData.firstName} ${userData.lastName}`
              });
            }

            // Update auth state with user data
            setAuthState({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // Preload user data into cache for faster subsequent page loads
            if (userData.id && userData.accountId) {
              cachedUserService.preloadUser(userData.id, userData.accountId).catch(error => {
                // Preload failures are non-critical, just log them
                if (process.env.NODE_ENV === 'development') {
                  console.log('User preload during token refresh failed (non-critical):', error);
                }
              });
            }
          } else {
            // Refresh failed, clear auth state and storage
            console.error('Token refresh failed:', refreshResponse.error || 'Unknown error');
            clearAllStorage('Token refresh failed');
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
          clearAllStorage('Token refresh error');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      }
    };

    // Run the auth check
    checkAuth().then(() => {
      // Set initialization flag after auth check completes
      setIsAuthInitialized(true);


      // After auth check, check if we need to silently refresh user data
      const currentUserData = getUserDataFromStorage();
      if (currentUserData && isUserDataIncomplete(currentUserData)) {
        const accessToken = localStorage.getItem('auth_token');
        if (accessToken && !isTokenExpired(accessToken, 300)) {
          console.log('Performing silent user data refresh after auth check...');

          // Perform silent refresh in the background
          silentlyRefreshUserData().then((refreshedUser) => {
            if (refreshedUser) {
              console.log('Silent refresh successful, updating auth state');

              // Update auth state with refreshed user data
              setAuthState(prevState => ({
                ...prevState,
                user: refreshedUser
              }));
            } else {
              console.log('Silent refresh failed, keeping existing user data');
            }
          }).catch((error) => {
            console.error('Silent refresh error:', error);
            // Keep existing state on error
          });
        }
      }
    });

    // This effect should run on initial mount only
    // Remove isAuthInitialized from dependencies to prevent infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // isAuthInitialized intentionally excluded to prevent infinite loops

  // Separate effect to handle route changes after initialization
  useEffect(() => {
    // Only run after auth is initialized and on route changes
    if (!isAuthInitialized) {
      return;
    }

    // Check if we need to refresh auth state on route change
    const accessToken = localStorage.getItem('auth_token');
    if (accessToken && isTokenExpired(accessToken, 300)) {
      console.log('Token expired on route change, triggering refresh...');
      // Reset initialization to trigger auth check
      setIsAuthInitialized(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // isAuthInitialized intentionally excluded to prevent infinite loops

  // Separate effect to handle URL tokens - runs whenever the URL changes
  useEffect(() => {
    const handleUrlToken = async () => {
      // Only run in browser environment
      if (typeof window === 'undefined') {
        return;
      }

      // Check for token and userId in URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      const urlUserId = urlParams.get('userId');

      if (urlToken) {

        // Smart userId handling: if URL userId is empty but we have a stored one and token hasn't changed, use stored
        let effectiveUserId = urlUserId;
        const currentToken = localStorage.getItem('auth_token');
        const currentUserId = localStorage.getItem('user_id');
        const currentUser = getUserDataFromStorage();

        if (!effectiveUserId && currentUserId && currentToken === urlToken) {
          effectiveUserId = currentUserId;
        }



        // Efficient validation check - only validate if something actually changed
        const tokenChanged = currentToken !== urlToken;
        const userChanged = currentUserId !== effectiveUserId;
        const tokenExpired = currentToken ? isTokenExpired(currentToken) : true;
        const noExistingSession = !currentUser || !currentUser.id || !currentUser.email;

        const needsValidation = tokenChanged || userChanged || tokenExpired || noExistingSession;

        if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
          console.log('🔍 Session validation check:');
          console.log('  Current token exists:', !!currentToken);
          console.log('  Current user ID:', currentUserId);
          console.log('  URL token length:', urlToken?.length || 0);
          console.log('  Effective user ID:', effectiveUserId);
          console.log('  Token changed:', tokenChanged);
          console.log('  User changed:', userChanged);
          console.log('  Token expired:', tokenExpired);
          console.log('  No existing session:', noExistingSession);
          console.log('  Needs validation:', needsValidation);
          if (currentUser) {
            console.log('  Current session user:', { id: currentUser.id, email: currentUser.email, accountId: currentUser.accountId });
          }
        }



        if (!needsValidation) {

          // Clean up URL parameters
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('token');
          newUrl.searchParams.delete('userId');
          window.history.replaceState({}, '', newUrl.toString());
          setIsProcessingUrlToken(false);
          return;
        }

        // Set processing state to prevent AuthGuard from redirecting
        setIsProcessingUrlToken(true);

        // Create a unique key for this token + current timestamp to ensure processing
        const tokenKey = `${urlToken.substring(0, 20)}_${Date.now()}`;
        const lastProcessedKey = sessionStorage.getItem('last_processed_token_key');

        // Only skip if it's the exact same token processed very recently (within 5 seconds)
        if (lastProcessedKey && Math.abs(Date.now() - parseInt(lastProcessedKey.split('_')[1])) < 5000 &&
            lastProcessedKey.startsWith(urlToken.substring(0, 20))) {

          setIsProcessingUrlToken(false);
          return;
        }

        // Mark this token as being processed
        sessionStorage.setItem('last_processed_token_key', tokenKey);

        try {
          // Validate the token and extract user information
          if (!isTokenExpired(urlToken)) {
            let userData = null;

            // Check if token contains the new user_metadata structure
            if (hasUserMetadata(urlToken)) {
              if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
                console.log('🚀 Processing URL token with user_metadata structure');
                console.log('  URL token length:', urlToken.length);
                console.log('  Effective userId from URL:', effectiveUserId);
              }

              const userMetadata = extractUserMetadata(urlToken);
              const tokenPayload = extractUserFromToken(urlToken);

              if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
                console.log('  Extracted metadata:', userMetadata);
                console.log('  Extracted payload:', tokenPayload);
              }

              if (userMetadata && tokenPayload) {
                // If userId is provided, validate it matches the token or is in the same account
                if (effectiveUserId) {
                  if (userMetadata.userId === effectiveUserId) {
                    // Direct match
                    console.log('Direct userId match with token user_metadata');
                    userData = {
                      id: userMetadata.userId,
                      firstName: tokenPayload.firstName,
                      lastName: tokenPayload.lastName,
                      email: tokenPayload.email,
                      accountId: userMetadata.accountId
                    };
                  } else {
                    // Check if userId belongs to same account (family member)
                    try {
                      const validationResponse = await fetch('/api/users/validate-user', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          userId: effectiveUserId,
                          token: urlToken
                        })
                      });

                      if (validationResponse.ok) {
                        const validationResult = await validationResponse.json();
                        if (validationResult.success) {
                          userData = validationResult.user;
                          console.log('UserId validation successful via user_metadata');
                        } else {
                          console.error('UserId validation failed:', validationResult.error);
                        }
                      } else {
                        console.error('UserId validation request failed:', validationResponse.status, validationResponse.statusText);
                      }
                    } catch (userIdError) {
                      console.error('Error during userId validation:', userIdError);
                    }
                  }
                } else {
                  // No userId provided, use the token user directly
                  console.log('Using token user_metadata directly (no userId provided)');
                  userData = {
                    id: userMetadata.userId,
                    firstName: tokenPayload.firstName,
                    lastName: tokenPayload.lastName,
                    email: tokenPayload.email,
                    accountId: userMetadata.accountId
                  };
                }
              }
            } else {
              // Fallback to legacy token processing
              if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
                console.log('Processing URL token with legacy format');
              }

              // First, try userId validation if userId parameter is present
              if (effectiveUserId) {
                try {
                  const validationResponse = await fetch('/api/users/validate-user', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      userId: effectiveUserId,
                      token: urlToken
                    })
                  });

                  if (validationResponse.ok) {
                    const validationResult = await validationResponse.json();
                    if (validationResult.success) {
                      userData = validationResult.user;
                      console.log('UserId validation successful (legacy)');
                    } else {
                      console.error('UserId validation failed (legacy):', validationResult.error);
                    }
                  } else {
                    console.error('UserId validation request failed (legacy):', validationResponse.status, validationResponse.statusText);
                  }
                } catch (userIdError) {
                  console.error('Error during userId validation (legacy):', userIdError);
                }
              }

              // Fallback: If userId validation failed or userId not provided, try email-based lookup
              if (!userData) {
                const tokenPayload = extractUserFromToken(urlToken);
                if (tokenPayload && tokenPayload.email) {
                  // Store the token temporarily for the API call
                  localStorage.setItem('auth_token', urlToken);
                  localStorage.setItem('refresh_token', urlToken);

                  try {
                    // Fetch user data from backend using the email from the token
                    const response = await fetch('/api/users/me', {
                      headers: {
                        'Authorization': `Bearer ${urlToken}`,
                        'Content-Type': 'application/json'
                      }
                    });

                    if (response.ok) {
                      const backendUserData = await response.json();
                      userData = {
                        id: backendUserData.id,
                        firstName: backendUserData.firstName,
                        lastName: backendUserData.lastName,
                        email: backendUserData.emailAddress,
                        accountId: backendUserData.accountId
                      };
                      console.log('Email-based user lookup successful (legacy)');
                    } else {
                      console.error('Failed to fetch user data from backend (legacy):', response.status, response.statusText);
                    }
                  } catch (fetchError) {
                    console.error('Error fetching user data from backend (legacy):', fetchError);
                  }
                } else {
                  console.error('Could not extract email from URL token (legacy)');
                }
              }
            }

            // If we have valid user data, proceed with authentication
            if (userData) {


              // Check if this token is for a different user than the current session
              const currentUserData = getUserDataFromStorage();
              const currentUserEmail = currentUserData?.email;
              const newUserEmail = userData.email;

              if (currentUserEmail && currentUserEmail !== newUserEmail) {

                clearAllStorage('User switch - different token user');

                // Clear the current auth state
                setAuthState({
                  user: null,
                  isAuthenticated: false,
                  isLoading: true,
                  error: null
                });
              } else if (currentUserEmail === newUserEmail) {

              } else {

              }

              // Store the token
              localStorage.setItem('auth_token', urlToken);
              localStorage.setItem('refresh_token', urlToken);

              // Set cookies with appropriate security attributes
              document.cookie = `auth_token=${urlToken}; path=/; max-age=604800; SameSite=Strict; secure`;
              document.cookie = `refresh_token=${urlToken}; path=/; max-age=2592000; SameSite=Strict; secure`;

              // Store user data using the helper function
              storeUserData(userData, urlToken);

              // Update auth state
              setAuthState({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
                error: null
              });

              if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
                console.log('✅ Session established from URL token');
                console.log('  User:', { id: userData.id, email: userData.email, accountId: userData.accountId });
                console.log('  Token has user_metadata:', hasUserMetadata(urlToken));
                console.log('  Session debugging available: call debugSession() in console');
              }






              // Clean up URL by removing the token and userId parameters
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('token');
              newUrl.searchParams.delete('userId');
              window.history.replaceState({}, '', newUrl.toString());

              // Mark URL token processing as complete
              setIsProcessingUrlToken(false);
              setIsAuthInitialized(true);

              return;
            } else {
              console.error('Authentication failed: Could not validate user with provided token and userId parameters');
              setIsProcessingUrlToken(false);
              setIsAuthInitialized(true);
            }
          } else {
            console.error('URL token is expired');
            setIsProcessingUrlToken(false);
            setIsAuthInitialized(true);
          }
        } catch (error) {
          console.error('Error processing URL token:', error);
          setIsProcessingUrlToken(false);
          setIsAuthInitialized(true);
        }
      } else {
        // No URL token found, ensure processing state is reset
        setIsProcessingUrlToken(false);
      }
    };

    handleUrlToken();
  }, [pathname, authState.isAuthenticated]); // Run whenever the pathname changes

  // Effect to watch for URL changes and process tokens
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlUserId = urlParams.get('userId');

    if (urlToken) {


      // Efficient validation check - only validate if something actually changed
      const currentToken = localStorage.getItem('auth_token');
      const currentUserId = localStorage.getItem('user_id');
      const currentUser = getUserDataFromStorage();

      // Check if we need to validate
      const tokenChanged = currentToken !== urlToken;
      const userChanged = currentUserId !== urlUserId;
      const tokenExpired = currentToken ? isTokenExpired(currentToken) : true;
      const noExistingSession = !currentUser || !currentUser.id || !currentUser.email;

      const needsValidation = tokenChanged || userChanged || tokenExpired || noExistingSession;



      if (!needsValidation) {

        // Clean up URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('token');
        newUrl.searchParams.delete('userId');
        window.history.replaceState({}, '', newUrl.toString());
        setIsProcessingUrlToken(false);
        return;
      }

      // Force reprocessing by clearing the processed token cache
      sessionStorage.removeItem('last_processed_token_key');

      // Manually trigger the token processing
      const processToken = async () => {
        try {
          if (!isTokenExpired(urlToken)) {
            let userData = null;

            // Check if token contains the new user_metadata structure
            if (hasUserMetadata(urlToken)) {
              console.log('Processing URL change token with user_metadata structure');

              const userMetadata = extractUserMetadata(urlToken);
              const tokenPayload = extractUserFromToken(urlToken);

              if (userMetadata && tokenPayload) {
                // If userId is provided, validate it matches the token or is in the same account
                if (urlUserId) {
                  if (userMetadata.userId === urlUserId) {
                    // Direct match
                    console.log('Direct userId match with token user_metadata in URL change');
                    userData = {
                      id: userMetadata.userId,
                      firstName: tokenPayload.firstName,
                      lastName: tokenPayload.lastName,
                      email: tokenPayload.email,
                      accountId: userMetadata.accountId
                    };
                  } else {
                    // Check if userId belongs to same account (family member)
                    try {
                      const validationResponse = await fetch('/api/users/validate-user', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          userId: urlUserId,
                          token: urlToken
                        })
                      });

                      if (validationResponse.ok) {
                        const validationResult = await validationResponse.json();
                        if (validationResult.success) {
                          userData = validationResult.user;
                          console.log('UserId validation successful via user_metadata in URL change');
                        } else {
                          console.error('UserId validation failed in URL change:', validationResult.error);
                        }
                      } else {
                        console.error('UserId validation request failed in URL change:', validationResponse.status, validationResponse.statusText);
                      }
                    } catch (userIdError) {
                      console.error('Error during userId validation in URL change:', userIdError);
                    }
                  }
                } else {
                  // No userId provided, use the token user directly
                  console.log('Using token user_metadata directly in URL change (no userId provided)');
                  userData = {
                    id: userMetadata.userId,
                    firstName: tokenPayload.firstName,
                    lastName: tokenPayload.lastName,
                    email: tokenPayload.email,
                    accountId: userMetadata.accountId
                  };
                }
              }
            } else {
              // Fallback to legacy token processing
              if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
                console.log('Processing URL change token with legacy format');
              }

              // First, try userId validation if userId parameter is present
              if (urlUserId) {
                try {
                  const validationResponse = await fetch('/api/users/validate-user', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      userId: urlUserId,
                      token: urlToken
                    })
                  });

                  if (validationResponse.ok) {
                    const validationResult = await validationResponse.json();
                    if (validationResult.success) {
                      userData = validationResult.user;
                      console.log('UserId validation successful in URL change (legacy)');
                    } else {
                      console.error('UserId validation failed in URL change (legacy):', validationResult.error);
                    }
                  } else {
                    console.error('UserId validation request failed in URL change (legacy):', validationResponse.status, validationResponse.statusText);
                  }
                } catch (userIdError) {
                  console.error('Error during userId validation in URL change (legacy):', userIdError);
                }
              }

              // Fallback: If userId validation failed or userId not provided, try email-based lookup
              if (!userData) {
                const tokenPayload = extractUserFromToken(urlToken);
                if (tokenPayload && tokenPayload.email) {
                  // Store the token temporarily for the API call
                  localStorage.setItem('auth_token', urlToken);
                  localStorage.setItem('refresh_token', urlToken);

                  try {
                    // Fetch user data from backend using the email from the token
                    const response = await fetch('/api/users/me', {
                      headers: {
                        'Authorization': `Bearer ${urlToken}`,
                        'Content-Type': 'application/json'
                      }
                    });

                    if (response.ok) {
                      const backendUserData = await response.json();
                      userData = {
                        id: backendUserData.id,
                        firstName: backendUserData.firstName,
                        lastName: backendUserData.lastName,
                        email: backendUserData.emailAddress,
                        accountId: backendUserData.accountId
                      };
                      console.log('Email-based user lookup successful in URL change (legacy)');
                    } else {
                      console.error('Failed to fetch user data from backend in URL change (legacy):', response.status, response.statusText);
                    }
                  } catch (fetchError) {
                    console.error('Error fetching user data from backend in URL change (legacy):', fetchError);
                  }
                } else {
                  console.error('Could not extract email from URL token in URL change (legacy)');
                }
              }
            }

            // If we have valid user data, proceed with authentication
            if (userData) {


              // Check if this token is for a different user than the current session
              const currentUserData = getUserDataFromStorage();
              const currentUserEmail = currentUserData?.email;
              const newUserEmail = userData.email;

              if (currentUserEmail && currentUserEmail !== newUserEmail) {

                clearAllStorage('User switch - different token user');

                // Clear the current auth state
                setAuthState({
                  user: null,
                  isAuthenticated: false,
                  isLoading: true,
                  error: null
                });
              } else if (currentUserEmail === newUserEmail) {

              } else {

              }

              // Store the token
              localStorage.setItem('auth_token', urlToken);
              localStorage.setItem('refresh_token', urlToken);

              // Set cookies
              document.cookie = `auth_token=${urlToken}; path=/; max-age=604800; SameSite=Strict; secure`;
              document.cookie = `refresh_token=${urlToken}; path=/; max-age=2592000; SameSite=Strict; secure`;

              // Store user data using the helper function
              storeUserData(userData, urlToken);

              // Update auth state
              setAuthState({
                user: userData,
                isAuthenticated: true,
                isLoading: false,
                error: null
              });



              // Clean up URL by removing the token and userId parameters
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('token');
              newUrl.searchParams.delete('userId');
              window.history.replaceState({}, '', newUrl.toString());

              // Mark URL token processing as complete
              setIsProcessingUrlToken(false);
              setIsAuthInitialized(true);
            } else {
              console.error('URL change authentication failed: Could not validate user with provided token and userId parameters');
              setIsProcessingUrlToken(false);
              setIsAuthInitialized(true);
            }
          }
        } catch (error) {
          console.error('Error processing token:', error);
          setIsProcessingUrlToken(false);
          setIsAuthInitialized(true);
        }
      };

      processToken();
    } else {
      // No URL token found, ensure processing state is reset
      setIsProcessingUrlToken(false);
    }
  }, [currentUrl, authState.isAuthenticated]); // Depend on the current URL state

  // Effect to update URL state when location changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);

      // Listen for URL changes
      const handleUrlChange = () => {
        setCurrentUrl(window.location.href);
      };

      window.addEventListener('popstate', handleUrlChange);

      return () => {
        window.removeEventListener('popstate', handleUrlChange);
      };
    }
  }, [pathname]); // Update when pathname changes

  // Debug effect to monitor auth state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // console.log('Auth state updated:', {
      //   isAuthenticated: authState.isAuthenticated,
      //   hasUser: !!authState.user,
      //   userId: authState.user?.id || 'none',
      //   userName: authState.user ? `${authState.user.firstName} ${authState.user.lastName}` : 'none'
      // });
    }
  }, [authState]);

  // Ensure Amplitude identifies the user whenever auth becomes ready (covers cached sessions and refresh flows)
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.id) {
      try {
        initAnalytics();
        setAnalyticsUser(authState.user.id, authState.user.accountId);
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Amplitude identify failed (non-blocking):', e);
        }
      }
    }
  }, [authState.isAuthenticated, authState.user?.id, authState.user?.accountId]);


  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Clear all storage before login attempt
      clearAllStorage('Before login attempt');

      const response = await authService.login(email, password);
      if (process.env.NODE_ENV === 'development') {
        console.log('Login response received');
      }

      if (response.loginSuccessful) {
        // Debug the response structure
        if (process.env.NODE_ENV === 'development') {
          console.log('Login response structure:', JSON.stringify(response, null, 2));
        }

        // Check if we have a user object in the response
        if (!response.user || !response.user.id) {
          console.error('Login response missing user data');
          throw new Error('Invalid login response: missing user data');
        }

        // Generate a temporary token based on user data if no token is provided
        // This is a workaround until the API provides proper tokens
        const tempToken = `temp_token_${response.user.id}_${Date.now()}`;
        const tempRefreshToken = `temp_refresh_${response.user.id}_${Date.now()}`;

        // Use provided tokens if available, otherwise use temporary tokens
        const authToken = response.token || tempToken;
        const refreshToken = response.refreshToken || tempRefreshToken;
        // Storage is already cleared above, now set new data

        // Store tokens in localStorage
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('refresh_token', refreshToken);

        // Also store in cookies for cross-page persistence
        document.cookie = `auth_token=${authToken}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `refresh_token=${refreshToken}; path=/; max-age=604800; SameSite=Strict`;

        // Determine user data source - prefer response.user if available, otherwise extract from JWT
        let userData;

        if (response.user && response.user.id && response.user.firstName && response.user.lastName) {
          // Use the user data directly from the login response
          userData = {
            id: response.user.id,
            firstName: response.user.firstName,
            lastName: response.user.lastName,
            language: response.user.language || 'en',
            email: response.user.emailAddress,
            accountId: response.user.accountId,
            avatarImagePath: response.user.avatarImagePath || '',
          };

          if (process.env.NODE_ENV === 'development') {
            console.log('Using user data from login response:', userData);
          }
        } else {
          // Since we're using temporary tokens or the API doesn't provide proper JWT tokens,
          // we'll create a user object directly from the response data
          userData = {
            id: response.userId || response.user?.id,
            firstName: response.firstName || response.user?.firstName,
            lastName: response.lastName || response.user?.lastName,
            language: response.user.language || 'en',
            email: response.emailAddress || response.user?.emailAddress,
            accountId: response.accountId || response.user?.accountId,
            avatarImagePath: response.avatarImagePath || response.user?.avatarImagePath || ''
          };

          if (!userData.id) {
            console.error('Failed to create user data from response');
            throw new Error('Invalid user data in response');
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('Using user data from response:', userData);
          }
        }

        // Store user data using the helper function
        storeUserData(userData, response.token);

        if (process.env.NODE_ENV === 'development') {
          console.log('Auth data stored in localStorage and cookies:', {
            userId: userData.id,
            accountId: userData.accountId,
            name: `${userData.firstName} ${userData.lastName}`
          });
        }

        // Update auth state with user data
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        // Track login success
        try {
          trackEvent(AmplitudeEvents.userLoggedIn, { method: 'password', userId: userData.id, accountId: userData.accountId });
        } catch (e) {
          if (process.env.NODE_ENV === 'development') console.warn('Amplitude track (login) failed:', e);
        }


        // Preload user data into cache for faster subsequent page loads
        if (userData.id && userData.accountId) {
          cachedUserService.preloadUser(userData.id, userData.accountId).catch(error => {
            // Preload failures are non-critical, just log them
            if (process.env.NODE_ENV === 'development') {
              console.log('User preload after login failed (non-critical):', error);
            }
          });
        }

        // REMOVED: Auth check completion tracking

        return true;
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: response.error || 'Login failed. Please check your credentials.'
        });

        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'An unexpected error occurred. Please try again.'
      });

      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));


    // Track signup begun
    try { trackEvent(AmplitudeEvents.signupBegun); } catch {}

    try {
      const response = await authService.register(email, password, firstName, lastName);

      if (response.success) {
        // Registration successful, but user still needs to login
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: null
        }));
        // Track signup completed
        try { trackEvent(AmplitudeEvents.signupCompleted); } catch {}
        return true;
      } else {
        // Track signup failed
        try { trackEvent(AmplitudeEvents.signupFailed, { reason: response.error || 'unknown' }); } catch {}
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Registration failed. Please try again.'
        }));
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An unexpected error occurred. Please try again.'
      }));

      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        // Revoke the token on the server
        await authService.revokeToken(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Track logout and clear Amplitude user context
      try {
        const prevUserId = (typeof window !== 'undefined' && localStorage.getItem('user_id')) || undefined;
        const prevAccountId = (typeof window !== 'undefined' && localStorage.getItem('account_id')) || undefined;
        trackEvent(AmplitudeEvents.userLoggedOut, { userId: prevUserId, accountId: prevAccountId });
      } catch {}
      try { clearAnalyticsUser(); } catch {}

      // Clear all storage on logout
      clearAllStorage('Logout');

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use the current origin as the redirect URL, with a check for SSR
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${origin}/forgot-password`;
      const response = await authService.requestPasswordResetCode(email, redirectUrl);

      setAuthState(prev => ({ ...prev, isLoading: false }));

      if (response.success) {

      // Track password reset requested
      try { trackEvent(AmplitudeEvents.userPasswordResetRequested, { email }); } catch {}

        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          error: response.error || 'Failed to send password reset email. Please try again.'
        }));
        return false;
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An unexpected error occurred. Please try again.'
      }));
      return false;
    }
  };

  const validateResetCode = async (email: string, code: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.validateResetCode(email, code);

      setAuthState(prev => ({ ...prev, isLoading: false }));

      if (response.success && response.isValid) {
        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          error: response.error || 'Invalid reset code. Please try again.'
        }));
        return false;
      }
    } catch (error) {
      console.error('Code validation error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An unexpected error occurred. Please try again.'
      }));
      return false;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.resetPasswordWithCode(email, code, newPassword);

      setAuthState(prev => ({ ...prev, isLoading: false }));

      if (response.success) {

      // Track password reset completed
      try { trackEvent(AmplitudeEvents.userPasswordResetCompleted, { email }); } catch {}

        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          error: response.error || 'Failed to reset password. Please try again.'
        }));
        return false;
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An unexpected error occurred. Please try again.'
      }));
      return false;
    }
  };

  const initiateOAuthLogin = async (provider: 'google' | 'apple'): Promise<string | null> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use the current origin as the redirect URL, with a check for SSR
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${origin}/oauth-callback`;

      const response = await authService.initiateOAuthLogin(provider, redirectUrl);

      setAuthState(prev => ({ ...prev, isLoading: false }));

      if (response.oauthUrl) {
        // Track signup method selected (OAuth)
        try { trackEvent(AmplitudeEvents.signupMethodSelected, { provider }); } catch {}

        return response.oauthUrl;
      } else {
        setAuthState(prev => ({
          ...prev,
          error: response.error || `Failed to initiate ${provider} login. Please try again.`
        }));
        return null;
      }
    } catch (error) {
      console.error('OAuth initiation error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An unexpected error occurred. Please try again.'
      }));
      return null;
    }
  };

  // Function to update user data in auth state and localStorage
  const updateUser = (updatedUserData: Partial<AuthUser>) => {
    setAuthState(prevState => {
      if (!prevState.user) return prevState;

      const updatedUser = { ...prevState.user, ...updatedUserData };

      // Update localStorage with new user data
      try {
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        console.log('Updated user data in localStorage:', updatedUser);
      } catch (error) {
        console.error('Error updating user data in localStorage:', error);
      }

      return {
        ...prevState,
        user: updatedUser
      };
    });
  };

  // Function to refresh user data from the server
  const refreshUserData = async (): Promise<boolean> => {
    try {
      const refreshedUser = await silentlyRefreshUserData();
      if (refreshedUser) {
        setAuthState(prevState => ({
          ...prevState,
          user: refreshedUser
        }));

        // Preload user data into cache after refresh
        if (refreshedUser.id && refreshedUser.accountId) {
          cachedUserService.preloadUser(refreshedUser.id, refreshedUser.accountId).catch(error => {
            // Preload failures are non-critical, just log them
            if (process.env.NODE_ENV === 'development') {
              console.log('User preload after refresh failed (non-critical):', error);
            }
          });
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return false;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Debug logs removed to reduce console noise

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        validateResetCode,
        initiateOAuthLogin,
        updateUser,
        refreshUserData,
        clearError,
        isProcessingUrlToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};