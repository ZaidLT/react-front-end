/**
 * Icon Mapping System
 *
 * This file maps icon names used in components to their actual file locations.
 * This allows us to handle cases where the icon name in the component doesn't match
 * the actual file name, or when icons could be in different directories.
 */

// Define the structure for our icon mapping
interface IconMapping {
  // The path to the icon relative to src/assets
  path: string;
  // The React component for the icon (will be populated dynamically)
  component?: React.ComponentType<any>;
  // Any special rendering options
  options?: {
    // Whether to use an SVG directly (true) or as an image (false)
    useSvgDirectly?: boolean;
  };
}

// Map of icon names to their file locations
const ICON_MAPPING: Record<string, IconMapping> = {
  // Hive icons
  'task': { path: 'hive-icons/task.svg' },
  'flag': { path: 'hive-icons/flag_circle.svg' },
  'flag-no-circle': { path: 'flag-no-circle.svg' },
  'clock-alarm': { path: 'clock-alarm.svg' },
  'search': { path: 'icons/icon-search.svg' },
  'eeva-logo': { path: 'eeva-logo.svg' },
  'house-icon': { path: 'hive-icons/house.svg' },
  'family-icon': { path: 'hive-icons/family.svg' },

  // Category icons
  'briefcase': { path: 'category-icons/briefcase.svg' },
  'user': { path: 'category-icons/user.svg' },
  'users-category': { path: 'hive-icons/Users.svg' },
  'home-category': { path: 'category-icons/house.svg' },
  'heart-category': { path: 'category-icons/heart.svg' },
  'dollar-sign': { path: 'category-icons/dollar-sign.svg' },
  'map': { path: 'category-icons/map.svg' },
  'shopping-cart': { path: 'category-icons/shopping-cart.svg' },

  // Common icons used in the demo
  'home': { path: 'hive-icons/home.svg' },
  'calendar': { path: 'hive-icons/calendar.svg' },
  'notification': { path: 'hive-icons/notification-bell.svg' },
  'email': { path: 'hive-icons/mail.svg' },
  'phone': { path: 'hive-icons/phone.svg' },
  'lock-icon': { path: 'hive-icons/lock.svg' },

  // Hex icons
  'hex-house': { path: 'icons/hexes/hex-house.svg' },
  'hex-my-hive': { path: 'icons/hexes/hex-my-hive.svg' },
  'hex-eeva-logo': { path: 'icons/hexes/hex-eeva-logo.svg' },

  // Space icons that need direct SVG loading
  'bedroom': { path: 'hive-icons/bedroom.svg' },
  'bathroom': { path: 'hive-icons/bathroom.svg' },
  'kitchen': { path: 'hive-icons/kitchen.svg' },
  'garage': { path: 'hive-icons/garage.svg' },
  'garden': { path: 'hive-icons/garden.svg' },
  'living-room': { path: 'hive-icons/living-room.svg' },
  'laundry-room': { path: 'hive-icons/laundry-room.svg' },
  'outdoor': { path: 'hive-icons/outdoor.svg' },
  'den': { path: 'hive-icons/den.svg' },
  'panic-room': { path: 'hive-icons/panic-room.svg' },
  'playroom': { path: 'hive-icons/playroom.svg' },
  'pool': { path: 'hive-icons/pool.svg' },
  'home-office': { path: 'hive-icons/home-office.svg' },
  'walk-in-closet': { path: 'hive-icons/walk-in-closet.svg' },
  'dining-room': { path: 'hive-icons/dining-room.svg' },
  'foyer': { path: 'hive-icons/foyer.svg' },
  'attic': { path: 'hive-icons/attic.svg' },
  'balcony': { path: 'hive-icons/balcony.svg' },
  'basement': { path: 'hive-icons/basement.svg' },
  'family-room': { path: 'hive-icons/family-room.svg' },
  'gym': { path: 'hive-icons/gym.svg' },
  'home-theater': { path: 'hive-icons/home-theater.svg' },
  'library': { path: 'hive-icons/library.svg' },
  'mud-room': { path: 'hive-icons/mud-room.svg' },
  'music-room': { path: 'hive-icons/music-room.svg' },
  'nursery': { path: 'hive-icons/nursery.svg' },
  'pantry': { path: 'hive-icons/pantry.svg' },
  'porch': { path: 'hive-icons/porch.svg' },
  'shed': { path: 'hive-icons/shed.svg' },
  'storageRoom': { path: 'hive-icons/storageRoom.svg' },
  'sunroom': { path: 'hive-icons/sunroom.svg' },
  'wine-cellar': { path: 'hive-icons/wine-cellar.svg' },
  'loft': { path: 'hive-icons/loft.svg' },
  'spaces': { path: 'hive-icons/spaces.svg' },

  // Contact form icons
  'contact': { path: 'hive-icons/user.svg' },
  'alternate_email': { path: 'hive-icons/alternate_email.svg' },
  'locationAutomation': { path: 'hive-icons/locationAutomation.svg' },
  'cake': { path: 'hive-icons/cake.svg' },
  'userEngagement': { path: 'hive-icons/userEngagement.svg' },
  'edit': { path: 'hive-icons/edit.svg' },
  'edit-pencil': { path: 'hive-icons/editPencil.svg' },
  'edit-pen-paper': { path: 'hive-icons/edit-pen-paper.svg' },
  'bin': { path: 'hive-icons/bin.svg' },
  'bin-lid': { path: 'hive-icons/binLid.svg' },
  'trash': { path: 'hive-icons/bin.svg' },
  'filter': { path: 'hive-icons/filter.svg' },
  'arrowRight': { path: 'hive-icons/arrowRight.svg' },
  'arrowUp': { path: 'hive-icons/ArrowUp.svg' },
  'arrowDown': { path: 'hive-icons/ArrowDown.svg' },
  'back-arrow': { path: 'hive-icons/backArrow.svg' },
  'minus-icon': { path: 'hive-icons/minus.svg' },
  'plus': { path: 'hive-icons/plus.svg' },
  'share': { path: 'hive-icons/share.svg' },
  'camera': { path: 'hive-icons/camera.svg' },
  'upload': { path: 'hive-icons/upload.svg' },
  'download': { path: 'hive-icons/download.svg' },
  'message': { path: 'hive-icons/message.svg' },
  'profile': { path: 'hive-icons/profile.svg' },
  'settings': { path: 'hive-icons/settings.svg' },
  'star': { path: 'hive-icons/star.svg' },
  'heart': { path: 'hive-icons/heart.svg' },
  'clock': { path: 'hive-icons/clock.svg' },
  'location': { path: 'hive-icons/location.svg' },
  'tag': { path: 'hive-icons/tag.svg' },
  'globe': { path: 'hive-icons/globe.svg' },
  'shield': { path: 'hive-icons/shield.svg' },
  'key': { path: 'hive-icons/key.svg' },
  'bulb': { path: 'hive-icons/bulb.svg' },
  'chart': { path: 'hive-icons/chart.svg' },
  'menu': { path: 'hive-icons/menu.svg' },
  'close': { path: 'hive-icons/close.svg' },
  'warning': { path: 'hive-icons/warning.svg' },
  'info': { path: 'hive-icons/info.svg' },
  'success': { path: 'hive-icons/success.svg' },
  'error': { path: 'hive-icons/error.svg' },
  'help': { path: 'hive-icons/help.svg' },
  'question': { path: 'hive-icons/question.svg' },
  'refresh': { path: 'hive-icons/refresh.svg' },
  'sync': { path: 'hive-icons/sync.svg' },
  'cloud': { path: 'hive-icons/cloud.svg' },
  'link': { path: 'hive-icons/link.svg' },
  'attachment': { path: 'hive-icons/attachment.svg' },
  'bookmark': { path: 'hive-icons/bookmark.svg' },
  'print': { path: 'hive-icons/print.svg' },
  'save': { path: 'hive-icons/save.svg' },
  'delete': { path: 'hive-icons/delete.svg' },
  'add': { path: 'hive-icons/add.svg' },
  'remove': { path: 'hive-icons/remove.svg' },
  'view': { path: 'hive-icons/view.svg' },
  'hide': { path: 'hive-icons/hide.svg' },
  'show': { path: 'hive-icons/show.svg' },
  'sort': { path: 'hive-icons/sort.svg' },
  'list': { path: 'hive-icons/list.svg' },
  'grid': { path: 'hive-icons/grid.svg' },
  'table': { path: 'hive-icons/table.svg' },

  // Calendar and Task icons
  'calendar-today': { path: 'hive-icons/calendar-today.svg' },
  'calendar-upcoming': { path: 'hive-icons/calendar-upcoming.svg' },
  'calendar-month': { path: 'hive-icons/calendar-month.svg' },
  'checkmark-circle': { path: 'hive-icons/checkmark-circle.svg' },
  'list-all': { path: 'hive-icons/list-all.svg' },
  'house-icon-alt': { path: 'hive-icons/house-icon.svg' },
  'mail': { path: 'hive-icons/mail.svg' },
  'search-alt': { path: 'hive-icons/search.svg' },

  // Squiggles icons
  'squiggles-bended-arrow': { path: 'hive-icons/squiggles-bended-arrow.svg' },
  'squiggles-bended-arrow-2': { path: 'hive-icons/squiggles-bended-arrow-2.svg' },
  'squiggles-bended-arrow-purple': { path: 'hive-icons/squiggles-bended-arrow-purple.svg' },
  'squiggles-burst': { path: 'hive-icons/squiggles-burst.svg' },
  'squiggles-circles': { path: 'hive-icons/squiggles-circles.svg' },
  'squiggles-horizontal-loops': { path: 'hive-icons/squiggles-horizontal-loops.svg' },
  'squiggles-basic-line': { path: 'hive-icons/squiggles-basic-line.svg' },
  'squiggles-basic-arrow-05': { path: 'hive-icons/squiggles-basic-arrow-05.svg' },
  'squiggles-basic-check-01': { path: 'hive-icons/squiggles-basic-check-01.svg' },

  // Character icons
  'beeva': { path: 'hive-icons/beeva.svg' },
  'beeva-clear': { path: 'hive-icons/beeva-clear.svg' },
  'family-holding-hands': { path: 'hive-icons/family-holding-hands.svg' },
  'dog': { path: 'hive-icons/dog.svg' },
  'three-arrows-bended': { path: 'hive-icons/three-arrows-bended.svg' },
  'polygon': { path: 'hive-icons/polygon.svg' },

  // PlusMenu icons
  'add-task-quick-hive-tile': { path: 'hive-icons/add-task-quick-hive-tile.svg' },
  'add-notes-quick-hive-tile': { path: 'hive-icons/add-notes-quick-hive-tile.svg' },
  'add-docs-quick-hive-tile': { path: 'hive-icons/add-docs-quick-hive-tile.svg' },
  'add-event-quick-hive-tile': { path: 'hive-icons/add-event-quick-hive-tile.svg' },
  'quick-menu-close': { path: 'hive-icons/quick-menu-close.svg' },
  'short-text': { path: 'hive-icons/short-text.svg' },
  'document': { path: 'hive-icons/document.svg' },
  'minus': { path: 'hive-icons/minus.svg' },
  'checkmark': { path: 'hive-icons/checkmark.svg' },
  'lock': { path: 'hive-icons/lock.svg' },
  'users': { path: 'hive-icons/users.svg' },
  'indicator': { path: 'hive-icons/indicator.svg' },

  // Notification icons
  'notification-bell': { path: 'notification-bell.svg' },
  'notification-bell-notice': { path: 'notification-bell-notice.svg' },
};

export default ICON_MAPPING;
