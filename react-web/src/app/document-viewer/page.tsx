'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomText from '../../components/CustomText';
import NavHeader from '../../components/NavHeader';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import { Colors, Typography } from '../../styles';
import { getFileById, deleteFile, updateFile, downloadFile } from '../../services/documentService';
import { IFile, IDocumentViewerParams } from '../../services/types';
import { useUserStore } from '../../context/store';
import FileTypeIcon from '../../components/FileTypeIcon';
import DocumentPreview from '../../components/DocumentPreview';
import { useLanguageContext } from '../../context/LanguageContext';

import { trackEvent, AmplitudeEvents } from '../../services/analytics';

import './document-viewer.css';

const DocumentViewerContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [document, setDocument] = useState<IFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const user = useUserStore((state) => state.user);
  const { i18n } = useLanguageContext();

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const fwdDoc = searchParams.get('fwdDoc');

        if (fwdDoc) {
          const docParams: IDocumentViewerParams = JSON.parse(decodeURIComponent(fwdDoc));

          // If we have a URL in the parameters, use it directly instead of making an API call
          if (docParams.url) {
            const mockDocument = {
              id: docParams.UniqueIdForFile,
              filename: docParams.FileName,
              fileUrl: docParams.url,
              // Add other required fields with defaults
              accountId: user?.Account_uniqueId || '',
              userId: user?.id || '',
              active: true,
              deleted: false,
              creationTimestamp: '',
              updateTimestamp: '',
              storageProviderId: '',
            };
            setDocument(mockDocument);
            setNewFileName(docParams.FileName || '');
            try { trackEvent(AmplitudeEvents.documentViewed, { fileId: docParams.UniqueIdForFile }); } catch {}

          } else if (user) {
            // Fallback to API call if no URL provided and user is available
            const fileData = await getFileById(docParams.UniqueIdForFile, user.Account_uniqueId);
            setDocument(fileData);
            setNewFileName(fileData.filename || fileData.Filename || '');
          } else {
            // Don't set loading to false yet, wait for user to be available
            return;
          }
        }
      } catch (error) {
        console.error('Error loading document:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [searchParams, user]);

  const handleRename = async () => {
    if (!document || !newFileName.trim()) {
      console.error('Missing document or filename');
      return;
    }

    // Get accountId and userId from multiple sources (same logic as handleDelete)
    let accountId = user?.Account_uniqueId || document.accountId;
    let userId = user?.UniqueId || document.userId;

    // If still no accountId, try to get from localStorage or JWT token
    if (!accountId && typeof window !== 'undefined') {
      // Try localStorage first
      accountId = localStorage.getItem('account_id') || undefined;

      // Try to extract from JWT token
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('JWT payload:', payload);

          // Extract accountId from user_metadata
          if (!accountId && payload.user_metadata?.accountId) {
            accountId = payload.user_metadata.accountId;
          }

          // Extract userId from user_metadata (not sub)
          if (!userId && payload.user_metadata?.userId) {
            userId = payload.user_metadata.userId;
          }

          console.log('Extracted from JWT - accountId:', accountId, 'userId:', userId);
        } catch (error) {
          console.error('Failed to decode JWT token:', error);
        }
      }
    }

    if (!accountId) {
      console.error('Missing accountId - cannot rename file');
      return;
    }

    if (!userId) {
      console.error('Missing userId - cannot rename file');
      return;
    }

    console.log(`Renaming file with accountId: ${accountId}, userId: ${userId}`);

    try {
      setIsRenaming(true);

      await updateFile(
        document.id,
        accountId,
        userId,
        {
          filename: newFileName.trim(),
          // Only include blacklistedFamily if it exists in the original document
          ...(document.blacklistedFamily ? { blacklistedFamily: document.blacklistedFamily } : {})
        }
      );

      console.log('✅ File renamed successfully');

      // Update the document state immediately with the new filename
      const updatedDocument = {
        ...document,
        filename: newFileName.trim(),
        Filename: newFileName.trim(), // Update both possible field names
      };

      setDocument(updatedDocument);
      setShowRenameModal(false);
      setIsRenaming(false);
    } catch (error) {
      console.error('Error renaming document:', error);
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!document) {
      console.error('Missing document');
      return;
    }

    // Get accountId and userId from multiple sources
    let accountId = user?.Account_uniqueId || document.accountId;
    let userId = user?.UniqueId || document.userId;

    // If still no accountId, try to get from localStorage or JWT token
    if (!accountId && typeof window !== 'undefined') {
      // Try localStorage first
      accountId = localStorage.getItem('account_id') || undefined;

      // Try to extract from JWT token
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));

          // Extract accountId from user_metadata
          if (!accountId && payload.user_metadata?.accountId) {
            accountId = payload.user_metadata.accountId;
          }

          // Extract userId from user_metadata (not sub)
          if (!userId && payload.user_metadata?.userId) {
            userId = payload.user_metadata.userId;
          }
        } catch (error) {
          console.error('Failed to decode JWT token:', error);
        }
      }
    }

    if (!accountId) {
      console.error('Missing accountId - cannot delete file');
      return;
    }

    try {
      setShowDeleteModal(false); // Close modal immediately
      await deleteFile(document.id, accountId, userId || '');
      router.back(); // Navigate back after deletion
    } catch (error: any) {
      console.error('Error deleting document:', error);

      // You could add toast notifications here for better UX
      let errorMessage = 'Failed to delete document';
      if (error.message === 'File not found') {
        errorMessage = 'Document not found';
      } else if (error.message === 'Internal server error') {
        errorMessage = 'Server error occurred while deleting document';
      }

      console.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (!document) return;

    const fileUrl = document.fileUrl || document.FileURL;
    const filename = document.filename || document.Filename;

    if (fileUrl) {
      downloadFile(fileUrl, filename);
    }
  };

  const handleShare = () => {
    if (!document) return;

    const fileUrl = document.fileUrl || document.FileURL;
    if (fileUrl && navigator.share) {
      navigator.share({
        title: document.filename || document.Filename,
        url: fileUrl,
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(fileUrl || '');
    }
  };

  if (isLoading) {
    return (
      <div className="document-viewer-container">
        <div
          style={{
            display: 'flex',
            padding: '20px',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            <img
              src="/icons/icon-menu-back.svg"
              width={24}
              height={24}
              alt={i18n.t('Back')}
              style={{ cursor: 'pointer' }}
            />
          </button>

          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CustomText
              style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '-0.408px',
              }}
            >
              {i18n.t('DocumentViewer')}
            </CustomText>
          </div>
        </div>
        <div className="document-viewer-loading">
          <CustomText>{i18n.t('LoadingDocument')}...</CustomText>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="document-viewer-container">
        <div
          style={{
            display: 'flex',
            padding: '20px',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            <img
              src="/icons/icon-menu-back.svg"
              width={24}
              height={24}
              alt={i18n.t('Back')}
              style={{ cursor: 'pointer' }}
            />
          </button>

          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CustomText
              style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '-0.408px',
              }}
            >
              {i18n.t('DocumentViewer')}
            </CustomText>
          </div>
        </div>
        <div className="document-viewer-error">
          <CustomText>{i18n.t('DocumentNotFound')}</CustomText>
        </div>
      </div>
    );
  }

  const fileUrl = document.fileUrl || document.FileURL;
  const filename = document.filename || document.Filename || 'Unknown';

  return (
    <div className="document-viewer-container">
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          padding: '20px',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <img
            src="/icons/icon-menu-back.svg"
            width={24}
            height={24}
            alt={i18n.t('Back')}
            style={{ cursor: 'pointer' }}
          />
        </button>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <CustomText
            style={{
              color: '#000E50',
              fontFamily: 'Poppins',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: 'normal',
              letterSpacing: '-0.408px',
            }}
          >
            {i18n.t('DocumentViewer')}
          </CustomText>
        </div>

        <button
          onClick={() => setShowOptionsModal(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
            marginLeft: 'auto',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="5" r="2" fill={Colors.BLUE} />
            <circle cx="12" cy="12" r="2" fill={Colors.BLUE} />
            <circle cx="12" cy="19" r="2" fill={Colors.BLUE} />
          </svg>
        </button>
      </div>

      {/* Document Content */}
      <div className="document-viewer-content">
        <div style={styles.documentHeader}>
          <div style={styles.titleRow}>
            <FileTypeIcon
              key={`fileicon-${document.id}-${filename}`}
              filename={filename}
              storageProviderId={document.storageProviderId}
              width={48}
              height={48}
            />
            <CustomText style={styles.documentTitle} key={`filename-${document.id}-${filename}`}>
              {filename}
            </CustomText>
          </div>
          <CustomText style={styles.documentSize}>
            {document.creationTimestamp ? new Date(document.creationTimestamp).toLocaleDateString() : ''}
          </CustomText>
        </div>

        {/* Document Preview */}
        <DocumentPreview
          fileUrl={fileUrl}
          filename={filename}
        />
      </div>

      {/* Options Modal */}
      <Modal
        isVisible={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        contentStyle={styles.optionsModalContent}
      >
        <div style={styles.optionsContainer}>
          <CustomText style={styles.optionsTitle}>{i18n.t('DocumentOptions')}</CustomText>
          
          <div style={styles.optionsList}>
            <button
              style={styles.optionButton}
              onClick={() => {
                setShowOptionsModal(false);
                setShowRenameModal(true);
              }}
            >
              <Icon name="edit-pen-paper" width={20} height={20} />
              <CustomText style={styles.optionText}>{i18n.t('Rename')}</CustomText>
            </button>

            <button
              style={styles.optionButton}
              onClick={() => {
                setShowOptionsModal(false);
                handleDownload();
              }}
            >
              <Icon name="ArrowDown" width={20} height={20} />
              <CustomText style={styles.optionText}>{i18n.t('Download')}</CustomText>
            </button>

            <button
              style={styles.optionButton}
              onClick={() => {
                setShowOptionsModal(false);
                handleShare();
              }}
            >
              <Icon name="share" width={20} height={20} />
              <CustomText style={styles.optionText}>{i18n.t('Share')}</CustomText>
            </button>

            <button
              style={styles.optionButton}
              onClick={() => {
                setShowOptionsModal(false);
                setShowDeleteModal(true);
              }}
            >
              <Icon name="bin" width={20} height={20} />
              <CustomText style={styles.optionText}>{i18n.t('Delete')}</CustomText>
            </button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal
        isVisible={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        contentStyle={styles.renameModalContent}
      >
        <div style={styles.renameContainer}>
          <CustomText style={styles.renameTitle}>{i18n.t('RenameDocument')}</CustomText>
          
          <input
            style={styles.renameInput}
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder={i18n.t('EnterNewName')}
          />

          <div style={styles.renameButtons}>
            <Button
              width="40%"
              textProps={{
                text: i18n.t('Cancel'),
                fontSize: Typography.FONT_SIZE_16,
                color: Colors.BLUE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              }}
              onButtonClick={() => setShowRenameModal(false)}
              backgroundColor={Colors.WHITE}
              borderProps={{
                width: 1,
                color: Colors.BLUE,
                radius: 8,
              }}
            />

            <Button
              width="40%"
              textProps={{
                text: isRenaming ? `${i18n.t('Saving')}...` : i18n.t('Save'),
                fontSize: Typography.FONT_SIZE_16,
                color: Colors.WHITE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              }}
              onButtonClick={handleRename}
              backgroundColor={isRenaming ? Colors.GREY_COLOR : Colors.BLUE}
              borderProps={{
                width: 1,
                color: isRenaming ? Colors.GREY_COLOR : Colors.BLUE,
                radius: 8,
              }}
              disabled={isRenaming}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        contentStyle={styles.deleteModalContent}
      >
        <div style={{...styles.deleteContainer, padding: '24px'}}>
          <CustomText style={{...styles.deleteTitle, marginBottom: '24px'}}>
            {i18n.t('DeleteDocument')}
          </CustomText>
          <CustomText style={{...styles.deleteSubtitle, marginBottom: '12px', display: 'block', textAlign: 'left'}}>
            {i18n.t('AreYouSureDeleteFile', { filename })}
          </CustomText>
          <CustomText style={{...styles.deleteMessage, marginBottom: '32px', display: 'block', textAlign: 'left'}}>
            {i18n.t('ThisActionCannotBeUndone')}
          </CustomText>

          <div style={styles.deleteButtons}>
            <Button
              width="40%"
              textProps={{
                text: i18n.t('Cancel'),
                fontSize: Typography.FONT_SIZE_16,
                color: Colors.BLUE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              }}
              onButtonClick={() => setShowDeleteModal(false)}
              backgroundColor={Colors.WHITE}
              borderProps={{
                width: 1,
                color: Colors.BLUE,
                radius: 8,
              }}
            />

            <Button
              width="40%"
              textProps={{
                text: i18n.t('Delete'),
                fontSize: Typography.FONT_SIZE_16,
                color: Colors.WHITE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              }}
              onButtonClick={handleDelete}
              backgroundColor={Colors.RED}
              borderProps={{
                width: 1,
                color: Colors.RED,
                radius: 8,
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  documentHeader: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '20px',
    backgroundColor: Colors.WHITE,
    borderBottom: `1px solid ${Colors.GREY_COLOR}`,
    position: 'relative' as const,
    zIndex: 10, // Ensure document header stays visible above zoomed preview
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center', // Now both icon container and text will be centered
    gap: '16px',
  },
  documentTitle: {
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    lineHeight: '1.2',
    margin: '0',
  },
  documentSize: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
  },
  optionsModalContent: {
    width: '90%',
    maxWidth: '400px',
    borderRadius: '12px',
    padding: '0',
  },
  optionsContainer: {
    padding: '20px',
  },
  optionsTitle: {
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  optionButton: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  optionText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.MIDNIGHT,
  },
  renameModalContent: {
    width: '90%',
    maxWidth: '400px',
    borderRadius: '12px',
    padding: '0',
  },
  renameContainer: {
    padding: '20px',
  },
  renameTitle: {
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  renameInput: {
    width: '100%',
    padding: '12px',
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    border: `1px solid ${Colors.GREY_COLOR}`,
    borderRadius: '8px',
    marginBottom: '20px',
    outline: 'none',
  },
  renameButtons: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    gap: '12px',
  },
  deleteModalContent: {
    width: '90%',
    maxWidth: '400px',
    borderRadius: '12px',
    padding: '0',
  },
  deleteContainer: {
    padding: '20px',
  },
  deleteTitle: {
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: 'center' as const,
    marginBottom: '12px',
  },
  deleteSubtitle: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.MIDNIGHT,
    textAlign: 'center' as const,
    marginBottom: '8px',
    lineHeight: '24px',
  },
  deleteMessage: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
    textAlign: 'center' as const,
    marginBottom: '32px',
    lineHeight: '20px',
  },
  deleteButtons: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    gap: '12px',
  },
};

const DocumentViewerPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocumentViewerContent />
    </Suspense>
  );
};

export default DocumentViewerPage;
