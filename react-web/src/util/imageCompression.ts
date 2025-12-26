/**
 * Image Compression Utilities
 * 
 * Utilities for compressing images before upload to reduce file size
 * and prevent "413 Request Entity Too Large" errors
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

/**
 * Compress an image file to reduce its size
 * 
 * @param file - The original image file
 * @param options - Compression options
 * @returns Promise<File> - The compressed image file
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 2048, // 2MB max
  } = options;

  return new Promise((resolve, reject) => {
    // Check if file is already small enough
    if (file.size <= maxSizeKB * 1024) {
      console.log(`[Image Compression] File already small enough: ${(file.size / 1024).toFixed(2)}KB`);
      resolve(file);
      return;
    }

    console.log(`[Image Compression] Compressing file: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
          } else {
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress the image
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels to get under the size limit
          let currentQuality = quality;
          let attempts = 0;
          const maxAttempts = 5;
          
          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'));
                  return;
                }

                const compressedSizeKB = blob.size / 1024;
                console.log(`[Image Compression] Attempt ${attempts + 1}: ${compressedSizeKB.toFixed(2)}KB at quality ${currentQuality}`);

                // If size is acceptable or we've tried enough times, use this version
                if (compressedSizeKB <= maxSizeKB || attempts >= maxAttempts) {
                  const compressedFile = new File([blob], file.name, {
                    type: blob.type,
                    lastModified: Date.now(),
                  });

                  console.log(`[Image Compression] Final size: ${compressedSizeKB.toFixed(2)}KB (${((1 - blob.size / file.size) * 100).toFixed(1)}% reduction)`);
                  resolve(compressedFile);
                } else {
                  // Try with lower quality
                  attempts++;
                  currentQuality = Math.max(0.1, currentQuality - 0.15);
                  tryCompress();
                }
              },
              file.type.startsWith('image/png') ? 'image/jpeg' : file.type, // Convert PNG to JPEG for better compression
              currentQuality
            );
          };

          tryCompress();
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Check if a file needs compression
 * 
 * @param file - The file to check
 * @param maxSizeKB - Maximum size in KB (default: 2MB)
 * @returns boolean - True if file needs compression
 */
export const needsCompression = (file: File, maxSizeKB: number = 2048): boolean => {
  return file.size > maxSizeKB * 1024;
};

/**
 * Get human-readable file size
 * 
 * @param bytes - File size in bytes
 * @returns string - Formatted file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Compress image with progress callback
 * 
 * @param file - The original image file
 * @param options - Compression options
 * @param onProgress - Progress callback function
 * @returns Promise<File> - The compressed image file
 */
export const compressImageWithProgress = async (
  file: File,
  options: CompressionOptions = {},
  onProgress?: (progress: number) => void
): Promise<File> => {
  if (onProgress) onProgress(0);
  
  try {
    const compressedFile = await compressImage(file, options);
    if (onProgress) onProgress(100);
    return compressedFile;
  } catch (error) {
    if (onProgress) onProgress(0);
    throw error;
  }
};
