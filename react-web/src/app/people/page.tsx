'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { useMobileAppDetection } from '../../hooks/useMobileAppDetection';
import NavHeader from '../../components/NavHeader';
import CustomText from '../../components/CustomText';
import Button from '../../components/Button';
import { Colors, Typography } from '../../styles/index';
import {
  FONT_FAMILY_POPPINS_REGULAR,
  FONT_SIZE_14,
  FONT_SIZE_12,
  FONT_SIZE_16,
} from '../../styles/typography';
import { IFilterPill } from '../../util/types';
import { IContact } from '../../services/types';
import { initiateCall, initiateSMS, initiateEmail, initiateContactsImport } from '../../util/mobileUrlSchemes';
import moment from 'moment';
import TabBar from '../../components/TabBar';
import { useResponsive } from '../../hooks/useResponsive';

import ThreeDotsMenu from '../../components/ThreeDotsMenu';
import NewContactModal from '../../components/NewContactModal';

// Helper functions (local implementations to avoid React Native dependencies)
const objectAlreadyExists = (arrayOfObjects: any[], object: any): boolean => {
  if (!arrayOfObjects) return false;
  const exists = arrayOfObjects.some(
    (obj) => JSON.stringify(obj) === JSON.stringify(object)
  );
  return exists;
};

const removeObjectFromArray = (arrayOfObjects: any[], object: any): any[] => {
  if (!arrayOfObjects) return arrayOfObjects;
  const index = arrayOfObjects.findIndex(
    (obj) => JSON.stringify(obj) === JSON.stringify(object)
  );
  if (index !== -1) {
    return [
      ...arrayOfObjects.slice(0, index),
      ...arrayOfObjects.slice(index + 1),
    ];
  }
  return arrayOfObjects;
};

const sortContacts = (contacts: IContact[]): IContact[] => {
  return contacts.sort((a, b) => {
    // Helper function to get the name parts for sorting
    const getNameParts = (contact: IContact) => {
      // If display name exists, parse it into first/last parts
      if (contact.DisplayName && contact.DisplayName.trim()) {
        const names = contact.DisplayName.trim().split(' ');
        if (names.length >= 2) {
          return {
            lastName: names.slice(1).join(' '), // Everything after first word
            firstName: names[0] // First word
          };
        } else {
          return {
            lastName: names[0], // Single name goes to lastName for sorting
            firstName: ''
          };
        }
      }

      // Fall back to FirstName/LastName fields
      return {
        lastName: contact.LastName || '',
        firstName: contact.FirstName || ''
      };
    };

    const aNames = getNameParts(a);
    const bNames = getNameParts(b);

    // Sort by last name first
    const lastNameComparison = aNames.lastName.localeCompare(bNames.lastName, undefined, {
      sensitivity: 'base' // Case-insensitive
    });

    if (lastNameComparison !== 0) {
      return lastNameComparison;
    }

    // If last names are the same, sort by first name
    const firstNameComparison = aNames.firstName.localeCompare(bNames.firstName, undefined, {
      sensitivity: 'base' // Case-insensitive
    });

    if (firstNameComparison !== 0) {
      return firstNameComparison;
    }

    // If both names are the same, sort by email as a tiebreaker
    const aEmail = a.EmailAddress || '';
    const bEmail = b.EmailAddress || '';
    return aEmail.localeCompare(bEmail, undefined, { sensitivity: 'base' });
  });
};

// Import styles
import './people.css';



/**
 * ContactRow component - displays individual contact row with full functionality
 */
interface ContactRowProps {
  contact: IContact;
  contactFiles?: Record<string, any[]>;
  selection?: boolean;
  isEditing?: boolean;
  selectedContacts?: IContact[];
  setSelectedContacts?: React.Dispatch<React.SetStateAction<IContact[]>>;
  peopleInvolved?: IContact[];
  setPeopleInvolved?: React.Dispatch<React.SetStateAction<IContact[]>>;
}

