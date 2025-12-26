'use client';

import React from 'react';
import SkeletonLoader from '../../components/SkeletonLoader';
import { Colors } from '../../styles';

interface TimePageSkeletonProps {
  selectedView: 'calendar' | 'time';
}

/**
 * TimePageSkeleton - Loading skeleton for the Time page
 *
 * Displays appropriate skeleton based on selected view:
 * - Calendar view: Monthly calendar + event list
 * - Timeline view: Week calendar + all-day events + hourly timeline
 */
const TimePageSkeleton: React.FC<TimePageSkeletonProps> = ({ selectedView }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        padding: '0 24px 10px',
        boxSizing: 'border-box',
        flex: 1,
      }}>
        {/* Calendar Top View Skeleton - Same for both views */}
        <CalendarTopViewSkeleton />

        {/* Timeline View Skeleton */}
        {selectedView === 'time' && <TimelineViewSkeleton />}

        {/* Calendar View Skeleton */}
        {selectedView === 'calendar' && <CalendarViewSkeleton />}
      </div>
    </div>
  );
};

/**
 * CalendarTopViewSkeleton - Header with date and view toggle
 */
const CalendarTopViewSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 0',
      marginBottom: '16px',
    }}>
      {/* Left side - Current date */}
      <div style={{ flex: 1 }}>
        <SkeletonLoader
          width="140px"
          height="24px"
          style={{ marginBottom: '4px' }}
        />
        <SkeletonLoader
          width="100px"
          height="16px"
        />
      </div>

      {/* Right side - View toggle and refresh */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <SkeletonLoader
          width="80px"
          height="36px"
          borderRadius="8px"
        />
        <SkeletonLoader
          width="36px"
          height="36px"
          borderRadius="8px"
        />
      </div>
    </div>
  );
};

/**
 * TimelineViewSkeleton - Weekly timeline with all-day events
 */
const TimelineViewSkeleton: React.FC = () => {
  return (
    <>
      {/* Week Calendar Skeleton */}
      <WeekCalendarSkeleton />

      {/* All-Day Events Skeleton */}
      <AllDayEventsViewSkeleton />

      {/* Timeline List Skeleton */}
      <TimelineListSkeleton />
    </>
  );
};

/**
 * WeekCalendarSkeleton - Week view with 7 days
 */
const WeekCalendarSkeleton: React.FC = () => {
  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      {/* Week header with 7 days */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px',
      }}>
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <div key={day} style={{ flex: 1, textAlign: 'center' }}>
            {/* Day name */}
            <SkeletonLoader
              width="100%"
              height="12px"
              style={{ marginBottom: '8px' }}
            />
            {/* Day number */}
            <SkeletonLoader
              width="40px"
              height="40px"
              borderRadius="50%"
              style={{ margin: '0 auto' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * AllDayEventsViewSkeleton - Horizontal scroll of all-day events
 */
const AllDayEventsViewSkeleton: React.FC = () => {
  return (
    <div style={{
      marginBottom: '16px',
      overflow: 'hidden',
    }}>
      {/* Section label */}
      <SkeletonLoader
        width="80px"
        height="14px"
        style={{ marginBottom: '12px', marginLeft: '4px' }}
      />

      {/* Horizontal event cards */}
      <div style={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            style={{
              minWidth: '280px',
              flexShrink: 0,
            }}
          >
            <SkeletonLoader
              width="100%"
              height="80px"
              borderRadius="12px"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * TimelineListSkeleton - Hourly timeline with events
 */
const TimelineListSkeleton: React.FC = () => {
  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px',
    }}>
      {/* Timeline hours with events */}
      {[8, 9, 10, 12, 14, 15, 16, 17].map((hour) => (
        <div
          key={hour}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '20px',
            minHeight: '60px',
            position: 'relative',
          }}
        >
          {/* Hour label */}
          <div style={{ width: '60px', flexShrink: 0 }}>
            <SkeletonLoader
              width="50px"
              height="14px"
            />
          </div>

          {/* Event block (show for some hours) */}
          {[8, 10, 14, 16].includes(hour) && (
            <div style={{ flex: 1, paddingLeft: '12px' }}>
              <SkeletonLoader
                width="90%"
                height={hour === 10 ? '90px' : '60px'}
                borderRadius="8px"
              />
            </div>
          )}

          {/* Hour line */}
          <div style={{
            position: 'absolute',
            left: '60px',
            right: 0,
            top: '7px',
            height: '1px',
            backgroundColor: Colors.LIGHT_GREY || '#f0f0f0',
            zIndex: 0,
          }} />
        </div>
      ))}
    </div>
  );
};

/**
 * CalendarViewSkeleton - Monthly calendar + events list
 */
const CalendarViewSkeleton: React.FC = () => {
  return (
    <>
      {/* Monthly Calendar Skeleton */}
      <MonthlyCalendarSkeleton />

      {/* Events List Skeleton */}
      <EventsListSkeleton />
    </>
  );
};

/**
 * MonthlyCalendarSkeleton - Calendar grid
 */
const MonthlyCalendarSkeleton: React.FC = () => {
  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      {/* Week day headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        marginBottom: '12px',
      }}>
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <div key={day} style={{ textAlign: 'center' }}>
            <SkeletonLoader
              width="100%"
              height="12px"
            />
          </div>
        ))}
      </div>

      {/* Calendar grid - 5 weeks */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
      }}>
        {Array.from({ length: 35 }, (_, index) => (
          <SkeletonLoader
            key={index}
            width="100%"
            height="40px"
            borderRadius="8px"
          />
        ))}
      </div>
    </div>
  );
};

/**
 * EventsListSkeleton - List of event cards
 */
const EventsListSkeleton: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      paddingTop: '10px',
    }}>
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          style={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            minHeight: '90px',
            padding: '12px 12px 12px 28px',
            alignItems: 'flex-start',
            borderRadius: '6px',
            border: '1px solid #E6E7EE',
            background: '#FFF',
            boxShadow: '0 2px 4px 0 rgba(0, 14, 80, 0.10)',
            boxSizing: 'border-box',
          }}
        >
          {/* Color indicator line */}
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '12px',
              width: '4px',
              height: 'calc(100% - 24px)',
              borderRadius: '6px',
            }}
          >
            <SkeletonLoader
              width="4px"
              height="100%"
              borderRadius="6px"
            />
          </div>

          {/* Content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flex: 1,
          }}>
            {/* Title */}
            <SkeletonLoader
              width="75%"
              height="16px"
            />

            {/* Description */}
            <SkeletonLoader
              width="60%"
              height="14px"
            />

            {/* Footer - time and metadata */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <SkeletonLoader width="80px" height="12px" />
                <SkeletonLoader width="60px" height="12px" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimePageSkeleton;
