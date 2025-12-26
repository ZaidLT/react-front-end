'use client';

import React from 'react';
import Icon from '../Icon';
import styles from './BeevaButton.module.css';

interface BeevaButtonProps {
  /** Click handler for the button */
  onClick: () => void;
  /** Optional className for positioning overrides */
  className?: string;
}

/**
 * BeevaButton - Beeva mascot icon button component
 *
 * A presentational button component that displays the Beeva mascot icon.
 * Click behavior is controlled by the parent component via the onClick prop.
 *
 * @example
 * ```tsx
 * <BeevaButton
 *   onClick={handleBeevaClick}
 *   className={styles.customPosition}
 * />
 * ```
 */
export const BeevaButton: React.FC<BeevaButtonProps> = ({ onClick, className }) => {
  return (
    <div
      className={`${styles.button} ${className || ''}`}
      onClick={onClick}
    >
      <Icon name='beeva' width={50} height={66} />
    </div>
  );
};

export default BeevaButton;
