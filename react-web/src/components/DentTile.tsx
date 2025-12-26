import React from 'react';
import { Colors, Typography } from '../styles';
import TaskIcon from './TaskIcon';
import NoteIcon from './NoteIcon';
import EventIcon from './EventIcon';
import DocumentIcon from './DocumentIcon';

interface DentTileProps {
  text?: string;
  type: string;
  size?: number;
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

const DentTile: React.FC<DentTileProps> = ({
  text,
  type,
  size = 50,
}) => {
  const colorInfo = types.find((t) => t.name === type) || types[0];
  const { icon: IconComponent, color, borderColor } = colorInfo;
  
  // Calculate sizes based on the overall tile size
  const iconSize = Math.floor(size * 0.35);
  const fontSize = Math.floor(size * 0.18);
  
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
      }}
    >
      {/* Hexagon shape */}
      <svg width={size} height={size} viewBox="0 0 92 105" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M84.9928 23.4051L47.9928 2.14507C46.7589 1.43605 45.2411 1.43605 44.0072 2.14507L7.00717 23.4051C5.76553 24.1186 5 25.4414 5 26.8734V70.322C5 71.754 5.76553 73.0768 7.00717 73.7903L44.0072 95.0503C45.2411 95.7594 46.7589 95.7594 47.9928 95.0503L84.9928 73.7903C86.2345 73.0768 87 71.754 87 70.322V26.8734C87 25.4414 86.2345 24.1186 84.9928 23.4051Z"
          fill={color}
          stroke={borderColor}
          strokeWidth="2"
        />
      </svg>
      
      {/* Content */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 0,
        }}
      >
        {/* Icon */}
        <div style={{ marginBottom: text ? 2 : 0 }}>
          <IconComponent color={borderColor} size={iconSize} />
        </div>
        
        {/* Text */}
        {text && (
          <span
            style={{
              color: borderColor,
              fontSize: fontSize,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              fontWeight: 500,
              lineHeight: 1,
              textAlign: 'center',
              maxWidth: '70%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

export default DentTile;
