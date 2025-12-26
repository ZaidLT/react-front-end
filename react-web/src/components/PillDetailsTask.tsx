import React, { useMemo, useState } from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useTaskStore,
  useUserStore,
  useContactStore,
  useFamilyStore
} from "../context/store";

import moment from "moment";
import UnifiedItemCard from "./UnifiedItemCard";
import CustomText from "./CustomText";
import { ITTask } from "../services/types";
import { useIsMobileApp } from "../hooks/useMobileDetection";
import { useAuth } from "../context/AuthContext";
import taskService from "../services/taskService";
import { useLanguageContext } from "../context/LanguageContext";

interface PillDetailsTaskProps {
  memberId?: string;
  entityType?: 'contact' | 'tile' | 'user';
  dentsData?: ITTask[]; // DENTS tasks data
  isLoading?: boolean;
  firstName?: string;
  lastName?: string;
}

/**
 * PillDetailsTask - A component for displaying tasks related to a home member
 *
 * This component shows a list of tasks associated with a home member,
 * with options to add new tasks.
 *
 * @param memberId - The ID of the member
 */

// Ensure we only use the intended 'name' value (strip accidental extra query or encoded delimiters)
const sanitizeNameParam = (raw: string): string => {
  let v = raw || '';
  try { v = decodeURIComponent(v); } catch {}
  const q = v.indexOf('?');
  const a = v.indexOf('&');
  const cut = Math.min(q === -1 ? Number.POSITIVE_INFINITY : q, a === -1 ? Number.POSITIVE_INFINITY : a);
  return (cut === Number.POSITIVE_INFINITY ? v : v.slice(0, cut)).trim();
};
const PillDetailsTask: React.FC<PillDetailsTaskProps> = ({
  memberId,
  entityType,
  dentsData,
  isLoading = false,
  firstName: passedFirstName,
  lastName: passedLastName,
}) => {
  // Language context for translations
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobileApp = useIsMobileApp();
  const { i18n } = useLanguageContext();

  // Unused variables commented out to fix lint warnings
  // const family = useFamilyStore((state) => state.family);
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const user = useUserStore((state) => state.user);
  const contacts = useContactStore((state) => state.contacts);
  const family = useFamilyStore((state) => state.family);
  const { user: authUser } = useAuth();

  // Generate the correct property tile ID if this is a property tile
  const actualTileId = useMemo(() => {
    console.log('🔍 PillDetailsTask actualTileId useMemo - memberId:', memberId, 'user?.UniqueId:', user?.UniqueId);
    if (!memberId || !user?.UniqueId) return memberId;

    // Check if this is a property tile (memberId matches user ID)
    if (memberId === user.UniqueId) {
      const tileName = sanitizeNameParam(searchParams.get('name') || '');

      // Map property names to tile types
      const propertyTypeMap: { [key: string]: number } = {
        'Property Deeds': 33,
        'Mortgage': 35,
        'Property Insurance': 36,
        'Property Tax': 38
      };

      const propertyType = propertyTypeMap[tileName];
      if (propertyType) {
        const deterministicId = `${user.UniqueId}-${propertyType}`;
        console.log('🔧 PillDetailsTask - Property tile detected - Generated tile ID:', deterministicId, 'for property:', tileName, 'type:', propertyType);
        return deterministicId;
      }
    }

    return memberId;
  }, [memberId, user?.UniqueId, searchParams]);

  // Local map of optimistic completion statuses when using DENTS data
  const [localCompletion, setLocalCompletion] = useState<Record<string, boolean>>({});

  const matchingTasks = useMemo(() => {
    // Use DENTS data if available, otherwise fall back to store data
    if (dentsData) {
      // Apply any local completion overrides
      return dentsData.map((t) => ({
        ...t,
        completed: localCompletion.hasOwnProperty(t.UniqueId || '')
          ? localCompletion[t.UniqueId || '']
          : (t as any).completed || false,
      }));
    }

    if (!tasks || !actualTileId) return [];

    return tasks.filter((task) => {
      const anyTask = task as any;
      return (
        task.HomeMember_uniqueId === actualTileId ||
        (task.HomeMembers && task.HomeMembers.includes(actualTileId)) ||
        anyTask.Tile_uniqueId === actualTileId ||
        anyTask.tileId === actualTileId
      );
    });
  }, [dentsData, tasks, actualTileId, localCompletion]);

  // Show loading state when DENTS data is being fetched
  if (isLoading) {
    return (
      <div style={styles.providerContainer}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <CustomText>{i18n.t('LoadingTasks')}</CustomText>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.providerContainer}>
      {matchingTasks && matchingTasks.length > 0 && (
        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
          <Button
            textProps={{
              text: i18n.t('AddNewTask'),
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            onButtonClick={() => {
              const tileName = sanitizeNameParam(searchParams.get('name') || '');
              const paramName = entityType === 'user' ? 'delegateUserId' :
                               entityType === 'contact' ? 'contactId' : 'tileId';

              if (isMobileApp) {
                // Start with current URL parameters to preserve context
                const currentParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
                // Set the main parameter (delegateUserId, contactId, or tileId)
                if (actualTileId) {
                  currentParams.set(paramName, actualTileId);
                }
                // Add name if available
                if (tileName) currentParams.set('name', tileName);
                // Conditionally include first/last name for user/contact
                if (entityType === 'user') {
                  // Prefer explicitly-provided props from parent (page already loaded member)
                  let first = passedFirstName;
                  let last = passedLastName;
                  const targetId = actualTileId || memberId || '';
                  if ((!first || !last) && targetId) {
                    const fm = family?.find((f) => f.UniqueId === targetId);
                    first = first || fm?.FirstName;
                    last = last || fm?.LastName;
                  }
                  if (first) currentParams.set('firstName', first);
                  if (last) currentParams.set('lastName', last);
                } else if (entityType === 'contact') {
                  // Prefer explicitly-provided props from parent (page already loaded contact)
                  let first = passedFirstName;
                  let last = passedLastName;
                  if ((!first || !last) && contacts) {
                    const contactId = currentParams.get('contactId') || (actualTileId || '');
                    const contact = contacts.find(c => (c.UniqueId || c.User_uniqueId) === contactId);
                    if (contact) {
                      first = first || contact.FirstName;
                      last = last || contact.LastName;
                    }
                  }
                  if (first) currentParams.set('firstName', first);
                  if (last) currentParams.set('lastName', last);
                }
                const deeplink = `eeva://create/task?${currentParams.toString()}`;
                if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                  console.log('📱 Opening mobile deeplink (with passthrough params):', deeplink, { params: Array.from(currentParams.entries()) });
                }
                window.location.href = deeplink;
              } else {
                router.push(`/create-task?${paramName}=${actualTileId}${tileName ? `&name=${encodeURIComponent(tileName)}` : ''}`);
              }
            }}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              color: Colors.BLUE,
              radius: 8,
            }}
          />
        </div>
      )}

      {!matchingTasks || matchingTasks.length === 0 ? (
        <div style={styles.emptyTasksContainer}>
          <CustomText style={styles.noTaskText}>
            {i18n.t('YouHaventAddedAnyTasksYet')}
          </CustomText>
          <CustomText style={styles.addTaskText}>{i18n.t('ClickTheButtonToAdd')}</CustomText>

          <Button
            textProps={{
              text: i18n.t('AddNewTask'),
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            onButtonClick={() => {
              const tileName = sanitizeNameParam(searchParams.get('name') || '');
              const paramName = entityType === 'user' ? 'delegateUserId' :
                               entityType === 'contact' ? 'contactId' : 'tileId';

              if (isMobileApp) {
                // Start with current URL parameters to preserve context
                const currentParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
                // Set the main parameter (delegateUserId, contactId, or tileId)
                if (actualTileId) {
                  currentParams.set(paramName, actualTileId);
                }
                // Add name if available
                if (tileName) currentParams.set('name', tileName);
                // Conditionally include first/last name for user/contact
                if (entityType === 'user') {
                  // Prefer explicitly-provided props from parent (page already loaded member)
                  let first = passedFirstName;
                  let last = passedLastName;
                  const targetId = actualTileId || memberId || '';
                  if ((!first || !last) && targetId) {
                    const fm = family?.find((f) => f.UniqueId === targetId);
                    first = first || fm?.FirstName;
                    last = last || fm?.LastName;
                  }
                  if (first) currentParams.set('firstName', first);
                  if (last) currentParams.set('lastName', last);
                } else if (entityType === 'contact') {
                  // Prefer explicitly-provided props from parent (page already loaded contact)
                  let first = passedFirstName;
                  let last = passedLastName;
                  if ((!first || !last) && contacts) {
                    const contactId = currentParams.get('contactId') || (actualTileId || '');
                    const contact = contacts.find(c => (c.UniqueId || c.User_uniqueId) === contactId);
                    if (contact) {
                      first = first || contact.FirstName;
                      last = last || contact.LastName;
                    }
                  }
                  if (first) currentParams.set('firstName', first);
                  if (last) currentParams.set('lastName', last);
                }
                const deeplink = `eeva://create/task?${currentParams.toString()}`;
                if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                  console.log('📱 Opening mobile deeplink (with passthrough params):', deeplink, { params: Array.from(currentParams.entries()) });
                }
                window.location.href = deeplink;
              } else {
                router.push(`/create-task?${paramName}=${actualTileId}${tileName ? `&name=${encodeURIComponent(tileName)}` : ''}`);
              }
            }}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              color: Colors.BLUE,
              radius: 8,
            }}
          />
        </div>
      ) : (
        <div style={styles.tasksContainer}>
          {matchingTasks
            .sort((a, b) => moment(b.CreationTimestamp).valueOf() - moment(a.CreationTimestamp).valueOf())
            .map((task, index) => {
              return (
                <UnifiedItemCard
                  key={task.UniqueId || `task-${index}`}
                  UniqueId={task.UniqueId || `task-${index}`}
                  Title={task.Title || (task as any).title || 'No Title'}
                  Text={(task as any).Text || (task as any).text || ''}
                  type="Task"
                  Priority={(task as any).Priority ?? (task as any).priority ?? null}
                  Deadline_DateTime={(task as any).Deadline_DateTime ?? (task as any).deadlineDateTime ?? null}
                  CreationTimestamp={(task as any).CreationTimestamp ?? (task as any).creationTimestamp}
                  User_uniqueId={(task as any).User_uniqueId || (task as any).userId}
                  completed={(task as any).completed || false}
                  isAllDay={(() => {
                    const raw = (task as any).isAllDay ?? (task as any).IsAllDay;
                    if (typeof raw === 'boolean') return raw;
                    const s = (task as any).scheduledTime ?? (task as any).Scheduled_Time;
                    const e = (task as any).scheduledTimeEnd ?? (task as any).Scheduled_Time_End;
                    return s === '00:00' && e === '23:59';
                  })()}
                  onToggle={(isCompleted) => {
                    const taskId = task.UniqueId || (task as any).id || '';

                    // Optimistically update local state when using DENTS data
                    if (dentsData && taskId) {
                      setLocalCompletion(prev => ({ ...prev, [taskId]: isCompleted }));
                    }

                    // Persist via API the same way All Dents does
                    if (authUser?.id && authUser?.accountId && taskId) {
                      taskService.updateTaskCompletionStatus(taskId, authUser.id, authUser.accountId, isCompleted)
                        .then(updated => {
                          if (updated) {
                            useTaskStore.getState().updateTask({ ...updated, completed: isCompleted });
                          } else if (dentsData) {
                            setLocalCompletion(prev => ({ ...prev, [taskId]: !isCompleted }));
                          }
                        })
                        .catch(err => {
                          if (dentsData) {
                            setLocalCompletion(prev => ({ ...prev, [taskId]: !isCompleted }));
                          }
                          console.error('Failed to update task completion from pill:', err);
                        });
                    }
                  }}
                  onPress={() => {
                    const taskId = task.UniqueId;
                    if (taskId) {
                      const currentPath = window.location.pathname + window.location.search;
                      router.push(`/edit-task/${taskId}?returnTo=${encodeURIComponent(currentPath)}`);
                    } else {
                      console.error('Task ID not found:', task);
                    }
                  }}
                />
              );
            })}
        </div>
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  providerContainer: {
    marginTop: "20px",
    paddingBottom: "20%",
    paddingLeft: 0,
    paddingRight: 0,
    marginBottom: "20px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
  },
  tasksContainer: {
    marginBottom: "5%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  emptyTasksContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "10%",
  },
  noTaskText: {
    color: Colors.MIDNIGHT,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
  },
  addTaskText: {
    color: Colors.MIDNIGHT,
    fontSize: Typography.FONT_SIZE_12,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
};

export default PillDetailsTask;
