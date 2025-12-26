import React, { useMemo } from 'react';
import HiveHexTile from './HiveHexTile';

interface HiveHexTileContent {
  icon?: string;
  title?: string;
  iconColor?: string;
  image?: string;
}

interface HiveHexTileProps {
  content?: HiveHexTileContent;
  onPress?: () => void;
  emptyTile?: boolean;
  coloredTile?: boolean;
  noBorderTile?: boolean;
  isPassiveMember?: boolean;
}

interface DynamicGridLayoutProps {
  tilesPerRow: number[];
  tiles: HiveHexTileProps[];
  containerStyle?: React.CSSProperties;
  tileWidth?: number;
  tileHeight?: number;
  isMobile?: boolean;
  showAddTile?: boolean; // New prop to control whether to show add tiles for null spaces
}

const DynamicGridLayout: React.FC<DynamicGridLayoutProps> = ({
  tilesPerRow,
  tiles,
  containerStyle,
  tileWidth,
  tileHeight,
  isMobile = false,
  showAddTile = true, // Default to true to maintain existing behavior
}) => {
  // Layout calculation logic similar to React Native implementation
  const layout = useMemo(() => {
    let temp: { data: (HiveHexTileProps | null)[] }[] = [];
    let dataIndex = 0;

    for (let i = 0; i < tilesPerRow.length; i++) {
      let row: (HiveHexTileProps | null)[] = [];
      const numTiles = tilesPerRow[i];

      // Slice the appropriate number of tiles for this row
      row = tiles.slice(dataIndex, dataIndex + numTiles);

      // Handle the case where the row has fewer tiles than expected
      if (row.length < numTiles) {
        if (numTiles === 2 && row.length === 1) {
          // If the previous row had 3 tiles, add only 1 null for alignment
          if (i > 0 && tilesPerRow[i - 1] === 3) {
            row.push(null);  // Add 1 null at the end for alignment
          } else {
            // Center the row with only 1 tile in a 2-tile row by adding null on both sides
            row = [null, row[0], null];
          }
        } else if (numTiles === 3 && row.length === 2) {
          // If we have 2 tiles in a 3-tile row, add one null at the end for alignment
          row.push(null);
        }
      }

      // Handle the last row case: Add a null if the row above has the same number of tiles or 2 more
      if (i === tilesPerRow.length - 1 && tilesPerRow.length > 1) {
        const rowAboveAmount = tilesPerRow[tilesPerRow.length - 2];
        if (rowAboveAmount === row.length || rowAboveAmount - row.length === 2) {
          row.push(null);
        }
      }

      // Add the row to the layout
      temp.push({ data: row });

      // Update the index to the next set of tiles
      dataIndex += numTiles;
    }

    // Filter out rows where all items are null
    const filteredLayout = temp.filter((row) => !row.data.every((item) => item === null));
    return filteredLayout;
  }, [tiles, tilesPerRow]);

  // Check if there's already an add tile in the tiles array
  const hasAddTileInData = tiles.some(tile => tile.emptyTile === true);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100vw',
      backgroundImage: 'url(/backgrounds/home-background.svg)',
      backgroundSize: 'cover',
      backgroundPosition: 'top center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'local',
      position: 'relative',
      paddingTop: '12px', // 12px space from the TaskEventListView above
      paddingBottom: '20px', // Minimal space for tab bar
      paddingLeft: '0',
      paddingRight: '0',
      marginLeft: '0',
      marginRight: '0',
      boxSizing: 'border-box',
      flexGrow: 1,
    }}>
      {/* Centered content wrapper */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '600px', // Limit content width while background extends full width
        margin: '0 auto 120px',
      }}>
        {layout.map((row, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '18px',
            marginBottom: rowIndex !== layout.length - 1 ? '-10px' : '0',
            marginTop: rowIndex === 0 ? '53px' : '0', // 53px from top of background for first row
            zIndex: layout.length - rowIndex, // Higher rows should be on top
          }}
        >
          {row.data.map((tile, tileIndex) => (
            <div key={`tile-${rowIndex}-${tileIndex}`}>
              {tile ? (
                // Check if tile.content is a React element (new HexContainer format)
                React.isValidElement(tile.content) ? (
                  tile.content
                ) : (
                  // Legacy HiveHexTile format
                  <HiveHexTile
                    content={tile.content}
                    onPress={tile.onPress}
                    emptyTile={tile.emptyTile}
                    coloredTile={tile.coloredTile}
                    noBorderTile={tile.noBorderTile}
                    isPassiveMember={tile.isPassiveMember}
                    width={tileWidth || 95}
                    height={tileHeight || 106}
                    isMobile={isMobile}
                  />
                )
              ) : showAddTile && !hasAddTileInData ? (
                // Only show add tile for null placeholders if there's no add tile already in the data
                <HiveHexTile
                  emptyTile={true}
                  width={tileWidth || 95}
                  height={tileHeight || 106}
                  isMobile={isMobile}
                />
              ) : (
                <div
                  style={{
                    width: `${tileWidth || 95}px`,
                    height: `${tileHeight || 106}px`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
      </div>
    </div>
  );
};

export default DynamicGridLayout;
