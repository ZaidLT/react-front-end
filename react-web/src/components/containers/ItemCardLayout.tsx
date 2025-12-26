import React from 'react';
import { EevaCard } from '../ui/EevaCard';
import { UnifiedItemCardRenderProps } from '../../registry/AppRegistry';
import styles from './ItemCardLayout.module.css';

interface ItemCardLayoutProps extends UnifiedItemCardRenderProps {
  showToggle?: boolean;
}

const ItemCardLayout: React.FC<ItemCardLayoutProps> = ({
  UniqueId,
  Title,
  displayText,
  displayDate,
  User_uniqueId,
  color,
  onPress,
  onToggleClick,
  getUserName,
  isCompleted,
  showPriority,
  priorityLabel,
  priorityColor,
  showToggle = false,
  showUser,
  isPlaceholderText,
}) => {
  const cardClassName = color ? `${styles.card} ${styles.cardWithIndicator}` : styles.card;
  const indicatorStyle = color ? ({ ['--item-accent' as string]: color } as React.CSSProperties) : undefined;
  const priorityStyle = ({ ['--priority-color' as string]: priorityColor } as React.CSSProperties);

  return (
    <EevaCard
      className={cardClassName}
      onClick={onPress}
      padding="md"
      variant="default"
    >
      {color && <span className={styles.colorIndicator} style={indicatorStyle} />}
      <div className={styles.content}>
        <div className={`${styles.title} ${isCompleted ? styles.completed : ''}`}>{Title}</div>
        <div
          className={`${styles.description} ${isCompleted ? styles.completed : ''} ${
            isPlaceholderText ? styles.descriptionPlaceholder : ''
          }`}
        >
          {displayText}
        </div>
        <div className={styles.infoRow}>
          <div className={styles.infoGroup}>
            <div className={styles.infoItem}>
              <svg className={styles.infoIcon} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="0.5" />
                <path d="M5 2.5V5L6.5 6.5" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" />
              </svg>
              <span className={styles.infoText}>{displayDate}</span>
            </div>

            {showPriority && (
              <div className={`${styles.infoItem} ${styles.priority}`} style={priorityStyle}>
                <svg className={styles.infoIcon} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.6665 5.8335V8.75016" stroke="currentColor" strokeWidth="0.625" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.89884 1.59955C3.52165 0.887438 2.20692 1.41554 1.6665 1.84177V6.17725C2.07055 5.713 3.28267 4.99338 4.89884 5.82904C6.34317 6.57588 7.75167 6.16567 8.33317 5.843V1.67005C7.21217 2.17983 6.00705 2.17258 4.89884 1.59955Z" stroke="currentColor" strokeWidth="0.625" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={styles.priorityText}>{priorityLabel}</span>
              </div>
            )}

            {showUser && User_uniqueId && getUserName && (
              <div className={styles.infoItem}>
                <svg className={styles.infoIcon} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="5" cy="3" r="1.5" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M2 8.5C2 7 3.5 6 5 6C6.5 6 8 7 8 8.5" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" />
                </svg>
                <span className={styles.infoText}>{getUserName(User_uniqueId)}</span>
              </div>
            )}
          </div>

          {showToggle && onToggleClick && (
            <button
              type="button"
              className={`${styles.toggle} ${isCompleted ? styles.toggleActive : ''}`}
              onClick={onToggleClick}
            >
              <span className={styles.toggleKnob} />
            </button>
          )}
        </div>
      </div>
    </EevaCard>
  );
};

export default ItemCardLayout;
