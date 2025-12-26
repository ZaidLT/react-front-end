import React from 'react';
import { UnifiedItemCardRenderProps } from '../../registry/AppRegistry';
import ItemCardLayout from './ItemCardLayout';

const EventContainer: React.FC<UnifiedItemCardRenderProps> = (props) => {
  return <ItemCardLayout {...props} />;
};

export default EventContainer;
