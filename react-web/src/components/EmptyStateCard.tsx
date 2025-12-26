'use client';

import React, { useEffect, useState } from 'react';
import { Colors, Typography } from '../styles';
import CustomText from './CustomText';
import { useLanguageContext } from '../context/LanguageContext';

interface EmptyStateCardProps {
  onClose: () => void;
}

type PageContent = {
  title: string;
  description: string;
  icon?: React.ReactNode;
  underline?: React.ReactNode;
};

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ onClose }) => {
  // Use state to store the pathname
  const [pathname, setPathname] = useState('/');

  // Get the pathname safely after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  // Use the language context for translations
  const { i18n } = useLanguageContext();

  const pageContent: Record<string, PageContent> = {
    DefaultValue: {
      title: i18n.t('RealImportantStuff'),
      description: i18n.t('MarkTasksAndEventsAsHighPriorityWithTheRedFlag'),
      icon: (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Placeholder for squiggles icon */}
          <svg
            width='50'
            height='50'
            viewBox='0 0 50 50'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle
              cx='25'
              cy='25'
              r='20'
              stroke={Colors.BLUE}
              strokeWidth='2'
            />
            <path
              d='M15 25C15 25 20 15 25 25C30 35 35 25 35 25'
              stroke={Colors.SECONDARY_PURPLE}
              strokeWidth='2'
            />
          </svg>
        </div>
      ),
      underline: (
        <div
          style={{
            position: 'absolute',
            top: '24px',
            width: '100px',
            height: '8px',
            backgroundColor: Colors.SECONDARY_PURPLE,
            borderRadius: '4px',
          }}
        />
      ),
    },
    '/': {
      title: i18n.t('LetsGetStarted'),
      description: i18n.t(
        'AddATaskOrAnEventUsingThePlusMenuAndTheyllShowUpHere'
      ),
      icon: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Custom hexagon with plus icon to exactly match React Native app */}
          <div
            style={{
              position: 'relative',
              width: '58px',
              height: '64px',
            }}
          >
            {/* Colored hexagon tile */}
            <img
              src='/HiveTileColored.svg'
              alt='Hexagon'
              style={{
                width: '100%',
                height: '100%',
                filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.15))',
              }}
            />
            {/* Plus icon on top of hexagon */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: Colors.BLUE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M12 4V20'
                  stroke='#4285F4'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                />
                <path
                  d='M4 12L20 12'
                  stroke='#4285F4'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                />
              </svg>
            </div>
          </div>
        </div>
      ),
      underline: (
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '240px',
          }}
        >
          <img
            src='/hive-icons/squiggles-basic-turquoise.svg'
            alt='Underline'
            style={{
              width: '100%',
              height: '12px',
            }}
          />
        </div>
      ),
    },
    '/house-hive': {
      title: i18n.t('YourHomeYourWay'),
      description: i18n.t('TimeToAddSomeTasksAndEventsToGetYourHomeInOrder'),
      icon: (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Plus icon with squiggles style matching React Native */}
          <svg
            width='50'
            height='50'
            viewBox='0 0 50 50'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M25 10V40'
              stroke={Colors.SECONDARY_PURPLE}
              strokeWidth='3'
              strokeLinecap='round'
            />
            <path
              d='M10 25H40'
              stroke={Colors.SECONDARY_PURPLE}
              strokeWidth='3'
              strokeLinecap='round'
            />
          </svg>
        </div>
      ),
      underline: (
        <div
          style={{
            position: 'absolute',
            left: '74%',
            transform: 'translateX(-50%)',
            width: '200px',
          }}
        >
          <img
            src='/hive-icons/Squiggles-basic-oval.svg'
            alt='Underline'
            style={{
              height: '40px',
            }}
          />
        </div>
      ),
    },
  };

  // Get content based on pathname or use default
  // For the home page, use the home page content
  const content =
    pathname === '/home'
      ? pageContent['/']
      : pageContent[pathname] || pageContent.DefaultValue;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
      }}
      onClick={onClose} // Close on any click on the backdrop
    >
      <div
        style={{
          width: '90%',
          maxWidth: '500px',
          backgroundColor: Colors.WHITE,
          borderRadius: '18px',
          padding: '24px',
          paddingTop: '40px',
          paddingBottom: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.15)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            onClose(); // Close the modal
          }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            zIndex: 1002, // Ensure it's above everything else
          }}
        >
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M18 6L6 18M6 6L18 18'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
        </button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
          }}
        >
          {/* Bee icon */}
          <img
            src='/hive-icons/beeva.svg'
            alt='Beeva'
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
            }}
          />
          {content.icon}
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '16px',
          }}
        >
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_24,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.MIDNIGHT,
              textAlign: 'center',
            }}
          >
            {content.title}
          </CustomText>
          {content.underline}
        </div>

        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_18,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            color: Colors.GREY_COLOR,
            textAlign: 'center',
          }}
        >
          {content.description}
        </CustomText>
      </div>
    </div>
  );
};

export default EmptyStateCard;
