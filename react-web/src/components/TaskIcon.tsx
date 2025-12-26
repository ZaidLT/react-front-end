import React from 'react';
import Icon from './Icon';

interface TaskIconProps {
  color?: string;
  size?: number;
}

const TaskIcon: React.FC<TaskIconProps> = ({ color, size = 24 }) => {
  return <Icon name="task" width={size} height={size} color={color} />;
};

export default TaskIcon;
