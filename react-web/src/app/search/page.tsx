'use client';

import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import CustomText from '../../components/CustomText';
import NavHeader from '../../components/NavHeader';
import Icon from '../../components/Icon';
import { AccordionItem, EDentType } from '../../components/SearchAccordion';
import { EventCard, TaskCard, NoteCard } from '../../components/SearchResultCards';
import { Colors, Typography } from '../../styles';
import { useEventStore, useTaskStore, useNoteStore, useFileStore, useTileStore, useFamilyStore } from '../../context/store';
import { useAuth } from '../../context/AuthContext';
import { IEEvent, ITTask, INote, User } from '../../services/types';
import { INestedTile, ETileType } from '../../util/types';
import { getEventsByUser, getTasksByUser, getNotesByUser } from '../../services/services';
import { getFilesByAccount } from '../../services/documentService';
import tileService from '../../services/tileService';
import { useLanguageContext } from '../../context/LanguageContext';

// Note: Using ITTask from services/types instead of custom interface

// Helper function to map tile type to icon path
const getTileIconByType = (tileType: number): string => {
  switch (tileType) {
    case ETileType.Dishwasher:
      return '/hive-icons/dishwasher.svg';
    case ETileType.Air_conditioner:
      return '/hive-icons/air-conditioner.svg';
    case ETileType.Dryer:
      return '/hive-icons/dryer.svg';
    case ETileType.Fridge:
      return '/hive-icons/refrigerator.svg';
    case ETileType.Microwave:
      return '/hive-icons/microwave.svg';
    case ETileType.Oven:
      return '/hive-icons/oven.svg';
    case ETileType.Blender:
      return '/hive-icons/blender.svg';
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
    case ETileType.Laundry:
      return '/hive-icons/laundry.svg';
    case ETileType.Office:
      return '/hive-icons/office.svg';
    case ETileType.House:
      return '/hive-icons/house.svg';
    case ETileType['My Hive']:
      return '/hive-icons/family.svg';
    case ETileType.EevaHive:
      return '/eeva-logo.svg';
    default:
      return '/hive-icons/hive.svg';
  }
};

// Data structures matching React Native exactly
interface IDocCardData {
  sectionTitle: string;
  data?: {
    id: string;
    type?: ETileType;
    dataType: EDentType.DOCS;
    title: string;
    icon: React.ReactNode;
    docs: any[];
    isCollapsed?: boolean;
  }[];
}

interface IEventCardData {
  sectionTitle: string;
  data?: {
    id: string;
    type?: ETileType;
    dataType: EDentType.EVENTS;
    title: string;
    icon: React.ReactNode;
    events: IEEvent[];
  }[];
}

interface INoteCardData {
  sectionTitle: string;
  data?: {
    id: string;
    type?: ETileType;
    dataType: EDentType.NOTES;
    title: string;
    icon: React.ReactNode;
    notes: INote[];
  }[];
}

interface ITaskCardData {
  sectionTitle: string;
  data?: {
    id: string;
    type?: ETileType;
    dataType: EDentType.TASKS;
    title: string;
    icon: React.ReactNode;
    tasks: any[];
  }[];
}

