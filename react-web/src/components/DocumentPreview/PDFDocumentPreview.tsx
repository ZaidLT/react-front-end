'use client';

import React, { useRef } from 'react';
import { Colors } from '../../styles';
import PinchZoom from '../PinchZoom';
import { usePDFDocument } from './usePDFDocument';
import { NavigationButton } from './shared/NavigationButton';
import { LoadingState } from './shared/LoadingState';
import { ErrorState } from './shared/ErrorState';
import { ChevronLeft } from './icons/ChevronLeft';
import { ChevronRight } from './icons/ChevronRight';
import { useLanguageContext } from '../../context/LanguageContext';

interface PDFDocumentPreviewProps {
  fileUrl: string;
  filename: string;
}

/**
 * PDFDocumentPreview - Canvas-based PDF viewer with page navigation
 *
 * Features:
 * - Single-page view with prev/next navigation
 * - Canvas-based rendering using pdfjs-dist
 * - Pinch-to-zoom on mobile and desktop trackpads (1x-5x)
 * - Pan when zoomed in
 * - Page counter display
 * - Error handling and loading states
 *
 * @param fileUrl - URL to the PDF file
 * @param filename - Name of the file being displayed
 */
const PDFDocumentPreview: React.FC<PDFDocumentPreviewProps> = ({
  fileUrl,
  filename
}) => {
  const { i18n } = useLanguageContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    currentPage,
    numPages,
    isLoading,
    error,
    goToNextPage,
    goToPreviousPage,
    canGoPrevious,
    canGoNext,
    retry,
  } = usePDFDocument({ fileUrl, canvasRef });

  const styles = {
    pdfViewerContainer: {
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0',
      backgroundColor: Colors.WHITE,
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    controlBar: {
      display: 'flex',
      gap: '16px',
      padding: '16px',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    pageInfo: {
      fontSize: '14px',
      color: '#333',
      fontWeight: 500,
      minWidth: '100px',
      textAlign: 'center' as const,
    },
    viewerContent: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      overflow: 'hidden',
      borderRadius: '0 0 8px 8px',
    },
    canvas: {
      display: 'block',
      maxWidth: '100%',
      height: 'auto',
      backgroundColor: Colors.WHITE,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  };

  if (isLoading) {
    return (
      <div style={styles.pdfViewerContainer}>
        <LoadingState message={`${i18n.t('LoadingPDF')}...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pdfViewerContainer}>
        <ErrorState title={i18n.t('FailedToLoadPDF')} message={error} onRetry={retry} />
      </div>
    );
  }

  return (
    <div style={styles.pdfViewerContainer}>
      {/* Page Navigation Controls */}
      <div style={styles.controlBar}>
        <NavigationButton
          onClick={goToPreviousPage}
          disabled={!canGoPrevious}
          ariaLabel={i18n.t('PreviousPage')}
          icon={<ChevronLeft />}
        />
        <span style={styles.pageInfo}>
          {i18n.t('PageXOfY', { current: currentPage, total: numPages })}
        </span>
        <NavigationButton
          onClick={goToNextPage}
          disabled={!canGoNext}
          ariaLabel={i18n.t('NextPage')}
          icon={<ChevronRight />}
        />
      </div>

      {/* PDF Canvas with PinchZoom */}
      <div style={styles.viewerContent}>
        <PinchZoom>
          <canvas ref={canvasRef} style={styles.canvas} />
        </PinchZoom>
      </div>
    </div>
  );
};

export default PDFDocumentPreview;
