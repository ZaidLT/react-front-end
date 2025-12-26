'use client';

import React from 'react';
import HexBackground from '../HexBackground/HexBackground';
import { HexHoverType, HexBackgroundType } from '../types';
import sharedStyles from '../hex-shared.module.css';
import styles from './HexButton.module.css';

export interface HexButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /** Content to render inside the hex */
  children: React.ReactNode;

  /** Hover animation type */
  hover?: HexHoverType;

  /** Background variant */
  background?: HexBackgroundType;

  /** Button type */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * HexButton - Interactive hexagon button
 * Use this for actions (triggering modals, form submissions, etc.)
 * For navigation, use HexLink instead.
 */
const HexButton: React.FC<HexButtonProps> = ({
  children,
  hover,
  background,
  disabled,
  type = 'button',
  className = '',
  style,
  ...buttonProps
}) => {
  // Disable hover animation when button is disabled
  const hoverClass = (!disabled && hover === HexHoverType.Scale)
    ? sharedStyles['hover-scale']
    : '';

  const disabledClass = disabled ? styles.disabled : '';

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${sharedStyles['hex-base']} ${sharedStyles['cursor-pointer']} ${hoverClass} ${disabledClass} ${className}`}
      style={style}
      {...buttonProps}
    >
      <HexBackground variant={background} />
      <div className={sharedStyles['hex-content']}>
        {children}
      </div>
    </button>
  );
};

export default HexButton;
