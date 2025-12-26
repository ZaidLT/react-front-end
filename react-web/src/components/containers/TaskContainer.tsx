import React from 'react';
import { UnifiedItemCardRenderProps } from '../../registry/AppRegistry';
import ItemCardLayout from './ItemCardLayout';

const TaskContainer: React.FC<UnifiedItemCardRenderProps> = (props) => {
  return <ItemCardLayout {...props} showToggle />;
};

export default TaskContainer;
