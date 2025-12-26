'use client';

import React from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';
import { WeeklyStatsSmallCardSkeleton } from './SkeletonLoader';

interface WeeklyStatsSmallCardProps {
  number: number;
  title: string;
  subtitle: string;
  onSourcePress?: () => void;
  isLoading?: boolean;
}

const WeeklyStatsSmallCard: React.FC<WeeklyStatsSmallCardProps> = ({
  number,
  title,
  subtitle,
  onSourcePress,
  isLoading = false
}) => {
  // Show skeleton if loading
  if (isLoading) {
    return <WeeklyStatsSmallCardSkeleton />;
  }

  const handleCardClick = () => {
    if (onSourcePress) {
      onSourcePress();
    }
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onSourcePress) {
      onSourcePress();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        flex: 1,
        backgroundColor: Colors.WHITE,
        borderRadius: '10px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        cursor: onSourcePress ? 'pointer' : 'default'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <CustomText style={{
          fontSize: Typography.FONT_SIZE_40,
          fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
          fontWeight: Typography.FONT_WEIGHT_600,
          color: Colors.PRIMARY_ELECTRIC_BLUE,
        }}>
          {number}
        </CustomText>
        
        {onSourcePress && (
          <div
            onClick={handleChevronClick}
            style={{
              cursor: 'pointer',
              padding: '4px',
              marginTop: '-20px'
            }}
          >
            {/* Source icon - using a simple arrow for now */}
            <div style={{
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke={Colors.PRIMARY_ELECTRIC_BLUE}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* Title and Subtitle */}
      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        <CustomText style={{
          fontSize: Typography.FONT_SIZE_16,
          fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
          color: Colors.PRIMARY_ELECTRIC_60,
          display: 'block'
        }}>
          {title}
        </CustomText>
        <CustomText style={{
          fontSize: Typography.FONT_SIZE_16,
          fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
          color: Colors.PRIMARY_ELECTRIC_60,
          marginTop: '2px',
          display: 'block'
        }}>
          {subtitle}
        </CustomText>
      </div>
    </div>
  );
};

export default WeeklyStatsSmallCard;
