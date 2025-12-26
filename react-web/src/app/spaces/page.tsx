'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import { useSearchParams } from 'next/navigation';
import Icon from '../../components/Icon';
import HiveHexTile from '../../components/HiveHexTile';
import DynamicGridLayout from '../../components/DynamicGridLayout';
import CustomText from '../../components/CustomText';
import { useAuth } from '../../context/AuthContext';

import SpaceEditModal from '../../components/SpaceEditModal';
import SpaceSelectionModal from '../../components/SpaceSelectionModal';
import { Colors, Typography } from '../../styles';
import { useTileStore } from '../../context/store';
import tileService, { PARENT_TILE_TYPES } from '../../services/tileService';
import { useSWRZ } from '../../hooks/useSWRZ';
import { INestedTile } from '../../util/types';
import { getSpaceIcon, generateUniqueSpaceName } from '../../util/spaceUtils';
import { useLanguageContext } from '../../context/LanguageContext';
import { translateTileLabel } from '../../util/translationUtils';

import { trackEvent, AmplitudeEvents } from '../../services/analytics';

const SpacesPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { i18n } = useLanguageContext();
  const tiles = useTileStore((s) => s.tiles);
  const setTiles = useTileStore((s) => s.setTiles);
  const [showSpaceEditModal, setShowSpaceEditModal] = useState(false);
  const [showSpaceSelectionModal, setShowSpaceSelectionModal] = useState(false);
  const isMobileApp = searchParams.get('mobile') === 'true';

  // Set page title and body class for styling
  useEffect(() => {
    document.title = 'Spaces - Eeva';
    document.body.classList.add('house-page-active');

    return () => {
      document.body.classList.remove('house-page-active');
    };
  }, []);

  // SWR-over-Zustand for tiles (fetch all once; filter per page)
  const { refresh } = useSWRZ({
    key: 'tiles',
    current: tiles,
    getLatest: () => useTileStore.getState().tiles,
    set: setTiles,
    fetcher: async () => {
      if (!user?.id || !user?.accountId) return tiles;
      return await tileService.getAllTilesByUser(user.id, user.accountId);
    },
  });

  // Handle space selection from modal
  const handleSpaceSelect = async (selectedSpace: INestedTile) => {
    if (!user?.id || !user?.accountId) {
      console.error('User information not available');
      return;
    }

    try {
      // Determine the Spaces parent tile and use its UniqueId as parentId
      const parentTile = tiles.find((t: any) => t.Type === PARENT_TILE_TYPES.SPACES && t.Active && !t.Deleted);
      const parentId = parentTile?.UniqueId || null;

      if (!parentId) {
        console.error('No SPACES parent tile found. Cannot create new space without parent.');
        alert('Unable to determine space parent ID. Please try again.');
        return;
      }

      // Generate a unique name for the space to handle duplicates
      const uniqueName = generateUniqueSpaceName(selectedSpace.Name, tiles);

      // Create the new space tile with all required fields
      const newTileData = {
        accountId: user.accountId,
        userId: user.id,
        parentId: parentId,
        type: selectedSpace.Type,
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

      console.log('🔍 Sending space tile data:', JSON.stringify(newTileData, null, 2));

      const response = await fetch('/api/tiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(newTileData),
      });

      if (response.ok) {
        // Refresh the spaces list (only after successful API response)
        await refresh();
        setShowSpaceSelectionModal(false);
        try { trackEvent(AmplitudeEvents.houseSpaceAdded, { type: selectedSpace.Type, name: uniqueName }); } catch {}
      } else {
        const errorText = await response.text();
        console.error('Failed to create space:', response.statusText, errorText);
        alert(`Failed to add space: ${response.statusText}. Please try again.`);
      }
    } catch (error) {
      console.error('Error creating space:', error);
      alert('Failed to add space. Please try again.');
    }
  };

  // Handle save from edit modal
  const handleSaveSpaces = async () => {
    await refresh();
    setShowSpaceEditModal(false);
  };

  // Map tiles to hex tile format (only space child tiles)
  const mappedTiles = React.useMemo(() => {
    const parent = tiles.find((t: any) => t.Type === PARENT_TILE_TYPES.SPACES && t.Active && !t.Deleted);
    const spaceTiles = parent
      ? tiles.filter((t: any) => t.ParentUniqueId === parent.UniqueId && t.Active && !t.Deleted)
      : [];

    const collator = new Intl.Collator(i18n.locale === 'fr' ? 'fr-CA' : 'en-US', { sensitivity: 'base' });

    const activeTiles = spaceTiles.sort((a: any, b: any) =>
      collator.compare(
        translateTileLabel({ type: a.Type, name: a.Name }, i18n),
        translateTileLabel({ type: b.Type, name: b.Name }, i18n)
      )
    );

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
        icon: getSpaceIcon(tile.Type),
        title: translateTileLabel({ type: tile.Type, name: tile.Name }, i18n),
      },
      onPress: () => {
        router.push(`/space-detail/${tile.UniqueId}?type=${tile.Type}`);
      },
    }));

    // Add empty tile for adding new items
    hexTiles.push({
      content: {
        icon: 'plus',
        title: i18n.t('Add') || 'Add',
      },
      onPress: () => {
        setShowSpaceSelectionModal(true);
      },
      emptyTile: true,
    });

    return hexTiles;
  }, [tiles, router, i18n.locale]);

  // Generate tiles per row using the 2-3-2-3 pattern
  const tilesPerRow = useMemo(() => {
    const generateHexTilesPerRow = (length: number): number[] => {
      const result: number[] = [];
      let totalTiles = 0;

      for (let i = 0; totalTiles < length; i++) {
        const tilesInRow = i % 2 === 0 ? 2 : 3; // 2-3-2-3 pattern
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

  // Remove skeleton loader - show content immediately

  return (
    <div className="spaces-container" style={{ backgroundColor: 'white' }}>
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
            {i18n.t('Spaces') || 'Spaces'}
          </CustomText>
        </div>

        <button
          onClick={() => setShowSpaceEditModal(true)}
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
          {/* Plus button with spaces icon overlay - centered horizontally, midpoint at top of background */}
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
            {/* Spaces icon overlay - centered within plus button */}
            <img
              src="/hive-icons/spaces.svg"
              width={36}
              height={36}
              alt="Spaces"
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

      {/* Space Selection Modal */}
      <SpaceSelectionModal
        isVisible={showSpaceSelectionModal}
        onClose={() => setShowSpaceSelectionModal(false)}
        onSpaceSelect={handleSpaceSelect}
        currentSpaces={tiles.filter(tile => tile.Active && !tile.Deleted)}
      />

      {/* Space Edit Modal */}
      <SpaceEditModal
        isVisible={showSpaceEditModal}
        onClose={() => setShowSpaceEditModal(false)}
        currentSpaces={tiles} // Pass all spaces so users can see and reactivate inactive ones
        onSave={handleSaveSpaces}
      />
    </div>
  );
};





/**
 * SpacesPage - The main component that wraps SpacesPageContent with Suspense
 */
const SpacesPage: React.FC = () => {
  return <SpacesPageContent />;
};

export default SpacesPage;
