/**
 * Debug utility functions that respect NEXT_PUBLIC_DEBUG_MODE environment variable
 */

const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

/**
 * Debug log that only outputs when NEXT_PUBLIC_DEBUG_MODE is true
 */
export const debugLog = (message: string, data?: any) => {
  if (isDebugMode) {
    if (data !== undefined) {
      console.log(`🔍 DEBUG: ${message}`, data);
    } else {
      console.log(`🔍 DEBUG: ${message}`);
    }
  }
};

/**
 * Debug error that only outputs when NEXT_PUBLIC_DEBUG_MODE is true
 */
export const debugError = (message: string, error?: any) => {
  if (isDebugMode) {
    if (error !== undefined) {
      console.error(`🚨 DEBUG ERROR: ${message}`, error);
    } else {
      console.error(`🚨 DEBUG ERROR: ${message}`);
    }
  }
};

/**
 * Debug warn that only outputs when NEXT_PUBLIC_DEBUG_MODE is true
 */
export const debugWarn = (message: string, data?: any) => {
  if (isDebugMode) {
    if (data !== undefined) {
      console.warn(`⚠️ DEBUG WARN: ${message}`, data);
    } else {
      console.warn(`⚠️ DEBUG WARN: ${message}`);
    }
  }
};

/**
 * Performance timing utility for debug mode
 */
export const debugTime = (label: string) => {
  if (isDebugMode) {
    console.time(`⏱️ DEBUG TIME: ${label}`);
  }
};

export const debugTimeEnd = (label: string) => {
  if (isDebugMode) {
    console.timeEnd(`⏱️ DEBUG TIME: ${label}`);
  }
};

/**
 * Check if debug mode is enabled
 */
export const isDebugEnabled = () => isDebugMode;
