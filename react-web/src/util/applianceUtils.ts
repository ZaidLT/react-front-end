import { ETileType } from './types';

// Static list of all available appliance types based on React Native project
// Excluding blacklisted types that are no longer created on backend
export const APPLIANCE_TILES_TYPES: ETileType[] = [
  ETileType.Fridge,
  ETileType.KitchenAid,
  ETileType.Washing_machine,
  ETileType.Dryer,
  ETileType.Blender,
  ETileType.Dishwasher,
  ETileType.Oven,
  ETileType.Hot_Tub,
  ETileType.Generator,
  ETileType.Air_conditioner,
  ETileType.Air_fryer,
  ETileType.Air_purifier,
  ETileType.Bread_Maker,
  ETileType.Ceiling_Fan,
  ETileType.Coffee_maker,
  ETileType.Crock_Pot,
  ETileType.Dehumidifier,
  ETileType.Electric_fan,
  ETileType.Espresso_Maker,
  ETileType.Fireplace,
  ETileType.Flatscreen_TV,
  ETileType.Food_processor,
  ETileType.Freezer,
  ETileType.Furnace,
  ETileType.Grill,
  ETileType.Hand_Mixer,
  ETileType.Heater,
  ETileType.Humidifier,
  ETileType.Ice_Maker,
  ETileType.Iron,
  ETileType.Juicer,
  ETileType.Kettle,
  ETileType.Lawn_Mower,
  ETileType.Leaf_Blower,
  ETileType.Microwave,
  ETileType.Mini_Fridge,
  ETileType.Rice_Cooker,
  ETileType.Sauna,
  ETileType.Space_heater,
  ETileType.Speakers,
  ETileType.Stand_Mixer,
  ETileType.Steamer,
  ETileType.Stove,
  ETileType.Toaster,
  ETileType.Toaster_Oven,
  ETileType.Trash_Compactor,
  ETileType.Vacuum_cleaner,
  ETileType.Waffle_Iron,
  ETileType.Water_Heater,
  ETileType.Weed_Eater,
  ETileType.Wet_Vac,
];

// Function to get appliance name from ETileType
export const getApplianceName = (tileType: ETileType): string => {
  return ETileType[tileType].replace(/_/g, ' ');
};

// Function to get appliance icon name from ETileType (for use with Icon component)
export const getApplianceIcon = (tileType: ETileType): string => {
  switch (tileType) {
    case ETileType.Air_conditioner:
      return 'air-conditioner';
    case ETileType.Dishwasher:
      return 'dishwasher';
    case ETileType.Dryer:
      return 'dryer';
    case ETileType.Washing_machine:
      return 'washing-machine';
    case ETileType.Fridge:
    case ETileType.Refrigerator:
      return 'refrigerator';
    case ETileType.Oven:
      return 'oven';
    case ETileType.Microwave:
      return 'microwave';
    case ETileType.Blender:
      return 'blender';
    case ETileType.Air_fryer:
      return 'air-fryer';
    case ETileType.Air_purifier:
      return 'air-purifier';
    case ETileType.Bread_Maker:
      return 'bread-maker';
    case ETileType.Ceiling_Fan:
      return 'ceiling-fan';
    case ETileType.Coffee_maker:
      return 'coffee-maker';
    case ETileType.Crock_Pot:
      return 'crock-pot';
    case ETileType.Dehumidifier:
      return 'dehumidifier';
    case ETileType.Electric_fan:
      return 'electric-fan';
    case ETileType.Espresso_Maker:
      return 'espresso-maker';
    case ETileType.Fireplace:
      return 'fireplace';
    case ETileType.Flatscreen_TV:
      return 'flatscreen-tv';
    case ETileType.Food_processor:
      return 'food-processor';
    case ETileType.Freezer:
      return 'freezer';
    case ETileType.Furnace:
      return 'furnace';
    case ETileType.Grill:
      return 'grill';
    case ETileType.Hand_Mixer:
      return 'hand-mixer';
    case ETileType.Heater:
      return 'heater';
    case ETileType.Humidifier:
      return 'humidifier';
    case ETileType.Ice_Maker:
      return 'ice-maker';
    case ETileType.Iron:
      return 'iron';
    case ETileType.Juicer:
      return 'juicer';
    case ETileType.Kettle:
      return 'kettle';
    case ETileType.Lawn_Mower:
      return 'lawn-mower';
    case ETileType.Leaf_Blower:
      return 'leaf-blower';
    case ETileType.Mini_Fridge:
      return 'mini-fridge';
    case ETileType.Rice_Cooker:
      return 'rice-cooker';
    case ETileType.Sauna:
      return 'sauna';
    case ETileType.Space_heater:
      return 'space-heater';
    case ETileType.Speakers:
      return 'speakers';
    case ETileType.Stand_Mixer:
      return 'stand-mixer';
    case ETileType.Steamer:
      return 'steamer';
    case ETileType.Stove:
      return 'stove';
    case ETileType.Toaster:
      return 'toaster';
    case ETileType.Toaster_Oven:
      return 'toaster-oven';
    case ETileType.Trash_Compactor:
      return 'trash-compactor';
    case ETileType.Vacuum_cleaner:
      return 'vacuum-cleaner';
    case ETileType.Waffle_Iron:
      return 'waffle-iron';
    case ETileType.Water_Heater:
      return 'water-heater';
    case ETileType.Weed_Eater:
      return 'weed-eater';
    case ETileType.Wet_Vac:
      return 'wet-vac';
    case ETileType.Hot_Tub:
      return 'hot-tub';
    case ETileType.Generator:
      return 'generator';
    case ETileType.KitchenAid:
      return 'kitchenaid';
    default:
      return 'appliances'; // Default appliance icon
  }
};

// Function to get appliance icon path for img tags (used in modals)
export const getApplianceIconPath = (tileType: ETileType): string => {
  const iconName = getApplianceIcon(tileType);
  return `/hive-icons/${iconName}.svg`;
};

// Function to get appliance icon by type for selection modals (alternative naming)
export const getApplianceIconByType = (tileType: ETileType): string => {
  return getApplianceIconPath(tileType);
};

/**
 * Generate a unique appliance name by checking for duplicates and adding numbering
 * @param baseName - The base name for the appliance (e.g., "Dishwasher")
 * @param existingAppliances - Array of existing appliance tiles to check against
 * @returns A unique appliance name (e.g., "Dishwasher", "Dishwasher 2", "Dishwasher 3")
 */
export const generateUniqueApplianceName = (baseName: string, existingAppliances: { Name: string }[]): string => {
  // Get all existing appliance names in lowercase for case-insensitive comparison
  const existingNames = existingAppliances.map(appliance => appliance.Name.toLowerCase());
  
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
