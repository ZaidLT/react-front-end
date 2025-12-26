'use client';

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import { useSearchParams } from 'next/navigation';
import Icon from '../../components/Icon';
import HiveHexTile from '../../components/HiveHexTile';
import DynamicGridLayout from '../../components/DynamicGridLayout';
import ApplianceSelectionModal from '../../components/ApplianceSelectionModal';
import ApplianceEditModal from '../../components/ApplianceEditModal';
import { useAuth } from '../../context/AuthContext';
import { INestedTile, ETileType } from '../../util/types';
import { generateUniqueApplianceName } from '../../util/applianceUtils';
import { Colors, Typography } from '../../styles';
import CustomText from '../../components/CustomText';
import { useTileStore } from '../../context/store';
import tileService, { PARENT_TILE_TYPES } from '../../services/tileService';
import { useSWRZ } from '../../hooks/useSWRZ';

  import { useLanguageContext } from '../../context/LanguageContext';
  import { translateApplianceLabel } from '../../util/translationUtils';

import { trackEvent, AmplitudeEvents } from '../../services/analytics';


const AppliancesPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { i18n } = useLanguageContext();

  const { user } = useAuth();
  const tiles = useTileStore((s) => s.tiles);
  const setTiles = useTileStore((s) => s.setTiles);
  const [showApplianceSelectionModal, setShowApplianceSelectionModal] = useState(false);
  const [showApplianceEditModal, setShowApplianceEditModal] = useState(false);
  const isMobileApp = searchParams.get('mobile') === 'true';

  // Set page title and body class for styling
  useEffect(() => {
    document.title = 'Appliances - Eeva';
    document.body.classList.add('house-page-active');

    return () => {
      document.body.classList.remove('house-page-active');
    };
  }, []);

  // SWR-over-Zustand: load from cache immediately, verify via API, update only on change
  const { refresh } = useSWRZ({
    key: 'tiles',
    current: tiles,
    getLatest: () => useTileStore.getState().tiles,
    set: setTiles,
    fetcher: async () => {
      if (!user?.id || !user?.accountId) return tiles;
      // Fetch once for all tiles and keep store canonical
      return await tileService.getAllTilesByUser(user.id, user.accountId);
    },
  });

  // Handle appliance selection from modal
  const handleApplianceSelect = async (selectedAppliance: INestedTile) => {
    if (!user?.id || !user?.accountId) {
      console.error('User information not available');
      return;
    }

    try {
      // Get the parentId from existing appliances (they should all have the same parent)
      const parentId = tiles.length > 0
        ? (tiles[0] as any).ParentUniqueId
        : null;

      if (!parentId) {
        console.error('No parent ID found for appliances. Cannot create new appliance without parent.');
        alert('Unable to determine appliance parent ID. Please try again.');
        return;
      }

      // Generate a unique name for the appliance to handle duplicates
      const uniqueName = generateUniqueApplianceName(selectedAppliance.Name, tiles);

      // Create the new appliance tile with all required fields (matching ApplianceEditModal)
      const newTileData = {
        accountId: user.accountId,
        userId: user.id,
        parentId: parentId,
        type: selectedAppliance.Type,
        name: uniqueName,
        avatarImagePath: "",
        electronicDeviceBrandModel: "",
        electronicDeviceSerialNumber: "",
        electronicDevicePurchaseDate: new Date().toISOString(),
        electronicDeviceEndOfWarranty: new Date().toISOString(),
        transferOwnershipToEmailAddress: "",
        brand: "",
        typeId: "",
        manualPdfUrl: ""
      };

      console.log('🔍 Sending tile data:', JSON.stringify(newTileData, null, 2));

      const response = await fetch('/api/tiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(newTileData),
      });

      if (response.ok) {
        // Refresh the appliances list
        await refresh();
        setShowApplianceSelectionModal(false);
        try { trackEvent(AmplitudeEvents.houseApplianceAdded, { type: selectedAppliance.Type, name: uniqueName }); } catch {}
      } else {
        const errorText = await response.text();
        console.error('Failed to create appliance:', response.statusText, errorText);
        alert(`Failed to add appliance: ${response.statusText}. Please try again.`);
      }
    } catch (error) {
      console.error('Error creating appliance:', error);
      alert('Failed to add appliance. Please try again.');
    }
  };

  // Handle saving appliances from edit modal
  const handleSaveAppliances = useCallback(async () => {
    // Refresh the appliances list after successful save
    await refresh();
  }, [refresh]);

  // Function to get the correct icon for an appliance tile based on its type
  const getApplianceIcon = (tile: INestedTile): string => {
    const name = tile.Name?.toLowerCase();

    // Map based on tile type first, then fallback to name matching
    switch (tile.Type) {
      case ETileType.Air_conditioner:
        return 'air-conditioner';
      case ETileType.Dishwasher:
        return 'dishwasher';
      case ETileType.Dryer:
        return 'dryer';
      case ETileType.Washing_machine:
        return 'washing-machine';
      case ETileType.Fridge:
      case ETileType.Refrigerator:
        return 'refrigerator';
      case ETileType.Oven:
        return 'oven';
      case ETileType.Microwave:
        return 'microwave';
      case ETileType.Blender:
        return 'blender';
      case ETileType.Air_fryer:
        return 'air-fryer';
      case ETileType.Air_purifier:
        return 'air-purifier';
      case ETileType.Bread_Maker:
        return 'bread-maker';
      case ETileType.Ceiling_Fan:
        return 'ceiling-fan';
      case ETileType.Electric_fan:
        return 'ceiling-fan'; // Use ceiling fan icon for electric fan
      case ETileType.Coffee_maker:
        return 'coffee-maker';
      case ETileType.Crock_Pot:
        return 'crock-pot';
      case ETileType.Dehumidifier:
        return 'dehumidifier';
      case ETileType.Espresso_Maker:
        return 'espresso-maker';
      case ETileType.Fireplace:
        return 'fireplace';
      case ETileType.Flatscreen_TV:
        return 'flatscreen-tv';
      case ETileType.Food_processor:
        return 'food-processor';
      case ETileType.Freezer:
        return 'freezer';
      case ETileType.Furnace:
        return 'furnace';
      case ETileType.Generator:
        return 'generator';
      case ETileType.Grill:
        return 'grill';
      case ETileType.Hand_Mixer:
        return 'hand-mixer';
      case ETileType.Heater:
        return 'heater';
      case ETileType.Hot_Tub:
        return 'hot-tub';
      case ETileType.Humidifier:
        return 'humidifier';
      case ETileType.Ice_Maker:
        return 'ice-maker';
      case ETileType.Iron:
        return 'iron';
      case ETileType.Juicer:
        return 'juicer';
      case ETileType.Kettle:
        return 'kettle';
      case ETileType.KitchenAid:
        return 'kitchen-aid';
      case ETileType.Lawn_Mower:
        return 'lawn-mower';
      case ETileType.Leaf_Blower:
        return 'leaf-blower';
      case ETileType.Mini_Fridge:
        return 'minifridge';
      case ETileType.Rice_Cooker:
        return 'rice-cooker';
      case ETileType.Sauna:
        return 'sauna';
      case ETileType.Space_heater:
        return 'space-heater';
      case ETileType.Speakers:
        return 'speakers';
      case ETileType.Stand_Mixer:
        return 'stand-mixer';
      case ETileType.Steamer:
        return 'steamer';
      case ETileType.Stove:
        return 'stove';
      case ETileType.Toaster:
        return 'toaster';
      case ETileType.Toaster_Oven:
        return 'toaster-oven';
      case ETileType.Trash_Compactor:
        return 'trash-compactor';
      case ETileType.Vacuum_cleaner:
        return 'vacuum-cleaner';
      case ETileType.Waffle_Iron:
        return 'waffle-iron';
      case ETileType.Water_Heater:
        return 'water-heater';
      case ETileType.Weed_Eater:
        return 'weed-eater';
      case ETileType.Wet_Vac:
        return 'wet-vac';
      default:
        // Fallback to name-based matching if type doesn't match
        if (name?.includes('air conditioner')) return 'air-conditioner';
        if (name?.includes('dishwasher')) return 'dishwasher';
        if (name?.includes('dryer')) return 'dryer';
        if (name?.includes('washing machine') || name?.includes('washer')) return 'washing-machine';
        if (name?.includes('refrigerator') || name?.includes('fridge')) return 'refrigerator';
        if (name?.includes('oven')) return 'oven';
        if (name?.includes('microwave')) return 'microwave';
        if (name?.includes('blender')) return 'blender';
        if (name?.includes('air fryer')) return 'air-fryer';
        if (name?.includes('air purifier')) return 'air-purifier';
        return 'appliances'; // Default appliance icon
    }
  };

  // Map tiles to hex tile format (only appliance child tiles)
  const mappedTiles = React.useMemo(() => {
    // Find appliances parent tile
    const parent = tiles.find((t: any) => t.Type === PARENT_TILE_TYPES.APPLIANCES && t.Active && !t.Deleted);
    const applianceTiles = parent
      ? tiles.filter((t: any) => t.ParentUniqueId === parent.UniqueId && t.Active && !t.Deleted)
      : [];

    const activeTiles = applianceTiles.sort((a: any, b: any) => a.Name.localeCompare(b.Name));

    interface HexTile {
      content: {
        icon: string;
        title: string;
      };
      onPress: () => void;
      emptyTile?: boolean;
    }

    const hexTiles: HexTile[] = activeTiles.map((tile) => ({
      content: {
        icon: getApplianceIcon(tile),
        title: translateApplianceLabel({ type: tile.Type, name: tile.Name }, i18n),
      },
      onPress: () => {
        router.push(`/appliance-detail/${tile.UniqueId}?type=${tile.Type}`);
      },
    }));

    // Add empty tile for adding new items
    hexTiles.push({
      content: {
        icon: 'plus',
        title: i18n.t('Add') || 'Add',
      },
      onPress: () => {
        setShowApplianceSelectionModal(true);
      },
      emptyTile: true,
    });

    return hexTiles;
  }, [tiles, router]);

  // Generate tiles per row using the 2-3-2-3 pattern
  const tilesPerRow = useMemo(() => {
    const generateHexTilesPerRow = (length: number): number[] => {
      const result: number[] = [];
      let totalTiles = 0;

      for (let i = 0; totalTiles < length; i++) {
        const tilesInRow = i % 2 === 0 ? 2 : 3;
        result.push(tilesInRow);
        totalTiles += tilesInRow;
      }

      return result;
    };

    return generateHexTilesPerRow(mappedTiles.length);
  }, [mappedTiles.length]);

  const handleBack = () => {
    router.push('/house-hive');
  };



  return (
    <div className="appliances-container" style={{ backgroundColor: 'white' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          padding: isMobileApp ? '16px' : '20px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => router.push('/house-hive')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src="/icons/icon-menu-back.svg"
            width={24}
            height={24}
            alt="Back"
            style={{ cursor: 'pointer' }}
          />
        </button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
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
            {i18n.t('Appliances') || 'Appliances'}
          </CustomText>
        </div>

        <button
          onClick={() => setShowApplianceEditModal(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            width: '24px',
            height: '24px',
          }}
        >
          <Icon name="edit-pen-paper" width={24} height={24} color={Colors.BLUE} />
        </button>
      </div>

      {/* Areas div */}
      <div style={{ marginTop: '66px' }}>
        {/* Background */}
        <div style={{
          backgroundImage: 'url(/backgrounds/home-background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          height: '100vh',
          position: 'relative',
        }}>
          {/* Plus button with appliances icon overlay - centered horizontally, midpoint at top of background */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70.892px',
            height: '82.708px',
            flexShrink: 0,
            zIndex: 10,
          }}>
            {/* Plus button background */}
            <img
              src="/icons/tab-bar/icon-tab-bar-plus-button.svg"
              width={70.892}
              height={82.708}
              alt="Plus Button"
              style={{
                width: '70.892px',
                height: '82.708px',
                flexShrink: 0,
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
            {/* Appliances icon overlay - centered within plus button */}
            <img
              src="/hive-icons/appliances.svg"
              width={36}
              height={36}
              alt="Appliances"
              style={{
                width: '36px',
                height: '36px',
                flexShrink: 0,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 11,
              }}
            />
          </div>

          {/* Hex tiles */}
          {mappedTiles.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                width: '100%',
              }}
            >
              <CustomText style={{ color: Colors.DARK_GREY }}>
                No tiles found
              </CustomText>
            </div>
          ) : (
            <DynamicGridLayout
              tilesPerRow={tilesPerRow} // 2-3-2-3 pattern
              tiles={mappedTiles}
              isMobile={isMobileApp}
              containerStyle={{ maxWidth: '600px' }}
            />
          )}
        </div>
      </div>

      {/* Appliance Selection Modal */}
      <ApplianceSelectionModal
        isVisible={showApplianceSelectionModal}
        onClose={() => setShowApplianceSelectionModal(false)}
        onApplianceSelect={handleApplianceSelect}
        currentAppliances={tiles.filter(tile => tile.Active && !tile.Deleted)}
      />

      {/* Appliance Edit Modal */}
      <ApplianceEditModal
        isVisible={showApplianceEditModal}
        onClose={() => setShowApplianceEditModal(false)}
        currentAppliances={tiles} // Pass all appliances so users can see and reactivate inactive ones
        onSave={handleSaveAppliances}
      />
    </div>
  );
};





// Wrapper component with Suspense boundary
const AppliancesPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppliancesPageContent />
    </Suspense>
  );
};

export default AppliancesPage;
