/**
 * Utility functions for managing mobile-specific theming and mobile app detection
 * Sets CSS custom properties based on mobile detection
 */

/**
 * Detects if the browser is running inside a WKWebView (iOS) or Android WebView
 * This serves as a backstop when mobile=true parameter is lost
 */
export const detectMobileAppWebView = (): boolean => {
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

  // Additional checks for mobile app context
  const hasNoStandaloneMode = !window.navigator.standalone;
  const isInAppBrowser = !window.opener && window.parent === window;

  // Only log when debug mode is enabled
  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    console.log('🔍 Mobile App WebView Detection:', {
      userAgent,
      checks: {
        isWKWebView,
        isAndroidWebView,
        isEevaApp,
        hasNoStandaloneMode,
        isInAppBrowser
      },
      userAgentTests: {
        hasAppleWebKit: /AppleWebKit/.test(userAgent),
        hasSafari: /Safari/.test(userAgent),
        hasChrome: /Chrome/.test(userAgent),
        hasCriOS: /CriOS/.test(userAgent),
        hasFxiOS: /FxiOS/.test(userAgent),
        hasAndroid: /Android/.test(userAgent),
        hasWV: /wv/.test(userAgent),
        hasEevaApp: /EevaApp/.test(userAgent)
      },
      finalResult: isWKWebView || isAndroidWebView || isEevaApp
    });
  }

  return isWKWebView || isAndroidWebView || isEevaApp;
};

/**
 * Comprehensive mobile app detection that checks both URL parameters and browser context
 * @param searchParams - URL search parameters
 * @returns boolean indicating if this is a mobile app context
 */
export const detectMobileApp = (searchParams: URLSearchParams | null): boolean => {
  // Primary detection: URL parameter
  const mobileParam = searchParams?.get('mobile') === 'true';

  // Backstop detection: Browser context
  const webViewDetection = detectMobileAppWebView();

  // Also check for token parameter as additional indicator
  const hasToken = !!searchParams?.get('token');

  const isMobileApp = mobileParam || webViewDetection || (hasToken && webViewDetection);

  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    console.log('📱 Mobile App Detection Summary:', {
      mobileParam,
      webViewDetection,
      hasToken,
      finalResult: isMobileApp,
      detectionSource: mobileParam ? 'URL parameter' : webViewDetection ? 'WebView detection' : 'none'
    });
  }

  return isMobileApp;
};

/**
 * Sets the mobile theme by adding/removing the 'mobile' class on the root element
 * This controls the CSS custom properties for background colors
 * @param isMobile - Whether the app is running in mobile mode
 */
export const setMobileTheme = (isMobile: boolean): void => {
  if (typeof document === 'undefined') {
    // Skip on server-side rendering
    return;
  }

  const root = document.documentElement;

  if (isMobile) {
    root.classList.add('mobile');
  } else {
    root.classList.remove('mobile');
  }

  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    console.log('🎨 Mobile theme set:', { isMobile, classes: root.className });
  }
};

/**
 * Hook to automatically set mobile theme based on comprehensive mobile detection
 * Should be called in the main app component or layout
 */
export const useMobileTheme = (searchParams: URLSearchParams | null): void => {
  if (typeof window === 'undefined') {
    // Skip on server-side rendering
    return;
  }

  const isMobile = detectMobileApp(searchParams);
  setMobileTheme(isMobile);
};
