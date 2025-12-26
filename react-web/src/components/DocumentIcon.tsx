import React from 'react';
import Icon from './Icon';

interface DocumentIconProps {
  color?: string;
  size?: number;
}

const DocumentIcon: React.FC<DocumentIconProps> = ({ color, size = 24 }) => {
  return <Icon name="document" width={size} height={size} color={color} />;
};

export default DocumentIcon;
