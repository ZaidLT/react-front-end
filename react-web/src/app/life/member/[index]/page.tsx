'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useLanguageContext } from '../../../../context/LanguageContext';
import { Colors, Typography } from '../../../../styles';
import PageHeader from '../../../../components/PageHeader';
import ActivityCard from '../../../../components/ActivityCard';
// import Tile from '../../../../components/Tile';
import EmptyListViewCard from '../../../../components/EmptyListViewCard';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import CustomText from '../../../../components/CustomText';
import {
  // useUserStore,
  useFamilyStore,
  useActivityStore
  // useContactStore
} from '../../../../context/store';

// Import types
import { IActivityCard } from '../../../../util/types';
import { IActivity } from '../../../../services/types';

// Import utilities
// import { getActivitiesByAccount } from '../../../../util/helpers';
import { ACTIVITY_ACTIONS, ACTIVITY_TYPES, getInitials } from '../../../../util/constants';
import getReadableStoreItemDetail from '../../../../util/Life/GetReadableStoreItemDetail';
import onActivityCardClick from '../../../../util/Life/OnActivityCardClick';
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

const MemberLifePage: React.FC = () => {
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const params = useParams();
  // const { user: authUser } = useAuth();

  // Get member index from params
  const memberIndex = parseInt(params.index as string, 10);

  // Store states
  // const tasks = useTaskStore((state) => state.tasks);
  // const events = useEventStore((state) => state.events);
  // const notes = useNoteStore((state) => state.notes);
  const family = useFamilyStore((state) => state.family);
  const activities = useActivityStore((state) => state.activities);
  // const contacts = useContactStore((state) => state.contacts);
  // const user = useUserStore((state) => state.user);

  // Local state
  // const [isEmptyStateCardVisible, setIsEmptyStateCardVisible] = useState(false);

  // Filter active family members
  const updatedFamily = useMemo(() => {
    return family.filter((member) =>
      member.ActiveFamilyMember ? member.ActiveUser : true
    );
  }, [family]);

  // Get the selected family member
  const selectedMember = useMemo(() => {
    if (memberIndex >= 0 && memberIndex < updatedFamily.length) {
      return updatedFamily[memberIndex];
    }
    return null;
  }, [updatedFamily, memberIndex]);

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

  // Map activities for the selected member
  const mappedActivities: IActivityCard[] = useMemo(() => {
    if (!selectedMember) return [];

    return (
      activities
        // Filter activities for the selected member only
        .filter((activity: IActivity) => {
          return (
            activity.ActivityType !== 5 &&
            activity.User_uniqueId === selectedMember.UniqueId
          );
        })
        .sort((a: IActivity, b: IActivity) =>
          moment(b.CreationTimestamp).diff(moment(a.CreationTimestamp))
        )
        .map((activity: IActivity) => {
          return {
            date: `${moment(activity.CreationTimestamp).format("MMM DD YYYY")}`,
            time: moment(activity.CreationTimestamp).format("hh:mm A"),
            heading: `${getReadableActivityAction(
              ACTIVITY_ACTIONS[activity.Action]
            )} ${getReadableStoreItemDetail(
              ACTIVITY_TYPES[activity.ActivityType],
              activity.Activity_uniqueId
            )}`,
            initials: getInitials(selectedMember),
            name: selectedMember?.FirstName,
            avatar: selectedMember?.AvatarImagePath,
            onPress: () => onActivityCardClick(activity, router),
          } as IActivityCard;
        })
    );
  }, [activities, selectedMember, getReadableActivityAction, router]);

  const renderActivityItem = (item: IActivityCard, index: number) => (
    <div key={`${item.heading}-${index}`} style={{ minWidth: '90%', marginBottom: '8px' }}>
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

  // If member not found, redirect back
  useEffect(() => {
    if (!selectedMember && updatedFamily.length > 0) {
      router.push('/life');
    }
  }, [selectedMember, updatedFamily, router]);

  if (!selectedMember) {
    return (
      <AuthGuard>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: Colors.WHITE
        }}>
          <LoadingSpinner />
        </div>
      </AuthGuard>
    );
  }

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
              {selectedMember.FirstName}'s {i18n.t('Life')} ✨
            </CustomText>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {/* Member Info */}
          <div style={{
            padding: '20px',
            borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
            display: 'flex',
            alignItems: 'center'
          }}>
            {selectedMember.AvatarImagePath ? (
              <img
                src={selectedMember.AvatarImagePath}
                alt={`${selectedMember.FirstName}'s avatar`}
                style={{
                  height: '64px',
                  width: '64px',
                  borderRadius: '32px',
                  objectFit: 'cover',
                  marginRight: '16px'
                }}
              />
            ) : (
              <div style={{
                alignItems: 'center',
                backgroundColor: Colors.BLUE_GREY,
                borderRadius: '32px',
                display: 'flex',
                justifyContent: 'center',
                height: '64px',
                width: '64px',
                marginRight: '16px'
              }}>
                <CustomText
                  style={{
                    color: Colors.BLACK,
                    textAlign: 'center',
                    fontSize: Typography.FONT_SIZE_18,
                    fontFamily: Typography.FONT_FAMILY_ABEEZEE_REGULAR,
                    fontWeight: Typography.FONT_WEIGHT_400,
                  }}
                >
                  {selectedMember.FirstName?.[0]}{selectedMember.LastName?.[0]}
                </CustomText>
              </div>
            )}

            <div>
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_20,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.BLACK,
              }}>
                {selectedMember.FirstName} {selectedMember.LastName}
              </CustomText>
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_14,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.GREY_COLOR,
              }}>
                {selectedMember.EmailAddress}
              </CustomText>
            </div>
          </div>

          {/* Activities Section */}
          <div style={{ padding: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_18,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.BLACK,
              }}>
                {selectedMember.FirstName}'s {i18n.t('RecentActivity')}
              </CustomText>
            </div>

            {/* Activities List */}
            <div style={{ minHeight: '200px' }}>
              {mappedActivities.length > 0 ? (
                <div>
                  {mappedActivities.map((item, index) => renderActivityItem(item, index))}
                </div>
              ) : (
                <div style={{ width: '90%' }}>
                  <EmptyListViewCard />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default MemberLifePage;
