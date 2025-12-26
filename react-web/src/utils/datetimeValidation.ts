import { areDatesEqual, getTotalMinutes } from './datetime';

/**
 * Error messages for time validation
 */
export interface TimeValidationMessages {
  endBeforeStart: string;
  startAfterEnd: string;
}

/**
 * Validates that a selected time falls within specified constraints.
 * Takes into account whether the dates are the same:
 * - If dates are the same, validates time-only constraints
 * - If dates are different, skips time validation (any time is valid)
 *
 * @param selectedTime - The time being validated
 * @param minTime - Optional minimum time constraint (for end time validation)
 * @param maxTime - Optional maximum time constraint (for start time validation)
 * @param errorMessages - Custom error messages for validation failures
 * @returns Error message if validation fails, null if valid
 *
 * @example
 * // Same date scenario
 * validateTimeConstraints(
 *   new Date('2024-10-16 12:00'),
 *   new Date('2024-10-16 13:00'),
 *   undefined,
 *   { endBeforeStart: 'End must be after start', startAfterEnd: 'Start must be before end' }
 * ); // Returns 'End must be after start'
 *
 * @example
 * // Different date scenario
 * validateTimeConstraints(
 *   new Date('2024-10-20 09:00'),
 *   new Date('2024-10-13 13:00'),
 *   undefined,
 *   { endBeforeStart: 'End must be after start', startAfterEnd: 'Start must be before end' }
 * ); // Returns null (different dates, time doesn't matter)
 */
export function validateTimeConstraints(
  selectedTime: Date,
  minTime: Date | undefined,
  maxTime: Date | undefined,
  errorMessages: TimeValidationMessages
): string | null {
  // Validate against minimum time (end time must be after start time)
  if (minTime) {
    // Only validate if both datetimes are on the same date
    const isSameDate = areDatesEqual(selectedTime, minTime);

    if (isSameDate) {
      const totalMinutesSelected = getTotalMinutes(selectedTime);
      const totalMinutesMin = getTotalMinutes(minTime);

      if (totalMinutesSelected < totalMinutesMin) {
        return errorMessages.endBeforeStart;
      }
    }
    // Different dates - no time-only validation needed
  }

  // Validate against maximum time (start time must be before end time)
  if (maxTime) {
    // Only validate if both datetimes are on the same date
    const isSameDate = areDatesEqual(selectedTime, maxTime);

    if (isSameDate) {
      const totalMinutesSelected = getTotalMinutes(selectedTime);
      const totalMinutesMax = getTotalMinutes(maxTime);

      if (totalMinutesSelected > totalMinutesMax) {
        return errorMessages.startAfterEnd;
      }
    }
    // Different dates - no time-only validation needed
  }

  return null;
}
