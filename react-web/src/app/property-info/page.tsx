'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import CustomText from '../../components/CustomText';
import DynamicGridLayout from '../../components/DynamicGridLayout';

import Icon from '../../components/Icon';
import HiveHexTile from '../../components/HiveHexTile';
import OverlayModal from '../../components/OverlayModal';
import OwnershipTypeModal from '../../components/OwnershipTypeModal';
import { Colors, Typography } from '../../styles';
import { ETileType } from '../../util/types';
import { useLanguageContext } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { TILE_DATA_MAP } from '../../util/constants';
import { usePropertyInfoStore, useTileStore } from '../../context/store';
import cachedUserService from '../../services/cachedUserService';
import { useIsMobileApp } from '../../hooks/useMobileDetection';
import tileService, { PARENT_TILE_TYPES } from '../../services/tileService';
import { INestedTile } from '../../util/types';
import { useSWRZ } from '../../hooks/useSWRZ';
import './property-info.css';

const PropertyInfoPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  const { i18n } = useLanguageContext();
  const propertyInfoStore = usePropertyInfoStore();
  const isMobileApp = useIsMobileApp();

  // State
  const [isShowOwnershipTypeModal, setIsShowOwnershipTypeModal] = useState(false);
  const [propertySituation, setPropertySituation] = useState<string>('');
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const tiles = useTileStore((s) => s.tiles);
  const setTiles = useTileStore((s) => s.setTiles);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // SWR-over-Zustand for tiles to populate property info children from the canonical tiles store
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



  // Initialize property situation with fresh database fetch (prioritizing accuracy)
  useEffect(() => {
    const fetchFreshPropertySituation = async () => {
      if (!isLoading && user?.id && user?.accountId) {
        try {
          // Force fresh fetch from database (no cache)
          const freshUserData = await cachedUserService.getUserById(user.id, user.accountId, true);

          if (freshUserData) {
            // Get property situation from fresh database data
            const freshPropertySituation =
              (freshUserData as any).propertySituation ||
              (freshUserData as any).property_situation ||
              freshUserData.PropertySituation ||
              'Own'; // Default fallback

            if (process.env.NODE_ENV === 'development') {
              console.log('Fresh property situation from database:', freshPropertySituation);
            }

            // Set the fresh value immediately
            setPropertySituation(freshPropertySituation);

            // Update cache with fresh database value
            propertyInfoStore.setPropertySituation(user.id, freshPropertySituation);

            // Update browser storage with fresh value
            if (typeof window !== 'undefined') {
              try {
                sessionStorage.setItem('propertySituation', freshPropertySituation);
                document.cookie = `propertySituation=${freshPropertySituation}; path=/; max-age=86400; SameSite=Strict`;
              } catch (error) {
                console.error('Error updating browser storage:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching fresh property situation:', error);
          // Fallback to default if fetch fails
          setPropertySituation('Own');
        } finally {
          setIsLoadingUserData(false);
        }
      }
    };

    fetchFreshPropertySituation();
  }, [user?.id, user?.accountId, isLoading]); // Only depend on user ID, account ID, and loading state

  // Fetch fresh user profile data in background (non-blocking)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoading && user && user.id) {
        try {
          // Fetch latest user profile data from backend (background refresh)
          const currentUser = await cachedUserService.getUserById(user.id, user.accountId);

          if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
            console.log('Fetched user profile data:', currentUser);
          }

          if (currentUser) {
            // Get propertySituation from fresh user data (try multiple field name formats)
            let userPropertySituation =
              (currentUser as any).propertySituation ||
              (currentUser as any).property_situation ||
              currentUser.PropertySituation ||
              '';

            // If not found in user data, check other storage locations as fallback
            if (!userPropertySituation && typeof window !== 'undefined') {
              userPropertySituation =
                sessionStorage.getItem('propertySituation') ||
                localStorage.getItem('propertySituation') ||
                '';
            }

            // Update with fresh data if different
            if (userPropertySituation && userPropertySituation !== propertySituation) {
              setPropertySituation(userPropertySituation);
              // Update cache with fresh data
              propertyInfoStore.setPropertySituation(user.id, userPropertySituation);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Don't update state on error - keep existing fallback data
        } finally {
          // Ensure loading is false regardless of API success/failure
          setIsLoadingUserData(false);
        }
      } else if (!isLoading && !user) {
        // User is not authenticated
        setIsLoadingUserData(false);
      }
    };

    // Only fetch if we don't already have property situation data
    if (!propertySituation) {
      fetchUserProfile();
    } else {
      // We have data, ensure loading is false
      setIsLoadingUserData(false);
    }
  }, [user, isLoading, propertySituation, propertyInfoStore]);

  // Define property info tiles based on ownership type
  const propertyInfoTiles = useMemo(() => {
    const tileTypes = propertySituation === 'Rent'
      ? [ETileType.Insurance, ETileType.Rent, ETileType.Lease]
      : [ETileType.Property_Deeds, ETileType.Mortgage, ETileType.Taxes, ETileType.Insurance];

    // Build lookup from canonical tiles store
    const parent = tiles.find((t: any) => t.Type === PARENT_TILE_TYPES.PROPERTY_INFO && t.Active && !t.Deleted);
    const propertyChildren: INestedTile[] = parent
      ? tiles.filter((t: any) => t.ParentUniqueId === parent.UniqueId && t.Active && !t.Deleted)
      : [];

    const mappedTiles = tileTypes.map(tileType => {
      const tileData = TILE_DATA_MAP[tileType];
      const actualTile = propertyChildren.find(tile => tile.Type === tileType);

      // Generate a deterministic UUID based on user ID and tile type for consistency
      const deterministicId = `${user?.id}-${tileType}`;
      const tileId = actualTile?.UniqueId || deterministicId;

      return {
        content: {
          icon: tileData?.icon || 'house',
          title:
            tileType === ETileType.Property_Deeds ? (i18n.t('PropertyDeeds') || 'Property Deeds') :
            tileType === ETileType.Mortgage ? (i18n.t('Mortgage') || 'Mortgage') :
            tileType === ETileType.Taxes ? (i18n.t('Taxes') || 'Taxes') :
            tileType === ETileType.Insurance ? (i18n.t('Insurance') || 'Insurance') :
            tileType === ETileType.Rent ? (i18n.t('Rent') || 'Rent') :
            tileType === ETileType.Lease ? (i18n.t('Lease') || 'Lease') :
            (tileData?.title || 'Unknown'),
        },
        onPress: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Clicked on ${tileData?.title} tile`);
          }
          if (tileData?.onClick) {
            const tileObject = {
              UniqueId: tileId,
              Type: tileType,
              Name: tileData.title,
              User_uniqueId: user?.id || '',
              Account_uniqueId: user?.accountId || '',
              Active: true,
              CreationTimestamp: actualTile?.CreationTimestamp || new Date().toISOString(),
              Deleted: false,
              UpdateTimestamp: actualTile?.UpdateTimestamp || new Date().toISOString(),
            };
            tileData.onClick(tileObject, router.push);
          }
        },
      };
    });

    return mappedTiles;
  }, [propertySituation, user?.id, user?.accountId, tiles]);

  // Note: Background color is now handled by CSS custom properties via MobileThemeProvider
  // No need to directly set document.body.style.backgroundColor

  // Performance logging
  if (process.env.NODE_ENV === 'development') {
    const hasPropertyCache = user?.id ? propertyInfoStore.getPropertySituation(user.id) : null;
    const hasUserCache = user?.id ? cachedUserService.isCached(user.id) : false;
    const propertyCacheStatus = hasPropertyCache ? 'HIT' : 'MISS';
    const userCacheStatus = hasUserCache ? 'HIT' : 'MISS';
    console.log(`Property Info Page - Property Cache: ${propertyCacheStatus}, User Cache: ${userCacheStatus}, Loading: ${isLoadingUserData}, Data: ${!!propertySituation}`);
  }



  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="property-info-container" style={{ backgroundColor: 'white' }}>
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
            {i18n.t('PropertyInfo') || 'Property Info'}
          </CustomText>
        </div>

        <button
          onClick={() => setIsShowOwnershipTypeModal(true)}
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
          {/* Plus button with home icon overlay - centered horizontally, midpoint at top of background */}
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
            {/* Property info icon overlay - centered within plus button */}
            <img
              src="/icons/icon-property-info.svg"
              width={36}
              height={36}
              alt="Property Info"
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
          {propertyInfoTiles.length === 0 ? (
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
              tilesPerRow={propertySituation === 'Rent' ? [2, 1] : [2, 2]} // For rent: 2 on top (Insurance, Rent), 1 on bottom (Lease). For own: 2x2 grid
              tiles={propertyInfoTiles}
              isMobile={isMobileApp}
              containerStyle={{ maxWidth: '600px' }}
              showAddTile={false}
            />
          )}
        </div>
      </div>

      {/* Ownership Type Modal */}
      <OwnershipTypeModal
        isVisible={isShowOwnershipTypeModal}
        onClose={() => setIsShowOwnershipTypeModal(false)}
        onConfirm={(ownershipType) => {
          // Update local state to reflect the saved value
          setPropertySituation(ownershipType);
          // Update property info store
          if (user?.id) {
            propertyInfoStore.setPropertySituation(user.id, ownershipType);
          }
        }}
        initialSelection={(propertySituation as 'Own' | 'Rent') || 'Own'}
      />
    </div>
  );
};

export default PropertyInfoPage;
