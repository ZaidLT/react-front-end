import React from 'react';
import Icon from './Icon';

interface NoteIconProps {
  color?: string;
  size?: number;
}

const NoteIcon: React.FC<NoteIconProps> = ({ color, size = 24 }) => {
  return <Icon name="note" width={size} height={size} color={color} />;
};

export default NoteIcon;
