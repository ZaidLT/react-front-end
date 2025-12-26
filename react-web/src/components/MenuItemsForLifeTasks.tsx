import React from "react";
import { Colors, Typography } from "../styles";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";
import Icon from "./Icon";

/**
 * MenuItemsForLifeTasks - A component for displaying menu items for life tasks
 *
 * This component displays a list of menu items for life tasks with icons and text.
 */
interface MenuItemsForLifeTasksProps {
  onItemPress: (item: string) => void;
}

const MenuItemsForLifeTasks: React.FC<MenuItemsForLifeTasksProps> = ({
  onItemPress,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { i18n } = useLanguageContext();

  // Menu items data
  const menuItems = [
    {
      id: "today",
      icon: "calendar-today",
      title: "Today",
    },
    {
      id: "upcoming",
      icon: "calendar-upcoming",
      title: "Upcoming",
    },
    {
      id: "completed",
      icon: "checkmark-circle",
      title: "Completed",
    },
    {
      id: "all",
      icon: "list-all",
      title: "All",
    },
  ];

  return (
    <div style={styles.container}>
      {menuItems.map((item) => (
        <div
          key={item.id}
          style={styles.menuItem}
          onClick={() => onItemPress(item.id)}
        >
          <div style={styles.iconContainer}>
            <Icon name={item.icon} width={24} height={24} color={Colors.BLUE} />
          </div>

          <CustomText style={styles.menuItemText}>
            {item.title}
          </CustomText>
        </div>
      ))}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: Colors.WHITE,
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
  },
  menuItem: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "16px",
    borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
    cursor: "pointer",
  },
  iconContainer: {
    marginRight: "16px",
  },
  menuItemText: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.BLUE,
  },
};

export default MenuItemsForLifeTasks;
