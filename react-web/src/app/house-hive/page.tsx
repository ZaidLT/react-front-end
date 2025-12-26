'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import CustomText from '../../components/CustomText';
import ListViewCard from '../../components/ListViewCard';
import DynamicGridLayout from '../../components/DynamicGridLayout';

import Icon from '../../components/Icon';
import QuoteView from '../../components/QuoteView';
import EmptyStateCard from '../../components/EmptyStateCard';
import { Colors, Typography } from '../../styles';
import { ETileType, IQuote } from '../../util/types';
import { useLanguageContext } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { TILE_DATA_MAP } from '../../util/constants';
import taskService from '../../services/taskService';
import cachedUserService from '../../services/cachedUserService';
import { usePropertyInfoStore } from '../../context/store';
import { useIsMobileApp } from '../../hooks/useMobileDetection';
import './house-hive.css';
import { trackEvent, AmplitudeEvents } from '../../services/analytics';


interface Task {
  UniqueId: string;
  Title: string;
  Text?: string;
  Priority?: number;
  Deadline_DateTime?: string;
  Active: boolean;
  Deleted: boolean;
  type: string;
}

const HouseHivePage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { i18n } = useLanguageContext();
  const propertyInfoStore = usePropertyInfoStore();
  const isMobileApp = useIsMobileApp();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<IQuote[]>([]);
  // Track House tile page viewed (tile tapped)
  useEffect(() => {
    try { trackEvent(AmplitudeEvents.houseTileTapped); } catch {}
  }, []);

  const [isEmptyStateCardVisible, setIsEmptyStateCardVisible] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch house-related tasks and tiles
  useEffect(() => {
    const fetchTasksAndTiles = async () => {
      if (!user?.accountId) return;

      setIsLoadingTasks(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('No auth token found');
        }

        // Fetch tiles to get house tile structure
        const tilesResponse = await fetch(
          `/api/tiles/defaultSpaceTiles/${user.accountId}?accountId=${user.accountId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        let houseTileIds: string[] = [];
        if (tilesResponse.ok) {
          const tilesData = await tilesResponse.json();
          // Find house tile and get all its children tile IDs
          const houseTile = tilesData.find(
            (tile: any) => tile.Type === ETileType.House
          );
          if (houseTile && houseTile.children) {
            // Get all house-related tile IDs (including nested children)
            const getAllTileIds = (tiles: any[]): string[] => {
              let ids: string[] = [];
              tiles.forEach((tile) => {
                ids.push(tile.UniqueId);
                if (tile.children && tile.children.length > 0) {
                  ids = ids.concat(getAllTileIds(tile.children));
                }
              });
              return ids;
            };
            houseTileIds = getAllTileIds(houseTile.children);
          }
        }

        // Fetch tasks
        const response = await taskService.getTasksByUser(
          user.accountId,
          user.accountId,
          false
        );

        // Filter for house-related tasks using homeMembers (tile IDs)
        const houseTasks = response
          .filter((task: any) => {
            if (!task.Active || task.Deleted) return false;

            // Check if task has homeMembers that match house tile IDs
            if (task.homeMembers && Array.isArray(task.homeMembers)) {
              return task.homeMembers.some((tileId: string) =>
                houseTileIds.includes(tileId)
              );
            }

            // Fallback: check HomeMember_uniqueId field
            if (task.HomeMember_uniqueId) {
              return houseTileIds.includes(task.HomeMember_uniqueId);
            }

            return false;
          })
          .map((task: any) => ({
            ...task,
            type: 'Task',
          }));

        setTasks(houseTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks');
      } finally {
        setIsLoadingTasks(false);
      }
    };

    if (isAuthenticated && user) {
      fetchTasksAndTiles();
    }
  }, [isAuthenticated, user]);

  // Fetch quotes
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        // For now, use static quotes until we have a proper API endpoint
        const staticQuotes: IQuote[] = [
          {
            id: '1',
            attributes: {
              quote:
                'A house is made of walls and beams; a home is built with love and dreams.',
              author: 'Ralph Waldo Emerson',
              location: 'HouseHive',
            },
          },
          {
            id: '2',
            attributes: {
              quote:
                'Home is where love resides, memories are created, friends always belong, and laughter never ends.',
              author: 'Unknown',
              location: 'HouseHive',
            },
          },
          {
            id: '3',
            attributes: {
              quote:
                'The magic thing about home is that it feels good to leave, and it feels even better to come back.',
              author: 'Wendy Wunder',
              location: 'HouseHive',
            },
          },
        ];
        setQuotes(staticQuotes);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      }
    };

    fetchQuotes();
  }, []);

  // Prefetch property info data for instant loading
  useEffect(() => {
    const prefetchPropertyInfo = async () => {
      if (!user?.id || !user?.accountId) return;

      // Check if we already have valid cached data
      if (propertyInfoStore.isCacheValid(user.id)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Property info already cached, skipping prefetch');
        }
        return;
      }

      try {
        // Prefetch user data in background to get property situation
        const currentUser = await cachedUserService.getUserById(user.id, user.accountId);

        if (currentUser) {
          // Get propertySituation from fresh database data (most reliable)
          let databasePropertySituation =
            (currentUser as any).propertySituation ||
            (currentUser as any).property_situation ||
            currentUser.PropertySituation ||
            'Own'; // Default fallback

          // Cache the property situation from database (source of truth)
          propertyInfoStore.setPropertySituation(user.id, databasePropertySituation);

          // Also update browser storage to match database
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem('propertySituation', databasePropertySituation);
              document.cookie = `propertySituation=${databasePropertySituation}; path=/; max-age=86400; SameSite=Strict`;
            } catch (error) {
              console.error('Error updating browser storage during prefetch:', error);
            }
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('Prefetched and cached property situation from database:', databasePropertySituation);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Property info prefetch failed (non-critical):', error);
        }
        // Prefetch failure is non-critical - property-info page will handle fallbacks
      }
    };

    // Delay prefetch slightly to not interfere with critical page loading
    const prefetchTimer = setTimeout(prefetchPropertyInfo, 1000);
    return () => clearTimeout(prefetchTimer);
  }, [user?.id, user?.accountId, propertyInfoStore]);

  // Select random quote for HouseHive
  const quote = useMemo(() => {
    const filteredQuotes = quotes.filter(
      (quote) => quote.attributes.location === 'HouseHive'
    );
    return filteredQuotes.length > 0
      ? filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)]
      : {
          id: 'empty',
          attributes: { quote: '', author: '', location: '' },
        };
  }, [quotes]);

  // Define the four house hive tiles
  const houseHiveTiles = useMemo(() => {
    const tileTypes = [
      ETileType.Property_Info,
      ETileType.Appliances,
      ETileType.Spaces,
      ETileType.Utilities,
    ];

    return tileTypes.map((tileType) => {
      const tileData = TILE_DATA_MAP[tileType];
      return {
        content: {
          icon: tileData?.icon || 'house',
          title:
            tileType === ETileType.Property_Info ? (i18n.t('PropertyInfo') || 'Property Info') :
            tileType === ETileType.Appliances ? (i18n.t('Appliances') || 'Appliances') :
            tileType === ETileType.Spaces ? (i18n.t('Spaces') || 'Spaces') :
            tileType === ETileType.Utilities ? (i18n.t('Utilities') || 'Utilities') :
            (tileData?.title || 'Unknown'),
        },
        onPress: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Clicked on ${tileData?.title} tile`);
          }
          if (tileData?.onClick) {
            tileData.onClick({} as any, router.push);
          }
        },
      };
    });
  }, [router]);

  // Note: Background color is now handled by CSS custom properties via MobileThemeProvider
  // No need to directly set document.body.style.backgroundColor



  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="house-hive-container" style={{ backgroundColor: 'white' }}>

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
          onClick={() => router.push('/home')}
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
            {i18n.t('House')}
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
            {/* Home icon overlay - centered within plus button */}
            <img
              src="/icons/tab-bar/icon-tab-bar-home-on.svg"
              width={36}
              height={36}
              alt="Home"
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
          {houseHiveTiles.length === 0 ? (
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
              tilesPerRow={[2, 2]} // 2x2 grid for the four tiles
              tiles={houseHiveTiles}
              isMobile={isMobileApp}
              containerStyle={{ maxWidth: '600px' }}
              showAddTile={false} // Don't show add tiles on house-hive page
            />
          )}
        </div>
      </div>

      {/* Empty State Modal */}
      {isEmptyStateCardVisible && (
        <EmptyStateCard onClose={() => setIsEmptyStateCardVisible(false)} />
      )}


    </div>
  );
};

export default HouseHivePage;
