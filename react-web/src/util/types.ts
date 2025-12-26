// Common type definitions for the web application

export enum BucketType {
  TASKS = "tasks",
  EVENTS = "events",
  NOTES = "notes",
  DOCS = "docs",
  ALL = "all",
  UserTileFiles = "user-tile-files",
  UserFiles = "user-files",
  MemberFiles = "member-files"
}

export interface IFilterPill {
  isSelected?: boolean;
  text: string;
  fixedWidth?: boolean;
  count?: number;
}

export interface IPerson {
  id?: number;
  name?: string;
  avatar?: string;
}

export interface INote {
  id: number;
  title: string;
  description: string;
  isPinned?: boolean;
  isSecure?: boolean;
  subHive?: string;
  assignEvent?: string;
  members?: IPerson[];
  assignTask?: IPerson;
  tag?: string;
  priority?: string;
  pictures?: string[];
}

export enum TASK_STATE {
  TO_DO = "TO_DO",
  COMPLETED = "COMPLETED",
}

export interface ITaskCard {
  categoryText?: string;
  header: string;
  subHeader?: string;
  ownerAvatar?: string;
  complete?: boolean;
  date?: string;
  mini?: boolean;
  isVerticalCard?: boolean;
  state?: TASK_STATE;
  onClick?: () => void;
  changeState?: () => void;
  priority?: number;
}

export interface IDentToggleOptions {
  text?: {
    activeText: string;
    inactiveText: string;
  };
  color?: {
    activeColor: string;
    inactiveColor: string;
  };
}

export interface IEventCard {
  text: string;
  time: string;
  avatar?: any[];
  color: string;
  start?: string;
  end?: string;
  isAllDay?: boolean;
  onPress?: () => void;
  type?: string;
  eventTimeId?: string;
  task?: any;
}

export interface User {
  FirstName: string;
  LastName: string;
  AvatarImagePath?: string;
  Email?: string;
  UserId?: string;
}

export type NotificationType = "Reminder" | "Alert" | "Update";

// SubHive types for notifications
export enum SUB_HIVE {
  DOG = "Dog",
  FOOD = "Food",
  KITCHEN = "Kitchen",
  RECIPES = "Recipes",
  CAR = "Car",
  WORK = "Work"
}

export interface INotification {
  from?: IPerson;
  body: string;
  type: NotificationType;
  subHive: SUB_HIVE;
  date: string;
  isUnread?: boolean;
}

export interface IActivityCard {
  heading: string;
  name: string;
  initials: string;
  avatar?: string;
  date: string;
  time: string;
  onPress?: () => void;
}

export interface IProfileItem {
  content: {
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    value?: string;
    onChange?: (value: string) => void;
  };
  editingEnabled: boolean;
  isButton?: boolean;
  isGooglePlaceInput?: boolean;
  onPress?: () => void;
  placeholder?: string;
  [key: string]: any; // For additional text input props
}

export interface IUserAvatarsGroupProps {
  users: Partial<User>[];
  size: number;
  style?: React.CSSProperties;
}

export interface IUserBasicInfo {
  name?: string;
  lastName?: string;
  message?: string;
  listing?: boolean;
  avatar?: string;
  squiggles?: React.ReactNode;
  circularProfilePhoto?: string;
  editAvatar?: boolean;
  onEditAvatarPress?: () => void;
  editingEnabled?: boolean;
}

export interface IQuote {
  id: string;
  attributes: {
    quote: string;
    frQuote?: string;
    author: string;
    location: string;
  };
}

export interface ISnackbar {
  id: string; // This is not set by dev. It's a unique identifier set by emitSnackbar function.
  message: React.ReactNode; // This can be a string or a component
  type: "success" | "error" | "warning" | "syncing" | "info";
  duration: number;
}

// Routes for navigation
export enum Routes {
  Home = "/",
  Menu = "/menu",
  Search = "/search",
  GlobalSearch = "/search",
  Notifications = "/notifications",
  IconDemo = "/icon-demo",
  ComponentDemo = "/component-demo",
  HiveSelection = "/hive-selection"
}

