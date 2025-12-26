import { DOCUMENT_PREVIEW_CONSTANTS } from '../constants';

/**
 * Calculates the appropriate scale for rendering PDF to fit container
 * while accounting for high-DPI displays
 *
 * @param pageWidth - Width of the PDF page at scale 1
 * @param maxContainerWidth - Maximum width of the container
 * @param devicePixelRatio - Device pixel ratio (defaults to window.devicePixelRatio)
 * @returns Object containing base scale and output scale for high-DPI rendering
 */
export const calculateCanvasScale = (
  pageWidth: number,
  maxContainerWidth: number = DOCUMENT_PREVIEW_CONSTANTS.MAX_CONTAINER_WIDTH,
  devicePixelRatio: number = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
): { scale: number; outputScale: number } => {
  const containerWidth = Math.min(
    maxContainerWidth,
    (typeof window !== 'undefined' ? window.innerWidth : maxContainerWidth) -
      DOCUMENT_PREVIEW_CONSTANTS.DEFAULT_CONTAINER_WIDTH_OFFSET
  );
  const scale = containerWidth / pageWidth;
  return { scale, outputScale: devicePixelRatio };
};

/**
 * Sets canvas dimensions for high-DPI rendering
 *
 * This ensures sharp rendering on retina/high-DPI displays by:
 * 1. Setting internal canvas resolution at device pixel ratio
 * 2. Setting CSS display size at normal scale
 *
 * @param canvas - Canvas element to configure
 * @param width - Scaled width (including device pixel ratio)
 * @param height - Scaled height (including device pixel ratio)
 * @param outputScale - Device pixel ratio
 */
export const setCanvasDimensions = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  outputScale: number
): void => {
  // Set canvas internal resolution (high resolution)
  canvas.width = width;
  canvas.height = height;

  // Set canvas display size (visible size)
  canvas.style.width = `${width / outputScale}px`;
  canvas.style.height = `${height / outputScale}px`;
};

/**
 * Prepares canvas context for rendering with proper scaling
 *
 * @param context - Canvas 2D rendering context
 * @param width - Canvas width
 * @param height - Canvas height
 * @param outputScale - Device pixel ratio
 */
export const prepareCanvasContext = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  outputScale: number
): void => {
  // Clear canvas before rendering
  context.clearRect(0, 0, width, height);

  // Scale context to match device pixel ratio
  context.scale(outputScale, outputScale);
};
