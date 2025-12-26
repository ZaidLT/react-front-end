'use client';

import React from 'react';
import { Colors } from '../../styles';

interface FallbackDocumentPreviewProps {
  fileUrl: string;
  filename: string;
}

/**
 * FallbackDocumentPreview - Fallback component for rendering unsupported document types
 *
 * Uses iframe for documents that aren't PDFs or images (e.g., DOCX, XLSX, etc.)
 *
 * Features:
 * - Iframe rendering for browser-supported formats
 * - Responsive sizing (60vh default, 70vh max)
 * - Clean styling with rounded corners and shadow
 *
 * @param fileUrl - URL to the document file
 * @param filename - Name of the file being displayed (used for iframe title)
 */
const FallbackDocumentPreview: React.FC<FallbackDocumentPreviewProps> = ({
  fileUrl,
  filename
}) => {
  const styles = {
    documentFrame: {
      width: '100%',
      height: '60vh',
      minHeight: '300px',
      maxHeight: '70vh',
      border: 'none',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: Colors.WHITE,
    },
  };

  return (
    <iframe
      src={fileUrl}
      style={styles.documentFrame}
      title={filename}
    />
  );
};

export default FallbackDocumentPreview;
