import React from 'react';
import { useRouter } from '../hooks/useRouterWithPersistentParams';
import { useLanguageContext } from '../context/LanguageContext';
import CustomText from './CustomText';
import { Colors, Typography } from '../styles';
import { initiateAddEvent } from '../util/mobileUrlSchemes';

interface TimeEmptyStateProps {
  isMobileApp?: boolean;
}

const TimeEmptyState: React.FC<TimeEmptyStateProps> = ({ isMobileApp = false }) => {
  const { i18n } = useLanguageContext();
  const router = useRouter();

  const handleAddEvent = () => {
    if (isMobileApp) {
      // Use URL scheme to trigger add event in mobile app
      initiateAddEvent();
    } else {
      // Use web navigation for browser users
      router.push('/create-event');
    }
  };

  return (
    <div style={styles.emptyStateContainer}>
      <div style={styles.emptyStateCard}>
        <CustomText style={styles.emptyStateHeading}>
          {i18n.t('OptimizeYourDay')}
        </CustomText>
        <div style={styles.emptyStateSubtitleContainer}>
          <CustomText style={styles.emptyStateSubheading}>
            {i18n.t('StartByFillingYourCalendar')}
          </CustomText>
        </div>
        <button
          style={styles.addEventButton}
          onClick={handleAddEvent}
        >
          <div style={styles.plusIconContainer}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path 
                d="M12 5V19M5 12H19" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {i18n.t('AddEvent')}
        </button>
      </div>
    </div>
  );
};

const styles = {
  emptyStateContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    flex: 1,
    minHeight: '200px',
    width: '100%',
    alignSelf: 'center',
  } as React.CSSProperties,

  emptyStateCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${Colors.LIGHT_GREY}`,
    maxWidth: '320px',
    textAlign: 'center',
  } as React.CSSProperties,

  emptyStateHeading: {
    fontSize: Typography.FONT_SIZE_20,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.BLACK,
    marginBottom: '12px',
  } as React.CSSProperties,

  emptyStateSubtitleContainer: {
    marginBottom: '24px',
  } as React.CSSProperties,

  emptyStateSubheading: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: '#000E50',
    lineHeight: '1.4',
  } as React.CSSProperties,

  addEventButton: {
    backgroundColor: '#000E50',
    color: Colors.WHITE,
    border: 'none',
    borderRadius: '100px',
    padding: '12px 20px',
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 auto',
  } as React.CSSProperties,

  plusIconContainer: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '1.5px solid rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
};

export default TimeEmptyState;
