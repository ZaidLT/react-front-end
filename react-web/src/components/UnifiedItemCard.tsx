import React, { useState, useEffect } from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';
import moment from 'moment';
import { useLanguageContext } from '../context/LanguageContext';


interface UnifiedItemCardProps {
  UniqueId: string;
  Title: string;
  Text?: string;
  type: 'Task' | 'Event' | 'Note' | 'Document';
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
  // All-day indicator for display logic
  isAllDay?: boolean;
}

/**
 * UnifiedItemCard - A unified card component for displaying items across the app
 *
 * This component provides consistent styling for tasks, events, notes, and documents
 * across different pages like /time and /life/all-dents.
 */
const UnifiedItemCard: React.FC<UnifiedItemCardProps> = ({
  UniqueId,
  Title,
  Text,
  type,
  Priority,
  Deadline_DateTime,
  CreationTimestamp,
  User_uniqueId,
  completed = false,
  color,
  onPress,
  onToggle,
  getUserName,
  formatDateForDisplay,
  isAllDay,
}) => {
  const { i18n } = useLanguageContext();
  const [isCompleted, setIsCompleted] = useState(completed);

  // Sync internal state with prop changes
  useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

  // Priority colors - Updated to match backend API (0=None, 1=Low, 2=Medium, 3=High)
  const getPriorityColor = (priority?: number | null): string => {
    switch (priority) {
      case 0: return Colors.GREY_COLOR; // None
      case 1: return Colors.PISTACHIO_GREEN; // Low
      case 2: return Colors.MUSTARD; // Medium
      case 3: return Colors.RED; // High
      default: return Colors.GREY_COLOR;
    }
  };

  // Priority labels - Updated to match backend API (0=None, 1=Low, 2=Medium, 3=High)
  const getPriorityLabel = (priority?: number | null): string => {
    switch (priority) {
      case 0: return 'None';
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return '';
    }
  };

  // Format bullet point list for notes (up to 2 lines with ellipsis)
  const formatBulletPointList = (text: string): string => {
    if (!text) return text;

    // Try to parse as JSON first (in case it's checklist data)
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        // If it's an array of checklist items
        const checklistItems = parsed.filter(item =>
          item && (typeof item === 'string' || (typeof item === 'object' && item.text))
        );

        if (checklistItems.length >= 2) {
          const displayItems = checklistItems.slice(0, 2);
          const formattedItems = displayItems.map(item => {
            const itemText = typeof item === 'string' ? item : item.text || item.title || '';
            return `• ${itemText.trim()}`;
          });

          if (checklistItems.length > 2) {
            return formattedItems.join('\n') + '\n...';
          }

          return formattedItems.join('\n');
        }
      } else if (parsed && typeof parsed === 'object' && parsed.items) {
        // If it's an object with items array
        return formatBulletPointList(JSON.stringify(parsed.items));
      }
    } catch (e) {
      // Not JSON, continue with original text
    }

    return text; // Return original text if not a checklist
  };

  // Handle toggle for tasks
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    if (onToggle) {
      onToggle(newCompleted);
    }
  };

  // Format date/time or All Day for display
  const getDisplayDate = (): string => {
    // When All Day is true, show date label + All Day
    if (isAllDay) {
      const dateToUse = Deadline_DateTime || CreationTimestamp;
      if (dateToUse) {
        const date = moment(dateToUse);
        const now = moment();
        let label: string;
        if (date.isSame(now, 'day')) {
          label = i18n.t('Today');
        } else if (date.isSame(now.clone().add(1, 'day'), 'day')) {
          label = i18n.t('Tomorrow');
        } else if (date.isSame(now.clone().subtract(1, 'day'), 'day')) {
          label = i18n.t('Yesterday');
        } else {
          label = date.format('MMMM Do');
        }
        return `${label} - ${i18n.t('AllDay') || 'All Day'}`;
      }
      return i18n.t('AllDay') || 'All Day';
    }

    if (formatDateForDisplay) {
      return formatDateForDisplay({
        Deadline_DateTime,
        CreationTimestamp,
        type
      });
    }

    // Default formatting
    const dateToUse = Deadline_DateTime || CreationTimestamp;
    if (!dateToUse) return '';

    const date = moment(dateToUse);
    const now = moment();

    if (date.isSame(now, 'day')) {
      return i18n.t('Today');
    } else if (date.isSame(now.clone().add(1, 'day'), 'day')) {
      return i18n.t('Tomorrow');
    } else if (date.isSame(now.clone().subtract(1, 'day'), 'day')) {
      return i18n.t('Yesterday');
    } else {
      return date.format('MMM D');
    }
  };

  return (
    <div
      key={UniqueId}
      onClick={onPress}
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        minHeight: '90px',
        padding: color ? '12px 12px 12px 28px' : '12px',
        alignItems: 'flex-start',
        borderRadius: '6px',
        border: '1px solid #E6E7EE',
        background: '#FFF',
        boxShadow: '0 2px 4px 0 rgba(0, 14, 80, 0.10)',
        marginBottom: '16px',
        cursor: 'pointer',
        boxSizing: 'border-box',
        marginTop: '0'
      }}
    >
      {/* Color indicator line */}
      {color && (
        <div
          style={{
            position: 'absolute',
            left: '12px',
            top: '12px',
            width: '4px',
            height: 'calc(100% - 24px)',
            backgroundColor: color,
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            borderBottomRightRadius: '6px',
            borderBottomLeftRadius: '6px'
          }}
        />
      )}

      {/* Content div - Full width */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '12px',
        flex: '1 0 0',
        width: '100%'
      }}>
        {/* Title - Full width */}
        <div style={{
          alignSelf: 'stretch',
          color: '#000E50',
          fontFamily: 'Poppins',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: '120%',
          textDecoration: (isCompleted && type === 'Task') ? 'line-through' : 'none',
          opacity: (isCompleted && type === 'Task') ? 0.6 : 1
        }}>
          {Title}
        </div>

        {/* Description - Full width with smart truncation */}
        <div style={{
          alignSelf: 'stretch',
          color: Text ? '#000E50' : '#999999',
          fontFamily: 'Poppins',
          fontSize: '12px',
          fontStyle: Text ? 'normal' : 'italic',
          fontWeight: 400,
          lineHeight: '120%',
          wordWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          textDecoration: (isCompleted && type === 'Task') ? 'line-through' : 'none',
          opacity: (isCompleted && type === 'Task') ? 0.6 : 1
        }}>
          {(() => {
            const text = Text || (
              type === 'Task' ? i18n.t('NoTaskDescription') :
              type === 'Event' ? i18n.t('NoEventDescription') :
              type === 'Note' ? i18n.t('NoNoteDescription') :
              i18n.t('NoDocumentDescription')
            );

            // For notes, try to format as bullet points if it's checklist data
            if (type === 'Note' && Text) {
              const formattedText = formatBulletPointList(Text);
              if (formattedText !== Text) {
                // It was formatted as bullet points, return as-is
                return formattedText;
              }
            }

            // Default truncation for content
            if (text.length > 100) {
              return text.substring(0, 100) + '...';
            }
            return text;
          })()}
        </div>

        {/* Info div - Full width with embedded elements */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          alignSelf: 'stretch',
          gap: '12px'
        }}>
          {/* Left side - Date/Time and Priority */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Date/Time */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px'
            }}>
              {/* Clock icon using SVG */}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="5" cy="5" r="4" stroke="#666E96" strokeWidth="0.5"/>
                <path d="M5 2.5V5L6.5 6.5" stroke="#666E96" strokeWidth="0.5" strokeLinecap="round"/>
              </svg>
              <div style={{
                color: '#666E96',
                fontFamily: 'Poppins',
                fontSize: '10px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '120%'
              }}>
                {getDisplayDate()}
              </div>
            </div>

            {/* Priority - Only show if priority is not 0 (None) */}
            {Priority !== undefined && Priority !== null && Priority !== 0 && Priority > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px'
              }}>
                {/* Priority flag icon using SVG */}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.6665 5.8335V8.75016" stroke={getPriorityColor(Priority)} strokeWidth="0.625" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.89884 1.59955C3.52165 0.887438 2.20692 1.41554 1.6665 1.84177V6.17725C2.07055 5.713 3.28267 4.99338 4.89884 5.82904C6.34317 6.57588 7.75167 6.16567 8.33317 5.843V1.67005C7.21217 2.17983 6.00705 2.17258 4.89884 1.59955Z" stroke={getPriorityColor(Priority)} strokeWidth="0.625" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div style={{
                  color: getPriorityColor(Priority),
                  fontFamily: 'Poppins',
                  fontSize: '10px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '120%'
                }}>
                  {getPriorityLabel(Priority)}
                </div>
              </div>
            )}

            {/* User */}
            {User_uniqueId && getUserName && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px'
              }}>
                {/* User icon using SVG */}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="5" cy="3" r="1.5" stroke="#666E96" strokeWidth="0.5"/>
                  <path d="M2 8.5C2 7 3.5 6 5 6C6.5 6 8 7 8 8.5" stroke="#666E96" strokeWidth="0.5" strokeLinecap="round"/>
                </svg>
                <div style={{
                  color: '#666E96',
                  fontFamily: 'Poppins',
                  fontSize: '10px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '120%'
                }}>
                  {getUserName(User_uniqueId)}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Toggle for tasks only */}
          {type === 'Task' && onToggle && (
            <div
              onClick={handleToggle}
              style={{
                display: 'flex',
                width: '40px',
                height: '20px',
                justifyContent: isCompleted ? 'flex-end' : 'flex-start',
                alignItems: 'center',
                flexShrink: 0,
                borderRadius: '30px',
                border: `1px solid ${isCompleted ? Colors.PISTACHIO_GREEN : '#AAAAAA'}`,
                backgroundColor: isCompleted ? Colors.PISTACHIO_GREEN : '#AAAAAA',
                padding: '2px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '15px',
                height: '15px',
                backgroundColor: Colors.WHITE,
                borderRadius: '50%'
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedItemCard;
