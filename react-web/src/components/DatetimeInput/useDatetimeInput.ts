import { useState } from 'react';

interface UseDatetimeInputProps {
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
}

export const useDatetimeInput = ({ onDateChange, onTimeChange }: UseDatetimeInputProps) => {
  // Modal state
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  // Handle date picker confirm
  const handleDateConfirm = (selectedDate: Date) => {
    onDateChange(selectedDate);
    setShowDatePicker(false);
  };

  // Handle time picker confirm
  const handleTimeConfirm = (selectedTime: Date) => {
    onTimeChange(selectedTime);
    setShowTimePicker(false);
  };

  // Open pickers
  const openDatePicker = () => setShowDatePicker(true);
  const openTimePicker = () => setShowTimePicker(true);

  // Close pickers
  const closeDatePicker = () => setShowDatePicker(false);
  const closeTimePicker = () => setShowTimePicker(false);

  return {
    // State
    showDatePicker,
    showTimePicker,

    // Handlers
    handleDateConfirm,
    handleTimeConfirm,
    openDatePicker,
    openTimePicker,
    closeDatePicker,
    closeTimePicker,
  };
};
