import React from 'react';
import Icon from './Icon';

interface EventIconProps {
  color?: string;
  size?: number;
}

const EventIcon: React.FC<EventIconProps> = ({ color, size = 24 }) => {
  return <Icon name="calendar" width={size} height={size} color={color} />;
};

export default EventIcon;
