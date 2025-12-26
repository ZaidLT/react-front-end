import React from 'react';
import { Colors, Typography } from '../../styles';
import { useLanguageContext } from '../../context/LanguageContext';
import CustomText from '../CustomText';
import Icon from '../Icon';
import CalendarActions from '../CalendarActions';
import styles from './CalendarItem.module.css';

export interface Calendar {
  id: string;
  summary?: string;
  color: string;
  isHidden: boolean;
}

interface CalendarItemProps {
  calendar: Calendar;
  isGoogleCalendar?: boolean;
  removeMode?: boolean;
  isSelected?: boolean;
  onVisibilityToggle: () => void;
  onColorClick?: () => void;
  onSelectionToggle?: () => void;
}

/**
 * CalendarItem - Individual calendar list item
 *
 * Displays a calendar with visibility toggle, color selection, and optional removal selection
 */
const CalendarItem: React.FC<CalendarItemProps> = ({
  calendar,
  isGoogleCalendar = false,
  removeMode = false,
  isSelected = false,
  onVisibilityToggle,
  onColorClick,
  onSelectionToggle,
}) => {
  const { i18n } = useLanguageContext();

  return (
    <div className={styles.container}>
      {/* TODO: Show when visibility toggle is implemented */}
      {!removeMode && (
        <div onClick={onVisibilityToggle} className={styles.visibilityToggle} style={{ display: 'none' }}>
          <Icon
            name={calendar.isHidden ? "eye-slash" : "eye"}
            width={24}
            height={24}
            color={calendar.isHidden ? Colors.GREY_COLOR : Colors.BLUE}
          />
        </div>
      )}

      {removeMode && onSelectionToggle && (
        <div onClick={onSelectionToggle} className={styles.selectionToggle}>
          <div
            className={styles.selectionCircle}
            style={{
              backgroundColor: isSelected ? Colors.BLUE : 'transparent',
              borderColor: Colors.BLUE,
            }}
          >
            {isSelected && <div className={styles.selectionDot} />}
          </div>
        </div>
      )}

      <CustomText className={styles.calendarText}>
        {calendar.summary || `${i18n.t("My")} eeva ${i18n.t("Calendar").toLowerCase()}`}
      </CustomText>

      <CalendarActions color={calendar.color} onColorClick={onColorClick} />
    </div>
  );
};

export default CalendarItem;
