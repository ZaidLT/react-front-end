'use client';

import React from 'react';
import { Colors, Typography } from '../styles';
import Icon from './Icon';
import CustomText from './CustomText';


interface HiveHexTileContent {
  icon?: string;
  title?: string;
  iconColor?: string;
  image?: string;
  lastName?: string;
  firstName?: string;
  initials?: string;
}

interface HiveHexTileProps {
  content?: HiveHexTileContent;
  onPress?: () => void;
  emptyTile?: boolean;
  coloredTile?: boolean;
  noBorderTile?: boolean;
  width?: number;
  height?: number;
  isMobile?: boolean;
  isPassiveMember?: boolean;
  centerIcon?: boolean;
  iconSize?: number;
}

const HiveHexTile: React.FC<HiveHexTileProps> = ({
  content,
  onPress,
  emptyTile = false,
  coloredTile = false,
  noBorderTile = false,
  width = 80,
  height = 80,
  isMobile = false,
  isPassiveMember = false,
  centerIcon = false,
  iconSize,
}) => {
  const renderContent = () => {
    // For empty tiles, show "+" icon and "Add" text
    if (emptyTile) {
      return (
        <div
          style={centerIcon ? {
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1,
          } : {
            display: 'flex', width: '95px', height: '50px', padding: '2px 25px 0 25px', flexDirection: 'column', alignItems: 'center', gap: '10px', position: 'absolute', right: '-0.002px', top: '28px', zIndex: 1,
          }}
        >
          <div style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4px',
          }}>
            <Icon
              name="plus"
              width={iconSize ?? 24}
              height={iconSize ?? 24}
              color={Colors.BLUE}
            />
            <CustomText style={{
              color: '#000E50', textAlign: 'center', fontFamily: 'Poppins', fontSize: '10px', fontStyle: 'normal', fontWeight: '500', lineHeight: '120%',
            }}>
              {content?.title || 'Add'}
            </CustomText>
          </div>
        </div>
      );
    }

    if (!content) {
      return null;
    }

    // Special handling for Eeva tile - only show logo, no text
    if (content.icon === 'hex-eeva-logo' || content.title === 'eeva') {
      return (
        <div
          style={centerIcon ? {
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
          } : {
            display: 'flex', width: '95px', height: '50px', padding: '2px 25px 0 25px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', position: 'absolute', right: '-0.002px', top: '28px', zIndex: 1,
          }}
        >
          <Icon
            name="hex-eeva-logo"
            width={iconSize ?? 38}
            height={iconSize ?? 40}
            color={Colors.BLUE}
          />
        </div>
      );
    }

    return (
      <div
        style={centerIcon ? {
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1,
        } : {
          display: 'flex', width: '95px', height: '50px', padding: '2px 25px 0 25px', flexDirection: 'column', alignItems: 'center', gap: '10px', position: 'absolute', right: '-0.002px', top: '28px', zIndex: 1,
        }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4px',
        }}>
          {/* Show icon if available */}
          {content.icon && (
            <Icon
              name={content.icon}
              width={iconSize ?? 24}
              height={iconSize ?? 24}
              color={Colors.BLUE}
            />
          )}

          {/* Show image/avatar if available and no icon */}
          {content.image && !content.icon && (
            <div style={{ width: '35px', height: '35px', position: 'relative' }}>
              <img
                src={content.image}
                alt="Avatar"
                style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  // Hide the image and show initials fallback
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
              <div
                style={{
                  width: '35px',
                  height: '35px',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: Colors.BLUE_GREY,
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '0',
                  left: '0',
                }}
              >
                <CustomText style={{
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  fontWeight: Typography.FONT_WEIGHT_600,
                  color: Colors.BLACK,
                  fontSize: Typography.FONT_SIZE_10,
                }}>
                  {content.initials || content.firstName?.charAt(0) || ''}
                </CustomText>
              </div>
            </div>
          )}

          {/* Show initials if no image and no icon */}
          {!content.image && !content.icon && (content.initials || content.firstName) && (
            <div
              style={{
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: Colors.BLUE_GREY,
                borderRadius: '50%',
              }}
            >
              <CustomText style={{
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                fontWeight: Typography.FONT_WEIGHT_600,
                color: Colors.BLACK,
                fontSize: Typography.FONT_SIZE_10,
              }}>
                {content.initials || content.firstName?.charAt(0) || ''}
              </CustomText>
            </div>
          )}

          {/* Always show title/firstName if available */}
          {(content.firstName || content.title) && (
            <CustomText style={{
              color: '#000E50',
              textAlign: 'center',
              fontFamily: 'Poppins',
              fontSize: '10px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '120%',
            }}>
              {content.firstName || content.title}
            </CustomText>
          )}

        </div>
      </div>
    );
  };



  return (
    <div
      onClick={onPress}
      style={{
        width: '95px',
        height: '106px',
        position: 'relative',
        cursor: onPress ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out',
        transform: 'scale(1) !important',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '9.11px',
      }}
      onMouseOver={() => {
        // Temporarily disabled hover effect to ensure correct sizing
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Background Image - use same hex-bg.svg for ALL tiles */}
      <img
        src="/backgrounds/hex-bg.svg"
        alt=""
        width={95}
        height={106}
        style={{
          width: '95px',
          height: '106px',
          position: 'absolute',
          top: 0,
          left: 0,
          objectFit: 'fill',
          zIndex: 0,
          filter: 'drop-shadow(0 4px 8px rgba(0, 14, 80, 0.12))',
        }}
      />
      {renderContent()}
    </div>
  );
};

export default HiveHexTile;
