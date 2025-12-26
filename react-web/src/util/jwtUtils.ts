/**
 * Utility functions for working with JWT tokens
 *
 * NOTE: As of the authentication refactoring, we no longer rely on local JWT validation.
 * Instead, we always validate sessions by calling the backend refresh token endpoint.
 * These utilities are kept for debugging purposes and potential future use.
 */

/**
 * Decode a JWT token without verification
 * @param token - The JWT token to decode
 * @returns The decoded token payload or null if invalid
 */
export const decodeToken = (token: string): any => {
  try {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
      console.log('Attempting to decode token:', token ? token.substring(0, 10) + '...' : null);
    }

    // JWT tokens are made up of three parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.error('Invalid token format - expected 3 parts but got:', parts.length);
      }
      return null;
    }

    // The payload is the second part, base64 encoded
    const payload = parts[1];

    try {
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const parsedPayload = JSON.parse(decodedPayload);
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('Successfully decoded token payload');
      }
      return parsedPayload;
    } catch (decodeError) {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.error('Error decoding base64 payload:', decodeError);
      }
      return null;
    }
  } catch (error) {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
      console.error('Error decoding token:', error);
    }
    return null;
  }
};

/**
 * Check if a token is expired
 * @param token - The JWT token to check
 * @param bufferSeconds - Buffer time in seconds before actual expiration (default: 60)
 * @returns True if the token is expired or about to expire, false otherwise
 */
export const isTokenExpired = (token: string, bufferSeconds: number = 60): boolean => {
  try {
    const payload = decodeToken(token);
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
      console.log('Token payload for expiration check:', payload ? { exp: payload.exp } : null);
    }

    if (!payload || !payload.exp) {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('No valid payload or expiration found in token');
      }
      return true; // If we can't decode or no exp claim, consider it expired
    }

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiration = payload.exp - currentTime;

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
      console.log('Token expiration details:', {
        expTime: payload.exp,
        currentTime,
        timeUntilExpiration: `${timeUntilExpiration} seconds`,
        bufferSeconds,
        isExpiredOrNearExpiry: payload.exp <= (currentTime + bufferSeconds)
      });
    }

    // Check if the token is expired or about to expire within the buffer time
    return payload.exp <= (currentTime + bufferSeconds);
  } catch (error) {
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
      console.error('Error checking token expiration:', error);
    }
    return true; // If there's an error, consider the token expired
  }
};

/**
 * Extract user information from a JWT token
 * @param token - The JWT token
 * @returns User information or null if invalid
 */
export const extractUserFromToken = (token: string): any => {
  try {
    const payload = decodeToken(token);
    if (!payload) {
      return null;
    }

    // Enhanced debugging for user_metadata
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
      console.log('🔍 JWT Token Analysis:');
      console.log('  Full payload:', JSON.stringify(payload, null, 2));
      console.log('  Has user_metadata:', !!payload.user_metadata);
      if (payload.user_metadata) {
        console.log('  user_metadata content:', JSON.stringify(payload.user_metadata, null, 2));
        console.log('  user_metadata.userId:', payload.user_metadata.userId);
        console.log('  user_metadata.accountId:', payload.user_metadata.accountId);
        console.log('  user_metadata.syncedAt:', payload.user_metadata.syncedAt);
      }
      console.log('  Legacy fields:');
      console.log('    sub:', payload.sub);
      console.log('    email:', payload.email);
      console.log('    account_uniqueid:', payload.account_uniqueid);
    }

    // First, try to extract from the new user_metadata structure
    if (payload.user_metadata && payload.user_metadata.userId && payload.user_metadata.accountId) {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('✅ Using new user_metadata structure from JWT');
        console.log('  Extracted userId:', payload.user_metadata.userId);
        console.log('  Extracted accountId:', payload.user_metadata.accountId);
      }

      const extractedUser = {
        id: payload.user_metadata.userId,
        firstName: payload.user_metadata.firstName || payload.given_name ||
                  (payload.name?.split(' ')[0]) || '',
        lastName: payload.user_metadata.lastName || payload.family_name ||
                 (payload.name?.split(' ').length > 1 ? payload.name.split(' ').slice(1).join(' ') : '') || '',
        email: payload.email || payload.user_metadata.email || '',
        accountId: payload.user_metadata.accountId,
        syncedAt: payload.user_metadata.syncedAt
      };

      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('  Final extracted user:', extractedUser);
      }

      return extractedUser;
    }

    // Fallback to old token format for backward compatibility
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
      console.log('⚠️  Falling back to legacy token format extraction');
      console.log('  Available legacy fields:', {
        account_uniqueid: payload.account_uniqueid,
        accountId: payload.accountId,
        account_id: payload.account_id,
        tenantId: payload.tenantId,
        sub: payload.sub,
        email: payload.email
      });
    }

    // Try to extract user data from various possible payload structures (legacy format)
    const user = payload.user || payload.userData || payload;

    // Check for stored user ID in localStorage to ensure consistency
    let storedUserId = '';
    if (typeof window !== 'undefined') {
      storedUserId = localStorage.getItem('user_id') || '';
    }

    // Extract common user fields from JWT payload with multiple fallbacks
    // Prioritize the stored user ID over the sub field in the JWT token
    return {
      id: storedUserId || user.userId || user.id || payload.userId || payload.id || user.sub || payload.sub || '',
      email: user.email || user.emailAddress || user.mail || payload.email || payload.emailAddress || '',
      firstName: user.firstName || user.first_name || user.given_name || user.name?.split(' ')[0] ||
                payload.firstName || payload.first_name || payload.given_name || payload.name?.split(' ')[0] || '',
      lastName: user.lastName || user.last_name || user.family_name ||
                (user.name?.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '') ||
                payload.lastName || payload.last_name || payload.family_name ||
                (payload.name?.split(' ').length > 1 ? payload.name.split(' ').slice(1).join(' ') : '') || '',
      accountId: user.accountId || user.account_id || user.account_uniqueid || user.tenantId ||
                payload.accountId || payload.account_id || payload.account_uniqueid || payload.tenantId || ''
    };
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
};