// Tile types enum matching React Native implementation
export enum ETileType {
  Dog = 0,
  "My Hive" = 1,
  Food = 2,
  House = 3,
  Recipes = 4,
  Vehicles = 5,
  Health = 6,
  Kitchen = 7,
  Living_space = 8,
  Bedroom = 9,
  Closet = 10,
  Laundry = 11,
  Bathroom = 12,
  Office = 13,
  Garage = 14,
  Garden = 15,
  Patio = 16,
  Pool = 17,
  Game_room = 18,
  Blender = 19,
  Dishwasher = 20,
  Fridge = 21,
  Microwave = 22,
  Oven = 23,
  User = 24,
  Recipe = 25,
  GroceryList = 26,
  EevaHive = 27,
  Feedback = 28,
  Survey = 29,
  Appliances = 30,
  Property_Info = 31,
  Spaces = 32,
  // Property Info
  Property_Deeds = 33,
  Ownership_Records = 34,
  Mortgage = 35,
  Taxes = 36,
  Utilities = 37,
  Insurance = 38,
  // Appliances (New)
  Air_conditioner = 39,
  Air_fryer = 40,
  Air_purifier = 41,
  Bread_Maker = 43,
  Ceiling_Fan = 44,
  Coffee_maker = 45,
  Crock_Pot = 46,
  Dehumidifier = 47,
  Dryer = 49,
  Electric_fan = 50,
  Espresso_Maker = 51,
  Fireplace = 52,
  Flatscreen_TV = 53,
  Food_processor = 54,
  Freezer = 55,
  Furnace = 57,
  Generator = 58,
  Grill = 59,
  Hand_Mixer = 60,
  Heater = 61,
  Hot_Tub = 62,
  Humidifier = 63,
  Ice_Maker = 64,
  Iron = 65,
  Juicer = 66,
  Kettle = 67,
  KitchenAid = 68,
  Lawn_Mower = 69,
  Leaf_Blower = 70,
  Mini_Fridge = 72,
  Refrigerator = 74,
  Rice_Cooker = 75,
  Sauna = 76,
  Space_heater = 77,
  Speakers = 78,
  Stand_Mixer = 79,
  Steamer = 80,
  Stove = 81,
  Toaster = 82,
  Toaster_Oven = 83,
  Trash_Compactor = 84,
  Vacuum_cleaner = 85,
  Waffle_Iron = 86,
  Washing_machine = 87,
  Water_Heater = 88,
  Weed_Eater = 89,
  Wet_Vac = 90,
  // Spaces (New)
  Attic = 91,
  Balcony = 92,
  Basement = 93,
  Den = 96,
  Dining_Room = 97,
  Family_Room = 98,
  Foyer_Entrance_Hall = 99,
  Gaming_Room = 100,
  Home_Gym = 102,
  Home_Office = 103,
  Home_Theatre_Room = 104,
  Laundry_Room = 106,
  Library = 107,
  Living_Room = 108,
  Loft = 109,
  Mud_Room = 110,
  Music_Room = 111,
  Nursery = 112,
  Outdoor = 113,
  Panic_Room = 114,
  Pantry = 115,
  Playroom = 116,
  Porch = 117,
  Shed = 118,
  Storage_Room = 119,
  Sunrooms = 120,
  Walk_in_Closet = 121,
  Wine_Cellar = 122,
  Rent = 123,
  Lease = 124,
  Central_Vacuum = 125,
  Master_Bedroom = 126,
  Master_Bathroom = 127,
  Elevator = 128,
  Stairs = 129,
  Hallway = 130,
  Outdoor_Entrance = 131,
  Foyer = 132,
  Water = 133,
  Gas = 134,
  Internet = 135,
  Phone = 136,
  Electricity = 137,
  Cable = 138,
  Waste = 139,
  Bundle = 140,
  CustomUtility = 141,
}

// Interface for tile data mapping
export interface ITileDataMapping {
  [key: string]: {
    icon: string;
    onClick?: (tile: Tile, navigate?: (path: string) => void) => void;
    title: string;
    order: number;
  };
}

// Interface for a tile
export interface Tile {
  Account_uniqueId: string;
  Active: boolean;
  AvatarImagePath?: string | null;
  CreationTimestamp: string;
  Deleted: boolean;
  Name: string;
  Type: number;
  UniqueId: string;
  UpdateTimestamp: string;
  User_uniqueId: string;
}

// Interface for nested tiles
export interface INestedTile extends Tile {
  children?: INestedTile[];
}

export interface ICalendarItem {
  id: string;
  title: string;
  summary?: string;
  start: string;
  end: string;
  color: string;
  type: string;
  deadlineDateTime?: string;
  Priority?: number;
  Reminder_Each_X_Days?: number;
  Reminder_Each_X_Months?: number;
  Reminder_Each_X_Weeks?: number;
  ImportEventId?: string;
  RecurringFreq?: string;
  BlackListed_Family?: string[];
  HomeMember_uniqueId?: string;
  Active?: boolean;
  UniqueId?: string;
  Deleted?: boolean;
  Delegate_User_uniqueId?: string;
  EventTime_UniqueId?: string;
  isAllDay?: boolean;
  originalDetails?: any;
}

export interface IMenuItem {
  id: string;
  label?: string;
  value?: string;
  icon?: string;
  content: {
    name: string;
    icon?: string | React.ReactNode;
  };
  onPress?: () => void;
}

// Provider type for property detail providers
export type Provider = {
  UniqueId?: string;
  User_uniqueId?: string;
  CreationTimestamp?: string;
  UpdateTimestamp?: string;
  Active?: boolean;
  Deleted?: boolean;
  Account_uniqueId?: string;
  HomeMember_uniqueId?: string;
  Name: string;
  Phone_Number?: string;
  Account_Number?: string;
  AvatarImagePath?: string;
  Website?: string;
  Type?: string;
  Representative?: string;
  TileName: string;
  BillingDueDate?: Date | string;
  RenewalDate?: Date | string;
  MethodOfPayment?: string;
  CardLastFour?: string;
  PayementFreq?: number;
  UtilityTypes?: string;
};
