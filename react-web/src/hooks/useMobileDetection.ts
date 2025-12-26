'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { detectMobileApp, detectMobileAppWebView, setMobileTheme } from '../util/mobileTheme';

/**
 * Custom hook for comprehensive mobile app detection
 * Provides both URL parameter and WebView detection with automatic theme setting
 */
export const useMobileAppDetection = () => {
  const searchParams = useSearchParams();
  const [isMobileApp, setIsMobileApp] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState<'url' | 'webview' | 'none'>('none');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side to avoid hydration issues
    setIsClient(true);

    // Primary detection: URL parameter
    const mobileParam = searchParams.get('mobile') === 'true';

    // Backstop detection: Browser context (only on client)
    const webViewDetection = detectMobileAppWebView();

    // Determine final result and method
    let finalResult = false;
    let method: 'url' | 'webview' | 'none' = 'none';

    if (mobileParam) {
      finalResult = true;
      method = 'url';
    } else if (webViewDetection) {
      finalResult = true;
      method = 'webview';
    }

    setIsMobileApp(finalResult);
    setDetectionMethod(method);

    // Automatically set mobile theme
    setMobileTheme(finalResult);

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('🔍 useMobileAppDetection:', {
        mobileParam,
        webViewDetection,
        finalResult,
        method,
        searchParamsString: searchParams.toString()
      });
    }
  }, [searchParams]);

  return {
    isMobileApp,
    detectionMethod,
    isClient,
    // Helper functions for specific checks
    isDetectedByUrl: detectionMethod === 'url',
    isDetectedByWebView: detectionMethod === 'webview',
    // Raw detection functions for manual checks
    detectMobileApp: () => detectMobileApp(searchParams),
    detectWebView: detectMobileAppWebView,
  };
};

/**
 * Lightweight hook that just returns the mobile app status
 * Use this when you only need the boolean result
 */
export const useIsMobileApp = (): boolean => {
  const { isMobileApp } = useMobileAppDetection();
  return isMobileApp;
};