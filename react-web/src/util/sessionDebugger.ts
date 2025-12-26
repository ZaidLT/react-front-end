// Session debugging utilities
import { extractUserFromToken, extractUserMetadata, hasUserMetadata, isTokenExpired } from './jwtUtils';

/**
 * Debug current session state
 * Call this function in browser console to inspect session
 */
export const debugSession = () => {
  console.log('🔍 === SESSION DEBUG REPORT ===');
  
  // Check localStorage
  console.log('\n📦 LocalStorage:');
  const userData = localStorage.getItem('user_data');
  const userId = localStorage.getItem('user_id');
  const accountId = localStorage.getItem('account_id');
  const authToken = localStorage.getItem('auth_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const userMetadata = localStorage.getItem('user_metadata');
  
  console.log('  user_data:', userData ? JSON.parse(userData) : null);
  console.log('  user_id:', userId);
  console.log('  account_id:', accountId);
  console.log('  auth_token exists:', !!authToken);
  console.log('  refresh_token exists:', !!refreshToken);
  console.log('  user_metadata:', userMetadata ? JSON.parse(userMetadata) : null);
  
  // Check cookies
  console.log('\n🍪 Cookies:');
  const cookies = document.cookie.split('; ').reduce((acc: any, cookie) => {
    const [key, value] = cookie.split('=');
    acc[key] = value;
    return acc;
  }, {});
  console.log('  user_id:', cookies.user_id);
  console.log('  account_id:', cookies.account_id);
  console.log('  auth_token exists:', !!cookies.auth_token);
  console.log('  refresh_token exists:', !!cookies.refresh_token);
  
  // Analyze auth token
  if (authToken) {
    console.log('\n🔑 Auth Token Analysis:');
    console.log('  Token length:', authToken.length);
    console.log('  Token expired:', isTokenExpired(authToken));
    console.log('  Has user_metadata:', hasUserMetadata(authToken));
    
    const extractedUser = extractUserFromToken(authToken);
    console.log('  Extracted user:', extractedUser);
    
    if (hasUserMetadata(authToken)) {
      const metadata = extractUserMetadata(authToken);
      console.log('  User metadata:', metadata);
    }
  }
  
  // Check URL parameters
  console.log('\n🌐 URL Parameters:');
  const urlParams = new URLSearchParams(window.location.search);
  console.log('  token:', urlParams.get('token') ? 'Present' : 'Not present');
  console.log('  userId:', urlParams.get('userId'));
  console.log('  mobile:', urlParams.get('mobile'));
  
  console.log('\n=== END SESSION DEBUG ===');
};

/**
 * Debug a specific JWT token
 */
export const debugToken = (token: string) => {
  console.log('🔍 === TOKEN DEBUG REPORT ===');
  console.log('Token:', token.substring(0, 50) + '...');
  console.log('Length:', token.length);
  console.log('Expired:', isTokenExpired(token));
  console.log('Has user_metadata:', hasUserMetadata(token));
  
  const extractedUser = extractUserFromToken(token);
  console.log('Extracted user:', extractedUser);
  
  if (hasUserMetadata(token)) {
    const metadata = extractUserMetadata(token);
    console.log('User metadata:', metadata);
  }
  
  console.log('=== END TOKEN DEBUG ===');
};

/**
 * Compare two tokens
 */
export const compareTokens = (token1: string, token2: string) => {
  console.log('🔍 === TOKEN COMPARISON ===');
  
  console.log('\nToken 1:');
  debugToken(token1);
  
  console.log('\nToken 2:');
  debugToken(token2);
  
  console.log('\nComparison:');
  console.log('  Same token:', token1 === token2);
  console.log('  Same length:', token1.length === token2.length);
  
  const user1 = extractUserFromToken(token1);
  const user2 = extractUserFromToken(token2);
  console.log('  Same user ID:', user1?.id === user2?.id);
  console.log('  Same account ID:', user1?.accountId === user2?.accountId);
  
  console.log('=== END COMPARISON ===');
};

// Make functions available globally for console debugging (only in debug mode)
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
  (window as any).debugSession = debugSession;
  (window as any).debugToken = debugToken;
  (window as any).compareTokens = compareTokens;

  console.log('🔧 Session debugging tools loaded. Available functions:');
  console.log('  - debugSession() - Debug current session state');
  console.log('  - debugToken(token) - Debug a specific token');
  console.log('  - compareTokens(token1, token2) - Compare two tokens');
}
