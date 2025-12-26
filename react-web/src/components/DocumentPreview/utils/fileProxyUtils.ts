import { DOCUMENT_PREVIEW_CONSTANTS } from '../constants';

/**
 * Creates a proxied URL to bypass CORS restrictions
 *
 * @param fileUrl - The original file URL to proxy
 * @returns Proxied URL that routes through the file proxy API
 *
 * @example
 * const proxiedUrl = createProxyUrl('https://storage.googleapis.com/bucket/file.pdf');
 * // Returns: '/api/file-proxy?url=https%3A%2F%2Fstorage.googleapis.com%2Fbucket%2Ffile.pdf'
 */
export const createProxyUrl = (fileUrl: string): string => {
  return `${DOCUMENT_PREVIEW_CONSTANTS.FILE_PROXY_PATH}?url=${encodeURIComponent(fileUrl)}`;
};
