import { IFile, IDocument, IDocumentUploadRequest, FileType, IFileTypeInfo } from './types';

// Re-export types for convenience
export type { FileType, IFileTypeInfo } from './types';
import axios from 'axios';
import { trackEvent, AmplitudeEvents } from './analytics';

// Base URL for API - use Next.js API route to proxy requests
const API_BASE_URL = '/api';

// Headers for API requests
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Headers for file upload requests
const getFileUploadHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    // Don't set Content-Type for FormData, let the browser set it with boundary
  };
};

/**
 * Helper function to map API file response to frontend format
 * Maps backend field names to frontend field names for compatibility
 */
const mapFileResponse = (files: any[]): IFile[] => {
  console.log(`Mapping ${files.length} files from API response`);

  return files.map((file: any) => ({
    ...file,
    // Map backend fields to frontend compatibility fields
    UniqueId: file.id,
    Account_uniqueId: file.accountId,
    User_uniqueId: file.userId,
    Filename: file.filename,
    StorageProviderUniqueId: file.storageProviderId,
    FileURL: file.fileUrl,
    Active: file.active,
    Deleted: file.deleted,
    CreationTimestamp: file.creationTimestamp,
    UpdateTimestamp: file.updateTimestamp,
    BlackListed_Family: file.blacklistedFamily || [],
  }));
};

/**
 * Get file type from filename, mime type, or storageProviderId
 */
export const getFileType = (filename: string, mimeType?: string, storageProviderId?: string): FileType => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.startsWith('video/')) return 'video';
  if (mimeType?.startsWith('audio/')) return 'audio';

  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'doc':
      return 'doc';
    case 'docx':
      return 'docx';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return 'image';
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
      return 'video';
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return 'audio';
    default:
      // If no extension found, try to extract from storageProviderId as backup
      if (!extension && storageProviderId) {
        const storageExtension = storageProviderId.split('.').pop()?.toLowerCase() || '';
        if (storageExtension) {
          // Recursively call with the extracted extension as filename
          return getFileType(`file.${storageExtension}`, mimeType);
        }
      }
      return 'other';
  }
};

/**
 * Get file type information including icon and color
 */
export const getFileTypeInfo = (fileType: FileType): IFileTypeInfo => {
  const fileTypeMap: Record<FileType, IFileTypeInfo> = {
    pdf: {
      type: 'pdf',
      icon: 'adobe',
      color: '#FF0000',
      extensions: ['pdf']
    },
    doc: {
      type: 'doc',
      icon: 'doc',
      color: '#2B579A',
      extensions: ['doc']
    },
    docx: {
      type: 'docx',
      icon: 'doc',
      color: '#2B579A',
      extensions: ['docx']
    },
    image: {
      type: 'image',
      icon: 'image',
      color: '#4CAF50',
      extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
    },
    video: {
      type: 'video',
      icon: 'video',
      color: '#FF9800',
      extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv']
    },
    audio: {
      type: 'audio',
      icon: 'audio',
      color: '#9C27B0',
      extensions: ['mp3', 'wav', 'flac', 'aac']
    },
    other: {
      type: 'other',
      icon: 'document',
      color: '#757575',
      extensions: []
    }
  };

  return fileTypeMap[fileType];
};

/**
 * Upload a document file
 */
export const uploadDocument = async (uploadRequest: IDocumentUploadRequest): Promise<IFile> => {
  console.log('Uploading document:', uploadRequest.filename);

  try {
    const formData = new FormData();
    formData.append('accountId', uploadRequest.accountId);
    formData.append('userId', uploadRequest.userId);
    formData.append('filename', uploadRequest.filename);
    formData.append('file', uploadRequest.file);

    if (uploadRequest.description) {
      formData.append('description', uploadRequest.description);
    }

    if (uploadRequest.blacklistedFamily) {
      formData.append('blacklistedFamily', JSON.stringify(uploadRequest.blacklistedFamily));
    }

    const response = await axios.post(`${API_BASE_URL}/files`, formData, {
      headers: getFileUploadHeaders(),
    });

    console.log('✅ Document upload successful');
    try { trackEvent(AmplitudeEvents.documentUploaded, { fileId: response.data?.id, filename: uploadRequest.filename, accountId: uploadRequest.accountId, userId: uploadRequest.userId }); } catch {}
    return response.data;
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    throw error;
  }
};

/**
 * Get all files for a user
 */
