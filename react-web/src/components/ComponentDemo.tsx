'use client';

import React, { useState } from 'react';
// Import core components that are likely to exist
import Button from './Button';
import CustomText from './CustomText';
import HorizontalLine from './HorizontalLine';
import Icon from './Icon';
import LoadingSpinner from './LoadingSpinner';
import Toggle from './Toggle';

// Try to import other components, but handle missing ones gracefully
let FilterPills: any = () => <div>FilterPills component not found</div>;
let FilterChip: any = () => <div>FilterChip component not found</div>;
let EmptyStateCard: any = () => <div>EmptyStateCard component not found</div>;
let UserBasicInfo: any = () => <div>UserBasicInfo component not found</div>;
let QuoteView: any = () => <div>QuoteView component not found</div>;
let Snackbar: any = () => <div>Snackbar component not found</div>;
let DateTimeDisplay: any = () => <div>DateTimeDisplay component not found</div>;
let TabView: any = () => <div>TabView component not found</div>;
let Calendar: any = () => <div>Calendar component not found</div>;
let Modal: any = () => <div>Modal component not found</div>;
let Dropdown: any = () => <div>Dropdown component not found</div>;
let Input: any = () => <div>Input component not found</div>;
let Checkbox: any = () => <div>Checkbox component not found</div>;
let SearchInput: any = () => <div>SearchInput component not found</div>;
let SearchResults: any = () => <div>SearchResults component not found</div>;

// Additional components
let EntryCard: any = () => <div>EntryCard component not found</div>;
let TaskCard: any = () => <div>TaskCard component not found</div>;
let EventCard: any = () => <div>EventCard component not found</div>;
let EventDailyViewCard: any = () => <div>EventDailyViewCard component not found</div>;
let DentCardToggle: any = () => <div>DentCardToggle component not found</div>;
let ProgressBar: any = () => <div>ProgressBar component not found</div>;
let MemberItem: any = () => <div>MemberItem component not found</div>;
let Notification: any = () => <div>Notification component not found</div>;
let ActivityCard: any = () => <div>ActivityCard component not found</div>;
let ProfileItem: any = () => <div>ProfileItem component not found</div>;
let UserAvatarsGroup: any = () => <div>UserAvatarsGroup component not found</div>;
let PlusAdd: any = () => <div>PlusAdd component not found</div>;
let EmptyFullCard: any = () => <div>EmptyFullCard component not found</div>;
let ListViewCard: any = () => <div>ListViewCard component not found</div>;
let GradientText: any = () => <div>GradientText component not found</div>;
let HouseDetailItem: any = () => <div>HouseDetailItem component not found</div>;
let GoogleAddressInput: any = () => <div>GoogleAddressInput component not found</div>;
let DeleteModal: any = () => <div>DeleteModal component not found</div>;
let DeleteTaskModal: any = () => <div>DeleteTaskModal component not found</div>;
let DeleteUtiliyModal: any = () => <div>DeleteUtiliyModal component not found</div>;
let EmptyListViewCard: any = () => <div>EmptyListViewCard component not found</div>;
let DynamicNotificationBell: any = () => <div>DynamicNotificationBell component not found</div>;
let PrioritySelectionView: any = () => <div>PrioritySelectionView component not found</div>;
let HexagonWithImage: any = () => <div>HexagonWithImage component not found</div>;
let DateTimePickerModal: any = () => <div>DateTimePickerModal component not found</div>;
let DuplicateModal: any = () => <div>DuplicateModal component not found</div>;
let DocumentRenameSelectHiveModal: any = () => <div>DocumentRenameSelectHiveModal component not found</div>;
let GoldenTicketEmailModal: any = () => <div>GoldenTicketEmailModal component not found</div>;

let MenuItemAssigneeModal: any = () => <div>MenuItemAssigneeModal component not found</div>;
let MenuItemSelectionModal: any = () => <div>MenuItemSelectionModal component not found</div>;
let ModifyEntityModal: any = () => <div>ModifyEntityModal component not found</div>;
let OverlayModal: any = () => <div>OverlayModal component not found</div>;
let PaymentConfirmationModal: any = () => <div>PaymentConfirmationModal component not found</div>;
let PaywallExportStuffModel: any = () => <div>PaywallExportStuffModel component not found</div>;
let PaywallHeadsupModel: any = () => <div>PaywallHeadsupModel component not found</div>;
let PeopleSelectionModal: any = () => <div>PeopleSelectionModal component not found</div>;
let RenameModal: any = () => <div>RenameModal component not found</div>;
let TextInputsModal: any = () => <div>TextInputsModal component not found</div>;
let UserSelectionModal: any = () => <div>UserSelectionModal component not found</div>;
let OnboardingIntroHome: any = () => <div>OnboardingIntroHome component not found</div>;
let OnboardingIntroLife: any = () => <div>OnboardingIntroLife component not found</div>;
let OnboardingIntroMeetBeeva: any = () => <div>OnboardingIntroMeetBeeva component not found</div>;
let OnboardingIntroPeople: any = () => <div>OnboardingIntroPeople component not found</div>;
let OnboardingIntroTime: any = () => <div>OnboardingIntroTime component not found</div>;
let PlusMenu: any = () => <div>PlusMenu component not found</div>;
let CreateNoteModal: any = () => <div>CreateNoteModal component not found</div>;
let PrivacyMenuItem: any = () => <div>PrivacyMenuItem component not found</div>;
let MenuItemsForLifeTasks: any = () => <div>MenuItemsForLifeTasks component not found</div>;
let Squiggles: any = () => <div>Squiggles component not found</div>;

let AddSubHexModal: any = () => <div>AddSubHexModal component not found</div>;
let AddUtilityModal: any = () => <div>AddUtilityModal component not found</div>;
let BundleItemsSelectionModal: any = () => <div>BundleItemsSelectionModal component not found</div>;
let HouseHiveBlankState: any = () => <div>HouseHiveBlankState component not found</div>;
let UpgradePromotion: any = () => <div>UpgradePromotion component not found</div>;
let MenuHeader: any = () => <div>MenuHeader component not found</div>;
let UserDetailsInfo: any = () => <div>UserDetailsInfo component not found</div>;
let ItemSelectionBox: any = () => <div>ItemSelectionBox component not found</div>;

// Weekly Stats components
let WeeklyStatsCard: any = () => <div>WeeklyStatsCard component not found</div>;
let WeeklyStatsSmallCard: any = () => <div>WeeklyStatsSmallCard component not found</div>;

// Import SVG icons
import { EditIcon, MoreVerticalIcon, ShareIcon, TrashIcon, ProfileIcon } from './SVGIcons';

