'use client';

import React from 'react';
import CustomText from '../../CustomText';
import { Colors } from '../../../styles';
import { processAvatarUrl, generateInitials } from '../utils';
import styles from './HexAvatarContent.module.css';

export interface HexAvatarContentProps {
  /** User data for avatar display */
  user: {
    id: string;
    firstName: string;
    lastName?: string;
    avatarUrl?: string | null;
  };

  /** Avatar size in pixels */
  avatarSize?: number;

  /** Whether to show the user's name below the avatar */
  showName?: boolean;

  /** Additional className for custom styling */
  className?: string;

  /** Additional inline styles if needed */
  style?: React.CSSProperties;
}

/**
 * HexAvatarContent - Content component for displaying user avatar/initials with name
 * Use this inside HexContainer, HexButton, or HexLink
 */
const HexAvatarContent: React.FC<HexAvatarContentProps> = ({
  user,
  avatarSize = 35,
  showName = true,
  className = '',
  style,
}) => {
  const avatarUrl = processAvatarUrl(user.avatarUrl);
  const initials = generateInitials(user.firstName, user.lastName);

  return (
    <div className={`${styles.container} ${className}`} style={style}>
      {/* Avatar or Initials */}
      <div className={styles['avatar-wrapper']}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user.firstName}
            className={styles.avatar}
            style={{
              width: avatarSize,
              height: avatarSize,
            }}
            onError={(e) => {
              // Hide image and show initials on error
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) {
                fallback.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          className={styles['initials-circle']}
          style={{
            width: avatarSize,
            height: avatarSize,
            display: avatarUrl ? 'none' : 'flex',
          }}
        >
          <CustomText
            style={{
              fontWeight: 600,
              fontSize: 10,
              color: Colors.BLACK,
            }}
          >
            {initials}
          </CustomText>
        </div>
      </div>

      {/* Name Label */}
      {showName && (
        <CustomText
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: Colors.MIDNIGHT,
          }}
        >
          {user.firstName}
        </CustomText>
      )}
    </div>
  );
};

export default HexAvatarContent;
