import { BucketType, ETileType, IFilterPill, ITileDataMapping, Tile } from './types';
import { IEEventUsers } from '../services/types';

// Common constants for the web application

export const PRIORITY_ITEMS = [
  {
    value: 0, // None/No Priority
    iconColor: "#666E96",
    selectionColor: "#E6E7EE",
  },
  {
    value: 1, // Low Priority
    iconColor: "#6CC47C",
    selectionColor: "#E0F8E5",
  },
  {
    value: 2, // Medium Priority
    iconColor: "#FFA020",
    selectionColor: "#FFEACD",
  },
  {
    value: 3, // High Priority
    iconColor: "#FF6961",
    selectionColor: "#FFE2E0",
  },
];

// Tile data mapping for the hex tiles
export const FILTER_PILLS = [
  { text: "Tasks", isSelected: true },
  { text: "Notes", isSelected: false },
  { text: "Docs", isSelected: false },
  { text: "Events", isSelected: false },
];

export const FILTER_PILLS_BY_TYPE: Partial<Record<BucketType, IFilterPill[]>> = {
  [BucketType.ALL]: [
    { text: "All", isSelected: true },
    { text: "Tasks", isSelected: false },
    { text: "Events", isSelected: false },
    { text: "Notes", isSelected: false },
    { text: "Docs", isSelected: false },
  ],
  [BucketType.TASKS]: [
    { text: "All", isSelected: true },
    { text: "To Do", isSelected: false },
    { text: "Complete", isSelected: false },
  ],
  [BucketType.EVENTS]: [
    { text: "All", isSelected: true },
    { text: "Upcoming", isSelected: false },
    { text: "Past", isSelected: false },
  ],
  [BucketType.NOTES]: [
    { text: "All", isSelected: true },
    { text: "Recent", isSelected: false },
  ],
  [BucketType.DOCS]: [
    { text: "All", isSelected: true },
    { text: "Recent", isSelected: false },
  ],
};

