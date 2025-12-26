export type User = {
  Account_uniqueId: string;
  EmailAddress: string;
  DisplayName?: string;
  FirstName: string;
  LastName: string;
  EncryptedPassword: string;
  Language?: number | undefined;
  AvatarImagePath?: string;
  DisplayMode?: number;
  ActiveUser?: boolean;
  ActiveFamilyMember?: boolean;
  TemporaryPasswordResetCode?: string | null;
  TemporaryPasswordResetNewPassword?: string;
  FirstTimeLogin?: boolean;
  Address?: string;
  StreetName?: string;
  City?: string;
  State?: string;
  Country?: string;
  ZipCode?: string;
  Birthday?: string | null;
  Workplace?: string;
  Cell_Phone_Number?: string;
  Home_Phone_Number?: string;
  UniqueId: string;
  CreationTimestamp?: string;
  UpdateTimestamp?: string;
  Active?: boolean;
  Deleted?: boolean;
  HouseDetails_Image: string;
  HouseDetails_Data: string;
  PropertySituation?: string;
  propertySituation?: string; // Backend API field name
  AccessToken?: string;
  LastSeenFeedback?: string
  FeedbackSubmitted?:boolean
};

// Sample item types for weekly stats
export interface SampleTask {
  id: string;
  title: string;
  deadline_date_time: string;
  priority: number;
  completed: boolean;
  creation_timestamp: string;
}

export interface SampleEvent {
  id: string;
  title: string;
  start_date_time: string;
  end_date_time?: string;
  creation_timestamp: string;
}

// Weekly Stats API Types
export interface WeeklyStatsResponse {
  dentsCount: {
    notes: number;
    events: number;
    tasks: number;
    docs: number;
  };
  weeklyStats: {
    eventsUpcoming: number;
    tasksIncomplete: number;
    tasksDueThisWeek: number;
    tasksCompletedThisWeek: number;
    notesCreatedThisWeek: number;
    docsUploadedThisWeek: number;
  };
  userBreakdowns?: Array<{
    userId: string;
    userName: string;
    dentsCount: {
      notes: number;
      events: number;
      tasks: number;
      docs: number;
    };
    weeklyStats: {
      eventsUpcoming: number;
      tasksIncomplete: number;
      tasksDueThisWeek: number;
      tasksCompletedThisWeek: number;
      notesCreatedThisWeek: number;
      docsUploadedThisWeek: number;
      sampleEvents?: SampleEvent[];
      sampleIncompleteTasks?: SampleTask[];
      sampleCompletedTasks?: SampleTask[];
    };
  }>;
}

export interface WeeklyStatsRequest {
  accountId: string;
  userId?: string;
  includeUserBreakdown?: boolean;
  includeSampleItems?: boolean;
}

export interface IContact {
  DisplayName?: string;
  UniqueId?: string;
  User_uniqueId?: string;
  CreationTimestamp?: string;
  UpdateTimestamp?: string;
  Active?: boolean;
  Deleted?: boolean;
  Account_uniqueId?: string;
  EmailAddress?: string;
  SecondaryEmailAddress?: string;
  TertiaryEmailAddress?: string;
  FirstName: string;
  LastName: string;
  AvatarImagePath?: string;
  Address?: string;
  SecondaryAddress?: string;
  TertiaryAddress?: string;
  StreetName?: string;
  City?: string;
  State?: string;
  Country?: string;
  ZipCode?: string;
  Birthday?: string;
  Workplace?: string;
  Cell_Phone_Number?: string;
  Home_Phone_Number?: string;
  TertiaryPhoneNumber?: string;
  RelevantNotes?: string;
  Type?: string;
  Relationship?: string;
  MobileDeviceContactId?: string;
  Invited_User_uniqueId?: string;
}

