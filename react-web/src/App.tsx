'use client';

import React, { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Colors, Typography } from './styles';
import { setMobileTheme } from './util/mobileTheme';

// App Layout component that conditionally renders the tab bar
const AppContent = () => {
  // Use Next.js's usePathname hook to get the current path
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRootPath = pathname === '/';

  // Check if mobile flag is provided in query parameters
  const mobileParam = searchParams.get('mobile');
  const isMobileApp = mobileParam === 'true';

  // Set mobile theme based on search params
  useEffect(() => {
    setMobileTheme(isMobileApp);
  }, [isMobileApp]);

  return (
    <div className="app">
      <div className="content">
        {/* Content will be rendered by Next.js pages */}
      </div>
      {isRootPath && !isMobileApp && (
        <nav className="bottom-nav" style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '15px 0',
          backgroundColor: Colors.WHITE,
          borderTop: `1px solid ${Colors.LIGHT_GREY}`,
          position: 'fixed',
          bottom: 0,
          width: '100%',
          zIndex: 1000
        }}>
          <Link href="/home" style={{ textDecoration: 'none', color: Colors.MIDNIGHT }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Home icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={Colors.MIDNIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke={Colors.MIDNIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: '12px', fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR }}>Home</span>
            </div>
          </Link>
          <Link href="/life" style={{ textDecoration: 'none', color: Colors.MIDNIGHT }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Heart icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z" stroke={Colors.MIDNIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: '12px', fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR }}>Life</span>
            </div>
          </Link>
          <Link href="/time" style={{ textDecoration: 'none', color: Colors.MIDNIGHT }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Calendar icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke={Colors.MIDNIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2V6" stroke={Colors.MIDNIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2V6" stroke={Colors.MIDNIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 10H21" stroke={Colors.MIDNIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: '12px', fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR }}>Time</span>
            </div>
          </Link>
          <Link href="/people" style={{ textDecoration: 'none', color: Colors.MIDNIGHT }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* People/Contact icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={Colors.MIDNIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={Colors.MIDNIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={Colors.MIDNIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={Colors.MIDNIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: '12px', fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR }}>People</span>
            </div>
          </Link>
        </nav>
      )}
    </div>
  );
};

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContent />
    </Suspense>
  );
};

export default App;
