import { ETileType } from './types';

// Hardcoded utility types based on React Native implementation
// These are the default utility types that appear in the utilities page
export interface UtilityTileData {
  name: string;
  icon: string;
  type: ETileType;
}

export const UTILITY_TILES_TYPES: UtilityTileData[] = [
  {
    name: 'Water',
    icon: 'Water',
    type: ETileType.Water,
  },
  {
    name: 'Gas',
    icon: 'Gas',
    type: ETileType.Gas,
  },
  {
    name: 'Internet',
    icon: 'Internet',
    type: ETileType.Internet,
  },
  {
    name: 'Phone',
    icon: 'mobile',
    type: ETileType.Phone,
  },
  {
    name: 'Electricity',
    icon: 'Electricity',
    type: ETileType.Electricity,
  },
  {
    name: 'Cable',
    icon: 'Cable',
    type: ETileType.Cable,
  },
  {
    name: 'Waste',
    icon: 'BinSingleLine',
    type: ETileType.Waste,
  },
  {
    name: 'Security',
    icon: 'security',
    type: ETileType.Utilities, // Keep as generic since no specific type exists
  },
  {
    name: 'Bundle',
    icon: 'widgets',
    type: ETileType.Bundle,
  },
];

// Function to get utility icon name from utility name
export const getUtilityIcon = (utilityName: string): string => {
  const utility = UTILITY_TILES_TYPES.find(
    (util) => util.name.toLowerCase() === utilityName.toLowerCase()
  );
  return utility?.icon || 'utilities';
};

// Function to get utility icon from tile name (for dynamic matching)
export const getUtilityIconFromTileName = (tileName: string): string => {
  const name = tileName.toLowerCase();

  if (name.includes('water')) return 'Water';
  if (name.includes('gas')) return 'Gas';
  if (name.includes('internet')) return 'Internet';
  if (name.includes('phone') || name.includes('mobile')) return 'mobile';
  if (name.includes('electric') || name.includes('electricity')) return 'Electricity';
  if (name.includes('cable')) return 'Cable';
  if (name.includes('waste') || name.includes('trash') || name.includes('garbage')) return 'BinSingleLine';
  if (name.includes('security')) return 'security';
  if (name.includes('bundle')) return 'widgets';
  
  // Default utility icon
  return 'utilities';
};