// Try to import these components
try {
  // Basic components
  FilterPills = require('./FilterPills').default;
  FilterChip = require('./FilterChip').default;
  EmptyStateCard = require('./EmptyStateCard').default;
  UserBasicInfo = require('./UserBasicInfo').default;
  QuoteView = require('./QuoteView').default;
  Snackbar = require('./Snackbar').default;
  DateTimeDisplay = require('./DateTimeDisplay').default;
  TabView = require('./TabView').default;
  Calendar = require('./Calendar').default;
  Modal = require('./Modal').default;
  Dropdown = require('./Dropdown').default;
  Input = require('./Input').default;
  Checkbox = require('./Checkbox').default;
  SearchInput = require('./SearchInput').default;
  SearchResults = require('./SearchResults').default;

  // Additional components
  EntryCard = require('./EntryCard').default;
  TaskCard = require('./TaskCard').default;
  EventCard = require('./EventCard').default;
  EventDailyViewCard = require('./EventDailyViewCard').default;
  DentCardToggle = require('./DentCardToggle').default;
  ProgressBar = require('./ProgressBar').default;
  MemberItem = require('./MemberItem').default;
  Notification = require('./Notification').default;
  ActivityCard = require('./ActivityCard').default;
  ProfileItem = require('./ProfileItem').default;
  UserAvatarsGroup = require('./UserAvatarsGroup').default;
  PlusAdd = require('./PlusAdd').default;
  EmptyFullCard = require('./EmptyFullCard').default;
  ListViewCard = require('./ListViewCard').default;
  GradientText = require('./GradientText').default;
  HouseDetailItem = require('./HouseDetailItem').default;
  GoogleAddressInput = require('./GoogleAddressInput').default;
  DeleteModal = require('./DeleteModal').default;
  DeleteTaskModal = require('./DeleteTaskModal').default;
  DeleteUtiliyModal = require('./DeleteUtiliyModal').default;
  EmptyListViewCard = require('./EmptyListViewCard').default;
  DynamicNotificationBell = require('./DynamicNotificationBell').default;
  PrioritySelectionView = require('./PrioritySelectionView').default;
  HexagonWithImage = require('./HexagonWithImage').default;
  DateTimePickerModal = require('./DateTimePickerModal').default;
  DuplicateModal = require('./DuplicateModal').default;
  DocumentRenameSelectHiveModal = require('./DocumentRenameSelectHiveModal').default;
  GoldenTicketEmailModal = require('./GoldenTicketEmailModal').default;

  MenuItemAssigneeModal = require('./MenuItemAssigneeModal').default;
  MenuItemSelectionModal = require('./MenuItemSelectionModal').default;
  ModifyEntityModal = require('./ModifyEntityModal').default;
  OverlayModal = require('./OverlayModal').default;
  PaymentConfirmationModal = require('./PaymentConfirmationModal').default;
  PaywallExportStuffModel = require('./PaywallExportStuffModel').default;
  PaywallHeadsupModel = require('./PaywallHeadsupModel').default;
  PeopleSelectionModal = require('./PeopleSelectionModal').default;
  RenameModal = require('./RenameModal').default;
  TextInputsModal = require('./TextInputsModal').default;
  UserSelectionModal = require('./UserSelectionModal').default;
  OnboardingIntroHome = require('./OnboardingIntroHome').default;
  OnboardingIntroLife = require('./OnboardingIntroLife').default;
  OnboardingIntroMeetBeeva = require('./OnboardingIntroMeetBeeva').default;
  OnboardingIntroPeople = require('./OnboardingIntroPeople').default;
  OnboardingIntroTime = require('./OnboardingIntroTime').default;
  PlusMenu = require('./PlusMenu').default;
  CreateNoteModal = require('./CreateNoteModal').default;
  PrivacyMenuItem = require('./PrivacyMenuItem').default;
  MenuItemsForLifeTasks = require('./MenuItemsForLifeTasks').default;
  Squiggles = require('./squiggles').default;
  // PillDetail = require('./PillDetail').default;
  // PillDetailDocs = require('./PillDetailDocs').default;
  // PillDetailEvent = require('./PillDetailEvent').default;
  // PillDetailsNote = require('./PillDetailsNote').default;
  // PillDetailsTask = require('./PillDetailsTask').default;
  AddSubHexModal = require('./AddSubHexModal').default;
  AddUtilityModal = require('./AddUtilityModal').default;
  BundleItemsSelectionModal = require('./BundleItemsSelectionModal').default;
  HouseHiveBlankState = require('./HouseHiveBlankState').default;
  UpgradePromotion = require('./UpgradePromotion').default;
  MenuHeader = require('./MenuHeader').default;
  UserDetailsInfo = require('./UserDetailsInfo').default;
  ItemSelectionBox = require('./ItemSelectionBox').default;

  // Weekly Stats components
  WeeklyStatsCard = require('./WeeklyStatsCard').default;
  WeeklyStatsSmallCard = require('./WeeklyStatsSmallCard').default;
} catch (error) {
  console.warn('Some components could not be imported:', error);
}

// Define types for components that need them
type TabItem = {
  key: string;
  title: string;
  content: React.ReactNode;
  badge?: number;
};

import { SearchResultItem } from './SearchResults';

type DropdownOption = {
  value: string;
  label: string;
};
import { Colors } from '../styles';
import { TASK_STATE, IFilterPill, SUB_HIVE, ISnackbar } from '../util/types';

