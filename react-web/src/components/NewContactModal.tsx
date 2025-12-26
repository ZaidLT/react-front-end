'use client';

import React from 'react';
import CustomText from './CustomText';
import { useLanguageContext } from '../context/LanguageContext';
import { useMobileAppDetection } from '../hooks/useMobileAppDetection';

interface NewContactModalProps {
  isVisible: boolean;
  onClose: () => void;
  onImportAll?: () => void;
  onImportSelect?: () => void;
  onCreateNew: () => void;
  // Backward compatibility: fallback if new handlers not provided
  onImportFromContacts?: () => void;
}

const NewContactModal: React.FC<NewContactModalProps> = ({
  isVisible,
  onClose,
  onImportAll,
  onImportSelect,
  onCreateNew,
  onImportFromContacts,
}) => {
  const { i18n } = useLanguageContext();
  const { isMobileApp } = useMobileAppDetection();

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: isMobileApp ? 'flex-end' : 'center',
        zIndex: 1100, // Higher than tab bar (which is typically 1000)
        paddingBottom: isMobileApp ? '21px' : '0',
      }}
      onClick={onClose}
    >
      <div
        style={{
          display: 'flex',
          width: '350px',
          padding: '0 24px 24px 24px',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: '30px',
          background: '#FFF',
          boxShadow: '0 -4px 12px 0 rgba(0, 0, 0, 0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            paddingTop: '16px',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            alignSelf: 'stretch',
          }}
        >
          <div
            style={{
              display: 'flex',
              padding: '12px 24px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '87px',
              alignSelf: 'stretch',
            }}
          >
            <CustomText
              style={{
                color: '#000728',
                textAlign: 'center',
                fontFamily: 'Poppins',
                fontSize: '18px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: '150%',
                letterSpacing: '0.18px',
              }}
            >
              {i18n.t('NewContact')}
            </CustomText>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            display: 'flex',
            paddingBottom: '24px',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            alignSelf: 'stretch',
          }}
        >
          {/* Import from Contacts Option */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              alignSelf: 'stretch',
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: '8px 0',
                alignItems: 'center',
                gap: '8px',
                alignSelf: 'stretch',
                cursor: 'pointer',
              }}
              onClick={() => {
                (onImportAll || onImportFromContacts)?.();
                onClose();
              }}
            >
              <CustomText
                style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '170%',
                  letterSpacing: '0.16px',
                }}
              >
                {i18n.t('ImportAllContacts')}
              </CustomText>
            </div>
          </div>

          {/* Import Select Contacts Option */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              alignSelf: 'stretch',
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: '8px 0',
                alignItems: 'center',
                gap: '8px',
                alignSelf: 'stretch',
                cursor: 'pointer',
              }}
              onClick={() => {
                (onImportSelect || onImportFromContacts)?.();
                onClose();
              }}
            >
              <CustomText
                style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '170%',
                  letterSpacing: '0.16px',
                }}
              >
                {i18n.t('ImportSelectContacts')}
              </CustomText>
            </div>
          </div>


          {/* Create New Option */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              alignSelf: 'stretch',
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: '8px 0',
                alignItems: 'center',
                gap: '8px',
                alignSelf: 'stretch',
                cursor: 'pointer',
              }}
              onClick={() => {
                onCreateNew();
                onClose();
              }}
            >
              <CustomText
                style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: '170%',
                  letterSpacing: '0.16px',
                }}
              >
                {i18n.t('CreateNewContact')}
              </CustomText>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewContactModal;
