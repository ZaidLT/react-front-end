'use client';

import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import CustomText from './CustomText';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

import { Colors } from '../styles';
import { FONT_SIZE_16, FONT_FAMILY_POPPINS_MEDIUM } from '../styles/typography';
import { ETileType, INestedTile, Tile } from '../util/types';
import { User } from '../services/types';

import { useAuth } from '../context/AuthContext';
import tileService from '../services/tileService';
import { useLanguageContext } from '../context/LanguageContext';

interface HiveSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onHiveSelect: (selectedHives: (INestedTile | Tile | User)[], selectedHive?: INestedTile | User | null) => void;
  multiSelect?: boolean;
  initialSelectedHives?: (INestedTile | Tile | User)[];
  initialSelectedHive?: INestedTile | User | null;
}

// Function to get the correct icon for a tile based on its type and name
const getTileIcon = (tile: INestedTile, parentType?: ETileType): string => {
  // For appliances, map specific types to their icons
  if (parentType === ETileType.Appliances || tile.Type === ETileType.Appliances) {
    // Map based on tile name or type
    const name = tile.Name?.toLowerCase();
    if (name?.includes('air conditioner') || tile.Type === ETileType.Air_conditioner) return '/hive-icons/air-conditioner.svg';
    if (name?.includes('dishwasher') || tile.Type === ETileType.Dishwasher) return '/hive-icons/dishwasher.svg';
    if (name?.includes('dryer') || tile.Type === ETileType.Dryer) return '/hive-icons/dryer.svg';
    if (name?.includes('washing machine') || name?.includes('washer') || tile.Type === ETileType.Washing_machine) return '/hive-icons/washing-machine.svg';
    if (name?.includes('refrigerator') || name?.includes('fridge') || tile.Type === ETileType.Fridge || tile.Type === ETileType.Refrigerator) return '/hive-icons/refrigerator.svg';
    if (name?.includes('oven') || tile.Type === ETileType.Oven) return '/hive-icons/oven.svg';
    if (name?.includes('microwave') || tile.Type === ETileType.Microwave) return '/hive-icons/microwave.svg';
    if (name?.includes('blender') || tile.Type === ETileType.Blender) return '/hive-icons/blender.svg';
    if (name?.includes('air fryer') || tile.Type === ETileType.Air_fryer) return '/hive-icons/air-fryer.svg';
    if (name?.includes('air purifier') || tile.Type === ETileType.Air_purifier) return '/hive-icons/air-purifier.svg';
    if (name?.includes('bread maker') || tile.Type === ETileType.Bread_Maker) return '/hive-icons/bread-maker.svg';
    if (name?.includes('ceiling fan') || tile.Type === ETileType.Ceiling_Fan) return '/hive-icons/ceiling-fan.svg';
    if (name?.includes('electric fan') || tile.Type === ETileType.Electric_fan) return '/hive-icons/ceiling-fan.svg'; // Use ceiling fan icon for electric fan
    if (name?.includes('coffee maker') || tile.Type === ETileType.Coffee_maker) return '/hive-icons/coffee-maker.svg';
    if (name?.includes('crock pot') || tile.Type === ETileType.Crock_Pot) return '/hive-icons/crock-pot.svg';
    if (name?.includes('dehumidifier') || tile.Type === ETileType.Dehumidifier) return '/hive-icons/dehumidifier.svg';
    if (name?.includes('espresso maker') || tile.Type === ETileType.Espresso_Maker) return '/hive-icons/espresso-maker.svg';
    if (name?.includes('fireplace') || tile.Type === ETileType.Fireplace) return '/hive-icons/fireplace.svg';
    if (name?.includes('flatscreen tv') || name?.includes('tv') || tile.Type === ETileType.Flatscreen_TV) return '/hive-icons/flatscreen-tv.svg';
    if (name?.includes('food processor') || tile.Type === ETileType.Food_processor) return '/hive-icons/food-processor.svg';
    if (name?.includes('freezer') || tile.Type === ETileType.Freezer) return '/hive-icons/freezer.svg';
    if (name?.includes('furnace') || tile.Type === ETileType.Furnace) return '/hive-icons/furnace.svg';
    if (name?.includes('generator') || tile.Type === ETileType.Generator) return '/hive-icons/generator.svg';
    if (name?.includes('grill') || tile.Type === ETileType.Grill) return '/hive-icons/grill.svg';
    if (name?.includes('hand mixer') || tile.Type === ETileType.Hand_Mixer) return '/hive-icons/hand-mixer.svg';
    if (name?.includes('heater') || tile.Type === ETileType.Heater) return '/hive-icons/heater.svg';
    if (name?.includes('humidifier') || tile.Type === ETileType.Humidifier) return '/hive-icons/humidifier.svg';
    if (name?.includes('ice maker') || tile.Type === ETileType.Ice_Maker) return '/hive-icons/ice-maker.svg';
    if (name?.includes('iron') || tile.Type === ETileType.Iron) return '/hive-icons/iron.svg';
    if (name?.includes('juicer') || tile.Type === ETileType.Juicer) return '/hive-icons/juicer.svg';
    if (name?.includes('kettle') || tile.Type === ETileType.Kettle) return '/hive-icons/kettle.svg';
    if (name?.includes('kitchen aid') || tile.Type === ETileType.KitchenAid) return '/hive-icons/kitchen-aid.svg';
    if (name?.includes('lawn mower') || tile.Type === ETileType.Lawn_Mower) return '/hive-icons/lawn-mower.svg';
    if (name?.includes('leaf blower') || tile.Type === ETileType.Leaf_Blower) return '/hive-icons/leaf-blower.svg';
    if (name?.includes('mini fridge') || name?.includes('minifridge') || tile.Type === ETileType.Mini_Fridge) return '/hive-icons/minifridge.svg';
    if (name?.includes('rice cooker') || tile.Type === ETileType.Rice_Cooker) return '/hive-icons/rice-cooker.svg';
    if (name?.includes('sauna') || tile.Type === ETileType.Sauna) return '/hive-icons/sauna.svg';
    if (name?.includes('space heater') || tile.Type === ETileType.Space_heater) return '/hive-icons/space-heater.svg';
    if (name?.includes('speakers') || tile.Type === ETileType.Speakers) return '/hive-icons/speakers.svg';
    if (name?.includes('stand mixer') || tile.Type === ETileType.Stand_Mixer) return '/hive-icons/stand-mixer.svg';
    if (name?.includes('steamer') || tile.Type === ETileType.Steamer) return '/hive-icons/steamer.svg';
    if (name?.includes('stove') || tile.Type === ETileType.Stove) return '/hive-icons/stove.svg';
    if (name?.includes('toaster oven') || tile.Type === ETileType.Toaster_Oven) return '/hive-icons/toaster-oven.svg';
    if (name?.includes('toaster') || tile.Type === ETileType.Toaster) return '/hive-icons/toaster.svg';
    if (name?.includes('trash compactor') || tile.Type === ETileType.Trash_Compactor) return '/hive-icons/trash-compactor.svg';
    if (name?.includes('vacuum') || name?.includes('vacuum cleaner') || tile.Type === ETileType.Vacuum_cleaner) return '/hive-icons/vacuum-cleaner.svg';
    if (name?.includes('waffle iron') || tile.Type === ETileType.Waffle_Iron) return '/hive-icons/waffle-iron.svg';
    if (name?.includes('water heater') || tile.Type === ETileType.Water_Heater) return '/hive-icons/water-heater.svg';
    if (name?.includes('weed eater') || tile.Type === ETileType.Weed_Eater) return '/hive-icons/weed-eater.svg';
    if (name?.includes('wet vac') || name?.includes('wet-vac') || tile.Type === ETileType.Wet_Vac) return '/hive-icons/wet-vac.svg';
    if (name?.includes('hot tub') || tile.Type === ETileType.Hot_Tub) return '/hive-icons/hot-tub.svg';
    // Default appliance icon
    return '/hive-icons/appliances.svg';
  }

  // For utilities, map specific types
  if (parentType === ETileType.Utilities || tile.Type === ETileType.Utilities) {
    const name = tile.Name?.toLowerCase();
    if (name?.includes('electric') || name?.includes('electricity')) return '/hive-icons/Electricity.svg';
    if (name?.includes('gas')) return '/hive-icons/Gas.svg';
    if (name?.includes('water')) return '/hive-icons/Water.svg';
    if (name?.includes('internet') || name?.includes('cable')) return '/hive-icons/Internet.svg';
    // Default utility icon
    return '/hive-icons/utilities.svg';
  }

  // For property info
  if (parentType === ETileType.Property_Info || tile.Type === ETileType.Property_Info) {
    const name = tile.Name?.toLowerCase();
    if (name?.includes('deed') || tile.Type === ETileType.Property_Deeds) return '/hive-icons/document.svg';
    if (name?.includes('ownership') || tile.Type === ETileType.Ownership_Records) return '/hive-icons/document.svg';
    if (name?.includes('mortgage') || tile.Type === ETileType.Mortgage) return '/hive-icons/mortage.svg';
    if (name?.includes('tax') || tile.Type === ETileType.Taxes) return '/hive-icons/taxes.svg';
    if (name?.includes('insurance') || tile.Type === ETileType.Insurance) return '/hive-icons/insurance.svg';
    // Default property info icon
    return '/hive-icons/document.svg';
  }

  // For spaces, map to room icons
  if (parentType === ETileType.Spaces || tile.Type === ETileType.Spaces) {
    const name = tile.Name?.toLowerCase();
    if (name?.includes('kitchen') || tile.Type === ETileType.Kitchen) return '/hive-icons/kitchen.svg';
    if (name?.includes('living') || tile.Type === ETileType.Living_space) return '/hive-icons/living-room.svg';
    if (name?.includes('bedroom') || tile.Type === ETileType.Bedroom) return '/hive-icons/bedroom.svg';
    if (name?.includes('bathroom') || tile.Type === ETileType.Bathroom) return '/hive-icons/bathroom.svg';
    if (name?.includes('garage') || tile.Type === ETileType.Garage) return '/hive-icons/garage.svg';
    if (name?.includes('garden') || tile.Type === ETileType.Garden) return '/hive-icons/garden.svg';
    if (name?.includes('laundry') || tile.Type === ETileType.Laundry) return '/hive-icons/laundry.svg';
    if (name?.includes('office') || tile.Type === ETileType.Office) return '/hive-icons/office.svg';
    if (name?.includes('attic') || tile.Type === ETileType.Attic) return '/hive-icons/attic.svg';
    if (name?.includes('basement') || tile.Type === ETileType.Basement) return '/hive-icons/basement.svg';
    if (name?.includes('dining') || tile.Type === ETileType.Dining_Room) return '/hive-icons/dining-room.svg';
    // Default room icon
    return '/hive-icons/room.svg';
  }

  // Default fallback
  return '/hive-icons/hive.svg';
};

