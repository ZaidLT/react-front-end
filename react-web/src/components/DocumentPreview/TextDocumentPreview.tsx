'use client';

import React, { useState, useEffect } from 'react';
import { Colors } from '../../styles';
import PinchZoom from '../PinchZoom';

interface TextDocumentPreviewProps {
  fileUrl: string;
  filename: string;
}

const MAX_LINES = 10000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * TextDocumentPreview - Specialized component for rendering text-based files
 *
 * Supports: TXT, CSV, MD, LOG
 *
 * Features:
 * - Fetches and displays plain text content
 * - Monospace font for code/log readability
 * - Pinch-to-zoom on mobile and desktop trackpads (1x-5x)
 * - Pan when zoomed in
 * - Handles large files (truncates after 10,000 lines)
 * - Error handling with retry option
 *
 * @param fileUrl - URL to the text file
 * @param filename - Name of the file being displayed
 */
const TextDocumentPreview: React.FC<TextDocumentPreviewProps> = ({
  fileUrl,
  filename
}) => {
  const [textContent, setTextContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    loadTextFile();
  }, [fileUrl]);

  const loadTextFile = async () => {
    setIsLoading(true);
    setError(null);
    setIsTruncated(false);

    try {
      // Use file proxy to avoid CORS issues
      const proxyUrl = `/api/file-proxy?url=${encodeURIComponent(fileUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
        setError(`File is too large (${(parseInt(contentLength) / 1024 / 1024).toFixed(2)}MB). Maximum supported size is 5MB.`);
        setIsLoading(false);
        return;
      }

      const text = await response.text();

      // Check if content is likely binary
      if (text.includes('\0')) {
        setError('This appears to be a binary file. Text preview is not available.');
        setIsLoading(false);
        return;
      }

      // Truncate if too many lines
      const lines = text.split('\n');
      if (lines.length > MAX_LINES) {
        setTextContent(lines.slice(0, MAX_LINES).join('\n'));
        setIsTruncated(true);
      } else {
        setTextContent(text);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load text file:', err);
      setError(err instanceof Error ? err.message : 'Failed to load file');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    loadTextFile();
  };

  const styles = {
    container: {
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
    },
    loadingContainer: {
      width: '100%',
      height: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.LIGHT_GREY,
      borderRadius: '8px',
      border: `1px solid ${Colors.GRAY}`,
    },
    errorContainer: {
      width: '100%',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      backgroundColor: Colors.LIGHT_GREY,
      borderRadius: '8px',
      border: `1px solid ${Colors.GRAY}`,
    },
    errorText: {
      textAlign: 'center' as const,
      color: Colors.GRAY,
      maxWidth: '400px',
    },
    retryButton: {
      padding: '8px 16px',
      backgroundColor: Colors.PRIMARY,
      color: Colors.WHITE,
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    warningBanner: {
      padding: '12px 16px',
      backgroundColor: '#fff3cd',
      border: '1px solid #ffc107',
      borderRadius: '4px',
      color: '#856404',
      fontSize: '14px',
    },
    textWrapper: {
      width: '100%',
      backgroundColor: Colors.WHITE,
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: `1px solid rgba(0, 0, 0, 0.1)`,
    },
    textContent: {
      margin: 0,
      padding: '20px',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: '13px',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap' as const,
      wordBreak: 'break-word' as const,
      color: '#333',
      backgroundColor: Colors.WHITE,
    },
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div>Loading {filename}...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorText}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
              Failed to load document
            </div>
            <div>{error}</div>
          </div>
          <button style={styles.retryButton} onClick={handleRetry}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {isTruncated && (
        <div style={styles.warningBanner}>
          File truncated: Showing first {MAX_LINES.toLocaleString()} lines only.
          The full file may be larger.
        </div>
      )}
      <div style={styles.textWrapper}>
        <PinchZoom>
          <pre style={styles.textContent}>{textContent}</pre>
        </PinchZoom>
      </div>
    </div>
  );
};

export default TextDocumentPreview;
