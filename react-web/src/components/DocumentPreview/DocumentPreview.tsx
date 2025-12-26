'use client';

import React from 'react';
import { Colors } from '../../styles';
import PDFDocumentPreview from './PDFDocumentPreview';
import ImageDocumentPreview from './ImageDocumentPreview';
import TextDocumentPreview from './TextDocumentPreview';
import FallbackDocumentPreview from './FallbackDocumentPreview';

interface DocumentPreviewProps {
  fileUrl?: string;
  filename: string;
}

/**
 * DocumentPreview - Orchestrator component for rendering document previews
 *
 * This component acts as a facade/router that:
 * 1. Detects the file type based on URL extension
 * 2. Delegates rendering to the appropriate specialized component
 * 3. Handles error states when fileUrl is missing
 *
 * Supported file types:
 * - PDFs: Rendered using PDFDocumentPreview (canvas-based with page navigation)
 * - Images: Rendered using ImageDocumentPreview (JPG, PNG, GIF, etc.)
 * - Text: Rendered using TextDocumentPreview (TXT, CSV, MD, LOG)
 * - Other: Rendered using FallbackDocumentPreview (iframe for DOCX, etc.)
 *
 * @param fileUrl - URL to the document file (optional)
 * @param filename - Name of the file being displayed
 */
const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  fileUrl,
  filename
}) => {
  // File type detection logic
  const isImage = fileUrl && /\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?.*)?$/i.test(fileUrl);
  const isPDF = fileUrl && /\.pdf(\?.*)?$/i.test(fileUrl);
  const isText = fileUrl && /\.(txt|csv|md|log)(\?.*)?$/i.test(fileUrl);

  const styles = {
    documentPreview: {
      flex: 1,
      padding: '20px',
      backgroundColor: Colors.WHITE,
    },
    documentError: {
      width: '100%',
      height: '600px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.LIGHT_GREY,
      borderRadius: '8px',
      border: `1px solid ${Colors.GRAY}`,
    },
  };

  return (
    <div style={styles.documentPreview}>
      {fileUrl ? (
        isPDF ? (
          <PDFDocumentPreview fileUrl={fileUrl} filename={filename} />
        ) : isImage ? (
          <ImageDocumentPreview fileUrl={fileUrl} filename={filename} />
        ) : isText ? (
          <TextDocumentPreview fileUrl={fileUrl} filename={filename} />
        ) : (
          <FallbackDocumentPreview fileUrl={fileUrl} filename={filename} />
        )
      ) : (
        <div style={styles.documentError}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '8px' }}>Document preview not available</div>
            <div style={{ fontSize: '14px', color: Colors.GRAY }}>
              The document file URL could not be loaded. Please try refreshing the page or contact support if the issue persists.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentPreview;
