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
import { translateTileLabel } from '../util/translationUtils';


// Static list of all available appliances based on React Native project
const APPLIANCES_TILES_TYPES: ETileType[] = [
  ETileType.Fridge,
  ETileType.KitchenAid,
  ETileType.Washing_machine,
  ETileType.Dryer,
  ETileType.Blender,
  ETileType.Dishwasher,
  ETileType.Oven,
  ETileType.Hot_Tub,
  ETileType.Generator,
  ETileType.Air_conditioner,
  ETileType.Air_fryer,
  ETileType.Air_purifier,
  ETileType.Bread_Maker,
  ETileType.Ceiling_Fan,
  ETileType.Coffee_maker,
  ETileType.Crock_Pot,
  ETileType.Dehumidifier,
  ETileType.Electric_fan,
  ETileType.Espresso_Maker,
  ETileType.Fireplace,
  ETileType.Flatscreen_TV,
  ETileType.Food_processor,
  ETileType.Freezer,
  ETileType.Furnace,
  ETileType.Grill,
  ETileType.Hand_Mixer,
  ETileType.Heater,
  ETileType.Humidifier,
  ETileType.Ice_Maker,
  ETileType.Iron,
  ETileType.Juicer,
  ETileType.Kettle,
  ETileType.Lawn_Mower,
  ETileType.Leaf_Blower,
  ETileType.Microwave,
  ETileType.Mini_Fridge,
  ETileType.Rice_Cooker,
  ETileType.Sauna,
  ETileType.Space_heater,
  ETileType.Speakers,
  ETileType.Stand_Mixer,
  ETileType.Steamer,
  ETileType.Stove,
  ETileType.Toaster,
  ETileType.Toaster_Oven,
  ETileType.Trash_Compactor,
  ETileType.Vacuum_cleaner,
  ETileType.Waffle_Iron,
  ETileType.Water_Heater,
  ETileType.Weed_Eater,
  ETileType.Wet_Vac,
];

// Function to get appliance name from ETileType
const getApplianceName = (tileType: ETileType): string => {
  return ETileType[tileType].replace(/_/g, ' ');
};

// Function to get the correct icon for an appliance tile based on its type
const getApplianceIconByType = (tileType: ETileType): string => {
  // Map based on tile type directly
  switch (tileType) {
    case ETileType.Air_conditioner:
      return '/hive-icons/air-conditioner.svg';
    case ETileType.Dishwasher:
      return '/hive-icons/dishwasher.svg';
    case ETileType.Dryer:
      return '/hive-icons/dryer.svg';
    case ETileType.Washing_machine:
      return '/hive-icons/washing-machine.svg';
    case ETileType.Fridge:
    case ETileType.Refrigerator:
      return '/hive-icons/refrigerator.svg';
    case ETileType.Oven:
      return '/hive-icons/oven.svg';
    case ETileType.Microwave:
      return '/hive-icons/microwave.svg';
    case ETileType.Blender:
      return '/hive-icons/blender.svg';
    case ETileType.Air_fryer:
      return '/hive-icons/air-fryer.svg';
    case ETileType.Air_purifier:
      return '/hive-icons/air-purifier.svg';
    case ETileType.Bread_Maker:
      return '/hive-icons/bread-maker.svg';
    case ETileType.Ceiling_Fan:
      return '/hive-icons/ceiling-fan.svg';
    case ETileType.Coffee_maker:
      return '/hive-icons/coffee-maker.svg';
    case ETileType.Crock_Pot:
      return '/hive-icons/crock-pot.svg';
    case ETileType.Dehumidifier:
      return '/hive-icons/dehumidifier.svg';
    case ETileType.Electric_fan:
      return '/hive-icons/ceiling-fan.svg'; // Use ceiling fan icon for electric fan
    case ETileType.Espresso_Maker:
      return '/hive-icons/espresso-maker.svg';
    case ETileType.Fireplace:
      return '/hive-icons/fireplace.svg';
    case ETileType.Flatscreen_TV:
      return '/hive-icons/flatscreen-tv.svg';
    case ETileType.Food_processor:
      return '/hive-icons/food-processor.svg';
    case ETileType.Freezer:
      return '/hive-icons/freezer.svg';
    case ETileType.Furnace:
      return '/hive-icons/furnace.svg';
    case ETileType.Generator:
      return '/hive-icons/generator.svg';
    case ETileType.Grill:
      return '/hive-icons/grill.svg';
    case ETileType.Hand_Mixer:
      return '/hive-icons/hand-mixer.svg';
    case ETileType.Heater:
      return '/hive-icons/heater.svg';
    case ETileType.Hot_Tub:
      return '/hive-icons/hot-tub.svg';
    case ETileType.Humidifier:
      return '/hive-icons/humidifier.svg';
    case ETileType.Ice_Maker:
      return '/hive-icons/ice-maker.svg';
    case ETileType.Iron:
      return '/hive-icons/iron.svg';
    case ETileType.Juicer:
      return '/hive-icons/juicer.svg';
    case ETileType.Kettle:
      return '/hive-icons/kettle.svg';
    case ETileType.KitchenAid:
      return '/hive-icons/kitchen-aid.svg';
    case ETileType.Lawn_Mower:
      return '/hive-icons/lawn-mower.svg';
    case ETileType.Leaf_Blower:
      return '/hive-icons/leaf-blower.svg';
    case ETileType.Mini_Fridge:
      return '/hive-icons/minifridge.svg';
    case ETileType.Rice_Cooker:
      return '/hive-icons/rice-cooker.svg';
    case ETileType.Sauna:
      return '/hive-icons/sauna.svg';
    case ETileType.Space_heater:
      return '/hive-icons/space-heater.svg';
    case ETileType.Speakers:
      return '/hive-icons/speakers.svg';
    case ETileType.Stand_Mixer:
      return '/hive-icons/stand-mixer.svg';
    case ETileType.Steamer:
      return '/hive-icons/steamer.svg';
    case ETileType.Stove:
      return '/hive-icons/stove.svg';
    case ETileType.Toaster:
      return '/hive-icons/toaster.svg';
    case ETileType.Toaster_Oven:
      return '/hive-icons/toaster-oven.svg';
    case ETileType.Trash_Compactor:
      return '/hive-icons/trash-compactor.svg';
    case ETileType.Vacuum_cleaner:
      return '/hive-icons/vacuum-cleaner.svg';
    case ETileType.Waffle_Iron:
      return '/hive-icons/waffle-iron.svg';
    case ETileType.Water_Heater:
      return '/hive-icons/water-heater.svg';
    case ETileType.Weed_Eater:
      return '/hive-icons/weed-eater.svg';
    case ETileType.Wet_Vac:
      return '/hive-icons/wet-vac.svg';
    default:
      return '/hive-icons/appliances.svg'; // Default appliance icon
  }
};


