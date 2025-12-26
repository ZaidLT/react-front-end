'use client';

import { useEffect, useState } from 'react';
import { useResponsive } from './useResponsive';
import { setMobileTheme } from '../util/mobileTheme';

/**
 * Custom hook for responsive mobile app detection
 * Uses viewport size to determine if the app should behave as mobile.
 */
export const useMobileAppDetection = () => {
  const { isMobile } = useResponsive();
  const [isMobileApp, setIsMobileApp] = useState(false);
  const [detectionMethod, setDetectionMethod] = useState<'viewport' | 'none'>('none');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsMobileApp(isMobile);
    setDetectionMethod('viewport');
    setMobileTheme(isMobile);

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('🔍 useMobileAppDetection:', {
        isMobile,
        method: 'viewport',
      });
    }
  }, [isMobile]);

  return {
    isMobileApp,
    detectionMethod,
    isClient,
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