const ComponentDemo: React.FC = () => {
  const [isToggled, setIsToggled] = useState(false);
  const [selectedPill, setSelectedPill] = useState('all');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDateTimePickerModal, setShowDateTimePickerModal] = useState(false);
  const [showAddSubHexModal, setShowAddSubHexModal] = useState(false);
  const [showAddUtilityModal, setShowAddUtilityModal] = useState(false);
  const [showBundleItemsModal, setShowBundleItemsModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [showDeleteUtiliyModal, setShowDeleteUtiliyModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showDocumentRenameModal, setShowDocumentRenameModal] = useState(false);
  const [showGoldenTicketModal, setShowGoldenTicketModal] = useState(false);
  const [utilityTitle, setUtilityTitle] = useState('');
  const [selectedBundleItems, setSelectedBundleItems] = useState<Array<{Name: string, icon: string}>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('tab1');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDropdownValue, setSelectedDropdownValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [showEmptyStateCard, setShowEmptyStateCard] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState(3);

  // New modal states

  const [showMenuItemAssigneeModal, setShowMenuItemAssigneeModal] = useState(false);
  const [showMenuItemSelectionModal, setShowMenuItemSelectionModal] = useState(false);
  const [showModifyEntityModal, setShowModifyEntityModal] = useState(false);
  const [showOverlayModal, setShowOverlayModal] = useState(false);

  // State for MenuItemAssigneeModal
  const [selectedAssignees, setSelectedAssignees] = useState<Array<{id: string, name: string}>>([]);

  // State for MenuItemSelectionModal
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>('');

  // State for ModifyEntityModal
  const [isAllDayActive, setIsAllDayActive] = useState(false);
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dateTimePickerMode, setDateTimePickerMode] = useState<"date" | "time">("date");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isStartTime, setIsStartTime] = useState(true);
  const [reminder, setReminder] = useState(''); // eslint-disable-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [frequency, setFrequency] = useState('');
  const [hideFromPeople, setHideFromPeople] = useState<Array<any>>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showReminderSelectionModal, setShowReminderSelectionModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showFrequencySelectionModal, setShowFrequencySelectionModal] = useState(false);

  // State for OverlayModal
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [codeValue, setCodeValue] = useState('');

  // State for newly converted components
  const [showPaymentConfirmationModal, setShowPaymentConfirmationModal] = useState(false);
  const [showPaywallExportStuffModel, setShowPaywallExportStuffModel] = useState(false);
  const [showPaywallHeadsupModel, setShowPaywallHeadsupModel] = useState(false);
  const [showPeopleSelectionModal, setShowPeopleSelectionModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showTextInputsModal, setShowTextInputsModal] = useState(false);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [renameName, setRenameName] = useState('');

  // State for newly added components
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showCreateNoteModal, setShowCreateNoteModal] = useState(false);
  const [selectedPrivacyOption, setSelectedPrivacyOption] = useState('private');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedLifeTaskFilter, setSelectedLifeTaskFilter] = useState('today');

  // Sample data for components
  const pills: IFilterPill[] = [
    { text: 'All', isSelected: selectedPill === 'all' },
    { text: 'Work', isSelected: selectedPill === 'work' },
    { text: 'Personal', isSelected: selectedPill === 'personal' },
    { text: 'Urgent', isSelected: selectedPill === 'urgent' },
  ];

  // Sample data for AddSubHexModal
  const sampleTiles = [
    { UniqueId: '1', Name: 'Living Room', Type: 8, Deleted: false, Active: true },
    { UniqueId: '2', Name: 'Kitchen', Type: 7, Deleted: false, Active: true },
    { UniqueId: '3', Name: 'Bedroom', Type: 9, Deleted: false, Active: true },
    { UniqueId: '4', Name: 'Bathroom', Type: 12, Deleted: false, Active: true },
    { UniqueId: '5', Name: 'Garage', Type: 14, Deleted: false, Active: true },
  ];

  // Sample data for DocumentRenameSelectHiveModal
  const sampleHives = [
    { id: '1', name: 'Personal' },
    { id: '2', name: 'Work' },
    { id: '3', name: 'Family' },
    { id: '4', name: 'Home' },
    { id: '5', name: 'Travel' },
  ];

  // Sample data for UserSelectionModal
  const sampleUsers = [
    { id: '1', name: 'John Doe', email: 'john.doe@example.com', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: 'Bob Johnson', email: 'bob.johnson@example.com', avatar: 'https://i.pravatar.cc/150?img=3' },
    { id: '4', name: 'Alice Williams', email: 'alice.williams@example.com', avatar: 'https://i.pravatar.cc/150?img=4' },
  ];

  // Sample data for RenameModal
  const sampleSelectedItem = {
    icon: 'home',
    unique_Id: '123',
    title: 'Living Room',
  };

  // Sample data for TextInputsModal
  const sampleInputFields = [
    {
      Icon: () => <Icon name="user" width={24} height={24} color={Colors.BLUE} />,
      placeholder: "Enter your name",
      value: "",
      onChangeText: (text: string) => console.log("Name changed:", text),
      editable: true,
    },
    {
      Icon: () => <Icon name="mail" width={24} height={24} color={Colors.BLUE} />,
      placeholder: "Enter your email",
      value: "",
      onChangeText: (text: string) => console.log("Email changed:", text),
      editable: true,
      keyboardType: "email-address",
    },
    {
      Icon: () => <Icon name="calendar" width={24} height={24} color={Colors.BLUE} />,
      placeholder: "Select a date",
      value: "March 15, 2025",
      isButton: true,
      onPress: () => console.log("Date button pressed"),
    },
  ];

  // Sample data for BundleItemsSelectionModal
  const bundleItems = [
    { Name: 'Refrigerator', icon: 'home' },
    { Name: 'Washing Machine', icon: 'home' },
    { Name: 'Dishwasher', icon: 'home' },
    { Name: 'Microwave', icon: 'home' },
    { Name: 'Oven', icon: 'home' },
  ];

  const searchResults: SearchResultItem[] = [
    {
      id: '1',
      title: 'Team Meeting Notes',
      description: 'Notes from the weekly team meeting',
      type: 'note',
      date: 'Mar 10, 2025',
    },
    {
      id: '2',
      title: 'Project Deadline',
      description: 'Complete the project proposal',
      type: 'task',
      date: 'Mar 15, 2025',
    },
    {
      id: '3',
      title: 'Client Call',
      description: 'Discuss project requirements',
      type: 'event',
      date: 'Mar 12, 2025',
    },
  ];

  const tabs: TabItem[] = [
    { key: 'tab1', title: 'Overview', content: <div>Overview Content</div>, badge: 0 },
    { key: 'tab2', title: 'Details', content: <div>Details Content</div>, badge: 3 },
    { key: 'tab3', title: 'History', content: <div>History Content</div>, badge: 0 },
  ];

  const markedDates = {
    '2025-03-15': { marked: true, dotColor: Colors.BLUE },
    '2025-03-20': { marked: true, dotColor: Colors.RED },
  };

  const dropdownOptions: DropdownOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  const handlePillSelect = (pill: IFilterPill) => {
    setSelectedPill(pill.text.toLowerCase());
  };

  // Create a sample snackbar for demo purposes
  const sampleSnackbar: ISnackbar = {
    id: '1',
    type: 'success',
    message: 'This is a snackbar message',
    duration: 3000
  };

  const handleShowSnackbar = () => {
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Component Demo</h1>
      <p>This page showcases all available components that have been converted from React Native to React Web.</p>
      <p>Last updated: March 12, 2025</p>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Button Component</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            textProps={{ text: 'Primary Button' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => console.log('Button clicked')}
          />
          <Button
            textProps={{ text: 'Secondary Button' }}
            backgroundColor={Colors.WHITE}
            onButtonClick={() => console.log('Secondary button clicked')}
          />
          <Button
            textProps={{ text: 'Disabled Button' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => console.log('Disabled button clicked')}
            disabled={true}
          />
          <Button
            textProps={{ text: 'Loading Button' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => console.log('Loading button clicked')}
            loading={true}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>CustomText Component</h3>
        <CustomText>Default Text</CustomText>
        <CustomText style={{ fontWeight: 'bold', marginTop: '10px' }}>Bold Text</CustomText>
        <CustomText style={{ color: Colors.BLUE, marginTop: '10px' }}>Colored Text</CustomText>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Icon Component</h3>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Icon name="calendar" width={24} height={24} color={Colors.BLUE} />
          <Icon name="search-alt" width={24} height={24} color={Colors.RED} />
          <Icon name="user" width={24} height={24} color={Colors.GREEN} />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>LoadingSpinner Component</h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <LoadingSpinner size={24} color={Colors.BLUE} />
          <LoadingSpinner size={40} color={Colors.RED} />
          <LoadingSpinner size={60} color={Colors.GREEN} borderWidth={6} />
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '20px', background: Colors.BLUE, padding: '20px', borderRadius: '8px' }}>
          <LoadingSpinner size={24} color={Colors.WHITE} transparent={true} />
          <LoadingSpinner size={40} color={Colors.WHITE} transparent={true} />
          <LoadingSpinner size={60} color={Colors.WHITE} borderWidth={6} transparent={true} />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Toggle Component</h3>
        <Toggle
          isActive={isToggled}
        />
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>FilterPills Component</h3>
        <FilterPills
          pills={pills}
          onPillSelected={handlePillSelect}
        />
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>FilterChip Component</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <FilterChip
            label="Work"
            onRemove={() => console.log('Work chip removed')}
          />
          <FilterChip
            label="Personal"
            onRemove={() => console.log('Personal chip removed')}
          />
          <FilterChip
            label="Important"
            onRemove={() => console.log('Important chip removed')}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>EmptyStateCard Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Empty State Card' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowEmptyStateCard(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: EmptyStateCard is a modal component that takes over the full screen.
          </CustomText>
        </div>
        {showEmptyStateCard && (
          <div style={{ position: 'relative' }}>
            <EmptyStateCard onClose={() => setShowEmptyStateCard(false)} />
          </div>
        )}
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>UserBasicInfo Component</h3>
        <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <UserBasicInfo
            name="John Doe"
            avatar="https://i.pravatar.cc/150?img=1"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>QuoteView Component</h3>
        <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <QuoteView
            quote={{
              id: '1',
              attributes: {
                quote: 'The best way to predict the future is to create it.',
                author: 'Peter Drucker',
                location: '',
              }
            }}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Snackbar Component</h3>
        <Button
          textProps={{ text: 'Show Snackbar' }}
          backgroundColor={Colors.BLUE}
          onButtonClick={handleShowSnackbar}
        />
        {showSnackbar && (
          <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
            <Snackbar
              snackbar={sampleSnackbar}
              onClose={() => setShowSnackbar(false)}
            />
          </div>
        )}
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>DateTimeDisplay Component</h3>
        <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <DateTimeDisplay
            deadlineStartDateTime="2025-03-15T09:00:00"
            deadlineEndDateTime="2025-03-15T17:00:00"
            scheduledTime="09:00"
            scheduledTimeEnd="17:00"
            frequency="Weekly"
            reminder="15 minutes before"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>EntryCard Component</h3>
        <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <EntryCard
            id={1}
            title="Meeting Notes"
            description="Notes from the team meeting on project planning"
            isPinned={true}
            isSecure={false}
            members={[{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Smith" }]}
            onClick={() => console.log("Entry card clicked")}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>TaskCard Component</h3>
        <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <TaskCard
            categoryText="Work"
            header="Complete Project Proposal"
            subHeader="Due tomorrow"
            date="Mar 12, 2025"
            state={TASK_STATE.TO_DO}
            priority={1}
            onClick={() => console.log("Task card clicked")}
            changeState={() => console.log("Task state changed")}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>EventCard Component</h3>
        <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <EventCard
            text="Team Standup"
            time="10:00 AM"
            color={Colors.BLUE}
            onPress={() => {}}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>EventDailyViewCard Component</h3>
        <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <EventDailyViewCard
            text="Project Review"
            time="14:00"
            color={Colors.BLUE}
            type="event"
            eventTimeId="123"
            onPress={() => {}}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>DentCardToggle Component</h3>
        <DentCardToggle
          isActive={isToggled}
          setIsActive={setIsToggled}
        />
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>ProgressBar Component</h3>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <CustomText style={{ marginBottom: '5px' }}>Progress: {currentStep} of {totalSteps}</CustomText>
          <ProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', gap: '10px' }}>
            <Button
              textProps={{ text: 'Previous' }}
              backgroundColor={Colors.BLUE}
              onButtonClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep <= 1}
            />
            <Button
              textProps={{ text: 'Next' }}
              backgroundColor={Colors.BLUE}
              onButtonClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
              disabled={currentStep >= totalSteps}
            />
          </div>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>MemberItem Component</h3>
        <MemberItem
          user={{
            FirstName: "John",
            LastName: "Doe",
            Email: "john.doe@example.com",
            AvatarImagePath: "https://i.pravatar.cc/150?img=1"
          }}
          onPress={{
            buttonPress: () => console.log("Member item button pressed")
          }}
        />
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Notification Component</h3>
        <Notification
          body="You have a new message from Jane"
          type={"message" as any}
          subHive={SUB_HIVE.DOG}
          date="2 minutes ago"
          isUnread={true}
        />
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>ActivityCard Component</h3>
        <ActivityCard
          heading="Project Update"
          name="Jane Smith"
          initials="JS"
          avatar="https://i.pravatar.cc/150?img=2"
          time="10:30 AM"
          date="Mar 12, 2025"
        />
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>ProfileItem Component</h3>
        <ProfileItem
          content={{
            icon: () => <Icon name="settings" width={24} height={24} color={Colors.GREY_COLOR} />,
            value: "Account Settings"
          }}
          editingEnabled={false}
          onPress={() => console.log("Profile item pressed")}
        />
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>UserAvatarsGroup Component</h3>
        <UserAvatarsGroup
          users={[
            { FirstName: "John", LastName: "Doe", AvatarImagePath: "https://i.pravatar.cc/150?img=1" },
            { FirstName: "Jane", LastName: "Smith", AvatarImagePath: "https://i.pravatar.cc/150?img=2" },
            { FirstName: "Bob", LastName: "Johnson", AvatarImagePath: "https://i.pravatar.cc/150?img=3" },
          ]}
          size={3}
        />
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>PlusAdd Component</h3>
        <PlusAdd color={Colors.BLUE} size={24} />
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>SearchInput Component</h3>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for anything..."
          autoFocus={false}
          style={{ maxWidth: '400px' }}
        />
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>SearchResults Component</h3>
        <div style={{ maxWidth: '400px' }}>
          <SearchResults
            results={searchResults}
            onResultPress={(item: SearchResultItem) => console.log("Search result pressed:", item)}
            isLoading={false}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>TabView Component</h3>
        <div style={{ maxWidth: '600px', border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <TabView
            tabs={tabs}
            initialTab={selectedTab}
            onTabChange={setSelectedTab}
          />
          <div style={{ padding: '20px', border: '1px solid #eee', borderTop: 'none' }}>
            {selectedTab === 'tab1' && <div>Overview Content</div>}
            {selectedTab === 'tab2' && <div>Details Content</div>}
            {selectedTab === 'tab3' && <div>History Content</div>}
          </div>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Calendar Component</h3>
        <div style={{ maxWidth: '400px', border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            markedDates={markedDates}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Modal Component</h3>
        <Button
          textProps={{ text: 'Open Modal' }}
          backgroundColor={Colors.BLUE}
          onButtonClick={() => setShowModal(true)}
        />
        <div style={{ position: 'relative' }}>
          <Modal
            isVisible={showModal}
            onClose={() => setShowModal(false)}
            title="Modal Title"
          >
            <div style={{ padding: '20px' }}>
              <CustomText>This is the modal content</CustomText>
              <div style={{ marginTop: '20px' }}>
                <Button
                  textProps={{ text: 'Close' }}
                  backgroundColor={Colors.BLUE}
                  onButtonClick={() => setShowModal(false)}
                />
              </div>
            </div>
          </Modal>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Dropdown Component</h3>
        <div style={{ maxWidth: '400px', border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <Dropdown
            options={dropdownOptions}
            selectedValue={selectedDropdownValue}
            onChange={setSelectedDropdownValue}
            placeholder="Select an option"
            label="Dropdown Example"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Input Component</h3>
        <div style={{ maxWidth: '400px', border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <Input
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Enter text here"
            label="Input Example"
            icon={<Icon name="search" width={18} height={18} color={Colors.GREY_COLOR} />}
            iconPosition="right"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Checkbox Component</h3>
        <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <Checkbox
            checked={isChecked}
            onChange={setIsChecked}
            label="I agree to the terms and conditions"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>EmptyFullCard Component</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <EmptyFullCard
            heading="Complete React Web App"
            text="Implement all components and features for the Eeva React Web application"
            onPress={() => console.log('Clicked on EmptyFullCard')}
          />
          <EmptyFullCard
            heading="Team Meeting"
            text="Discuss project progress and next steps with the development team"
            onPress={() => console.log('Clicked on second EmptyFullCard')}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>ListViewCard Component</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
          <ListViewCard
            nameNote="Complete React Web Conversion"
            description="High priority task for the web application"
            type="Task"
            priority={1}
            item={{
              Active: false,
              created: new Date().toISOString()
            }}
            onPress={() => console.log('Clicked on ListViewCard')}
            toggleOptions={{
              text: {
                activeText: 'Completed',
                inactiveText: 'To Do'
              },
              color: {
                activeColor: Colors.GREEN,
                inactiveColor: Colors.BLUE
              }
            }}
          />
          <ListViewCard
            nameNote="Team Meeting"
            description="Project update with the development team"
            type="Event"
            priority={3}
            item={{
              Active: false,
              created: new Date(Date.now() + 86400000).toISOString() // Tomorrow
            }}
            onPress={() => console.log('Clicked on second ListViewCard')}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>GradientText Component</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <GradientText
            text="Gradient Text Example"
            colors={[Colors.BLUE, Colors.PURPLE]}
            fontSize={24}
          />
          <GradientText
            text="Multi-Color Gradient"
            colors={[Colors.RED, Colors.ORANGE, Colors.ROYAL_BLUE, Colors.PISTACHIO_GREEN, Colors.BLUE, Colors.PURPLE]}
            fontSize={20}
          />
          <GradientText
            text="Custom Styling"
            colors={[Colors.SECONDARY_PURPLE, Colors.BLUE]}
            fontSize={28}
            fontWeight="bold"
            style={{ letterSpacing: '1px' }}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>HouseDetailItem Component</h3>
        <div style={{ maxWidth: '400px', border: `1px solid ${Colors.LIGHT_GREY}`, borderRadius: '8px', padding: '15px' }}>
          <HouseDetailItem
            content={{
              icon: <Icon name="house-icon" width={24} height={24} color={Colors.GREY_COLOR} />,
              value: "123 Main Street",
              onChange: (value: string) => console.log("Address changed:", value)
            }}
            editingEnabled={true}
            placeholder="Address"
          />
          <HouseDetailItem
            content={{
              icon: <Icon name="location" width={24} height={24} color={Colors.GREY_COLOR} />,
              value: "New York",
              onChange: (value: string) => console.log("City changed:", value)
            }}
            editingEnabled={true}
            placeholder="City"
          />
          <HouseDetailItem
            content={{
              icon: <Icon name="calendar" width={24} height={24} color={Colors.GREY_COLOR} />,
              value: "2010",
              onChange: (value: string) => console.log("Year built changed:", value)
            }}
            editingEnabled={false}
            placeholder="Year Built"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>GoogleAddressInput Component</h3>
        <div style={{ maxWidth: '400px', border: `1px solid ${Colors.LIGHT_GREY}`, borderRadius: '8px', padding: '15px' }}>
          <CustomText style={{ marginBottom: '10px' }}>
            Note: This component requires a Google Places API key to function properly.
            The demo shows the UI structure but may not be fully functional.
          </CustomText>
          <GoogleAddressInput
            content={{
              icon: <Icon name="location" width={24} height={24} color={Colors.GREY_COLOR} />,
              value: "",
              onChange: (value: string) => console.log("Address changed:", value)
            }}
            editingEnabled={true}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>DeleteModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Delete Modal' }}
            backgroundColor={Colors.RACING_RED}
            onButtonClick={() => setShowDeleteModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: DeleteModal is a confirmation dialog for delete actions.
          </CustomText>
          <DeleteModal
            isVisible={showDeleteModal}
            onRequestClose={() => setShowDeleteModal(false)}
            onDelete={() => {
              console.log("Item deleted");
              setShowDeleteModal(false);
            }}
            category="task"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>DeleteTaskModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Delete Task Modal' }}
            backgroundColor={Colors.RACING_RED}
            onButtonClick={() => setShowDeleteTaskModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: DeleteTaskModal is a specialized confirmation dialog for deleting tasks.
          </CustomText>
          <DeleteTaskModal
            isVisible={showDeleteTaskModal}
            onRequestClose={() => setShowDeleteTaskModal(false)}
            onDelete={() => {
              console.log("Task deleted");
              setShowDeleteTaskModal(false);
            }}
            taskName="Complete Project Proposal"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>DeleteUtiliyModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Delete Utility Modal' }}
            backgroundColor={Colors.RACING_RED}
            onButtonClick={() => setShowDeleteUtiliyModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: DeleteUtiliyModal is a specialized confirmation dialog for deleting utilities.
          </CustomText>
          <DeleteUtiliyModal
            isVisible={showDeleteUtiliyModal}
            onRequestClose={() => setShowDeleteUtiliyModal(false)}
            onDelete={() => {
              console.log("Utility deleted");
              setShowDeleteUtiliyModal(false);
            }}
            utilityName="Air Conditioner"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>EmptyListViewCard Component</h3>
        <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
          <EmptyListViewCard />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>DynamicNotificationBell Component</h3>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <CustomText style={{ marginBottom: '10px' }}>Regular Bell:</CustomText>
            <DynamicNotificationBell isAlert={false} size={30} />
          </div>
          <div>
            <CustomText style={{ marginBottom: '10px' }}>Alert Bell:</CustomText>
            <DynamicNotificationBell isAlert={true} size={30} />
          </div>
          <div>
            <CustomText style={{ marginBottom: '10px' }}>Custom Color:</CustomText>
            <DynamicNotificationBell isAlert={true} size={30} color={Colors.RACING_RED} />
          </div>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>PrioritySelectionView Component</h3>
        <div style={{ maxWidth: '600px', border: `1px solid ${Colors.LIGHT_GREY}`, borderRadius: '8px', padding: '15px' }}>
          <PrioritySelectionView
            currentPriority={selectedPriority}
            onSelect={(priority: number) => {
              setSelectedPriority(priority);
              console.log(`Selected priority: ${priority}`);
            }}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Selected Priority: {selectedPriority} ({selectedPriority === 0 ? 'None' :
                                                  selectedPriority === 1 ? 'Low' :
                                                  selectedPriority === 2 ? 'Medium' : 'High'})
          </CustomText>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>HexagonWithImage Component</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <CustomText style={{ marginBottom: '10px', textAlign: 'center' }}>With Image</CustomText>
            <HexagonWithImage
              size={100}
              imageUrl="https://via.placeholder.com/150"
              borderColor={Colors.BLUE}
              borderWidth={2}
              onClick={() => console.log("Hexagon clicked")}
            />
          </div>
          <div>
            <CustomText style={{ marginBottom: '10px', textAlign: 'center' }}>With Children</CustomText>
            <HexagonWithImage
              size={100}
              backgroundColor={Colors.LIGHT_GREY}
              borderColor={Colors.BLUE}
              borderWidth={2}
            >
              <Icon name="house-icon" width={40} height={40} color={Colors.BLUE} />
            </HexagonWithImage>
          </div>
          <div>
            <CustomText style={{ marginBottom: '10px', textAlign: 'center' }}>Custom Colors</CustomText>
            <HexagonWithImage
              size={100}
              backgroundColor={Colors.SECONDARY_PURPLE}
              borderColor={Colors.BLUE}
              borderWidth={3}
            >
              <CustomText style={{ color: Colors.SECONDARY_PURPLE, fontWeight: 'bold' }}>Hex</CustomText>
            </HexagonWithImage>
          </div>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>DateTimePickerModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Date & Time Picker' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowDateTimePickerModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Selected Date & Time: {selectedDate.toLocaleString()}
          </CustomText>
          <DateTimePickerModal
            isVisible={showDateTimePickerModal}
            onClose={() => setShowDateTimePickerModal(false)}
            onConfirm={(date: Date) => {
              setSelectedDate(date);
              console.log(`Selected date: ${date}`);
            }}
            initialDate={selectedDate}
            mode="datetime"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>AddSubHexModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Add Sub Hex Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowAddSubHexModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: AddSubHexModal allows users to create a new sub-hex item by selecting a type and giving it a name.
          </CustomText>
          <div style={{ position: 'relative' }}>
            <AddSubHexModal
              isVisible={showAddSubHexModal}
              onRequestClose={() => setShowAddSubHexModal(false)}
              category="space"
              tiles={sampleTiles}
              onSave={async (tile: any, name: string) => {
                console.log(`New sub-hex created: ${name} (type: ${tile.Type})`);
                setShowAddSubHexModal(false);
              }}
            />
          </div>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>AddUtilityModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Add Utility Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowAddUtilityModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: AddUtilityModal allows users to add a new utility with an optional name.
          </CustomText>
          <CustomText style={{ marginTop: '5px', color: Colors.GREY_COLOR }}>
            {utilityTitle ? `Utility Name: ${utilityTitle}` : 'No utility name set'}
          </CustomText>
          <div style={{ position: 'relative' }}>
            <AddUtilityModal
              isVisible={showAddUtilityModal}
              onRequestClose={() => {
                console.log(`Utility added with name: ${utilityTitle}`);
                setShowAddUtilityModal(false);
              }}
              onCancelClose={() => {
                setShowAddUtilityModal(false);
                setUtilityTitle('');
              }}
              title={utilityTitle}
              setTitle={setUtilityTitle}
              icon="home"
            />
          </div>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>BundleItemsSelectionModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Bundle Items Selection Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowBundleItemsModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: BundleItemsSelectionModal allows users to select multiple items to bundle together.
          </CustomText>
          <CustomText style={{ marginTop: '5px', color: Colors.GREY_COLOR }}>
            Selected Items: {selectedBundleItems.length > 0
              ? selectedBundleItems.map(item => item.Name).join(', ')
              : 'None'}
          </CustomText>
          <div style={{ position: 'relative' }}>
            <BundleItemsSelectionModal
              isVisible={showBundleItemsModal}
              onRequestClose={() => {
                console.log('Bundle items selected:', selectedBundleItems);
                setShowBundleItemsModal(false);
              }}
              handleBackPress={() => {
                setSelectedBundleItems([]);
                setShowBundleItemsModal(false);
              }}
              tiles={bundleItems}
              selectedItems={selectedBundleItems}
              setSelectedItems={setSelectedBundleItems}
            />
          </div>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>MenuHeader Component</h3>
        <div style={{ border: `1px solid ${Colors.LIGHT_GREY}`, borderRadius: '8px', padding: '15px' }}>
          <MenuHeader
            backButton={{ show: true }}
            title="Menu Header Example"
            rightButtons={[
              {
                key: "edit",
                icon: <EditIcon width={24} height={24} color={Colors.BLUE} />,
                text: "Edit",
                onPress: () => console.log("Edit button pressed"),
              },
              {
                key: "menu",
                icon: <MoreVerticalIcon width={24} height={24} color={Colors.BLUE} />,
                isMenu: true,
              },
            ]}
            menuOptions={[
              {
                title: "Share",
                onPress: () => console.log("Share option selected"),
                icon: <ShareIcon width={20} height={20} color={Colors.BLUE} />,
              },
              {
                title: "Delete",
                onPress: () => console.log("Delete option selected"),
                icon: <TrashIcon width={20} height={20} color={Colors.RED} />,
              },
            ]}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>DuplicateModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Duplicate Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowDuplicateModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: DuplicateModal is a confirmation dialog for duplicating items.
          </CustomText>
          <DuplicateModal
            isVisible={showDuplicateModal}
            onRequestClose={() => setShowDuplicateModal(false)}
            onDuplicate={() => {
              console.log("Item duplicated");
              setShowDuplicateModal(false);
            }}
            itemName="Project Proposal"
            itemType="document"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>DocumentRenameSelectHiveModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Document Rename Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowDocumentRenameModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: DocumentRenameSelectHiveModal allows users to rename a document and select a hive.
          </CustomText>
          <DocumentRenameSelectHiveModal
            isVisible={showDocumentRenameModal}
            onRequestClose={() => setShowDocumentRenameModal(false)}
            onSave={(newName: string, selectedHiveId: string) => {
              console.log(`Document renamed to: ${newName}, moved to hive: ${selectedHiveId}`);
              setShowDocumentRenameModal(false);
            }}
            documentName="Project Proposal.pdf"
            documentId="doc-123"
            hives={sampleHives}
            currentHiveId="2"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>GoldenTicketEmailModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Golden Ticket Email Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowGoldenTicketModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: GoldenTicketEmailModal allows users to send golden ticket invitations.
          </CustomText>
          <GoldenTicketEmailModal
            isVisible={showGoldenTicketModal}
            onRequestClose={() => setShowGoldenTicketModal(false)}
            onSend={(email: string) => {
              console.log(`Golden ticket sent to: ${email}`);
              setShowGoldenTicketModal(false);
            }}
            remainingInvites={3}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>UserDetailsInfo Component</h3>
        <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <UserDetailsInfo
            icon={({ width, height }: { width?: number, height?: number }) => <ProfileIcon width={width || 24} height={height || 24} color={Colors.BLUE} />}
            value="john.doe@example.com"
            copyable={true}
          />
          <UserDetailsInfo
            icon={({ width, height }: { width?: number, height?: number }) => <ProfileIcon width={width || 24} height={height || 24} color={Colors.BLUE} />}
            value="+1 (555) 123-4567"
            editable={true}
            changeValue={(value: string) => console.log("Phone number changed:", value)}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>ItemSelectionBox Component</h3>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <CustomText style={{ marginBottom: '10px' }}>Unselected:</CustomText>
            <ItemSelectionBox
              isSelected={false}
              onChange={(selected: boolean) => console.log("Selection changed:", selected)}
            />
          </div>
          <div>
            <CustomText style={{ marginBottom: '10px' }}>Selected:</CustomText>
            <ItemSelectionBox
              isSelected={true}
              onChange={(selected: boolean) => console.log("Selection changed:", selected)}
            />
          </div>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>HouseHiveBlankState Component</h3>
        <div style={{ maxWidth: '500px', border: `1px solid ${Colors.LIGHT_GREY}`, borderRadius: '8px', padding: '15px' }}>
          <HouseHiveBlankState
            heading="No Houses Added Yet"
            subHeading="Add your first house to start organizing your home"
            iconName="house-icon-alt"
            buttonText="Add House"
            onButtonPress={() => console.log("Add house button pressed")}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>UpgradePromotion Component</h3>
        <UpgradePromotion onPress={() => console.log("Upgrade promotion clicked")} />
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>PaymentConfirmationModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Payment Confirmation Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowPaymentConfirmationModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: PaymentConfirmationModal is a modal for confirming subscription payments.
          </CustomText>
          <PaymentConfirmationModal
            isVisible={showPaymentConfirmationModal}
            onRequestClose={() => setShowPaymentConfirmationModal(false)}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>PaywallExportStuffModel Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Paywall Export Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowPaywallExportStuffModel(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: PaywallExportStuffModel is a modal for exporting user data.
          </CustomText>
          <PaywallExportStuffModel
            isVisible={showPaywallExportStuffModel}
            onRequestClose={() => setShowPaywallExportStuffModel(false)}
            title="Export Your Data"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>PaywallHeadsupModel Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Paywall Headsup Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowPaywallHeadsupModel(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: PaywallHeadsupModel is a modal for subscription expiration warnings.
          </CustomText>
          <PaywallHeadsupModel
            isVisible={showPaywallHeadsupModel}
            onRequestClose={() => setShowPaywallHeadsupModel(false)}
            title="Subscription Ending"
            onConfirmationPress={() => {
              console.log("User confirmed understanding");
              setShowPaywallHeadsupModel(false);
            }}
            onExportPress={() => {
              console.log("User wants to export data");
              setShowPaywallHeadsupModel(false);
              setShowPaywallExportStuffModel(true);
            }}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>PeopleSelectionModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show People Selection Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowPeopleSelectionModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: PeopleSelectionModal is a modal for selecting people from contacts.
          </CustomText>
          <PeopleSelectionModal
            isVisible={showPeopleSelectionModal}
            onRequestClose={() => setShowPeopleSelectionModal(false)}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>RenameModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Rename Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowRenameModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: RenameModal is a modal for renaming items.
          </CustomText>
          <RenameModal
            isVisible={showRenameModal}
            onRequestClose={() => setShowRenameModal(false)}
            category="space"
            selectedItem={sampleSelectedItem}
            name={renameName}
            setName={setRenameName}
            heading="Rename Space"
            subheading="Give your space a new name"
            icon="home"
            onPress={() => {
              console.log(`Space renamed to: ${renameName}`);
              setShowRenameModal(false);
            }}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>TextInputsModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Text Inputs Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowTextInputsModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: TextInputsModal is a modal with multiple text input fields.
          </CustomText>
          <TextInputsModal
            isVisible={showTextInputsModal}
            onRequestClose={() => setShowTextInputsModal(false)}
            headerText="Enter Information"
            fields={sampleInputFields}
            submit={() => {
              console.log("Form submitted");
              setShowTextInputsModal(false);
            }}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>UserSelectionModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show User Selection Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowUserSelectionModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: UserSelectionModal is a modal for selecting users.
          </CustomText>
          <UserSelectionModal
            isVisible={showUserSelectionModal}
            onRequestClose={() => setShowUserSelectionModal(false)}
            onUserSelect={(userId: string) => {
              console.log(`User selected: ${userId}`);
              setShowUserSelectionModal(false);
            }}
            users={sampleUsers}
            title="Select a Team Member"
            description="Choose a team member to assign this task to"
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />



      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>MenuItemAssigneeModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Menu Item Assignee Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowMenuItemAssigneeModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: MenuItemAssigneeModal allows users to select assignees from a list.
          </CustomText>
          <CustomText style={{ marginTop: '5px', color: Colors.GREY_COLOR }}>
            Selected Assignees: {selectedAssignees.length > 0
              ? selectedAssignees.map(item => item.name).join(', ')
              : 'None'}
          </CustomText>
          <MenuItemAssigneeModal
            isVisible={showMenuItemAssigneeModal}
            onRequestClose={() => setShowMenuItemAssigneeModal(false)}
            title="Select Assignees"
            items={[
              {
                content: { id: '1', name: 'John Doe' },
                index: 0
              },
              {
                content: { id: '2', name: 'Jane Smith' },
                index: 1
              },
              {
                content: { id: '3', name: 'Bob Johnson' },
                index: 2
              },
            ]}
            selectedValues={selectedAssignees}
            handleItemPress={(value: { id: string, name: string, email: string, avatar?: string }) => {
              const exists = selectedAssignees.some(item => item.id === value.id);
              if (exists) {
                setSelectedAssignees(selectedAssignees.filter(item => item.id !== value.id));
              } else {
                setSelectedAssignees([...selectedAssignees, value]);
              }
            }}
            isApply={true}
            onSaveRequest={(values: Array<{ id: string, name: string, email: string, avatar?: string }>) => {
              console.log('Selected assignees:', values);
              setShowMenuItemAssigneeModal(false);
            }}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>MenuItemSelectionModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Menu Item Selection Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowMenuItemSelectionModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: MenuItemSelectionModal allows users to select an item from a menu.
          </CustomText>
          <CustomText style={{ marginTop: '5px', color: Colors.GREY_COLOR }}>
            Selected Item: {selectedMenuItem || 'None'}
          </CustomText>
          <MenuItemSelectionModal
            isVisible={showMenuItemSelectionModal}
            onRequestClose={() => setShowMenuItemSelectionModal(false)}
            title="Select an Option"
            items={[
              {
                content: { name: 'Option 1' },
                index: 0,
                onPress: async (name: string) => console.log(`Selected ${name}`)
              },
              {
                content: { name: 'Option 2' },
                index: 1,
                onPress: async (name: string) => console.log(`Selected ${name}`)
              },
              {
                content: { name: 'Option 3' },
                index: 2,
                onPress: async (name: string) => console.log(`Selected ${name}`)
              },
            ]}
            selectedItem={selectedMenuItem}
            isApply={true}
            selectedValue={selectedMenuItem}
            setSelectedValue={setSelectedMenuItem}
            onSaveRequest={(value: string) => {
              console.log('Selected item:', value);
              setShowMenuItemSelectionModal(false);
            }}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>ModifyEntityModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Modify Entity Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowModifyEntityModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: ModifyEntityModal allows users to modify entity properties such as priority, date/time, etc.
          </CustomText>
          <ModifyEntityModal
            isOpen={showModifyEntityModal}
            onRequestClose={() => setShowModifyEntityModal(false)}
            actionButtons={[
              {
                textProps: {
                  text: 'Cancel',
                  color: Colors.BLUE,
                },
                backgroundColor: Colors.WHITE,
                borderProps: {
                  color: Colors.BLUE,
                },
                onPress: () => setShowModifyEntityModal(false),
              },
              {
                textProps: {
                  text: 'Save',
                  color: Colors.WHITE,
                },
                backgroundColor: Colors.BLUE,
                borderProps: {
                  color: Colors.BLUE,
                },
                onPress: () => {
                  console.log('Entity saved');
                  setShowModifyEntityModal(false);
                },
              },
            ]}
            selectedHives={[{ Name: 'Home', Type: 'space' }]}
            selectedHive={{ Name: 'Home', Type: 'space' }}
            priority={selectedPriority}
            setPriority={setSelectedPriority}
            peopleInvolved={[
              { FirstName: 'John', LastName: 'Doe', AvatarImagePath: 'https://i.pravatar.cc/150?img=1' },
            ]}
            date={selectedDate}
            dateEnd={selectedDate}
            startTime={new Date(selectedDate.setHours(9, 0, 0))}
            endTime={new Date(selectedDate.setHours(10, 0, 0))}
            setDateTimePickerMode={setDateTimePickerMode}
            setDateTimePickerVisible={setDateTimePickerVisible}
            setIsStartTime={setIsStartTime}
            isAllDayActive={isAllDayActive}
            setIsAllDayActive={setIsAllDayActive}
            reminder={reminder}
            setShowReminderSelectionModal={setShowReminderSelectionModal}
            frequency={frequency}
            setShowFrequencySelectionModal={setShowFrequencySelectionModal}
            isPrivacyEnabled={isPrivacyEnabled}
            setIsPrivacyEnabled={setIsPrivacyEnabled}
            hideFromPeople={hideFromPeople}
            setHideFromPeople={setHideFromPeople}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>OverlayModal Component</h3>
        <div>
          <Button
            textProps={{ text: 'Show Overlay Modal' }}
            backgroundColor={Colors.BLUE}
            onButtonClick={() => setShowOverlayModal(true)}
          />
          <CustomText style={{ marginTop: '10px', color: Colors.GREY_COLOR }}>
            Note: OverlayModal is a versatile modal with various content options.
          </CustomText>
          <OverlayModal
            isVisible={showOverlayModal}
            onRequestClose={() => setShowOverlayModal(false)}
            headerText="Overlay Modal Example"
            descriptionText="This is a versatile modal that can display various types of content."
            items={['Option 1', 'Option 2', 'Option 3']}
            selected={selectedMenuItem}
            onSelect={(item: string) => {
              setSelectedMenuItem(item);
              console.log(`Selected ${item}`);
            }}
            actionButtons={[
              {
                textProps: {
                  text: 'Cancel',
                  color: Colors.BLUE,
                },
                backgroundColor: Colors.WHITE,
                borderProps: {
                  color: Colors.BLUE,
                },
                onPress: () => setShowOverlayModal(false),
              },
              {
                textProps: {
                  text: 'Confirm',
                  color: Colors.WHITE,
                },
                backgroundColor: Colors.BLUE,
                borderProps: {
                  color: Colors.BLUE,
                },
                onPress: () => {
                  console.log('Confirmed');
                  setShowOverlayModal(false);
                },
              },
            ]}
          />
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>PillDetail Components</h3>
        <CustomText style={{ marginBottom: '20px' }}>
          The PillDetail components are used to display detailed information about different types of items.
          Below are examples of each type of PillDetail component.
        </CustomText>

        {/* Pill Detail components are not fully implemented yet */}
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>PillDetail Components</h4>
          <CustomText>These components are still being converted from React Native to React Web.</CustomText>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      {/* Newly Converted Modal Components */}
      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Newly Converted Modal Components</h3>
        <CustomText style={{ marginBottom: '20px' }}>
          These components have been recently converted from React Native to React Web.
        </CustomText>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>PaymentConfirmationModal</h4>
          <div>
            <Button
              textProps={{ text: 'Show Payment Confirmation Modal' }}
              backgroundColor={Colors.BLUE}
              onButtonClick={() => setShowPaymentConfirmationModal(true)}
            />
            <PaymentConfirmationModal
              isVisible={showPaymentConfirmationModal}
              onRequestClose={() => setShowPaymentConfirmationModal(false)}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>PaywallExportStuffModel</h4>
          <div>
            <Button
              textProps={{ text: 'Show Paywall Export Stuff Modal' }}
              backgroundColor={Colors.BLUE}
              onButtonClick={() => setShowPaywallExportStuffModel(true)}
            />
            <PaywallExportStuffModel
              title="Export Your Data"
              isVisible={showPaywallExportStuffModel}
              onRequestClose={() => setShowPaywallExportStuffModel(false)}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>PaywallHeadsupModel</h4>
          <div>
            <Button
              textProps={{ text: 'Show Paywall Headsup Modal' }}
              backgroundColor={Colors.BLUE}
              onButtonClick={() => setShowPaywallHeadsupModel(true)}
            />
            <PaywallHeadsupModel
              title="Subscription Expiring"
              isVisible={showPaywallHeadsupModel}
              onRequestClose={() => setShowPaywallHeadsupModel(false)}
              onConfirmationPress={() => {
                console.log('User understands');
                setShowPaywallHeadsupModel(false);
              }}
              onExportPress={() => {
                console.log('User wants to export data');
                setShowPaywallExportStuffModel(true);
                setShowPaywallHeadsupModel(false);
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>PeopleSelectionModal</h4>
          <div>
            <Button
              textProps={{ text: 'Show People Selection Modal' }}
              backgroundColor={Colors.BLUE}
              onButtonClick={() => setShowPeopleSelectionModal(true)}
            />
            <PeopleSelectionModal
              isVisible={showPeopleSelectionModal}
              onRequestClose={() => setShowPeopleSelectionModal(false)}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>RenameModal</h4>
          <div>
            <Button
              textProps={{ text: 'Show Rename Modal' }}
              backgroundColor={Colors.BLUE}
              onButtonClick={() => setShowRenameModal(true)}
            />
            <RenameModal
              isVisible={showRenameModal}
              category="space"
              onRequestClose={() => setShowRenameModal(false)}
              selectedItem={{
                icon: "home",
                unique_Id: "space-123",
                title: "Living Room"
              }}
              onPress={() => {
                console.log('Name saved:', renameName);
                setShowRenameModal(false);
              }}
              setName={setRenameName}
              name={renameName}
              heading="Rename Space"
              subheading="Enter a new name for this space"
              icon="home"
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>TextInputsModal</h4>
          <div>
            <Button
              textProps={{ text: 'Show Text Inputs Modal' }}
              backgroundColor={Colors.BLUE}
              onButtonClick={() => setShowTextInputsModal(true)}
            />
            <TextInputsModal
              isVisible={showTextInputsModal}
              onRequestClose={() => setShowTextInputsModal(false)}
              headerText="Text Inputs Example"
              fields={[
                {
                  Icon: () => (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="black"/>
                    </svg>
                  ),
                  placeholder: "Enter your name",
                  value: "",
                  onChangeText: (text: string) => console.log("Name:", text),
                  editable: true
                },
                {
                  Icon: () => (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="black"/>
                    </svg>
                  ),
                  placeholder: "Enter your email",
                  value: "",
                  onChangeText: (text: string) => console.log("Email:", text),
                  editable: true,
                  keyboardType: "email-address"
                }
              ]}
              submit={() => {
                console.log('Form submitted');
                setShowTextInputsModal(false);
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>UserSelectionModal</h4>
          <div>
            <Button
              textProps={{ text: 'Show User Selection Modal' }}
              backgroundColor={Colors.BLUE}
              onButtonClick={() => setShowUserSelectionModal(true)}
            />
            <UserSelectionModal
              isVisible={showUserSelectionModal}
              onRequestClose={() => setShowUserSelectionModal(false)}
              users={[
                {
                  id: "user-1",
                  name: "John Doe",
                  email: "john.doe@example.com",
                  avatar: "https://randomuser.me/api/portraits/men/1.jpg"
                },
                {
                  id: "user-2",
                  name: "Jane Smith",
                  email: "jane.smith@example.com",
                  avatar: "https://randomuser.me/api/portraits/women/2.jpg"
                },
                {
                  id: "user-3",
                  name: "Bob Johnson",
                  email: "bob.johnson@example.com"
                }
              ]}
              onUserSelect={(userId: string) => {
                console.log('Selected user ID:', userId);
                setShowUserSelectionModal(false);
              }}
              title="Select a User"
              description="Choose a user from the list below"
            />
          </div>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Newly Converted Components</h3>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>OnboardingIntroHome</h4>
          <div style={{ backgroundColor: Colors.BLUE, padding: '20px', borderRadius: '10px' }}>
            <OnboardingIntroHome />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>OnboardingIntroLife</h4>
          <div style={{ backgroundColor: Colors.BLUE, padding: '20px', borderRadius: '10px' }}>
            <OnboardingIntroLife />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>OnboardingIntroMeetBeeva</h4>
          <div style={{ backgroundColor: Colors.BLUE, padding: '20px', borderRadius: '10px' }}>
            <OnboardingIntroMeetBeeva />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>OnboardingIntroPeople</h4>
          <div style={{ backgroundColor: Colors.BLUE, padding: '20px', borderRadius: '10px' }}>
            <OnboardingIntroPeople />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>OnboardingIntroTime</h4>
          <div style={{ backgroundColor: Colors.BLUE, padding: '20px', borderRadius: '10px' }}>
            <OnboardingIntroTime />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>PlusMenu</h4>
          <div>
            <Button
              textProps={{ text: 'Show Plus Menu' }}
              backgroundColor={Colors.BLUE}
              onButtonClick={() => setShowPlusMenu(true)}
            />
            {showPlusMenu && (
              <PlusMenu
                onClose={() => setShowPlusMenu(false)}
                onTaskClick={() => console.log('Task clicked')}
                onNoteClick={() => setShowCreateNoteModal(true)}
                onDocClick={() => console.log('Doc clicked')}
                onEventClick={() => console.log('Event clicked')}
              />
            )}
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>CreateNoteModal</h4>
          <div>
            <Button
              textProps={{ text: 'Show Create Note Modal' }}
              backgroundColor={Colors.BLUE}
              onButtonClick={() => setShowCreateNoteModal(true)}
            />
            <CreateNoteModal
              isVisible={showCreateNoteModal}
              onRequestClose={() => setShowCreateNoteModal(false)}
              onSave={(title: string, content: string) => {
                console.log('Note saved:', { title, content });
                setShowCreateNoteModal(false);
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>PrivacyMenuItem</h4>
          <div style={{ maxWidth: '400px' }}>
            <PrivacyMenuItem
              isSelected={selectedPrivacyOption === 'private'}
              onPress={() => setSelectedPrivacyOption('private')}
              icon="lock"
              title="Private"
              description="Only you can see this item"
            />
            <PrivacyMenuItem
              isSelected={selectedPrivacyOption === 'shared'}
              onPress={() => setSelectedPrivacyOption('shared')}
              icon="users"
              title="Shared"
              description="Share with specific people"
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>MenuItemsForLifeTasks</h4>
          <div style={{ maxWidth: '400px' }}>
            <MenuItemsForLifeTasks
              onItemPress={(item: string) => {
                setSelectedLifeTaskFilter(item);
                console.log('Selected filter:', item);
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>Squiggles</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <Squiggles type="basic-line" width={180} height={30} color={Colors.BLUE} />
            <Squiggles type="bended-arrow" width={124} height={100} color={Colors.RED} />
            <Squiggles type="burst" width={58} height={58} color={Colors.GREEN} />
            <Squiggles type="circles" width={56} height={64} color={Colors.PURPLE} />
          </div>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />

      {/* Weekly Stats Components */}
      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h3>Weekly Stats Components</h3>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>WeeklyStatsCard</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
            {/* Events card with items */}
            <WeeklyStatsCard
              number={2}
              title="Events"
              subtitle="this week"
              items={[
                {
                  id: '1',
                  title: 'Team Meeting',
                  color: Colors.MUSTARD,
                  onPress: () => console.log('Event 1 clicked')
                },
                {
                  id: '2',
                  title: 'Doctor Appointment',
                  color: Colors.PURPLE,
                  onPress: () => console.log('Event 2 clicked')
                }
              ]}
              emptyMessage="Upcoming events will appear here"
              onSourcePress={() => console.log('Navigate to events list')}
            />

            {/* Incomplete tasks card */}
            <WeeklyStatsCard
              number={3}
              title="Incomplete"
              subtitle="tasks"
              items={[
                {
                  id: '1',
                  title: 'Grocery Shopping',
                  color: Colors.AQUA,
                  onPress: () => console.log('Task 1 clicked')
                },
                {
                  id: '2',
                  title: 'Pay Bills',
                  color: Colors.LIGHT_RED,
                  onPress: () => console.log('Task 2 clicked')
                }
              ]}
              emptyMessage="Incomplete tasks will appear here"
              onSourcePress={() => console.log('Navigate to incomplete tasks list')}
            />

            {/* Empty card example */}
            <WeeklyStatsCard
              number={0}
              title="Completed"
              subtitle="tasks"
              items={[]}
              emptyMessage="Completed tasks will appear here"
              onSourcePress={() => console.log('Navigate to completed tasks list')}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <h4>WeeklyStatsSmallCard</h4>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '15px', maxWidth: '400px' }}>
            <WeeklyStatsSmallCard
              number={5}
              title="Notes"
              subtitle="created"
              onSourcePress={() => console.log('Navigate to notes list')}
            />
            <WeeklyStatsSmallCard
              number={2}
              title="Docs"
              subtitle="uploaded"
              onSourcePress={() => console.log('Navigate to docs list')}
            />
          </div>
        </div>
      </div>

      <HorizontalLine color={Colors.LIGHT_GREY} />
    </div>
  );
};

export default ComponentDemo;
