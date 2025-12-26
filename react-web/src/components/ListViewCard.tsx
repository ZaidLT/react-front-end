import React, { useState, useEffect } from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';
import Icon from './Icon';
import DentCardToggle from './DentCardToggle';
import HiveTile from './HiveTile';
import moment from 'moment';

interface IFooterItemProps {
  icon: string;
  label: string;
  color?: string;
}

interface IListViewCardProps {
  nameNote: string;
  avatar?: Array<{
    AvatarImagePath?: string;
    FirstName?: string;
    LastName?: string;
    Email?: string;
  }>;
  priority?: number;
  description?: string;
  type: string;
  onPress?: () => void;
  item?: any;
  isShowItemTile?: boolean;
  isFullCard?: boolean;
  isPlaceholder?: boolean; // Added for placeholder cards
  toggleOptions?: {
    text?: {
      activeText: string;
      inactiveText: string;
    };
    color?: {
      activeColor: string;
      inactiveColor: string;
    };
  };
  onToggle?: (isCompleted: boolean) => void;
  // For backward compatibility
  date?: string;
  time?: string;
  timeCreationText?: string;
  isComplete?: boolean;
  TimeColor?: string;
}

const ListViewCard: React.FC<IListViewCardProps> = ({
  nameNote,
  avatar,
  type,
  priority,
  description,
  onPress,
  item = { Active: false, created: new Date().toISOString() },
  isShowItemTile = false,
  isFullCard = false,
  isPlaceholder = false,
  toggleOptions,
  onToggle,
  date,
  time,
  timeCreationText,
  isComplete,
  TimeColor,
}) => {
  const priorityToTitleColorMap: Record<number, { title: string; color: string }> = {
    0: { title: 'None', color: Colors.GREY_COLOR },
    1: { title: 'Low', color: Colors.PISTACHIO_GREEN },
    2: { title: 'Medium', color: Colors.MUSTARD },
    3: { title: 'High', color: Colors.RED },
  };

  // Normalize priority value to prevent undefined errors
  const normalizePriority = (priorityValue: number | null | undefined | string): number => {
    // Handle null, undefined, or empty string
    if (priorityValue == null || priorityValue === '') {
      return 0;
    }

    // Convert to integer
    const priorityInt = Math.floor(Number(priorityValue));

    // Handle NaN case
    if (isNaN(priorityInt)) {
      return 0;
    }

    // Clamp to valid range (0-3)
    return Math.max(0, Math.min(3, priorityInt));
  };

  const normalizedPriority = normalizePriority(priority);
  const priorityInfo = priorityToTitleColorMap[normalizedPriority];

  // Get priority info with fallback for invalid values
  const getPriorityInfo = (priorityValue: number | null | undefined) => {
    const safePriority = priorityValue ?? 0;
    return priorityToTitleColorMap[safePriority] || priorityToTitleColorMap[0];
  };

  const getHumanReadableFromDateTime = (dateTime: string) => {
    const diffInDays = moment(dateTime).diff(moment(), 'days');
    if (diffInDays < 0) {
      const getTimeLabel = (type: string) => {
        return type === 'Task' ? 'overdue' : 'ago';
      };

      return moment(dateTime).fromNow(true) + ' ' + getTimeLabel(type);
    }
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays > 7) return moment(dateTime).format('MM/DD/YYYY');
    return `${diffInDays} Days`;
  };

  // In React Native, isCompleted = item.Active (where Active=true means incomplete)
  // This matches the React Native naming convention exactly
  const [isCompleted, setIsCompleted] = useState<boolean>(
    isComplete !== undefined ? isComplete : (item?.Active ?? false)
  );

  useEffect(() => {
    // Update the completed state when the item or isComplete prop changes
    if (isComplete !== undefined) {
      setIsCompleted(isComplete);
    } else if (item?.completed !== undefined) {
      // Use the completed field from the task data
      setIsCompleted(item.completed);
    } else if (item?.Active !== undefined) {
      // Fallback to Active field for backward compatibility
      setIsCompleted(item.Active);
    }
  }, [item?.completed, item?.Active, isComplete]);

  // Handle toggle state change
  const handleToggle: React.Dispatch<React.SetStateAction<boolean>> = (value) => {
    const newCompletedState = typeof value === 'function' ? value(isCompleted) : value;

    // First update our local state
    setIsCompleted(newCompletedState);

    // Then notify parent component if callback exists
    if (onToggle) {
      onToggle(newCompletedState);
    }
  };

  const FOOTER_ITEMS: IFooterItemProps[] = [];

  // Add date/time info if provided directly or from item
  if (date && time) {
    FOOTER_ITEMS.push({
      icon: 'clock-alarm',
      label: `${date} ${time}${timeCreationText ? ` - ${timeCreationText}` : ''}`,
      color: TimeColor,
    });
  } else {
    FOOTER_ITEMS.push({
      icon: 'clock-alarm',
      label: item?.Deadline_DateTime
        ? getHumanReadableFromDateTime(item.Deadline_DateTime)
        : getHumanReadableFromDateTime(item?.created),
    });
  }

  if (avatar && avatar.length > 0) {
    FOOTER_ITEMS.push({
      icon: 'user-group',
      label:
        avatar.length === 1
          ? avatar[0].FirstName ?? `${avatar.length} Member`
          : `${avatar.length} Members`,
    });
  }

  const PriorityFlagIcon: React.FC<{color: string, width?: number, height?: number}> = ({ color, width = 16, height = 16 }) => {
    return (
      <svg width={width} height={height} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.66699 5.83337V8.75004" stroke={color} strokeWidth="0.625" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4.89932 1.59955C3.52214 0.887438 2.2074 1.41554 1.66699 1.84177V6.17725C2.07103 5.713 3.28315 4.99337 4.89932 5.82904C6.34366 6.57587 7.75216 6.16567 8.33366 5.843V1.67005C7.21266 2.17983 6.00753 2.17258 4.89932 1.59955Z" stroke={color} strokeWidth="0.625" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    );
  };

  return (
    <div
      onClick={onPress}
      style={{
        position: 'relative',
        borderRadius: '8px',
        backgroundColor: Colors.WHITE,
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: isFullCard ? '180px' : 'auto',
        maxHeight: isFullCard ? '180px' : 'auto',
        paddingTop: isFullCard ? '16px' : '6px',
        paddingBottom: isFullCard ? '16px' : '6px',
        paddingLeft: isFullCard ? '16px' : '10px',
        paddingRight: isFullCard ? '16px' : '10px',
        width: isFullCard ? '220px' : '99%',
        minWidth: isFullCard ? '220px' : 'auto',
        gap: 0,
        cursor: 'pointer',
      }}
    >
      {/* Priority Flag - Moved to top left */}
      {priority && priority > 0 && !isPlaceholder && (
        <div
          style={{
            position: 'absolute',
            left: '5px',
            top: '8px',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '4px',
            padding: '2px 4px',
          }}
        >
          <PriorityFlagIcon color={priorityInfo.color} />
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_10,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              fontWeight: 300,
              marginLeft: '5px',
              color: priorityInfo.color,
            }}
          >
            {priorityInfo.title}
          </CustomText>
        </div>
      )}

      {isShowItemTile && (
        <div
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            zIndex: 1,
          }}
        >
          <HiveTile
            type={type}
            size={50}
          />
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: '6px',
          marginTop: priority ? '15px' : '6px',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <CustomText
            style={{
              marginTop: '6px',
              color: Colors.BLUE,
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              fontWeight: 500,
              lineHeight: '24px',
              textDecorationLine: type === 'Task' ? (isCompleted ? 'line-through' : 'none') : 'none',
            }}
          >
            {nameNote}
          </CustomText>
        </div>
        {description && (
          <CustomText
            style={{
              color: isPlaceholder ? Colors.PURPLE : Colors.MIDNIGHT,
              fontSize: isPlaceholder ? Typography.FONT_SIZE_14 : Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              fontWeight: 300,
              lineHeight: '18px',
              marginBottom: '6px',
              textDecorationLine: type === 'Task' ? (isCompleted ? 'line-through' : 'none') : 'none',
              maxWidth: isPlaceholder ? '100%' : '80%',
            }}
          >
            {description}
          </CustomText>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '6px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '12px',
          }}
        >
          {/* Don't show footer items for placeholder cards - matching React Native behavior */}
          {!isPlaceholder && FOOTER_ITEMS.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: Colors.LIGHT_GREY,
              borderRadius: '4px',
              paddingLeft: '8px',
              paddingRight: '8px',
              paddingTop: '2px',
              paddingBottom: '2px',
            }}>
              <Icon name={item.icon} width={16} height={16} color={item.color || Colors.BLUE} />
              <CustomText style={{
                marginLeft: '5px',
                fontSize: Typography.FONT_SIZE_10,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: item.color || Colors.BLUE,
              }}>
                {item.label}
              </CustomText>
            </div>
          ))}
        </div>
        {/* Don't show toggle for placeholder cards - matching React Native behavior */}
        {type === 'Task' && !isPlaceholder && (
          <DentCardToggle
            isCompleted={isCompleted}
            setIsCompleted={handleToggle}
            options={toggleOptions || {
              text: {
                activeText: 'DONE',
                inactiveText: 'TO DO'
              },
              color: {
                activeColor: Colors.BLUE,
                inactiveColor: Colors.BLUE
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ListViewCard;
