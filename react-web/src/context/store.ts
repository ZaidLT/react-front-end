import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IEEvent, ITTask, INote, IContact, User, IActivity, EventTime } from '../services/types';
import { INestedTile, Provider } from '../util/types';

// Define overlay type
interface Overlay {
  visible: boolean;
  type: string;
  data?: any;
  isLoading?: boolean;
}

// Define the store types
interface EventStore {
  events: IEEvent[];
  setEvents: (events: IEEvent[]) => void;
  addEvent: (event: IEEvent) => void;
  updateEvent: (event: IEEvent) => void;
  deleteEvent: (eventId: string) => void;
}

interface TaskStore {
  tasks: ITTask[];
  setTasks: (tasks: ITTask[]) => void;
  addTask: (task: ITTask) => void;
  updateTask: (task: ITTask) => void;
  updateTasks: (tasks: ITTask[]) => void;
  deleteTask: (taskId: string) => void;
}

interface NoteStore {
  notes: INote[];
  setNotes: (notes: INote[]) => void;
  addNote: (note: INote) => void;
  updateNote: (note: INote) => void;
  deleteNote: (noteId: string) => void;
}

interface ContactStore {
  contacts: IContact[];
  setContacts: (contacts: IContact[]) => void;
  updateContacts: (contacts: IContact[]) => void;
  addContact: (contact: IContact) => void;
  updateContact: (contact: IContact) => void;
  deleteContact: (contactId: string) => void;
}

interface UserStore {
  users: User[];
  user: User | null;
  setUsers: (users: User[]) => void;
  setUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
}

interface TileStore {
  tiles: INestedTile[];
  setTiles: (tiles: INestedTile[]) => void;
  addTile: (tile: INestedTile) => void;
  updateTile: (tile: INestedTile) => void;
  deleteTile: (tileId: string) => void;
}

interface TileFileStore {
  tileFiles: any[];
  setTileFiles: (tileFiles: any[]) => void;
  addTileFile: (tileFile: any) => void;
  updateTileFile: (tileFile: any) => void;
  deleteTileFile: (tileFileId: string) => void;
}

interface MemberFileStore {
  memberFiles: any[];
  setMemberFiles: (memberFiles: any[]) => void;
  addMemberFile: (memberFile: any) => void;
  updateMemberFile: (memberFile: any) => void;
  deleteMemberFile: (memberFileId: string) => void;
}

interface FileStore {
  files: any[];
  setFiles: (files: any[]) => void;
  addFile: (file: any) => void;
  updateFile: (file: any) => void;
  deleteFile: (fileId: string) => void;
}

interface ContactFileStore {
  contactFiles: any[];
  setContactFiles: (contactFiles: any[]) => void;
  addContactFile: (contactFile: any) => void;
  updateContactFile: (contactFile: any) => void;
  deleteContactFile: (contactFileId: string) => void;
}

interface FamilyStore {
  family: any[];
  setFamily: (family: any[]) => void;
  addFamilyMember: (familyMember: any) => void;
  updateFamilyMember: (familyMember: any) => void;
  deleteFamilyMember: (familyMemberId: string) => void;
}

interface EventUsersStore {
  eventUsers: any[];
  setEventUsers: (eventUsers: any[]) => void;
  addEventUser: (eventUser: any) => void;
  updateEventUser: (eventUser: any) => void;
  deleteEventUser: (eventUserId: string) => void;
}

interface ActivityStore {
  activities: IActivity[];
  setActivities: (activities: IActivity[]) => void;
  addActivity: (activity: IActivity) => void;
  updateActivity: (activity: IActivity) => void;
  deleteActivity: (activityId: string) => void;
  updateActivities: (activities: IActivity[]) => void;
}

interface EventTimeStore {
  eventTimes: EventTime[];
  setEventTimes: (eventTimes: EventTime[]) => void;
  addEventTime: (eventTime: EventTime) => void;
  updateEventTime: (eventTime: EventTime) => void;
  deleteEventTime: (eventTimeId: string) => void;
}

