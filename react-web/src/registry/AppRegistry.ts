import React from 'react';
import TaskContainer from '../components/containers/TaskContainer';
import EventContainer from '../components/containers/EventContainer';

export type DataType = 'Task' | 'Event' | 'Note' | 'Document';

export interface UnifiedItemCardProps {
  UniqueId: string;
  Title: string;
  Text?: string;
  type: DataType;
  Priority?: number | null;
  Deadline_DateTime?: string | null;
  CreationTimestamp?: string;
  User_uniqueId?: string;
  completed?: boolean;
  color?: string;
  onPress: () => void;
  onToggle?: (isCompleted: boolean) => void;
  getUserName?: (userId?: string) => string;
  formatDateForDisplay?: (item: any) => string;
  isAllDay?: boolean;
}

export interface UnifiedItemCardRenderProps {
  UniqueId: string;
  Title: string;
  displayText: string;
  displayDate: string;
  type: DataType;
  User_uniqueId?: string;
  color?: string;
  onPress: () => void;
  onToggleClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  getUserName?: (userId?: string) => string;
  isCompleted: boolean;
  showPriority: boolean;
  priorityLabel: string;
  priorityColor: string;
  showToggle: boolean;
  showUser: boolean;
  isPlaceholderText: boolean;
}

export type UnifiedItemCardContainer = React.FC<UnifiedItemCardRenderProps>;

const appRegistry: Record<DataType, UnifiedItemCardContainer> = {
  Task: TaskContainer,
  Event: EventContainer,
  Note: EventContainer,
  Document: EventContainer,
};

export const getContainerForType = (type: DataType): UnifiedItemCardContainer => {
  return appRegistry[type] ?? EventContainer;
};

export default appRegistry;
