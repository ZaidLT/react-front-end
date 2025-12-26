import React, { useState } from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';
import EmptyStateCard from './EmptyStateCard';
import moment from 'moment';
import Icon from './Icon';
import { useLanguageContext } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface IFullEmptyCardProps {
  heading?: string;
  text?: string;
  onPress?: () => void;
}

const EmptyFullCard: React.FC<IFullEmptyCardProps> = ({ heading, text, onPress }) => {
  const { i18n } = useLanguageContext();
  const [isEmptyStateCardVisible, setIsEmptyStateCardVisible] = useState(false);

  // Format date like "Mar 12th"
  const date = moment(new Date());
  const monthName = date.format('MMM');
  const day = date.date();

  // Add suffix to day (1st, 2nd, 3rd, etc.)
  const suffixifyNumber = (num: number): string => {
    if (num > 3 && num < 21) return `${num}th`;
    switch (num % 10) {
      case 1: return `${num}st`;
      case 2: return `${num}nd`;
      case 3: return `${num}rd`;
      default: return `${num}th`;
    }
  };

  const dateString = `${monthName} ${suffixifyNumber(day)}`;

  // Get user data from auth context if available, or use a default
  const { user } = useAuth() || { user: null };

  const firstName = user?.firstName || "Sam";
  const lastName = user?.lastName || "";

  return (
    <div
      onClick={() => {
        // Only use the onPress callback to trigger the modal in the parent component
        if (onPress) onPress();
      }}
      style={{
        width: '100%',
        maxWidth: '220px',
        height: '170px',
        borderRadius: '8px',
        marginBottom: '4px',
        padding: '16px',
        backgroundColor: Colors.WHITE,
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.22)',
        marginRight: '15px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
      }}>
        <div style={{
          display: 'flex',
          alignSelf: 'flex-start',
          width: '50%',
          alignItems: 'center',
        }}>
          <Icon name="task" color={Colors.PRIMARY_ELECTRIC_BLUE} width={16} height={16} />
          <CustomText style={{
            marginLeft: '5px',
            fontSize: Typography.FONT_SIZE_12,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            fontWeight: 500,
            color: Colors.PRIMARY_ELECTRIC_BLUE,
          }}>
            Task
          </CustomText>
        </div>

        <div style={{
          display: 'flex',
          width: '50%',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
          <CustomText style={{
            marginRight: '5px',
            fontSize: Typography.FONT_SIZE_12,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            fontWeight: 500,
            color: Colors.BLUE,
          }}>
            {dateString}
          </CustomText>
          <Icon name="clock-alarm" width={16} height={16} color={Colors.BLUE} />
        </div>
      </div>

      <div style={{
        paddingTop: '9.5px',
        height: '105px',
      }}>
        <CustomText style={{
          fontSize: Typography.FONT_SIZE_16,
          fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
          color: Colors.MIDNIGHT,
          textAlign: 'left',
        }}>
          {heading || `${i18n.t('WelcomeTo')} Eeva`}
        </CustomText>
        <CustomText style={{
          fontSize: Typography.FONT_SIZE_14,
          fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
          color: Colors.PURPLE,
          textAlign: 'left',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {text || i18n.t('ThisIsWhereYoullFindYourUpcomingTasksEventsAndRemindersItllDisappearOnceYouCreateYourItems')}
        </CustomText>
      </div>

      <div style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <CustomText style={{
          fontSize: Typography.FONT_SIZE_10,
          color: Colors.PRIMARY_DARK_BLUE,
          fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
          backgroundColor: Colors.LIGHT_GREY,
          borderRadius: '4px',
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingTop: '2px',
          paddingBottom: '2px',
        }}>
          {firstName}
        </CustomText>
        <Icon name="flag" width={20} height={20} color="#666E96" />
      </div>
    </div>
  );
};

export default EmptyFullCard;
