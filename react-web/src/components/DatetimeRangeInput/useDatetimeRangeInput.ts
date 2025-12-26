import { useState, useEffect } from 'react';
import moment from 'moment';
import {
  createDateTimeFromParts,
  calculateAutoAdjustedEnd,
  isCrossingMidnight,
  shouldSnapEndToStart,
  areDatesEqual,
} from '../../utils/datetime';

interface UseDatetimeRangeInputProps {
  initialStartDate: Date;
  initialStartTime: Date;
  initialEndTime: Date;
  initialIsAllDay: boolean;
  defaultDuration?: number; // Optional - if not provided, auto-adjust is disabled (for edit forms)
  allowStartBeforeNow: boolean;
  onChange: (data: {
    startDate: Date;
    startTime: Date;
    endDate: Date;
    endTime: Date;
    isAllDay: boolean;
  }) => void;
}

interface SavedTimes {
  startTime: Date;
  endTime: Date;
}

export const useDatetimeRangeInput = ({
  initialStartDate,
  initialStartTime,
  initialEndTime,
  initialIsAllDay,
  defaultDuration,
  allowStartBeforeNow,
  onChange,
}: UseDatetimeRangeInputProps) => {
  // State
  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [startTime, setStartTime] = useState<Date>(initialStartTime);
  const [endDate, setEndDate] = useState<Date>(initialEndTime); // Use endTime's date portion
  const [endTime, setEndTime] = useState<Date>(initialEndTime);
  const [isAllDay, setIsAllDay] = useState<boolean>(initialIsAllDay);

  // Internal tracking
  const [isEndTimeManuallySet, setIsEndTimeManuallySet] = useState<boolean>(false);
  const [timeBeforeAllDay, setTimeBeforeAllDay] = useState<SavedTimes | null>(null);

  // Trigger onChange callback whenever datetime values change
  useEffect(() => {
    onChange({
      startDate,
      startTime,
      endDate,
      endTime,
      isAllDay,
    });
  }, [startDate, startTime, endDate, endTime, isAllDay, onChange]);

  // Handle start date change
  const handleStartDateChange = (newDate: Date) => {
    setStartDate(newDate);
    // Also update startTime to have the new date with existing time
    const updatedStartTime = createDateTimeFromParts(newDate, startTime);
    setStartTime(updatedStartTime.toDate());

    const startMoment = updatedStartTime;
    const endMoment = createDateTimeFromParts(endDate, endTime);

    // If new start is after end, snap end to match start
    if (shouldSnapEndToStart(startMoment, endMoment)) {
      setEndDate(newDate);
      setEndTime(startTime);
      return;
    }

    // Auto-adjust end time if defaultDuration is provided and not manually set
    if (defaultDuration !== undefined && !isEndTimeManuallySet) {
      const { endDate: adjustedEndDate, endTime: adjustedEndTime } =
        calculateAutoAdjustedEnd(startMoment, defaultDuration);
      setEndDate(adjustedEndDate);
      setEndTime(adjustedEndTime);
    }
  };

  // Handle start time change
  const handleStartTimeChange = (newTime: Date) => {
    // Combine the date from startDate with the time from newTime
    const combined = createDateTimeFromParts(startDate, newTime);
    setStartTime(combined.toDate());

    const startMoment = combined;

    // Auto-adjust end time if defaultDuration is provided and not manually set
    if (defaultDuration !== undefined && !isEndTimeManuallySet) {
      const { endDate: adjustedEndDate, endTime: adjustedEndTime } =
        calculateAutoAdjustedEnd(startMoment, defaultDuration);
      setEndDate(adjustedEndDate);
      setEndTime(adjustedEndTime);
      return;
    }

    // If no auto-adjust, check if start is now after end and snap if needed
    const endMoment = createDateTimeFromParts(endDate, endTime);
    if (shouldSnapEndToStart(startMoment, endMoment)) {
      setEndTime(newTime);
      setEndDate(startDate);
    }
  };

  // Handle end date change
  const handleEndDateChange = (newDate: Date) => {
    const startMoment = createDateTimeFromParts(startDate, startTime);
    const endMoment = createDateTimeFromParts(newDate, endTime);

    // Check if end would be same or before start
    if (shouldSnapEndToStart(startMoment, endMoment)) {
      // If dates are now the same, auto-adjust time to match start
      if (areDatesEqual(newDate, startDate)) {
        setEndDate(newDate);
        setEndTime(startTime);
        setIsEndTimeManuallySet(true);
        return;
      }
      // Different dates but still invalid - don't update
      return;
    }

    // Valid datetime - update normally
    setEndDate(newDate);
    // Also update endTime to have the new date with existing time
    const updatedEndTime = createDateTimeFromParts(newDate, endTime);
    setEndTime(updatedEndTime.toDate());
    setIsEndTimeManuallySet(true);
  };

  // Handle end time change
  const handleEndTimeChange = (newTime: Date) => {
    // Validation is now handled in the modal itself
    // If we reach here, the time is valid
    // Combine the date from endDate with the time from newTime
    const combined = createDateTimeFromParts(endDate, newTime);
    setEndTime(combined.toDate());
    setIsEndTimeManuallySet(true);
  };

  // Handle all-day toggle
  const handleAllDayToggle = () => {
    const newIsAllDay = !isAllDay;
    setIsAllDay(newIsAllDay);

    if (newIsAllDay) {
      // Save current times before switching to all-day
      setTimeBeforeAllDay({
        startTime: startTime,
        endTime: endTime,
      });

      // Set to full day (00:00 to 23:59)
      const startOfDay = moment(startDate).startOf('day').toDate();
      const endOfDay = moment(startDate).endOf('day').toDate();
      setStartTime(startOfDay);
      setEndTime(endOfDay);
    } else {
      // Restore previous times if available
      if (timeBeforeAllDay) {
        setStartTime(timeBeforeAllDay.startTime);
        setEndTime(timeBeforeAllDay.endTime);
        setTimeBeforeAllDay(null);
      }
    }
  };

  // Calculate min date for start input
  const getStartMinDate = () => {
    return allowStartBeforeNow ? undefined : new Date();
  };

  // Calculate min time for start input
  const getStartMinTime = () => {
    if (allowStartBeforeNow) {
      return undefined;
    }

    // Only restrict time if the selected start date is today
    const today = new Date();
    const isToday = areDatesEqual(startDate, today);

    return isToday ? new Date() : undefined;
  };

  // Calculate min date for end input
  const getEndMinDate = () => {
    return startDate; // End date cannot be before start date
  };

  return {
    // State
    startDate,
    startTime,
    endDate,
    endTime,
    isAllDay,

    // Handlers
    handleStartDateChange,
    handleStartTimeChange,
    handleEndDateChange,
    handleEndTimeChange,
    handleAllDayToggle,

    // Computed values
    getStartMinDate,
    getStartMinTime,
    getEndMinDate,
  };
};
