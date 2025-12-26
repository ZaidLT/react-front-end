import React from "react";
import Icon from "./Icon";
import { Colors } from "../styles";

interface IDynamicNotificationBellProps {
  isAlert: boolean;
  size?: number;
  color?: string;
}

/**
 * DynamicNotificationBell - A component that displays either a regular notification bell
 * or an alert notification bell based on the isAlert prop
 * 
 * @param isAlert - Whether to show the alert version of the notification bell
 * @param size - The size of the bell icon (default: 24)
 * @param color - The color of the bell icon (default: Colors.BLUE)
 */
const DynamicNotificationBell: React.FC<IDynamicNotificationBellProps> = ({
  isAlert,
  size = 24,
  color = Colors.BLUE
}) => {
  // Use the appropriate icon name based on the isAlert prop
  const iconName = isAlert ? "notification-bell-notice" : "notification-bell";
  
  return (
    <Icon 
      name={iconName} 
      width={size} 
      height={size} 
      color={color} 
    />
  );
};

export default DynamicNotificationBell;
