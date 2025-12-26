import { ETileType } from './types';

// Static list of all available space types based on React Native project
// Excluding blacklisted types that are no longer created on backend
export const SPACE_TILES_TYPES: ETileType[] = [
  ETileType.Kitchen,
  ETileType.Living_space,
  ETileType.Bedroom,
  ETileType.Bathroom,
  ETileType.Garage,
  ETileType.Garden,
  ETileType.Patio,
  ETileType.Pool,
  ETileType.Game_room,
  ETileType.Office,
  ETileType.Closet,
  ETileType.Laundry,
  ETileType.Outdoor,
  ETileType.Laundry_Room,
  ETileType.Living_Room,
  ETileType.Dining_Room,
  ETileType.Foyer_Entrance_Hall,
  ETileType.Attic,
  ETileType.Balcony,
  ETileType.Basement,
  ETileType.Den,
  ETileType.Family_Room,
  ETileType.Gaming_Room,
  ETileType.Home_Gym,
  ETileType.Home_Office,
  ETileType.Home_Theatre_Room,
  ETileType.Library,
  ETileType.Mud_Room,
  ETileType.Music_Room,
  ETileType.Nursery,
  ETileType.Panic_Room,
  ETileType.Pantry,
  ETileType.Playroom,
  ETileType.Porch,
  ETileType.Shed,
  ETileType.Storage_Room,
  ETileType.Sunrooms,
  ETileType.Walk_in_Closet,
  ETileType.Wine_Cellar,
  ETileType.Loft,
  ETileType.Master_Bedroom,
  ETileType.Master_Bathroom,
];

// Function to get space name from ETileType
export const getSpaceName = (tileType: ETileType): string => {
  return ETileType[tileType].replace(/_/g, ' ');
};

// Function to get space icon name from ETileType (for use with Icon component)
export const getSpaceIcon = (tileType: ETileType): string => {
  switch (tileType) {
    case ETileType.Kitchen:
      return 'kitchen';
    case ETileType.Living_space:
    case ETileType.Living_Room:
      return 'living-room';
    case ETileType.Bedroom:
    case ETileType.Master_Bedroom:
      return 'bedroom';
    case ETileType.Bathroom:
    case ETileType.Master_Bathroom:
      return 'bathroom';
    case ETileType.Garage:
      return 'garage';
    case ETileType.Garden:
      return 'garden';
    case ETileType.Patio:
      return 'outdoor'; // Using outdoor as fallback for patio
    case ETileType.Pool:
      return 'pool';
    case ETileType.Game_room:
    case ETileType.Gaming_Room:
      return 'playroom';
    case ETileType.Office:
    case ETileType.Home_Office:
      return 'home-office';
    case ETileType.Closet:
    case ETileType.Walk_in_Closet:
      return 'walk-in-closet';
    case ETileType.Laundry:
    case ETileType.Laundry_Room:
      return 'laundry-room';
    case ETileType.Outdoor:
      return 'outdoor';
    case ETileType.Dining_Room:
      return 'dining-room';
    case ETileType.Foyer_Entrance_Hall:
      return 'foyer';
    case ETileType.Attic:
      return 'attic';
    case ETileType.Balcony:
      return 'balcony';
    case ETileType.Basement:
      return 'basement';
    case ETileType.Den:
      return 'den';
    case ETileType.Family_Room:
      return 'family-room';
    case ETileType.Home_Gym:
      return 'gym'; // Using gym instead of home-gym
    case ETileType.Home_Theatre_Room:
      return 'home-theater'; // Using home-theater instead of home-theatre
    case ETileType.Library:
      return 'library';
    case ETileType.Mud_Room:
      return 'mud-room';
    case ETileType.Music_Room:
      return 'music-room';
    case ETileType.Nursery:
      return 'nursery';
    case ETileType.Panic_Room:
      return 'panic-room';
    case ETileType.Pantry:
      return 'pantry';
    case ETileType.Playroom:
      return 'playroom';
    case ETileType.Porch:
      return 'porch';
    case ETileType.Shed:
      return 'shed';
    case ETileType.Storage_Room:
      return 'storageRoom'; // Using storageRoom instead of storage-room
    case ETileType.Sunrooms:
      return 'sunroom';
    case ETileType.Wine_Cellar:
      return 'wine-cellar';
    case ETileType.Loft:
      return 'loft';
    default:
      return 'spaces';
  }
};

// Function to get space icon path for img tags (used in modals)
export const getSpaceIconPath = (tileType: ETileType): string => {
  const iconName = getSpaceIcon(tileType);
  return `/hive-icons/${iconName}.svg`;
};

// Function to get space icon by type for selection modals (alternative naming)
export const getSpaceIconByType = (tileType: ETileType): string => {
  return getSpaceIconPath(tileType);
};

/**
 * Generate a unique space name by checking for duplicates and adding numbering
 * @param baseName - The base name for the space (e.g., "Bedroom")
 * @param existingSpaces - Array of existing space tiles to check against
 * @returns A unique space name (e.g., "Bedroom", "Bedroom 2", "Bedroom 3")
 */
export const generateUniqueSpaceName = (baseName: string, existingSpaces: { Name: string }[]): string => {
  // Get all existing space names in lowercase for case-insensitive comparison
  const existingNames = existingSpaces.map(space => space.Name.toLowerCase());

  // Check if the base name already exists
  if (!existingNames.includes(baseName.toLowerCase())) {
    return baseName;
  }

  // Find the next available number
  let counter = 2;
  let uniqueName = `${baseName} ${counter}`;

  while (existingNames.includes(uniqueName.toLowerCase())) {
    counter++;
    uniqueName = `${baseName} ${counter}`;
  }

  return uniqueName;
};
