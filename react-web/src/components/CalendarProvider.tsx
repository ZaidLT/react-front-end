import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import moment from 'moment';

// Types for calendar context
interface DateData {
  year: number;
  month: number;
  day: number;
  timestamp: number;
  dateString: string;
}

interface CalendarContextType {
  date: string;
  selectedDay: string;
  currentMonth: string;
  onDateChanged: (date: string) => void;
  onMonthChange: (month: any) => void;
  onDayPress: (date: DateData) => void;
  setDate: (date: string) => void;
  setSelectedDay: (date: string) => void;
}

// Create calendar context
const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

// Hook to use calendar context
export const useCalendarContext = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return context;
};

interface CalendarProviderProps {
  children: ReactNode;
  date?: string;
  onDateChanged?: (date: string) => void;
  onMonthChange?: (month: any) => void;
  style?: React.CSSProperties;
}

/**
 * CalendarProvider - Context provider for calendar state management
 * 
 * This component provides calendar state and navigation functionality
 * to child components, similar to react-native-calendars CalendarProvider.
 * 
 * @param children - Child components that need access to calendar context
 * @param date - Initial date in YYYY-MM-DD format
 * @param onDateChanged - Callback when date changes
 * @param onMonthChange - Callback when month changes
 * @param style - Optional styling for the provider container
 */
const CalendarProvider: React.FC<CalendarProviderProps> = ({
  children,
  date: initialDate = moment().format('YYYY-MM-DD'),
  onDateChanged,
  onMonthChange,
  style,
}) => {
  const [date, setDate] = useState(initialDate);
  const [selectedDay, setSelectedDay] = useState(initialDate);
  const [currentMonth, setCurrentMonth] = useState(moment(initialDate).format('YYYY-MM'));

  // Handle date change
  const handleDateChanged = useCallback((newDate: string) => {
    setDate(newDate);
    setSelectedDay(newDate);
    
    // Update current month if date is in a different month
    const newMonth = moment(newDate).format('YYYY-MM');
    if (newMonth !== currentMonth) {
      setCurrentMonth(newMonth);
      if (onMonthChange) {
        onMonthChange({
          dateString: newDate,
          month: moment(newDate).month() + 1,
          year: moment(newDate).year(),
        });
      }
    }
    
    if (onDateChanged) {
      onDateChanged(newDate);
    }
  }, [currentMonth, onDateChanged, onMonthChange]);

  // Handle month change
  const handleMonthChange = useCallback((month: any) => {
    const monthString = typeof month === 'string' ? month : month.dateString;
    const newMonth = moment(monthString).format('YYYY-MM');
    
    if (newMonth !== currentMonth) {
      setCurrentMonth(newMonth);
      
      // Update date to first day of new month if current date is not in the new month
      if (!moment(date).isSame(monthString, 'month')) {
        const newDate = moment(monthString).startOf('month').format('YYYY-MM-DD');
        setDate(newDate);
        setSelectedDay(newDate);
      }
      
      if (onMonthChange) {
        onMonthChange(month);
      }
    }
  }, [currentMonth, date, onMonthChange]);

  // Handle day press
  const handleDayPress = useCallback((dateData: DateData) => {
    const newDate = dateData.dateString;
    handleDateChanged(newDate);
  }, [handleDateChanged]);

  // Context value
  const contextValue: CalendarContextType = {
    date,
    selectedDay,
    currentMonth,
    onDateChanged: handleDateChanged,
    onMonthChange: handleMonthChange,
    onDayPress: handleDayPress,
    setDate: (newDate: string) => {
      setDate(newDate);
      handleDateChanged(newDate);
    },
    setSelectedDay: (newDate: string) => {
      setSelectedDay(newDate);
      if (newDate !== date) {
        handleDateChanged(newDate);
      }
    },
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      <div style={style}>
        {children}
      </div>
    </CalendarContext.Provider>
  );
};

export default CalendarProvider;

// Utility function to create DateData object
export const createDateData = (dateString: string): DateData => {
  const momentDate = moment(dateString);
  return {
    year: momentDate.year(),
    month: momentDate.month() + 1, // moment months are 0-based
    day: momentDate.date(),
    timestamp: momentDate.valueOf(),
    dateString: dateString,
  };
};

// Utility function to format date for display
export const formatDateForDisplay = (dateString: string, format: string = 'MMMM Do, YYYY'): string => {
  return moment(dateString).format(format);
};

// Utility function to get week dates
export const getWeekDates = (dateString: string, firstDay: number = 0): DateData[] => {
  const startOfWeek = moment(dateString).startOf('week').add(firstDay, 'days');
  const weekDates: DateData[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.clone().add(i, 'days');
    weekDates.push(createDateData(date.format('YYYY-MM-DD')));
  }
  
  return weekDates;
};

// Utility function to get month dates for calendar grid
export const getMonthDates = (dateString: string): DateData[] => {
  const startOfMonth = moment(dateString).startOf('month');
  const endOfMonth = moment(dateString).endOf('month');
  const startOfCalendar = startOfMonth.clone().startOf('week');
  const endOfCalendar = endOfMonth.clone().endOf('week');
  
  const dates: DateData[] = [];
  const current = startOfCalendar.clone();
  
  while (current.isSameOrBefore(endOfCalendar)) {
    dates.push(createDateData(current.format('YYYY-MM-DD')));
    current.add(1, 'day');
  }
  
  return dates;
};

// Export types for use in other components
export type { DateData, CalendarContextType };
