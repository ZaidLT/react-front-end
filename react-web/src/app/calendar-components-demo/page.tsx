'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Colors, Typography } from '../../styles';
import moment from 'moment';

// Use dynamic import with SSR disabled for components that use router
const AllDayEventComponent = dynamic(() => import('../../components/AllDayEventComponent'), { ssr: false });
const AllDayEventsView = dynamic(() => import('../../components/AllDayEventsView'), { ssr: false });
const SimpleCalendarColorSelectionModal = dynamic(() => import('../../components/SimpleCalendarColorSelectionModal'), { ssr: false });
const CalendarDayComponent = dynamic(() => import('../../components/CalendarDayComponent'), { ssr: false });
const CalendarTopView = dynamic(() => import('../../components/CalendarTopView'), { ssr: false });
const SimpleDateTimeSelectionView = dynamic(() => import('../../components/SimpleDateTimeSelectionView'), { ssr: false });
const SimpleTimelineItem = dynamic(() => import('../../components/SimpleTimelineItem'), { ssr: false });

const CalendarComponentsDemo: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'));
  const [showColorModal, setShowColorModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#4285F4');

  // Sample events for the demo - using inline data in components below

  // Sample timeline events
  const timelineEvents = [
    {
      id: '1',
      title: 'Morning Standup',
      startTime: '09:00',
      endTime: '09:30',
      color: '#4285F4',
    },
    {
      id: '2',
      title: 'Lunch Break',
      startTime: '12:00',
      endTime: '13:00',
      color: '#34A853',
    },
    {
      id: '3',
      title: 'Project Review',
      startTime: '15:00',
      endTime: '16:30',
      color: '#FBBC05',
    },
  ];

  // Styles for the demo page
  const styles = {
    section: {
      marginBottom: '40px',
    },
    componentContainer: {
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#f9f9f9',
    },
    timelineContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
    },
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/home" style={{
          textDecoration: 'none',
          color: Colors.BLUE,
          fontSize: Typography.FONT_SIZE_16,
          fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
        }}>
          ← Back to Home
        </Link>
      </div>

      <h1 style={{
        fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
        fontSize: Typography.FONT_SIZE_24,
        color: Colors.MIDNIGHT,
        marginBottom: '20px'
      }}>
        Calendar Components Demo
      </h1>
      <p>This page demonstrates calendar components converted from React Native to React Web.</p>

      <section style={styles.section}>
        <h2>CalendarTopView</h2>
        <div style={styles.componentContainer}>
          <CalendarTopView
            currentDate={currentDate}
            onChangeView={() => alert('Change view clicked')}
            onDateChange={(newDate) => setCurrentDate(newDate)}
          />
        </div>
      </section>

      <section style={styles.section}>
        <h2>CalendarDayComponent</h2>
        <div style={styles.componentContainer}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CalendarDayComponent
              date={{
                year: new Date().getFullYear(),
                month: new Date().getMonth(),
                day: new Date().getDate(),
                timestamp: new Date().getTime(),
                dateString: new Date().toISOString().split('T')[0]
              }}
              onDayPress={() => alert('Day pressed')}
            />
            <CalendarDayComponent
              date={{
                year: new Date(Date.now() + 86400000).getFullYear(),
                month: new Date(Date.now() + 86400000).getMonth(),
                day: new Date(Date.now() + 86400000).getDate(),
                timestamp: new Date(Date.now() + 86400000).getTime(),
                dateString: new Date(Date.now() + 86400000).toISOString().split('T')[0]
              }}
              onDayPress={() => alert('Day pressed')}
            />
            <CalendarDayComponent
              date={{
                year: new Date(Date.now() + 86400000 * 2).getFullYear(),
                month: new Date(Date.now() + 86400000 * 2).getMonth(),
                day: new Date(Date.now() + 86400000 * 2).getDate(),
                timestamp: new Date(Date.now() + 86400000 * 2).getTime(),
                dateString: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
              }}
              marking={{ dots: [{ color: Colors.BLUE }] }}
              onDayPress={() => alert('Day pressed')}
            />
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2>AllDayEventComponent</h2>
        <div style={styles.componentContainer}>
          <AllDayEventComponent
            item={{
              id: '1',
              title: 'Team Meeting',
              summary: 'Team Meeting',
              color: '#4285F4',
              start: '09:00',
              end: '10:00',
              type: 'event',
              deadlineDateTime: new Date().toISOString(),
              Priority: 1,
              Active: true,
              UniqueId: '1'
            }}
          />
        </div>
      </section>

      <section style={styles.section}>
        <h2>AllDayEventsView</h2>
        <div style={styles.componentContainer}>
          <AllDayEventsView
            events={{
              [moment().format('YYYY-MM-DD')]: [
                {
                  id: '1',
                  title: 'Team Meeting',
                  summary: 'Team Meeting',
                  colorMark: '#4285F4',
                  start: moment().startOf('day').format(),
                  end: moment().endOf('day').format(),
                  type: 'event',
                  deadlineDateTime: new Date().toISOString(),
                  Priority: 1,
                  Active: true,
                  UniqueId: '1'
                },
                {
                  id: '2',
                  title: 'Conference',
                  summary: 'Conference',
                  colorMark: '#EA4335',
                  start: moment().startOf('day').format(),
                  end: moment().endOf('day').format(),
                  type: 'event',
                  deadlineDateTime: new Date().toISOString(),
                  Priority: 1,
                  Active: true,
                  UniqueId: '2'
                }
              ]
            }}
            selectedDay={moment().format('YYYY-MM-DD')}
          />
        </div>
      </section>

      <section style={styles.section}>
        <h2>TimelineItem</h2>
        <div style={styles.componentContainer}>
          <div style={styles.timelineContainer}>
            {timelineEvents.map((event) => (
              <SimpleTimelineItem
                key={event.id}
                title={event.title}
                startTime={event.startTime}
                endTime={event.endTime}
                color={event.color}
                onPress={() => alert(`Timeline event pressed: ${event.title}`)}
              />
            ))}
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2>DateTimeSelectionView</h2>
        <div style={styles.componentContainer}>
          <SimpleDateTimeSelectionView
            startDate={moment().toDate()}
            endDate={moment().add(1, 'hour').toDate()}
            onStartDateChange={(date) => console.log('Start date changed:', date)}
            onEndDateChange={(date) => console.log('End date changed:', date)}
            onStartTimeChange={(time) => console.log('Start time changed:', time)}
            onEndTimeChange={(time) => console.log('End time changed:', time)}
          />
        </div>
      </section>

      <section style={styles.section}>
        <h2>CalendarColorSelectionModal</h2>
        <div style={styles.componentContainer}>
          <button
            onClick={() => setShowColorModal(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: Colors.BLUE,
              color: Colors.WHITE,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Open Color Selection Modal
          </button>
          <div style={{ marginTop: '10px' }}>
            Selected Color: <span style={{ color: selectedColor }}>{selectedColor}</span>
          </div>
          {showColorModal && (
            <SimpleCalendarColorSelectionModal
              isVisible={showColorModal}
              onRequestClose={() => setShowColorModal(false)}
              onColorSelect={(color) => {
                setSelectedColor(color);
                setShowColorModal(false);
              }}
              selectedColor={selectedColor}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default CalendarComponentsDemo;
