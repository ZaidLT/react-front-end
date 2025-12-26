import { useState, useEffect } from 'react';

interface BreakpointValues {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Custom hook for responsive design
 * 
 * Provides breakpoint information for responsive components.
 * 
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Desktop: > 1024px
 * 
 * @returns Object containing breakpoint booleans
 */
export const useResponsive = (): BreakpointValues => {
  const [breakpoints, setBreakpoints] = useState<BreakpointValues>({
    mobile: false,
    tablet: false,
    desktop: false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      const desktop = width >= 1024;

      setBreakpoints({
        mobile,
        tablet,
        desktop,
        isMobile: mobile,
        isTablet: tablet,
        isDesktop: desktop,
      });
    };

    // Initial check
    updateBreakpoints();

    // Add event listener
    window.addEventListener('resize', updateBreakpoints);

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return breakpoints;
};

/**
 * Hook to get responsive values based on current breakpoint
 * 
 * @param mobileValue - Value to use on mobile
 * @param tabletValue - Value to use on tablet (optional, defaults to desktop value)
 * @param desktopValue - Value to use on desktop
 * @returns The appropriate value for current breakpoint
 */
export const useResponsiveValue = <T>(
  mobileValue: T,
  tabletValue: T | undefined,
  desktopValue: T
): T => {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) return mobileValue;
  if (isTablet) return tabletValue ?? desktopValue;
  return desktopValue;
};

/**
 * Hook to get responsive padding values
 * 
 * @returns Object with responsive padding values
 */
export const useResponsivePadding = () => {
  const { isMobile, isTablet } = useResponsive();

  return {
    container: isMobile ? '10px' : isTablet ? '15px' : '20px',
    content: isMobile ? '15px' : isTablet ? '20px' : '25px',
    card: isMobile ? '12px' : isTablet ? '15px' : '20px',
    small: isMobile ? '8px' : isTablet ? '10px' : '12px',
  };
};

/**
 * Hook to get responsive font sizes
 * 
 * @returns Object with responsive font size values
 */
export const useResponsiveFontSize = () => {
  const { isMobile, isTablet } = useResponsive();

  return {
    title: isMobile ? '18px' : isTablet ? '20px' : '24px',
    subtitle: isMobile ? '16px' : isTablet ? '18px' : '20px',
    body: isMobile ? '14px' : isTablet ? '15px' : '16px',
    caption: isMobile ? '12px' : isTablet ? '13px' : '14px',
    small: isMobile ? '10px' : isTablet ? '11px' : '12px',
  };
};

export default useResponsive;