interface ProviderStore {
  providers: Provider[];
  setProviders: (providers: Provider[]) => void;
  addProvider: (provider: Provider) => void;
  updateProvider: (provider: Provider) => void;
  deleteProvider: (providerId: string) => void;
}

interface OverlayStore {
  overlay: Overlay;
  updateOverlay: (overlay: Partial<Overlay>) => void;
}

interface CacheMetadata {
  lastFetched: number;
  isRefreshing: boolean;
}

interface CacheStore {
  tasks: CacheMetadata;
  events: CacheMetadata;
  tiles: CacheMetadata;
  setLastFetched: (key: 'tasks' | 'events' | 'tiles') => void;
  setRefreshing: (key: 'tasks' | 'events' | 'tiles', isRefreshing: boolean) => void;
  isCacheValid: (key: 'tasks' | 'events' | 'tiles', maxAgeMs?: number) => boolean;
}

interface MonthCacheEntry {
  events: IEEvent[];
  lastFetched: number;
  userId: string;
  accountId?: string;
}

interface EventMonthCacheStore {
  cache: Record<string, MonthCacheEntry>; // key: `${userId}:${accountId}:${YYYY-MM}`
  getKey: (userId: string, accountId: string | undefined, monthKey: string) => string;
  getMonthEvents: (userId: string, accountId: string | undefined, monthKey: string) => IEEvent[] | null;
  setMonthEvents: (userId: string, accountId: string | undefined, monthKey: string, events: IEEvent[]) => void;
  clearCache: (userId?: string) => void;
}

interface PropertyInfoCache {
  propertySituation: string;
  lastFetched: number;
  userId: string;
}

interface PropertyInfoStore {
  cache: Record<string, PropertyInfoCache>; // keyed by userId
  setPropertySituation: (userId: string, propertySituation: string) => void;
  getPropertySituation: (userId: string) => string | null;
  isCacheValid: (userId: string, maxAgeMs?: number) => boolean;
  clearCache: (userId?: string) => void;
  invalidateAndRefresh: (userId: string, accountId: string) => Promise<string | null>;
}

interface UserProfileCache {
  userData: User;
  lastFetched: number;
  userId: string;
}

interface UserProfileStore {
  cache: Record<string, UserProfileCache>; // keyed by userId
  setUserProfile: (userId: string, userData: User) => void;
  getUserProfile: (userId: string) => User | null;
  isCacheValid: (userId: string, maxAgeMs?: number) => boolean;
  clearCache: (userId?: string) => void;
  invalidateUser: (userId: string) => void; // For when user data is updated
}

// Create the stores with persistence
export const useEventStore = create<EventStore>()(
  persist(
    (set) => ({
      events: [],
      setEvents: (events) => set({ events }),
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      updateEvent: (event) => set((state) => ({
        events: state.events.map((e) => (e.UniqueId === event.UniqueId ? event : e)),
      })),
      deleteEvent: (eventId) => set((state) => ({
        events: state.events.filter((e) => e.UniqueId !== eventId),
      })),
    }),
    {
      name: 'events-storage',
    }
  )
);

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (task) => set((state) => ({
        tasks: state.tasks.map((t) => (t.UniqueId === task.UniqueId ? task : t)),
      })),
      updateTasks: (tasks) => set({ tasks }),
      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter((t) => t.UniqueId !== taskId),
      })),
    }),
    {
      name: 'tasks-storage',
    }
  )
);

export const useNoteStore = create<NoteStore>((set) => ({
  notes: [],
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  updateNote: (note) => set((state) => ({
    notes: state.notes.map((n) => (n.UniqueId === note.UniqueId ? note : n)),
  })),
  deleteNote: (noteId) => set((state) => ({
    notes: state.notes.filter((n) => n.UniqueId !== noteId),
  })),
}));

