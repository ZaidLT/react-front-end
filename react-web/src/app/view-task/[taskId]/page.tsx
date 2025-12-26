'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import CustomText from '../../../components/CustomText';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { ViewTaskSkeleton } from '../../../components/SkeletonLoader';
import DateTimeDisplay from '../../../components/DateTimeDisplay';
import { Colors, Typography } from '../../../styles';
import { useLanguageContext } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { ITTask } from '../../../services/types';
import taskService from '../../../services/taskService';
import { DeleteTaskRequest } from '../../../services/types/task';
import { useTaskStore, useFamilyStore } from '../../../context/store';
import { PRIORITY_ITEMS, REMINDER_OPTIONS } from '../../../util/constants';
import { getPropertyFrequency, getInitials } from '../../../util/helpers';
import { ETileType } from '../../../util/types';
import tileService from '../../../services/tileService';
import { FamilyMember } from '../../../services/familyService';

// Helper function to map tile type to icon path
const getTileIconByType = (tileType: number): string => {
  switch (tileType) {
    // Appliances
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
    case ETileType.Electric_fan:
      return '/hive-icons/ceiling-fan.svg'; // Use ceiling fan icon for electric fan
    case ETileType.Coffee_maker:
      return '/hive-icons/coffee-maker.svg';
    case ETileType.Crock_Pot:
      return '/hive-icons/crock-pot.svg';
    case ETileType.Dehumidifier:
      return '/hive-icons/dehumidifier.svg';
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

    // Spaces
    case ETileType.Kitchen:
      return '/hive-icons/kitchen.svg';
    case ETileType.Living_space:
      return '/hive-icons/living-room.svg';
    case ETileType.Bedroom:
      return '/hive-icons/bedroom.svg';
    case ETileType.Bathroom:
      return '/hive-icons/bathroom.svg';
    case ETileType.Garage:
      return '/hive-icons/garage.svg';
    case ETileType.Garden:
      return '/hive-icons/garden.svg';

    // Main tiles
    case ETileType.House:
      return '/hive-icons/house.svg';
    case ETileType['My Hive']:
      return '/hive-icons/family.svg';
    case ETileType.EevaHive:
      return '/hive-icons/eeva-logo.svg';

    default:
      return '/hive-icons/hive.svg';
  }
};

// Cache for tile data to avoid repeated API calls
const tileCache = new Map<string, any>();

// Component to display hive information with async loading
const HiveDisplay: React.FC<{ tileId?: string; accountId?: string }> = ({
  tileId,
  accountId,
}) => {
  const { user } = useAuth();
  const { i18n } = useLanguageContext();
  const [hiveIcon, setHiveIcon] = useState<string>('/hive-icons/hive.svg');
  const [hiveName, setHiveName] = useState<string>(i18n.t('LoadingEllipsis'));

  useEffect(() => {
    const loadTileData = async () => {
      console.log('🔍 HiveDisplay: Loading tile data for:', {
        tileId,
        accountId,
        userId: user?.id,
      });

      if (!tileId || !accountId || !user?.id) {
        console.log(
          '🔍 HiveDisplay: Missing required data, showing Unknown Hive'
        );
        setHiveIcon('/hive-icons/hive.svg');
        setHiveName(i18n.t('UnknownHive'));
        return;
      }

      try {
        // Check cache first - TEMPORARILY DISABLED FOR DEBUGGING
        // if (tileCache.has(tileId)) {
        //   console.log('🔍 HiveDisplay: Found tile in cache');
        //   const tile = tileCache.get(tileId);
        //   setHiveIcon(getTileIconByType(tile.Type));
        //   setHiveName(tile.Name || 'Unknown Hive');
        //   return;
        // }

        console.log('🔍 HiveDisplay: Fetching tile from API...');
        // Fetch tile data from API
        const tile = await tileService.getTileById(tileId, accountId, user.id);
        console.log('🔍 HiveDisplay: API response:', tile);

        if (tile) {
          console.log('🔍 HiveDisplay: Successfully loaded tile:', tile.Name);
          tileCache.set(tileId, tile);
          setHiveIcon(getTileIconByType(tile.Type));
          setHiveName(tile.Name || i18n.t('UnknownHive'));
        } else {
          console.log('🔍 HiveDisplay: No tile data returned from API');
          setHiveIcon('/hive-icons/hive.svg');
          setHiveName(i18n.t('UnknownHive'));
        }
      } catch (error) {
        console.error('🔍 HiveDisplay: Error fetching tile data:', error);
        setHiveIcon('/hive-icons/hive.svg');
        setHiveName(i18n.t('UnknownHive'));
      }
    };

    loadTileData();
  }, [tileId, accountId, user?.id]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <img
        src={hiveIcon}
        alt='hive'
        style={{ width: '20px', height: '20px' }}
      />
      <CustomText
        style={{
          fontSize: Typography.FONT_SIZE_16,
          fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
          color: Colors.BLUE,
        }}
      >
        {hiveName}
      </CustomText>
    </div>
  );
};

