import React, { useEffect, useMemo, useState } from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import HorizontalLine from "./HorizontalLine";
import CustomText from "./CustomText";
import Modal from "./Modal";
import { useLanguageContext } from "../context/LanguageContext";
import Icon from "./Icon";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ItemSelectionBox from "./ItemSelectionBox";

interface INestedTile {
  UniqueId: string;
  Name: string;
  Type: number;
  ParentUniqueId?: string;
  Deleted?: boolean;
  Active?: boolean;
}

interface IAddSubHexModalProps {
  isVisible: boolean;
  category: string;
  onRequestClose: () => void;
  tiles: INestedTile[];
  onSave?: (tile: INestedTile, name: string) => Promise<void>;
}

interface ISelectedItem {
  tile: INestedTile;
  count: number;
  icon: React.ReactNode;
}

/**
 * AddSubHexModal - A modal for adding a new sub-hex item
 *
 * This component displays a modal with a list of tiles that can be selected to create a new sub-hex.
 * It allows the user to select a tile type and give it a custom name.
 *
 * @param isVisible - Whether the modal is visible
 * @param category - The category of the item being added (e.g., "space", "appliance")
 * @param onRequestClose - Callback function when the modal is closed
 * @param tiles - Array of available tiles to select from
 * @param onSave - Callback function when a new sub-hex is saved
 */