/**
 * Extract user metadata from JWT token (new format)
 * @param token - The JWT token
 * @returns User metadata or null if not available
 */
export const extractUserMetadata = (token: string): { userId: string; accountId: string; syncedAt?: string } | null => {
  try {
    const payload = decodeToken(token);

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
      console.log('🔍 extractUserMetadata called');
      console.log('  Token length:', token?.length || 0);
      console.log('  Payload exists:', !!payload);
      console.log('  user_metadata exists:', !!payload?.user_metadata);
    }

    if (!payload || !payload.user_metadata) {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('❌ No user_metadata found in token');
      }
      return null;
    }

    const { userId, accountId, syncedAt } = payload.user_metadata;

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
      console.log('  user_metadata fields:');
      console.log('    userId:', userId);
      console.log('    accountId:', accountId);
      console.log('    syncedAt:', syncedAt);
    }

    if (!userId || !accountId) {
      if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
        console.log('❌ Missing required fields in user_metadata');
      }
      return null;
    }

    const result = {
      userId,
      accountId,
      syncedAt
    };

    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
      console.log('✅ Successfully extracted user_metadata:', result);
    }

    return result;
  } catch (error) {
    console.error('❌ Error extracting user metadata from token:', error);
    return null;
  }
};

/**
 * Check if token contains the new user_metadata structure
 * @param token - The JWT token
 * @returns boolean indicating if user_metadata is present
 */
export const hasUserMetadata = (token: string): boolean => {
  try {
    const payload = decodeToken(token);
    return !!(payload?.user_metadata?.userId && payload?.user_metadata?.accountId);
  } catch (error) {
    return false;
  }
};

/**
 * Validate a token locally (without API call)
 * @param token - The JWT token to validate
 * @param refreshToken - The refresh token (for presence check)
 * @param storedUserId - Optional stored user ID to verify against token
 * @returns An object with validation result and user data if valid
 */
export const validateTokenLocally = (
  token: string,
  refreshToken: string,
  storedUserId?: string
): {
  isValid: boolean;
  needsRefresh: boolean;
  user: any | null;
  userIdMatch: boolean;
} => {
  // Check if both tokens exist
  if (!token || !refreshToken) {
    return { isValid: false, needsRefresh: false, user: null, userIdMatch: false };
  }

  try {
    // Check if token is expired or about to expire
    const expired = isTokenExpired(token);
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
      console.log('JWT validation - token expired:', expired);
    }

    // If not expired, extract user data
    const user = !expired ? extractUserFromToken(token) : null;
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
      console.log('JWT validation - extracted user:', user ? { id: user.id } : null);
    }

    // Token is valid if not expired and we could extract user data
    const isValid = !expired && !!user && !!user.id;

    // Get the raw payload to check for the sub value
    const payload = decodeToken(token);
    const tokenSub = payload?.sub || '';
    
    // Check if stored user ID matches either the token's user ID or the sub field
    // This handles the case where the backend and Supabase use different user IDs
    const userIdMatch = !storedUserId || !user?.id || 
                       storedUserId === user.id || 
                       (tokenSub && storedUserId === tokenSub);
    
    if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true' && storedUserId && user?.id && storedUserId !== user.id) {
      console.log('JWT validation - User ID comparison:', {
        tokenUserId: user?.id,
        tokenSub,
        storedUserId,
        match: userIdMatch
      });
    }

    // Token needs refresh if expired or about to expire
    const needsRefresh = expired;

    return { isValid, needsRefresh, user, userIdMatch };
  } catch (error) {
    console.error('Error validating token locally:', error);
    return { isValid: false, needsRefresh: true, user: null, userIdMatch: false };
  }
};
