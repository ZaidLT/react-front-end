'use client';

import React from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';
import { WeeklyStatsCardSkeleton } from './SkeletonLoader';

interface WeeklyStatsCardProps {
  number: number;
  title: string;
  subtitle: string;
  items?: Array<{
    id: string;
    title: string;
    color: string;
    onPress?: () => void;
  }>;
  emptyMessage?: string;
  onSourcePress?: () => void;
  isLoading?: boolean;
}

const WeeklyStatsCard: React.FC<WeeklyStatsCardProps> = ({
  number,
  title,
  subtitle,
  items = [],
  emptyMessage = "Items will appear here",
  onSourcePress,
  isLoading = false
}) => {
  // Show skeleton if loading
  if (isLoading) {
    return <WeeklyStatsCardSkeleton />;
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
        backgroundColor: Colors.WHITE,
        borderRadius: '10px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        maxHeight: '200px',
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
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          alignItems: 'center'
        }}>
          <CustomText style={{
            fontSize: Typography.FONT_SIZE_40,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            fontWeight: Typography.FONT_WEIGHT_600,
            color: Colors.PRIMARY_ELECTRIC_BLUE,
          }}>
            {number}
          </CustomText>
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

      {/* Items */}
      {items.length > 0 ? (
        items.slice(0, 2).map((item, index) => {
          const handleItemClick = (e: React.MouseEvent) => {
            e.stopPropagation(); // Prevent card click
            if (item.onPress) {
              item.onPress();
            }
          };

          return (
            <div
              key={item.id || index}
              onClick={handleItemClick}
              style={{
                marginTop: '10px',
                padding: '8px 0',
                border: `1px solid ${Colors.GRAY}`,
                borderRadius: '10px',
                paddingLeft: '10px',
                display: 'flex',
                flexDirection: 'row',
                gap: '6px',
                alignItems: 'center',
                cursor: item.onPress ? 'pointer' : 'default'
              }}
            >
              <div style={{
                height: '16px',
                width: '4px',
                backgroundColor: item.color,
                borderRadius: '8px'
              }} />
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_14,
                fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                color: Colors.BLUE,
              }}>
                {item.title}
              </CustomText>
            </div>
          );
        })
      ) : (
        <div style={{
          marginTop: '10px',
          padding: '8px 0',
          border: `1px solid ${Colors.GRAY}`,
          borderRadius: '10px',
          paddingLeft: '10px',
          display: 'flex',
          flexDirection: 'row',
          gap: '6px',
          alignItems: 'center'
        }}>
          <div style={{
            height: '16px',
            width: '4px',
            backgroundColor: Colors.PRIMARY_ELECTRIC_20,
            borderRadius: '8px'
          }} />
          <CustomText style={{
            fontSize: Typography.FONT_SIZE_14,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.BLUE,
          }}>
            {emptyMessage}
          </CustomText>
        </div>
      )}
    </div>
  );
};

export default WeeklyStatsCard;