export const TILE_DATA_MAP: ITileDataMapping = {
  // HOME
  [ETileType.House]: {
    icon: 'hex-house',
    onClick: (tile: Tile, navigate?: (path: string) => void) => {
      // Navigate to house hive page
      if (navigate) {
        navigate('/house-hive');
      } else {
        window.location.href = '/house-hive';
      }
    },
    title: 'House',
    order: 1,
  },
  [ETileType['My Hive']]: {
    icon: 'hex-my-hive',
    onClick: (tile: Tile, navigate?: (path: string) => void) => {
      // Navigate to My Hive page
      if (navigate) {
        navigate('/my-hive');
      } else {
        window.location.href = '/my-hive';
      }
    },
    title: 'My Hive',
    order: 2,
  },
  [ETileType.EevaHive]: {
    icon: 'hex-eeva-logo',
    onClick: (tile: Tile) => {
      // Navigate to Eeva Hive page when implemented
      console.log('Clicked on Eeva Hive tile', tile);
    },
    title: 'eeva',
    order: 3,
  },

  // HOUSE HIVE TILES
  [ETileType.Property_Info]: {
    icon: 'propertyInfo',
    onClick: (tile: Tile, navigate?: (path: string) => void) => {
      // Navigate to Property Info page
      if (navigate) {
        navigate('/property-info');
      } else {
        window.location.href = '/property-info';
      }
    },
    title: 'Property Info',
    order: 1,
  },
  [ETileType.Appliances]: {
    icon: 'appliances',
    onClick: (tile: Tile, navigate?: (path: string) => void) => {
      // Navigate to Appliances page
      if (navigate) {
        navigate('/appliances');
      } else {
        window.location.href = '/appliances';
      }
    },
    title: 'Appliances',
    order: 2,
  },
  [ETileType.Spaces]: {
    icon: 'spaces',
    onClick: (tile: Tile, navigate?: (path: string) => void) => {
      // Navigate to Spaces page
      if (navigate) {
        navigate('/spaces');
      } else {
        window.location.href = '/spaces';
      }
    },
    title: 'Spaces',
    order: 3,
  },
  [ETileType.Utilities]: {
    icon: 'utilities',
    onClick: (tile: Tile, navigate?: (path: string) => void) => {
      // Navigate to Utilities page
      if (navigate) {
        navigate('/utilities');
      } else {
        window.location.href = '/utilities';
      }
    },
    title: 'Utilities',
    order: 4,
  },

  // PROPERTY INFO SUB-TILES
  [ETileType.Property_Deeds]: {
    icon: 'signPaper', // Using signPaper as fallback for property deeds
    onClick: (tile: Tile, navigate?: (path: string) => void) => {
      // Navigate to Property Deeds details page using standardized format
      const tileId = tile?.UniqueId || crypto.randomUUID();
      const path = `/property-detail/${tileId}?tileId=${tileId}&name=${encodeURIComponent('Property Deeds')}&type=${ETileType.Property_Deeds}`;
      if (navigate) {
        navigate(path);
      } else {
        window.location.href = path;
      }
    },
    title: 'Property Deeds',
    order: 1,
  },
  [ETileType.Mortgage]: {
    icon: 'mortage', // Note: the icon file is spelled "mortage" not "mortgage"
    onClick: (tile: Tile, navigate?: (path: string) => void) => {
      // Navigate to Mortgage details page using standardized format
      const tileId = tile?.UniqueId || crypto.randomUUID();
      const path = `/property-detail/${tileId}?tileId=${tileId}&name=${encodeURIComponent('Mortgage')}&type=${ETileType.Mortgage}`;
      if (navigate) {
        navigate(path);
      } else {
        window.location.href = path;
      }
    },
    title: 'Mortgage',
    order: 2,
  },
  [ETileType.Taxes]: {
    icon: 'taxes',
    onClick: (tile: Tile, navigate?: (path: string) => void) => {
      // Navigate to Taxes details page using standardized format
      const tileId = tile?.UniqueId || crypto.randomUUID();
      const path = `/property-detail/${tileId}?tileId=${tileId}&name=${encodeURIComponent('Taxes')}&type=${ETileType.Taxes}`;
      if (navigate) {
        navigate(path);
      } else {
        window.location.href = path;
      }
    },
    title: 'Taxes',
    order: 3,
  },
  [ETileType.Insurance]: {
    icon: 'insurance',
    onClick: (tile: Tile, navigate?: (path: string) => void) => {
      // Navigate to Insurance details page using standardized format
      const tileId = tile?.UniqueId || crypto.randomUUID();
      const path = `/property-detail/${tileId}?tileId=${tileId}&name=${encodeURIComponent('Insurance')}&type=${ETileType.Insurance}`;
      if (navigate) {
        navigate(path);
      } else {
        window.location.href = path;
      }
    },
    title: 'Insurance',
    order: 4,
  },
  [ETileType.Rent]: {
    icon: 'paymentCard', // Using paymentCard as fallback for rent
    onClick: (tile: Tile, navigate?: (path: string) => void) => {
      // Navigate to Rent details page using standardized format
      const tileId = tile?.UniqueId || crypto.randomUUID();
      const path = `/property-detail/${tileId}?tileId=${tileId}&name=${encodeURIComponent('Rent')}&type=${ETileType.Rent}`;
      if (navigate) {
        navigate(path);
      } else {
        window.location.href = path;
      }
    },
    title: 'Rent',
    order: 1,
  },
  [ETileType.Lease]: {
    icon: 'document', // Using document as fallback for lease
    onClick: (tile: Tile, navigate?: (path: string) => void) => {
      // Navigate to Lease details page using standardized format
      const tileId = tile?.UniqueId || crypto.randomUUID();
      const path = `/property-detail/${tileId}?tileId=${tileId}&name=${encodeURIComponent('Lease')}&type=${ETileType.Lease}`;
      if (navigate) {
        navigate(path);
      } else {
        window.location.href = path;
      }
    },
    title: 'Lease',
    order: 2,
  },
};

/**
 * Find event users by event ID
 * @param eventUsers - Array of event users to search through
 * @param eventId - The event ID to match
 * @returns Array of matching event users
 */
export const findEventUsersByEventId = (eventUsers: IEEventUsers[], eventId: string): IEEventUsers[] => {
  if (!eventUsers || !eventId) return [];

  return eventUsers.filter((eventUser) => eventUser.Event_uniqueId === eventId);
};

/**
 * Find family members by IDs
 * @param family - Array of family members to search through
 * @param ids - Array of IDs to match
 * @returns Array of matching family members
 */
export const findFamilyByIds = (family: any[], ids: string[]): any[] => {
  if (!family || !ids || ids.length === 0) return [];

  return family.filter((member) => ids.includes(member.UniqueId));
};

/**
 * Get initials from a user object
 * @param user - User object with FirstName and LastName
 * @returns String of initials
 */
