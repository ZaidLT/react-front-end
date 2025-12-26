'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';
import { Colors, Typography } from '../../../styles';
import CustomText from '../../../components/CustomText';
import LoadingSpinner from '../../../components/LoadingSpinner';
import TabBar from '../../../components/TabBar';

import ListViewCard from '../../../components/ListViewCard';
import {
  useTaskStore
} from '../../../context/store';
import { ITTask } from '../../../services/types';
import { getTasksByUser } from '../../../services/services';
import taskService from '../../../services/taskService';

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

const IncompleteTasksContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const searchParams = useSearchParams();

  // Get weekly filter from URL parameters
  const isWeeklyFilter = searchParams.get('weekly') === 'true';

  // Mobile detection
  const mobileToken = searchParams.get('token');

  // Store states
  const tasks = useTaskStore((state) => state.tasks);
  const updateTasks = useTaskStore((state) => state.updateTasks);

  // Debug logging
  console.log('Store debug:', {
    tasksLength: tasks.length,
    updateTasksType: typeof updateTasks,
    hasUpdateTasks: !!updateTasks
  });

  // State
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  // Filter incomplete tasks
  const incompleteTasks = useMemo(() => {
    return tasks.filter(task => !task.completed);
  }, [tasks]);

  // State to track if we've fetched incomplete tasks
  const [hasFetchedIncompleteTasks, setHasFetchedIncompleteTasks] = useState(false);

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      if (!authUser?.id || !authUser?.accountId || hasFetchedIncompleteTasks) return;

      try {
        console.log('Fetching incomplete tasks for incomplete tasks page:', authUser.id, authUser.accountId, 'weekly filter:', isWeeklyFilter);
        const tasksData = await getTasksByUser(authUser.id, authUser.accountId, false, isWeeklyFilter); // includeCompleted: false, includeOnlyThisWeeksItems: based on URL param
        console.log('Fetched incomplete tasks data:', tasksData);
        updateTasks(tasksData);
        setHasFetchedIncompleteTasks(true);
      } catch (error) {
        console.error('Error fetching incomplete tasks:', error);
      }
    };

    fetchTasks();
  }, [authUser?.id, authUser?.accountId, hasFetchedIncompleteTasks, isWeeklyFilter]);



  // Handle item press
  const handleItemPress = (task: ITTask) => {
    router.push(`/edit-task/${task.UniqueId}?returnTo=/life`);
  };





  // Handle task completion toggle
  const handleTaskToggle = async (task: ITTask, isCompleted: boolean) => {
    if (completingTaskId) return;

    setCompletingTaskId(task.UniqueId!);

    try {
      console.log('Updating task completion:', task.UniqueId, 'to completed:', isCompleted);

      const result = await taskService.updateTaskCompletionStatus(
        task.UniqueId!,
        authUser!.id,
        authUser!.accountId!,
        isCompleted
      );

      if (result) {
        const updatedTasks = tasks.map(t =>
          t.UniqueId === task.UniqueId ? { ...t, completed: isCompleted } : t
        );
        updateTasks(updatedTasks);
        console.log('Task completion updated successfully:', task.UniqueId);
      } else {
        console.error('Failed to update task completion - no result returned');
      }
    } catch (error) {
      console.error('Error updating task completion:', error);
    } finally {
      setCompletingTaskId(null);
    }
  };

  // Render individual task using ListViewCard
  const renderTask = (task: ITTask) => (
    <div key={task.UniqueId} style={{ marginBottom: '12px' }}>
      <ListViewCard
        nameNote={task.Title || ''}
        type="Task"
        description={task.Text}
        priority={task.Priority ?? undefined}
        item={task}
        isComplete={task.completed || false}
        onPress={() => handleItemPress(task)}
        onToggle={(isCompleted) => handleTaskToggle(task, isCompleted)}
        toggleOptions={{
          text: {
            activeText: 'Complete',
            inactiveText: 'Incomplete'
          },
          color: {
            activeColor: Colors.PISTACHIO_GREEN,
            inactiveColor: '#AAAAAA'
          }
        }}
      />
    </div>
  );

  return (
    <AuthGuard>
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
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
                {isWeeklyFilter ? 'Incomplete Tasks This Week' : `${i18n.t('Incomplete')} ${i18n.t('Tasks')}`}
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
            {incompleteTasks.length > 0 ? (
              incompleteTasks.map((task) => (
                <React.Fragment key={task.UniqueId}>
                  {renderTask(task)}
                </React.Fragment>
              ))
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
                  No incomplete tasks found
                </CustomText>
              </div>
            )}
          </div>
        </div>

        {/* Tab Bar - only show if not mobile */}
        {!mobileToken && <TabBar />}
      </div>
    </AuthGuard>
  );
};

const IncompleteTasksPage: React.FC = () => {
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
      <IncompleteTasksContent />
    </Suspense>
  );
};

export default IncompleteTasksPage;