interface ApplianceSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplianceSelect: (selectedAppliance: INestedTile) => void;
  currentAppliances?: INestedTile[]; // Optional for compatibility, but not used for filtering
}



const ApplianceSelectionModal: React.FC<ApplianceSelectionModalProps> = ({
  isVisible,
  onClose,

  onApplianceSelect,
  currentAppliances = [],
}) => {
  const { user } = useAuth();
  const { i18n } = useLanguageContext();


  const [availableAppliances, setAvailableAppliances] = useState<ETileType[]>([]);
  const [selectedApplianceType, setSelectedApplianceType] = useState<ETileType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApplianceSelect = (applianceType: ETileType) => {
    setSelectedApplianceType(applianceType);
  };

  const handleSave = () => {
    if (selectedApplianceType) {
      // Create a mock appliance object with the selected type
      const mockAppliance: INestedTile = {
        UniqueId: '', // Will be set by the backend
        Name: getApplianceName(selectedApplianceType),
        Type: selectedApplianceType,
        Active: true,
        Deleted: false,
        CreationTimestamp: new Date().toISOString(),
        UpdateTimestamp: new Date().toISOString(),
        Account_uniqueId: user?.accountId || '',
        User_uniqueId: user?.id || '',
        // ParentUniqueId: null, // This field doesn't exist in INestedTile
      };
      onApplianceSelect(mockAppliance);
      onClose();
    }
  };

  useEffect(() => {
    if (isVisible) {
      setSelectedApplianceType(null);
      setError(null);

      // Show all appliances sorted alphabetically by name
      const available = [...APPLIANCES_TILES_TYPES].sort((a, b) => {
        const nameA = getApplianceName(a);
        const nameB = getApplianceName(b);
        return nameA.localeCompare(nameB);
      });
      setAvailableAppliances(available);
    }
  }, [isVisible]);

  return (
    <Modal
      isVisible={isVisible}
      title={i18n.t('SelectAnAppliance') || 'Select an Appliance ✨'}
      onClose={onClose}
      contentStyle={{
        maxHeight: '80vh',
        overflow: 'hidden',
      }}
      footerContent={
        <Button
          width="100%"
          disabled={!selectedApplianceType}
          textProps={{
            text: i18n.t('Add') || 'Add',
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
        overflowY: 'auto',
        maxHeight: '60vh',
        padding: '0 10px',
      }}>
        {error ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px 20px',
            textAlign: 'center',
          }}>
            <CustomText
              style={{
                fontSize: FONT_SIZE_16,
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.LIGHT_RED,
                marginBottom: '10px',
              }}
            >
              {error}
            </CustomText>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: Colors.BLUE,
                color: Colors.WHITE,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
              }}
            >
              Retry
            </button>
          </div>
        ) : availableAppliances && availableAppliances.length > 0 ? (
          <div>
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
                  {i18n.t('AvailableAppliances') || 'Available Appliances'}
                </CustomText>
              </div>

              <div style={{ marginLeft: '20px' }}>
                {availableAppliances.map((applianceType) => {
                  const isSelected = selectedApplianceType === applianceType;

                  const label = translateTileLabel({ type: applianceType }, i18n);

                  return (
                    <div key={applianceType} style={{ marginBottom: '8px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 15px',
                          backgroundColor: isSelected ? Colors.LIGHT_BLUE_BACKGROUND : Colors.WHITE,
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${Colors.BLUE}` : `1px solid ${Colors.LIGHT_GREY}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => handleApplianceSelect(applianceType)}
                      >
                        <img
                          src={getApplianceIconByType(applianceType)}
                          alt={label}
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
                          {label}
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
                color: Colors.PEARL,
              }}
            >
              {"No appliances available"}
            </CustomText>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ApplianceSelectionModal;
