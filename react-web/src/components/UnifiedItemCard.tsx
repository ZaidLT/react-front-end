import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import { useLanguageContext } from '../context/LanguageContext';
import {
  getContainerForType,
  UnifiedItemCardProps,
  UnifiedItemCardRenderProps,
} from '../registry/AppRegistry';

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

  useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

  const getPriorityColor = (priority?: number | null): string => {
    switch (priority) {
      case 0:
        return 'var(--text-secondary)';
      case 1:
        return 'var(--color-success)';
      case 2:
        return 'var(--color-warning)';
      case 3:
        return 'var(--color-error)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getPriorityLabel = (priority?: number | null): string => {
    switch (priority) {
      case 0:
        return 'None';
      case 1:
        return 'Low';
      case 2:
        return 'Medium';
      case 3:
        return 'High';
      default:
        return '';
    }
  };

  const formatBulletPointList = (text: string): string => {
    if (!text) return text;

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        const checklistItems = parsed.filter(
          (item) => item && (typeof item === 'string' || (typeof item === 'object' && item.text))
        );

        if (checklistItems.length >= 2) {
          const displayItems = checklistItems.slice(0, 2);
          const formattedItems = displayItems.map((item) => {
            const itemText = typeof item === 'string' ? item : item.text || item.title || '';
            return `• ${itemText.trim()}`;
          });

          if (checklistItems.length > 2) {
            return `${formattedItems.join('\n')}\n...`;
          }

          return formattedItems.join('\n');
        }
      } else if (parsed && typeof parsed === 'object' && parsed.items) {
        return formatBulletPointList(JSON.stringify(parsed.items));
      }
    } catch (error) {
      // Not JSON, continue with original text
    }

    return text;
  };

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    if (onToggle) {
      onToggle(newCompleted);
    }
  };

  const getDisplayDate = (): string => {
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
        type,
      });
    }

    const dateToUse = Deadline_DateTime || CreationTimestamp;
    if (!dateToUse) return '';

    const date = moment(dateToUse);
    const now = moment();

    if (date.isSame(now, 'day')) {
      return i18n.t('Today');
    }
    if (date.isSame(now.clone().add(1, 'day'), 'day')) {
      return i18n.t('Tomorrow');
    }
    if (date.isSame(now.clone().subtract(1, 'day'), 'day')) {
      return i18n.t('Yesterday');
    }
    return date.format('MMM D');
  };

  const isPlaceholderText = !Text;

  const displayText = useMemo(() => {
    const fallbackText =
      type === 'Task'
        ? i18n.t('NoTaskDescription')
        : type === 'Event'
          ? i18n.t('NoEventDescription')
          : type === 'Note'
            ? i18n.t('NoNoteDescription')
            : i18n.t('NoDocumentDescription');
    const text = Text || fallbackText;

    if (type === 'Note' && Text) {
      const formattedText = formatBulletPointList(Text);
      if (formattedText !== Text) {
        return formattedText;
      }
    }

    if (text.length > 100) {
      return `${text.substring(0, 100)}...`;
    }

    return text;
  }, [Text, i18n, type]);

  const renderProps: UnifiedItemCardRenderProps = {
    UniqueId,
    Title,
    displayText,
    displayDate: getDisplayDate(),
    type,
    User_uniqueId,
    color,
    onPress,
    onToggleClick: onToggle ? handleToggle : undefined,
    getUserName,
    isCompleted,
    showPriority: Boolean(Priority && Priority > 0),
    priorityLabel: getPriorityLabel(Priority),
    priorityColor: getPriorityColor(Priority),
    showToggle: type === 'Task' && Boolean(onToggle),
    showUser: Boolean(User_uniqueId && getUserName),
    isPlaceholderText,
  };

  const Container = getContainerForType(type);

  return <Container {...renderProps} />;
};

export default UnifiedItemCard;
