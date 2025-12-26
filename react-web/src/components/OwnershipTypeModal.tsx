'use client';

import React, { useState, useEffect } from 'react';
import CustomText from './CustomText';
import { useLanguageContext } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import cachedUserService from '../services/cachedUserService';

interface OwnershipTypeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm?: (ownershipType: 'Own' | 'Rent') => void;
  initialSelection?: 'Own' | 'Rent';
}

const OwnershipTypeModal: React.FC<OwnershipTypeModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  initialSelection = 'Own',
}) => {
  const { i18n } = useLanguageContext();
  const { user, updateUser } = useAuth();
  const [selectedType, setSelectedType] = useState<'Own' | 'Rent'>(initialSelection);
  const [isSaving, setIsSaving] = useState(false);

  // Update selected type when initialSelection changes
  useEffect(() => {
    setSelectedType(initialSelection);
  }, [initialSelection]);

  if (!isVisible) return null;

  const handleConfirm = async () => {
    if (!user) {
      console.error('No user found for property situation update');
      return;
    }

    setIsSaving(true);

    try {
      // Save the property situation in English to the database
      const englishOwnershipType = selectedType; // Already in English ('Own' or 'Rent')

      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('Saving property situation:', englishOwnershipType);
        console.log('Current user object:', user);
      }

      // Update user with new property situation (using camelCase to match backend API)
      const updatedUser = await cachedUserService.updateUser({
        ...user,
        propertySituation: englishOwnershipType, // Save in English
      });

      if (updatedUser) {
        console.log('Property situation saved to database successfully');

        // Update the auth context with the new value
        updateUser({
          propertySituation: englishOwnershipType,
          PropertySituation: englishOwnershipType, // Backward compatibility
        } as any);

        // Call the optional onConfirm callback
        if (onConfirm) {
          onConfirm(selectedType);
        }

        onClose();
      } else {
        console.error('Failed to save property situation');
      }
    } catch (error) {
      console.error('Error saving property situation:', error);
    } finally {
      setIsSaving(false);
    }
  };

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
        alignItems: 'flex-end',
        zIndex: 1000,
        paddingBottom: '21px',
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
              {i18n.t('OwnershipType')}
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
          {/* Own Option */}
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
              onClick={() => setSelectedType('Own')}
            >
              <img
                src="/icons/icons-modal-own.svg"
                width={24}
                height={24}
                alt="Own"
                style={{
                  width: '24px',
                  height: '24px',
                }}
              />
              <CustomText
                style={{
                  color: selectedType === 'Own' ? '#000E50' : '#999FB9',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: selectedType === 'Own' ? 500 : 400,
                  lineHeight: '170%',
                  letterSpacing: '0.16px',
                }}
              >
                {i18n.t('Own')}
              </CustomText>
            </div>
          </div>

          {/* Rent Option */}
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
              onClick={() => setSelectedType('Rent')}
            >
              <img
                src="/icons/icons-modal-rent.svg"
                width={24}
                height={24}
                alt="Rent"
                style={{
                  width: '24px',
                  height: '24px',
                }}
              />
              <CustomText
                style={{
                  color: selectedType === 'Rent' ? '#000E50' : '#999FB9',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: selectedType === 'Rent' ? 500 : 400,
                  lineHeight: '170%',
                  letterSpacing: '0.16px',
                }}
              >
                {i18n.t('Rent')}
              </CustomText>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            alignSelf: 'stretch',
          }}
        >
          {/* Cancel Button */}
          <button
            style={{
              display: 'flex',
              height: '52px',
              padding: '14px 20px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              flex: '1 0 0',
              borderRadius: '8px',
              border: '1px solid #000E50',
              background: 'transparent',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            <CustomText
              style={{
                color: '#000E50',
                textAlign: 'center',
                fontFeatureSettings: "'case' on",
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '22px',
                letterSpacing: '-0.408px',
              }}
            >
              {i18n.t('Cancel')}
            </CustomText>
          </button>

          {/* Confirm Button */}
          <button
            style={{
              display: 'flex',
              height: '52px',
              padding: '14px 20px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              flex: '1 0 0',
              borderRadius: '8px',
              border: '1px solid #000E50',
              background: isSaving ? '#999FB9' : '#000E50',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
            }}
            onClick={handleConfirm}
            disabled={isSaving}
          >
            <CustomText
              style={{
                color: '#FFF',
                textAlign: 'center',
                fontFeatureSettings: "'case' on",
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '22px',
                letterSpacing: '-0.408px',
              }}
            >
              {isSaving ? i18n.t('Saving...') : i18n.t('Confirm')}
            </CustomText>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnershipTypeModal;
