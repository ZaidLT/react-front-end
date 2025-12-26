import moment, { Moment } from 'moment';

/**
 * Combines a date and time into a single moment object.
 * Takes the date portion (year, month, day) from the date parameter
 * and the time portion (hours, minutes) from the time parameter.
 *
 * @param date - The date to extract year/month/day from
 * @param time - The time to extract hours/minutes from
 * @returns A moment object with combined date and time
 *
 * @example
 * const date = new Date('2024-10-16');
 * const time = new Date('2024-01-01 13:00:00');
 * const combined = createDateTimeFromParts(date, time);
 * // Result: 2024-10-16 13:00:00
 */
export function createDateTimeFromParts(date: Date, time: Date): Moment {
  return moment(date).set({
    hour: moment(time).hour(),
    minute: moment(time).minute(),
    second: 0,
    millisecond: 0,
  });
}

/**
 * Compares two datetime combinations to determine their chronological order.
 *
 * @param startDate - The start date
 * @param startTime - The start time
 * @param endDate - The end date
 * @param endTime - The end time
 * @returns Negative if start is before end, 0 if equal, positive if start is after end
 *
 * @example
 * compareDateTimes(
 *   new Date('2024-10-16'), new Date('2024-01-01 13:00'),
 *   new Date('2024-10-17'), new Date('2024-01-01 14:00')
 * ); // Returns negative (start is before end)
 */
export function compareDateTimes(
  startDate: Date,
  startTime: Date,
  endDate: Date,
  endTime: Date
): number {
  const start = createDateTimeFromParts(startDate, startTime);
  const end = createDateTimeFromParts(endDate, endTime);
  return start.diff(end);
}

/**
 * Checks if a time range crosses midnight (i.e., end date is different from start date).
 *
 * @param start - The start moment
 * @param end - The end moment
 * @returns True if the range crosses midnight, false otherwise
 *
 * @example
 * const start = moment('2024-10-16 23:00');
 * const end = moment('2024-10-17 01:00');
 * isCrossingMidnight(start, end); // Returns true
 */
export function isCrossingMidnight(start: Moment, end: Moment): boolean {
  return end.date() !== start.date() ||
         end.month() !== start.month() ||
         end.year() !== start.year();
}

/**
 * Compares only the date portions (year, month, day) of two dates.
 * Ignores time components.
 *
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns True if dates have the same year, month, and day
 *
 * @example
 * areDatesEqual(
 *   new Date('2024-10-16 13:00'),
 *   new Date('2024-10-16 18:00')
 * ); // Returns true
 */
export function areDatesEqual(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Converts a date's time to total minutes since midnight.
 * Useful for comparing times independent of dates.
 *
 * @param date - The date to extract time from
 * @returns Total minutes since midnight (0-1439)
 *
 * @example
 * const date = new Date('2024-10-16 13:30:00');
 * getTotalMinutes(date); // Returns 810 (13 * 60 + 30)
 */
export function getTotalMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Calculates an auto-adjusted end datetime based on a start datetime and duration.
 * Handles midnight crossing automatically.
 *
 * @param startMoment - The start moment
 * @param durationMinutes - Duration in minutes to add
 * @returns Object with endDate and endTime
 *
 * @example
 * const start = moment('2024-10-16 23:00');
 * calculateAutoAdjustedEnd(start, 120);
 * // Returns { endDate: Oct 17, endTime: 01:00 }
 */
export function calculateAutoAdjustedEnd(
  startMoment: Moment,
  durationMinutes: number
): { endDate: Date; endTime: Date } {
  const endMoment = startMoment.clone().add(durationMinutes, 'minutes');
  return {
    endDate: endMoment.toDate(),
    endTime: endMoment.toDate(),
  };
}

/**
 * Determines if the end datetime should snap to match the start datetime.
 * This happens when end is before start (but not when they are equal).
 *
 * @param startMoment - The start moment
 * @param endMoment - The end moment
 * @returns True if end should snap to start
 *
 * @example
 * const start = moment('2024-10-16 13:00');
 * const end = moment('2024-10-16 12:00');
 * shouldSnapEndToStart(start, end); // Returns true
 */
export function shouldSnapEndToStart(startMoment: Moment, endMoment: Moment): boolean {
  return endMoment.isBefore(startMoment);
}