const AddSubHexModal: React.FC<IAddSubHexModalProps> = ({
  isVisible,
  onRequestClose,
  category,
  tiles,
  onSave
}) => {
  const { i18n } = useLanguageContext();
  const [selectedItems, setSelectedItems] = useState<ISelectedItem[]>([]);
  const [showAddNewSubHex, setShowAddNewSubHex] = useState<boolean>(false);
  const [subHexName, setSubHexName] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  // Reset selected items when modal is closed
  useEffect(() => {
    if (!isVisible) {
      setSelectedItems([]);
      setShowAddNewSubHex(false);
      setSubHexName("");
    }
  }, [isVisible]);

  // Close the add new sub-hex view if no items are selected
  useEffect(() => {
    if (selectedItems.length === 0) {
      setShowAddNewSubHex(false);
    }
  }, [selectedItems]);

  // Validation for the sub-hex name
  const validationError: string = useMemo(() => {
    if (subHexName.length >= 20) {
      return i18n.t("NameCannotBeMoreThan20Characters");
    }
    return "";
  }, [subHexName, i18n]);

  // Check if a tile is selected
  const isItemSelected = (tile: INestedTile): boolean => {
    return selectedItems.some((item) => item.tile.UniqueId === tile.UniqueId);
  };

  // Get a default name for the new sub-hex based on the selected tile
  const getNewSubHexTileName = (tiles: INestedTile[], selectedTile: INestedTile): string => {
    // This is a simplified version - in a real app, you might have more complex logic
    return selectedTile.Name;
  };

  // Remove an object from an array
  const removeObjectFromArray = <T extends unknown>(array: T[], object: T | undefined): T[] => {
    if (!object) return array;
    return array.filter(item => item !== object);
  };

  // Filter default tiles
  const filterDefaultTiles = (tiles: INestedTile[]): INestedTile[] => {
    // This is a simplified version - in a real app, you might have more complex logic
    return tiles.filter(tile => !tile.Deleted);
  };

  // Handle save button click
  const handleSave = async () => {
    if (subHexName.length === 0 || validationError.length > 0 || saving) {
      return;
    }

    setSaving(true);
    try {
      // Check if a tile with this name already exists
      const existingNameTile = tiles.find(
        tile => tile.Name.toLowerCase() === subHexName.toLowerCase()
      );

      if (existingNameTile && !existingNameTile.Deleted) {
        // Show error message
        console.error("A tile with this name already exists");
        setSaving(false);
        return;
      }

      // Call the onSave callback if provided
      if (onSave) {
        await onSave(selectedItems[0].tile, subHexName);
      }

      // Close the modal
      onRequestClose();
      setShowAddNewSubHex(false);
      setSubHexName("");
    } catch (error) {
      console.error("Error saving tile:", error);
    } finally {
      setSaving(false);
    }
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
      {!showAddNewSubHex ? (
        <div style={styles.mainContainer}>
          <div style={{ alignSelf: "center", marginTop: "20px" }}>
            <div style={{ width: "40px", height: "4px", backgroundColor: Colors.GREY_COLOR, borderRadius: "2px" }}></div>
          </div>

          <CustomText style={styles.headerText}>
            {category === "space"
              ? "New Space"
              : category === "appliance"
              ? "New Appliance"
              : `New ${category.slice(0, 1).toUpperCase() + category.slice(1)}`}
          </CustomText>

          <div style={styles.horizontalLineContainer}>
            <HorizontalLine color={Colors.BLACK} />
          </div>

          <div style={styles.flatListStyle}>
            {filterDefaultTiles(tiles)
              .filter(tile => !tile.Name.includes("'s"))
              .map((tile, index) => (
                <div
                  key={`row-${index}`}
                  style={styles.itemContainer}
                  onClick={() => {
                    const isSelected = isItemSelected(tile);
                    const selectedItem = selectedItems.find(
                      item => item.tile.UniqueId === tile.UniqueId
                    );

                    if (isSelected) {
                      setSelectedItems(
                        removeObjectFromArray(selectedItems, selectedItem)
                      );
                    } else {
                      setSelectedItems([
                        {
                          tile,
                          count: 1,
                          icon: <Icon name="home" width={20} height={20} />
                        }
                      ]);
                      setShowAddNewSubHex(true);
                      setSubHexName(getNewSubHexTileName(tiles, tile));
                    }
                  }}
                >
                  <div style={styles.cellView}>
                    <div style={styles.itemNameIconView}>
                      <Icon name="home" width={24} height={24} />
                      <CustomText style={styles.itemNameText}>
                        {tile.Name}
                      </CustomText>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div style={styles.mainContainer}>
          <div style={{ alignSelf: "center", marginTop: "20px" }}>
            <div style={{ width: "40px", height: "4px", backgroundColor: Colors.GREY_COLOR, borderRadius: "2px" }}></div>
          </div>

          <CustomText style={{...styles.headerText, textAlign: "center"}}>
            {`New ${category.slice(0, 1).toUpperCase() + category.slice(1)}`}
          </CustomText>

          <div style={styles.horizontalLineContainer}>
            <HorizontalLine color={Colors.BLACK} />
          </div>

          <CustomText style={styles.descText}>
            You can give a name to your {category} to personalize it.
          </CustomText>

          <div style={{ gap: "20px" }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              padding: "0 5% 20px 5%",
            }}>
              <div style={{
                display: "flex",
                flexDirection: "row",
                gap: "10px",
                alignItems: "center",
                width: "100%",
                alignSelf: "center",
                padding: "0 20px",
              }}>
                {selectedItems[0]?.icon}
                <input
                  style={{
                    flex: 1,
                    height: "40px",
                    fontSize: Typography.FONT_SIZE_16,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                    color: Colors.GREY_COLOR,
                    border: "none",
                    outline: "none",
                    width: "100%",
                  }}
                  placeholder={`Enter ${category} name`}
                  onChange={(e) => setSubHexName(e.target.value)}
                  value={subHexName}
                />
              </div>
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_10,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.RED,
                padding: "0 20px",
              }}>
                {validationError}
              </CustomText>
            </div>
          </div>

          <div style={styles.buttonsContainer}>
            <Button
              width="40%"
              textProps={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                text: "Cancel",
                color: Colors.BLUE,
              }}
              onButtonClick={() => {
                setSubHexName("");
                setShowAddNewSubHex(false);
              }}
              backgroundColor={Colors.WHITE}
              borderProps={{
                width: 1,
                radius: 10,
                color: Colors.BLUE,
              }}
            />

            <Button
              disabled={
                subHexName.length === 0 ||
                validationError.length > 0 ||
                saving
              }
              width="40%"
              textProps={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                text: "Save",
              }}
              onButtonClick={handleSave}
              backgroundColor={Colors.BLUE}
              borderProps={{
                width: 1,
                radius: 10,
              }}
            />
          </div>
        </div>
      )}
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
  itemsContainer: {
    flex: 1,
    gap: "15px",
    padding: "5%"
  },
  itemText: {
    fontSize: Typography.FONT_SIZE_16,
  },
  headerText: {
    margin: "15px",
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: "center",
  },
  horizontalLineContainer: {
    width: "100%",
    opacity: 0.1,
  },
  descriptionTextContainer: {
    gap: "15px",
    marginTop: "15px"
  },
  descriptionText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
    textAlign: "center",
    padding: "0 10px",
    paddingBottom: "15px",
  },
  actionButtonsContainer: {
    gap: "10px",
    display: "flex",
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "15px",
  },
  flatListStyle: {
    flex: 1,
    margin: "20px 0",
    padding: "0 20px",
    maxHeight: "400px",
    overflowY: "auto",
  },
  itemContainer: {
    display: "flex",
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    color: Colors.MIDNIGHT,
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
  cantFindText: {
    color: Colors.PRIMARY_ELECTRIC_BLUE,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    fontSize: Typography.FONT_SIZE_14,
  },
  conuterContainer: {
    width: "24px",
    height: "24px",
    border: "1px solid #D0D5DD",
    borderRadius: "5px",
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.BLUE,
  },
  descText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
    padding: "20px",
    textAlign: "center",
  },
  buttonsContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    flexDirection: "row",
    justifyContent: "space-around",
  },
};

export default AddSubHexModal;
