'use client';

import React from 'react';
import SkeletonLoader from '../SkeletonLoader';
import { Colors } from '../../styles';

/**
 * CalendarListSkeleton - Loading skeleton for calendar list
 */
const CalendarListSkeleton: React.FC = () => {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        {/* SettingsPageHeader Skeleton */}
        <div style={styles.settingsHeader}>
          <div style={styles.backButtonContainer}>
            <SkeletonLoader
              width="24px"
              height="24px"
              borderRadius="4px"
            />
          </div>
          <div style={styles.titleContainer}>
            <SkeletonLoader
              width="100px"
              height="24px"
            />
          </div>
          <div style={styles.spacer} />
        </div>

        {/* "My calendars" section header */}
        <div style={styles.sectionHeader}>
          <SkeletonLoader
            width="28px"
            height="28px"
            borderRadius="50%"
          />
          <SkeletonLoader
            width="120px"
            height="18px"
          />
        </div>

        {/* Calendar items skeleton - 2 rows */}
        {[1, 2].map((index) => (
          <div key={index} style={styles.calendarItem}>
            {/* Calendar name - takes flex: 1 */}
            <SkeletonLoader
              width="60%"
              height="16px"
              style={{ marginRight: 'auto' }}
            />

            {/* Color dot */}
            <SkeletonLoader
              width="20px"
              height="20px"
              borderRadius="50%"
            />
          </div>
        ))}

        {/* Add calendar button skeleton */}
        <div style={styles.buttonContainer}>
          <SkeletonLoader
            width="100%"
            height="44px"
            borderRadius="100px"
          />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: Colors.WHITE || '#ffffff',
    width: '100%',
  },
  contentWrapper: {
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
    padding: '0 24px',
    boxSizing: 'border-box',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  settingsHeader: {
    display: 'flex',
    height: '32px',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
    alignSelf: 'stretch',
    marginTop: '24px',
  },
  backButtonContainer: {
    display: 'flex',
    width: '64px',
    height: '24px',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  titleContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    width: '64px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  calendarItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: `1px solid ${Colors.LIGHT_GREY || '#f0f0f0'}`,
    gap: '15px',
  },
  buttonContainer: {
    display: 'flex',
    width: '342px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    marginTop: 'auto',
    marginBottom: '24px',
    alignSelf: 'center',
  },
};

export default CalendarListSkeleton;
