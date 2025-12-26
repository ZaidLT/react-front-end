import { ACTIVITY_TYPES } from "../constants";
import { IActivity } from "../../services/types";
import { useContactStore, useEventStore, useFamilyStore, useNoteStore, useTaskStore } from "../../context/store";

const onActivityCardClick = (activity: IActivity, router?: any) => {
  const activityType = ACTIVITY_TYPES[activity.ActivityType];
  const tasks = useTaskStore.getState().tasks;
  const notes = useNoteStore.getState().notes;
  const events = useEventStore.getState().events;
  const family = useFamilyStore.getState().family;
  const contacts = useContactStore.getState().contacts;

  if (activityType.toLowerCase() === "task") {
    const task = tasks.find(
      (task) => task.UniqueId === activity.Activity_uniqueId
    );
    if (task && router) {
      router.push(`/view-task/${task.UniqueId}`);
    }
    return;
  }

  if (activityType.toLowerCase() === "note") {
    const note = notes.find(
      (note) => note.UniqueId === activity.Activity_uniqueId
    );
    if (note && router) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/edit-note/${note.UniqueId}?returnTo=${encodeURIComponent(currentPath)}`);
    }
    return;
  }

  if (activityType.toLowerCase() === "event") {
    const event = events.find(
      (event) => event.UniqueId === activity.Activity_uniqueId
    );
    if (event && router) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/edit-event/${event.UniqueId}?returnTo=${encodeURIComponent(currentPath)}`);
    }
    return;
  }

  if (activityType.toLowerCase() === "user") {
    const member = family.find(
      (member) => member.UniqueId === activity.Activity_uniqueId
    );

    if (member && router) {
      // Navigate to people detail page for family member
      router.push(`/people/${member.UniqueId}`);
    }
    return;
  }

  if (activityType.toLowerCase() === "contact") {
    const contact = contacts.find(
      (contact) => contact.UniqueId === activity.Activity_uniqueId
    );
    if (contact && router) {
      // Navigate to people detail page for contact
      router.push(`/people/${contact.UniqueId}`);
    }
  }
  return;
};

export default onActivityCardClick;
