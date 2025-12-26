import {
  ITTask,
  IEEvent,
  IBaseItem,
} from "./types";

// Function to map ITTask to IBaseItem
export const mapTaskToBaseItem = (task: ITTask): IBaseItem => ({
  Account_uniqueId: task.Account_uniqueId,
  Active: task.Active ?? true,
  Color: task.Color ?? null,
  AvatarImagePath: null, // Provide default value if necessary
  contactId: (task as any).contactId ?? null,
  CreationTimestamp: task.CreationTimestamp ?? "",
  Deadline_DateTime: task.Deadline_DateTime ?? "",
  Deadline_DateTime_End: task.Deadline_DateTime_End ?? "",
  Delegate_User_uniqueId: task.Delegate_User_uniqueId ?? null,
  Deleted: task.Deleted ?? false,
  DurationInSeconds: null, // Provide default value if necessary
  HomeMember_uniqueId: task.HomeMember_uniqueId ?? null,
  HomeMembers: task.HomeMembers ?? [],
  ImportCalendarId: null, // Provide default value if necessary
  ImportEventId: null, // Provide default value if necessary
  Priority: task.Priority ?? 0,
  Reminder_Each_X_Days: task.Reminder_Each_X_Days ?? 0,
  Reminder_Each_X_Months: task.Reminder_Each_X_Months ?? 0,
  Reminder_Each_X_Weeks: task.Reminder_Each_X_Weeks ?? 0,
  Scheduled_Time: task.Scheduled_Time,
  Scheduled_Time_End: task.Scheduled_Time_End,
  BlackListed_Family: task?.BlackListed_Family ?? [],
  Text: task.Text,
  Title: task.Title,
  UniqueId: task.UniqueId ?? "",
  UpdateTimestamp: task.UpdateTimestamp ?? "",
  User_uniqueId: task.User_uniqueId,
  type: "Task",
  EventTimeId: task.EventTime_UniqueId,
  completed: task.completed ?? false, // Map the completed field
  // All-day flags
  isAllDay: (task as any).isAllDay,
  IsAllDay: (task as any).IsAllDay,
});

// Function to map IEEvent to IBaseItem
export const mapEventToBaseItem = (event: IEEvent): IBaseItem => ({
  Account_uniqueId: event.Account_uniqueId || '',
  Active: event.Active ?? true,
  Color: event.Color ?? null,
  AvatarImagePath: null, // Provide default value if necessary
  contactId: null, // Events don't have contactId
  CreationTimestamp: event.CreationTimestamp ?? "",
  Deadline_DateTime: event.Deadline_DateTime ?? "",
  Deadline_DateTime_End: event.Deadline_DateTime_End ?? "",
  Delegate_User_uniqueId: null, // Events don't have Delegate_User_uniqueId
  Deleted: event.Deleted ?? false,
  DurationInSeconds: null, // Provide default value if necessary
  HomeMember_uniqueId: null, // Events don't have HomeMember_uniqueId
  HomeMembers: event.HomeMembers ?? [],
  ImportCalendarId: null, // Provide default value if necessary
  ImportEventId: null, // Provide default value if necessary
  Priority: event.Priority ?? 0,
  Reminder_Each_X_Days: event.reminderEachXDays ?? 0,
  Reminder_Each_X_Months: event.reminderEachXMonths ?? 0,
  Reminder_Each_X_Weeks: event.reminderEachXWeeks ?? 0,
  Scheduled_Time: event.Scheduled_Time || "",
  Scheduled_Time_End: event.Scheduled_Time_End || "",
  BlackListed_Family: event?.BlackListed_Family ?? [],
  Text: event.Text ?? "",
  Title: event.Title || "",
  UniqueId: event.UniqueId ?? "",
  UpdateTimestamp: event.UpdateTimestamp ?? "",
  User_uniqueId: event.User_uniqueId || "",
  type: "Event",
  // All-day flags
  isAllDay: (event as any).isAllDay,
  IsAllDay: (event as any).IsAllDay,
});
