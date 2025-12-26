'use client';

import React from 'react';
import Icon from '../../Icon';
import CustomText from '../../CustomText';
import { Colors } from '../../../styles';
import styles from './HexIconContent.module.css';

export interface HexIconContentProps {
  /** Icon name to display */
  iconName: string;

  /** Icon size in pixels */
  iconSize?: number;

  /** Icon color */
  iconColor?: string;

  /** Optional label text below the icon */
  label?: string;

  /** Label text color */
  labelColor?: string;

  /** Additional className for custom styling */
  className?: string;

  /** Additional inline styles if needed */
  style?: React.CSSProperties;
}

/**
 * HexIconContent - Content component for displaying an icon with optional label
 * Use this inside HexContainer, HexButton, or HexLink
 */
const HexIconContent: React.FC<HexIconContentProps> = ({
  iconName,
  iconSize = 24,
  iconColor = Colors.BLUE,
  label,
  labelColor = Colors.MIDNIGHT,
  className = '',
  style,
}) => {
  return (
    <div className={`${styles.container} ${className}`} style={style}>
      <Icon name={iconName} width={iconSize} height={iconSize} color={iconColor} />
      {label && (
        <CustomText
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: labelColor,
          }}
        >
          {label}
        </CustomText>
      )}
    </div>
  );
};

export default HexIconContent;
