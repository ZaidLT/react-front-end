/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints based on environment.
 * Uses Vercel environment variables to determine the correct API base URL.
 */

/**
 * Get the API base URL based on the current environment
 * 
 * @returns The appropriate API base URL for the current environment
 */
export function getApiBaseUrl(): string {
  // Check if we're in production (main branch on Vercel)
  const isProduction = process.env.VERCEL_ENV === 'production';
  
  if (isProduction) {
    // Production uses the main API
    return 'https://api.eeva.app/api';
  } else {
    // Development/preview branches use dev API
    return 'https://dev.api.eeva.app/api';
  }
}

/**
 * Required header for Vercel protection bypass
 */
export const PROTECTION_BYPASS_HEADER = '0a2eba8c751892e035f6b96605600fae';

/**
 * Get the current API base URL (cached for performance)
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * Log the current API configuration for debugging
 * Only logs once per session to avoid spam
 */
let hasLoggedConfig = false;
export function logApiConfig(): void {
  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' && !hasLoggedConfig) {
    console.log('API Configuration:', {
      environment: process.env.VERCEL_ENV || 'development',
      baseUrl: API_BASE_URL,
      isProduction: process.env.VERCEL_ENV === 'production'
    });
    hasLoggedConfig = true;
  }
}
