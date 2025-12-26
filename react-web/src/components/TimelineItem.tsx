import React, { useState, useEffect, useMemo } from "react";
import { Colors } from "../styles";
import { ICalendarItem } from "../util/types";
import { useRouter } from "next/navigation";
import moment from "moment";
import CustomText from "./CustomText";
import TimelineTaskToggle from "./TimelineTaskToggle";
import { useLanguageContext } from "../context/LanguageContext";

interface TimelineItemProps {
  item: ICalendarItem;
  containerColor: string;
  hideTime?: boolean;
  onToggle?: (isCompleted: boolean) => void;
}

/**
 * TimelineItem - A component for displaying an event or task in a timeline
 * 
 * This component displays an event or task with its title and time range.
 * When clicked, it navigates to the event or task detail page.
 * 
 * @param item - The calendar item to display
 * @param containerColor - The background color for the container
 * @param hideTime - Whether to hide the time display
 */
const TimelineItem: React.FC<TimelineItemProps> = ({
  item,
  containerColor,
  onToggle
}) => {
  const router = useRouter();
  const { i18n } = useLanguageContext();

  // For tasks, manage completion state
  const [isCompleted, setIsCompleted] = useState(
    item.type === "task" ? (
      (item.Active === false) ||
      ((item as any).completed === true)
    ) : false
  );

  // Update completion status when item changes
  useEffect(() => {
    if (item.type === "task") {
      setIsCompleted(
        (item.Active === false) ||
        ((item as any).completed === true)
      );
    }
  }, [item]);

  // Check if this is a short duration item (less than 30 minutes)
  const isShortDuration = useMemo(() => {
    if (!item.start || !item.end) return false;
    const startTime = moment(item.start);
    const endTime = moment(item.end);
    const durationMinutes = endTime.diff(startTime, 'minutes');
    return durationMinutes < 30;
  }, [item.start, item.end]);

  const handlePress = () => {
    if (item.type === "event") {
      const eventId = item.UniqueId || item.id;
      if (eventId) {
        // Get current pathname to determine return route
        const currentPath = window.location.pathname;
        const returnTo = currentPath.startsWith('/time') ? '/time' : '/life';

        // Preserve mobile app parameters and add returnTo
        let url = `/edit-event/${eventId}?returnTo=${returnTo}`;
        if (typeof window !== 'undefined') {
          const currentParams = new URLSearchParams(window.location.search);
          const mobile = currentParams.get('mobile');
          const token = currentParams.get('token');

          if (mobile || token) {
            const urlObj = new URL(url, window.location.origin);
            if (mobile) urlObj.searchParams.set('mobile', mobile);
            if (token) urlObj.searchParams.set('token', token);
            url = urlObj.pathname + urlObj.search;
          }
        }

        router.push(url);
      } else {
        console.warn('Event missing UniqueId/id:', item);
      }
    } else if (item.type === "task") {
      // Navigate to the existing edit-task page using the task ID
      const taskId = item.UniqueId || item.id;
      if (taskId) {
        // Get current pathname to determine return route
        const currentPath = window.location.pathname;
        const returnTo = currentPath.startsWith('/time') ? '/time' : '/life';

        // Preserve mobile app parameters
        let url = `/edit-task/${taskId}?returnTo=${returnTo}`;
        if (typeof window !== 'undefined') {
          const currentParams = new URLSearchParams(window.location.search);
          const mobile = currentParams.get('mobile');
          const token = currentParams.get('token');

          if (mobile || token) {
            const urlObj = new URL(url, window.location.origin);
            if (mobile) urlObj.searchParams.set('mobile', mobile);
            if (token) urlObj.searchParams.set('token', token);
            url = urlObj.pathname + urlObj.search;
          }
        }

        router.push(url);
      } else {
        console.warn('Task missing UniqueId/id:', item);
      }
    }
  };

  return (
    <div
      onClick={handlePress}
      style={styles.container}
    >
      {/* Main content container */}
      <div style={styles.contentContainer}>
        {/* Color indicator */}
        <div style={{
          ...styles.colorIndicator,
          backgroundColor: containerColor || '#8980B3',
        }} />

        {/* Text content */}
        <div style={styles.textContainer}>
          {/* Title */}
          <CustomText
            style={{
              ...styles.titleText,
              // Add strikethrough for completed tasks
              ...(item.type === "task" && isCompleted && {
                textDecoration: "line-through",
                opacity: 0.6,
              }),
            }}
            numberOfLines={1}
          >
            {item.title || item.summary || ""}
          </CustomText>

          {/* Description - only show for longer duration items */}
          {!isShortDuration && (
            <CustomText
              style={styles.descriptionText}
              numberOfLines={1}
            >
              {(item as any).description || (item as any).Text || (item as any).summary || i18n.t('NoEventDescription')}
            </CustomText>
          )}
        </div>
      </div>

      {/* Task toggle for tasks */}
      {item.type === "task" && (
        <div onClick={(e) => e.stopPropagation()}>
          <TimelineTaskToggle
            isCompleted={isCompleted}
            setIsCompleted={setIsCompleted}
            task={item}
            onToggle={onToggle}
            options={{
              text: {
                activeText: "Done",
                inactiveText: "To Do"
              },
              color: {
                activeColor: Colors.PISTACHIO_GREEN,
                inactiveColor: "#AAAAAA"
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    padding: '8px 12px 8px 8px',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderRadius: '6px',
    border: '1px solid #E6E7EE',
    background: '#FFF',
    boxShadow: '0 2px 4px 0 rgba(0, 14, 80, 0.10)',
    cursor: 'pointer',
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    flex: '1 0 0',
    alignSelf: 'stretch',
  },
  colorIndicator: {
    width: '4px',
    alignSelf: 'stretch',
    background: '#8980B3',
  },
  textContainer: {
    display: 'flex',
    padding: '2px 0',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    flex: 1,
  },
  titleText: {
    color: '#000E50',
    fontFamily: 'Poppins',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '120%', /* 19.2px */
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  descriptionText: {
    color: '#666E96',
    fontFamily: 'Poppins',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '120%', /* 16.8px */
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

export default TimelineItem;
