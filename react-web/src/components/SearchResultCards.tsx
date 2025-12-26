'use client';

import React from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';
import { TaskIcon, EventIcon, NoteIcon, FileIcon } from './SearchAccordion';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'event' | 'note' | 'file';
  date?: string;
  data: any;
}

interface BaseCardProps {
  onPress: () => void;
}

// File Card Component
interface FileCardProps extends BaseCardProps {
  file: SearchResult;
  metadata?: {
    homeMemberId?: string;
    userUniqueId?: string;
  };
  type?: "DOC" | "IMG";
}

export const FileCard: React.FC<FileCardProps> = ({ 
  file, 
  type = "DOC", 
  metadata,
  onPress 
}) => {
  const displayTitle = file.title?.length > 26
    ? file.title?.slice(0, 26) + "..."
    : file.title?.split(".")[0] || 'Untitled File';

  return (
    <button
      onClick={onPress}
      style={styles.cardContainer}
    >
      <div style={styles.iconContainer}>
        <FileIcon width={28} height={28} />
      </div>
      <CustomText style={styles.cardTitle}>
        {displayTitle}
      </CustomText>
    </button>
  );
};

// Event Card Component
interface EventCardProps extends BaseCardProps {
  event: SearchResult;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const displayTitle = event.title?.length > 26
    ? event.title?.slice(0, 26) + "..."
    : event.title?.split(".")[0] || 'Untitled Event';

  return (
    <button
      onClick={onPress}
      style={styles.cardContainer}
    >
      <div style={styles.iconContainer}>
        <EventIcon width={28} height={28} />
      </div>
      <CustomText style={styles.cardTitle}>
        {displayTitle}
      </CustomText>
    </button>
  );
};

// Note Card Component
interface NoteCardProps extends BaseCardProps {
  note: SearchResult;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onPress }) => {
  const displayTitle = (note.title ?? "").length > 26
    ? note.title?.slice(0, 26) + "..."
    : note.title?.split(".")[0] || 'Untitled Note';

  return (
    <button
      onClick={onPress}
      style={styles.cardContainer}
    >
      <div style={styles.iconContainer}>
        <NoteIcon width={28} height={28} />
      </div>
      <CustomText style={styles.cardTitle}>
        {displayTitle}
      </CustomText>
    </button>
  );
};

// Task Card Component
interface TaskCardProps extends BaseCardProps {
  task: SearchResult;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const displayTitle = (task.title ?? "").length > 26
    ? task.title?.slice(0, 26) + "..."
    : task.title?.split(".")[0] || 'Untitled Task';

  return (
    <button
      onClick={onPress}
      style={styles.cardContainer}
    >
      <div style={styles.iconContainer}>
        <TaskIcon width={28} height={28} />
      </div>
      <CustomText style={styles.cardTitle}>
        {displayTitle}
      </CustomText>
    </button>
  );
};

// Generic Result Card Component
interface ResultCardProps extends BaseCardProps {
  result: SearchResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onPress }) => {
  const getIcon = () => {
    switch (result.type) {
      case 'task':
        return <TaskIcon width={28} height={28} />;
      case 'event':
        return <EventIcon width={28} height={28} />;
      case 'note':
        return <NoteIcon width={28} height={28} />;
      case 'file':
        return <FileIcon width={28} height={28} />;
      default:
        return <FileIcon width={28} height={28} />;
    }
  };

  const displayTitle = result.title?.length > 26
    ? result.title?.slice(0, 26) + "..."
    : result.title || 'Untitled';

  return (
    <button
      onClick={onPress}
      style={styles.cardContainer}
    >
      <div style={styles.iconContainer}>
        {getIcon()}
      </div>
      <CustomText style={styles.cardTitle}>
        {displayTitle}
      </CustomText>
    </button>
  );
};

// Enhanced Result Card with Description
interface EnhancedResultCardProps extends BaseCardProps {
  result: SearchResult;
  showDescription?: boolean;
  showDate?: boolean;
}

export const EnhancedResultCard: React.FC<EnhancedResultCardProps> = ({ 
  result, 
  onPress,
  showDescription = true,
  showDate = true
}) => {
  const getIcon = () => {
    switch (result.type) {
      case 'task':
        return <TaskIcon width={24} height={24} />;
      case 'event':
        return <EventIcon width={24} height={24} />;
      case 'note':
        return <NoteIcon width={24} height={24} />;
      case 'file':
        return <FileIcon width={24} height={24} />;
      default:
        return <FileIcon width={24} height={24} />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <button
      onClick={onPress}
      style={styles.enhancedCardContainer}
    >
      <div style={styles.enhancedIconContainer}>
        {getIcon()}
      </div>
      <div style={styles.enhancedCardContent}>
        <CustomText style={styles.enhancedCardTitle}>
          {result.title || 'Untitled'}
        </CustomText>
        {showDescription && result.description && (
          <CustomText style={styles.enhancedCardDescription}>
            {result.description}
          </CustomText>
        )}
        {showDate && result.date && (
          <CustomText style={styles.enhancedCardDate}>
            {formatDate(result.date)}
          </CustomText>
        )}
      </div>
    </button>
  );
};

const styles = {
  cardContainer: {
    width: '100%',
    height: '44px',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    backgroundColor: Colors.WHITE,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  iconContainer: {
    height: '100%',
    aspectRatio: '1 / 1',
    minWidth: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: Colors.BLUE,
    textAlign: 'left' as const,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
  enhancedCardContainer: {
    width: '100%',
    minHeight: '60px',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: '12px',
    padding: '12px',
    backgroundColor: Colors.WHITE,
    border: `1px solid ${Colors.COSMIC}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left' as const,
  },
  enhancedIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px',
  },
  enhancedCardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '4px',
  },
  enhancedCardTitle: {
    fontSize: 14,
    color: Colors.MIDNIGHT,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    marginBottom: '4px',
  },
  enhancedCardDescription: {
    fontSize: 12,
    color: Colors.GREY_COLOR,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    lineHeight: '1.4',
  },
  enhancedCardDate: {
    fontSize: 11,
    color: Colors.GREY_COLOR,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
};

// Add hover effects
const addHoverEffects = () => {
  const style = document.createElement('style');
  style.textContent = `
    .search-card:hover {
      background-color: ${Colors.COSMIC} !important;
    }
    .enhanced-search-card:hover {
      background-color: ${Colors.COSMIC} !important;
      border-color: ${Colors.BLUE} !important;
    }
  `;
  document.head.appendChild(style);
};

// Initialize hover effects
if (typeof document !== 'undefined') {
  addHoverEffects();
}

export default {
  FileCard,
  EventCard,
  NoteCard,
  TaskCard,
  ResultCard,
  EnhancedResultCard,
};
