/**
 * Test utility to verify date timezone handling
 * This file can be run in the browser console to test our date functions
 */

import { formatDateForDisplay, formatDateForInput, convertLocalDateToUTC } from './dateUtils';

export const testDateTimezoneHandling = () => {
  console.log('=== Testing Date Timezone Handling ===');
  console.log('Current timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Test case 1: UTC date from backend should display correctly in local timezone
  const utcDateFromBackend = "2000-01-28T00:00:00.000Z";
  console.log('\n--- Test 1: Display UTC date in local timezone ---');
  console.log('UTC date from backend:', utcDateFromBackend);
  console.log('Formatted for display:', formatDateForDisplay(utcDateFromBackend));
  console.log('Formatted for input:', formatDateForInput(utcDateFromBackend));
  
  // Test case 2: Local date input should convert to UTC correctly
  const localDateInput = "2000-01-28";
  console.log('\n--- Test 2: Convert local date to UTC ---');
  console.log('Local date input:', localDateInput);
  console.log('Converted to UTC:', convertLocalDateToUTC(localDateInput));
  
  // Test case 3: Round trip test
  console.log('\n--- Test 3: Round trip test ---');
  const originalUTC = "2000-01-28T00:00:00.000Z";
  const displayFormat = formatDateForDisplay(originalUTC);
  const inputFormat = formatDateForInput(originalUTC);
  const backToUTC = convertLocalDateToUTC(inputFormat);
  
  console.log('Original UTC:', originalUTC);
  console.log('Display format:', displayFormat);
  console.log('Input format:', inputFormat);
  console.log('Back to UTC:', backToUTC);
  console.log('Round trip successful:', originalUTC.startsWith(backToUTC));
  
  // Test case 4: Edge cases around timezone boundaries
  console.log('\n--- Test 4: Timezone boundary tests ---');
  const edgeCases = [
    "1999-12-31T23:59:59.999Z", // New Year's Eve
    "2000-01-01T00:00:00.000Z", // New Year's Day
    "2000-06-15T12:00:00.000Z", // Mid-year, noon UTC
    "2000-12-25T00:00:00.000Z"  // Christmas
  ];
  
  edgeCases.forEach(utcDate => {
    const display = formatDateForDisplay(utcDate);
    const input = formatDateForInput(utcDate);
    console.log(`UTC: ${utcDate} -> Display: ${display}, Input: ${input}`);
  });
  
  console.log('\n=== Test Complete ===');
};

// Auto-run test if in browser environment
if (typeof window !== 'undefined') {
  // Add to window for easy access in browser console
  (window as any).testDateTimezoneHandling = testDateTimezoneHandling;
  console.log('Date timezone test available. Run: testDateTimezoneHandling()');
}