export const getInitials = (user: any): string => {
  if (!user) return '';
  const firstName = user.FirstName || user.firstName || '';
  const lastName = user.LastName || user.lastName || '';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Activity Action & Type Maps. These values come from Backend. Do not edit.
export const ACTIVITY_ACTIONS = [
  "Create",
  "Update",
  "Delete",
  "Completed",
  "Invited",
  "Became Active",
  "Due",
  "Happening",
  "Assigned",
  "AddressUpdated",
  "PhoneUpdated",
];

export const ACTIVITY_TYPES = [
  "Event",
  "Task",
  "Note",
  "User",
  "Reminder",
  "Contact",
  "Grocery List",
  "Recipe",
  "Hex",
  "Provider",
];

/**
 * Reminder type constants matching API reference (0-10)
 *
 * API Reference: Reminder Types Table (June 2025)
 *
 * Value | Description
 * ------|------------
 * 0     | None (no reminder)
 * 1     | At time of event
 * 2     | 5 minutes before
 * 3     | 10 minutes before
 * 4     | 15 minutes before
 * 5     | 30 minutes before
 * 6     | 1 hour before (default)
 * 7     | 2 hours before
 * 8     | 1 day before
 * 9     | 2 days before
 * 10    | 1 week before
 *
 * Note: If not specified, the default value is 6 (1 hour before)
 */
export const REMINDER_OPTIONS: string[] = [
  "None",
  "At time of event",
  "5 minutes before",
  "10 minutes before",
  "15 minutes before",
  "30 minutes before",
  "1 hour before",
  "2 hours before",
  "1 day before",
  "2 days before",
  "1 week before",
];

/**
 * API Reference compliant frequency options
 *
 * API Reference: Recurring Frequency Values (January 2025)
 * These match the exact recurringFreq values expected by the new backend API
 *
 * Frequency Mapping:
 * - 0: None (default) - Single event
 * - 1: Daily - Every day
 * - 2: Weekly - Every week
 * - 3: Bi-Weekly - Every 2 weeks
 * - 4: Monthly - Every month
 * - 5: Yearly - Every year
 */
export const RECURRING_FREQUENCY_ITEMS = [
  "None",
  "Daily",
  "Weekly",
  "Bi-Weekly",
  "Monthly",
  "Yearly",
];

/**
 * Convert frequency option string to recurringFreq numeric value (0-5)
 * Updated to match the new backend API specification
 * @param option - The frequency option string
 * @returns Number representing the recurring frequency (0-5)
 */
export const getRecurringFreqValue = (option: string): number => {
  switch (option) {
    case "None": return 0;
    case "Daily": return 1;
    case "Weekly": return 2;
    case "Bi-Weekly": return 3;
    case "Monthly": return 4;
    case "Yearly": return 5;
    default: return 0; // Default to None
  }
};

/**
 * Convert recurringFreq numeric value to frequency option string
 * @param value - The recurringFreq numeric value (0-5)
 * @returns String representing the frequency option
 */
export const getFrequencyOptionFromValue = (value: number): string => {
  switch (value) {
    case 0: return "None";
    case 1: return "Daily";
    case 2: return "Weekly";
    case 3: return "Bi-Weekly";
    case 4: return "Monthly";
    case 5: return "Yearly";
    default: return "None"; // Default to None
  }
};

/**
 * Convert reminder option to API reminder type number (0-10)
 * Updated to match the exact API reference specification
 * @param option - The reminder option string
 * @returns Number representing the reminder type (0-10)
 */
export const ReminderOptions = (option: string): number => {
  switch (option) {
    case "None": return 0;
    case "At time of event": return 1;
    case "5 minutes before": return 2;
    case "10 minutes before": return 3;
    case "15 minutes before": return 4;
    case "30 minutes before": return 5;
    case "1 hour before": return 6;
    case "2 hours before": return 7;
    case "1 day before": return 8;
    case "2 days before": return 9;
    case "1 week before": return 10;
    default: return 6; // Default to 1 hour before as per API reference
  }
};

/**
 * API Reference compliant frequency mapping
 * Maps UI display values to API expected values
 */
export const FREQUENCY_API_MAPPING: Record<string, string> = {
  "None": "none",
  "Daily": "daily",
  "Weekly": "weekly",
  "Bi-Weekly": "biweekly",
  "Monthly": "monthly",
  "Yearly": "yearly"
};

/**
 * Convert UI frequency string to API frequency string
 * @param uiFrequency - The frequency string from UI
 * @returns API-compliant frequency string
 */
export const getApiFrequency = (uiFrequency: string): string => {
  return FREQUENCY_API_MAPPING[uiFrequency] || "none";
};
