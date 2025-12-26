'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import Button from './Button';
import CustomText from './CustomText';
import { BLUE, WHITE, WHITE_LILAC, BLACK, LIGHT_GREY, RED } from '../styles/colors';
import { FONT_SIZE_16, FONT_FAMILY_POPPINS_MEDIUM } from '../styles/typography';
import { useAuth } from '../context/AuthContext';
import { ETileType, INestedTile } from '../util/types';
import { getSpaceIconPath } from '../util/spaceUtils';
import { useLanguageContext } from '../context/LanguageContext';
import { translateTileLabel } from '../util/translationUtils';

interface SpaceEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentSpaces: INestedTile[];
  onSave: () => void; // Called after successful save to refresh the parent
}

const SpaceEditModal: React.FC<SpaceEditModalProps> = ({
  isVisible,
  onClose,
  currentSpaces,
  onSave,
}) => {
  const { user } = useAuth();
  const { i18n } = useLanguageContext();
  const collator = useMemo(() => new Intl.Collator(i18n.locale === 'fr' ? 'fr-CA' : 'en-US', { sensitivity: 'base' }), [i18n.locale]);
  const [selectedSpaces, setSelectedSpaces] = useState<Set<string>>(new Set()); // Now using space IDs instead of types
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savingProgress, setSavingProgress] = useState<{ current: number; total: number } | null>(null);

  const handleSpaceToggle = (spaceId: string) => {
    const newSelected = new Set(selectedSpaces);
    if (newSelected.has(spaceId)) {
      newSelected.delete(spaceId);
    } else {
      newSelected.add(spaceId);
    }
    setSelectedSpaces(newSelected);
  };

  // Initialize selected spaces based on current active spaces
  useEffect(() => {
    if (isVisible && currentSpaces) {
      const activeSpaceIds = new Set(
        currentSpaces
          .filter(space => space.Active && !space.Deleted)
          .map(space => space.UniqueId)
      );
      setSelectedSpaces(activeSpaceIds);
    }
  }, [isVisible, currentSpaces]);

  const handleSave = async () => {
    if (!user?.id || !user?.accountId) {
      console.error('User information not available');
      return;
    }

    setIsSaving(true);
    setSavingProgress(null);

    try {
      // Get currently active space IDs
      const currentActiveSpaceIds = new Set(
        currentSpaces
          .filter(space => space.Active && !space.Deleted)
          .map(space => space.UniqueId)
      );

      // Find spaces to activate (selected but currently inactive/deleted)
      const spacesToActivate = currentSpaces.filter(
        space => selectedSpaces.has(space.UniqueId) && (!space.Active || space.Deleted)
      );

      // Find spaces to deactivate (currently active but not selected)
      const spacesToDeactivate = currentSpaces.filter(
        space => currentActiveSpaceIds.has(space.UniqueId) && !selectedSpaces.has(space.UniqueId)
      );

      const totalOperations = spacesToActivate.length + spacesToDeactivate.length;
      let completedOperations = 0;

      if (totalOperations === 0) {
        // No changes needed
        onSave();
        onClose();
        return;
      }

      setSavingProgress({ current: 0, total: totalOperations });

      // Activate spaces (set Active=true, Deleted=false)
      for (const space of spacesToActivate) {
        const authToken = localStorage.getItem('auth_token');

        const updateData = {
          accountId: user.accountId,
          userId: user.id,
          parentId: (space as any).ParentUniqueId,
          type: space.Type,
          name: space.Name,
          avatarImagePath: space.AvatarImagePath || "",
          electronicDeviceBrandModel: (space as any).ElectronicDevice_BrandModel || "",
          electronicDeviceSerialNumber: (space as any).ElectronicDevice_SerialNumber || "",
          electronicDevicePurchaseDate: (space as any).ElectronicDevice_PurchaseDate || new Date().toISOString(),
          electronicDeviceEndOfWarranty: (space as any).ElectronicDevice_EndOfWarranty || new Date().toISOString(),
          transferOwnershipToEmailAddress: (space as any).TransferOwnershipToEmailAddress || "",
          brand: "",
          typeId: "",
          manualPdfUrl: "",
          active: true,
          deleted: false
        };

        const response = await fetch(`/api/tiles/${space.UniqueId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to activate space ${space.Name}:`, response.statusText, errorText);
          throw new Error(`Failed to activate space ${space.Name}: ${response.statusText}`);
        }

        completedOperations++;
        setSavingProgress({ current: completedOperations, total: totalOperations });
      }

      // Deactivate spaces (set Active=false)
      for (const space of spacesToDeactivate) {
        const authToken = localStorage.getItem('auth_token');

        const response = await fetch(`/api/tiles/${space.UniqueId}?accountId=${user.accountId}&userId=${user.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to deactivate space ${space.Name}:`, response.statusText, errorText);
          throw new Error(`Failed to deactivate space ${space.Name}: ${response.statusText}`);
        }

        completedOperations++;
        setSavingProgress({ current: completedOperations, total: totalOperations });
      }

      // Success - refresh the parent component
      onSave();
      onClose();

    } catch (error) {
      console.error('Error saving spaces:', error);
      alert('Failed to save spaces. Please try again.');
    } finally {
      setIsSaving(false);
      setSavingProgress(null);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      title={i18n.t('EditSpaces') || 'Edit Spaces ✨'}
      onClose={onClose}
      contentStyle={{
        padding: 0,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      footerContent={
        <Button
          width="100%"
          disabled={isSaving}
          textProps={{
            text: isSaving
              ? (savingProgress
                  ? `${i18n.t('Saving...') || 'Saving...'} ${savingProgress.current}/${savingProgress.total}`
                  : (i18n.t('Saving...') || 'Saving...'))
              : (i18n.t('Save') || 'Save'),
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
                alt={i18n.t('Spaces')}
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
                {i18n.t('SelectSpaces') || 'Select Spaces'}
              </CustomText>
            </div>

            <div style={{ marginLeft: '20px' }}>
              {currentSpaces
                .sort((a, b) => collator.compare(
                  translateTileLabel({ type: a.Type, name: a.Name }, i18n),
                  translateTileLabel({ type: b.Type, name: b.Name }, i18n)
                ))
                .map((space) => {
                  const isSelected = selectedSpaces.has(space.UniqueId);
                  const isCurrentlyActive = space.Active && !space.Deleted;

                  const label = translateTileLabel({ type: space.Type, name: space.Name }, i18n);

                  return (
                    <div key={space.UniqueId} style={{ marginBottom: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 15px',
                          backgroundColor: isSelected ? WHITE_LILAC : WHITE,
                          borderRadius: '8px',
                          border: `1px solid ${isSelected ? BLUE : LIGHT_GREY}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          opacity: isCurrentlyActive ? 1 : 0.6, // Show inactive spaces with reduced opacity
                        }}
                        onClick={() => handleSpaceToggle(space.UniqueId)}
                      >
                        <img
                          src={getSpaceIconPath(space.Type)}
                          alt={label}
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
                          {label}
                          {!isCurrentlyActive && (
                            <span style={{ fontSize: '12px', color: LIGHT_GREY, marginLeft: '8px' }}>
                              ({i18n.t('Inactive') || 'inactive'})
                            </span>
                          )}
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
      </div>
    </Modal>
  );
};

export default SpaceEditModal;
