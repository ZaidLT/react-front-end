import { init, track as amplitudeTrack, Identify, identify, setUserId as amplitudeSetUserId, setGroup as amplitudeSetGroup } from '@amplitude/analytics-browser';


// Centralized Amplitude analytics for the web app
// Safe for SSR: all functions no-op on server and when key is missing

export const AmplitudeEvents = {
  signupBegun: 'Signup: Begun',
  signupMethodSelected: 'Signup: Method Selected',
  signupCompleted: 'Signup: Completed',
  signupFailed: 'Signup: Failed',
  userLoggedIn: 'User: Logged In',
  userLoggedOut: 'User: Logged Out',
  userPasswordResetRequested: 'User: Password Reset Requested',
  userPasswordResetCompleted: 'User: Password Reset Completed',
  userAccountDeleted: 'User: Account Deleted',
  taskCreated: 'Task: Created',
  taskAssigned: 'Task: Assigned',
  taskViewed: 'Task: Viewed',
  taskCompleted: 'Task: Completed',
  taskEdited: 'Task: Edited',
  taskDeleted: 'Task: Deleted',
  noteCreated: 'Note: Created',
  noteViewed: 'Note: Viewed',
  noteEdited: 'Note: Edited',
  noteDeleted: 'Note: Deleted',
  eventCreated: 'Event: Created',
  eventViewed: 'Event: Viewed',
  eventEdited: 'Event: Edited',
  eventAssigned: 'Event: Assigned',
  eventDeleted: 'Event: Deleted',
  documentUploaded: 'Document: Uploaded',
  documentViewed: 'Document: Viewed',
  documentDeleted: 'Document: Deleted',
  hiveMemberInvited: 'Hive: Member Invited',
  hiveMemberJoined: 'Hive: Member Joined',
  hiveMemberRoleChanged: 'Hive: Member Role Changed',
  houseTileTapped: 'House: Tile Tapped',
  houseApplianceAdded: 'House: Appliance Added',
  houseSpaceAdded: 'House: Space Added',
  houseUtilityAdded: 'House: Utility Added',
  housePropertyInfoAdded: 'House: Property Info Added',
  lifeTabViewed: 'Life Tab: Viewed',
  lifeTabDrillDown: 'Life Tab: Drill Down',
  lifeTabMemberTapped: 'Life Tab: Member Tapped',
} as const;

let initialized = false;

const getApiKey = (): string | undefined => {
  // Prefer public key for client-side
  const key = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || process.env.AMPLITUDE_API_KEY;
  return key as string | undefined;
};

export const initAnalytics = () => {
  if (initialized) return;
  if (typeof window === 'undefined') return; // SSR safe
  const apiKey = getApiKey();
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Amplitude API key missing. Set NEXT_PUBLIC_AMPLITUDE_API_KEY (preferred) or expose AMPLITUDE_API_KEY via next.config.js env.');
    }
    return;
  }
  init(apiKey, undefined, {
    defaultTracking: {
      pageViews: true,
      fileDownloads: true,
      formInteractions: true,
      sessions: true,
    },
    logLevel: (process.env.NODE_ENV === 'development' ? 0 : 2) as any,
  });
  initialized = true;
};

const readIds = () => {
  if (typeof window === 'undefined') return {} as { userId?: string; accountId?: string };
  const userId = localStorage.getItem('user_id') || undefined;
  const accountId = localStorage.getItem('account_id') || undefined;
  return { userId, accountId };
};

export const setAnalyticsUser = (userId?: string, accountId?: string) => {
  if (typeof window === 'undefined') return;
  initAnalytics();
  if (!initialized) return;
  if (userId) {
    amplitudeSetUserId(userId);
  }
  // Set user properties
  const id = new Identify();
  if (userId) id.set('userId', userId);
  if (accountId) id.set('accountId', accountId);
  identify(id);
  // Set account as a group for aggregation (groupType: 'account')
  if (accountId) {
    amplitudeSetGroup('account', accountId);
  }
};

export const clearAnalyticsUser = () => {
  if (typeof window === 'undefined') return;
  initAnalytics();
  if (!initialized) return;
  // Clear user id by setting undefined
  amplitudeSetUserId(undefined as unknown as string);
};

export type EventProps = Record<string, any>;

export const trackEvent = (eventName: string, props?: EventProps) => {
  if (typeof window === 'undefined') return; // SSR safe
  initAnalytics();
  if (!initialized) return;
  const { userId, accountId } = readIds();
  amplitudeTrack(eventName, {
    userId,
    accountId,
    ...(props || {}),
  });
};