export const useContactStore = create<ContactStore>((set) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  updateContacts: (contacts) => set({ contacts }),
  addContact: (contact) => set((state) => ({ contacts: [...state.contacts, contact] })),
  updateContact: (contact) => set((state) => ({
    contacts: state.contacts.map((c) => (c.UniqueId === contact.UniqueId ? contact : c)),
  })),
  deleteContact: (contactId) => set((state) => ({
    contacts: state.contacts.filter((c) => c.UniqueId !== contactId),
  })),
}));

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  user: null,
  setUsers: (users) => set({ users }),
  setUser: (user) => set({ user }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (user) => set((state) => ({
    users: state.users.map((u) => (u.UniqueId === user.UniqueId ? user : u)),
    user: state.user?.UniqueId === user.UniqueId ? user : state.user,
  })),
  deleteUser: (userId) => set((state) => ({
    users: state.users.filter((u) => u.UniqueId !== userId),
    user: state.user?.UniqueId === userId ? null : state.user,
  })),
}));

export const useTileStore = create<TileStore>()(
  persist(
    (set) => ({
      tiles: [],
      setTiles: (tiles) => set({ tiles }),
      addTile: (tile) => set((state) => ({ tiles: [...state.tiles, tile] })),
      updateTile: (tile) => set((state) => ({
        tiles: state.tiles.map((t) => (t.UniqueId === tile.UniqueId ? tile : t)),
      })),
      deleteTile: (tileId) => set((state) => ({
        tiles: state.tiles.filter((t) => t.UniqueId !== tileId),
      })),
    }),
    {
      name: 'tiles-storage',
    }
  )
);

export const useTileFileStore = create<TileFileStore>((set) => ({
  tileFiles: [],
  setTileFiles: (tileFiles) => set({ tileFiles }),
  addTileFile: (tileFile) => set((state) => ({ tileFiles: [...state.tileFiles, tileFile] })),
  updateTileFile: (tileFile) => set((state) => ({
    tileFiles: state.tileFiles.map((tf) => (tf.UniqueId === tileFile.UniqueId ? tileFile : tf)),
  })),
  deleteTileFile: (tileFileId) => set((state) => ({
    tileFiles: state.tileFiles.filter((tf) => tf.UniqueId !== tileFileId),
  })),
}));

export const useMemberFileStore = create<MemberFileStore>((set) => ({
  memberFiles: [],
  setMemberFiles: (memberFiles) => set({ memberFiles }),
  addMemberFile: (memberFile) => set((state) => ({ memberFiles: [...state.memberFiles, memberFile] })),
  updateMemberFile: (memberFile) => set((state) => ({
    memberFiles: state.memberFiles.map((mf) => (mf.UniqueId === memberFile.UniqueId ? memberFile : mf)),
  })),
  deleteMemberFile: (memberFileId) => set((state) => ({
    memberFiles: state.memberFiles.filter((mf) => mf.UniqueId !== memberFileId),
  })),
}));

export const useFileStore = create<FileStore>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  updateFile: (file) => set((state) => ({
    files: state.files.map((f) => (f.UniqueId === file.UniqueId ? file : f)),
  })),
  deleteFile: (fileId) => set((state) => ({
    files: state.files.filter((f) => f.UniqueId !== fileId),
  })),
}));

export const useProviderStore = create<ProviderStore>((set) => ({
  providers: [],
  setProviders: (providers) => set({ providers }),
  addProvider: (provider) => set((state) => ({ providers: [...state.providers, provider] })),
  updateProvider: (provider) => set((state) => ({
    providers: state.providers.map((p) => (p.UniqueId === provider.UniqueId ? provider : p)),
  })),
  deleteProvider: (providerId) => set((state) => ({
    providers: state.providers.filter((p) => p.UniqueId !== providerId),
  })),
}));

export const useContactFileStore = create<ContactFileStore>((set) => ({
  contactFiles: [],
  setContactFiles: (contactFiles) => set({ contactFiles }),
  addContactFile: (contactFile) => set((state) => ({ contactFiles: [...state.contactFiles, contactFile] })),
  updateContactFile: (contactFile) => set((state) => ({
    contactFiles: state.contactFiles.map((cf) => (cf.UniqueId === contactFile.UniqueId ? contactFile : cf)),
  })),
  deleteContactFile: (contactFileId) => set((state) => ({
    contactFiles: state.contactFiles.filter((cf) => cf.UniqueId !== contactFileId),
  })),
}));

