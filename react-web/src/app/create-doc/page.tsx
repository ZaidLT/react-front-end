'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomText from '../../components/CustomText';

import Button from '../../components/Button';

import { Colors, Typography } from '../../styles';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import HiveSelectionModal from '../../components/HiveSelectionModal';
import FamilyMemberSelectionModal from '../../components/FamilyMemberSelectionModal';
import { FamilyMember } from '../../services/familyService';

import './create-doc.css';

import { trackEvent, AmplitudeEvents } from '../../services/analytics';

// Add placeholder styles
const placeholderStyles = `
  .file-input::placeholder,
  .description-input::placeholder {
    color: #AAB5E5 !important;
    text-align: left;
    font-family: Poppins;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 19px;
    letter-spacing: -0.084px;
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = placeholderStyles;
  document.head.appendChild(styleElement);
}

const CreateDocPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { i18n } = useLanguageContext();

  // Robust param getter: prefer Next's searchParams; fall back to window.location
  const getParam = React.useCallback(
    (key: string): string | null => {
      try {
        const v = searchParams.get(key);
        if (v) return v;
      } catch {}
      try {
        const url =
          typeof window !== 'undefined' ? new URL(window.location.href) : null;
        return url ? url.searchParams.get(key) : null;
      } catch {}
      return null;
    },
    [searchParams]
  );

  // Debug URL parameters on page load
  React.useEffect(() => {
    const homeMemberIdParam = getParam('homeMemberId');
    const tileIdParam = getParam('tileId');
    const contactIdParam = getParam('contactId');
    const delegateUserIdParam = getParam('delegateUserId');

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('PAGE LOAD DEBUG - URL PARAMS:', {
        homeMemberIdParam,
        tileIdParam,
        contactIdParam,
        delegateUserIdParam,
        allParams: Object.fromEntries(searchParams.entries()),
        url: window.location.href,
      });
    }
  }, [searchParams, getParam]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const [priority, setPriority] = useState<number>(0);
  const [selectedHive, setSelectedHive] = useState<any>(null);
  const [selectedHives, setSelectedHives] = useState<any[]>([]);
  const [showHiveSelectionModal, setShowHiveSelectionModal] = useState<boolean>(false);
  // Single-select assignee for documents
  const [selectedAssignee, setSelectedAssignee] = useState<FamilyMember | null>(null);
  const [showAssigneeModal, setShowAssigneeModal] = useState<boolean>(false);

  const handleFileUpload = async () => {
    try {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip';
      input.multiple = false;

      // Set up the change event handler
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          const file = target.files[0];
          setSelectedFile(file);
          setFileName(file.name); // Set default filename
        }
      };

      // Trigger the file selection dialog
      input.click();
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  };

  // No need for base64 conversion - backend handles multipart/form-data directly

  const handleUpload = async () => {
    if (!selectedFile || !user || !fileName.trim()) {
      console.error('Missing required data for upload');
      alert(
        'Please make sure you have selected a file and entered a filename.'
      );
      return;
    }

    setIsUploading(true);
    try {
      // Validate required user data
      if (!user.accountId || !user.id) {
        throw new Error('User account information is missing');
      }

      // Get attribution parameters from URL
      const homeMemberIdParam = getParam('homeMemberId');
      const tileIdParam = getParam('tileId');
      const contactIdParam = getParam('contactId');
      const delegateUserIdParam = getParam('delegateUserId');

      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('ATTRIBUTION DEBUG - RAW PARAMS:', {
          homeMemberIdParam,
          tileIdParam,
          contactIdParam,
          delegateUserIdParam,
          allParams: Object.fromEntries(searchParams.entries()),
          url: window.location.href,
        });
      }

      // Determine effective tileId (if any)
      const effectiveTileId = tileIdParam || (selectedHive?.UniqueId ?? undefined);
      let associationType: 'user' | 'contact' | 'tile' | undefined;
      let associationId: string | undefined;

      // Build homeMembers array and single-select assignee mapping
      const homeMembers: string[] = [user.id];
      if (homeMemberIdParam && !homeMembers.includes(homeMemberIdParam)) {
        homeMembers.push(homeMemberIdParam);
      }

      // Derive delegateUserId from selectedAssignee when not self
      const effectiveDelegateUserId = selectedAssignee && selectedAssignee.id !== user.id
        ? selectedAssignee.id
        : (delegateUserIdParam || undefined);

      // Determine associationType override rules for files
      const hadDelegateInitially = Boolean(delegateUserIdParam);
      const isClearingDelegate = !effectiveDelegateUserId && hadDelegateInitially;

      if (effectiveDelegateUserId || isClearingDelegate) {
        associationType = 'user';
        associationId = user.id;
      } else if (effectiveTileId) {
        associationType = 'tile';
        associationId = effectiveTileId;
      } else if (contactIdParam) {
        associationType = 'contact';
        associationId = contactIdParam;
      }


      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append('accountId', user.accountId);
      formData.append('userId', user.id);
      formData.append('filename', fileName.trim());
      formData.append('file', selectedFile); // Direct file object
      if (description && description.trim().length > 0) {
        formData.append('description', description.trim());
      }

      // Add attribution fields
      if (effectiveTileId) {
        formData.append('tileId', effectiveTileId);
      }

      if (contactIdParam) {
        formData.append('contactId', contactIdParam);
      }

      // Add delegateUserId for My Hive (use single-select assignee when not self)
      if (!contactIdParam) {
        if (effectiveDelegateUserId) {
          formData.append('delegateUserId', effectiveDelegateUserId);
        } else if (isClearingDelegate) {
          // Explicitly clear prior delegate when removed
          formData.append('delegateUserId', 'null');
        }
      }

      // For backend convenience, also include associationType/associationId like backend sample
      if (associationType && associationId) {
        formData.append('associationType', associationType);
        formData.append('associationId', associationId);
      }

      if (homeMembers.length > 0) {
        formData.append('homeMembers', JSON.stringify(homeMembers));
      }

      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('FORMDATA DEBUG - WHAT WE ARE SENDING:', {
          tileIdParam,
          effectiveTileIdFromSelection: selectedHive?.UniqueId,
          resolvedEffectiveTileId: effectiveTileId,
          contactIdParam,
          homeMemberIdParam,
          delegateUserIdParam,
          associationType,
          associationId,
          selectedHive,
          homeMembers,
          formDataEntries: Array.from(formData.entries()),
        });
      }

      // Call the API with FormData (no Content-Type header - browser sets it automatically)
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData, // FormData automatically sets multipart/form-data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Upload failed: ${errorData.error || response.statusText}`
        );
      }

      const result = await response.json();
      console.log('✅ Upload successful:', result);

      // Log specific file URL information
      console.log('📄 Document API Response Details:');
      console.log('- Response status:', response.status);
      console.log(
        '- Response headers:',
        Object.fromEntries(response.headers.entries())
      );
      console.log('- Full response body:', JSON.stringify(result, null, 2));

      // Check for file URL in response (nested in file object)
      const fileData = result.file || result;
      if (fileData.fileUrl || fileData.file_url || fileData.url) {
        console.log('🔗 File URL found in response:');
        console.log('- fileUrl:', fileData.fileUrl);
        console.log('- file_url:', fileData.file_url);
        console.log('- url:', fileData.url);
        console.log('- storageProviderId:', fileData.storageProviderId);
      } else {


        console.log(
          '⚠️ No file URL found in response. Available keys:',
          Object.keys(result)
        );
        if (result.file) {
          console.log('⚠️ File object keys:', Object.keys(result.file));
        }
      }

      // Temporary verification: fetch the file by ID immediately after upload
      try {
        const confirmId = (result.file && result.file.id) || result.id;
        if (confirmId) {
          const confirmResp = await fetch(
            `/api/files/${confirmId}?accountId=${user.accountId}`,
            {
              method: 'GET',
              headers: {

                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
            }
          );
          const confirmJson = await confirmResp.json();
          console.log(
            '🧪 Post-upload verification GET /api/files/:id response:',
            confirmJson
          );
        } else {
          console.log(
            '🧪 Post-upload verification skipped: no file id in response'
          );
        }
      } catch (e) {
        console.log('🧪 Post-upload verification error:', e);
      }


      // Track document upload success in Amplitude
      try {
        const createdId = (result?.file?.id) || result?.id || fileData?.id;
        trackEvent(AmplitudeEvents.documentUploaded, {
          fileId: createdId,
          filename: (fileName || '').trim() || (file?.name || ''),
          accountId: user?.accountId || user?.Account_uniqueId,
          userId: user?.id || user?.UniqueId,
        });
      } catch {}

      // Navigate back to life page
      router.push('/life');
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert(
        `Upload failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {

      setIsUploading(false);
    }
  };

  // Handle hive selection from modal (single-select only)
  const handleHiveSelection = (selectedHives: any[], selectedHive?: any) => {
    // For single-select, use the selectedHive parameter
    if (selectedHive) {
      setSelectedHive(selectedHive);
      setSelectedHives([selectedHive]); // Keep array for compatibility but only one item
    } else if (selectedHives.length > 0) {
      const tile = selectedHives[0];
      setSelectedHive(tile);
      setSelectedHives([tile]); // Only keep the first/latest selection
    } else {
      setSelectedHive(null);
      setSelectedHives([]);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: Colors.WHITE,
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          width: '100%',
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
            src='/icons/icon-menu-back.svg'
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
            {i18n.t('CreateDocument')}
          </CustomText>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: '24px',
          marginRight: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            alignSelf: 'stretch',
            flexDirection: 'column',
            marginTop: '0px',
          }}
        >
          {/* Add a file header - left justified */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'flex-start',
            }}
          >
            <CustomText
              style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '15px',
                marginBottom: '0px',
              }}
            >
              {i18n.t('AddAFile')}
            </CustomText>
          </div>

          {/* Three upload options */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              alignSelf: 'stretch',
            }}
          >
            {/* Files option */}
            <div
              onClick={handleFileUpload}
              style={{
                display: 'flex',
                padding: '12px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                flex: '1 0 0',
                borderRadius: '12px',
                border: '1px dashed #C3B7FF',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  padding: '8px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    borderRadius: '100px',
                    background: '#EAEDF8',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                  >
                    <path
                      d='M17.4776 9.01106C17.485 9.01102 17.4925 9.01101 17.5 9.01101C19.9853 9.01101 22 11.0294 22 13.5193C22 15.8398 20.25 17.7508 18 18M17.4776 9.01106C17.4924 8.84606 17.5 8.67896 17.5 8.51009C17.5 5.46695 15.0376 3 12 3C9.12324 3 6.76233 5.21267 6.52042 8.03192M17.4776 9.01106C17.3753 10.1476 16.9286 11.1846 16.2428 12.0165M6.52042 8.03192C3.98398 8.27373 2 10.4139 2 13.0183C2 15.4417 3.71776 17.4632 6 17.9273M6.52042 8.03192C6.67826 8.01687 6.83823 8.00917 7 8.00917C8.12582 8.00917 9.16474 8.38194 10.0005 9.01101'
                      stroke='#2A46BE'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M9.5 16L12 13.5L14.5 16M12 21V14.1088'
                      stroke='#2A46BE'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <CustomText
                  style={{
                    color: '#2A46BE',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '15px',
                  }}
                >
                  {i18n.t('Files')}
                </CustomText>
              </div>
            </div>

            {/* Camera option */}
            <div
              onClick={handleFileUpload}
              style={{
                display: 'flex',
                padding: '12px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                flex: '1 0 0',
                borderRadius: '12px',
                border: '1px dashed #C3B7FF',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  padding: '8px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    borderRadius: '100px',
                    background: '#EAEDF8',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                  >
                    <path
                      d='M15.5029 14C15.5029 15.933 13.9353 17.5 12.0015 17.5C10.0677 17.5 8.5 15.933 8.5 14C8.5 12.067 10.0677 10.5 12.0015 10.5C13.9353 10.5 15.5029 12.067 15.5029 14Z'
                      stroke='#2A46BE'
                      strokeWidth='1.5'
                    />
                    <path
                      d='M7.5 6H4C2.89543 6 2 6.89543 2 8V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V8C22 6.89543 21.1046 6 20 6H16.5'
                      stroke='#2A46BE'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M17 7.5L15.7279 3.68377C15.5918 3.27543 15.2097 3 14.7792 3H9.22076C8.79033 3 8.40819 3.27543 8.27208 3.68377L7 7.5'
                      stroke='#2A46BE'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                    />
                  </svg>
                </div>
                <CustomText
                  style={{
                    color: '#2A46BE',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '15px',
                  }}
                >
                  {i18n.t('Camera')}
                </CustomText>
              </div>
            </div>

            {/* Album option */}
            <div
              onClick={handleFileUpload}
              style={{
                display: 'flex',
                padding: '12px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                flex: '1 0 0',
                borderRadius: '12px',
                border: '1px dashed #C3B7FF',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  padding: '8px',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    borderRadius: '100px',
                    background: '#EAEDF8',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                  >
                    <path
                      d='M21.5 19.5V4.5C21.5 3.39543 20.6046 2.5 19.5 2.5H4.5C3.39543 2.5 2.5 3.39543 2.5 4.5V19.5C2.5 20.6046 3.39543 21.5 4.5 21.5H19.5C20.6046 21.5 21.5 20.6046 21.5 19.5Z'
                      stroke='#2A46BE'
                      strokeWidth='1.5'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M16 9.5C16.8284 9.5 17.5 8.82843 17.5 8C17.5 7.17157 16.8284 6.5 16 6.5C15.1716 6.5 14.5 7.17157 14.5 8C14.5 8.82843 15.1716 9.5 16 9.5Z'
                      stroke='#2A46BE'
                      strokeWidth='1.5'
                    />
                    <path
                      d='M15 21.5C14.5 19 13.0934 16.7821 11.1937 15.3341C8.84967 13.5474 6 13 2.5 13'
                      stroke='#2A46BE'
                      strokeWidth='1.5'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M13.5 18C15.1014 16.6733 16.8266 15.9928 18.5694 16.0001C19.5576 15.999 20.5412 16.2216 21.5 16.6617'
                      stroke='#2A46BE'
                      strokeWidth='1.5'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <CustomText
                  style={{
                    color: '#2A46BE',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '15px',
                  }}
                >
                  {i18n.t('Album')}
                </CustomText>
              </div>
            </div>
          </div>

          {/* File chip when file is selected */}
          {selectedFile && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  padding: '8px 8px 8px 12px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  borderRadius: '39px',
                  background: '#2A46BE',
                  marginTop: '16px',
                }}
              >
                <CustomText
                  style={{
                    color: '#FFF',
                    textAlign: 'center',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '15px',
                  }}
                >
                  {fileName || selectedFile.name}
                </CustomText>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFileName('');
                    setDescription('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='17'
                    viewBox='0 0 16 17'
                    fill='none'
                  >
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M8.00004 15.6668C4.042 15.6668 0.833374 12.4582 0.833374 8.50016C0.833374 4.54212 4.042 1.3335 8.00004 1.3335C11.9581 1.3335 15.1667 4.54212 15.1667 8.50016C15.1667 12.4582 11.9581 15.6668 8.00004 15.6668ZM10.4714 6.97158C10.7318 6.71124 10.7318 6.28913 10.4714 6.02878C10.2111 5.76842 9.78904 5.7684 9.52864 6.02874L7.99991 7.55736L6.47143 6.029C6.21107 5.76866 5.78896 5.76868 5.52862 6.02904C5.26828 6.2894 5.26829 6.7115 5.52865 6.97184L7.05704 8.50016L5.52865 10.0285C5.26829 10.2888 5.26828 10.711 5.52862 10.9713C5.78896 11.2316 6.21107 11.2316 6.47143 10.9713L7.99991 9.44296L9.52864 10.9716C9.78904 11.2319 10.2111 11.2319 10.4714 10.9716C10.7318 10.7112 10.7318 10.2891 10.4714 10.0288L8.94277 8.50016L10.4714 6.97158Z'
                      fill='white'
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* File info section - always visible */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '8px',
            alignSelf: 'stretch',
            marginTop: '24px',
          }}
        >
          {/* File name section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '8px',
              alignSelf: 'stretch',
            }}
          >
            <CustomText
              style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '15px',
              }}
            >
              {i18n.t('FileName')}
            </CustomText>
            <input
              type='text'
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder={i18n.t("EnterFileName")}
              className='file-input'
              style={{
                display: 'flex',
                height: '40px',
                padding: '12px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: '10px',
                alignSelf: 'stretch',
                borderRadius: '12px',
                background: '#F7F9FF',
                border: 'none',
                outline: 'none',
                color: '#2A46BE',
                textAlign: 'left',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '100%',
                letterSpacing: '-0.408px',
              }}
            />
          </div>

          {/* Description section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '8px',
              alignSelf: 'stretch',
            }}
          >
            <CustomText
              style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '12px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '15px',
              }}
            >
              {i18n.t('Description')}
            </CustomText>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={i18n.t("EnterDescription")}
              className='description-input'
              style={{
                display: 'flex',
                height: '80px',
                padding: '12px',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '10px',
                alignSelf: 'stretch',
                borderRadius: '12px',
                background: '#F7F9FF',
                border: 'none',
                outline: 'none',
                resize: 'none',
                color: '#2A46BE',
                textAlign: 'left',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '100%',
                letterSpacing: '-0.408px',
              }}
            />
          </div>

          {/* Assign to Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              alignSelf: 'stretch',
            }}
          >
            <CustomText
              style={{
                color: 'var(--primary-dark-blue-60, #666E96)',
                fontSize: '12px',
                fontFamily: 'Poppins',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: '15px',
              }}
            >
              {i18n.t('AssignTo')}
            </CustomText>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                paddingBottom: '16px',
                backgroundColor: Colors.WHITE,
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => setShowAssigneeModal(true)}
            >
              <img
                src='/assets/person-with-shadow.svg'
                alt='assignee'
                style={{
                  width: '24px',
                  height: '24px',
                }}
              />
              {selectedAssignee ? (
                <div
                  style={{
                    display: 'flex',
                    height: '31px',
                    padding: '8px 12px 8px 14px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '39px',
                    backgroundColor: '#2A46BE',
                  }}
                >
                  <CustomText
                    style={{
                      color: 'var(--White, #FFF)',
                      textAlign: 'center',
                      fontFamily: 'Poppins',
                      fontSize: '12px',
                      fontStyle: 'normal',
                      fontWeight: '500',
                      lineHeight: '100%',
                    }}
                  >
                    {`${selectedAssignee.firstName} ${selectedAssignee.lastName}`}
                  </CustomText>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='17'
                    viewBox='0 0 16 17'
                    fill='none'
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAssignee(null);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M8.00004 15.6668C4.042 15.6668 0.833374 12.4582 0.833374 8.50016C0.833374 4.54212 4.042 1.3335 8.00004 1.3335C11.9581 1.3335 15.1667 4.54212 15.1667 8.50016C15.1667 12.4582 11.9581 15.6668 8.00004 15.6668ZM10.4714 6.97158C10.7318 6.71124 10.7318 6.28913 10.4714 6.02878C10.2111 5.76842 9.78904 5.7684 9.52864 6.02874L7.99991 7.55736L6.47143 6.029C6.21107 5.76866 5.78896 5.76868 5.52862 6.02904C5.26828 6.2894 5.26829 6.7115 5.52865 6.97184L7.05704 8.50016L5.52865 10.0285C5.26829 10.2888 5.26828 10.711 5.52862 10.9713C5.78896 11.2316 6.21107 11.2316 6.47143 10.9713L7.99991 9.44296L9.52864 10.9716C9.78904 11.2319 10.2111 11.2319 10.4714 10.9716C10.7318 10.7112 10.7318 10.2891 10.4714 10.0288L8.94277 8.50016L10.4714 6.97158Z'
                      fill='white'
                    />
                  </svg>
                </div>
              ) : (
                <CustomText
                  style={{
                    flex: 1,
                    color: 'var(--primary-dark-blue-20, #CCCFDC)',
                    fontSize: '16px',
                    fontFamily: 'Poppins',
                    fontWeight: '400',
                  }}
                >
                  {i18n.t('SelectAssignee')}
                </CustomText>
              )}
            </div>
          </div>

          {/* Priority Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              alignSelf: 'stretch',
            }}
          >
            <CustomText
              style={{
                color: 'var(--primary-dark-blue-60, #666E96)',
                fontSize: '12px',
                fontFamily: 'Poppins',
                fontStyle: 'normal',
                fontWeight: '500',
                lineHeight: '15px',
              }}
            >
              {i18n.t('Priority')}
            </CustomText>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                alignSelf: 'stretch',
              }}
            >
              {/* None Priority */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  opacity: priority === 0 ? 1 : 0.5,
                }}
                onClick={() => setPriority(0)}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 20 20'
                  fill='none'
                >
                  <path
                    d='M13.3333 10H6.66663'
                    stroke='#666E96'
                    strokeWidth='1.25'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9.99996 18.3337C14.6023 18.3337 18.3333 14.6027 18.3333 10.0003C18.3333 5.39795 14.6023 1.66699 9.99996 1.66699C5.39759 1.66699 1.66663 5.39795 1.66663 10.0003C1.66663 14.6027 5.39759 18.3337 9.99996 18.3337Z'
                    stroke='#666E96'
                    strokeWidth='1.25'
                    strokeLinejoin='round'
                  />
                </svg>
                <CustomText
                  style={{
                    color: 'var(--primary-dark-blue-60, #666E96)',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '19px',
                    letterSpacing: '-0.084px',
                  }}
                >
                  {i18n.t('None')}
                </CustomText>
              </div>

              {/* Low Priority */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  opacity: priority === 1 ? 1 : 0.5,
                }}
                onClick={() => setPriority(1)}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 20 20'
                  fill='none'
                >
                  <path
                    d='M3.33337 11.667V17.5003'
                    stroke='#6CC47C'
                    strokeWidth='1.25'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9.79804 3.1991C7.04367 1.77488 4.4142 2.83108 3.33337 3.68353V12.3545C4.14146 11.426 6.5657 9.98675 9.79804 11.6581C12.6867 13.1518 15.5037 12.3313 16.6667 11.686V3.34011C14.4247 4.35967 12.0145 4.34516 9.79804 3.1991Z'
                    stroke='#6CC47C'
                    strokeWidth='1.25'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <CustomText
                  style={{
                    color: 'var(--Accent-Color-Green-1, #6CC47C)',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '19px',
                    letterSpacing: '-0.084px',
                  }}
                >
                  {i18n.t('Low')}
                </CustomText>
              </div>

              {/* Medium Priority */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  opacity: priority === 2 ? 1 : 0.5,
                }}
                onClick={() => setPriority(2)}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 20 20'
                  fill='none'
                >
                  <path
                    d='M3.33337 11.667V17.5003'
                    stroke='#FFA020'
                    strokeWidth='1.25'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9.79804 3.1991C7.04367 1.77488 4.4142 2.83108 3.33337 3.68353V12.3545C4.14146 11.426 6.5657 9.98675 9.79804 11.6581C12.6867 13.1518 15.5037 12.3313 16.6667 11.686V3.34011C14.4247 4.35967 12.0145 4.34516 9.79804 3.1991Z'
                    stroke='#FFA020'
                    strokeWidth='1.25'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <CustomText
                  style={{
                    color: 'var(--Accent-Color-Orange-1, #FFA020)',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '19px',
                    letterSpacing: '-0.084px',
                  }}
                >
                  {i18n.t('Medium')}
                </CustomText>
              </div>

              {/* High Priority */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  opacity: priority === 3 ? 1 : 0.5,
                }}
                onClick={() => setPriority(3)}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 20 20'
                  fill='none'
                >
                  <path
                    d='M3.33337 11.667V17.5003'
                    stroke='#FF6961'
                    strokeWidth='1.25'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M9.79804 3.1991C7.04367 1.77488 4.4142 2.83108 3.33337 3.68353V12.3545C4.14146 11.426 6.5657 9.98675 9.79804 11.6581C12.6867 13.1518 15.5037 12.3313 16.6667 11.686V3.34011C14.4247 4.35967 12.0145 4.34516 9.79804 3.1991Z'
                    stroke='#FF6961'
                    strokeWidth='1.25'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
                <CustomText
                  style={{
                    color: 'var(--Accent-Color-Red-1, #FF6961)',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '19px',
                    letterSpacing: '-0.084px',
                  }}
                >
                  {i18n.t('High')}
                </CustomText>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div
          style={{
            padding: '0 0 20px 0',
            marginTop: '8px',
          }}
        >
          <Button
            textProps={{
              text: isUploading ? i18n.t('Uploading') : i18n.t('Save'),
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            disabled={!fileName.trim() || !selectedFile || isUploading}
            onButtonClick={handleUpload}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              color: Colors.BLUE,
              radius: 8,
            }}
            style={{
              width: '100%',
            }}
          />
        </div>
      </div>

      <HiveSelectionModal
        isVisible={showHiveSelectionModal}
        onClose={() => setShowHiveSelectionModal(false)}
        onHiveSelect={handleHiveSelection}
        multiSelect={false}
        initialSelectedHives={selectedHives}
        initialSelectedHive={selectedHive}
      />

      {/* Assignee Selection Modal */}
      <FamilyMemberSelectionModal
        isVisible={showAssigneeModal}
        onClose={() => setShowAssigneeModal(false)}
        onMemberSelect={(_members, member) => {
          setSelectedAssignee(member || null);
          setShowAssigneeModal(false);
        }}
        multiSelect={false}
        initialSelectedMembers={[]}
        initialSelectedMember={selectedAssignee || null}
      />
    </div>
  );
};

export default CreateDocPage;