type IDentAccordionListData = {
  [EDentType.DOCS]: IDocCardData;
  [EDentType.EVENTS]: IEventCardData;
  [EDentType.NOTES]: INoteCardData;
  [EDentType.TASKS]: ITaskCardData;
};

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { i18n } = useLanguageContext();
  const [searchTerms, setSearchTerms] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check where we came from to determine back navigation
  const fromPage = searchParams.get('from');
  const getBackPath = () => {
    if (fromPage === 'my-hive') {
      return '/my-hive';
    }
    return '/home'; // Default fallback
  };

  // Mobile detection using search params
  const isMobileApp = searchParams.get('mobile') === 'true';

  // Get data from stores
  const events = useEventStore((state) => state.events);
  const tasks = useTaskStore((state) => state.tasks);
  const notes = useNoteStore((state) => state.notes);
  const files = useFileStore((state) => state.files);
  const tiles = useTileStore((state) => state.tiles);
  const family = useFamilyStore((state) => state.family);
  const { user: authUser } = useAuth();

  // Load data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      if (!authUser?.id || !authUser?.accountId) return;

      try {
        setIsLoading(true);
        console.log('Fetching all data for search page:', authUser.id, 'account:', authUser.accountId);

        // Get store setters
        const setTasks = useTaskStore.getState().setTasks;
        const setNotes = useNoteStore.getState().setNotes;
        const setEvents = useEventStore.getState().setEvents;
        const setFiles = useFileStore.getState().setFiles;
        const setTiles = useTileStore.getState().setTiles;

        // Fetch data in parallel
        const [eventsData, notesData, tasksData, filesData, tilesData] = await Promise.allSettled([
          getEventsByUser(authUser.id, authUser.accountId),
          getNotesByUser(authUser.id, authUser.accountId),
          getTasksByUser(authUser.id, authUser.accountId),
          getFilesByAccount(authUser.accountId, authUser.id),
          tileService.getTilesByUser(authUser.id, authUser.accountId)
        ]);

        // Update stores with fetched data
        if (eventsData.status === 'fulfilled') {
          setEvents(eventsData.value);
        }
        if (notesData.status === 'fulfilled') {
          setNotes(notesData.value);
        }
        if (tasksData.status === 'fulfilled') {
          setTasks(tasksData.value);
        }
        if (filesData.status === 'fulfilled') {
          setFiles(filesData.value);
        }
        if (tilesData.status === 'fulfilled') {
          setTiles(tilesData.value);
        }

      } catch (error) {
        console.error('Error fetching search data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [authUser?.id, authUser?.accountId]);

  // Process event data to group by hive/association
  const processEventData = useCallback(
    (eventCardItems: IEventCardData): ((value: IEEvent, index: number, array: IEEvent[]) => void) => {
      return (event) => {
        let familyMembers: User[] = [];
        let homeMembers: INestedTile[] = [];

        // Get family members involved in the event
        if (event.People_Involved && event.People_Involved.length > 0) {
          familyMembers = family.filter((member) =>
            event.People_Involved?.includes(member.UniqueId)
          );
        }

        // Get home members (tiles) involved in the event
        if (event.HomeMembers && event.HomeMembers.length > 0) {
          homeMembers = tiles.filter((tile) =>
            event.HomeMembers?.includes(tile.UniqueId)
          );
        }

        // Group by family members
        if (familyMembers.length > 0) {
          familyMembers.forEach((member) => {
            let target = eventCardItems?.data?.find(
              (data) => data.id === member.UniqueId
            );

            if (target) {
              target.events.push(event);
            } else {
              eventCardItems?.data?.push({
                id: member.UniqueId,
                title: member.FirstName,
                dataType: EDentType.EVENTS,
                events: [event],
                icon: (
                  <img
                    src="/avatars/EmptyAvatarIcon.png"
                    alt="User Avatar"
                    style={{ width: 28, height: 28, borderRadius: '50%' }}
                  />
                ),
              });
            }
          });
        }

        // Group by home members (tiles)
        if (homeMembers.length > 0) {
          homeMembers.forEach((tile) => {
            let target = eventCardItems?.data?.find(
              (data) => data.id === tile.UniqueId
            );

            if (target) {
              target.events.push(event);
            } else {
              const iconPath = getTileIconByType(tile.Type);
              let icon = (
                <img
                  src={iconPath}
                  alt="Hive Icon"
                  style={{ width: 24, height: 24 }}
                />
              );

              eventCardItems?.data?.push({
                id: tile.UniqueId,
                title: tile.Name,
                dataType: EDentType.EVENTS,
                events: [event],
                icon: icon,
                type: tile.Type,
              });
            }
          });
        }

        // Handle events with no association
        if (familyMembers.length === 0 && homeMembers.length === 0) {
          let target = eventCardItems?.data?.find(
            (data) => data.id === "no-association"
          );

          if (target) {
            target.events.push(event);
          } else {
            eventCardItems?.data?.push({
              id: "no-association",
              title: i18n.t('NoAssociation'),
              dataType: EDentType.EVENTS,
              events: [event],
              icon: (
                <img
                  src="/calendar-add.svg"
                  alt="Calendar Icon"
                  style={{ width: 28, height: 28 }}
                />
              ),
            });
          }
        }
      };
    },
    [tiles, family]
  );

  // Process note data to group by hive/association
  const processNoteData = useCallback(
    (noteCardItems: INoteCardData): ((value: INote, index: number, array: INote[]) => void) => {
      return (note) => {
        let familyMembers: User[] = [];
        let homeMember: INestedTile | null = null;

        // Get family members involved in the note
        if (note.People_Involved && note.People_Involved.length > 0) {
          familyMembers = family.filter((member) =>
            note.People_Involved?.includes(member.UniqueId)
          );
        }

        // Get home member (tile) involved in the note
        if (note.HomeMember_uniqueId) {
          homeMember = tiles.find((tile) => tile.UniqueId === note.HomeMember_uniqueId) || null;
        }

        // Group by family members
        if (familyMembers.length > 0) {
          familyMembers.forEach((member) => {
            let target = noteCardItems?.data?.find(
              (data) => data.id === member.UniqueId
            );

            if (target) {
              target.notes.push(note);
            } else {
              noteCardItems?.data?.push({
                id: member.UniqueId,
                title: member.FirstName,
                dataType: EDentType.NOTES,
                notes: [note],
                icon: (
                  <img
                    src="/avatars/EmptyAvatarIcon.png"
                    alt="User Avatar"
                    style={{ width: 28, height: 28, borderRadius: '50%' }}
                  />
                ),
              });
            }
          });
        }

        // Group by home member (tile)
        if (homeMember) {
          let target = noteCardItems?.data?.find(
            (data) => data.id === homeMember!.UniqueId
          );

          if (target) {
            target.notes.push(note);
          } else {
            const iconPath = getTileIconByType(homeMember.Type);
            let icon = (
              <img
                src={iconPath}
                alt="Hive Icon"
                style={{ width: 24, height: 24 }}
              />
            );

            noteCardItems?.data?.push({
              id: homeMember.UniqueId,
              title: homeMember.Name,
              dataType: EDentType.NOTES,
              notes: [note],
              icon: icon,
              type: homeMember.Type,
            });
          }
        }

        // Handle notes with no association
        if (familyMembers.length === 0 && homeMember === null) {
          let target = noteCardItems?.data?.find(
            (data) => data.id === "no-association"
          );

          if (target) {
            target.notes.push(note);
          } else {
            noteCardItems?.data?.push({
              id: "no-association",
              title: i18n.t('NoAssociation'),
              dataType: EDentType.NOTES,
              notes: [note],
              icon: (
                <img
                  src="/addNote.svg"
                  alt="Note Icon"
                  style={{ width: 28, height: 28 }}
                />
              ),
            });
          }
        }
      };
    },
    [tiles, family]
  );

  // Process task data to group by hive/association
  const processTaskData = useCallback(
    (taskCardItems: ITaskCardData): ((value: any, index: number, array: any[]) => void) => {
      return (task) => {
        let familyMembers: User[] = [];
        let homeMembers: INestedTile[] = [];

        // Get family members involved in the task
        if (task.People_Involved && task.People_Involved.length > 0) {
          familyMembers = family.filter((member) =>
            task.People_Involved?.includes(member.UniqueId)
          );
        }

        // Get home members (tiles) involved in the task
        if (task.HomeMembers && task.HomeMembers.length > 0) {
          homeMembers = tiles.filter((tile) =>
            task.HomeMembers?.includes(tile.UniqueId)
          );
        }

        // Group by family members
        if (familyMembers.length > 0) {
          familyMembers.forEach((member) => {
            let target = taskCardItems?.data?.find(
              (data) => data.id === member.UniqueId
            );

            if (target) {
              target.tasks.push(task);
            } else {
              taskCardItems?.data?.push({
                id: member.UniqueId,
                title: member.FirstName,
                dataType: EDentType.TASKS,
                tasks: [task],
                icon: (
                  <img
                    src="/avatars/EmptyAvatarIcon.png"
                    alt="User Avatar"
                    style={{ width: 28, height: 28, borderRadius: '50%' }}
                  />
                ),
              });
            }
          });
        }

        // Group by home members (tiles)
        if (homeMembers.length > 0) {
          homeMembers.forEach((tile) => {
            let target = taskCardItems?.data?.find(
              (data) => data.id === tile.UniqueId
            );

            if (target) {
              target.tasks.push(task);
            } else {
              const iconPath = getTileIconByType(tile.Type);
              let icon = (
                <img
                  src={iconPath}
                  alt="Hive Icon"
                  style={{ width: 24, height: 24 }}
                />
              );

              taskCardItems?.data?.push({
                id: tile.UniqueId,
                title: tile.Name,
                dataType: EDentType.TASKS,
                tasks: [task],
                icon: icon,
                type: tile.Type,
              });
            }
          });
        }

        // Handle tasks with no association
        if (familyMembers.length === 0 && homeMembers.length === 0) {
          let target = taskCardItems?.data?.find(
            (data) => data.id === "no-association"
          );

          if (target) {
            target.tasks.push(task);
          } else {
            taskCardItems?.data?.push({
              id: "no-association",
              title: i18n.t('NoAssociation'),
              dataType: EDentType.TASKS,
              tasks: [task],
              icon: (
                <img
                  src="/ItemType.svg"
                  alt="Task Icon"
                  style={{ width: 28, height: 28 }}
                />
              ),
            });
          }
        }
      };
    },
    [tiles, family]
  );

  // Process document data to group by hive/association
  const processDocData = useCallback(
    (docCardItems: IDocCardData): ((value: any, index: number, array: any[]) => void) => {
      return (file) => {
        let familyMembers: User[] = [];
        let homeMembers: INestedTile[] = [];

        // Get family members involved in the document (if any)
        if (file.BlackListed_Family && file.BlackListed_Family.length > 0) {
          familyMembers = family.filter((member) =>
            !file.BlackListed_Family?.includes(member.UniqueId)
          );
        } else {
          // If no blacklist, include all family members
          familyMembers = family;
        }

        // Get home members (tiles) involved in the document
        if (file.HomeMember_uniqueId) {
          const homeMember = tiles.find((tile) => tile.UniqueId === file.HomeMember_uniqueId);
          if (homeMember) {
            homeMembers = [homeMember];
          }
        }

        // Group by family members
        if (familyMembers.length > 0) {
          familyMembers.forEach((member) => {
            let target = docCardItems?.data?.find(
              (data) => data.id === member.UniqueId
            );

            if (target) {
              target.docs.push(file);
            } else {
              docCardItems?.data?.push({
                id: member.UniqueId,
                dataType: EDentType.DOCS,
                title: member.FirstName,
                icon: <Icon name="person" width={20} height={20} />,
                docs: [file],
                isCollapsed: true,
              });
            }
          });
        }

        // Group by home members (tiles)
        if (homeMembers.length > 0) {
          homeMembers.forEach((tile) => {
            let target = docCardItems?.data?.find(
              (data) => data.id === tile.UniqueId
            );

            if (target) {
              target.docs.push(file);
            } else {
              docCardItems?.data?.push({
                id: tile.UniqueId,
                dataType: EDentType.DOCS,
                title: tile.Name,
                icon: <Icon name="hive" width={20} height={20} />,
                docs: [file],
                isCollapsed: true,
              });
            }
          });
        }

        // If no associations, add to "no association" group
        if (familyMembers.length === 0 && homeMembers.length === 0) {
          let target = docCardItems?.data?.find(
            (data) => data.id === "no-association"
          );

          if (target) {
            target.docs.push(file);
          } else {
            docCardItems?.data?.push({
              id: "no-association",
              dataType: EDentType.DOCS,
              title: i18n.t('NoAssociation'),
              icon: <Icon name="document" width={20} height={20} />,
              docs: [file],
              isCollapsed: true,
            });
          }
        }
      };
    },
    [tiles, family]
  );

  // Handle search change with debounce (matching React Native)
  const handleSearchChange = useCallback((text: string) => {
    const debouncedUpdate = debounce((searchText: string) => {
      setSearchTerms(searchText);
    }, 300);
    debouncedUpdate(text);
  }, []);

  // Create filtered data structure matching React Native exactly
  const filteredDents: IDentAccordionListData = useMemo(() => {
    // Initialize data structures
    const docCardItems: IDocCardData = {
      sectionTitle: i18n.t('Documents'),
      data: [],
    };

    const eventCardItems: IEventCardData = {
      sectionTitle: i18n.t('Events'),
      data: [],
    };

    const noteCardItems: INoteCardData = {
      sectionTitle: i18n.t('Notes'),
      data: [],
    };

    const taskCardItems: ITaskCardData = {
      sectionTitle: i18n.t('Tasks'),
      data: [],
    };

    // Process events
    events
      .filter((event) => {
        if (searchTerms.length > 0) {
          return (
            (event.Title || '').toLowerCase().includes(searchTerms.toLowerCase()) ||
            (event?.Text ?? "")
              .toLowerCase()
              .includes(searchTerms.toLowerCase())
          );
        }
        return true;
      })
      .forEach(processEventData(eventCardItems));

    // Process notes
    notes
      .filter((note) => {
        if (searchTerms.length > 0) {
          return (
            (note.Title ?? "")
              .toLowerCase()
              .includes(searchTerms.toLowerCase()) ||
            (note?.Text ?? "").toLowerCase().includes(searchTerms.toLowerCase())
          );
        }
        return true;
      })
      .forEach(processNoteData(noteCardItems));

    // Process tasks
    (tasks as ITTask[])
      .filter((task) => {
        if (searchTerms.length > 0) {
          return (
            (task.Title ?? "").toLowerCase().includes(searchTerms.toLowerCase()) ||
            (task?.Text ?? "").toLowerCase().includes(searchTerms.toLowerCase())
          );
        }
        return true;
      })
      .forEach(processTaskData(taskCardItems));

    // Process documents
    files
      .filter((file) => {
        if (searchTerms.length > 0) {
          return (
            (file.Filename || file.filename || "").toLowerCase().includes(searchTerms.toLowerCase()) ||
            (file.StorageProviderUniqueId || file.storageProviderId || "").toLowerCase().includes(searchTerms.toLowerCase())
          );
        }
        return true;
      })
      .forEach(processDocData(docCardItems));

    return {
      [EDentType.DOCS]: docCardItems,
      [EDentType.EVENTS]: eventCardItems,
      [EDentType.NOTES]: noteCardItems,
      [EDentType.TASKS]: taskCardItems,
    };
  }, [
    searchTerms,
    events,
    notes,
    tasks,
    files,
    processEventData,
    processNoteData,
    processTaskData,
    processDocData,
  ]);

  // Calculate count exactly like React Native
  const count = useMemo(() => {
    return Object.values(filteredDents).reduce((acc, dent) => {
      if (!dent.data) return acc;
      return acc + dent.data.reduce((itemAcc, item) => {
        if (item.dataType === EDentType.EVENTS) {
          return itemAcc + item.events.length;
        } else if (item.dataType === EDentType.NOTES) {
          return itemAcc + item.notes.length;
        } else if (item.dataType === EDentType.TASKS) {
          return itemAcc + item.tasks.length;
        } else if (item.dataType === EDentType.DOCS) {
          return itemAcc + item.docs.length;
        }
        return itemAcc;
      }, 0);
    }, 0);
  }, [filteredDents]);

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.navContainer}>
          <NavHeader
            left={!isMobileApp ? {
              goBack: true,
              onPress: () => router.push(getBackPath()),
            } : undefined}
            headerText={!isMobileApp ? i18n.t('Search') : undefined}
          />
        </div>
        <div style={styles.contentContainer}>
          <CustomText style={{ textAlign: 'center', marginTop: '50px' }}>
            {i18n.t('LoadingEllipsis')}
          </CustomText>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.navContainer}>
        <NavHeader
          left={!isMobileApp ? {
            goBack: true,
            onPress: () => router.push(getBackPath()),
          } : undefined}
          headerText={!isMobileApp ? i18n.t('Search') : undefined}
        />
      </div>

      <div style={styles.contentContainer}>
        <div style={styles.searchInputContainer}>
          <input
            style={styles.searchInput}
            placeholder={i18n.t('Search')}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <button style={styles.filterButton}>
            <FilterIcon />
          </button>
        </div>

        <div style={styles.filtersAndCountContainer}>
          <div style={styles.countedResultsContainer}>
            {searchTerms.length > 0 && (
              <CustomText style={styles.countedResultsText}>
                {count} {i18n.t('ResultsFor')} {searchTerms}
              </CustomText>
            )}
          </div>
        </div>

        <div style={styles.scrollViewWithTitleContainer}>
          <div style={styles.resultsScrollView}>
            {Object.entries(filteredDents).map(([key, obj]) => (
              <React.Fragment key={key}>
                <CustomText style={styles.accordTitleText}>
                  {obj.sectionTitle}
                </CustomText>
                <div style={styles.resultsContainer}>
                  {obj?.data?.map((accord) => {
                    if (accord.dataType === EDentType.EVENTS) {
                      return (
                        <AccordionItem
                          key={`${accord.title}-${accord.id}`}
                          title={accord.title}
                          accordIcon={accord.icon}
                          count={accord.events?.length || 0}
                          AccordionType={EDentType.EVENTS}
                        >
                          {accord.events?.map((event: IEEvent) => (
                            <EventCard
                              key={event.UniqueId}
                              event={{
                                id: event.UniqueId || '',
                                title: event.Title || 'Untitled Event',
                                description: event.Text,
                                type: 'event',
                                date: event.Deadline_DateTime,
                                data: event
                              }}
                              onPress={() => {
                                const currentPath = window.location.pathname + window.location.search;
                                router.push(`/edit-event/${event.UniqueId}?returnTo=${encodeURIComponent(currentPath)}`);
                              }}
                            />
                          ))}
                        </AccordionItem>
                      );
                    } else if (accord.dataType === EDentType.NOTES) {
                      return (
                        <AccordionItem
                          key={`${accord.title}-${accord.id}`}
                          title={accord.title}
                          accordIcon={accord.icon}
                          count={accord.notes?.length || 0}
                          AccordionType={EDentType.NOTES}
                        >
                          {accord.notes?.map((note: INote) => (
                            <NoteCard
                              key={note.UniqueId}
                              note={{
                                id: note.UniqueId || '',
                                title: note.Title || '',
                                description: note.Text,
                                type: 'note',
                                date: note.Scheduled_Time,
                                data: note
                              }}
                              onPress={() => {
                                const currentPath = window.location.pathname + window.location.search;
                                router.push(`/edit-note/${note.UniqueId}?returnTo=${encodeURIComponent(currentPath)}`);
                              }}
                            />
                          ))}
                        </AccordionItem>
                      );
                    } else if (accord.dataType === EDentType.TASKS) {
                      return (
                        <AccordionItem
                          key={`${accord.title}-${accord.id}`}
                          title={accord.title}
                          accordIcon={accord.icon}
                          count={accord.tasks?.length || 0}
                          AccordionType={EDentType.TASKS}
                        >
                          {accord.tasks?.map((task: ITTask) => (
                            <TaskCard
                              key={task.UniqueId}
                              task={{
                                id: task.UniqueId || '',
                                title: task.Title || '',
                                description: task.Text,
                                type: 'task',
                                date: task.Deadline_DateTime || undefined,
                                data: task
                              }}
                              onPress={() => {
                                router.push(`/view-task/${task.UniqueId}?returnTo=/search`);
                              }}
                            />
                          ))}
                        </AccordionItem>
                      );
                    }
                    return null;
                  })}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function SearchPage() {
  const { i18n } = useLanguageContext();
  return (
    <Suspense fallback={
      <div style={styles.container}>
        <div style={styles.navContainer}>
          <NavHeader headerText={i18n.t('Search')} />
        </div>
        <div style={styles.contentContainer}>
          <CustomText style={{ textAlign: 'center', marginTop: '50px' }}>
            {i18n.t('LoadingEllipsis')}
          </CustomText>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

// Simple filter icon component
const FilterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={Colors.BLUE} strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    backgroundColor: Colors.WHITE,
    maxWidth: '800px',
    margin: '0 auto',
  },
  navContainer: {
    width: '100%',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingTop: '16px',
  },
  searchInputContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    height: '40px',
    marginBottom: '8px',
  },
  searchInput: {
    flex: 1,
    height: '40px',
    borderRadius: '4px',
    border: `1px solid ${Colors.COSMIC}`,
    paddingLeft: '10px',
    paddingRight: '10px',
    fontSize: '14px',
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.BLUE,
    outline: 'none',
  },
  filterButton: {
    height: '100%',
    aspectRatio: '1 / 1',
    minWidth: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '8px',
  },
  filtersAndCountContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: '2px',
    marginBottom: '16px',
  },
  countedResultsContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingRight: '20px',
  },
  countedResultsText: {
    fontSize: '14px',
    color: '#A5A5B2',
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
  scrollViewWithTitleContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    overflow: 'auto',
  },
  resultsScrollView: {
    display: 'flex',
    flexDirection: 'column' as const,
    paddingBottom: '20px',
    gap: '16px',
  },
  accordTitleText: {
    fontSize: '16px',
    color: Colors.BLUE,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    marginBottom: '8px',
  },
  resultsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginBottom: '24px',
  },
};