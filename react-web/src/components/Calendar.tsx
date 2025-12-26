import React, { useState, useEffect } from 'react';
import { Colors, Typography } from '../styles';
import { useLanguageContext } from '../context/LanguageContext';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  markedDates?: { [date: string]: { marked: boolean; dotColor?: string } };
  style?: React.CSSProperties;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate = new Date(),
  onDateSelect,
  minDate,
  maxDate,
  markedDates = {},
  style,
}) => {
  const { i18n } = useLanguageContext();

  // Derive the display month from selectedDate prop, but allow manual navigation
  const selectedDateObj = selectedDate instanceof Date
    ? selectedDate
    : (() => {
        // Parse date string as local time to avoid timezone issues
        if (typeof selectedDate === 'string' && selectedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = selectedDate.split('-').map(Number);
          return new Date(year, month - 1, day); // month is 0-indexed
        }
        return new Date(selectedDate);
      })();
  const selectedMonth = new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1);

  // Use state for manual month navigation, but initialize with selected date's month
  const [currentMonth, setCurrentMonth] = useState(selectedMonth);
  const [isManuallyNavigated, setIsManuallyNavigated] = useState(false);

  // Reset currentMonth when selectedDate changes (for "jump to today" functionality)
  useEffect(() => {
    const date = selectedDate instanceof Date
      ? selectedDate
      : (() => {
          // Parse date string as local time to avoid timezone issues
          if (typeof selectedDate === 'string' && selectedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = selectedDate.split('-').map(Number);
            return new Date(year, month - 1, day); // month is 0-indexed
          }
          return new Date(selectedDate);
        })();

    // Ensure the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date passed to Calendar component:', selectedDate);
      return;
    }

    const newMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    // Always update to the selected date's month and reset manual navigation flag
    setCurrentMonth(newMonth);
    setIsManuallyNavigated(false);
  }, [selectedDate]);

  // Format date as YYYY-MM-DD for comparison
  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Check if a date is the selected date
  const isSelectedDate = (date: Date): boolean => {
    return formatDateKey(date) === formatDateKey(selectedDate);
  };

  // Check if a date is marked
  const isMarkedDate = (date: Date): boolean => {
    return markedDates[formatDateKey(date)]?.marked || false;
  };

  // Get dot color for marked date
  const getMarkedDotColor = (date: Date): string => {
    return markedDates[formatDateKey(date)]?.dotColor || Colors.PRIMARY_ELECTRIC_BLUE;
  };

  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if a date is within the allowed range
  const isDateInRange = (date: Date): boolean => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  // Handle month navigation
  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
    setIsManuallyNavigated(true);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
    setIsManuallyNavigated(true);
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (onDateSelect && isDateInRange(date)) {
      onDateSelect(date);
    }
  };

  // Generate calendar grid
  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} style={{ width: 'calc(100% / 7)', height: 40 }} />
      );
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = isSelectedDate(date);
      const isTodayDate = isToday(date);
      const isMarked = isMarkedDate(date);
      const isInRange = isDateInRange(date);
      
      days.push(
        <div 
          key={`day-${day}`} 
          onClick={() => isInRange && handleDateSelect(date)}
          style={{
            width: 'calc(100% / 7)',
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: isInRange ? 'pointer' : 'default',
            opacity: isInRange ? 1 : 0.4,
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            backgroundColor: isSelected ? '#F0F8FF' : 'transparent', // Light blue background for selected
            border: isSelected ? `2px solid ${Colors.PRIMARY_ELECTRIC_BLUE}` :
                   isTodayDate ? `1px solid ${Colors.PRIMARY_ELECTRIC_BLUE}` : 'none',
            textAlign: 'center',
            color: isSelected ? Colors.PRIMARY_ELECTRIC_BLUE : '#000E50',
            fontFamily: 'Poppins',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: isSelected ? '600' : 400,
            lineHeight: '120%', /* 21.6px */
          }}>
            {day}
          </div>
          {isMarked && (
            <div style={{
              position: 'absolute',
              bottom: 8,
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: getMarkedDotColor(date),
            }} />
          )}
        </div>
      );
    }
    
    return days;
  };

  // Format month and year for header
  const formatMonthYear = (date: Date): string => {
    const locale = i18n.locale === 'fr' ? 'fr-CA' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  };

  return (
    <div style={{
      backgroundColor: Colors.WHITE,
      borderRadius: 8,
      ...style
    }}>

      {/* Weekday Headers */}
      <div style={{ display: 'flex', marginBottom: 8 }}>
        {['SunAbbr', 'MonAbbr', 'TueAbbr', 'WedAbbr', 'ThuAbbr', 'FriAbbr', 'SatAbbr'].map(dayKey => (
          <div
            key={dayKey}
            style={{
              width: 'calc(100% / 7)',
              textAlign: 'center',
              color: '#666E96',
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '120%', /* 14.4px */
              padding: '4px 0',
            }}
          >
            {i18n.t(dayKey)}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default Calendar;
