'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import { useSearchParams } from 'next/navigation';
import Icon from '../../components/Icon';
import HiveHexTile from '../../components/HiveHexTile';
import DynamicGridLayout from '../../components/DynamicGridLayout';
import CustomText from '../../components/CustomText';
import { useAuth } from '../../context/AuthContext';
import { Colors, Typography } from '../../styles';
import { UTILITY_TILES_TYPES } from '../../util/utilityUtils';
import tileService, { PARENT_TILE_TYPES } from '../../services/tileService';
import { useTileStore } from '../../context/store';
import { useSWRZ } from '../../hooks/useSWRZ';
import { useLanguageContext } from '../../context/LanguageContext';
import { translateTileLabel } from '../../util/translationUtils';


const UtilitiesPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { i18n } = useLanguageContext();
  const tiles = useTileStore((s) => s.tiles);
  const setTiles = useTileStore((s) => s.setTiles);
  const [providers, setProviders] = useState<any[]>([]);
  const isMobileApp = searchParams.get('mobile') === 'true';

  // Set page title and body class for styling
  useEffect(() => {
    document.title = 'Utilities - Eeva';
    document.body.classList.add('house-page-active');

    return () => {
      document.body.classList.remove('house-page-active');
    };
  }, []);

  // Debug: log initial tiles order and subsequent changes
  useEffect(() => {
    const ids = tiles.map((t: any) => t.UniqueId);
    console.log('[Utilities] initial render tiles ids:', ids);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const parent = tiles.find((t: any) => t.Type === PARENT_TILE_TYPES.UTILITIES && t.Active && !t.Deleted);
    const realTiles = parent ? tiles.filter((t: any) => t.ParentUniqueId === parent.UniqueId && t.Active && !t.Deleted) : [];
    const ids = realTiles.map((t: any) => t.UniqueId);
    const names = realTiles.map((t: any) => t.Name);
    console.log('[Utilities] tiles slice updated; child ids:', ids, 'names:', names, 'count:', realTiles.length);
  }, [tiles]);
  // SWR-over-Zustand for tiles
  useSWRZ({
    key: 'tiles',
    current: tiles,
    getLatest: () => useTileStore.getState().tiles,
    set: setTiles,
    fetcher: async () => {
      if (!user?.id || !user?.accountId) return tiles;
      return await tileService.getAllTilesByUser(user.id, user.accountId);
    },
  });

  // Lazy load providers in the background
  useEffect(() => {
    const loadProviders = async () => {
      if (!user?.id || !user?.accountId) return;

      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/providers?userId=${user.id}&accountId=${user.accountId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProviders(data || []);

          // Store providers in sessionStorage for quick access
          sessionStorage.setItem('cached_providers', JSON.stringify(data || []));
        } else {
          console.error('Failed to load providers:', response.statusText);
        }
      } catch (error) {
        console.error('Error loading providers:', error);
      }
    };

    loadProviders();
  }, [user?.id, user?.accountId]);

  // Map utility tiles: prefer real tiles from store; otherwise fallback to static list
  const mappedTiles = React.useMemo(() => {
    interface HexTile {
      content: {
        icon: string;
        title: string;
      };
      onPress: () => void;
      emptyTile?: boolean;
    }

    const parent = tiles.find((t: any) => t.Type === PARENT_TILE_TYPES.UTILITIES && t.Active && !t.Deleted);
    const realTiles = parent
      ? tiles.filter((t: any) => t.ParentUniqueId === parent.UniqueId && t.Active && !t.Deleted)
      : [];

    if (realTiles.length > 0) {
      // Locale-aware sort by translated label
      const collator = new Intl.Collator(i18n.locale === 'fr' ? 'fr-CA' : 'en-US', { sensitivity: 'base' });
      const stable = [...realTiles].sort((a: any, b: any) =>
        collator.compare(
          translateTileLabel({ type: a.Type, name: a.Name }, i18n),
          translateTileLabel({ type: b.Type, name: b.Name }, i18n)
        )
      );
      const hexTiles: HexTile[] = stable.map((tile: any) => {
        const matchingProvider = Array.isArray(providers) && providers.length > 0
          ? providers.find(p => p.utilityTypes?.toLowerCase() === tile.Name?.toLowerCase())
          : null;
        const utilityType = UTILITY_TILES_TYPES.find(u => u.name.toLowerCase() === tile.Name?.toLowerCase());
        const icon = utilityType?.icon || 'utilities';
        const label = translateTileLabel({ type: tile.Type, name: tile.Name }, i18n);
        return {
          content: { icon, title: label },
          onPress: () => {
            if (matchingProvider) {
              sessionStorage.setItem('current_utility_provider', JSON.stringify(matchingProvider));
            }
            router.push(`/utility-detail/${tile.Name.toLowerCase()}?tileId=${tile.UniqueId}&type=${tile.Type}`);
          },
        };
      });
      return hexTiles;
    }

    // Fallback to hardcoded utility types if no real tiles found
    const collator = new Intl.Collator(i18n.locale === 'fr' ? 'fr-CA' : 'en-US', { sensitivity: 'base' });
    const hexTiles: HexTile[] = UTILITY_TILES_TYPES.map((utility) => {
      const matchingProvider = Array.isArray(providers) && providers.length > 0
        ? providers.find(p => p.utilityTypes?.toLowerCase() === utility.name.toLowerCase())
        : null;
      const label = translateTileLabel({ name: utility.name }, i18n);
      return {
        content: { icon: utility.icon, title: label },
        onPress: () => {
          if (matchingProvider) {
            sessionStorage.setItem('current_utility_provider', JSON.stringify(matchingProvider));
          }
          router.push(`/utility-detail/${utility.name.toLowerCase()}?type=${utility.type}`);
        },
      };
    }).sort((a, b) => collator.compare(a.content.title, b.content.title));

    return hexTiles;
  }, [router, providers, tiles]);

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
    <div className="utilities-container" style={{ backgroundColor: 'white' }}>
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
            {i18n.t('Utilities')}
          </CustomText>
        </div>

        <div style={{ width: '24px', height: '24px' }} />
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
          {/* Plus button with utilities icon overlay - centered horizontally, midpoint at top of background */}
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
            {/* Utilities icon overlay - centered within plus button */}
            <img
              src="/hive-icons/utilities.svg"
              width={36}
              height={36}
              alt="Utilities"
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
              showAddTile={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};





/**
 * UtilitiesPage - The main component that wraps UtilitiesPageContent with Suspense
 */
const UtilitiesPage: React.FC = () => {
  return <UtilitiesPageContent />;
};

export default UtilitiesPage;
