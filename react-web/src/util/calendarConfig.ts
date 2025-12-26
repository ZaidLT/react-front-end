/**
 * Calendar Microservice Configuration Utility
 *
 * Provides standardized access to calendar microservice URL from environment variables.
 */

/**
 * Get the calendar microservice base URL
 *
 * Reads from environment variables with proper validation.
 * For client-side usage, use NEXT_PUBLIC_CALENDAR_API_URL.
 * For server-side usage (API routes), use CALENDAR_API_URL.
 *
 * @throws {Error} If the environment variable is not configured
 * @returns {string} The calendar microservice base URL
 *
 * @example
 * // In API routes (server-side)
 * const baseUrl = getCalendarMicroserviceUrl();
 * // Returns: https://dev.api.calendar.eeva.app
 *
 * // In client components (requires NEXT_PUBLIC_ prefix)
 * const baseUrl = getCalendarMicroserviceUrl();
 * // Returns: https://dev.api.calendar.eeva.app
 */
export function getCalendarMicroserviceUrl(): string {
  // Try client-side variable first (for client components)
  let url = process.env.NEXT_PUBLIC_CALENDAR_API_URL;

  // Fall back to server-side variable (for API routes)
  if (!url) {
    url = process.env.CALENDAR_API_URL;
  }

  // Throw error if neither is configured
  if (!url) {
    throw new Error(
      'Calendar microservice URL is not configured. ' +
      'Please set CALENDAR_API_URL (server-side) or NEXT_PUBLIC_CALENDAR_API_URL (client-side) in your environment variables.'
    );
  }

  // Remove trailing slash if present for consistency
  return url.replace(/\/$/, '');
}
