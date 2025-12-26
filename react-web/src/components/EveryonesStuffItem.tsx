'use client';

import React from 'react';
import { Typography } from '../styles';
import CustomText from './CustomText';

interface EveryonesStuffItemProps {
  type: 'Task' | 'Note' | 'Document' | 'Event';
  count: number;
  label: string;
  color: string;
  borderColor: string;
  onClick?: () => void;
}

// Map types to their corresponding SVG file names
const svgFileMap = {
  Task: 'icon-hex-task.svg',
  Note: 'icon-hex-note.svg',
  Document: 'icon-hex-doc.svg',
  Event: 'icon-hex-event.svg',
};

const EveryonesStuffItem: React.FC<EveryonesStuffItemProps> = ({
  type,
  count,
  label,
  color,
  borderColor,
  onClick,
}) => {
  const svgFileName = svgFileMap[type];

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: 72,
        height: 80,
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Complete Hex SVG with icon and text */}
      <img
        src={`/icons/life/${svgFileName}`}
        alt={`${type} hex`}
        style={{
          width: 72,
          height: 80,
          objectFit: 'contain',
        }}
      />

      {/* Count Badge - Always show, even for 0 */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          right: 0,
          backgroundColor: borderColor,
          borderRadius: '50%',
          display: 'flex',
          width: 22,
          height: 22,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
          zIndex: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <CustomText
          style={{
            color: 'white',
            fontSize: Typography.FONT_SIZE_12,
            fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {count > 99 ? '99' : count.toString()}
        </CustomText>
      </div>
    </div>
  );
};

export default EveryonesStuffItem;
