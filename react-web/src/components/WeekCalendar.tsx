import React, { useMemo } from 'react';
import moment from 'moment';
import { Colors, Typography } from '../styles';
import { useCalendarContext, DateData, getWeekDates } from './CalendarProvider';
import CalendarDayComponent from './CalendarDayComponent';
import CustomText from './CustomText';
import { useLanguageContext } from '../context/LanguageContext';

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dots?: Array<{
      color: string;
    }>;
    customStyles?: {
      container?: React.CSSProperties;
      text?: React.CSSProperties;
    };
  };
}

interface WeekCalendarProps {
  date?: string;
  firstDay?: number; // 0 = Sunday, 1 = Monday
  markingType?: 'simple' | 'multi-dot' | 'custom';
  markedDates?: MarkedDates;
  onDayPress?: (date: DateData) => void;
  theme?: any;
  allowShadow?: boolean;
  dayComponent?: (props: {
    date?: DateData;
    state?: string;
    marking?: any;
  }) => React.ReactElement;
  calendarWidth?: number;
  style?: React.CSSProperties;
}

/**
 * WeekCalendar - A weekly calendar view component
 * 
 * This component displays a week view of the calendar with day components.
 * It supports marking dates, custom day components, and various themes.
 * 
 * @param date - Current date to display week for
 * @param firstDay - First day of week (0 = Sunday, 1 = Monday)
 * @param markingType - Type of marking to display on dates
 * @param markedDates - Object containing marked dates with styling
 * @param onDayPress - Callback when a day is pressed
 * @param theme - Theme object for styling
 * @param allowShadow - Whether to show shadow
 * @param dayComponent - Custom day component renderer
 * @param calendarWidth - Width of the calendar
 * @param style - Additional styling
 */
const WeekCalendar: React.FC<WeekCalendarProps> = ({
  date,
  firstDay = 0,
  markingType = 'simple',
  markedDates = {},
  onDayPress,
  theme,
  allowShadow = true,
  dayComponent,
  calendarWidth,
  style,
}) => {
  const calendarContext = useCalendarContext();
  const currentDate = date || calendarContext.date;
  const { i18n } = useLanguageContext();

  // Get week dates
  const weekDates = useMemo(() => {
    return getWeekDates(currentDate, firstDay);
  }, [currentDate, firstDay]);

  // Day names - get the actual day name for each date
  const dayNames = useMemo(() => {
    const dayKeys = ['SunAbbr', 'MonAbbr', 'TueAbbr', 'WedAbbr', 'ThuAbbr', 'FriAbbr', 'SatAbbr'];
    // Map each date to its actual day of week
    return weekDates.map(dateData => {
      const dayOfWeek = moment(dateData.dateString).day(); // 0 = Sunday, 1 = Monday, etc.
      return i18n.t(dayKeys[dayOfWeek]);
    });
  }, [weekDates, i18n]);

  // Handle day press
  const handleDayPress = (dateData: DateData | undefined) => {
    if (!dateData) return;
    if (onDayPress) {
      onDayPress(dateData);
    }
    calendarContext.onDayPress(dateData);
  };

  // Get day state
  const getDayState = (dateData: DateData): string => {
    const today = moment().format('YYYY-MM-DD');
    const currentMonth = moment(currentDate).month();
    
    if (dateData.dateString === today) {
      return 'today';
    }
    
    if (dateData.month - 1 !== currentMonth) {
      return 'disabled';
    }
    
    return '';
  };

  // Get marking for date - include selection state
  const getMarking = (dateData: DateData) => {
    const marking = markedDates[dateData.dateString] || {};
    const isSelected = calendarContext.date === dateData.dateString;

    // Convert the marking format to include dots array for CalendarDayComponent
    const convertedMarking = {
      ...marking,
      // If we have a dotColor, convert it to dots array format
      ...((marking as any).dotColor && {
        dots: [{ color: (marking as any).dotColor }]
      }),
      // Add selection styling
      ...(isSelected && {
        customStyles: {
          container: true // This triggers the selected styling in CalendarDayComponent
        }
      })
    };

    return convertedMarking;
  };



  return (
    <div style={{
      ...styles.container,
      width: calendarWidth || '100%',
      boxShadow: allowShadow ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
      ...style,
    }}>
      {/* Day headers with dates */}
      <div style={styles.headerContainer}>
        {dayNames.map((dayName, index) => {
          const dateData = weekDates[index];
          const isSelected = calendarContext.date === dateData?.dateString;
          return (
            <div
              key={index}
              style={{...styles.dayHeader, cursor: 'pointer'}}
              onClick={() => {
                if (dateData && onDayPress) {
                  onDayPress(dateData);
                }
                if (dateData) {
                  calendarContext.onDayPress(dateData);
                }
              }}
            >
              <CustomText style={{
                ...styles.dayHeaderText,
                color: isSelected ? '#000E50' : '#666E96',
                fontWeight: isSelected ? 700 : 400,
              }}>
                {dayName}
              </CustomText>
              <CustomText style={{
                ...styles.dayDateText,
                color: isSelected ? '#000E50' : '#666E96',
                fontWeight: isSelected ? 700 : 400,
              }}>
                {dateData?.day}
              </CustomText>
            </div>
          );
        })}
      </div>

    </div>
  );
};

const styles = {
  container: {
    backgroundColor: Colors.WHITE,
    borderRadius: '8px',
    marginBottom: '10px',
    height: '42px',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,

  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    height: '100%',
  } as React.CSSProperties,

  dayHeader: {
    width: '32px',
    height: '26px',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  } as React.CSSProperties,
  
  dayHeaderText: {
    color: '#666E96',
    fontFamily: 'Poppins',
    fontSize: '10px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '120%', /* 12px */
    textAlign: 'center',
  } as React.CSSProperties,

  dayDateText: {
    fontFamily: 'Poppins',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '120%', /* 19.2px */
    textAlign: 'center',
  } as React.CSSProperties,

};

export default WeekCalendar;

// Export types for use in other components
export type { WeekCalendarProps, MarkedDates };
