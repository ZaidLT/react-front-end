'use client';

import React from 'react';
import { Colors } from '../../styles';
import PinchZoom from '../PinchZoom';

interface ImageDocumentPreviewProps {
  fileUrl: string;
  filename: string;
}

/**
 * ImageDocumentPreview - Specialized component for rendering image files
 *
 * Supports: JPG, JPEG, PNG, GIF, BMP, WEBP, SVG
 *
 * Features:
 * - Responsive image sizing (fills width, maintains aspect ratio)
 * - Pinch-to-zoom on mobile and desktop trackpads (1x-5x)
 * - Pan when zoomed in
 * - Max height constraint (70vh)
 * - Error handling with console logging
 * - Centered display
 *
 * @param fileUrl - URL to the image file
 * @param filename - Name of the file being displayed (used for alt text)
 */
const ImageDocumentPreview: React.FC<ImageDocumentPreviewProps> = ({
  fileUrl,
  filename
}) => {
  const handleImageError = () => {
    console.error('Image failed to load:', fileUrl);
  };

  const styles = {
    container: {
      width: '100%',
      maxWidth: '800px',
      maxHeight: '70vh',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    documentImage: {
      width: '100%',
      height: 'auto',
      maxHeight: '70vh',
      maxWidth: '100%',
      objectFit: 'contain' as const,
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      backgroundColor: Colors.WHITE,
      display: 'block',
    },
  };

  return (
    <div style={styles.container}>
      <PinchZoom>
        <img
          src={fileUrl}
          alt={filename}
          style={styles.documentImage}
          onError={handleImageError}
        />
      </PinchZoom>
    </div>
  );
};

export default ImageDocumentPreview;
