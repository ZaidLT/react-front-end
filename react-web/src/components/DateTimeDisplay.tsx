import React from 'react';
import moment from 'moment';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';
import { useLanguageContext } from '../context/LanguageContext';

interface DateTimeDisplayProps {
  deadlineStartDateTime?: string | null;
  deadlineEndDateTime?: string | null;
  scheduledTime?: string;
  scheduledTimeEnd?: string;
  frequency?: string;
  reminder?: string;
}

// Utility Functions
const formatDateToWeekdayMonthDay = (date?: string | null) => {
  if (!date) return '_';
  const momentDate = moment.utc(date).local();
  return momentDate.isValid() ? momentDate.format('ddd, MMM DD') : '_';
};

// Format a UTC datetime string to local time for display
const formatUtcToLocalTime = (utcDateTime?: string | null) => {
  if (!utcDateTime) return '_';
  const m = moment.utc(utcDateTime).local();
  return m.isValid() ? m.format('hh:mm A') : '_';
};

const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  deadlineStartDateTime,
  deadlineEndDateTime,
  scheduledTime,
  scheduledTimeEnd,
  frequency,
  reminder,
}) => {
  const { i18n } = useLanguageContext();
  // Determine all-day based on deadlineDateTime fields (UTC converted to local)
  const isAllDay = (() => {
    if (!deadlineStartDateTime || !deadlineEndDateTime) return false;
    const startLocal = moment.utc(deadlineStartDateTime).local();
    const endLocal = moment.utc(deadlineEndDateTime).local();
    return startLocal.format('HH:mm') === '00:00' && endLocal.format('HH:mm') === '23:59';
  })();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <CustomText
        style={{
          color: Colors.BLUE,
          fontSize: Typography.FONT_SIZE_12,
          fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
          fontWeight: Typography.FONT_WEIGHT_500,
        }}
      >
        {i18n.t('DateAndTime')}
      </CustomText>

      {/* First Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '5px',
            flex: 1,
          }}
        >
          {/* Calendar Icon (placeholder) */}
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <rect
              x='3'
              y='4'
              width='18'
              height='18'
              rx='2'
              stroke={Colors.BLUE}
              strokeWidth='2'
            />
            <path d='M3 10H21' stroke={Colors.BLUE} strokeWidth='2' />
            <path
              d='M8 2V6'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M16 2V6'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M8 14H8.01'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M12 14H12.01'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M16 14H16.01'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M8 18H8.01'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M12 18H12.01'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M16 18H16.01'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
          <CustomText
            style={{
              color: Colors.BLUE,
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              fontWeight: Typography.FONT_WEIGHT_400,
            }}
          >
            {deadlineStartDateTime
              ? `${formatDateToWeekdayMonthDay(deadlineStartDateTime)}`
              : '_'}
          </CustomText>
        </div>

        {/* Scheduled Start Time */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          {/* Clock Icon (placeholder) */}
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle
              cx='12'
              cy='12'
              r='9'
              stroke={Colors.BLUE}
              strokeWidth='2'
            />
            <path
              d='M12 7V12L15 15'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <CustomText
            style={{
              color: Colors.BLUE,
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              fontWeight: Typography.FONT_WEIGHT_400,
              width: '80px',
              textAlign: 'right',
            }}
          >
            {isAllDay ? '12:00 AM' : formatUtcToLocalTime(deadlineStartDateTime)}
          </CustomText>
        </div>
      </div>

      {/* Second Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          {/* Calendar Icon (placeholder) */}
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <rect
              x='3'
              y='4'
              width='18'
              height='18'
              rx='2'
              stroke={Colors.BLUE}
              strokeWidth='2'
            />
            <path d='M3 10H21' stroke={Colors.BLUE} strokeWidth='2' />
            <path
              d='M8 2V6'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M16 2V6'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M8 14H8.01'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M12 14H12.01'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M16 14H16.01'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M8 18H8.01'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M12 18H12.01'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M16 18H16.01'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
          <CustomText
            style={{
              color: Colors.BLUE,
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              fontWeight: Typography.FONT_WEIGHT_400,
            }}
          >
            {deadlineEndDateTime
              ? `${formatDateToWeekdayMonthDay(deadlineEndDateTime)}`
              : deadlineStartDateTime
              ? `${formatDateToWeekdayMonthDay(deadlineStartDateTime)}`
              : '_'}
          </CustomText>
        </div>

        {/* Scheduled End Time */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          {/* Clock Icon (placeholder) */}
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle
              cx='12'
              cy='12'
              r='9'
              stroke={Colors.BLUE}
              strokeWidth='2'
            />
            <path
              d='M12 7V12L15 15'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <CustomText
            style={{
              color: Colors.BLUE,
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              fontWeight: Typography.FONT_WEIGHT_400,
              width: '80px',
              textAlign: 'right',
            }}
          >
            {isAllDay ? '11:59 PM' : formatUtcToLocalTime(deadlineEndDateTime)}
          </CustomText>
        </div>
      </div>

      {/* Reminder and Frequency Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        {reminder && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {/* Notification Icon (placeholder) */}
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M10 5C10 3.89543 10.8954 3 12 3C13.1046 3 14 3.89543 14 5V5.5C14 5.5 14 5 14 5'
                stroke={Colors.BLUE}
                strokeWidth='2'
                strokeLinecap='round'
              />
              <path
                d='M19 10C19 7.23858 16.7614 5 14 5H10C7.23858 5 5 7.23858 5 10V15L4 16V17H20V16L19 15V10Z'
                stroke={Colors.BLUE}
                strokeWidth='2'
                strokeLinecap='round'
              />
              <path
                d='M9 17C9 18.6569 10.3431 20 12 20C13.6569 20 15 18.6569 15 17'
                stroke={Colors.BLUE}
                strokeWidth='2'
                strokeLinecap='round'
              />
            </svg>
            <CustomText
              style={{
                color: Colors.BLUE,
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                fontWeight: Typography.FONT_WEIGHT_400,
              }}
            >
              {reminder}
            </CustomText>
          </div>
        )}

        {frequency && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {/* Repeat Icon (placeholder) */}
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M17 2L21 6L17 10'
                stroke={Colors.BLUE}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M3 11V9C3 7.89543 3.89543 7 5 7H21'
                stroke={Colors.BLUE}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M7 22L3 18L7 14'
                stroke={Colors.BLUE}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M21 13V15C21 16.1046 20.1046 17 19 17H3'
                stroke={Colors.BLUE}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <CustomText
              style={{
                color: Colors.BLUE,
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                fontWeight: Typography.FONT_WEIGHT_400,
              }}
            >
              {frequency}
            </CustomText>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimeDisplay;