export const useFamilyStore = create<FamilyStore>((set) => ({
  family: [],
  setFamily: (family) => set({ family }),
  addFamilyMember: (familyMember) => set((state) => ({ family: [...state.family, familyMember] })),
  updateFamilyMember: (familyMember) => set((state) => ({
    family: state.family.map((fm) => (fm.UniqueId === familyMember.UniqueId ? familyMember : fm)),
  })),
  deleteFamilyMember: (familyMemberId) => set((state) => ({
    family: state.family.filter((fm) => fm.UniqueId !== familyMemberId),
  })),
}));

export const useEventUsersStore = create<EventUsersStore>((set) => ({
  eventUsers: [],
  setEventUsers: (eventUsers) => set({ eventUsers }),
  addEventUser: (eventUser) => set((state) => ({ eventUsers: [...state.eventUsers, eventUser] })),
  updateEventUser: (eventUser) => set((state) => ({
    eventUsers: state.eventUsers.map((eu) => (eu.UniqueId === eventUser.UniqueId ? eventUser : eu)),
  })),
  deleteEventUser: (eventUserId) => set((state) => ({
    eventUsers: state.eventUsers.filter((eu) => eu.UniqueId !== eventUserId),
  })),
}));

export const useActivityStore = create<ActivityStore>((set) => ({
  activities: [],
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) => set((state) => ({ activities: [...state.activities, activity] })),
  updateActivity: (activity) => set((state) => ({
    activities: state.activities.map((a) => (a.UniqueId === activity.UniqueId ? activity : a)),
  })),
  deleteActivity: (activityId) => set((state) => ({
    activities: state.activities.filter((a) => a.UniqueId !== activityId),
  })),
  updateActivities: (activities) => set({ activities }),
}));

export const useEventTimeStore = create<EventTimeStore>((set) => ({
  eventTimes: [],
  setEventTimes: (eventTimes) => set({ eventTimes }),
  addEventTime: (eventTime) => set((state) => ({ eventTimes: [...state.eventTimes, eventTime] })),
  updateEventTime: (eventTime) => set((state) => ({
    eventTimes: state.eventTimes.map((et) => (et.UniqueId === eventTime.UniqueId ? eventTime : et)),
  })),
  deleteEventTime: (eventTimeId) => set((state) => ({
    eventTimes: state.eventTimes.filter((et) => et.UniqueId !== eventTimeId),
  })),
}));

export const useOverlayStore = create<OverlayStore>((set) => ({
  overlay: {
    visible: false,
    type: '',
  },
  updateOverlay: (overlay) => set((state) => ({
    overlay: { ...state.overlay, ...overlay },
  })),
}));

// Cache metadata store for tracking data freshness
export const useCacheStore = create<CacheStore>()(
  persist(
    (set, get) => ({
      tasks: { lastFetched: 0, isRefreshing: false },
      events: { lastFetched: 0, isRefreshing: false },
      tiles: { lastFetched: 0, isRefreshing: false },

      setLastFetched: (key) => set((state) => ({
        [key]: { ...state[key], lastFetched: Date.now(), isRefreshing: false }
      })),


      setRefreshing: (key, isRefreshing) => set((state) => ({
        [key]: { ...state[key], isRefreshing }
      })),

      isCacheValid: (key, maxAgeMs = 5 * 60 * 1000) => { // Default 5 minutes
        const cache = get()[key];
        if (!cache || cache.lastFetched === 0) return false;
        return (Date.now() - cache.lastFetched) < maxAgeMs;
      },
    }),
    {
      name: 'cache-metadata-storage',
    }
  )
);

