import React from 'react';
import { Colors, Typography } from '../styles';
import HiveTile from './HiveTile';
import TaskIcon from './TaskIcon';
import NoteIcon from './NoteIcon';
import EventIcon from './EventIcon';
import DocumentIcon from './DocumentIcon';
import CustomText from './CustomText';

interface TileProps {
  text?: string;
  type: string;
  tileWidth: number;
  tileHeight: number;
  iconSize?: number;
}

const types = [
  {
    name: 'Task',
    icon: TaskIcon,
    color: '#FFE2E0',
    borderColor: Colors.LIGHT_RED || '#FF6B6B',
  },
  {
    name: 'Note',
    icon: NoteIcon,
    color: '#FFFBDB',
    borderColor: Colors.MUSTARD || '#FFD166',
  },
  {
    name: 'Event',
    icon: EventIcon,
    color: '#E7E2FF',
    borderColor: Colors.PURPLE || '#A78BFA',
  },
  {
    name: 'Document',
    icon: DocumentIcon,
    color: '#E0F8E5',
    borderColor: Colors.PISTACHIO_GREEN || '#10B981',
  },
];

const Tile: React.FC<TileProps> = ({
  text = '',
  type,
  tileWidth,
  tileHeight,
  iconSize = 16,
}) => {
  const colorInfo = types.find((t) => t.name === type);

  if (!colorInfo) {
    return null; // Handle the case where type doesn't match any predefined type
  }

  const { icon: IconComponent, color, borderColor } = colorInfo;
  
  // Calculate appropriate sizes
  const calculatedIconSize = Math.floor(tileWidth * 0.35);
  const fontSize = Math.max(Math.floor(tileWidth * 0.18), 8);

  return (
    <div
      style={{
        position: 'relative',
        width: tileWidth,
        height: tileHeight,
      }}
    >
      {/* Hexagonal background */}
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <HiveTile
          fill={color}
          height={tileHeight}
          width={tileWidth}
          borderColor={borderColor}
        />
      </div>
      
      {/* Content container */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: tileWidth,
          height: tileHeight,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
        }}
      >
        {/* Icon */}
        <div style={{ marginBottom: text ? '2px' : 0 }}>
          <IconComponent 
            color={borderColor} 
            size={calculatedIconSize} 
          />
        </div>
        
        {/* Text */}
        {text && (
          <CustomText
            style={{
              color: borderColor,
              fontSize: fontSize,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              fontWeight: 500,
              lineHeight: 1,
              textAlign: 'center',
              maxWidth: tileWidth * 0.7,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </CustomText>
        )}
      </div>
    </div>
  );
};

export default Tile;
