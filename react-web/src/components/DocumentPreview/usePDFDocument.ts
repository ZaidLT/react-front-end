import { useState, useEffect, useRef, RefObject } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { createProxyUrl } from './utils/fileProxyUtils';
import { calculateCanvasScale, setCanvasDimensions, prepareCanvasContext } from './utils/canvasUtils';
import { DOCUMENT_PREVIEW_CONSTANTS } from './constants';

// Set up PDF.js worker (only runs once)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = DOCUMENT_PREVIEW_CONSTANTS.PDF_WORKER_URL;
}

interface UsePDFDocumentOptions {
  fileUrl: string;
  canvasRef: RefObject<HTMLCanvasElement>;
  maxContainerWidth?: number;
}

interface UsePDFDocumentReturn {
  // State
  currentPage: number;
  numPages: number;
  isLoading: boolean;
  error: string | null;
  isRendering: boolean;

  // Actions
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (pageNumber: number) => void;
  retry: () => void;

  // Computed
  canGoPrevious: boolean;
  canGoNext: boolean;
}

/**
 * Custom hook for managing PDF document loading and rendering
 *
 * Handles:
 * - PDF document loading from URL (via proxy)
 * - Canvas rendering with high-DPI support
 * - Page navigation
 * - Loading and error states
 *
 * @param options - Configuration options
 * @returns PDF document state and control functions
 *
 * @example
 * const canvasRef = useRef<HTMLCanvasElement>(null);
 * const {
 *   currentPage,
 *   numPages,
 *   isLoading,
 *   error,
 *   goToNextPage,
 *   goToPreviousPage,
 *   retry,
 * } = usePDFDocument({ fileUrl: 'https://...', canvasRef });
 */
export const usePDFDocument = ({
  fileUrl,
  canvasRef,
  maxContainerWidth = DOCUMENT_PREVIEW_CONSTANTS.MAX_CONTAINER_WIDTH,
}: UsePDFDocumentOptions): UsePDFDocumentReturn => {
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Load PDF document when fileUrl changes
  useEffect(() => {
    loadPDF();
  }, [fileUrl]);

  // Render page when PDF document or current page changes
  useEffect(() => {
    if (pdfDoc && !isLoading) {
      renderPage();
    }
  }, [pdfDoc, currentPage]);

  /**
   * Loads PDF document from URL via proxy
   */
  const loadPDF = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const proxyUrl = createProxyUrl(fileUrl);
      const loadingTask = pdfjsLib.getDocument(proxyUrl);
      const pdf = await loadingTask.promise;

      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to load PDF');
      setIsLoading(false);
    }
  };

  /**
   * Renders current page to canvas with high-DPI support
   */
  const renderPage = async () => {
    if (!pdfDoc || !canvasRef.current || isRendering) return;

    setIsRendering(true);

    try {
      const page = await pdfDoc.getPage(currentPage);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Calculate scaling for the page
      const viewport = page.getViewport({ scale: 1 });
      const { scale, outputScale } = calculateCanvasScale(viewport.width, maxContainerWidth);
      const scaledViewport = page.getViewport({ scale: scale * outputScale });

      // Set canvas dimensions for high-DPI displays
      setCanvasDimensions(canvas, scaledViewport.width, scaledViewport.height, outputScale);

      // Prepare canvas context
      prepareCanvasContext(context, canvas.width, canvas.height, outputScale);

      // Render PDF page at high resolution
      const renderContext = {
        canvasContext: context,
        viewport: page.getViewport({ scale }),
      };

      await page.render(renderContext).promise;
      setIsRendering(false);
    } catch (err) {
      console.error('Failed to render page:', err);
      setError('Failed to render PDF page');
      setIsRendering(false);
    }
  };

  /**
   * Navigates to the next page
   */
  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Navigates to the previous page
   */
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Navigates to a specific page
   * @param pageNumber - Page number to navigate to (1-indexed)
   */
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
    }
  };

  /**
   * Retries loading the PDF document
   */
  const retry = () => {
    loadPDF();
  };

  return {
    // State
    currentPage,
    numPages,
    isLoading,
    error,
    isRendering,

    // Actions
    goToNextPage,
    goToPreviousPage,
    goToPage,
    retry,

    // Computed
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < numPages,
  };
};
