'use client';

import React, { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FloatingActionButton from '../FloatingActionButton';
import BeevaButton from '../BeevaButton';
import { useIsMobileApp } from '../../hooks/useMobileDetection';
import { createLinkHref } from '../../util/navigationHelpers';
import { useLanguageContext } from '../../context/LanguageContext';
import styles from './TabBar.module.css';

/**
 * Props for the TabBar component
 */
interface TabBarProps {
  /** Optional click handler for Beeva button. If provided, BeevaButton will be rendered. */
  onBeevaButtonClick?: () => void;
}

/**
 * TabBarContent - Bottom navigation component content
 *
 * Displays the main navigation tabs (Home, Life, Time, People) at the bottom of the screen.
 * Handles visibility logic for mobile app mode and conditionally renders the Beeva button
 * when a click handler is provided.
 *
 * Features:
 * - Sticky positioning at bottom of viewport
 * - Participates in rubber band over-scroll effect
 * - Conditionally hides in mobile app mode (unless Beeva button handler is provided)
 * - Active state indication for current route
 * - Integrated FloatingActionButton (+) for creating new items
 * - Optional Beeva mascot button (when onBeevaButtonClick is provided)
 *
 * @internal This component is wrapped by TabBar for Suspense handling
 */
const TabBarContent: React.FC<TabBarProps> = ({ onBeevaButtonClick }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { i18n } = useLanguageContext();

  // Use comprehensive mobile app detection (includes WebView detection)
  const isMobileApp = useIsMobileApp();

  // Don't show tab bar on my-hive page
  if (pathname === '/my-hive') {
    return null;
  }

  // If mobile app and beeva button handler is provided, render only the beeva button
  if (isMobileApp && onBeevaButtonClick) {
    return (
      <nav style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        position: 'sticky',
        bottom: 0,
        width: '100%',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div className={styles.innerWrapperNoPadding}>
          {/* Beeva Button for Mobile App */}
          <BeevaButton
            onClick={onBeevaButtonClick}
            className={`${styles.beevaIconPosition} ${styles.beevaIconMobileApp}`}
          />
        </div>
      </nav>
    );
  }

  // If mobile app but no beeva icon, don't render anything
  if (isMobileApp) {
    return null;
  }

  return (
    <nav style={{
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E5E7EB',
      position: 'sticky',
      bottom: 0,
      width: '100%',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <div className={styles.innerWrapper}>
      <Link href={createLinkHref('/home', searchParams)} style={{
        textDecoration: 'none',
        color: pathname === '/home' ? '#2A46BE' : '#AAB5E5'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '5px 10px'
        }}>
          <img
            src={pathname === '/home' ? '/icons/tab-bar/icon-tab-bar-home-on.svg' : '/icons/tab-bar/icon-tab-bar-home-off.svg'}
            alt="Home"
            width="24"
            height="24"
          />
          <span style={{
            fontSize: '12px',
            fontFamily: 'Poppins, sans-serif',
            marginTop: '4px',
            fontWeight: pathname === '/home' ? '600' : '400',
            lineHeight: '120%',
            textAlign: 'center',
            color: pathname === '/home' ? '#2A46BE' : '#AAB5E5'
          }}>
            {i18n.t('Home')}
          </span>
        </div>
      </Link>

      <Link href={createLinkHref('/life', searchParams)} style={{
        textDecoration: 'none',
        color: pathname === '/life' ? '#2A46BE' : '#AAB5E5'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '5px 10px'
        }}>
          <img
            src={pathname === '/life' ? '/icons/tab-bar/icon-tab-bar-life-on.svg' : '/icons/tab-bar/icon-tab-bar-life-off.svg'}
            alt="Life"
            width="24"
            height="24"
          />
          <span style={{
            fontSize: '12px',
            fontFamily: 'Poppins, sans-serif',
            marginTop: '4px',
            fontWeight: pathname === '/life' ? '600' : '400',
            lineHeight: '120%',
            textAlign: 'center',
            color: pathname === '/life' ? '#2A46BE' : '#AAB5E5'
          }}>
            {i18n.t('Life')}
          </span>
        </div>
      </Link>

      <Link href={createLinkHref('/time', searchParams)} style={{
        textDecoration: 'none',
        color: pathname === '/time' ? '#2A46BE' : '#AAB5E5'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '5px 10px'
        }}>
          <img
            src={pathname === '/time' ? '/icons/tab-bar/icon-tab-bar-time-on.svg' : '/icons/tab-bar/icon-tab-bar-time-off.svg'}
            alt="Time"
            width="24"
            height="24"
          />
          <span style={{
            fontSize: '12px',
            fontFamily: 'Poppins, sans-serif',
            marginTop: '4px',
            fontWeight: pathname === '/time' ? '600' : '400',
            lineHeight: '120%',
            textAlign: 'center',
            color: pathname === '/time' ? '#2A46BE' : '#AAB5E5'
          }}>
            {i18n.t('Time')}
          </span>
        </div>
      </Link>

      <Link href={createLinkHref('/people', searchParams)} style={{
        textDecoration: 'none',
        color: pathname === '/people' ? '#2A46BE' : '#AAB5E5'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '5px 10px'
        }}>
          <img
            src={pathname === '/people' ? '/icons/tab-bar/icon-tab-bar-people-on.svg' : '/icons/tab-bar/icon-tab-bar-people-off.svg'}
            alt="People"
            width="24"
            height="24"
          />
          <span style={{
            fontSize: '12px',
            fontFamily: 'Poppins, sans-serif',
            marginTop: '4px',
            fontWeight: pathname === '/people' ? '600' : '400',
            lineHeight: '120%',
            textAlign: 'center',
            color: pathname === '/people' ? '#2A46BE' : '#AAB5E5'
          }}>
            {i18n.t('People')}
          </span>
        </div>
      </Link>

      {/* Floating Action Button */}
      <FloatingActionButton className={styles.fabAbsolute} />

      {/* Beeva Button (Web) */}
      {onBeevaButtonClick && (
        <BeevaButton
          onClick={onBeevaButtonClick}
          className={styles.beevaIconPosition}
        />
      )}
      </div>
    </nav>
  );
};

/**
 * TabBar - Bottom navigation component with Suspense wrapper
 *
 * Main navigation component that displays tabs at the bottom of the screen.
 * Used across most pages in the application (Home, Life, Time, People).
 *
 * Behavior:
 * - Hidden on `/my-hive` page
 * - In mobile app mode (`?mobile=true`):
 *   - Hides all tabs (native iOS tab bar is used instead)
 *   - Can optionally show only Beeva button when `onBeevaButtonClick` handler is provided
 * - In web mode: Shows all tabs + optional Beeva button
 *
 * @example
 * ```tsx
 * // Standard usage (most pages)
 * <TabBar />
 *
 * // With Beeva button (home page)
 * <TabBar onBeevaButtonClick={handleBeevaClick} />
 * ```
 */
const TabBar: React.FC<TabBarProps> = (props) => {
  return (
    <Suspense fallback={null}>
      <TabBarContent {...props} />
    </Suspense>
  );
};

export default TabBar;