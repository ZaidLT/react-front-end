'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';
import { Colors, Typography } from '../../../styles';
import CustomText from '../../../components/CustomText';
import LoadingSpinner from '../../../components/LoadingSpinner';
import TabBar from '../../../components/TabBar';

import {
  useFamilyStore
} from '../../../context/store';
import { ITTask } from '../../../services/types';
import { getTasksByUser } from '../../../services/services';
import moment from 'moment';

/**
 * AuthGuard - A component that ensures authentication is complete before rendering children
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();


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

const CompletedTasksContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser } = useAuth();

  // Get weekly filter from URL parameters
  const isWeeklyFilter = searchParams.get('weekly') === 'true';

  // Mobile detection
  const mobileToken = searchParams.get('token');

  // Store states
  const family = useFamilyStore((state) => state.family);

  // Local state for tasks
  const [tasks, setTasks] = useState<ITTask[]>([]);

  // Use tasks directly since API should return only completed tasks with includeCompleted=true
  const completedTasks = tasks;

  // Handle item press
  const handleItemPress = (task: ITTask) => {
    router.push(`/edit-task/${task.UniqueId}?returnTo=/life`);
  };



  // Fetch completed tasks when component mounts and authUser is available
  useEffect(() => {
    console.log('Completed tasks useEffect triggered. AuthUser:', authUser?.id, authUser?.accountId);

    const fetchTasks = async () => {
      if (!authUser?.id || !authUser?.accountId) {
        console.log('No authUser or accountId, skipping fetch');
        return;
      }

      try {
        console.log('Fetching completed tasks for completed tasks page:', authUser.id, authUser.accountId, 'weekly filter:', isWeeklyFilter);
        const fetchedTasks = await getTasksByUser(authUser.id, authUser.accountId, true, isWeeklyFilter); // includeCompleted: true, includeOnlyThisWeeksItems: based on URL param
        console.log('Fetched completed tasks data:', fetchedTasks);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Failed to fetch completed tasks:', error);
      }
    };

    // Only fetch if we have authUser data
    if (authUser?.id && authUser?.accountId) {
      fetchTasks();
    }
  }, [authUser, isWeeklyFilter]);

  // Get user name for task
  const getUserName = (userId?: string): string => {
    if (!userId) return 'Unknown';
    const user = family.find(member => member.UniqueId === userId);
    return user ? `${user.FirstName} ${user.LastName}` : 'Unknown';
  };

  // Render individual task
  const renderTask = (task: ITTask) => {
    return (
    <div
      key={task.UniqueId}
      onClick={() => handleItemPress(task)}
      style={{
        backgroundColor: Colors.WHITE,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        border: '1px solid ' + Colors.LIGHT_GREY,
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px'
      }}>
        <CustomText style={{
          fontSize: Typography.FONT_SIZE_16,
          fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
          color: Colors.BLACK,
          flex: 1,
          marginRight: '12px',
          textDecoration: 'line-through',
          opacity: 0.7
        }}>
          {task.Title}
        </CustomText>
        
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: `2px solid ${Colors.PISTACHIO_GREEN}`,
          backgroundColor: Colors.PISTACHIO_GREEN,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: Colors.WHITE, fontSize: '12px' }}>✓</span>
        </div>
      </div>

      {task.Text && (
        <CustomText style={{
          fontSize: Typography.FONT_SIZE_14,
          fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
          color: Colors.GREY_COLOR,
          marginBottom: '8px',
          lineHeight: '1.4',
          opacity: 0.7
        }}>
          {task.Text}
        </CustomText>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: Typography.FONT_SIZE_12,
        color: Colors.GREY_COLOR,
        opacity: 0.7
      }}>
        <span>{getUserName(task.User_uniqueId)}</span>
        {task.Deadline_DateTime && (
          <span>{moment(task.Deadline_DateTime).format('MMM DD, YYYY')}</span>
        )}
      </div>
    </div>
    );
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: '#f0f8ff',
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    }}>
      {/* Header */}
      <div style={{
        paddingTop: '24px',
        paddingBottom: '16px',
        backgroundColor: 'transparent',
        width: '100%'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <button
              onClick={() => router.push('/life')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: Typography.FONT_SIZE_24,
                color: Colors.BLUE,
                cursor: 'pointer',
                marginRight: '16px',
                padding: '8px'
              }}
            >
              ←
            </button>
            <CustomText style={{
              fontSize: Typography.FONT_SIZE_24,
              fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
              color: Colors.BLACK,
            }}>
              {isWeeklyFilter ? 'Completed Tasks This Week' : `${i18n.t('Completed')} ${i18n.t('Tasks')}`}
            </CustomText>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%',
          padding: '0 20px 100px 20px',
          boxSizing: 'border-box'
        }}>
          {completedTasks.length > 0 ? (
            completedTasks.map(renderTask)
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: Colors.WHITE,
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.GREY_COLOR
              }}>
                No completed tasks found
              </CustomText>
            </div>
          )}
        </div>
      </div>

      {/* Tab Bar - only show if not mobile */}
      {!mobileToken && <TabBar />}
    </div>
  );
};

const CompletedTasksPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: Colors.WHITE
      }}>
        <LoadingSpinner />
      </div>
    }>
      <CompletedTasksContent />
    </Suspense>
  );
};

export default CompletedTasksPage;