const HiveSelectionModal: React.FC<HiveSelectionModalProps> = ({
  isVisible,
  onClose,
  onHiveSelect,
  multiSelect = true,
  initialSelectedHives = [],
  initialSelectedHive = null,
}) => {
  const { i18n } = useLanguageContext();
  const { user } = useAuth();

  // State for selected hives and tiles
  const [tiles, setTiles] = useState<INestedTile[]>([]);
  const [selectedHives, setSelectedHives] = useState<(INestedTile | Tile | User)[]>(initialSelectedHives);
  const [selectedHive, setSelectedHive] = useState<INestedTile | User | null>(initialSelectedHive);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Track if we've initialized the modal to avoid infinite loops
  const hasInitialized = useRef(false);
  // Track if we're currently fetching to prevent duplicate API calls
  const isFetching = useRef(false);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Handle hive selection
  const handleHiveSelect = (hive: INestedTile | User) => {
    if (multiSelect) {
      const isSelected = selectedHives.some(h => h.UniqueId === hive.UniqueId);
      if (isSelected) {
        setSelectedHives(prev => prev.filter(h => h.UniqueId !== hive.UniqueId));
      } else {
        setSelectedHives(prev => [...prev, hive]);
      }
    } else {
      // Single-select: replace current selection
      setSelectedHive(hive);
      setSelectedHives([hive]); // Keep array with single item for consistency
    }
  };

  // Handle save and close
  const handleSave = () => {
    if (multiSelect) {
      onHiveSelect(selectedHives, null);
    } else {
      // For single-select, send the selected hive as both array and single item
      onHiveSelect(selectedHives, selectedHive);
    }
    onClose();
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isVisible && !hasInitialized.current) {
      setSelectedHives(initialSelectedHives);
      setSelectedHive(initialSelectedHive);
      hasInitialized.current = true;
    } else if (!isVisible) {
      hasInitialized.current = false;
    }
  }, [isVisible, initialSelectedHives, initialSelectedHive]);

  // Fetch tiles from API
  useEffect(() => {
    const fetchTiles = async () => {
      if (!user?.id || !user?.accountId) {
        setError('User information not available');
        setIsLoading(false);
        return;
      }

      // Prevent multiple simultaneous API calls
      if (isFetching.current) {
        console.log('🚫 HiveSelectionModal: Already fetching, skipping duplicate call');
        return;
      }

      try {
        console.log('🔄 HiveSelectionModal: Starting API fetch for user:', user.id);
        isFetching.current = true;
        setIsLoading(true);
        setError(null);

        // Fetch all tiles once and filter locally to avoid multiple API calls
        const allTiles = await tileService.getAllTilesByUser(user.id, user.accountId);

        // Helper function to get tiles by parent type from the already fetched data
        const getTilesByParentTypeLocal = (parentType: number): INestedTile[] => {
          const parentTile = allTiles.find(tile => tile.Type === parentType && !tile.Deleted && tile.Active);
          if (!parentTile) return [];

          return allTiles.filter(tile =>
            tile.ParentUniqueId === parentTile.UniqueId &&
            !tile.Deleted &&
            tile.Active
          );
        };

        // Get tiles by type using local filtering
        const activeSpaceTiles = getTilesByParentTypeLocal(32); // Spaces
        const activeApplianceTiles = getTilesByParentTypeLocal(30); // Appliances
        const activeUtilityTiles = getTilesByParentTypeLocal(37); // Utilities
        const activePropertyInfoTiles = getTilesByParentTypeLocal(31); // Property Info



        // Use real property info tiles from the database
        const propertyInfoTiles: INestedTile[] = activePropertyInfoTiles.map(tile => ({
          Account_uniqueId: tile.Account_uniqueId,
          Active: tile.Active,
          Deleted: tile.Deleted,
          CreationTimestamp: tile.CreationTimestamp,
          Name: tile.Name,
          Type: tile.Type,
          UniqueId: tile.UniqueId,
          UpdateTimestamp: tile.UpdateTimestamp,
          User_uniqueId: tile.User_uniqueId,
          children: []
        }));

        // Use real utility tiles from the database
        const utilitiesTiles: INestedTile[] = activeUtilityTiles.map(tile => ({
          Account_uniqueId: tile.Account_uniqueId,
          Active: tile.Active,
          Deleted: tile.Deleted,
          CreationTimestamp: tile.CreationTimestamp,
          Name: tile.Name,
          Type: tile.Type,
          UniqueId: tile.UniqueId,
          UpdateTimestamp: tile.UpdateTimestamp,
          User_uniqueId: tile.User_uniqueId,
          children: []
        }));

        // Create a structured tile hierarchy for hive selection
        const structuredTiles: INestedTile[] = [];

        // Create House section with direct accordion subsections
        const houseAccordionSections: INestedTile[] = [
          // Appliances section
          {
            Account_uniqueId: user.accountId || '',
            Active: true,
            Deleted: false,
            CreationTimestamp: new Date().toISOString(),
            Name: 'Appliances',
            Type: ETileType.Appliances,
            UniqueId: 'appliances-section',
            UpdateTimestamp: new Date().toISOString(),
            User_uniqueId: user.id,
            children: activeApplianceTiles.map(tile => ({ ...tile, children: [] }))
          },
          // Property Info section
          {
            Account_uniqueId: user.accountId || '',
            Active: true,
            Deleted: false,
            CreationTimestamp: new Date().toISOString(),
            Name: 'Property Info',
            Type: ETileType.Property_Info,
            UniqueId: 'property-info-section',
            UpdateTimestamp: new Date().toISOString(),
            User_uniqueId: user.id,
            children: propertyInfoTiles
          },
          // Spaces section
          {
            Account_uniqueId: user.accountId || '',
            Active: true,
            Deleted: false,
            CreationTimestamp: new Date().toISOString(),
            Name: 'Spaces',
            Type: ETileType.Spaces,
            UniqueId: 'spaces-section',
            UpdateTimestamp: new Date().toISOString(),
            User_uniqueId: user.id,
            children: activeSpaceTiles.map(tile => ({ ...tile, children: [] }))
          },
          // Utilities section
          {
            Account_uniqueId: user.accountId || '',
            Active: true,
            Deleted: false,
            CreationTimestamp: new Date().toISOString(),
            Name: 'Utilities',
            Type: ETileType.Utilities,
            UniqueId: 'utilities-section',
            UpdateTimestamp: new Date().toISOString(),
            User_uniqueId: user.id,
            children: utilitiesTiles
          }
        ];

        // Add all accordion sections directly to the main tiles array
        structuredTiles.push(...houseAccordionSections);
        setTiles(structuredTiles);

        // Initialize expanded sections - start collapsed by default
        const initialExpanded: Record<string, boolean> = {};
        structuredTiles.forEach(tile => {
          initialExpanded[tile.UniqueId] = false; // Start with sections collapsed
        });
        setExpandedSections(initialExpanded);
      } catch (err) {
        console.error('Error fetching tiles:', err);
        setError('Failed to load hives. Please try again.');
      } finally {
        console.log('✅ HiveSelectionModal: API fetch completed for user:', user.id);
        isFetching.current = false;
        setIsLoading(false);
      }
    };

    if (isVisible && user?.id && user?.accountId) {
      console.log('🔍 HiveSelectionModal: useEffect triggered - isVisible:', isVisible, 'user.id:', user.id);
      fetchTiles();
    }
  }, [isVisible, user?.id, user?.accountId]);

  return (
    <Modal
      isVisible={isVisible}
      title={`${i18n.t("SelectAHive") || "Select a Hive"} ✨`}
      onClose={onClose}
      contentStyle={{
        maxHeight: '80vh',
        overflow: 'hidden',
      }}
      footerContent={
        <Button
          width="100%"
          disabled={multiSelect ? selectedHives.length === 0 : !selectedHive}
          textProps={{
            text: i18n.t("Save") || "Save",
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
        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px 20px',
            textAlign: 'center',
            gap: '20px',
          }}>
            <LoadingSpinner
              size={50}
              color={Colors.BLUE}
              borderWidth={4}
            />
            <CustomText
              style={{
                fontSize: FONT_SIZE_16,
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.PEARL,
              }}
            >
              {"Loading hives..."}
            </CustomText>
          </div>
        ) : error ? (
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
        ) : tiles && tiles.length > 0 ? (
          <div>
            {/* House Static Label */}
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
                  src="/hive-icons/house.svg"
                  alt={i18n.t('House')}
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
                  {i18n.t('House')}
                </CustomText>
              </div>

              {/* House Accordion Sections */}
              <div style={{ marginLeft: '20px' }}>
                {tiles
                  .filter((tile) => [ETileType.Appliances, ETileType.Property_Info, ETileType.Spaces, ETileType.Utilities].includes(tile.Type))
                  .map((accordionTile) => (
                    <div key={accordionTile.UniqueId} style={{ marginBottom: '15px' }}>
                      {/* Accordion Section Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 15px',
                          backgroundColor: Colors.WHITE,
                          borderRadius: '8px',
                          border: `1px solid ${Colors.LIGHT_GREY}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => toggleSection(accordionTile.UniqueId)}
                      >
                        <CustomText
                          style={{
                            flex: 1,
                            fontSize: FONT_SIZE_16,
                            fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                            color: Colors.BLACK,
                          }}
                        >
                          {accordionTile.Name}
                        </CustomText>
                        <div style={{
                          transform: expandedSections[accordionTile.UniqueId] ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '30px',
                          color: Colors.PEARL,
                          fontWeight: '300',
                        }}>
                          ›
                        </div>
                      </div>

                      {/* Accordion Section Expanded Content */}
                      {expandedSections[accordionTile.UniqueId] && (
                        <div style={{ marginLeft: '20px', marginTop: '10px' }}>
                          {/* Render accordion section children */}
                          {accordionTile.children && accordionTile.children.map((child) => {
                            const isSelected = multiSelect
                              ? selectedHives.some(h => h.UniqueId === child.UniqueId)
                              : selectedHive?.UniqueId === child.UniqueId;

                            return (
                              <div key={child.UniqueId} style={{ marginBottom: '8px' }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 12px',
                                    backgroundColor: isSelected ? Colors.LIGHT_BLUE_BACKGROUND : Colors.WHITE,
                                    borderRadius: '6px',
                                    border: isSelected ? `2px solid ${Colors.BLUE}` : `1px solid ${Colors.LIGHT_GREY}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                  }}
                                  onClick={() => handleHiveSelect(child)}
                                >
                                  <img
                                    src={getTileIcon(child, accordionTile.Type)}
                                    alt={child.Name}
                                    style={{ width: '18px', height: '18px', marginRight: '10px' }}
                                  />
                                  <CustomText
                                    style={{
                                      flex: 1,
                                      fontSize: 14,
                                      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                                      color: isSelected ? Colors.BLUE : Colors.BLACK,
                                    }}
                                  >
                                    {child.Name}
                                  </CustomText>
                                  {isSelected && (
                                    <img
                                      src="/hive-icons/checkmark.svg"
                                      alt="selected"
                                      style={{ width: '14px', height: '14px' }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
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
              {"No hives available"}
            </CustomText>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default HiveSelectionModal;