export interface IEEvent {
  id?: string;
  accountId?: string;
  userId?: string;
  title: string;
  text?: string;
  location?: string;
  // React Native compatibility fields
  UniqueId?: string;
  Account_uniqueId?: string;
  User_uniqueId?: string;
  Title?: string;
  Text?: string;
  Location?: string;
  Active?: boolean;
  Deleted?: boolean;
  CreationTimestamp?: string;
  UpdateTimestamp?: string;
  titleId?: string;
  taskId?: string;
  contactId?: string;
  priority?: number;
  delegateUserId?: string;
  deadlineDateTime: string;
  deadlineDateTimeEnd?: string;
  scheduledTime?: string;
  scheduledTimeEnd?: string;
  isAllDay?: boolean;
  // Completion (frontend convenience, mapped in mapEventResponse)
  completed?: boolean;
  // React Native compatibility fields for dates/times
  Deadline_DateTime?: string;
  Deadline_DateTime_End?: string;
  Scheduled_Time?: string;
  Scheduled_Time_End?: string;
  Priority?: number;
  Color?: string;
  reminderEachXYears?: number;
  reminderEachXMonths?: number;
  reminderEachXWeeks?: number;
  reminderEachXDays?: number;
  reminderFrequency?: string;
  recurringFreq?: number;
  reminderEachXWeek01?: number;
  reminderEachXWeek02?: boolean;
  reminderEachXWeek03?: boolean;
  reminderEachXWeek04?: boolean;
  reminderEachXWeek05?: boolean;
  reminderEachXWeek06?: boolean;
  reminderEachXWeek07?: boolean;
  reminderEachXDays01?: boolean;
  reminderEachXDays02?: boolean;
  reminderEachXDays03?: boolean;
  reminderEachXDays04?: boolean;
  reminderEachXDays05?: boolean;
  reminderEachXDays06?: boolean;
  reminderEachXDays07?: boolean;
  reminderEachXDays08?: boolean;
  reminderEachXDays09?: boolean;
  reminderEachXDays10?: boolean;
  reminderEachXDays11?: boolean;
  reminderEachXDays12?: boolean;
  reminderEachXDays13?: boolean;
  reminderEachXDays14?: boolean;
  reminderEachXDays15?: boolean;
  reminderEachXDays16?: boolean;
  reminderEachXDays17?: boolean;
  reminderEachXDays18?: boolean;
  reminderEachXDays19?: boolean;
  reminderEachXDays20?: boolean;
  reminderEachXDays21?: boolean;
  reminderEachXDays22?: boolean;
  reminderEachXDays23?: boolean;
  reminderEachXDays24?: boolean;
  reminderEachXDays25?: boolean;
  reminderEachXDays26?: boolean;
  reminderEachXDays27?: boolean;
  reminderEachXDays28?: boolean;
  reminderEachXDays29?: boolean;
  reminderEachXDays30?: boolean;
  reminderEachXDays31?: boolean;
  color?: string;
  durationInSeconds?: number;
  importCalendarId?: string;
  importEventId?: string;
  homeMembers?: string[];
  blacklistedFamily?: string[];
  peopleInvolved?: string[];
  recurringPattern?: string;
  useJustInTime?: string;

  // Legacy fields for backward compatibility
  HomeMembers?: string[];
  People_Involved?: string[];
  BlackListed_Family?: string[];
  RecurringFreq?: number;
}

export interface ITTask {
  Account_uniqueId: string;
  Active?: boolean;
  Color?: string;
  contactId?: string | null;
  CreationTimestamp?: string;
  Deadline_DateTime?: string | null;
  Deadline_DateTime_End?: string | null;
  Delegate_User_uniqueId?: string | null;
  Deleted?: boolean;
  Event_uniqueId?: string | null;
  HomeMember_uniqueId?: string | null;
  Priority?: number | null;
  Scheduled_Time: string;
  Scheduled_Time_End: string;
  Reminder_Each_X_Days?: number | null;
  Reminder_Each_X_Months?: number | null;
  Reminder_Each_X_Weeks?: number | null;
  BlackListed_Family?: string[];
  Tag?: string | null;
  Text: string;
  Title: string;
  Tile_uniqueId?: string | null;
  UniqueId?: string;
  UpdateTimestamp?: string;
  User_uniqueId: string;
  HomeMembers?: string[];
  RecurringFreq: number;
  People_Involved?: string[];
  EventTime_UniqueId?: string;
  completed?: boolean;
}

export interface INote {
  UniqueId?: string;
  User_uniqueId?: string;
  CreationTimestamp?: string;
  UpdateTimestamp?: string;
  Active?: boolean;
  Deleted?: boolean;
  Account_uniqueId?: string;
  Title?: string;
  Text?: string;
  tileId?: string; // Primary hive assignment field (backend uses this)
  HomeMember_uniqueId?: string; // Legacy hive assignment field
  Task_uniqueId?: string;
  Event_uniqueId?: string;
  Priority?: number;
  contactId?: string;
  Scheduled_Time: string;
  Scheduled_Time_End: string;
  Deadline_DateTime?: string;
  Reminder_Each_X_Months?: number;
  Reminder_Each_X_Weeks?: number;
  Reminder_Each_X_Days?: number;
  BlackListed_Family?: string[];
  Color?: string;
  HomeMembers?: string[]; // Array of user IDs for attribution
  Checklist_Data?: string;
  Deadline_DateTime_End?: string;
  RecurringFreq?: number;
  People_Involved?: string[];
  // New API field for delegation
  delegateUserId?: string | null;
}

export interface IEEventUsers {
  Account_uniqueId: string;
  Active: boolean;
  CreationTimestamp: string;
  Deleted: boolean;
  Event_uniqueId: string;
  UniqueId?: string;
  UpdateTimestamp: string;
  User_FamilyMember_uniqueId: string;
  User_uniqueId: string;
}

