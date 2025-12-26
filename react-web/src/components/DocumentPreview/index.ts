/**
 * DocumentPreview Module
 *
 * This module exports only the DocumentPreview orchestrator component.
 * Individual preview components (PDF, Image, Text, Fallback) are internal
 * implementation details and are not exposed to consumers.
 *
 * File structure:
 * - DocumentPreview.tsx: Orchestrator component (file type detection & routing)
 * - PDFDocumentPreview.tsx: PDF rendering with canvas and page navigation
 * - ImageDocumentPreview.tsx: Image rendering with pinch zoom
 * - TextDocumentPreview.tsx: Text file rendering (TXT, CSV, MD, LOG)
 * - FallbackDocumentPreview.tsx: Iframe fallback for other document types
 *
 * Usage:
 * import DocumentPreview from '../components/DocumentPreview';
 *
 * <DocumentPreview fileUrl="..." filename="..." />
 */

export { default } from './DocumentPreview';
