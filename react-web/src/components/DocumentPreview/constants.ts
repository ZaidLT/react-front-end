/**
 * Shared constants for Document Preview components
 */

export const DOCUMENT_PREVIEW_CONSTANTS = {
  // Container dimensions
  MAX_CONTAINER_WIDTH: 800,

  // Spacing
  CONTAINER_PADDING: 20,
  CONTROL_BAR_PADDING: 16,
  CONTROL_BAR_GAP: 16,

  // Button dimensions
  BUTTON_MIN_SIZE: 40,

  // API endpoints
  FILE_PROXY_PATH: '/api/file-proxy',

  // PDF.js worker URL
  PDF_WORKER_URL: 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js',

  // Canvas rendering
  DEFAULT_CONTAINER_WIDTH_OFFSET: 40, // Subtracted from window width for responsive sizing
} as const;

/**
 * Shared container styles used across preview components
 */
export const CONTAINER_STYLES = {
  maxWidth: `${DOCUMENT_PREVIEW_CONSTANTS.MAX_CONTAINER_WIDTH}px`,
  margin: '0 auto',
  width: '100%',
} as const;
