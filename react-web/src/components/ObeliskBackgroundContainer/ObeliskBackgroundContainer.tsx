'use client';

import React from 'react';
import styles from './ObeliskBackgroundContainer.module.css';

export interface ObeliskBackgroundContainerProps {
  /** Content to render inside the container */
  children: React.ReactNode;

  /** Additional className for custom styling */
  className?: string;

  /** Additional inline styles if needed */
  style?: React.CSSProperties;
}

/**
 * ObeliskBackgroundContainer - Container with obelisk-themed background
 * Provides the home background image and centers content with max-width constraint
 */
const ObeliskBackgroundContainer: React.FC<ObeliskBackgroundContainerProps> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <div className={`${styles.background} ${className}`} style={style}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default ObeliskBackgroundContainer;
