'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import CustomText from './CustomText';
import Button from './Button';
import { Colors } from '../styles';
import { FONT_SIZE_16, FONT_FAMILY_POPPINS_MEDIUM } from '../styles/typography';
import { ETileType, INestedTile } from '../util/types';

import { useAuth } from '../context/AuthContext';

import { useLanguageContext } from '../context/LanguageContext';

// Import appliance utilities
import { getApplianceIconPath } from '../util/applianceUtils';
import { translateTileLabel } from '../util/translationUtils';




interface ApplianceEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentAppliances: INestedTile[];
  onSave: () => void; // Called after successful save to refresh the parent
}



const ApplianceEditModal: React.FC<ApplianceEditModalProps> = ({
  isVisible,
  onClose,
  currentAppliances,
  onSave,
}) => {
  const { user } = useAuth();
  const { i18n } = useLanguageContext();

  const [selectedAppliances, setSelectedAppliances] = useState<Set<string>>(new Set()); // Now using appliance IDs instead of types
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savingProgress, setSavingProgress] = useState<{ current: number; total: number } | null>(null);

  const handleApplianceToggle = (applianceId: string) => {
    const newSelected = new Set(selectedAppliances);
    if (newSelected.has(applianceId)) {
      newSelected.delete(applianceId);
    } else {
      newSelected.add(applianceId);
    }
    setSelectedAppliances(newSelected);
  };

  const handleSave = async () => {
    if (!user?.id || !user?.accountId) {
      console.error('User information not available');
      return;
    }

    // Check if user is authenticated
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      console.error('No authentication token available');
      return;
    }

    setIsSaving(true);
    setSavingProgress(null);

    try {
      // Get currently active appliance IDs
      const currentActiveApplianceIds = new Set(
        currentAppliances
          .filter(appliance => appliance.Active && !appliance.Deleted)
          .map(appliance => appliance.UniqueId)
      );

      // Find appliances to activate (selected but currently inactive/deleted)
      const appliancesToActivate = currentAppliances.filter(
        appliance => selectedAppliances.has(appliance.UniqueId) && (!appliance.Active || appliance.Deleted)
      );

      // Find appliances to deactivate (currently active but not selected)
      const appliancesToDeactivate = currentAppliances.filter(
        appliance => currentActiveApplianceIds.has(appliance.UniqueId) && !selectedAppliances.has(appliance.UniqueId)
      );

      const totalOperations = appliancesToActivate.length + appliancesToDeactivate.length;

      if (totalOperations === 0) {
        // No changes to make
        onSave();
        onClose();
        return;
      }

      setSavingProgress({ current: 0, total: totalOperations });

      let completedOperations = 0;

      // Activate appliances (set Active=true, Deleted=false)
      for (const appliance of appliancesToActivate) {
        const updateData = {
          accountId: user.accountId,
          userId: user.id,
          parentId: (appliance as any).ParentUniqueId,
          type: appliance.Type,
          name: appliance.Name,
          avatarImagePath: appliance.AvatarImagePath || "",
          electronicDeviceBrandModel: (appliance as any).ElectronicDevice_BrandModel || "",
          electronicDeviceSerialNumber: (appliance as any).ElectronicDevice_SerialNumber || "",
          electronicDevicePurchaseDate: (appliance as any).ElectronicDevice_PurchaseDate || new Date().toISOString(),
          electronicDeviceEndOfWarranty: (appliance as any).ElectronicDevice_EndOfWarranty || new Date().toISOString(),
          transferOwnershipToEmailAddress: (appliance as any).TransferOwnershipToEmailAddress || "",
          brand: "",
          typeId: "",
          manualPdfUrl: "",
          active: true,
          deleted: false
        };

        const response = await fetch(`/api/tiles/${appliance.UniqueId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to activate appliance ${appliance.Name}:`, response.statusText, errorText);
          throw new Error(`Failed to activate appliance ${appliance.Name}: ${response.statusText}`);
        }

        completedOperations++;
        setSavingProgress({ current: completedOperations, total: totalOperations });
      }

      // Deactivate appliances (set Active=false)
      for (const appliance of appliancesToDeactivate) {
        const response = await fetch(`/api/tiles/${appliance.UniqueId}?accountId=${user.accountId}&userId=${user.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to deactivate appliance ${appliance.Name}:`, response.statusText, errorText);
          throw new Error(`Failed to deactivate appliance ${appliance.Name}: ${response.statusText}`);
        }

        completedOperations++;
        setSavingProgress({ current: completedOperations, total: totalOperations });
      }

      // Success - refresh the parent component
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving appliances:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSaving(false);
      setSavingProgress(null);
    }
  };

  useEffect(() => {
    if (isVisible) {
      // Initialize selected appliances based on current active appliances
      const activeApplianceIds = new Set(
        currentAppliances
          .filter(appliance => appliance.Active && !appliance.Deleted)
          .map(appliance => appliance.UniqueId)
      );
      setSelectedAppliances(activeApplianceIds);
    }
  }, [isVisible, currentAppliances]);

  return (
    <Modal
      isVisible={isVisible}
      title={i18n.t('EditAppliances') || 'Edit Appliances ✨'}
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
            color: Colors.WHITE,
            fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
          }}
          onButtonClick={handleSave}
          backgroundColor={Colors.BLUE}
          borderProps={{
            width: 1,
            color: Colors.WHITE_LILAC,
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
                backgroundColor: Colors.WHITE_LILAC,
                borderRadius: '12px',
                marginBottom: '15px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <img
                src="/hive-icons/appliances.svg"
                alt="Appliances"
                style={{ width: '24px', height: '24px', marginRight: '10px' }}
              />
              <CustomText
                style={{
                  flex: 1,
                  fontSize: FONT_SIZE_16,
                  fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                  color: Colors.BLACK,
                }}
              >
                {i18n.t('SelectAppliances') || 'Select Appliances'}
              </CustomText>
            </div>

            <div style={{ marginLeft: '20px' }}>
              {currentAppliances
                .sort((a, b) => a.Name.localeCompare(b.Name)) // Sort alphabetically by actual name
                .map((appliance) => {
                  const isSelected = selectedAppliances.has(appliance.UniqueId);
                  const isCurrentlyActive = appliance.Active && !appliance.Deleted;

                  return (
                    <div key={appliance.UniqueId} style={{ marginBottom: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 15px',
                          backgroundColor: isSelected ? Colors.WHITE_LILAC : Colors.WHITE,
                          borderRadius: '8px',
                          border: `1px solid ${isSelected ? Colors.BLUE : Colors.LIGHT_GREY}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          opacity: isCurrentlyActive ? 1 : 0.6, // Show inactive appliances with reduced opacity
                        }}
                        onClick={() => handleApplianceToggle(appliance.UniqueId)}
                      >
                        <img
                          src={getApplianceIconPath(appliance.Type)}
                          alt={appliance.Name}
                          style={{ width: '20px', height: '20px', marginRight: '12px' }}
                        />
                        <CustomText
                          style={{
                            flex: 1,
                            fontSize: FONT_SIZE_16,
                            fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                            color: isSelected ? Colors.BLUE : Colors.BLACK,
                          }}
                        >
                          {translateTileLabel({ type: appliance.Type, name: appliance.Name }, i18n)}
                          {!isCurrentlyActive && (
                            <span style={{ fontSize: '12px', color: Colors.LIGHT_GREY, marginLeft: '8px' }}>
                              (inactive)
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

export default ApplianceEditModal;
