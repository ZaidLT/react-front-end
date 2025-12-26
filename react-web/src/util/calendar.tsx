import moment, { Moment } from "moment";
// Note: For full timezone support, install moment-timezone: npm install moment-timezone
// import moment from "moment-timezone";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IEEvent, ITTask } from "../services/types";
import { Colors } from "styles";

export const MONTH_NAMES: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const suffixifyNumber = (num: number): string => {
  if (num <= 0) {
    return num.toString(); // Return as it is for negative numbers or zero
  }

  // Handle special cases for numbers ending in 11, 12, and 13
  if (num % 100 === 11 || num % 100 === 12 || num % 100 === 13) {
    return num.toString() + "th";
  }

  // Determine the suffix based on the last digit of the number
  switch (num % 10) {
    case 1:
      return num.toString() + "st";
    case 2:
      return num.toString() + "nd";
    case 3:
      return num.toString() + "rd";
    default:
      return num.toString() + "th";
  }
};

export const monthNameFromISOString = (currentDate: string) => {
  const dateObject = moment(currentDate);
  const monthIndex = dateObject.month();
  return MONTH_NAMES[monthIndex];
};

export const FORMAT_24_H = false;

export const convertTimeToProperFormat = (time: string): string => {
  const parsedTime = new Date(time);

  // Extract hours and minutes
  let hours: number = parsedTime.getHours();
  let minutes: number | string = parsedTime.getMinutes();

  // Determine AM or PM
  const period = hours >= 12 ? "PM" : "AM";

  if (!FORMAT_24_H) {
    hours = hours % 12 || 12;
  }

  minutes = minutes < 10 ? "0" + minutes : minutes;
  const formattedTime = `${hours}:${minutes} ${period}`;
  return formattedTime;
};

export const convertDateToProperFormat = (dateTime: string): string => {
  const date = new Date(dateTime);

  // Extract year, month, and day
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Month is zero-based, so we add 1
  const day = date.getDate();

  // Format the date as MM-DD-YYYY
  const formattedDate = `${month < 10 ? "0" + month : month}-${
    day < 10 ? "0" + day : day
  }-${year}`;

  return formattedDate;
};

export const formateDOB = (date: string): string => {
  return date.replace(/T.*$/, "");
};

export const formatDateToWeekdayMonthDay = (dateString: string): string => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

export const roundTimeToNextHour = (date: Moment): Moment => {
  // Set the date to the top of the next hour
  date.add(1, "hour").startOf("hour");
  return date;
};

export const roundTimeToNextInterval = (
  time: moment.Moment,
  interval: number = 5
) => {
  const remainder = interval - (time.minute() % interval);
  return remainder === interval ? time : time.add(remainder, "minutes");
};