const ContactRow: React.FC<ContactRowProps> = ({
  contact,
  contactFiles = {},
  selection = false,
  isEditing = false,
  selectedContacts = [],
  setSelectedContacts,
  peopleInvolved = [],
  setPeopleInvolved,
}) => {
  const router = useRouter();
  const { i18n } = useLanguageContext();

  const handleContactPress = () => {
    if (selection) {
      if (peopleInvolved && peopleInvolved.length > 0) {
        if (!objectAlreadyExists(peopleInvolved, contact) && setPeopleInvolved) {
          setPeopleInvolved([...peopleInvolved, contact]);
        } else if (setPeopleInvolved) {
          setPeopleInvolved(removeObjectFromArray(peopleInvolved, contact));
        }
      } else if (setPeopleInvolved) {
        setPeopleInvolved([contact]);
      }
    } else if (isEditing && setSelectedContacts) {
      if (objectAlreadyExists(selectedContacts, contact)) {
        setSelectedContacts((prev) =>
          prev.filter((c) => c.UniqueId !== contact.UniqueId)
        );
      } else {
        setSelectedContacts((prev) => [...prev, contact]);
      }
    } else {
      // Navigate to contact detail page
      router.push(`/people/${contact.UniqueId}`);
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contact?.Cell_Phone_Number) {
      initiateCall(contact.Cell_Phone_Number);
    }
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contact?.EmailAddress) {
      initiateEmail(contact.EmailAddress);
    }
  };

  const handleText = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contact?.Cell_Phone_Number) {
      initiateSMS(contact.Cell_Phone_Number);
    }
  };

  const getDisplayName = () => {
    // Prioritize display name if available
    if (contact.DisplayName && contact.DisplayName.trim()) {
      return contact.DisplayName.trim();
    }

    // Fall back to first/last name combination
    if (contact.FirstName && contact.LastName) {
      return `${contact.FirstName} ${contact.LastName}`;
    } else if (contact.FirstName) {
      return contact.FirstName;
    } else if (contact.LastName) {
      return contact.LastName;
    } else if (contact.EmailAddress) {
      return contact.EmailAddress;
    }
    return 'Unknown Contact';
  };

  const getInitials = () => {
    const displayName = getDisplayName();
    if (displayName === 'Unknown Contact') return 'UC';

    const names = displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    } else if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return 'UC';
  };

  const isSelected = isEditing && objectAlreadyExists(selectedContacts, contact);
  const isInvolved = selection && objectAlreadyExists(peopleInvolved, contact);

  // Get avatar image URL from contactFiles or contact data
  const getAvatarImageUrl = () => {
    // First check if we have files for this contact
    const files = contact.UniqueId ? contactFiles[contact.UniqueId] : undefined;

    if (files && files.length > 0) {
      // Find the first file that has a fileUrl (should be the avatar)
      const avatarFile = files.find((file: any) => file.fileUrl);
      if (avatarFile) {
        return avatarFile.fileUrl;
      }
    }

    // Fallback to the contact's AvatarImagePath - assume backend provides correct URLs
    if (contact.AvatarImagePath) {
      return contact.AvatarImagePath;
    }

    return null;
  };

  const avatarImageUrl = getAvatarImageUrl();

  // Get tag display text
  const getTagDisplayText = () => {
    if (contact.Type === 'Community') {
      // If relationship is present, translate relationship; otherwise show translated Community
      const rel = contact.Relationship;
      return rel ? i18n.t(rel as any) : i18n.t('Community');
    }
    return contact.Type ? i18n.t(contact.Type as any) : '';
  };

  // Get tag background color based on contact type and display text
  const getTagBackgroundColor = () => {
    const type = contact.Type;
    const displayText = getTagDisplayText();



    // All Community type contacts (regardless of relationship) should be light orange
    if (type === 'Community') {
      return '#FFEACD'; // Light Orange for all Community contacts
    }

    // Use display text for color mapping for non-Community types
    switch (displayText) {
      case 'Family':
        return '#DEF7F6'; // Water Blue Default
      case 'Medical':
        return '#FFE2E0'; // Light Pink
      case 'Education':
        return '#DBD4FF'; // Light Purple
      case 'Lifestyle':
        return '#FFEACD'; // Light Orange for Lifestyle
      case 'Provider':
        return '#D4DAF2'; // Light Blue
      default:
        console.log('Unknown display text:', displayText, 'for type:', type);
        return '#DEF7F6'; // Default to Water Blue
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        padding: '8px 0',
        alignItems: 'center',
        gap: '8px',
        alignSelf: 'stretch',
        cursor: 'pointer',
        borderBottom: '1px solid #D4DAF2',
      }}
      onClick={handleContactPress}
    >
      {/* Content */}
      <div
        style={{
          display: 'flex',
          padding: '4px 0',
          alignItems: 'center',
          gap: '8px',
          flex: '1 0 0',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '27px',
            height: '28px',
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {avatarImageUrl ? (
            <img
              src={avatarImageUrl}
              alt={getDisplayName()}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              {getInitials()}
            </div>
          )}
        </div>

        {/* Text */}
        <div
          style={{
            display: 'flex',
            height: '20px',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: '1 0 0',
          }}
        >
          <CustomText
            style={{
              color: 'var(--Primary-Blue, #000E50)',
              fontFamily: 'Poppins',
              fontSize: '14px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '170%',
              letterSpacing: '0.14px',
            }}
          >
            {getDisplayName()}
          </CustomText>
        </div>
      </div>

      {/* Tag */}
      {contact.Type && (
        <div
          style={{
            display: 'flex',
            padding: '6px 16px',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '39px',
            background: getTagBackgroundColor(),
          }}
        >
          <CustomText
            style={{
              color: '#000E50',
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '170%',
              letterSpacing: '0.12px',
            }}
          >
            {getTagDisplayText()}
          </CustomText>
        </div>
      )}

      {/* Selection indicator for editing mode */}
      {(isEditing || selection) && (
        <div style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          color: '#2A46BE',
          marginLeft: '8px',
        }}>
          {isSelected || isInvolved ? '✓' : '○'}
        </div>
      )}
    </div>
  );
};

