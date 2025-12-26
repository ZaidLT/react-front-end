import { ETileType } from './types';
import { I18nKeys } from './i18n';

/**
 * Translation utilities for tiles, appliances, spaces, and utilities.
 *
 * This module consolidates all translation helpers for type-based and name-based
 * localization throughout the application.
 */

// ============================================================================
// Generic Types
// ============================================================================

/**
 * Input for tile translation (generic tiles)
 */
export type TranslateInput = {
  type?: ETileType | number | null;
  name?: string | null;
};

/**
 * Input for appliance translation (preserves numeric suffixes)
 */
export type TranslateApplianceInput = {
  type?: ETileType | number | null;
  name?: string | null;
};

// ============================================================================
// Type to i18n Key Mappings
// ============================================================================

/**
 * Complete mapping of ETileType to i18n translation keys.
 * Used for type-first translation across all tile categories.
 */
export const TILE_TYPE_TO_I18N_KEY: Partial<Record<ETileType, I18nKeys>> = {
  // Parent hives
  [ETileType.Appliances]: 'Appliances',
  [ETileType.Property_Info]: 'PropertyInfo',
  [ETileType.Spaces]: 'Spaces',
  [ETileType.Utilities]: 'Utilities',

  // Property Info
  [ETileType.Property_Deeds]: 'PropertyDeeds',
  [ETileType.Ownership_Records]: 'OwnershipRecords' as I18nKeys,
  [ETileType.Mortgage]: 'Mortgage',
  [ETileType.Taxes]: 'Taxes',
  [ETileType.Insurance]: 'Insurance',
  [ETileType.Rent]: 'Rent',
  [ETileType.Lease]: 'Lease',

  // Utilities
  [ETileType.Water]: 'Water',
  [ETileType.Gas]: 'Gas',
  [ETileType.Internet]: 'Internet',
  [ETileType.Phone]: 'Phone',
  [ETileType.Electricity]: 'Electricity',
  [ETileType.Cable]: 'Cable',
  [ETileType.Waste]: 'Waste',
  [ETileType.Bundle]: 'Bundle',
  [ETileType.CustomUtility]: 'CustomUtility' as I18nKeys,

  // Appliances
  [ETileType.Air_conditioner]: 'AirConditioner',
  [ETileType.Air_fryer]: 'AirFryer',
  [ETileType.Air_purifier]: 'AirPurifier',
  [ETileType.Blender]: 'Blender',
  [ETileType.Dishwasher]: 'Dishwasher',
  [ETileType.Fridge]: 'Refrigerator',
  [ETileType.Microwave]: 'Microwave',
  [ETileType.Oven]: 'Oven',
  [ETileType.Bread_Maker]: 'BreadMaker',
  [ETileType.Ceiling_Fan]: 'CeilingFan',
  [ETileType.Coffee_maker]: 'CoffeeMaker',
  [ETileType.Crock_Pot]: 'CrockPot',
  [ETileType.Dehumidifier]: 'Dehumidifier',
  [ETileType.Dryer]: 'Dryer',
  [ETileType.Electric_fan]: 'ElectricFan',
  [ETileType.Espresso_Maker]: 'EspressoMaker',
  [ETileType.Fireplace]: 'Fireplace',
  [ETileType.Flatscreen_TV]: 'FlatscreenTV',
  [ETileType.Food_processor]: 'FoodProcessor',
  [ETileType.Freezer]: 'Freezer',
  [ETileType.Furnace]: 'Furnace',
  [ETileType.Generator]: 'Generator',
  [ETileType.Grill]: 'Grill',
  [ETileType.Hand_Mixer]: 'HandMixer',
  [ETileType.Heater]: 'Heater',
  [ETileType.Hot_Tub]: 'HotTub',
  [ETileType.Humidifier]: 'Humidifier',
  [ETileType.Ice_Maker]: 'IceMaker',
  [ETileType.Iron]: 'Iron',
  [ETileType.Juicer]: 'Juicer',
  [ETileType.Kettle]: 'Kettle',
  [ETileType.KitchenAid]: 'KitchenAid',
  [ETileType.Lawn_Mower]: 'LawnMower',
  [ETileType.Leaf_Blower]: 'LeafBlower',
  [ETileType.Mini_Fridge]: 'Mini-Fridge',
  [ETileType.Refrigerator]: 'Refrigerator',
  [ETileType.Rice_Cooker]: 'RiceCooker',
  [ETileType.Sauna]: 'Sauna',
  [ETileType.Space_heater]: 'SpaceHeater',
  [ETileType.Speakers]: 'Speakers',
  [ETileType.Stand_Mixer]: 'StandMixer',
  [ETileType.Steamer]: 'Steamer',
  [ETileType.Stove]: 'Stove',
  [ETileType.Toaster]: 'Toaster',
  [ETileType.Toaster_Oven]: 'ToasterOven',
  [ETileType.Trash_Compactor]: 'TrashCompactor',
  [ETileType.Vacuum_cleaner]: 'VacuumCleaner',
  [ETileType.Waffle_Iron]: 'WaffleIron',
  [ETileType.Washing_machine]: 'WashingMachine',
  [ETileType.Water_Heater]: 'WaterHeater',
  [ETileType.Weed_Eater]: 'WeedEater',
  [ETileType.Wet_Vac]: 'Wet-Vac',

  // Spaces
  [ETileType.Attic]: 'Attic',
  [ETileType.Balcony]: 'Balcony',
  [ETileType.Basement]: 'Basement',
  [ETileType.Den]: 'Den',
  [ETileType.Dining_Room]: 'DiningRoom',
  [ETileType.Family_Room]: 'FamilyRoom',
  [ETileType.Foyer_Entrance_Hall]: 'FoyerEntranceHall',
  [ETileType.Gaming_Room]: 'GamingRoom',
  [ETileType.Home_Gym]: 'HomeGym',
  [ETileType.Home_Office]: 'HomeOffice',
  [ETileType.Home_Theatre_Room]: 'HomeTheatreRoom',
  [ETileType.Laundry_Room]: 'LaundryRoom',
  [ETileType.Library]: 'Library',
  [ETileType.Living_Room]: 'LivingRoom',
  [ETileType.Loft]: 'Loft',
  [ETileType.Mud_Room]: 'MudRoom',
  [ETileType.Music_Room]: 'MusicRoom',
  [ETileType.Nursery]: 'Nursery',
  [ETileType.Outdoor]: 'Outdoor',
  [ETileType.Panic_Room]: 'PanicRoom',
  [ETileType.Pantry]: 'Pantry',
  [ETileType.Playroom]: 'Playroom',
  [ETileType.Porch]: 'Porch',
  [ETileType.Shed]: 'Shed',
  [ETileType.Storage_Room]: 'StorageRoom',
  [ETileType.Sunrooms]: 'Sunrooms',
  [ETileType.Walk_in_Closet]: 'Walk-inCloset',
  [ETileType.Wine_Cellar]: 'WineCellar',
  [ETileType.Master_Bedroom]: 'MasterBedroom' as I18nKeys,
  [ETileType.Master_Bathroom]: 'MasterBathroom' as I18nKeys,
  [ETileType.Elevator]: 'Elevator' as I18nKeys,
  [ETileType.Stairs]: 'Stairs' as I18nKeys,
  [ETileType.Hallway]: 'Hallway' as I18nKeys,
  [ETileType.Outdoor_Entrance]: 'OutdoorEntrance' as I18nKeys,
  [ETileType.Foyer]: 'Foyer' as I18nKeys,

  // Other
  [ETileType.Central_Vacuum]: 'CentralVacuum' as I18nKeys,
};

