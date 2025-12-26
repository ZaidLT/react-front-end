'use client';

import React from 'react';
import moment from 'moment';
import CustomText from '../CustomText';
import Icon from '../Icon';
import DateTimePickerModal from '../DateTimePickerModal';
import { Colors } from '../../styles';
import { useLanguageContext } from '../../context/LanguageContext';
import { useDatetimeInput } from './useDatetimeInput';
import styles from './DatetimeInput.module.css';

export interface DatetimeInputProps {
  label: string;
  date: Date;
  time: Date;
  isAllDay: boolean;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
  dateFormat?: string;
  timeFormat?: string;
  minDate?: Date;
  maxDate?: Date;
  minTime?: Date;
  maxTime?: Date;
}

const DatetimeInput: React.FC<DatetimeInputProps> = ({
  label,
  date,
  time,
  isAllDay,
  onDateChange,
  onTimeChange,
  dateFormat = "ddd, MMM D",
  timeFormat = "h:mm A",
  minDate,
  maxDate,
  minTime,
  maxTime,
}) => {
  const { i18n } = useLanguageContext();

  // Use custom hook for logic
  const {
    showDatePicker,
    showTimePicker,
    handleDateConfirm,
    handleTimeConfirm,
    openDatePicker,
    openTimePicker,
    closeDatePicker,
    closeTimePicker,
  } = useDatetimeInput({ onDateChange, onTimeChange });

  return (
    <>
      <div className={styles.row}>
        <CustomText style={{
          color: 'var(--primary-dark-blue-60, #666E96)',
          fontSize: '12px',
          fontFamily: 'Poppins',
          fontStyle: 'normal',
          fontWeight: '500',
          lineHeight: '15px',
          width: '50px',
        }}>
          {label}
        </CustomText>

        <div className={styles.datePickerContainer}>
          <div className={styles.datePicker} onClick={openDatePicker}>
            <Icon name="calendar" width={24} height={24} />
            <CustomText style={{
              color: Colors.BLUE,
              fontSize: '14px',
              fontFamily: 'Poppins',
              fontWeight: '400',
            }}>
              {moment(date).format(dateFormat)}
            </CustomText>
          </div>
        </div>

        <div className={styles.timePickerContainer}>
          {!isAllDay && (
            <div className={styles.timePicker} onClick={openTimePicker}>
              <Icon name="clock-alarm" width={24} height={24} />
              <CustomText style={{
                color: 'var(--primary-dark-blue-100, #000E50)',
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '21px',
                letterSpacing: '-0.408px',
              }}>
                {moment(time).format(timeFormat)}
              </CustomText>
            </div>
          )}
        </div>
      </div>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        onClose={closeDatePicker}
        onConfirm={handleDateConfirm}
        initialDate={date}
        mode="date"
        title={i18n.t("SelectDate") || "Select Date"}
        minDate={minDate}
        maxDate={maxDate}
      />

      {/* Time Picker Modal */}
      <DateTimePickerModal
        isVisible={showTimePicker}
        onClose={closeTimePicker}
        onConfirm={handleTimeConfirm}
        initialDate={time}
        mode="time"
        title={i18n.t("SelectTime") || "Select Time"}
        minTime={minTime}
        maxTime={maxTime}
      />
    </>
  );
};

export default DatetimeInput;
