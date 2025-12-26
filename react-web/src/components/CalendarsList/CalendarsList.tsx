'use client';

import React, { useState, useEffect } from 'react';
import { Colors, Typography } from '../../styles';
import { useLanguageContext } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import CustomText from '../CustomText';
import SettingsPageHeader from '../SettingsPageHeader';
import CalendarItem, { Calendar as CalendarItemData } from '../CalendarItem';
import CalendarColorSelectionModal from '../CalendarColorSelectionModal';
import RemoveCalendarModal from '../RemoveCalendarModal';
import { useMobileAppDetection } from '../../hooks/useMobileAppDetection';
import { initiateCalendarImport } from '../../util/mobileUrlSchemes';
import { Calendar, updateCalendarColor as updateCalendarColorAPI } from '../../services/calendarService';
import { useNotificationContext } from '../../context/NotificationContext';
import styles from './CalendarsList.module.css';

interface CalendarsListProps {
  eevaCalendar: Calendar | null;
  googleCalendars: Calendar[];
}

/**
 * CalendarsList - Main client component for calendar management
 *
 * Handles all state management and user interactions for calendar settings
 */
const CalendarsList: React.FC<CalendarsListProps> = ({
  eevaCalendar: initialEevaCalendar,
  googleCalendars: initialGoogleCalendars,
}) => {
  const { i18n } = useLanguageContext();
  const { user: authUser } = useAuth();
  const { isMobileApp } = useMobileAppDetection();
  const { addNotification } = useNotificationContext();

  // State management
  const [eevaCalendar, setEevaCalendar] = useState<Calendar | null>(initialEevaCalendar);
  const [googleCalendars, setGoogleCalendars] = useState<Calendar[]>(initialGoogleCalendars);
  const [isColorSelectionModalVisible, setIsColorSelectionModalVisible] = useState(false);
  const [selectedGoogleCalendarForColorSelection, setSelectedGoogleCalendarForColorSelection] =
    useState<Calendar | null>(null);
  const [removeCalendarActive, setRemoveCalendarActive] = useState(false);
  const [calendarsToRemove, setCalendarsToRemove] = useState<Calendar[]>([]);
  const [showRemoveCalendarConfirmation, setShowRemoveCalendarConfirmation] = useState(false);

  // Sync state with props when they change
  useEffect(() => {
    setGoogleCalendars(initialGoogleCalendars);
  }, [initialGoogleCalendars]);

  useEffect(() => {
    setEevaCalendar(initialEevaCalendar);
  }, [initialEevaCalendar]);

  // Map service Calendar to CalendarItem's local Calendar type
  const mapToItemData = (cal: Calendar): CalendarItemData => ({
    id: cal.id,
    summary: cal.email,  // email becomes the display summary
    color: cal.color,
    isHidden: cal.isHidden,
  });

  // Get user initials for avatar
  const getInitials = (user: any) => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Handle Add Calendar button click
  const handleAddCalendarClick = () => {
    if (isMobileApp) {
      initiateCalendarImport();
    } else {
      alert(
        'Calendar import is only available in the mobile app. Please use the Eeva mobile app to add calendars.'
      );
    }
  };

  // Toggle calendar visibility
  const toggleCalendarVisibility = (calendar: Calendar, isGoogleCalendar: boolean) => {
    if (isGoogleCalendar) {
      setGoogleCalendars((prev) =>
        prev.map((cal) =>
          cal.id === calendar.id ? { ...cal, isHidden: !cal.isHidden } : cal
        )
      );
    } else {
      setEevaCalendar((prev) => (prev ? { ...prev, isHidden: !prev.isHidden } : null));
    }
  };

  // Update calendar color
  const updateCalendarColor = async (color: string) => {
    // Handle mocked Eeva calendar (local only, no API call)
    if (!selectedGoogleCalendarForColorSelection) {
      setEevaCalendar((prev) => (prev ? { ...prev, color } : null));
      setIsColorSelectionModalVisible(false);
      return;
    }

    // Store calendar and old color for rollback
    const calendar = selectedGoogleCalendarForColorSelection;
    const oldColor = calendar.color;

    // Close modal and clear selection
    setSelectedGoogleCalendarForColorSelection(null);
    setIsColorSelectionModalVisible(false);

    // Optimistic update (update UI immediately)
    setGoogleCalendars((prev) =>
      prev.map((cal) =>
        cal.id === calendar.id ? { ...cal, color } : cal
      )
    );

    try {
      // Call API to persist change
      await updateCalendarColorAPI(calendar.id, color);

    } catch (error: any) {
      console.error('[CalendarsList] Failed to update calendar color:', error);

      // Rollback to old color on error
      setGoogleCalendars((prev) =>
        prev.map((cal) =>
          cal.id === calendar.id ? { ...cal, color: oldColor } : cal
        )
      );

      // Show error toast notification
      addNotification({
        type: 'error',
        message: 'Failed to update calendar color. Please try again.',
      });
    }
  };

  // Update calendars to remove list
  const updateCalendarsToRemoveList = (calendar: Calendar, isGoogleCalendar: boolean) => {
    const isSelected = calendarsToRemove.some((cal) => cal.id === calendar.id);

    if (isSelected) {
      setCalendarsToRemove((prev) =>
        prev.filter((cal) => cal.id !== calendar.id)
      );
    } else {
      setCalendarsToRemove((prev) => [...prev, calendar]);
    }
  };

  // Remove selected calendars
  const removeSelectedCalendars = () => {
    const googleCalendarsToKeep = googleCalendars.filter(
      (cal) => !calendarsToRemove.some((removeCal) => removeCal.id === cal.id)
    );

    const eevaCalendarToRemove = calendarsToRemove.some((cal) => cal.id === eevaCalendar?.id);

    setGoogleCalendars(googleCalendarsToKeep);

    if (eevaCalendarToRemove) {
      setEevaCalendar(null);
    }

    setCalendarsToRemove([]);
    setRemoveCalendarActive(false);
    setShowRemoveCalendarConfirmation(false);
  };

  // Check if calendar is selected for removal
  const isCalendarSelected = (calendar: Calendar, isGoogleCalendar: boolean) => {
    return calendarsToRemove.some((cal) => cal.id === calendar.id);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <SettingsPageHeader title={i18n.t('Calendars')} />

        <div className={styles.content}>
          <div className={styles.header}>
            {authUser?.avatarImagePath ? (
              <img src={authUser.avatarImagePath} alt="User Avatar" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <CustomText className={styles.avatarText} style={{ fontSize: 12 }}>{getInitials(authUser)}</CustomText>
              </div>
            )}
            <CustomText className={styles.title} style={{ fontSize: 18, fontWeight: 600 }}>{i18n.t('MyCalendars')}</CustomText>
          </div>

          {eevaCalendar && (
            <CalendarItem
              calendar={mapToItemData(eevaCalendar)}
              isGoogleCalendar={false}
              removeMode={removeCalendarActive}
              isSelected={isCalendarSelected(eevaCalendar, false)}
              onVisibilityToggle={() => toggleCalendarVisibility(eevaCalendar, false)}
              onSelectionToggle={() => updateCalendarsToRemoveList(eevaCalendar, false)}
            />
          )}

          {googleCalendars.map((googleCalendar) => (
            <CalendarItem
              key={googleCalendar.id}
              calendar={mapToItemData(googleCalendar)}
              isGoogleCalendar={true}
              removeMode={removeCalendarActive}
              isSelected={isCalendarSelected(googleCalendar, true)}
              onVisibilityToggle={() => toggleCalendarVisibility(googleCalendar, true)}
              onColorClick={() => {
                setIsColorSelectionModalVisible(true);
                setSelectedGoogleCalendarForColorSelection(googleCalendar);
              }}
              onSelectionToggle={() => updateCalendarsToRemoveList(googleCalendar, true)}
            />
          ))}
        </div>

        {/* Add/Remove Calendar Buttons */}
        {!removeCalendarActive && (
          <div className={styles.buttonContainer}>
            <button onClick={handleAddCalendarClick} className={styles.addButton}>
              <img
                src="/icons/icon-calendars-plus.svg"
                width={24}
                height={24}
                alt="Add"
                className={styles.addButtonIcon}
              />
              <CustomText className={styles.addButtonText}>{i18n.t('AddCalendar')}</CustomText>
            </button>

            {/* Remove Calendar Button - Hidden but kept in DOM */}
            <button
              onClick={() => setRemoveCalendarActive(true)}
              className={`${styles.removeButton} ${styles.hidden}`}
            >
              <CustomText className={styles.removeButtonText}>Remove Calendar</CustomText>
            </button>
          </div>
        )}

        {/* Remove Calendar Actions */}
        {removeCalendarActive && (
          <div className={styles.buttonContainer}>
            <button
              onClick={() => setShowRemoveCalendarConfirmation(true)}
              className={styles.confirmRemoveButton}
              disabled={calendarsToRemove.length === 0}
            >
              <CustomText className={styles.confirmRemoveButtonText}>
                Remove Selected ({calendarsToRemove.length})
              </CustomText>
            </button>

            <button
              onClick={() => {
                setRemoveCalendarActive(false);
                setCalendarsToRemove([]);
              }}
              className={styles.cancelButton}
            >
              <CustomText className={styles.cancelButtonText}>Cancel</CustomText>
            </button>
          </div>
        )}

        {/* Calendar Color Selection Modal */}
        <CalendarColorSelectionModal
          isVisible={isColorSelectionModalVisible}
          onRequestClose={() => {
            setIsColorSelectionModalVisible(false);
            setSelectedGoogleCalendarForColorSelection(null);
          }}
          selectedItem={selectedGoogleCalendarForColorSelection?.color || eevaCalendar?.color}
          onSelect={updateCalendarColor}
        />

        {/* Remove Calendar Confirmation Modal */}
        <RemoveCalendarModal
          isVisible={showRemoveCalendarConfirmation}
          onConfirm={removeSelectedCalendars}
          onCancel={() => setShowRemoveCalendarConfirmation(false)}
        />
      </div>
    </div>
  );
};

export default CalendarsList;
