/**
 * Date utility functions for consistent timezone handling across the application
 * 
 * Key principles:
 * - Backend stores dates in UTC format
 * - Frontend displays dates in user's local timezone
 * - Date inputs are handled in local timezone but converted to UTC for storage
 */

import moment from 'moment';

/**
 * Format a UTC date string for display in the user's local timezone
 * @param utcDateString - Date string in UTC format (e.g., "2000-01-28T00:00:00.000Z")
 * @param format - Moment.js format string (default: "MMMM DD, YYYY")
 * @returns Formatted date string in local timezone
 */
export const formatDateForDisplay = (utcDateString: string | null | undefined, format: string = 'MMMM DD, YYYY'): string => {
  if (!utcDateString) return '';
  
  try {
    // Parse as UTC and convert to local timezone for display
    return moment.utc(utcDateString).local().format(format);
  } catch (error) {
    console.warn('Error formatting date for display:', error);
    return '';
  }
};

/**
 * Format a UTC date string for use in date input fields (YYYY-MM-DD format)
 * @param utcDateString - Date string in UTC format
 * @returns Date string in YYYY-MM-DD format in local timezone
 */
export const formatDateForInput = (utcDateString: string | null | undefined): string => {
  if (!utcDateString) return '';
  
  try {
    // Parse as UTC and convert to local timezone for input
    return moment.utc(utcDateString).local().format('YYYY-MM-DD');
  } catch (error) {
    console.warn('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Convert a local date input to UTC format for storage
 * @param localDateString - Date string in local timezone (e.g., "2000-01-28" from date input)
 * @param format - Input format (default: "YYYY-MM-DD")
 * @returns UTC date string for backend storage
 */
export const convertLocalDateToUTC = (localDateString: string | null | undefined, format: string = 'YYYY-MM-DD'): string => {
  if (!localDateString) return '';
  
  try {
    // Parse as local date and convert to UTC for storage
    return moment(localDateString, format).utc().format('YYYY-MM-DD');
  } catch (error) {
    console.warn('Error converting local date to UTC:', error);
    return '';
  }
};

/**
 * Get the current date in local timezone formatted for date inputs
 * @returns Current date in YYYY-MM-DD format
 */
export const getCurrentDateForInput = (): string => {
  return moment().format('YYYY-MM-DD');
};

/**
 * Validate if a date string is valid
 * @param dateString - Date string to validate
 * @param format - Expected format (optional)
 * @returns True if valid, false otherwise
 */
export const isValidDate = (dateString: string | null | undefined, format?: string): boolean => {
  if (!dateString) return false;
  
  try {
    const momentDate = format ? moment(dateString, format) : moment(dateString);
    return momentDate.isValid();
  } catch (error) {
    return false;
  }
};

/**
 * Format a date for display with relative time (e.g., "2 days ago", "in 3 months")
 * @param utcDateString - Date string in UTC format
 * @returns Relative time string
 */
export const formatRelativeDate = (utcDateString: string | null | undefined): string => {
  if (!utcDateString) return '';
  
  try {
    return moment.utc(utcDateString).local().fromNow();
  } catch (error) {
    console.warn('Error formatting relative date:', error);
    return '';
  }
};

/**
 * Check if a date is today in the user's local timezone
 * @param utcDateString - Date string in UTC format
 * @returns True if the date is today, false otherwise
 */
export const isToday = (utcDateString: string | null | undefined): boolean => {
  if (!utcDateString) return false;
  
  try {
    const date = moment.utc(utcDateString).local();
    const today = moment();
    return date.isSame(today, 'day');
  } catch (error) {
    return false;
  }
};

/**
 * Get age from birthday in years
 * @param birthdayUTC - Birthday in UTC format
 * @returns Age in years
 */
export const getAgeFromBirthday = (birthdayUTC: string | null | undefined): number | null => {
  if (!birthdayUTC) return null;

  try {
    const birthday = moment.utc(birthdayUTC).local();
    const today = moment();
    return today.diff(birthday, 'years');
  } catch (error) {
    console.warn('Error calculating age:', error);
    return null;
  }
};

/**
 * Format a birthday date for display (no timezone conversion)
 * Birthdays should always display the same date regardless of timezone
 * @param birthdayString - Birthday string from backend
 * @param format - Moment.js format string (default: "MMMM DD, YYYY")
 * @returns Formatted birthday string
 */
export const formatBirthdayForDisplay = (birthdayString: string | null | undefined, format: string = 'MMMM DD, YYYY'): string => {
  if (!birthdayString) return '';

  try {
    // Handle different date formats from backend
    // Format 1: "2016-01-28T00:00:00.000+00:00" (ISO format)
    // Format 2: "1979-06-21 00:00:00" (SQL datetime format)
    let dateOnly = birthdayString;

    if (birthdayString.includes('T')) {
      dateOnly = birthdayString.split('T')[0];
    } else if (birthdayString.includes(' ')) {
      dateOnly = birthdayString.split(' ')[0];
    }

    // Parse without timezone conversion and format
    return moment(dateOnly, 'YYYY-MM-DD').format(format);
  } catch (error) {
    console.warn('Error formatting birthday for display:', error);
    return '';
  }
};

/**
 * Format a birthday date for input field (no timezone conversion)
 * @param birthdayString - Birthday string from backend
 * @returns Date string in YYYY-MM-DD format
 */
export const formatBirthdayForInput = (birthdayString: string | null | undefined): string => {
  if (!birthdayString) return '';

  try {
    // Handle different date formats from backend
    // Format 1: "2016-01-28T00:00:00.000+00:00" (ISO format)
    // Format 2: "1979-06-21 00:00:00" (SQL datetime format)
    let dateOnly = birthdayString;

    if (birthdayString.includes('T')) {
      dateOnly = birthdayString.split('T')[0];
    } else if (birthdayString.includes(' ')) {
      dateOnly = birthdayString.split(' ')[0];
    }

    // Ensure we have a valid YYYY-MM-DD format
    if (dateOnly.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateOnly;
    }

    return '';
  } catch (error) {
    console.warn('Error formatting birthday for input:', error);
    return '';
  }
};

/**
 * Convert a local birthday input to storage format
 * @param localDateString - Date string in local format (e.g., "2016-01-28" from date input)
 * @returns Birthday string for backend storage (as midnight UTC ISO string)
 */
export const convertBirthdayForStorage = (localDateString: string | null | undefined): string => {
  if (!localDateString) return '';

  try {
    // Store birthday as midnight UTC to preserve the date
    // Return full ISO string as expected by backend
    return moment(localDateString, 'YYYY-MM-DD').utc().toISOString();
  } catch (error) {
    console.warn('Error converting birthday for storage:', error);
    return '';
  }
};
