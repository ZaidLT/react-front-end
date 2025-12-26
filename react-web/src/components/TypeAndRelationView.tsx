import React from "react";
import { Colors } from "../styles";
import { IMenuItem } from "../util/types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import HorizontalLine from "./HorizontalLine";
import Icon from "./Icon";
import CustomText from "./CustomText";

interface TypeAndRelationViewProps {
  items: IMenuItem[];
  typeValue?: string;
  relationValue?: string;
}

/**
 * TypeAndRelationView - A component for displaying contact type and relation options
 *
 * This component displays a list of menu items for selecting contact types and relations.
 *
 * @param items - Array of menu items to display
 * @param typeValue - The currently selected type value
 * @param relationValue - The currently selected relation value
 */
const TypeAndRelationView: React.FC<TypeAndRelationViewProps> = ({
  items,
  typeValue,
  relationValue,
}) => {
  return (
    <div>
      {items.map((item: IMenuItem) => (
        <div
          key={item.content.name}
          style={styles.menuItem}
          onClick={item.onPress}
        >
          <div style={styles.menuItemContent}>
            {item.content.icon && (
              <div style={styles.iconContainer}>
                {typeof item.content.icon === 'string' ? (
                  <Icon name={item.content.icon} width={24} height={24} />
                ) : (
                  item.content.icon
                )}
              </div>
            )}
            <CustomText
              style={{
                ...styles.menuItemText,
                color: typeValue === item.content.name || relationValue === item.content.name
                  ? Colors.BLUE
                  : Colors.PEARL
              }}
            >
              {item.content.name}
            </CustomText>
          </div>
          <Icon name="chevron-right" width={24} height={24} color={Colors.GREY_COLOR} />
        </div>
      ))}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  horizontalLineContainer: {
    width: "100%",
    opacity: 0.1,
    alignSelf: "center",
    marginTop: "10px",
    marginBottom: "10px",
  },
  menuItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    cursor: "pointer",
  },
  menuItemContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
  },
  iconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    fontSize: "16px",
    fontFamily: "Poppins-Regular",
  },
};

export default TypeAndRelationView;
