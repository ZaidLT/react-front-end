import React, { useMemo, useRef, useEffect } from 'react';
import moment from 'moment';
import { Colors, Typography } from '../styles';
import { ICalendarItem } from '../util/types';
import TimelineItem from './TimelineItem';
import CustomText from './CustomText';
import TimeEmptyState from './TimeEmptyState';
import { useLanguageContext } from '../context/LanguageContext';
import { useRouter } from '../hooks/useRouterWithPersistentParams';

interface TimelineProps {
  format24h?: boolean;
  overlapEventsSpacing?: number;
  rightEdgeSpacing?: number;
  theme?: any;
  showNowIndicator?: boolean;
  onEventPress?: (event: any) => void;
}

interface TimelineListProps {
  timelineProps?: TimelineProps;
  events: Record<string, ICalendarItem[]>;
  showNowIndicator?: boolean;
  scrollToFirst?: boolean;
  renderItem?: (item: ICalendarItem, containerColor: string) => React.ReactElement;
  selectedDay?: string;
  style?: React.CSSProperties;
  onToggle?: (item: ICalendarItem, isCompleted: boolean) => void;
}

/**
 * TimelineList - A component for displaying events in a timeline format
 * 
 * This component displays events in a vertical timeline with time slots.
 * It shows events for the selected day with proper time positioning.
 * 
 * @param timelineProps - Configuration for timeline display
 * @param events - Object containing events grouped by day
 * @param showNowIndicator - Whether to show current time indicator
 * @param scrollToFirst - Whether to scroll to first event
 * @param renderItem - Custom renderer for timeline items
 * @param selectedDay - The selected day to display events for
 * @param style - Additional styling
 */