export const getFilesByUser = async (userId: string, accountId: string): Promise<IFile[]> => {
  console.log(`Fetching files for user: ${userId}`);

  try {
    const response = await axios.get(`${API_BASE_URL}/files/user/${userId}`, {
      params: { accountId },
      headers: getHeaders(),
    });

    const files = mapFileResponse(response.data.files || response.data || []);
    console.log(`✅ Retrieved ${files.length} files for user`);
    return files;
  } catch (error) {
    console.error('❌ Error fetching files by user:', error);
    throw error;
  }
};

/**
 * Get all files for an account
 */
export const getFilesByAccount = async (accountId: string, userId?: string): Promise<IFile[]> => {
  console.log('[LIFE_TAB_DEBUG] 🌐 API CALL: GET /files/account/' + accountId);
  console.log(`Fetching files for account: ${accountId}, userId: ${userId}`);

  try {
    // Build URL with userId parameter if provided
    let url = `${API_BASE_URL}/files/account/${accountId}`;
    if (userId) {
      url += `?userId=${encodeURIComponent(userId)}`;
    }

    const response = await axios.get(url, {
      headers: getHeaders(),
    });

    console.log('[LIFE_TAB_DEBUG] ✅ API RESPONSE: GET /files/account/' + accountId + ' - Success');
    const files = mapFileResponse(response.data.files || response.data || []);
    console.log(`✅ Retrieved ${files.length} files for account`);
    return files;
  } catch (error) {
    console.error('❌ Error fetching files by account:', error);
    throw error;
  }
};

/**
 * Get a specific file by ID
 */
export const getFileById = async (fileId: string, accountId: string): Promise<IFile> => {
  console.log(`Fetching file: ${fileId}`);

  try {
    const response = await axios.get(`${API_BASE_URL}/files/${fileId}`, {
      params: { accountId },
      headers: getHeaders(),
    });

    console.log('✅ File retrieved successfully');
    try { trackEvent(AmplitudeEvents.documentViewed, { fileId, accountId }); } catch {}
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching file:', error);
    throw error;
  }
};

/**
 * Update file metadata (rename, etc.)
 */
export const updateFile = async (
  fileId: string,
  accountId: string,
  userId: string,
  updates: { filename?: string; active?: boolean; deleted?: boolean; blacklistedFamily?: string[] }
): Promise<IFile> => {
  console.log(`Updating file: ${fileId}`);

  try {
    // Build the payload according to the API spec
    const payload: any = {
      accountId,
      userId,
      active: true,
      deleted: false,
      ...updates, // This will override the defaults if provided
    };

    // Only include blacklistedFamily if it was provided in updates
    if (updates.blacklistedFamily !== undefined) {
      payload.blacklistedFamily = updates.blacklistedFamily;
    }

    console.log('Update payload:', payload);

    const response = await axios.put(`${API_BASE_URL}/files/${fileId}`, payload, {
      headers: getHeaders(),
    });

    console.log('✅ File updated successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error updating file:', error);
    throw error;
  }
};

/**
 * Delete a file
 */
export const deleteFile = async (fileId: string, accountId: string, userId: string): Promise<void> => {
  console.log(`Deleting file: ${fileId}`);

  try {
    const response = await axios.delete(`${API_BASE_URL}/files/${fileId}`, {
      params: { accountId },
      headers: getHeaders(),
    });

    if (response.status === 200) {
      console.log('✅ File deleted successfully');
      try { trackEvent(AmplitudeEvents.documentDeleted, { fileId, accountId, userId }); } catch {}
    }
  } catch (error: any) {
    console.error('❌ Error deleting file:', error);

    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('File not found');
    } else if (error.response?.status === 500) {
      throw new Error('Internal server error');
    } else {
      throw new Error('Failed to delete file');
    }
  }
};

/**
 * Download a file (opens in new tab)
 */
export const downloadFile = (fileUrl: string, filename?: string): void => {
  try {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    if (filename) {
      link.download = filename;
    }
    try { trackEvent(AmplitudeEvents.documentViewed, { fileUrl, filename }); } catch {}

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('✅ File download initiated');
  } catch (error) {
    console.error('❌ Error downloading file:', error);
    throw error;
  }
};

/**
 * Convert IFile to IDocument format for compatibility
 */
export const fileToDocument = (file: IFile): IDocument => {
  return {
    ...file,
    type: "Document",
    mimeType: undefined, // Will be determined by file extension
    fileSize: undefined,
    UniqueIdForFile: file.id || file.UniqueId,
    HomeMember_UniqueId: file.userId || file.User_uniqueId,
    FileName: file.filename || file.Filename,
    url: file.fileUrl || file.FileURL,
  };
};
