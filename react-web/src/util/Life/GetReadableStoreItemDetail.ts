import { useContactStore, useEventStore, useFamilyStore, useNoteStore, useTaskStore } from "../../context/store";

const getReadableStoreItemDetail = (
  activityType: string,
  activityId: string
) => {
  const tasks = useTaskStore.getState().tasks;
  const notes = useNoteStore.getState().notes;
  const events = useEventStore.getState().events;
  const family = useFamilyStore.getState().family;
  const contacts = useContactStore.getState().contacts;
  
  if (activityType.toLowerCase() === "task") {
    return (
      tasks.find((task) => task.UniqueId === activityId)?.Title || activityType
    );
  }
  if (activityType.toLowerCase() === "note") {
    return (
      notes.find((note) => note.UniqueId === activityId)?.Title || activityType
    );
  }
  if (activityType.toLowerCase() === "event") {
    return (
      events.find((event) => event.UniqueId === activityId)?.Title ||
      activityType
    );
  }
  if (activityType.toLowerCase() === "user") {
    return (
      family.find((member) => member.UniqueId === activityId)?.FirstName ||
      activityType
    );
  }
  if (activityType.toLowerCase() === "contact") {
    return (
      contacts.find((contact) => contact.UniqueId === activityId)?.FirstName ||
      contacts.find((contact) => contact.UniqueId === activityId)?.LastName
    );
  }
  return activityType;
};

export default getReadableStoreItemDetail;