export const usePropertyInfoStore = create<PropertyInfoStore>((set, get) => ({
  cache: {},
  setPropertySituation: (userId, propertySituation) => set((state) => ({
    cache: {
      ...state.cache,
      [userId]: {
        propertySituation,
        lastFetched: Date.now(),
        userId,
      },
    },
  })),
  getPropertySituation: (userId) => {
    const cache = get().cache[userId];
    return cache?.propertySituation || null;
  },
  isCacheValid: (userId, maxAgeMs = 30 * 60 * 1000) => { // Default 30 minutes
    const cache = get().cache[userId];
    if (!cache) return false;
    return (Date.now() - cache.lastFetched) < maxAgeMs;
  },
  clearCache: (userId) => set((state) => {
    if (userId) {
      const { [userId]: removed, ...rest } = state.cache;
      return { cache: rest };
    }
    return { cache: {} };
  }),
  invalidateAndRefresh: async (userId, accountId) => {
    try {
      // Clear existing cache
      get().clearCache(userId);


      // Import cachedUserService dynamically to avoid circular dependency
      const { default: cachedUserService } = await import('../services/cachedUserService');

      // Fetch fresh data from database
      const freshUserData = await cachedUserService.getUserById(userId, accountId, true); // Force refresh

      if (freshUserData) {
        const freshPropertySituation =
          (freshUserData as any).propertySituation ||
          (freshUserData as any).property_situation ||
          freshUserData.PropertySituation ||
          'Own';

        // Update cache with fresh data
        get().setPropertySituation(userId, freshPropertySituation);

        return freshPropertySituation;
      }

      return null;
    } catch (error) {
      console.error('Error in invalidateAndRefresh:', error);
      return null;
    }
  },
}));

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      cache: {},
      setUserProfile: (userId, userData) => set((state) => ({
        cache: {
          ...state.cache,
          [userId]: {
            userData,
            lastFetched: Date.now(),
            userId,
          },
        },
      })),
      getUserProfile: (userId) => {
        const cache = get().cache[userId];
        return cache?.userData || null;
      },
      isCacheValid: (userId, maxAgeMs = 30 * 60 * 1000) => { // Default 30 minutes
        const cache = get().cache[userId];
        if (!cache) return false;
        return (Date.now() - cache.lastFetched) < maxAgeMs;
      },
      clearCache: (userId) => set((state) => {
        if (userId) {
          const { [userId]: removed, ...rest } = state.cache;
          return { cache: rest };
        }
        return { cache: {} };
      }),
      invalidateUser: (userId) => set((state) => {
        const { [userId]: removed, ...rest } = state.cache;
        return { cache: rest };

      }),
    }),
    {
      name: 'user-profile-cache',
      // Only persist for 30 minutes to match cache expiry
      partialize: (state) => {
        const now = Date.now();
        const validCache: Record<string, UserProfileCache> = {};

        // Only persist cache entries that are still valid
        Object.entries(state.cache).forEach(([userId, cacheEntry]) => {
          if (now - cacheEntry.lastFetched < 30 * 60 * 1000) { // 30 minutes
            validCache[userId] = cacheEntry;
          }
        });

        return { cache: validCache };
      },
    }
  )
);


export const useEventMonthCacheStore = create<EventMonthCacheStore>()(
  persist(
    (set, get) => ({
      cache: {},
      getKey: (userId, accountId, monthKey) => `${userId}:${accountId || ''}:${monthKey}`,
      getMonthEvents: (userId, accountId, monthKey) => {
        const key = get().getKey(userId, accountId, monthKey);
        const entry = get().cache[key];
        return entry?.events || null;
      },
      setMonthEvents: (userId, accountId, monthKey, events) => set((state) => {
        const key = state.getKey(userId, accountId, monthKey);
        return {
          cache: {
            ...state.cache,
            [key]: { events, lastFetched: Date.now(), userId, accountId },
          },
        };
      }),
      clearCache: (userId) => set((state) => {
        if (!userId) return { cache: {} };
        const next: Record<string, MonthCacheEntry> = {};
        Object.entries(state.cache).forEach(([k, v]) => {
          if (v.userId !== userId) next[k] = v;
        });
        return { cache: next };
      }),
    }),
    {
      name: 'events-month-cache',
    }
  )
);
