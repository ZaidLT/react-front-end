/**
 * Mobile URL Scheme Utilities
 * 
 * Provides robust handling of tel:, sms:, and mailto: URL schemes
 * across different mobile browsers and WebViews (iOS Safari, Android Chrome, WebViews)
 */

/**
 * Attempts to open a URL scheme using multiple fallback methods
 * for maximum compatibility across mobile devices and WebViews
 */
const openUrlScheme = (url: string, debugLabel: string): void => {
  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    console.log(`${debugLabel} Initiating URL:`, url);
    console.log(`${debugLabel} User Agent:`, navigator.userAgent);
  }
  
  try {
    // Method 1: Try window.open first (works better in some WebViews)
    // Using '_self' to avoid popup blockers
    const popup = window.open(url, '_self');
    
    // Method 2: If window.open fails or returns null, fallback to location.href
    if (!popup) {
      window.location.href = url;
    }
    
    // Method 3: Additional fallback for stubborn WebViews
    // Some WebViews don't properly handle URL schemes through window.open or location.href
    setTimeout(() => {
      if (document.hasFocus()) {
        // If we still have focus after 100ms, the URL scheme might not have worked
        // Try creating a temporary link and clicking it programmatically
        const link = document.createElement('a');
        link.href = url;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, 100);
    
  } catch (error) {
    console.error(`Error with ${debugLabel}:`, error);
    // Final fallback - try location.href
    try {
      window.location.href = url;
    } catch (finalError) {
      console.error(`Final fallback failed for ${debugLabel}:`, finalError);
    }
  }
};

/**
 * Initiates a phone call using the tel: URL scheme
 * @param phoneNumber - The phone number to call
 */
export const initiateCall = (phoneNumber: string): void => {
  if (!phoneNumber) {
    console.warn('No phone number provided for call');
    return;
  }
  
  const telUrl = `tel:${phoneNumber}`;
  openUrlScheme(telUrl, '📞');
};

/**
 * Initiates an SMS/text message using the sms: URL scheme
 * @param phoneNumber - The phone number to text
 * @param body - Optional message body (may not work on all platforms)
 */
export const initiateSMS = (phoneNumber: string, body?: string): void => {
  if (!phoneNumber) {
    console.warn('No phone number provided for SMS');
    return;
  }
  
  let smsUrl = `sms:${phoneNumber}`;
  
  // Add body parameter if provided (works on iOS, limited support on Android)
  if (body) {
    // iOS uses ?body=, Android uses ?body= or &body=
    smsUrl += `?body=${encodeURIComponent(body)}`;
  }
  
  openUrlScheme(smsUrl, '💬');
};

/**
 * Initiates an email using the mailto: URL scheme
 * @param email - The email address
 * @param subject - Optional email subject
 * @param body - Optional email body
 */
export const initiateEmail = (email: string, subject?: string, body?: string): void => {
  if (!email) {
    console.warn('No email address provided');
    return;
  }
  
  let mailtoUrl = `mailto:${email}`;
  const params: string[] = [];
  
  if (subject) {
    params.push(`subject=${encodeURIComponent(subject)}`);
  }
  
  if (body) {
    params.push(`body=${encodeURIComponent(body)}`);
  }
  
  if (params.length > 0) {
    mailtoUrl += `?${params.join('&')}`;
  }
  
  openUrlScheme(mailtoUrl, '📧');
};

/**
 * Detects if the current environment is likely a mobile WebView
 * This can be used to apply different strategies if needed
 */
export const isMobileWebView = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent;

  // Check for WKWebView (iOS)
  const isWKWebView = /AppleWebKit/.test(userAgent) &&
                      !/Safari/.test(userAgent) &&
                      !/Chrome/.test(userAgent) &&
                      !/CriOS/.test(userAgent) &&
                      !/FxiOS/.test(userAgent);

  // Check for Android WebView
  const isAndroidWebView = /Android/.test(userAgent) &&
                           /wv/.test(userAgent);

  // Check for our specific app user agent (if we set one)
  const isEevaApp = /EevaApp/.test(userAgent);

  return isWKWebView || isAndroidWebView || isEevaApp;
};

/**
 * Initiates opening an address in the native maps application
 * @param address - The address to open in maps
 */
export const initiateMapNavigation = (address: string): void => {
  if (!address) {
    console.warn('No address provided for map navigation');
    return;
  }

  // Encode the address for URL
  const encodedAddress = encodeURIComponent(address);

  // Use a universal maps URL that works across platforms
  // This will open in the default maps app on both iOS and Android
  const mapsUrl = `https://maps.apple.com/?q=${encodedAddress}`;

  // For Android devices, we could also use Google Maps:
  // const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  // But Apple Maps URL works universally and redirects appropriately

  openUrlScheme(mapsUrl, '🗺️');
};

/**
 * Initiates the Eeva contacts import using the eeva:// URL scheme
 * This triggers the mobile app to open the contacts import functionality
 */
export type ContactsImportMode = 'all' | 'select';

export const initiateContactsImport = (mode?: ContactsImportMode): void => {
  let eevaUrl = 'eeva://contacts/import';

  try {
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      if (mode) currentParams.set('mode', mode);
      const paramsString = currentParams.toString();
      if (paramsString) {
        eevaUrl += `?${paramsString}`;
      }
    } else if (mode) {
      // SSR-safe fallback
      eevaUrl += `?mode=${mode}`;
    }
  } catch {
    // If parsing fails, at least include mode when provided
    if (mode) {
      eevaUrl += `?mode=${mode}`;
    }
  }

  // Use direct handoff; Android and iOS both handle custom scheme via href
  openUrlScheme(eevaUrl, '📱');
};

/**
 * Initiates the Eeva calendar import using the eeva:// URL scheme
 * This triggers the mobile app to open the calendar import functionality
 */
export const initiateCalendarImport = (): void => {
  const eevaUrl = 'eeva://calendar/import';
  openUrlScheme(eevaUrl, '📅');
};

/**
 * Initiates adding a new event using the eeva:// URL scheme
 * This triggers the mobile app to open the add event functionality
 * Uses the canonical path eeva://create/event and preserves current URL params
 */
export const initiateAddEvent = (): void => {
  let eevaUrl = 'eeva://create/event';

  try {
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      const paramsString = currentParams.toString();
      if (paramsString) {
        eevaUrl += `?${paramsString}`;
      }
    }
  } catch {
    // noop - fallback to base deeplink
  }

  openUrlScheme(eevaUrl, '📅');
};

/**
 * Gets the mobile platform type for debugging purposes
 */
export const getMobilePlatform = (): 'ios' | 'android' | 'unknown' => {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const userAgent = navigator.userAgent;

  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return 'ios';
  } else if (/Android/.test(userAgent)) {
    return 'android';
  }

  return 'unknown';
};