// Component to display assigned family members with async loading
const AssignedMembersDisplay: React.FC<{
  homeMembers?: string[];
  accountId?: string;
}> = ({ homeMembers, accountId }) => {
  const { user } = useAuth();
  const { i18n } = useLanguageContext();
  const [assignedMembers, setAssignedMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAssignedMembers = async () => {
      console.log('🔍 AssignedMembersDisplay: Loading assigned members for:', {
        homeMembers,
        accountId,
        userId: user?.id,
      });

      if (!homeMembers || homeMembers.length === 0 || !accountId || !user?.id) {
        console.log(
          '🔍 AssignedMembersDisplay: No assigned members or missing required data'
        );
        setAssignedMembers([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(
          '🔍 AssignedMembersDisplay: Fetching member details from API...'
        );

        // Fetch family member details for each ID
        const memberPromises = homeMembers.map(async (memberId: string) => {
          try {
            const response = await fetch(
              `/api/users/${memberId}?accountId=${accountId}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
              }
            );

            if (response.ok) {
              const memberData = await response.json();

              // Convert to FamilyMember format
              const familyMember: FamilyMember = {
                id: memberData.id || memberData.UniqueId,
                accountId: memberData.accountId || memberData.Account_uniqueId,
                emailAddress:
                  memberData.emailAddress || memberData.EmailAddress,
                firstName: memberData.firstName || memberData.FirstName,
                lastName: memberData.lastName || memberData.LastName,
                displayName:
                  memberData.displayName || memberData.DisplayName || '',
                language: memberData.language || memberData.Language || 0,
                avatarImagePath:
                  memberData.avatarImagePath ||
                  memberData.AvatarImagePath ||
                  '',
                displayMode:
                  memberData.displayMode || memberData.DisplayMode || 0,
                activeUser:
                  memberData.activeUser ?? memberData.ActiveUser ?? true,
                address: memberData.address || memberData.Address || '',
                streetName:
                  memberData.streetName || memberData.StreetName || '',
                city: memberData.city || memberData.City || '',
                state: memberData.state || memberData.State || '',
                country: memberData.country || memberData.Country || '',
                zipCode: memberData.zipCode || memberData.ZipCode || '',
                birthday: memberData.birthday || memberData.Birthday || '',
                workplace: memberData.workplace || memberData.Workplace || '',
                cellPhoneNumber:
                  memberData.cellPhoneNumber ||
                  memberData.Cell_Phone_Number ||
                  '',
                homePhoneNumber:
                  memberData.homePhoneNumber ||
                  memberData.Home_Phone_Number ||
                  '',
                propertySituation:
                  memberData.propertySituation ||
                  memberData.PropertySituation ||
                  '',
                activeFamily:
                  memberData.activeFamily ?? memberData.ActiveFamily ?? true,
                activeFamilyMember:
                  memberData.activeFamilyMember ??
                  memberData.ActiveFamilyMember ??
                  true,
              };

              return familyMember;
            }
            return null;
          } catch (error) {
            console.error(
              `🔍 AssignedMembersDisplay: Error fetching family member ${memberId}:`,
              error
            );
            return null;
          }
        });

        const familyMembers = await Promise.all(memberPromises);
        const validMembers = familyMembers.filter(
          (member) => member !== null
        ) as FamilyMember[];

        console.log(
          '🔍 AssignedMembersDisplay: Successfully loaded assigned members:',
          validMembers.length
        );
        setAssignedMembers(validMembers);
      } catch (error) {
        console.error(
          '🔍 AssignedMembersDisplay: Error loading assigned members:',
          error
        );
        setAssignedMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignedMembers();
  }, [homeMembers, accountId, user?.id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src='/assets/person-with-shadow.svg'
          alt='assigned members'
          style={{ width: '20px', height: '20px' }}
        />
        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            color: Colors.PEARL,
          }}
        >
          Loading assigned members...
        </CustomText>
      </div>
    );
  }

  if (assignedMembers.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src='/assets/person-with-shadow.svg'
          alt='no assignment'
          style={{ width: '20px', height: '20px' }}
        />
        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            color: Colors.PEARL,
          }}
        >
          Not assigned
        </CustomText>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src='/assets/person-with-shadow.svg'
          alt='assigned members'
          style={{ width: '20px', height: '20px' }}
        />
        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            color: Colors.BLUE,
          }}
        >
          {`Assigned to ${assignedMembers.length} member${
            assignedMembers.length > 1 ? 's' : ''
          }`}
        </CustomText>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginLeft: '30px',
        }}
      >
        {assignedMembers.map((member) => (
          <div
            key={member.id}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            {member.avatarImagePath ? (
              <img
                src={member.avatarImagePath}
                alt={`${member.firstName} ${member.lastName}`}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: Colors.BLUE_GREY,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                  color: Colors.BLACK,
                }}
              >
                {getInitials({
                  FirstName: member.firstName,
                  LastName: member.lastName,
                })}
              </div>
            )}
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_14,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.BLACK,
              }}
            >
              {`${member.firstName} ${member.lastName}`}
            </CustomText>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * AuthGuard - A component that ensures authentication is complete before rendering children
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const LoadingComponent = React.useMemo(
    () => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%',
        }}
      >
        <LoadingSpinner size={50} color={Colors.BLUE} />
      </div>
    ),
    []
  );

  if (isLoading) {
    return LoadingComponent;
  }

  if (!isAuthenticated) {
    return LoadingComponent;
  }

  if (!user || !user.id) {
    return LoadingComponent;
  }

  return <>{children}</>;
};

/**
 * ViewTaskContent - The actual content of the view task page
 */
const ViewTaskContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { tasks, setTasks } = useTaskStore();
  const { family } = useFamilyStore();

  const [parsedTask, setParsedTask] = useState<ITTask | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);

  // Get task data using task ID from URL params
  useEffect(() => {
    const taskId = params.taskId as string;

    if (taskId) {
      // Always fetch fresh data from API to ensure we have the latest tile information
      const fetchTask = async () => {
        try {
          if (user?.accountId) {
            const fetchedTask = await taskService.getTaskById(
              taskId,
              user.accountId
            );
            if (fetchedTask) {
              setParsedTask(fetchedTask);
            } else {
              setError(i18n.t('TaskNotFound'));
            }
          } else {
            setError(i18n.t('UserAccountNotAvailable'));
          }
        } catch (err) {
          console.error('Error fetching task:', err);
          setError(i18n.t('FailedToLoadTask'));
        } finally {
          setIsLoading(false);
        }
      };

      fetchTask();
    } else {
      setError(i18n.t('NoTaskIdProvided'));
      setIsLoading(false);
    }
  }, [params.taskId, tasks, user?.accountId]);

  const handleBack = () => {
    const returnTo = searchParams.get('returnTo') || '/life';
    // Don't add refresh parameter for regular back navigation, only for task completion
    router.push(returnTo);
  };

  const handleEdit = () => {
    if (parsedTask) {
      const lang = searchParams.get('lang');
      const returnTo = searchParams.get('returnTo');

      const params = new URLSearchParams();
      if (lang) params.set('lang', lang);
      if (returnTo) params.set('returnTo', returnTo);

      let url = `/edit-task/${parsedTask.UniqueId}`;
      const query = params.toString();
      if (query) url += `?${query}`;

      router.push(url);
    }
  };

  const handleComplete = async () => {
    if (!parsedTask || !user?.id || !user?.accountId) return;

    setIsLoading(true);
    try {
      const updatedTask = await taskService.updateTaskCompletionStatus(
        parsedTask.UniqueId!,
        user.id,
        user.accountId,
        true
      );

      if (updatedTask) {
        // Update tasks in store
        const updatedTasks = tasks.map((t) =>
          t.UniqueId === parsedTask.UniqueId ? { ...t, completed: true } : t
        );
        setTasks(updatedTasks);

        // Navigate back to source page with refresh parameter
        const returnTo = searchParams.get('returnTo') || '/life';
        const currentParams = new URLSearchParams(window.location.search);
        const mobile = currentParams.get('mobile');
        const token = currentParams.get('token');

        // Add refresh parameter to trigger data refresh
        const returnParams = new URLSearchParams();
        returnParams.set('refresh', 'true');
        if (mobile) returnParams.set('mobile', mobile);
        if (token) returnParams.set('token', token);

        const returnUrl = `${returnTo}${
          returnTo.includes('?') ? '&' : '?'
        }${returnParams.toString()}`;
        router.push(returnUrl);
      }
    } catch (err) {
      console.error('Error completing task:', err);
      setError(i18n.t('FailedToCompleteTask'));
    } finally {
      setIsLoading(false);
      setShowCompleteModal(false);
    }
  };

  const handleDelete = async () => {
    if (!parsedTask || !user?.id || !user?.accountId) return;

    setIsLoading(true);
    try {
      const deleteRequest: DeleteTaskRequest = {
        id: parsedTask.UniqueId || '',
        accountId: user.accountId,
        userId: user.id,
      };

      await taskService.deleteTask(deleteRequest);

      // Update tasks in store
      const updatedTasks = tasks.filter(
        (t) => t.UniqueId !== parsedTask.UniqueId
      );
      setTasks(updatedTasks);

      // Navigate back
      router.back();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(i18n.t('FailedToDeleteTask'));
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return <ViewTaskSkeleton />;
  }

  if (error || !parsedTask) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%',
          gap: '20px',
        }}
      >
        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_18,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.RED,
          }}
        >
          {error || i18n.t('TaskNotFound')}
        </CustomText>
        <button
          onClick={handleBack}
          style={{
            padding: '10px 20px',
            backgroundColor: Colors.BLUE,
            color: Colors.WHITE,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Only show priority if it's not 0 (None) and not null/undefined
  const priorityItem = (parsedTask.Priority && parsedTask.Priority > 0)
    ? PRIORITY_ITEMS.find((item) => item.value === parsedTask.Priority)
    : null;

  // Priority mapping to match backend API (0=None, 1=Low, 2=Medium, 3=High)
  const priorityToTitleColorMap: Record<
    number,
    { title: string; color: string }
  > = {
    0: { title: i18n.t('None'), color: Colors.GREY_COLOR },
    1: { title: i18n.t('Low'), color: Colors.PISTACHIO_GREEN },
    2: { title: i18n.t('Medium'), color: Colors.MUSTARD },
    3: { title: i18n.t('High'), color: Colors.RED },
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: Colors.WHITE,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px',
          borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
          backgroundColor: Colors.WHITE,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M19 12H5'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M12 19L5 12L12 5'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <CustomText
            style={{
              color: Colors.BLUE,
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
          >
            {i18n.t('Back')}
          </CustomText>
        </button>

        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_18,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.MIDNIGHT,
            textAlign: 'center',
            flex: 1,
            marginLeft: '20px',
            marginRight: '20px',
          }}
        >
          {i18n.t('View')} {i18n.t('Task')}
        </CustomText>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowCompleteModal(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              borderRadius: '4px',
            }}
            title={i18n.t('MarkComplete')}
          >
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M20 6L9 17L4 12'
                stroke={Colors.GREEN}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>

          <button
            onClick={handleEdit}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              borderRadius: '4px',
            }}
            title={i18n.t('Edit')}
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13'
                stroke={Colors.BLUE}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z'
                stroke={Colors.BLUE}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              borderRadius: '4px',
            }}
            title={i18n.t('Delete')}
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M3 6H5H21'
                stroke={Colors.RED}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z'
                stroke={Colors.RED}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          padding: '40px 20px',
          boxSizing: 'border-box',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}
      >
        {/* Task Title */}
        <div>
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_20,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.MIDNIGHT,
              lineHeight: '1.3',
              marginBottom: '20px',
            }}
          >
            {parsedTask.Title}
          </CustomText>
        </div>

        {/* Task Description */}
        <div>
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              color: Colors.BLUE,
              lineHeight: '1.5',
            }}
          >
            {parsedTask.Text || i18n.t('NoTaskDescription')}
          </CustomText>
        </div>

        {/* Date & Time Display */}
        <DateTimeDisplay
          deadlineStartDateTime={parsedTask.Deadline_DateTime}
          deadlineEndDateTime={parsedTask.Deadline_DateTime_End}
          scheduledTime={parsedTask.Scheduled_Time}
          scheduledTimeEnd={parsedTask.Scheduled_Time_End}
          frequency={getPropertyFrequency(
            parsedTask.Reminder_Each_X_Days,
            parsedTask.Reminder_Each_X_Weeks,
            parsedTask.Reminder_Each_X_Months,
            parsedTask.RecurringFreq
          )}
          reminder={undefined} // TODO: Add reminder display when ITTask interface includes reminder type
        />

        {/* Notification Section - Bell icon with plus, shows below date/time */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.BLUE,
            }}
          >
            {i18n.t('Notification')}
          </CustomText>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Bell icon with plus - using correct notification-bell-notice icon */}
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M20.0858 13.5858L21.5 15V16.382C21.5 16.7607 21.2878 17.109 20.9413 17.2618C19.3485 17.964 16.2311 19 12 19C7.76887 19 4.65146 17.964 3.05874 17.2618C2.71215 17.109 2.5 16.7607 2.5 16.382V15L3.91421 13.5858C4.28929 13.2107 4.5 12.702 4.5 12.1716V9.5C4.5 5.35786 7.85786 2 12 2C12.5137 2 13.0153 2.05165 13.5 2.15003'
                stroke={Colors.BLUE}
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M15.5 19C15.5 20.6569 13.9102 22 11.9719 22C10.0336 22 8.5 20.6569 8.5 19'
                stroke={Colors.BLUE}
                strokeWidth='1.5'
                strokeLinejoin='round'
              />
              <path
                d='M21 7.5C21 9.433 19.433 11 17.5 11C15.567 11 14 9.433 14 7.5C14 5.567 15.567 4 17.5 4C19.433 4 21 5.567 21 7.5Z'
                fill='#FF6961'
                stroke='#FF6961'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.BLUE,
              }}
            >
              {(parsedTask as any).reminderFrequency &&
              (parsedTask as any).reminderFrequency > 0
                ? REMINDER_OPTIONS[(parsedTask as any).reminderFrequency] ||
                  i18n.t('CustomReminder')
                : i18n.t('None')}
            </CustomText>
          </div>
        </div>

        {/* Hive Section - Shows selected hive below notification, above privacy */}
        {(() => {
          // Use tileId field for hive data (HomeMembers now contains user IDs, not tile IDs)
          const tileId =
            (parsedTask as any).tileId || (parsedTask as any).Tile_uniqueId;
          console.log('🔍 ViewTask: Task hive data:', {
            tileId: (parsedTask as any).tileId,
            Tile_uniqueId: (parsedTask as any).Tile_uniqueId,
            HomeMembers: (parsedTask as any).HomeMembers,
            selectedTileId: tileId,
          });

          return (
            tileId && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <CustomText
                  style={{
                    fontSize: Typography.FONT_SIZE_12,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                    color: Colors.BLUE,
                  }}
                >
                  {i18n.t('Hive')}
                </CustomText>
                <HiveDisplay tileId={tileId} accountId={user?.accountId} />
              </div>
            )
          );
        })()}

        {/* Assigned Members Section */}
        {(() => {
          // Get homeMembers array from task data - check both new API field names and mapped field names
          const homeMembers =
            (parsedTask as any)?.homeMembers ||
            (parsedTask as any).HomeMembers ||
            [];

          return (
            homeMembers.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <CustomText
                  style={{
                    fontSize: Typography.FONT_SIZE_12,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                    color: Colors.BLUE,
                  }}
                >
                  {i18n.t('Assignment')}
                </CustomText>
                <AssignedMembersDisplay
                  homeMembers={homeMembers}
                  accountId={user?.accountId}
                />
              </div>
            )
          );
        })()}

        {/* Privacy and Hide From Section - React Native layout */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          {/* Privacy Section */}
          <div style={{ flex: 1 }}>
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_12,
                fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                color: Colors.BLUE,
                marginBottom: '10px',
              }}
            >
              {i18n.t('Privacy')}
            </CustomText>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Family privacy icon before privacy value */}
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M11.5 20.5H2C2 16.634 5.13401 13.5 9 13.5H11C11.695 13.5 12.3663 13.6013 13 13.7899M14 6.5C14 8.70914 12.2091 10.5 10 10.5C7.79086 10.5 6 8.70914 6 6.5C6 4.29086 7.79086 2.5 10 2.5C12.2091 2.5 14 4.29086 14 6.5Z'
                  stroke={Colors.BLUE}
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M16.5 16H15V21.5H22V16H20.5M16.5 16V14.5C16.5 13.3954 17.3954 12.5 18.5 12.5C19.6046 12.5 20.5 13.3954 20.5 14.5V16M16.5 16H20.5'
                  stroke={Colors.BLUE}
                  strokeWidth='1.5'
                  strokeLinejoin='round'
                />
              </svg>
              <CustomText
                style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  color: Colors.BLUE,
                }}
              >
                {i18n.t('VisibleToEveryone')}
              </CustomText>
            </div>
          </div>

          {/* Hide From Section */}
          <div style={{ flex: 1 }}>
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_12,
                fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                color: Colors.BLUE,
                marginBottom: '10px',
              }}
            >
              {i18n.t('HideFrom')}
            </CustomText>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Hide-from icon before the value */}
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z'
                  stroke={Colors.BLUE}
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A18.5 18.5 0 0 1 19.42 16.42'
                  stroke={Colors.BLUE}
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M1 1L23 23'
                  stroke={Colors.BLUE}
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <CustomText
                style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  color: Colors.BLUE,
                }}
              >
                {parsedTask.BlackListed_Family &&
                parsedTask.BlackListed_Family.length > 0
                  ? i18n.t('XPeopleHidden', { count: parsedTask.BlackListed_Family.length })
                  : i18n.t('None')}
              </CustomText>
            </div>
          </div>
        </div>

        {/* People Involved */}
        {family.length > 0 && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_12,
                fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                color: Colors.BLUE,
              }}
            >
              {i18n.t('PeopleInvolved')}
            </CustomText>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
            >
              {family.map((familyMember) => (
                <div
                  key={familyMember.UniqueId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21'
                      stroke={Colors.BLUE}
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z'
                      stroke={Colors.BLUE}
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M17 11L19 13L23 9'
                      stroke={Colors.BLUE}
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  <CustomText
                    style={{
                      fontSize: Typography.FONT_SIZE_16,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                      color: Colors.BLUE,
                    }}
                  >
                    {familyMember.FirstName} {familyMember.LastName}
                  </CustomText>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority with Circular Flag Icon */}
        {priorityItem && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_12,
                fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                color: Colors.BLUE,
              }}
            >
              {i18n.t('Priority')}
            </CustomText>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Circular flag icon matching home page */}
              <svg
                width='20'
                height='20'
                viewBox='0 0 10 10'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M1.66699 5.83337V8.75004'
                  stroke={priorityItem.iconColor}
                  strokeWidth='0.625'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M4.89932 1.59955C3.52214 0.887438 2.2074 1.41554 1.66699 1.84177V6.17725C2.07103 5.713 3.28315 4.99337 4.89932 5.82904C6.34366 6.57587 7.75216 6.16567 8.33366 5.843V1.67005C7.21266 2.17983 6.00753 2.17258 4.89932 1.59955Z'
                  stroke={priorityItem.iconColor}
                  strokeWidth='0.625'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  fill='none'
                />
              </svg>
              <CustomText
                style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  color: Colors.BLUE,
                }}
              >
                {parsedTask.Priority !== null &&
                parsedTask.Priority !== undefined
                  ? priorityToTitleColorMap[parsedTask.Priority]?.title ||
                    i18n.t('Unknown')
                  : i18n.t('Unknown')}
              </CustomText>
            </div>
          </div>
        )}
      </div>

      {/* Complete Task Confirmation Modal */}
      {showCompleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: Colors.WHITE,
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_18,
                fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                color: Colors.MIDNIGHT,
                lineHeight: '1.4',
              }}
            >
              Complete Task
            </CustomText>
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.DARK_GREY,
                lineHeight: '1.5',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              Are you sure you want to mark this task as complete?
            </CustomText>
            <div
              style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                marginTop: '20px',
              }}
            >
              <button
                onClick={() => setShowCompleteModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: Colors.LIGHT_GREY,
                  color: Colors.MIDNIGHT,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                }}
              >
                {i18n.t('Cancel')}
              </button>
              <button
                onClick={handleComplete}
                style={{
                  padding: '12px 24px',
                  backgroundColor: Colors.GREEN,
                  color: Colors.WHITE,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                }}
              >
                {i18n.t('Complete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: Colors.WHITE,
              borderRadius: '12px',
              padding: '40px',
              maxWidth: '400px',
              width: '90%',
              height: 'auto',
              textAlign: 'center',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.DARK_GREY,
              }}
            >
              Are you sure you want to delete this task? This action cannot be
              undone.
            </CustomText>
            <div
              style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: Colors.LIGHT_GREY,
                  color: Colors.MIDNIGHT,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                }}
              >
                {i18n.t('Cancel')}
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '12px 24px',
                  backgroundColor: Colors.RED,
                  color: Colors.WHITE,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                }}
              >
                {i18n.t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ViewTask Page - The main component that wraps ViewTaskContent with AuthGuard
 */
const ViewTask: React.FC = () => {
  return (
    <AuthGuard>
      <Suspense fallback={<div><LoadingSpinner /></div>}>
        <ViewTaskContent />
      </Suspense>
    </AuthGuard>
  );
};

export default ViewTask;
