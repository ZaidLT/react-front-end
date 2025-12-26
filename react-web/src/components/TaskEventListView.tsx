'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaskNavigation, EventNavigation } from '../utils/searchNavigation';
import { useLanguageContext } from '../context/LanguageContext';

interface TaskEventItem {
  id: string;
  title: string;
  time: string;
  type: 'task' | 'event';
  completed?: boolean;
  deadline?: string; // ISO date string for filtering
}

interface TaskEventListViewProps {
  tasks: TaskEventItem[];
  events: TaskEventItem[];
  onTaskComplete?: (taskId: string) => Promise<void>;
}

const TaskEventListView: React.FC<TaskEventListViewProps> = ({
  tasks,
  events,
  onTaskComplete,
}) => {
  const router = useRouter();
  const { i18n } = useLanguageContext();
  const [activeTab, setActiveTab] = useState<'today' | 'next'>('today');
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());

  // Get first 4 items for the selected tab
  const getDisplayItems = () => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    // Debug logging
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('TaskEventListView Debug:', {
        activeTab,
        tasksCount: tasks.length,
        eventsCount: events.length,
        startOfToday: startOfToday.toISOString(),
        endOfToday: endOfToday.toISOString(),
        allEvents: events.map(e => ({ id: e.id, title: e.title, deadline: e.deadline }))
      });
    }

    if (activeTab === 'today') {
      // Separate today's items from overdue items
      const todayItems = [...tasks, ...events].filter(item => {
        if (!item.deadline) return false;

        const deadline = new Date(item.deadline);
        if (isNaN(deadline.getTime())) return false;

        // Items due today (within today's date range)
        return deadline >= startOfToday && deadline <= endOfToday;
      });

      const overdueItems = [...tasks, ...events].filter(item => {
        if (!item.deadline) return false;

        const deadline = new Date(item.deadline);
        if (isNaN(deadline.getTime())) return false;

        // Items overdue (before today)
        return deadline < startOfToday;
      });

      // Sort each group by deadline (earliest first within each group)
      const sortedTodayItems = todayItems.sort((a, b) => {
        const dateA = new Date(a.deadline || '');
        const dateB = new Date(b.deadline || '');
        return dateA.getTime() - dateB.getTime();
      });

      const sortedOverdueItems = overdueItems.sort((a, b) => {
        const dateA = new Date(a.deadline || '');
        const dateB = new Date(b.deadline || '');
        return dateA.getTime() - dateB.getTime();
      });

      // Combine: today's items first, then overdue items, take first 4 total
      return [...sortedTodayItems, ...sortedOverdueItems].slice(0, 4);
    } else {
      // For "What's next", show future items (after today)
      const futureItems = [...tasks, ...events].filter(item => {
        if (!item.deadline) return false;

        const deadline = new Date(item.deadline);
        if (isNaN(deadline.getTime())) return false;

        // Include items due after today
        const isFuture = deadline > endOfToday;

        // Debug logging for What's next
        if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' && item.type === 'event') {
          console.log('Event filtering for What\'s next:', {
            title: item.title,
            deadline: item.deadline,
            deadlineDate: deadline.toISOString(),
            endOfToday: endOfToday.toISOString(),
            isFuture,
            comparison: `${deadline.getTime()} > ${endOfToday.getTime()}`
          });
        }

        return isFuture;
      });

      // Debug final results
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('What\'s next final results:', {
          futureItemsCount: futureItems.length,
          futureItems: futureItems.map(item => ({
            title: item.title,
            type: item.type,
            deadline: item.deadline
          }))
        });
      }

      // Sort by deadline (earliest first) and take first 4
      return futureItems
        .sort((a, b) => {
          const dateA = new Date(a.deadline || '');
          const dateB = new Date(b.deadline || '');
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 4);
    }
  };

  const displayItems = getDisplayItems();

  const handleTaskComplete = async (taskId: string) => {
    if (onTaskComplete) {
      // Add task to loading state
      setLoadingTasks(prev => new Set(prev).add(taskId));

      try {
        await onTaskComplete(taskId);
      } finally {
        // Remove task from loading state
        setLoadingTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '12px',
      alignSelf: 'stretch',
      height: '248px',
    }}>
      {/* Switch/Tab Container */}
      <div style={{
        display: 'flex',
        padding: '4px',
        alignItems: 'flex-start',
        gap: '8px',
        alignSelf: 'stretch',
        borderRadius: '100px',
        background: '#EAEDF8',
      }}>
        {/* Today Button */}
        <button
          onClick={() => setActiveTab('today')}
          style={{
            display: 'flex',
            padding: '11px 10px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            flex: '1 0 0',
            borderRadius: '100px',
            background: activeTab === 'today' ? '#2A46BE' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: activeTab === 'today' ? '#FFF' : '#AAB5E5',
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: activeTab === 'today' ? '600' : '400',
            lineHeight: activeTab === 'today' ? '120%' : '100%',
            letterSpacing: activeTab === 'today' ? 'normal' : '-0.084px',
          }}
        >
          {i18n.t('Today')}
        </button>

        {/* What's Next Button */}
        <button
          onClick={() => setActiveTab('next')}
          style={{
            display: 'flex',
            padding: '11px 10px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            flex: '1 0 0',
            borderRadius: '57px',
            background: activeTab === 'next' ? '#2A46BE' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: activeTab === 'next' ? '#FFF' : '#AAB5E5',
            fontFamily: 'Poppins',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: activeTab === 'next' ? '600' : '400',
            lineHeight: activeTab === 'next' ? '120%' : '100%',
            letterSpacing: activeTab === 'next' ? 'normal' : '-0.084px',
          }}
        >
          {i18n.t('WhatsNextQuestion')}
        </button>
      </div>

      {/* Section Container */}
      <div style={{
        display: 'flex',
        width: '100%',
        padding: '16px 16px 12px 16px',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        borderRadius: '16px',
        border: '1px solid #EAEDF8',
        background: '#FFF',
        boxShadow: '0 4px 4px 0 rgba(0, 14, 80, 0.10)',
        flex: 1,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          alignSelf: 'stretch',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '16px',
            alignSelf: 'stretch',
          }}>
            {/* List Items or Zero State */}
            {displayItems.length === 0 ? (
              // Zero State - Let's Get Started
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'stretch',
                height: '100%',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '12px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}>
                  {/* Bee icon - scaled up */}
                  <img
                    src='/hive-icons/beeva.svg'
                    alt='Beeva'
                    style={{
                      width: '70px',
                      height: '70px',
                      objectFit: 'contain',
                    }}
                  />
                  {/* Hexagon with plus icon - scaled up */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'relative',
                      width: '40px',
                      height: '44px',
                    }}>
                      {/* Colored hexagon tile */}
                      <img
                        src='/HiveTileColored.svg'
                        alt='Hexagon'
                        style={{
                          width: '100%',
                          height: '100%',
                          filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.15))',
                        }}
                      />
                      {/* Plus icon on top of hexagon - scaled up */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#4285F4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg
                          width='14'
                          height='14'
                          viewBox='0 0 24 24'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M12 4V20'
                            stroke='#4285F4'
                            strokeWidth='2.5'
                            strokeLinecap='round'
                          />
                          <path
                            d='M4 12L20 12'
                            stroke='#4285F4'
                            strokeWidth='2.5'
                            strokeLinecap='round'
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontFamily: 'Poppins',
                    fontWeight: '600',
                    color: '#000E50',
                    textAlign: 'center',
                    marginBottom: '6px',
                  }}>
                    {i18n.t('LetsGetStarted')}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontFamily: 'Poppins',
                    fontWeight: '400',
                    color: '#333E73',
                    textAlign: 'center',
                    lineHeight: '120%',
                    maxWidth: '300px',
                  }}>
                    {i18n.t('AddATaskOrAnEventUsingThePlusMenuAndTheyllShowUpHere')}
                  </div>
                </div>
              </div>
            ) : (
              // Regular list items
              displayItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'event') {
                      EventNavigation.editEvent(item.id, router, window.location.pathname + window.location.search);
                    } else if (item.type === 'task') {
                      TaskNavigation.editTask(item.id, router, window.location.pathname + window.location.search);
                    }
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    alignSelf: 'stretch',
                    height: '26px',
                    cursor: 'pointer'
                  }}
                >
                  {/* Left Side */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: '20px',
                      height: '20px',
                      flexShrink: 0,
                    }}>
                      <img
                        src={item.type === 'task' ? '/icons/home/icon-home-task.svg' : '/icons/home/icon-home-event.svg'}
                        alt={item.type === 'task' ? 'task' : 'event'}
                        style={{
                          width: '20px',
                          height: '20px',
                          flexShrink: 0,
                        }}
                      />
                    </div>

                    {/* Text Content */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      gap: '2px',
                    }}>
                      {/* Title */}
                      <div style={{
                        color: '#2A46BE',
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: '500',
                        lineHeight: '120%',
                      }}>
                        {item.title}
                      </div>

                      {/* Time */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <span style={{
                          color: '#7F90D8',
                          fontFamily: 'Poppins',
                          fontSize: '12px',
                          fontStyle: 'normal',
                          fontWeight: '400',
                          lineHeight: '120%',
                        }}>
                          {item.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Checkbox (only for tasks) */}
                  {item.type === 'task' && (
                    <div style={{
                      display: 'flex',
                      width: '36px',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleTaskComplete(item.id); }}
                        disabled={loadingTasks.has(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: loadingTasks.has(item.id) ? 'default' : 'pointer',
                          padding: 0,
                          opacity: loadingTasks.has(item.id) ? 0.7 : 1,
                        }}
                      >
                        <img
                          src={
                            item.completed || loadingTasks.has(item.id)
                              ? '/icons/checkbox/icon-checked.svg'
                              : '/icons/checkbox/icon-unchecked.svg'
                          }
                          alt={
                            item.completed || loadingTasks.has(item.id)
                              ? 'completed'
                              : 'uncompleted'
                          }
                          width="24"
                          height="24"
                        />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskEventListView;
