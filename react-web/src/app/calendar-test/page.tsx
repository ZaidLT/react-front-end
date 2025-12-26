'use client';

import React, { useState, useMemo } from 'react';
import Calendar from '../../components/Calendar';
import CalendarTopView from '../../components/CalendarTopView';
import moment from 'moment';
import { Colors, Typography } from '../../styles';

const CalendarTestPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedView, setSelectedView] = useState('calendar');

  const handleDateChange = (newDate: string) => {
    console.log('=== DATE CHANGE ===');
    console.log('Previous date was:', currentDate);
    console.log('New date is:', newDate);
    console.log('Today is:', moment().format("YYYY-MM-DD"));
    setCurrentDate(newDate);
  };

  const handleDateSelect = (date: Date) => {
    const dateString = moment(date).format('YYYY-MM-DD');
    console.log('Date selected:', dateString);
    setCurrentDate(dateString);
  };

  const toggleView = () => {
    setSelectedView(selectedView === 'calendar' ? 'time' : 'calendar');
  };

  // Memoize the Date object to ensure it only changes when currentDate string changes
  const selectedDateObject = useMemo(() => {
    // Parse the date string as local time to avoid timezone issues
    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    console.log('[TEST_PAGE] Creating new Date object for:', currentDate, '-> Date:', date);
    console.log('[TEST_PAGE] Date components - year:', year, 'month:', month - 1, 'day:', day);
    return date;
  }, [currentDate]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f8ff',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: Colors.WHITE,
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
          fontSize: Typography.FONT_SIZE_24,
          color: Colors.MIDNIGHT,
          marginBottom: '20px'
        }}>
          Calendar Test Page
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <p><strong>Current Date:</strong> {currentDate}</p>
          <p><strong>Today's Date:</strong> {moment().format("YYYY-MM-DD")}</p>
          <p><strong>Expected Month:</strong> {moment().format("MMMM YYYY")}</p>
          <p><strong>Calendar Month:</strong> {moment(currentDate).format("MMMM YYYY")}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <CalendarTopView
            currentDate={currentDate}
            onChangeView={toggleView}
            onDateChange={handleDateChange}
            selectedView={selectedView}
          />
        </div>

        <div>
          <Calendar
            key={currentDate} // Force re-render when date changes
            selectedDate={selectedDateObject}
            onDateSelect={handleDateSelect}
            markedDates={{
              [currentDate]: {
                marked: true,
                dotColor: Colors.PRIMARY_ELECTRIC_BLUE
              }
            }}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => handleDateChange(moment().format("YYYY-MM-DD"))}
            style={{
              backgroundColor: Colors.PRIMARY_ELECTRIC_BLUE,
              color: Colors.WHITE,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Jump to Today (Manual)
          </button>
          
          <button 
            onClick={() => handleDateChange('2025-07-15')}
            style={{
              backgroundColor: Colors.GREY_COLOR,
              color: Colors.WHITE,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              cursor: 'pointer'
            }}
          >
            Go to July 2025
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarTestPage;
