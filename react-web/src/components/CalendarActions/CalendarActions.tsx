import React from 'react';
import { Colors } from '../../styles';
import styles from './CalendarActions.module.css';

interface CalendarActionsProps {
  color: string;
  onColorClick?: () => void;
}

/**
 * CalendarActions - Action buttons for calendar items
 *
 * Displays color selection indicator (non-clickable if onColorClick not provided)
 */
const CalendarActions: React.FC<CalendarActionsProps> = ({
  color,
  onColorClick,
}) => {
  return (
    <div className={styles.container}>
      <div
        onClick={onColorClick}
        className={styles.colorIndicator}
        style={{ cursor: onColorClick ? 'pointer' : 'default' }}
      >
        <div
          className={styles.colorDot}
          style={{ backgroundColor: color || Colors.BLUE }}
        />
      </div>
    </div>
  );
};

export default CalendarActions;