export const addMinutesToDateTime = (
  dateTime: string,
  minutes: number
): string => {
  const date = new Date(dateTime);

  date.setMinutes(date.getMinutes() + minutes);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutesStr = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutesStr}:${seconds}`;
};

export const filterNonAllDayEvents = (events: any, selectedDay: string) => {
  return (
    events[selectedDay]?.filter((event: any) => {
      // Get the start and end times of the event
      const eventStart = moment(event.start);
      const eventEnd = moment(event.end);

      // Check if the event is NOT an all-day event
      return !(
        eventStart.isSame(moment(selectedDay).startOf("day")) &&
        eventEnd.isSame(moment(selectedDay).endOf("day"))
      );
    }) || []
  );
};

export type TCalendarEvents = {
  [key: string]: {
    id: string;
    start: string;
    end: string;
    title: string;
    summary: string;
    deadlineDateTime: string;
    type?: string;
    color?: string;
    colorMark?: string;
    isAllDay?: boolean;
    originalDetails?: any;
  }[];
};

export const MARKED_DOTS_PROPERTIES = {
  vacation: { key: "vacation", color: "red" },
  massage: { key: "massage", color: "blue" },
  workout: { key: "workout", color: "green" },
  appointment: { key: "appointment", color: "#73C2E4" },
  class: { key: "class", color: "#C3B7FF" },
  sports: { key: "sports", color: "#FF9548" },
  task: { key: "task", color: "#73C2E4" },
  event: { key: "event", color: "#C3B7FF" },
};

export const CALENDAR_VIEW = {
  calendar: "calendar", // Monthly view
  time: "time",        // Weekly view
};

export const AGENDA_PAST_FUTURE_SCROLL_RANGE: number = 10;

// Calendar theme for React Web
export const CALENDAR_THEME = {
  // Month text styling
  textMonthFontSize: 16,
  textMonthFontFamily: 'Poppins, sans-serif',
  textMonthFontWeight: 'bold',
  monthTextColor: '#000E50',

  // Day text styling
  textDayFontSize: 20,
  textDayFontFamily: 'ABeeZee, sans-serif',
  dayTextColor: '#000E50',

  // Day header styling
  textDayHeaderFontSize: 13,
  textDayHeaderFontFamily: 'ABeeZee, sans-serif',
  textSectionTitleColor: '#9CA3AF',

  // Background colors
  backgroundColor: '#FFFFFF',
  calendarBackground: '#FFFFFF',

  // Selection styling
  selectedDayBackgroundColor: '#000E50',
  selectedDayTextColor: '#FFFFFF',

  // Today styling
  todayTextColor: '#000E50',

  // Disabled styling
  textDisabledColor: '#9CA3AF',

  // Arrow styling
  arrowColor: '#000E50',

  // Dot styling
  dotColor: '#17FCDB',
  selectedDotColor: '#FFFFFF',
};

// Custom selected style for calendar days
export const CUSTOM_SELECTED_STYLE = {
  container: {
    borderRadius: '10px',
    backgroundColor: '#000E50',
    height: '40px',
    width: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    textAlign: 'center' as const,
    fontSize: '20px',
    fontFamily: 'ABeeZee, sans-serif',
  },
  dots: {
    color: 'red',
  },
};

// Timeline properties for React Web
export const TIMELINE_PROPS = {
  format24h: FORMAT_24_H,
  overlapEventsSpacing: 2,
  rightEdgeSpacing: 0,
  theme: CALENDAR_THEME,
  showNowIndicator: true,
};

// Calendar event mapping and utility functions
export const mapCalendarEvents = (
  events: any[],
  tasks: any[],
  calendarColorMap?: Map<string, string>
) => {
  const calendarEvents: TCalendarEvents = {};

  // Map events
  events.forEach((event) => {
    // Handle both old and new API field names
    const deadlineDateTime = event.Deadline_DateTime || event.deadlineDateTime;
    const deadlineDateTimeEnd = event.Deadline_DateTime_End || event.deadlineDateTimeEnd;
    const scheduledStart: string | undefined = event.scheduledTime || event.Scheduled_Time || undefined;
    const scheduledEnd: string | undefined = event.scheduledTimeEnd || event.Scheduled_Time_End || undefined;

    if (deadlineDateTime) {
      // Use deadlineDateTime for the date key (convert UTC to local for date extraction)
      const startLocal = moment.utc(deadlineDateTime).local();
      const dateKey = startLocal.format('YYYY-MM-DD');
      if (!calendarEvents[dateKey]) {
        calendarEvents[dateKey] = [];
      }

      // Prefer explicit API boolean when available; fallback to boundary heuristic using scheduledTime
      const apiIsAllDay = (event as any).isAllDay ?? (event as any).IsAllDay;
      const isAllDayEvent = (typeof apiIsAllDay === 'boolean' ? apiIsAllDay : (scheduledStart === '00:00' && scheduledEnd === '23:59')) === true;

      // Build start/end using actual times from deadlineDateTime (UTC converted to local)
      // This ensures consistent timezone handling across all displays
      let startDateTime: string;
      let endDateTime: string;

      if (isAllDayEvent) {
        // For all-day events, use the date with 00:00 and 23:59
        const startDate = startLocal.format('YYYY-MM-DD');
        const endDate = deadlineDateTimeEnd
          ? moment.utc(deadlineDateTimeEnd).local().format('YYYY-MM-DD')
          : startDate;
        startDateTime = `${startDate}T00:00:00`;
        endDateTime = `${endDate}T23:59:00`;
      } else {
        // For timed events, use the actual UTC times converted to local
        startDateTime = startLocal.format('YYYY-MM-DDTHH:mm:ss');

        if (deadlineDateTimeEnd) {
          const endLocal = moment.utc(deadlineDateTimeEnd).local();
          endDateTime = endLocal.format('YYYY-MM-DDTHH:mm:ss');
        } else {
          // Fallback: add 1 hour to start time if no end time provided
          endDateTime = startLocal.clone().add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss');
        }
      }



      // Determine event color: calendar color > event's own color > default
      const calendarColor = event.importCalendarId
        ? calendarColorMap?.get(event.importCalendarId)
        : undefined;
      const finalColor = calendarColor || Colors.PRIMARY_ELECTRIC_BLUE;

      calendarEvents[dateKey].push({
        id: event.UniqueId || event.id,
        start: startDateTime,
        end: endDateTime,
        title: event.Title || event.title,
        summary: event.Text || event.text || '',
        deadlineDateTime: deadlineDateTime,
        type: 'event',
        color: finalColor,
        colorMark: finalColor,
        isAllDay: isAllDayEvent,
        originalDetails: event,
      });
    }
  });

  // Map tasks - use deadlineDateTime to determine the calendar date
  tasks.forEach((task) => {
    // Handle both old and new API field names
    const deadlineDateTime = task.deadlineDateTime || task.Deadline_DateTime;
    const deadlineDateTimeEnd = task.deadlineDateTimeEnd || task.Deadline_DateTime_End;
    if (deadlineDateTime) {
      // Use deadlineDateTime for the date key (convert UTC to local for date extraction)
      const startLocal = moment.utc(deadlineDateTime).local();
      const dateKey = startLocal.format('YYYY-MM-DD');
      if (!calendarEvents[dateKey]) {
        calendarEvents[dateKey] = [];
      }

      // Build start and end times from deadlineDateTime fields with scheduledTime as fallback
      // Prefer API boolean isAllDay when present; fallback to 00:00/23:59 heuristic
      const scheduledStart: string | undefined = task.scheduledTime || task.Scheduled_Time || undefined;
      const scheduledEnd: string | undefined = task.scheduledTimeEnd || task.Scheduled_Time_End || undefined;
      const apiIsAllDayTask = (task as any).isAllDay ?? (task as any).IsAllDay;
      const isAllDayTask = (typeof apiIsAllDayTask === 'boolean' ? apiIsAllDayTask : (scheduledStart === '00:00' && scheduledEnd === '23:59')) === true;

      // Build start/end using actual times from deadlineDateTime (UTC converted to local)
      // Fall back to scheduledTime if deadlineDateTime doesn't contain time info
      let startDateTime: string;
      let endDateTime: string;

      if (isAllDayTask) {
        // For all-day tasks, use the date with 00:00 and 23:59
        const startDate = startLocal.format('YYYY-MM-DD');
        const endDate = deadlineDateTimeEnd
          ? moment.utc(deadlineDateTimeEnd).local().format('YYYY-MM-DD')
          : startDate;
        startDateTime = `${startDate}T00:00:00`;
        endDateTime = `${endDate}T23:59:00`;
      } else {
        // For timed tasks, prefer deadlineDateTime time, fallback to scheduledTime
        const hasTimeInDeadline = startLocal.format('HH:mm') !== '00:00';

        if (hasTimeInDeadline) {
          // Use actual time from deadlineDateTime
          startDateTime = startLocal.format('YYYY-MM-DDTHH:mm:ss');

          if (deadlineDateTimeEnd) {
            const endLocal = moment.utc(deadlineDateTimeEnd).local();
            endDateTime = endLocal.format('YYYY-MM-DDTHH:mm:ss');
          } else {
            // Add 1 hour to start time if no end time provided
            endDateTime = startLocal.clone().add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss');
          }
        } else {
          // Fallback to scheduledTime approach for tasks without time in deadlineDateTime
          const taskDate = startLocal.format('YYYY-MM-DD');
          const startTime = scheduledStart || '09:00';
          const endTime = scheduledEnd || moment(startTime, 'HH:mm').add(1, 'hour').format('HH:mm');
          startDateTime = `${taskDate}T${startTime}:00`;
          endDateTime = `${taskDate}T${endTime}:00`;
        }
      }

      // Determine task color: calendar color > task's own color > default
      const taskColor = task.color || task.Color;
      const taskCalendarColor = task.importCalendarId
        ? calendarColorMap?.get(task.importCalendarId)
        : undefined;
      const finalTaskColor = taskCalendarColor || taskColor || '#73C2E4';

      const taskEvent = {
        id: task.id || task.UniqueId,
        UniqueId: task.id || task.UniqueId, // Ensure both id and UniqueId are available
        start: startDateTime,
        end: endDateTime,
        title: task.title || task.Title,
        summary: task.text || task.Text || '',
        deadlineDateTime: deadlineDateTime,
        type: 'task',
        color: finalTaskColor,
        colorMark: finalTaskColor,
        Active: task.active !== undefined ? task.active : task.Active, // Handle both field names
        completed: task.completed !== undefined ? task.completed : task.Completed, // Use lowercase 'completed'
        isAllDay: isAllDayTask,
        originalDetails: task,
      };

      calendarEvents[dateKey].push(taskEvent);
    }
  });

  return calendarEvents;
};

// Map marked dates for calendar
export const mapMarkedDates = (events: TCalendarEvents) => {
  const markedDates: any = {};

  Object.keys(events).forEach((dateKey) => {
    const dayEvents = events[dateKey];

    // For the web Calendar component, we need a simpler format
    // Use the first event's color as the dot color
    const firstEventColor = dayEvents[0]?.colorMark ||
      MARKED_DOTS_PROPERTIES[dayEvents[0]?.type as keyof typeof MARKED_DOTS_PROPERTIES]?.color ||
      '#73C2E4';

    markedDates[dateKey] = {
      marked: true,
      dotColor: firstEventColor,
    };
  });

  return markedDates;
};

// Fill empty dates for agenda view
export const fillEmptyDatesForAgenda = (events: TCalendarEvents, startDate: string, endDate: string) => {
  const filledEvents: any = {};
  const start = moment(startDate);
  const end = moment(endDate);

  while (start.isSameOrBefore(end)) {
    const dateKey = start.format('YYYY-MM-DD');
    filledEvents[dateKey] = events[dateKey] || [];
    start.add(1, 'day');
  }

  return filledEvents;
};

// Time zone utilities
export const getUserTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const convertToUserTimeZone = (dateTime: string, fromTimeZone?: string): moment.Moment => {
  // For now, using basic moment without timezone conversion
  // TODO: Implement proper timezone conversion with moment-timezone
  return moment(dateTime);
};

export const convertFromUserTimeZone = (dateTime: string, toTimeZone: string): moment.Moment => {
  // For now, using basic moment without timezone conversion
  // TODO: Implement proper timezone conversion with moment-timezone
  return moment(dateTime);
};

export const formatTimeWithTimeZone = (dateTime: string, format: string = 'YYYY-MM-DD HH:mm', timeZone?: string): string => {
  // For now, using basic moment formatting
  // TODO: Implement proper timezone formatting with moment-timezone
  return moment(dateTime).format(format);
};

export const isToday = (dateString: string, timeZone?: string): boolean => {
  const today = moment().format('YYYY-MM-DD');
  const checkDate = moment(dateString).format('YYYY-MM-DD');
  return today === checkDate;
};

export const getCurrentTimeInTimeZone = (timeZone?: string): moment.Moment => {
  // For now, returning current time in local timezone
  // TODO: Implement proper timezone handling with moment-timezone
  return moment();
};

// Enhanced time conversion with timezone support
export const convertTimeToProperFormatWithTimeZone = (time: string, timeZone?: string): string => {
  const parsedTime = moment(time);

  // Extract hours and minutes
  let hours: number = parsedTime.hours();
  let minutes: number | string = parsedTime.minutes();

  // Determine AM or PM
  const period = hours >= 12 ? "PM" : "AM";

  if (!FORMAT_24_H) {
    hours = hours % 12 || 12;
  }

  minutes = minutes < 10 ? "0" + minutes : minutes;
  const formattedTime = `${hours}:${minutes} ${period}`;
  return formattedTime;
};
