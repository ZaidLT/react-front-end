'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TaskNavigation, EventNavigation } from '../utils/searchNavigation';
import { useLanguageContext } from '../context/LanguageContext';
import { EevaCard } from './ui/EevaCard';
import styles from './TaskEventListView.module.css';

interface TaskEventItem {
  id: string;
  title: string;
  time: string;
  type: 'task' | 'event';
  completed?: boolean;
  deadline?: string;
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

  const getDisplayItems = () => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('TaskEventListView Debug:', {
        activeTab,
        tasksCount: tasks.length,
        eventsCount: events.length,
        startOfToday: startOfToday.toISOString(),
        endOfToday: endOfToday.toISOString(),
        allEvents: events.map((event) => ({ id: event.id, title: event.title, deadline: event.deadline })),
      });
    }

    if (activeTab === 'today') {
      const todayItems = [...tasks, ...events].filter((item) => {
        if (!item.deadline) return false;

        const deadline = new Date(item.deadline);
        if (isNaN(deadline.getTime())) return false;

        return deadline >= startOfToday && deadline <= endOfToday;
      });

      const overdueItems = [...tasks, ...events].filter((item) => {
        if (!item.deadline) return false;

        const deadline = new Date(item.deadline);
        if (isNaN(deadline.getTime())) return false;

        return deadline < startOfToday;
      });

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

      return [...sortedTodayItems, ...sortedOverdueItems].slice(0, 4);
    }

    const futureItems = [...tasks, ...events].filter((item) => {
      if (!item.deadline) return false;

      const deadline = new Date(item.deadline);
      if (isNaN(deadline.getTime())) return false;

      const isFuture = deadline > endOfToday;

      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true' && item.type === 'event') {
        console.log("Event filtering for What's next:", {
          title: item.title,
          deadline: item.deadline,
          deadlineDate: deadline.toISOString(),
          endOfToday: endOfToday.toISOString(),
          isFuture,
          comparison: `${deadline.getTime()} > ${endOfToday.getTime()}`,
        });
      }

      return isFuture;
    });

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log("What's next final results:", {
        futureItemsCount: futureItems.length,
        futureItems: futureItems.map((item) => ({
          title: item.title,
          type: item.type,
          deadline: item.deadline,
        })),
      });
    }

    return futureItems
      .sort((a, b) => {
        const dateA = new Date(a.deadline || '');
        const dateB = new Date(b.deadline || '');
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 4);
  };

  const displayItems = getDisplayItems();

  const handleTaskComplete = async (taskId: string) => {
    if (onTaskComplete) {
      setLoadingTasks((prev) => new Set(prev).add(taskId));

      try {
        await onTaskComplete(taskId);
      } finally {
        setLoadingTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('today')}
          className={`${styles.tabButton} ${activeTab === 'today' ? styles.tabButtonActive : ''}`}
          type="button"
        >
          {i18n.t('Today')}
        </button>

        <button
          onClick={() => setActiveTab('next')}
          className={`${styles.tabButton} ${activeTab === 'next' ? styles.tabButtonActive : ''}`}
          type="button"
        >
          {i18n.t('WhatsNextQuestion')}
        </button>
      </div>

      <EevaCard className={styles.sectionCard}>
        <div className={styles.sectionContent}>
          <div className={styles.listWrapper}>
            {displayItems.length === 0 ? (
              <div className={styles.zeroState}>
                <div className={styles.zeroStateRow}>
                  <img src="/hive-icons/beeva.svg" alt="Beeva" className={styles.zeroStateBee} />
                  <div className={styles.zeroStateHex}>
                    <img src="/HiveTileColored.svg" alt="Hexagon" />
                    <div className={styles.zeroStatePlus}>
                      <svg className={styles.zeroStatePlusIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M4 12L20 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <div className={styles.zeroStateTitle}>{i18n.t('LetsGetStarted')}</div>
                  <div className={styles.zeroStateSubtitle}>
                    {i18n.t('AddATaskOrAnEventUsingThePlusMenuAndTheyllShowUpHere')}
                  </div>
                </div>
              </div>
            ) : (
              displayItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'event') {
                      EventNavigation.editEvent(item.id, router, `${window.location.pathname}${window.location.search}`);
                    } else if (item.type === 'task') {
                      TaskNavigation.editTask(item.id, router, `${window.location.pathname}${window.location.search}`);
                    }
                  }}
                  className={styles.listItem}
                >
                  <div className={styles.listItemLeft}>
                    <img
                      src={item.type === 'task' ? '/icons/home/icon-home-task.svg' : '/icons/home/icon-home-event.svg'}
                      alt={item.type === 'task' ? 'task' : 'event'}
                      className={styles.listItemIcon}
                    />

                    <div className={styles.listItemText}>
                      <div className={styles.listItemTitle}>{item.title}</div>
                      <div className={styles.listItemTime}>{item.time}</div>
                    </div>
                  </div>

                  {item.type === 'task' && (
                    <div className={styles.listItemRight}>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleTaskComplete(item.id);
                        }}
                        disabled={loadingTasks.has(item.id)}
                        className={`${styles.checkboxButton} ${loadingTasks.has(item.id) ? styles.checkboxButtonDisabled : ''}`}
                        type="button"
                      >
                        <img
                          src={
                            item.completed || loadingTasks.has(item.id)
                              ? '/icons/checkbox/icon-checked.svg'
                              : '/icons/checkbox/icon-unchecked.svg'
                          }
                          alt={item.completed || loadingTasks.has(item.id) ? 'completed' : 'uncompleted'}
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
      </EevaCard>
    </div>
  );
};

export default TaskEventListView;