const TimelineList: React.FC<TimelineListProps> = ({
  timelineProps = {},
  events,
  showNowIndicator = true,
  scrollToFirst = false,
  renderItem,
  selectedDay,
  style,
  onToggle,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const currentDay = selectedDay || moment().format('YYYY-MM-DD');

  // Generate time slots (24 hours)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        hour,
        time: moment().hour(hour).minute(0).format(timelineProps.format24h ? 'HH:mm' : 'h A'),
        fullTime: moment().hour(hour).minute(0),
      });
    }
    return slots;
  }, [timelineProps.format24h]);

  // Get current time for now indicator
  const currentTime = moment();
  const currentHour = currentTime.hour();
  const currentMinute = currentTime.minute();
  const nowPosition = (currentHour * 60 + currentMinute) / (24 * 60) * 100;

  // Sort events by start time
  const sortedEvents = useMemo(() => {
    const dayEvents = events[currentDay] || [];
    return [...dayEvents].sort((a, b) => {
      return moment(a.start).diff(moment(b.start));
    });
  }, [events, currentDay]);

  // Calculate event positions and heights
  const eventPositions = useMemo(() => {
    return sortedEvents.map((event) => {
      const startTime = moment(event.start);
      const endTime = moment(event.end);
      
      // Calculate position as percentage of day
      const startMinutes = startTime.hour() * 60 + startTime.minute();
      const endMinutes = endTime.hour() * 60 + endTime.minute();
      const duration = endMinutes - startMinutes;
      
      const top = (startMinutes / (24 * 60)) * 100;
      const height = Math.max((duration / (24 * 60)) * 100, 2); // Minimum 2% height
      
      return {
        event,
        top,
        height,
        startTime: startTime.format(timelineProps.format24h ? 'HH:mm' : 'h:mm A'),
        endTime: endTime.format(timelineProps.format24h ? 'HH:mm' : 'h:mm A'),
      };
    });
  }, [sortedEvents, timelineProps.format24h]);

  // Scroll to first event or current time
  useEffect(() => {
    if (scrollToFirst && timelineRef.current) {
      if (sortedEvents.length > 0) {
        // Scroll to first event
        const firstEventTime = moment(sortedEvents[0].start);
        const scrollPosition = (firstEventTime.hour() * 60 + firstEventTime.minute()) / (24 * 60) * timelineRef.current.scrollHeight;
        timelineRef.current.scrollTop = Math.max(0, scrollPosition - 100);
      } else if (showNowIndicator) {
        // Scroll to current time
        const scrollPosition = (currentHour * 60 + currentMinute) / (24 * 60) * timelineRef.current.scrollHeight;
        timelineRef.current.scrollTop = Math.max(0, scrollPosition - 100);
      }
    }
  }, [scrollToFirst, sortedEvents, showNowIndicator, currentHour, currentMinute]);

  // Render timeline item
  const renderTimelineItem = (eventPosition: any) => {
    const { event } = eventPosition;
    
    if (renderItem) {
      return renderItem(event, event.color || Colors.PRIMARY_ELECTRIC_BLUE);
    }
    
    return (
      <TimelineItem
        item={event}
        containerColor={event.color || Colors.PRIMARY_ELECTRIC_BLUE}
        hideTime={false}
        onToggle={onToggle ? (isCompleted) => onToggle(event, isCompleted) : undefined}
      />
    );
  };

  return (
    <div style={{ ...styles.container, ...style }}>
      <div style={styles.timelineContainer} ref={timelineRef}>
        {/* Time slots */}
        <div style={styles.timeSlotsContainer}>
          {timeSlots.map((slot) => (
            <div key={slot.hour} style={styles.timeSlot}>
              <CustomText style={styles.timeText}>
                {slot.time}
              </CustomText>
              <div style={styles.timeLine} />
            </div>
          ))}
        </div>

        {/* Events container */}
        <div style={styles.eventsContainer}>
          {/* Now indicator */}
          {showNowIndicator && moment(currentDay).isSame(moment(), 'day') && (
            <div 
              style={{
                ...styles.nowIndicator,
                top: `${nowPosition}%`,
              }}
            >
              <div style={styles.nowDot} />
              <div style={styles.nowLine} />
            </div>
          )}

          {/* Events */}
          {eventPositions.map((eventPosition, index) => (
            <div
              key={`${eventPosition.event.id}-${index}`}
              style={{
                ...styles.eventContainer,
                top: `${eventPosition.top}%`,
                height: `${eventPosition.height}%`,
              }}
            >
              {renderTimelineItem(eventPosition)}
            </div>
          ))}

          {/* Empty state */}
          {sortedEvents.length === 0 && <TimeEmptyState />}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    marginTop: '16px', // 16px from weekly header
  } as React.CSSProperties,

  timelineContainer: {
    position: 'relative',
    height: 'calc(100vh - 200px)', // Extend to bottom of viewport, accounting for header and tab bar
    overflowY: 'auto',
    overflowX: 'hidden', // Hide horizontal overflow from extended lines
    display: 'flex',
    flexDirection: 'row',
  } as React.CSSProperties,

  timeSlotsContainer: {
    width: '80px',
    backgroundColor: Colors.WHITE,
    borderRight: `1px solid ${Colors.LIGHT_GREY}`,
  } as React.CSSProperties,

  timeSlot: {
    height: '60px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingRight: '10px',
    position: 'relative',
  } as React.CSSProperties,

  timeText: {
    color: '#666E96',
    textAlign: 'center',
    fontFamily: 'Poppins',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '120%', /* 14.4px */
    marginTop: '5px',
  } as React.CSSProperties,

  timeLine: {
    position: 'absolute',
    top: '0px', // Align with the top of the time slot
    left: '0px', // Start from the beginning of the time slot
    right: '-1000px', // Extend far to the right to cover the events area
    height: '1px',
    backgroundColor: '#E8E8E8', // Lighter gray color
    zIndex: 0,
  } as React.CSSProperties,

  eventsContainer: {
    flex: 1,
    position: 'relative',
    height: `${24 * 60}px`, // 24 hours * 60px per hour
    overflow: 'hidden', // Prevent lines from extending beyond container
  } as React.CSSProperties,

  eventContainer: {
    position: 'absolute',
    left: '10px',
    right: '10px',
    zIndex: 2, // Ensure events appear above the hour lines
  } as React.CSSProperties,

  nowIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 3, // Ensure now indicator appears above everything
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,

  nowDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: Colors.PRIMARY_ELECTRIC_BLUE,
    marginLeft: '5px',
  } as React.CSSProperties,

  nowLine: {
    flex: 1,
    height: '2px',
    backgroundColor: Colors.PRIMARY_ELECTRIC_BLUE,
    marginLeft: '5px',
  } as React.CSSProperties,

  emptyState: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  } as React.CSSProperties,

  emptyText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
  } as React.CSSProperties,
};

export default TimelineList;

// Export types for use in other components
export type { TimelineListProps, TimelineProps };
