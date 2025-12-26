'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { setMobileTheme } from '../util/mobileTheme';

/**
 * MobileThemeProvider - Sets the mobile theme based on URL search parameters
 * This component should be included in the app layout to ensure mobile theming
 * is applied consistently across all pages.
 */
export const MobileThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if mobile flag is provided in query parameters
    const isMobileApp = searchParams.get('mobile') === 'true';
    
    // Set the mobile theme
    setMobileTheme(isMobileApp);
    
    // Debug logging (always enabled for testing)
    console.log('MobileThemeProvider: Setting mobile theme', { isMobileApp });
    console.log('Document root classes:', document.documentElement.className);
    console.log('CSS custom property value:', getComputedStyle(document.documentElement).getPropertyValue('--background-color'));
  }, [searchParams]);

  return <>{children}</>;
};
