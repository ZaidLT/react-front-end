import { IActivity, User, ITTask, INote, IEEvent, IContact } from '../services/types';

// Mock family data
export const mockFamily: User[] = [
  {
    UniqueId: '659917a4-302e-4117-8a5f-8be3b8cc945b',
    FirstName: 'Scott',
    LastName: 'Davis',
    EmailAddress: 'scott+testing@eeva.ai',
    AvatarImagePath: '',
    ActiveUser: true,
    ActiveFamilyMember: true,
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    CreationTimestamp: new Date().toISOString(),
    UpdateTimestamp: new Date().toISOString(),
    Active: true,
    Deleted: false,
    EncryptedPassword: '',
    HouseDetails_Image: '',
    HouseDetails_Data: '',
  },
  {
    UniqueId: 'family-member-2',
    FirstName: 'Jane',
    LastName: 'Davis',
    EmailAddress: 'jane@example.com',
    AvatarImagePath: '',
    ActiveUser: true,
    ActiveFamilyMember: true,
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    CreationTimestamp: new Date().toISOString(),
    UpdateTimestamp: new Date().toISOString(),
    Active: true,
    Deleted: false,
    EncryptedPassword: '',
    HouseDetails_Image: '',
    HouseDetails_Data: '',
  },
  {
    UniqueId: 'family-member-3',
    FirstName: 'Alex',
    LastName: 'Davis',
    EmailAddress: 'alex@example.com',
    AvatarImagePath: '',
    ActiveUser: true,
    ActiveFamilyMember: true,
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    CreationTimestamp: new Date().toISOString(),
    UpdateTimestamp: new Date().toISOString(),
    Active: true,
    Deleted: false,
    EncryptedPassword: '',
    HouseDetails_Image: '',
    HouseDetails_Data: '',
  }
];

// Mock tasks
export const mockTasks: ITTask[] = [
  {
    UniqueId: 'task-1',
    Title: 'Buy groceries',
    Text: 'Get milk, bread, and eggs from the store',
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    User_uniqueId: '659917a4-302e-4117-8a5f-8be3b8cc945b',
    CreationTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    UpdateTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    Active: true,
    Deleted: false,
    Priority: 2,
    Deadline_DateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    Scheduled_Time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    Scheduled_Time_End: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    RecurringFreq: 0,
  },
  {
    UniqueId: 'task-2',
    Title: 'Schedule dentist appointment',
    Text: 'Call Dr. Smith to schedule annual checkup',
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    User_uniqueId: 'family-member-2',
    CreationTimestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    UpdateTimestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    Active: true,
    Deleted: false,
    Priority: 3,
    Deadline_DateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    Scheduled_Time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    Scheduled_Time_End: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    RecurringFreq: 0,
  }
];

// Mock notes
export const mockNotes: INote[] = [
  {
    UniqueId: 'note-1',
    Title: 'Meeting notes',
    Text: 'Discussed project timeline and deliverables',
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    User_uniqueId: '659917a4-302e-4117-8a5f-8be3b8cc945b',
    CreationTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    UpdateTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    Active: true,
    Deleted: false,
    Priority: 4,
    Scheduled_Time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    Scheduled_Time_End: new Date(Date.now() - 1 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
  }
];

// Mock events
export const mockEvents: IEEvent[] = [
  {
    UniqueId: 'event-1',
    Title: 'Family dinner',
    title: 'Family dinner',
    Text: 'Weekly family dinner at grandmas house',
    text: 'Weekly family dinner at grandmas house',
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    User_uniqueId: 'family-member-3',
    CreationTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    UpdateTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    Active: true,
    Deleted: false,
    Priority: 3,
    Deadline_DateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // In 3 days
    deadlineDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    Scheduled_Time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    Scheduled_Time_End: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    scheduledTimeEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
  }
];

// Mock activities
export const mockActivities: IActivity[] = [
  {
    UniqueId: 'activity-1',
    User_uniqueId: '659917a4-302e-4117-8a5f-8be3b8cc945b',
    CreationTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    UpdateTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    Active: true,
    Deleted: false,
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    ActivityType: 1, // Task
    Action: 0, // Create
    Activity_uniqueId: 'task-1',
    AssociatedUser_uniqueId: '659917a4-302e-4117-8a5f-8be3b8cc945b',
  },
  {
    UniqueId: 'activity-2',
    User_uniqueId: 'family-member-2',
    CreationTimestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    UpdateTimestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    Active: true,
    Deleted: false,
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    ActivityType: 1, // Task
    Action: 0, // Create
    Activity_uniqueId: 'task-2',
    AssociatedUser_uniqueId: 'family-member-2',
  },
  {
    UniqueId: 'activity-3',
    User_uniqueId: '659917a4-302e-4117-8a5f-8be3b8cc945b',
    CreationTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    UpdateTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    Active: true,
    Deleted: false,
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    ActivityType: 2, // Note
    Action: 0, // Create
    Activity_uniqueId: 'note-1',
    AssociatedUser_uniqueId: '659917a4-302e-4117-8a5f-8be3b8cc945b',
  },
  {
    UniqueId: 'activity-4',
    User_uniqueId: 'family-member-3',
    CreationTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    UpdateTimestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    Active: true,
    Deleted: false,
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    ActivityType: 0, // Event
    Action: 0, // Create
    Activity_uniqueId: 'event-1',
    AssociatedUser_uniqueId: 'family-member-3',
  },
  {
    UniqueId: 'activity-5',
    User_uniqueId: 'family-member-2',
    CreationTimestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    UpdateTimestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    Active: true,
    Deleted: false,
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    ActivityType: 1, // Task
    Action: 1, // Update
    Activity_uniqueId: 'task-2',
    AssociatedUser_uniqueId: 'family-member-2',
  }
];

// Mock contacts
export const mockContacts: IContact[] = [
  {
    UniqueId: 'contact-1',
    FirstName: 'Dr. John',
    LastName: 'Smith',
    EmailAddress: 'dr.smith@dental.com',
    Cell_Phone_Number: '555-0123',
    Account_uniqueId: '7fb26c7d-7ee3-4b9b-8507-c60470ea5b31',
    User_uniqueId: '659917a4-302e-4117-8a5f-8be3b8cc945b',
    CreationTimestamp: new Date().toISOString(),
    UpdateTimestamp: new Date().toISOString(),
    Active: true,
    Deleted: false,
  }
];
