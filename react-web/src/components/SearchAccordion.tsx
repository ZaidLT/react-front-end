'use client';

import React, { useState, ReactNode } from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';
import { useLanguageContext } from '../context/LanguageContext';

export enum EDentType {
  DOCS = "DOCS",
  EVENTS = "EVENTS",
  NOTES = "NOTES", 
  TASKS = "TASKS",
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'event' | 'note' | 'file';
  date?: string;
  data: any;
}

interface AccordionItemProps {
  title: string;
  accordIcon: ReactNode;
  count: number;
  AccordionType: EDentType;
  children: ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  accordIcon,
  count,
  children,
  AccordionType,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const { i18n } = useLanguageContext();

  const toggleItem = () => {
    setExpanded(!expanded);
  };

  let countType = "";
  if (AccordionType === EDentType.DOCS) {
    countType = i18n.t('Documents');
  } else if (AccordionType === EDentType.EVENTS) {
    countType = i18n.t('Events');
  } else if (AccordionType === EDentType.NOTES) {
    countType = i18n.t('Notes');
  } else if (AccordionType === EDentType.TASKS) {
    countType = i18n.t('Tasks');
  }

  return (
    <div style={styles.accordContainer}>
      <button style={styles.accordHeader} onClick={toggleItem}>
        <div style={styles.accordIconTitleContainer}>
          {accordIcon}
          <CustomText style={styles.accordTitleText}>
            {title}{" "}
            <span style={styles.accordTitleSpanText}>
              {count} {countType}
            </span>
          </CustomText>
        </div>
        <div style={{
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}>
          <ChevronIcon />
        </div>
      </button>
      {expanded && (
        <div style={styles.accordBody}>
          {children}
        </div>
      )}
    </div>
  );
};

// Chevron icon component
const ChevronIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={Colors.BLUE}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Icon components for different types
export const TaskIcon: React.FC<{ width?: number; height?: number }> = ({ 
  width = 28, 
  height = 28 
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={Colors.BLUE}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

export const EventIcon: React.FC<{ width?: number; height?: number }> = ({ 
  width = 28, 
  height = 28 
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={Colors.BLUE}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export const NoteIcon: React.FC<{ width?: number; height?: number }> = ({ 
  width = 28, 
  height = 28 
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={Colors.BLUE}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

export const FileIcon: React.FC<{ width?: number; height?: number }> = ({ 
  width = 28, 
  height = 28 
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={Colors.BLUE}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14,2 14,8 20,8" />
  </svg>
);

const styles = {
  accordContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  accordHeader: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '40px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  accordIconTitleContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '8px',
  },
  accordTitleText: {
    fontSize: 16,
    color: Colors.BLUE,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
  accordTitleSpanText: {
    fontSize: 14,
    color: Colors.BLUE,
    fontWeight: '500',
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
  accordBody: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
};

export default AccordionItem;