/**
 * Appliance-specific mapping (subset of TILE_TYPE_TO_I18N_KEY).
 * Used specifically for appliance translation when you want to be explicit.
 */
export const APPLIANCE_TYPE_TO_I18N_KEY: Partial<Record<ETileType, I18nKeys>> = {
  [ETileType.Air_conditioner]: 'AirConditioner',
  [ETileType.Air_fryer]: 'AirFryer',
  [ETileType.Air_purifier]: 'AirPurifier',
  [ETileType.Blender]: 'Blender',
  [ETileType.Dishwasher]: 'Dishwasher',
  [ETileType.Fridge]: 'Refrigerator',
  [ETileType.Microwave]: 'Microwave',
  [ETileType.Oven]: 'Oven',
  [ETileType.Bread_Maker]: 'BreadMaker',
  [ETileType.Ceiling_Fan]: 'CeilingFan',
  [ETileType.Coffee_maker]: 'CoffeeMaker',
  [ETileType.Crock_Pot]: 'CrockPot',
  [ETileType.Dehumidifier]: 'Dehumidifier',
  [ETileType.Dryer]: 'Dryer',
  [ETileType.Electric_fan]: 'ElectricFan',
  [ETileType.Espresso_Maker]: 'EspressoMaker',
  [ETileType.Fireplace]: 'Fireplace',
  [ETileType.Flatscreen_TV]: 'FlatscreenTV',
  [ETileType.Food_processor]: 'FoodProcessor',
  [ETileType.Freezer]: 'Freezer',
  [ETileType.Furnace]: 'Furnace',
  [ETileType.Generator]: 'Generator',
  [ETileType.Grill]: 'Grill',
  [ETileType.Hand_Mixer]: 'HandMixer',
  [ETileType.Heater]: 'Heater',
  [ETileType.Hot_Tub]: 'HotTub',
  [ETileType.Humidifier]: 'Humidifier',
  [ETileType.Ice_Maker]: 'IceMaker',
  [ETileType.Iron]: 'Iron',
  [ETileType.Juicer]: 'Juicer',
  [ETileType.Kettle]: 'Kettle',
  [ETileType.KitchenAid]: 'KitchenAid',
  [ETileType.Lawn_Mower]: 'LawnMower',
  [ETileType.Leaf_Blower]: 'LeafBlower',
  [ETileType.Mini_Fridge]: 'Mini-Fridge',
  [ETileType.Refrigerator]: 'Refrigerator',
  [ETileType.Rice_Cooker]: 'RiceCooker',
  [ETileType.Sauna]: 'Sauna',
  [ETileType.Space_heater]: 'SpaceHeater',
  [ETileType.Speakers]: 'Speakers',
  [ETileType.Stand_Mixer]: 'StandMixer',
  [ETileType.Steamer]: 'Steamer',
  [ETileType.Stove]: 'Stove',
  [ETileType.Toaster]: 'Toaster',
  [ETileType.Toaster_Oven]: 'ToasterOven',
  [ETileType.Trash_Compactor]: 'TrashCompactor',
  [ETileType.Vacuum_cleaner]: 'VacuumCleaner',
  [ETileType.Waffle_Iron]: 'WaffleIron',
  [ETileType.Washing_machine]: 'WashingMachine',
  [ETileType.Water_Heater]: 'WaterHeater',
  [ETileType.Weed_Eater]: 'WeedEater',
  [ETileType.Wet_Vac]: 'Wet-Vac',
};

