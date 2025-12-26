'use client';

import React from 'react';
import CustomText from '../CustomText';
import Toggle from '../Toggle';
import DatetimeInput from '../DatetimeInput';
import { Colors } from '../../styles';
import { useLanguageContext } from '../../context/LanguageContext';
import { useDatetimeRangeInput } from './useDatetimeRangeInput';
import styles from './DatetimeRangeInput.module.css';

export interface DatetimeRangeInputProps {
  // Initial values
  initialStartDate?: Date;
  initialStartTime?: Date;
  initialEndTime?: Date;
  initialIsAllDay?: boolean;

  // Configuration
  defaultDuration?: number; // Optional - if provided, enables auto-adjust (for create forms). In minutes.
  allowStartBeforeNow?: boolean; // Allow past dates (default: true)

  // Callbacks
  onChange: (data: {
    startDate: Date;
    startTime: Date;
    endDate: Date;
    endTime: Date;
    isAllDay: boolean;
  }) => void;

  // Optional customization
  dateFormat?: string; // Default: "ddd, MMM D"
  timeFormat?: string; // Default: "h:mm A"
  className?: string; // Optional external className for styling
}

const DatetimeRangeInput: React.FC<DatetimeRangeInputProps> = ({
  initialStartDate = new Date(),
  initialStartTime = new Date(),
  initialEndTime = new Date(),
  initialIsAllDay = false,
  defaultDuration, // No default - undefined means no auto-adjust (for edit forms)
  allowStartBeforeNow = false,
  onChange,
  dateFormat = "ddd, MMM D",
  timeFormat = "h:mm A",
  className,
}) => {
  const { i18n } = useLanguageContext();

  // Use custom hook for logic
  const {
    startDate,
    startTime,
    endDate,
    endTime,
    isAllDay,
    handleStartDateChange,
    handleStartTimeChange,
    handleEndDateChange,
    handleEndTimeChange,
    handleAllDayToggle,
    getStartMinDate,
    getStartMinTime,
    getEndMinDate,
  } = useDatetimeRangeInput({
    initialStartDate,
    initialStartTime,
    initialEndTime,
    initialIsAllDay,
    defaultDuration,
    allowStartBeforeNow,
    onChange,
  });

  return (
    <div className={`${styles.container}${className ? ` ${className}` : ''}`}>
      {/* Header with Date & Time label and All-Day toggle */}
      <div className={styles.header}>
        <CustomText style={{
          color: 'var(--primary-dark-blue-60, #666E96)',
          fontFamily: 'Poppins',
          fontSize: '12px',
          fontStyle: 'normal',
          fontWeight: '500',
          lineHeight: '15px',
        }}>
          {i18n.t('DateAndTime') || 'Date & Time'}
        </CustomText>

        <div className={styles.allDayToggleContainer} onClick={handleAllDayToggle}>
          <CustomText style={{
            color: 'var(--primary-dark-blue-40, #999FB9)',
            fontFamily: 'Poppins',
            fontSize: '9px',
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: '16px',
            letterSpacing: '0.144px',
          }}>
            {i18n.t('AllDay') || 'All day'}
          </CustomText>
          <Toggle
            isActive={isAllDay}
            containerStyle={{
              width: "35px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "10px",
              borderColor: isAllDay ? "#2DBE2A" : Colors.BLUE_GREY,
              backgroundColor: isAllDay ? "#2DBE2A" : Colors.BLUE_GREY,
            }}
            thumbStyle={{
              width: "10px",
              height: "10px",
              backgroundColor: Colors.WHITE,
              borderRadius: "10px",
              margin: "0 3px",
            }}
          />
        </div>
      </div>

      {/* Date and Time Selection */}
      <div className={styles.selectionContainer}>
        {/* Start Date/Time */}
        <DatetimeInput
          label={i18n.t('Start') || 'Start'}
          date={startDate}
          time={startTime}
          isAllDay={isAllDay}
          onDateChange={handleStartDateChange}
          onTimeChange={handleStartTimeChange}
          dateFormat={dateFormat}
          timeFormat={timeFormat}
          minDate={getStartMinDate()}
          minTime={getStartMinTime()}
        />

        {/* End Date/Time */}
        <DatetimeInput
          label={i18n.t('End') || 'End'}
          date={endDate}
          time={endTime}
          isAllDay={isAllDay}
          onDateChange={handleEndDateChange}
          onTimeChange={handleEndTimeChange}
          dateFormat={dateFormat}
          timeFormat={timeFormat}
          minDate={getEndMinDate()}
          minTime={startTime}
        />
      </div>
    </div>
  );
};

export default DatetimeRangeInput;
