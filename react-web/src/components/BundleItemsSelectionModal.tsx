import React from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import HorizontalLine from "./HorizontalLine";
import CustomText from "./CustomText";
import Modal from "./Modal";
import { useLanguageContext } from "../context/LanguageContext";
import Icon from "./Icon";
import ItemSelectionBox from "./ItemSelectionBox";

interface IItem {
  Name: string;
  icon: string;
}

interface IBundleItemsSelectionModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  handleBackPress?: () => void;
  tiles: IItem[];
  hideBackButton?: boolean;
  selectedItems: IItem[];
  setSelectedItems: (items: IItem[]) => void;
}

/**
 * BundleItemsSelectionModal - A modal for selecting items to bundle together
 *
 * This component displays a modal with a list of items that can be selected to create a bundle.
 * It allows the user to select multiple items and confirm the selection.
 *
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed
 * @param handleBackPress - Callback function when the back button is pressed
 * @param tiles - Array of available items to select from
 * @param hideBackButton - Whether to hide the back button
 * @param selectedItems - Array of currently selected items
 * @param setSelectedItems - Function to update the selected items
 */
const BundleItemsSelectionModal: React.FC<IBundleItemsSelectionModalProps> = ({
  isVisible,
  onRequestClose,
  tiles,
  handleBackPress,
  hideBackButton = false,
  selectedItems,
  setSelectedItems,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { i18n } = useLanguageContext();

  // Check if an item is selected
  const isItemSelected = (tile: IItem): boolean => {
    return selectedItems.some((item) => item?.Name === tile?.Name);
  };

  // Remove an object from an array
  const removeObjectFromArray = <T extends unknown>(array: T[], object: T | undefined): T[] => {
    if (!object) return array;
    return array.filter(item => item !== object);
  };



  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      contentStyle={{
        width: "90%",
        maxWidth: "500px",
        borderRadius: "18px",
        padding: "0",
        maxHeight: "80vh",
        overflow: "hidden",
      }}
    >
      <div style={styles.mainContainer}>
        <div style={{ alignSelf: "center", marginTop: "20px" }}>
          <Icon name="indicator" width={40} height={4} />
        </div>

        <div style={styles.header}>
          {!hideBackButton && (
            <div
              onClick={() => {
                handleBackPress ? handleBackPress() : onRequestClose();
              }}
              style={{ cursor: "pointer" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 19L5 12L12 5" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <CustomText style={styles.headerText}>
            Bundle Products
          </CustomText>
        </div>

        <div style={styles.horizontalLine}>
          <HorizontalLine color={Colors.BLACK} />
        </div>

        <div>
          <CustomText style={styles.descriptionText}>
            Select all products that apply in the bundle
          </CustomText>
        </div>

        <div style={styles.flatListStyle}>
          {tiles
            .filter((tile) => tile.Name !== "Bundle")
            .map((item, index) => (
              <div
                key={`row-${index}`}
                style={styles.itemContainer}
                onClick={() => {
                  const isSelected = isItemSelected(item);
                  const selectedItem = selectedItems.find(
                    (selectedItem) => selectedItem?.Name === item.Name
                  );

                  if (isSelected) {
                    setSelectedItems(
                      removeObjectFromArray(selectedItems, selectedItem)
                    );
                  } else {
                    setSelectedItems([...selectedItems, item]);
                  }
                }}
              >
                <div style={styles.cellView}>
                  <ItemSelectionBox isSelected={isItemSelected(item)} />
                  <div style={styles.itemNameIconView}>
                    <Icon name="home" width={24} height={24} />
                    <CustomText style={styles.itemNameText}>
                      {item?.Name}
                    </CustomText>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div style={styles.buttonContainer}>
          <Button
            disabled={selectedItems.length === 0}
            width="90%"
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: "Next",
            }}
            onButtonClick={onRequestClose}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              radius: 10,
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  overlayContainer: {
    width: "100%",
    height: "100%",
  },
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    backgroundColor: Colors.WHITE,
    borderRadius: "18px",
  },
  indicator: {
    alignSelf: "center",
    marginTop: "5%",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: "25px 5%",
  },
  headerText: {
    flex: 1,
    color: Colors.BLUE,
    textAlign: "center",
    fontSize: Typography.FONT_SIZE_28,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    fontWeight: Typography.FONT_WEIGHT_BOLD,
    marginRight: "5%",
  },
  horizontalLine: {
    opacity: 0.1,
    width: "100%",
    marginBottom: "8px",
  },
  descriptionText: {
    color: Colors.GREY_COLOR,
    textAlign: "center",
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    padding: "0 20px",
  },
  flatListStyle: {
    margin: "20px 0",
    maxHeight: "400px",
    overflowY: "auto",
  },
  itemContainer: {
    display: "flex",
    flexDirection: "row",
    padding: "0 2%",
    cursor: "pointer",
  },
  itemNameIconView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
    margin: "12.5px 0",
    flex: 1,
  },
  itemNameText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
  cellView: {
    display: "flex",
    flexDirection: "row",
    margin: "5px 0",
    alignItems: "center",
    flex: 1,
    gap: "10px",
    marginLeft: "20px",
  },
  buttonContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  buttonsContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  descText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
    textAlign: "center",
    paddingBottom: "16px",
  },
};

export default BundleItemsSelectionModal;