export interface IEEventTag {
  UniqueId?: string;
  User_uniqueId: string;
  CreationTimestamp?: string;
  UpdateTimestamp?: string;
  Active?: boolean;
  Deleted?: boolean;
  Account_uniqueId: string;
  Tag_UniqueId?: string;
  Event_UniqueId: string;
}

export interface ITag {
  UniqueId?: string;
  Account_uniqueId: string;
  User_uniqueId: string;
  CreationTimestamp?: string;
  UpdateTimestamp?: string;
  Active?: boolean;
  Deleted?: boolean;
  TagName: string;
}

export interface EventTime {
  UniqueId?: string;
  Account_uniqueId: string;
  creationTimestamp?: string;
  updateTimestamp?: string;
  active?: boolean;
  deleted?: boolean;
  Event_uniqueId?: string;
  EventTime: string;
  Complete?: boolean;
}

export enum EActivityType {
  Event = 0,
  Task = 1,
  Note = 2,
  User = 3,
  Reminder = 4,
  Contact = 5,
  GroceryList = 6,
  Recipe = 7,
  Hex = 8,
  Provider = 9,
}

export enum EActivityAction {
  Create = 0,
  Update = 1,
  Delete = 2,
  Completed = 3,
  Invited = 4,
  Activated = 5,
  Due = 6,
  Happening = 7,
  Assigned = 8,
  AddressUpdated = 9,
  PhoneUpdated = 10,
}

export interface IActivity {
  UniqueId: string;
  User_uniqueId: string;
  CreationTimestamp: string;
  UpdateTimestamp: string;
  Active: boolean;
  Deleted: boolean;
  Account_uniqueId: string;
  ActivityType: EActivityType;
  Action: EActivityAction;
  Activity_uniqueId: string;
  AssociatedUser_uniqueId: string;
}

export interface IBaseItem {
  Account_uniqueId: string;
  Active: boolean;
  Color: string | null;
  AvatarImagePath: string | null;
  contactId: string | null;
  CreationTimestamp: string;
  Deadline_DateTime: string;
  Deadline_DateTime_End: string;
  Delegate_User_uniqueId: string | null;
  Deleted: boolean;
  DurationInSeconds: number | null;
  HomeMember_uniqueId: string | null;
  HomeMembers?: string[];
  ImportCalendarId: string | null;
  ImportEventId: string | null;
  Priority: number;
  Reminder_Each_X_Week_01?: number;
  Reminder_Each_X_Days: number;
  Reminder_Each_X_Months: number;
  Reminder_Each_X_Weeks: number;
  BlackListed_Family: string[];
  Scheduled_Time: string;
  Scheduled_Time_End: string;
  Text: string;
  Title: string;
  UniqueId: string;
  UpdateTimestamp: string;
  User_uniqueId: string;
  type: string;
  EventTimeId?: string;
  completed?: boolean;
  // All-day indicator from API (preferred) or legacy
  isAllDay?: boolean;
  IsAllDay?: boolean;
}

// Document and File Interfaces
export interface IFile {
  id: string;
  accountId: string;
  userId: string;
  filename: string;
  storageProviderId: string;
  fileUrl?: string;
  active: boolean;
  deleted: boolean;
  creationTimestamp: string;
  updateTimestamp: string;
  blacklistedFamily?: string[];
  // React Native compatibility fields
  UniqueId?: string;
  Account_uniqueId?: string;
  User_uniqueId?: string;
  Filename?: string;
  StorageProviderUniqueId?: string;
  FileURL?: string;
  Active?: boolean;
  Deleted?: boolean;
  CreationTimestamp?: string;
  UpdateTimestamp?: string;
  BlackListed_Family?: string[];
  // Hive association fields
  HomeMember_uniqueId?: string;
  Tile_uniqueId?: string;
}

export interface IDocument extends IFile {
  type: "Document";
  mimeType?: string;
  fileSize?: number;
  // For document viewer
  UniqueIdForFile?: string;
  HomeMember_UniqueId?: string;
  FileName?: string;
  url?: string;
}

export interface IFileUpload {
  file: File;
  filename: string;
  accountId: string;
  userId: string;
  hiveId?: string;
  blacklistedFamily?: string[];
}

export interface IDocumentUploadRequest {
  accountId: string;
  userId: string;
  filename: string;
  file: File;
  description?: string;
  hiveId?: string;
  blacklistedFamily?: string[];
}

export interface IDocumentViewerParams {
  UniqueIdForFile: string;
  HomeMember_UniqueId?: string;
  FileName: string;
  url: string;
}

// File type mapping for icons
export type FileType = 'pdf' | 'doc' | 'docx' | 'image' | 'video' | 'audio' | 'other';

export interface IFileTypeInfo {
  type: FileType;
  icon: string;
  color: string;
  extensions: string[];
}
