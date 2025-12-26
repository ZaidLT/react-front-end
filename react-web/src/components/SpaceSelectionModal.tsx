'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import Button from './Button';
import CustomText from './CustomText';
import { BLUE, WHITE, WHITE_LILAC, BLACK, LIGHT_GREY, RED, PEARL, LIGHT_BLUE_BACKGROUND } from '../styles/colors';
import { FONT_SIZE_16, FONT_FAMILY_POPPINS_MEDIUM } from '../styles/typography';
import { useAuth } from '../context/AuthContext';
import { ETileType, INestedTile } from '../util/types';
import { SPACE_TILES_TYPES, getSpaceName, getSpaceIconByType } from '../util/spaceUtils';
import { useLanguageContext } from '../context/LanguageContext';
import { translateTileLabel } from '../util/translationUtils';

interface SpaceSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSpaceSelect: (selectedSpace: INestedTile) => void;
  currentSpaces?: INestedTile[]; // Optional for compatibility, but not used for filtering
}

const SpaceSelectionModal: React.FC<SpaceSelectionModalProps> = ({
  isVisible,
  onClose,
  onSpaceSelect,
  currentSpaces = [],
}) => {
  const { user } = useAuth();
  const { i18n } = useLanguageContext();
  const collator = useMemo(() => new Intl.Collator(i18n.locale === 'fr' ? 'fr-CA' : 'en-US', { sensitivity: 'base' }), [i18n.locale]);

  const [availableSpaces, setAvailableSpaces] = useState<ETileType[]>([]);
  const [selectedSpaceType, setSelectedSpaceType] = useState<ETileType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSpaceSelect = (spaceType: ETileType) => {
    setSelectedSpaceType(spaceType);
  };

  const handleSave = () => {
    if (selectedSpaceType) {
      // Create a mock space object with the selected type
      const mockSpace: INestedTile = {
        UniqueId: '', // Will be set by the backend
        Name: getSpaceName(selectedSpaceType),
        Type: selectedSpaceType,
        Active: true,
        Deleted: false,
        CreationTimestamp: new Date().toISOString(),
        UpdateTimestamp: new Date().toISOString(),
        Account_uniqueId: user?.accountId || '',
        User_uniqueId: user?.id || '',
        // ParentUniqueId: null, // This field doesn't exist in INestedTile
      };
      onSpaceSelect(mockSpace);
      onClose();
    }
  };

  // Load available spaces (show all spaces in alphabetical order by translated label)
  useEffect(() => {
    if (isVisible) {
      setError(null);
      setSelectedSpaceType(null);

      try {
        const available = [...SPACE_TILES_TYPES].sort((a, b) =>
          collator.compare(
            translateTileLabel({ type: a, name: getSpaceName(a) }, i18n),
            translateTileLabel({ type: b, name: getSpaceName(b) }, i18n)
          )
        );

        setAvailableSpaces(available);
      } catch (err) {
        console.error('Error loading available spaces:', err);
        setError('Failed to load available spaces. Please try again.');
      }
    }
  }, [isVisible, i18n.locale]);

  return (
    <Modal
      isVisible={isVisible}
      title={i18n.t('SelectASpace') || 'Select a Space ✨'}
      onClose={onClose}
      contentStyle={{
        maxHeight: '80vh',
        overflow: 'hidden',
      }}
      footerContent={
        <Button
          width="100%"
          disabled={!selectedSpaceType}
          textProps={{
            text: i18n.t('Add') || 'Add',
            fontSize: FONT_SIZE_16,
            color: WHITE,
            fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
          }}
          onButtonClick={handleSave}
          backgroundColor={BLUE}
          borderProps={{
            width: 1,
            color: WHITE_LILAC,
            radius: 8,
          }}
        />
      }
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '70vh',
        overflow: 'hidden',
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          paddingBottom: '10px',
        }}>
        {error ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <CustomText
              style={{
                fontSize: FONT_SIZE_16,
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                color: RED,
                marginBottom: '20px',
              }}
            >
              {error}
            </CustomText>
            <button
              style={{
                padding: '10px 20px',
                backgroundColor: BLUE,
                color: WHITE,
                border: 'none',
                borderRadius: '8px',
                fontSize: FONT_SIZE_16,
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                cursor: 'pointer',
              }}
              onClick={() => {
                setError(null);
                // Retry loading - show all spaces sorted alphabetically by translated label
                const available = [...SPACE_TILES_TYPES].sort((a, b) =>
                  collator.compare(
                    translateTileLabel({ type: a, name: getSpaceName(a) }, i18n),
                    translateTileLabel({ type: b, name: getSpaceName(b) }, i18n)
                  )
                );
                setAvailableSpaces(available);
              }}
            >
              Retry
            </button>
          </div>
        ) : availableSpaces && availableSpaces.length > 0 ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 15px',
                  backgroundColor: WHITE_LILAC,
                  borderRadius: '12px',
                  marginBottom: '15px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <img
                  src="/hive-icons/spaces.svg"
                  alt="Spaces"
                  style={{ width: '24px', height: '24px', marginRight: '10px' }}
                />
                <CustomText
                  style={{
                    flex: 1,
                    fontSize: FONT_SIZE_16,
                    fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                    color: BLACK,
                  }}
                >
                  {i18n.t('AvailableSpaces') || 'Available Spaces'}
                </CustomText>
              </div>

              <div style={{ marginLeft: '20px' }}>
                {availableSpaces.map((spaceType) => {
                  const isSelected = selectedSpaceType === spaceType;

                  const spaceName = translateTileLabel({ type: spaceType, name: getSpaceName(spaceType) }, i18n);

                  return (
                    <div key={spaceType} style={{ marginBottom: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 15px',
                          backgroundColor: isSelected ? LIGHT_BLUE_BACKGROUND : WHITE,
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${BLUE}` : `1px solid ${LIGHT_GREY}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => handleSpaceSelect(spaceType)}
                      >
                        <img
                          src={getSpaceIconByType(spaceType)}
                          alt={spaceName}
                          style={{ width: '20px', height: '20px', marginRight: '12px' }}
                        />
                        <CustomText
                          style={{
                            flex: 1,
                            fontSize: FONT_SIZE_16,
                            fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                            color: isSelected ? BLUE : BLACK,
                          }}
                        >
                          {spaceName}
                        </CustomText>
                        {isSelected && (
                          <img
                            src="/hive-icons/checkmark.svg"
                            alt="selected"
                            style={{ width: '16px', height: '16px' }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <CustomText
              style={{
                fontSize: FONT_SIZE_16,
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                color: PEARL,
              }}
            >
              All available spaces have been added to your list.
            </CustomText>
          </div>
        )}
        </div>
      </div>
    </Modal>
  );
};

export default SpaceSelectionModal;