// ============================================================================
// Translation Functions
// ============================================================================

/**
 * Translate generic tile label based on type and/or name.
 *
 * Used for general tile translation (spaces, utilities, property info, etc.)
 * Does NOT preserve numeric suffixes.
 *
 * @param input - Object with optional type (ETileType) and name (string)
 * @param i18n - i18n instance with t() function
 * @returns Translated label string
 *
 * @example
 * // Type-based translation
 * translateTileLabel({ type: ETileType.Living_Room }, i18n) // "Salon" (in French)
 *
 * // Fallback to name if type not found
 * translateTileLabel({ name: "Custom Room" }, i18n) // "Custom Room"
 */
export const translateTileLabel = (
  input: TranslateInput,
  i18n: { t: (key: any) => string }
): string => {
  const { type, name } = input || {};

  // Type-based translation
  if (typeof type === 'number' && (type as ETileType) in TILE_TYPE_TO_I18N_KEY) {
    const key = TILE_TYPE_TO_I18N_KEY[type as ETileType]!;
    return i18n.t(key as any);
  }

  // Name-based translation fallback
  if (name && name.trim()) {
    const direct = i18n.t(name as any);
    if (direct && direct !== name) return direct;

    const normalized = name
      .replace(/[\/-]/g, ' ') // turn / and - into spaces
      .replace(/\s+/g, ' ') // collapse spaces
      .trim()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');

    const candidates = [
      normalized, // e.g., CeilingFan
      normalized.replace(/Closet/i, 'Closet'), // stable
      normalized.replace(/MiniFridge/, 'Mini-Fridge'),
      normalized.replace(/WetVac/, 'Wet-Vac'),
      normalized.replace(/WalkInCloset/, 'Walk-inCloset'),
      normalized.replace(/PanicRoom/, 'PanicRoom'),
    ];

    for (const key of candidates) {
      const v = i18n.t(key as any);
      if (v && v !== key) return v;
    }

    return name; // final fallback
  }

  return '';
};