/**
 * Simple Modal component for Add Contact options
 */
interface SimpleModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  options: Array<{
    label: string;
    icon: string;
    onClick: () => void;
  }>;
}

const SimpleModal: React.FC<SimpleModalProps> = ({ isVisible, onClose, title, options }) => {
  // const { i18n } = useLanguageContext();

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: Colors.WHITE,
        borderRadius: '12px',
        padding: '24px',
        minWidth: '300px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <CustomText style={{
            fontSize: FONT_SIZE_16,
            fontFamily: FONT_FAMILY_POPPINS_REGULAR,
            fontWeight: '600',
            color: Colors.BLACK,
          }}>
            {title}
          </CustomText>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: Colors.GREY_COLOR,
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => {
                option.onClick();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ fontSize: '20px', marginRight: '12px' }}>
                {option.icon}
              </span>
              <CustomText style={{
                fontSize: FONT_SIZE_14,
                fontFamily: FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.BLACK,
                flex: 1,
              }}>
                {option.label}
              </CustomText>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Simple FilterPills component for web
 */
interface FilterPillsProps {
  pills: IFilterPill[];
  onPillSelected: (pill: IFilterPill) => void;
  leftOffset?: number;
  rightOffset?: number;
}

const FilterPills: React.FC<FilterPillsProps> = ({ pills, onPillSelected }) => {
  const { i18n } = useLanguageContext();

  return (
    <div
      className="filter-pills-container"
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        paddingBottom: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      {pills.map((pill, index) => (
        <button
          key={`${pill.text}-${index}`}
          onClick={() => onPillSelected(pill)}
          style={{
            display: 'flex',
            height: '31px',
            padding: '8px 12px 8px 14px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4px',
            borderRadius: '39px',
            border: `1px solid #2A46BE`,
            backgroundColor: pill.isSelected ? '#2A46BE' : 'transparent',
            color: pill.isSelected ? Colors.WHITE : '#2A46BE',
            fontSize: FONT_SIZE_12,
            fontFamily: FONT_FAMILY_POPPINS_REGULAR,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          {i18n.t(pill.text as any)}
        </button>
      ))}
    </div>
  );
};

/**
 * AuthGuard - A component that ensures authentication is complete before rendering children
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Handle redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: Colors.WHITE
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // If we don't have a valid user object with ID, show loading
  if (!user || !user.id) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: Colors.WHITE
      }}>
        <div>Loading user...</div>
      </div>
    );
  }

  // Authentication is complete and we have a valid user - render the children
  return <>{children}</>;
};

/**
 * PeopleContent - The main content of the people page
 */
const PeopleContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const { user } = useAuth();
  const router = useRouter();

  // Mobile detection using comprehensive detection (includes WebView detection)
  const { isMobileApp } = useMobileAppDetection();

  // Use responsive hook for better mobile detection
  const { } = useResponsive();
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [contactFiles, setContactFiles] = useState<Record<string, any[]>>({});
  const [searchText, setSearchText] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedContacts, setSelectedContacts] = useState<IContact[]>([]);
  const [peopleInvolved, setPeopleInvolved] = useState<IContact[]>([]);
  const [filterPills, setFilterPills] = useState<IFilterPill[]>([
    { isSelected: true, text: "All", count: 0 },
    { isSelected: false, text: "Recent", count: 0 },
    { isSelected: false, text: "Family", count: 0 },
    { isSelected: false, text: "Medical", count: 0 },
    { isSelected: false, text: "Provider", count: 0 },
    { isSelected: false, text: "Community", count: 0 },
    { isSelected: false, text: "Lifestyle", count: 0 },
  ]);
  // const [selectedPillName, setSelectedPillName] = useState<string>("All");
  const [isShowAddStrategyModal, setIsShowAddStrategyModal] = useState<boolean>(false);
  const [isShowNewContactModal, setIsShowNewContactModal] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Refs for alphabet slider
  const flatListRef = useRef<HTMLDivElement>(null);
  const alphabet = [...Array(26)].map((_, index) => String.fromCharCode(65 + index));

  // Filter pill selection handler
  const onFilterPillSelected = (pill: IFilterPill) => {
    setFilterPills((prevPills) =>
      prevPills.map((p) => ({
        ...p,
        isSelected: p.text === pill.text,
      }))
    );
    // setSelectedPillName(pill.text);
  };

  // Update filter pill counts when contacts change
  useEffect(() => {
    setFilterPills((prevPills) =>
      prevPills.map((pill) => {
        switch (pill.text) {
          case "All":
            return { ...pill, count: contacts.length };
          case "Recent":
            return {
              ...pill,
              count: contacts.filter((contact) =>
                moment(contact.CreationTimestamp).isAfter(moment().subtract(1, "day"))
              ).length,
            };
          default:
            return {
              ...pill,
              count: contacts.filter((contact) => contact.Type === pill.text).length,
            };
        }
      })
    );
  }, [contacts]);

  // Filtered data with search and filter logic
  const filteredData = useMemo(() => {
    const selectedPill = filterPills.find((pill) => pill.isSelected)?.text || "All";

    // Filter by search text
    const searchFiltered = contacts.filter((contact) => {
      if (!searchText) return true;
      const searchLower = searchText.toLowerCase();
      return (
        contact.DisplayName?.toLowerCase().includes(searchLower) ||
        contact.FirstName?.toLowerCase().includes(searchLower) ||
        contact.LastName?.toLowerCase().includes(searchLower) ||
        contact.EmailAddress?.toLowerCase().includes(searchLower)
      );
    });

    // Filter by selected pill
    const pillFiltered = searchFiltered.filter((contact) => {
      if (selectedPill === "All") return true;
      if (selectedPill === "Recent") {
        return moment(contact.CreationTimestamp).isAfter(moment().subtract(1, "day"));
      }
      return contact.Type === selectedPill;
    });

    return sortContacts(pillFiltered);
  }, [searchText, contacts, filterPills]);

  // Alphabet index map for quick navigation
  const alphabetIndexMap = useMemo(() => {
    const map: { [key: string]: number } = {};
    filteredData.forEach((contact, index) => {
      const firstLetter = (
        contact.LastName?.charAt(0) ||
        contact.FirstName?.charAt(0) ||
        contact.EmailAddress?.charAt(0) ||
        ""
      ).toUpperCase();
      if (firstLetter && !map[firstLetter]) {
        map[firstLetter] = index;
      }
    });
    return map;
  }, [filteredData]);

  const loadContacts = useCallback(async () => {
    if (!user?.id || !user?.accountId) return;

    try {
      // Use new API endpoint structure
      const response = await fetch(`/api/contacts/user/${user.id}?accountId=${user.accountId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const contactsData = await response.json();

        // Extract contacts array from the response object
        // The API returns { contacts: [...], contactFiles: {} }
        const rawContactsArray = contactsData.contacts || [];
        const rawContactFiles = contactsData.contactFiles || {};

        // Transform API response to match IContact interface
        const transformedContacts = rawContactsArray.map((contact: any) => ({
          UniqueId: contact.id,
          FirstName: contact.firstName || '',
          LastName: contact.lastName || '',
          DisplayName: contact.displayName || '',
          EmailAddress: contact.emailAddress,
          SecondaryEmailAddress: contact.secondaryEmailAddress,
          TertiaryEmailAddress: contact.tertiaryEmailAddress,
          Cell_Phone_Number: contact.cellPhoneNumber,
          Home_Phone_Number: contact.homePhoneNumber,
          TertiaryPhoneNumber: contact.tertiaryPhoneNumber,
          Address: contact.address,
          SecondaryAddress: contact.secondaryAddress,
          TertiaryAddress: contact.tertiaryAddress,
          StreetName: contact.streetName,
          City: contact.city,
          State: contact.state,
          Country: contact.country,
          ZipCode: contact.zipCode,
          Birthday: contact.birthday,
          Workplace: contact.workplace,
          Type: contact.type,
          Relationship: contact.relationship,
          RelevantNotes: contact.relevantNotes,
          AvatarImagePath: contact.avatarImagePath,
          Account_uniqueId: contact.accountId,
          User_uniqueId: contact.userId,
          CreationTimestamp: contact.creationTimestamp,
          UpdateTimestamp: contact.updateTimestamp,
          Active: contact.active,
          Deleted: contact.deleted,
          MobileDeviceContactId: contact.mobileDeviceContactId,
          Invited_User_uniqueId: contact.invitedUserId,
        }));

        setContacts(transformedContacts);
        setContactFiles(rawContactFiles);
      } else {
        console.error("Failed to load contacts:", response.status);
        setContacts([]);
      }
    } catch (error) {
      console.error("Failed to load contacts:", error);
      setContacts([]);
    }
  }, [user?.id, user?.accountId]);

  // Delete contacts function - updated to use correct API endpoint
  const deleteSelectedContacts = async () => {
    if (selectedContacts.length === 0) return;

    try {
      // Delete contacts one by one using the correct API endpoint and format
      const deletePromises = selectedContacts.map(async (contact) => {
        const response = await fetch('/api/contacts', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: contact.UniqueId,
            accountId: contact.Account_uniqueId || user?.accountId,
            userId: contact.User_uniqueId || user?.id,
          }),
        });

        if (!response.ok) {
          console.error(`Failed to delete contact ${contact.UniqueId}:`, response.status);
          throw new Error(`Failed to delete contact ${contact.UniqueId}`);
        }

        return response.json();
      });

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      // Reload contacts after deletion
      await loadContacts();
      setSelectedContacts([]);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to delete contacts:", error);
    }
  };

  // Refresh function to reload contacts
  const refreshContacts = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await loadContacts();
    } catch (error) {
      console.error('Error refreshing contacts:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadContacts, isRefreshing]);

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, [user?.id, user?.accountId, loadContacts]);



  return (
    <>
      {/* Add CSS animation for spinner */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: isMobileApp ? 'transparent' : '#f0f8ff',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        zIndex: 1,
        boxSizing: 'border-box'
      }}>
        <div className="people-container">
        {/* Header - copied from property-info page */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            paddingTop: isMobileApp ? '16px' : '20px',
            paddingBottom: isMobileApp ? '16px' : '20px',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Left side - empty space (no back button) */}
          <div style={{ width: '24px', height: '24px' }}></div>

          {/* Centered title */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CustomText
              style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '-0.408px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {i18n.t('People')}
            </CustomText>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <button
              onClick={() => router.push('/search')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                width: '24px',
                height: '24px',
              }}
            >
              <img
                src="/icons/icon-search.svg"
                width={24}
                height={24}
                alt="Search"
                style={{ cursor: 'pointer' }}
              />
            </button>

            <button
              onClick={() => setIsShowNewContactModal(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                width: '24px',
                height: '24px',
              }}
            >
              <img
                src="/icons/people/icon-menu-people-add.svg"
                width={24}
                height={24}
                alt="Add Contact"
                style={{ cursor: 'pointer' }}
              />
            </button>
          </div>
        </div>



      {/* Search Bar */}
      <div>
        <div className="search-container">
          <input
            className="search-input"
            placeholder={i18n.t("Search")}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
          {/* Add refresh button for all modes */}
          {(
            <button
              onClick={refreshContacts}
              disabled={isRefreshing}
              style={{
                background: 'none',
                border: 'none',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                padding: '8px',
                marginLeft: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease',
                opacity: isRefreshing ? 0.6 : 1,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isRefreshing) {
                  e.currentTarget.style.backgroundColor = Colors.LIGHT_GREY;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Refresh contacts"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={Colors.BLUE}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)',
                  transition: 'transform 0.8s ease'
                }}
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <FilterPills
          pills={filterPills}
          onPillSelected={onFilterPillSelected}
          leftOffset={0}
          rightOffset={0}
        />

        {/* Edit Mode Controls */}
        {isEditing && (
          <div style={{ width: "100%", paddingTop: "10px" }}>
            {selectedContacts.length > 0 ? (
              <button
                onClick={() => setSelectedContacts([])}
                style={{
                  fontSize: FONT_SIZE_12,
                  color: Colors.BLUE,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {i18n.t("Clear")}
              </button>
            ) : (
              <button
                onClick={() => setSelectedContacts(filteredData)}
                style={{
                  fontSize: FONT_SIZE_12,
                  color: Colors.BLUE,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {i18n.t("SelectAll")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Refresh Spinner */}
      {isRefreshing && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          margin: '0 20px 16px 20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={Colors.BLUE}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: 'spin 1s linear infinite',
              marginRight: '8px'
            }}
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M3 21v-5h5"></path>
          </svg>
          <CustomText style={{
            fontSize: Typography.FONT_SIZE_14,
            color: Colors.BLUE,
            fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM
          }}>
            Refreshing contacts...
          </CustomText>
        </div>
      )}

      {/* Contacts List with Alphabet Slider or Empty State */}
      <div className="contact-list-wrapper">
          {contacts.length > 0 ? (
            <div className="contact-list-container">
              <div className="contacts-list" ref={flatListRef}>
                {filteredData.map((contact, index) => (
                  <ContactRow
                    key={`${contact.UniqueId}-${index}`}
                    contact={contact}
                    contactFiles={contactFiles}
                    selection={false}
                    isEditing={isEditing}
                    selectedContacts={selectedContacts}
                    setSelectedContacts={setSelectedContacts}
                    peopleInvolved={peopleInvolved}
                    setPeopleInvolved={setPeopleInvolved}
                  />
                ))}
              </div>

              {/* Alphabet Slider */}
              <div className="alphabet-slider">
                {alphabet.map((letter, index) => (
                  <div
                    key={`${index}-${letter}`}
                    className="alphabet-letter"
                    onClick={() => {
                      if (alphabetIndexMap[letter] !== undefined) {
                        const element = flatListRef.current?.children[alphabetIndexMap[letter]] as HTMLElement;
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Zero State */
            <div
              style={{
                display: 'flex',
                height: '248px',
                padding: '32px 0',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '32px',
              }}
            >
              {/* Content container */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '20px',
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    display: 'flex',
                    padding: '6px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '100px',
                    background: 'var(--primary-electric-5, #F5F7FF)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      padding: '12px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '100px',
                      background: 'var(--primary-electric-10, #EAEDF8)',
                    }}
                  >
                    <img
                      src="/icons/people/icon-people-import-contact.svg"
                      alt="Import Contacts"
                      style={{
                        width: 'auto',
                        height: 'auto',
                      }}
                    />
                  </div>
                </div>

                {/* Text container */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  {/* Main text */}
                  <CustomText
                    style={{
                      color: 'var(--primary-dark-blue-100, #000E50)',
                      textAlign: 'center',
                      fontFamily: 'Poppins',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      fontWeight: 500,
                      lineHeight: '120%',
                    }}
                  >
                    {i18n.t("NoContactsAdded")}
                  </CustomText>

                  {/* Subtitle text */}
                  <CustomText
                    style={{
                      color: 'var(--primary-dark-blue-40, #999FB9)',
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '120%',
                    }}
                  >
                    {i18n.t("SynchronizeYourContactsWithEeva")}
                  </CustomText>
                </div>
              </div>

              {/* Sync contacts button */}
              <button
                onClick={() => setIsShowNewContactModal(true)}
                style={{
                  display: 'flex',
                  width: '100%',
                  minHeight: '44px',
                  padding: '20px 16px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '100px',
                  background: 'var(--primary-dark-blue-100, #000E50)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <CustomText
                  style={{
                    color: 'var(--Accent-Color-White, #FFF)',
                    fontFamily: 'Poppins',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '120%',
                  }}
                >
                  {i18n.t("SyncContacts")}
                </CustomText>
              </button>
            </div>
          )}
        </div>

        {/* New Contact Modal */}
        <NewContactModal
          isVisible={isShowNewContactModal}
          onClose={() => setIsShowNewContactModal(false)}
          onImportAll={() => {
            if (isMobileApp) {
              // Mobile mode: Trigger the eeva://contacts/import URL scheme
              if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                console.log('📱 Mobile mode: Triggering contacts import URL scheme (all): eeva://contacts/import?mode=all');
              }
              initiateContactsImport('all');
            } else {
              // Non-mobile mode: Navigate to create new contact page
              if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                console.log('🌐 Non-mobile mode: Navigating to create new contact page');
              }
              router.push('/people/new');
            }
          }}
          onImportSelect={() => {
            if (isMobileApp) {
              // Mobile mode: Trigger the eeva://contacts/import URL scheme
              if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                console.log('📱 Mobile mode: Triggering contacts import URL scheme (select): eeva://contacts/import?mode=select');
              }
              initiateContactsImport('select');
            } else {
              // Non-mobile mode: Navigate to create new contact page
              if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                console.log('🌐 Non-mobile mode: Navigating to create new contact page');
              }
              router.push('/people/new');
            }
          }}
          onCreateNew={() => {
            // Navigate to new contact creation
            router.push('/people/new');
          }}
        />

        {/* Add Contact Strategy Modal */}
        <SimpleModal
          isVisible={isShowAddStrategyModal}
          onClose={() => setIsShowAddStrategyModal(false)}
          title={i18n.t("AddContact")}
          options={[
            {
              label: i18n.t("ImportFromContacts"),
              icon: "📱",
              onClick: () => {
                if (isMobileApp) {
                  // Mobile mode: Trigger the eeva://contacts/import URL scheme
                  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                    console.log('📱 Mobile mode: Triggering contacts import URL scheme: eeva://contacts/import');
                  }

                  initiateContactsImport();
                } else {
                  // Non-mobile mode: Navigate to create new contact page
                  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                    console.log('🌐 Non-mobile mode: Navigating to create new contact page');
                  }

                  router.push('/people/new');
                }

                // Close the modal
                setIsShowAddStrategyModal(false);
              },
            },
            {
              label: i18n.t("CreateNew"),
              icon: "➕",
              onClick: () => {
                // Navigate to new contact creation
                router.push('/people/new');
              },
            },
          ]}
        />
      </div>

      {/* Tab Bar */}
      <TabBar />
    </div>
    </>
  );
};

/**
 * PeoplePage - The main component that wraps PeopleContent with AuthGuard
 */
const PeoplePage: React.FC = () => {
  return (
    <AuthGuard>
      <PeopleContent />
    </AuthGuard>
  );
};

export default PeoplePage;
