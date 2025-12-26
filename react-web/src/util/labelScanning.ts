/**
 * Label Scanning Utilities
 * 
 * Utilities for scanning product labels using OpenAI to extract structured information
 */

export interface LabelScanResult {
  brand: string | null;
  productName: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
}

export interface LabelScanResponse {
  success: boolean;
  data?: LabelScanResult;
  error?: string;
  details?: string;
  tokensUsed?: number;
}

/**
 * Convert a File object to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Scan a product label using OpenAI to extract structured information
 * 
 * @param imageFile - The image file containing the product label
 * @returns Promise with the extracted label information
 */
export const scanProductLabel = async (imageFile: File): Promise<LabelScanResponse> => {
  try {
    console.log('[Label Scan] Starting label scan for file:', imageFile.name);
    
    // Convert file to base64
    const imageData = await fileToBase64(imageFile);
    
    // Call our API endpoint
    const response = await fetch('/api/openai/label-scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: LabelScanResponse = await response.json();
    
    console.log('[Label Scan] Scan completed successfully:', result);
    return result;

  } catch (error) {
    console.error('[Label Scan] Error scanning label:', error);
    
    return {
      success: false,
      error: 'Failed to scan label',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Check if the scan result contains any useful data
 */
export const hasLabelData = (result: LabelScanResult): boolean => {
  return !!(result.brand || result.productName || result.modelNumber || result.serialNumber);
};

/**
 * Format label scan result for display
 */
export const formatLabelScanResult = (result: LabelScanResult): string => {
  const parts: string[] = [];
  
  if (result.brand) parts.push(`Brand: ${result.brand}`);
  if (result.productName) parts.push(`Product: ${result.productName}`);
  if (result.modelNumber) parts.push(`Model: ${result.modelNumber}`);
  if (result.serialNumber) parts.push(`Serial: ${result.serialNumber}`);
  
  return parts.length > 0 ? parts.join(', ') : 'No information extracted';
};
