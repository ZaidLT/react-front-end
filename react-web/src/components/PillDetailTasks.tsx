import React, { useMemo, useState } from "react";
import { Colors, Typography } from "../styles";
import { useRouter } from "next/navigation";
import {
  useEventUsersStore,
  useFamilyStore,
  useTaskStore
} from "../context/store";
import { INestedTile } from "../util/types";
import { ITTask } from "../services/types";
import { MONTH_NAMES, suffixifyNumber } from "../util/calendar";
import { findEventUsersByEventId, findFamilyByIds } from "../util/constants";
// Utility functions
import moment from "moment";
import Button from "./Button";
import HouseHiveBlankState from "./HouseHiveBlankState";
import ListViewCard from "./ListViewCard";
import CustomText from "./CustomText";

interface PillDetailsTaskProps {
  tile: INestedTile | undefined;
  memberId?: string;
  entityType?: 'contact' | 'tile' | 'user';
}

/**
 * PillDetailsTask - A component for displaying tasks related to a home member
 *
 * This component shows a list of tasks associated with a home member,
 * with options to create new tasks.
 *
 * @param tile - The tile object representing the home member
 * @param memberId - The ID of the member
 */
const PillDetailsTask: React.FC<PillDetailsTaskProps> = ({
  tile,
  memberId,
  entityType,
}) => {
  // Language context for translations
  const router = useRouter();

  const DefaultTasks = useTaskStore((state) => state.tasks);
  const tasks = useTaskStore((state) => state.tasks);
  const family = useFamilyStore((state) => state.family);
  const eventUsers = useEventUsersStore((state) => state.eventUsers);

  // Calculate time thresholds for task deadlines
  const now = useMemo(() => new Date(), []);
  const in48Hours = useMemo(() => new Date(now.getTime() + 48 * 60 * 60 * 1000), [now]);
  const [sortedTask] = useState<ITTask[]>([]);

  const filterTask = (sortedTask?.length ? sortedTask : DefaultTasks).filter(
    (task: ITTask) =>
      task.Active && tile?.UniqueId && task.HomeMembers?.includes(tile.UniqueId)
  );

  const taskData = useMemo(() => {
    return tasks?.filter((task: ITTask) => {
      const isActive = task.Active;
      const deadline = new Date(task.Deadline_DateTime ?? "");
      return (deadline <= now || deadline <= in48Hours) && isActive;
    });
  }, [tasks, now, in48Hours]);

  const userTask = useMemo(
    () =>
      taskData.filter(
        (task) =>
          task.Delegate_User_uniqueId === memberId ||
          task.User_uniqueId === memberId
      ),
    [taskData, memberId]
  );

  const displayTask = userTask.length > 0 ? userTask : filterTask;

  return (
    <div style={styles.mainContainer}>
      {displayTask.length > 0 ? (
        <>
          <div style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
            <Button
              textProps={{
                text: "Create task",
                fontSize: Typography.FONT_SIZE_16,
                color: Colors.BLUE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              }}
              onButtonClick={() => {
                {
                  const paramName = entityType === 'user' ? 'delegateUserId' :
                                   entityType === 'contact' ? 'contactId' : 'tileId';
                  const id = memberId || tile?.UniqueId;
                  router.push(`/create-task?${paramName}=${id}`);
                }
              }}
              backgroundColor={Colors.WHITE_LILAC}
              borderProps={{
                width: 1,
                color: Colors.WHITE_LILAC,
                radius: 8,
              }}
            />
          </div>

          <div style={styles.taskHeader}>
            <CustomText style={styles.taskHeading}>
              All Tasks({displayTask.length})
            </CustomText>
          </div>

          <div style={styles.tasksContainer}>
            {displayTask.map((task) => {
              const date = moment(task.Deadline_DateTime);
              const deadline = new Date(task.Deadline_DateTime ?? "");
              const dateString = date.isValid()
                ? `${MONTH_NAMES[date.month()]} ${suffixifyNumber(date.date())}`
                : "";

              const matchedEventUsers = findEventUsersByEventId(
                eventUsers,
                task.UniqueId ?? ""
              );

              const eventUserIds = matchedEventUsers.map(
                (eventUser) => eventUser.User_FamilyMember_uniqueId
              );

              const matchedFamily = findFamilyByIds(family, eventUserIds);

              const avatarImagePaths = matchedFamily.map((member) => ({
                AvatarImagePath: member.AvatarImagePath,
                FirstName: member.FirstName,
                LastName: member.LastName,
                Email: member.EmailAddress,
              }));

              return (
                <ListViewCard
                  key={task.UniqueId}
                  nameNote={task.Title}
                  type={"Task"}
                  priority={task.Priority || 4}
                  avatar={avatarImagePaths}
                  date={dateString}
                  isComplete={task.Active}
                  TimeColor={
                    (deadline <= now || deadline <= in48Hours) && task.Active
                      ? "Red"
                      : "Blue"
                  }
                  time={date.format("LT")}
                  timeCreationText={"Due"}
                  description={task.Text}
                  isShowItemTile={true}
                  item={task}
                  onPress={() => {
                    // Navigate to the existing edit-task page using the task ID
                    if (task.UniqueId) {
                      const currentPath = window.location.pathname + window.location.search;
                      navigate(`/edit-task/${task.UniqueId}?returnTo=${encodeURIComponent(currentPath)}`);
                    } else {
                      console.warn('Task missing UniqueId:', task);
                    }
                  }}
                />
              );
            })}
          </div>
        </>
      ) : (
        <HouseHiveBlankState
          heading="You haven't created any tasks yet"
          subHeading="click the button to create"
          buttonText={"Create Task"}
          onButtonPress={() => {
            const paramName = entityType === 'user' ? 'delegateUserId' :
                             entityType === 'contact' ? 'contactId' : 'tileId';
            const id = memberId || tile?.UniqueId;
            router.push(`/create-task?${paramName}=${id}`);
          }}
        />
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  mainContainer: {
    marginTop: "20px",
    paddingBottom: "20%",
    marginBottom: "20px",
    paddingLeft: "10px",
    paddingRight: "10px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
  },
  taskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexDirection: "row",
    padding: "10px",
  },
  taskHeading: {
    color: Colors.BLUE,
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
  },
  tasksContainer: {
    marginBottom: "5%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};

export default PillDetailsTask;
