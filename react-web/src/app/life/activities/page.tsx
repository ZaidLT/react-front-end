'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';
import { Colors, Typography } from '../../../styles';
import PageHeader from '../../../components/PageHeader';
import ActivityCard from '../../../components/ActivityCard';
import EmptyListViewCard from '../../../components/EmptyListViewCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import CustomText from '../../../components/CustomText';

import {
  // useUserStore,
  useFamilyStore,
  useActivityStore
} from '../../../context/store';

// Import types
import { IActivityCard } from '../../../util/types';
import { IActivity } from '../../../services/types';

// Import utilities
// import { getActivitiesByAccount } from '../../../util/helpers';
import { ACTIVITY_ACTIONS, ACTIVITY_TYPES, getInitials } from '../../../util/constants';
import getReadableStoreItemDetail from '../../../util/Life/GetReadableStoreItemDetail';
import onActivityCardClick from '../../../util/Life/OnActivityCardClick';
import moment from 'moment';

/**
 * AuthGuard - A component that ensures authentication is complete before rendering children
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: Colors.WHITE
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

const AllActivitiesPage: React.FC = () => {
  const { i18n } = useLanguageContext();
  const router = useRouter();
  // const { user: authUser } = useAuth();

  // Store states
  // const tasks = useTaskStore((state) => state.tasks);
  // const events = useEventStore((state) => state.events);
  // const notes = useNoteStore((state) => state.notes);
  const family = useFamilyStore((state) => state.family);
  const activities = useActivityStore((state) => state.activities);

  // Local state
  // const contacts = useContactStore((state) => state.contacts);
  // const user = useUserStore((state) => state.user);

  // Local state

  // const [showSortOptionsModal, setShowSortOptionsModal] = useState(false);
  // const [selectedItem, setSelectedItem] = useState('Default');

  // Filter active family members
  // const updatedFamily = useMemo(() => {
  //   return family.filter((member) =>
  //     member.ActiveFamilyMember ? member.ActiveUser : true
  //   );
  // }, [family]);

  // Helper function to get readable activity action
  const getReadableActivityAction = useCallback((action: string) => {
    if (action === "Create") {
      return i18n.t("Created");
    }
    if (action === "Update") {
      return i18n.t("Updated");
    }
    if (action === "Delete") {
      return i18n.t("Deleted");
    }
    return action.toLowerCase();
  }, [i18n]);

  // Map all activities to activity cards
  const mappedActivities: IActivityCard[] = useMemo(() => {
    return (
      activities
        // Filter out contact activities for now and only show activities from family members
        .filter((activity: IActivity) => {
          return (
            activity.ActivityType !== 5 &&
            family.some((member) => member.UniqueId === activity.User_uniqueId)
          );
        })
        .sort((a: IActivity, b: IActivity) =>
          moment(b.CreationTimestamp).diff(moment(a.CreationTimestamp))
        )
        .map((activity: IActivity) => {
          const matchingFamilyMember = family.find(
            (member) => member.UniqueId === activity.User_uniqueId
          );

          return {
            date: `${moment(activity.CreationTimestamp).format("MMM DD YYYY")}`,
            time: moment(activity.CreationTimestamp).format("hh:mm A"),
            heading: `${getReadableActivityAction(
              ACTIVITY_ACTIONS[activity.Action]
            )} ${getReadableStoreItemDetail(
              ACTIVITY_TYPES[activity.ActivityType],
              activity.Activity_uniqueId
            )}`,
            initials: matchingFamilyMember
              ? getInitials(matchingFamilyMember)
              : "",
            name: matchingFamilyMember?.FirstName,
            avatar: matchingFamilyMember?.AvatarImagePath,
            onPress: () => onActivityCardClick(activity, router),
          } as IActivityCard;
        })
    );
  }, [activities, family, getReadableActivityAction, router]);



  const renderActivityItem = (item: IActivityCard, index: number) => (
    <div key={`${item.heading}-${index}`} style={{
      minWidth: '100%',
      marginBottom: '8px',
      padding: '0 20px'
    }}>
      <ActivityCard
        date={item.date}
        time={item.time}
        heading={item.heading}
        name={item.name}
        initials={item.initials}
        avatar={item.avatar}
        onPress={item.onPress}
      />
    </div>
  );

  return (
    <AuthGuard>
      <div style={{
        height: '100vh',
        backgroundColor: Colors.WHITE,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          paddingTop: '24px',
          paddingBottom: '16px',
          backgroundColor: Colors.WHITE
        }}>
          <PageHeader />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            marginTop: '16px'
          }}>
            <div
              onClick={() => router.back()}
              style={{
                cursor: 'pointer',
                marginRight: '16px',
                padding: '8px'
              }}
            >
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.BLUE,
              }}>
                ← {i18n.t('Back')}
              </CustomText>
            </div>
            <CustomText style={{
              fontSize: Typography.FONT_SIZE_24,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.BLACK,
            }}>
              {i18n.t('Life')} ✨
            </CustomText>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {/* Sort/Filter Section */}
          <div style={{
            padding: '20px',
            borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <CustomText style={{
              fontSize: Typography.FONT_SIZE_18,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              color: Colors.BLACK,
            }}>
              All Activities ({mappedActivities.length})
            </CustomText>

            <div
              onClick={() => {/* TODO: Implement sort modal */}}
              style={{
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_14,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.BLUE,
                marginRight: '8px'
              }}>
                Sort
              </CustomText>
              {/* Filter icon placeholder */}
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: Colors.BLUE,
                borderRadius: '4px'
              }} />
            </div>
          </div>

          {/* Activities List */}
          <div style={{ paddingTop: '16px', paddingBottom: '20px' }}>
            {mappedActivities.length > 0 ? (
              <div>
                {mappedActivities.map((item, index) => renderActivityItem(item, index))}
              </div>
            ) : (
              <div style={{
                padding: '0 20px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <div style={{ width: '90%' }}>
                  <EmptyListViewCard />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default AllActivitiesPage;