/**
 * Translate appliance label based on type and/or name.
 *
 * This function is identical to translateTileLabel but preserves numeric suffixes
 * in appliance names (e.g., "Dishwasher 2" -> "Lave-vaisselle 2").
 *
 * @param input - Object with optional type (ETileType) and name (string)
 * @param i18n - i18n instance with t() function
 * @returns Translated label string
 *
 * @example
 * // Type-based translation
 * translateApplianceLabel({ type: ETileType.Dishwasher }, i18n) // "Lave-vaisselle" (in French)
 *
 * // Type + custom name (preserves numbering)
 * translateApplianceLabel({ type: ETileType.Dishwasher, name: "Dishwasher 2" }, i18n) // "Lave-vaisselle 2" (in French)
 *
 * // Fallback to name if type not found
 * translateApplianceLabel({ name: "Custom Appliance" }, i18n) // "Custom Appliance"
 */
export const translateApplianceLabel = (
  input: TranslateApplianceInput,
  i18n: { t: (key: any) => string }
): string => {
  const { type, name } = input || {};

  // Type-based translation (primary method)
  if (typeof type === 'number' && (type as ETileType) in APPLIANCE_TYPE_TO_I18N_KEY) {
    const key = APPLIANCE_TYPE_TO_I18N_KEY[type as ETileType]!;
    const translated = i18n.t(key as any);

    // If we have a custom name with numbering (e.g., "Dishwasher 2"), preserve the suffix
    if (name && name.trim()) {
      // Extract any numeric suffix from the name
      const match = name.match(/\s+(\d+)$/);
      if (match) {
        return `${translated} ${match[1]}`;
      }
    }

    return translated;
  }

  // Name-based translation fallback (same logic as translateTileLabel)
  if (name && name.trim()) {
    const direct = i18n.t(name as any);
    if (direct && direct !== name) return direct;

    const normalized = name
      .replace(/[\/-]/g, ' ') // turn / and - into spaces
      .replace(/\s+/g, ' ') // collapse spaces
      .trim()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');

    const candidates = [
      normalized, // e.g., Dishwasher
      normalized.replace(/MiniFridge/, 'Mini-Fridge'),
      normalized.replace(/WetVac/, 'Wet-Vac'),
    ];

    for (const key of candidates) {
      const v = i18n.t(key as any);
      if (v && v !== key) return v;
    }

    return name; // final fallback
  }

  return '';
};
