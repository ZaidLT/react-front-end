'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '../../components/LoadingSpinner';
import Icon from '../../components/Icon';
import NoteSettingsDialog from '../../components/NoteSettingsDialog';
import CustomText from '../../components/CustomText';
import HiveSelectionModal from '../../components/HiveSelectionModal';
import FamilyMemberSelectionModal from '../../components/FamilyMemberSelectionModal';
import { Colors } from '../../styles';
import { useLanguageContext } from '../../context/LanguageContext';

import { useAuth } from '../../context/AuthContext';
import { useNoteStore, useTileStore, useFamilyStore } from '../../context/store';
import { createNote } from '../../services/services';
import { INote, User } from '../../services/types';
import { INestedTile } from '../../util/types';
import { mapSyntheticTilesToRealTiles } from '../../util/helpers';
import './create-note.css';
import userService from '../../services/userService';


const CreateNoteContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const homeMemberIdParam = searchParams.get('homeMemberId') || undefined;

  const { user } = useAuth();
  const { addNote } = useNoteStore();
  const tiles = useTileStore((state) => state.tiles);

  const family = useFamilyStore((state) => state.family);
  const setFamily = useFamilyStore((state) => state.setFamily);

  // Form state
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(4); // Default to lowest priority
  const [selectedHive, setSelectedHive] = useState<INestedTile | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowFields, setIsShowFields] = useState(true); // true for rich text, false for checklist
  const [checklistData, setChecklistData] = useState<Array<{text: string, checked: boolean}>>([]);
  const [tempLastItemText, setTempLastItemText] = useState(''); // Track text in the last empty item
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);
  const [hideFromPeople, setHideFromPeople] = useState<User[]>([]);

  // Assignment states (selectedHive already exists above)
  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<any[]>([]);
  const [showHiveSelectionModal, setShowHiveSelectionModal] = useState(false);
  const [showFamilyMemberSelectionModal, setShowFamilyMemberSelectionModal] = useState(false);

  // Get initial data from URL params
  useEffect(() => {
    const homeMemberId = searchParams.get('homeMemberId');
    const tileId = searchParams.get('tileId');
    const contactId = searchParams.get('contactId');
    const delegateUserId = searchParams.get('delegateUserId') || undefined;
    let tileName = searchParams.get('name') || '';

    // Debug logging
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('🔍 Create Note URL Params:', {
        homeMemberId,
        tileId,
        tileName,
        allParams: Object.fromEntries(searchParams.entries())
      });
    }

    // Sanitize name parameter
    try { tileName = decodeURIComponent(tileName); } catch {}
    const q = tileName.indexOf('?');
    const a = tileName.indexOf('&');
    const cut = Math.min(q === -1 ? Number.POSITIVE_INFINITY : q, a === -1 ? Number.POSITIVE_INFINITY : a);
    const cleanName = (cut === Number.POSITIVE_INFINITY ? tileName : tileName.slice(0, cut)).trim();

    // Prefer tileId over homeMemberId for preselection
    const targetId = tileId || homeMemberId;

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('🎯 Create Note Processing:', {
        targetId,
        tilesLength: tiles.length,
        cleanName,
        foundTile: tiles.find(tile => tile.UniqueId === targetId)
      });
    }

    if (targetId) {
      if (tiles.length > 0) {
        const hive = tiles.find(tile => tile.UniqueId === targetId);
        if (hive) {
          setSelectedHive(hive);
          if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
            console.log('✅ Create Note: Found and set hive:', hive);
          }
        } else if (tileId && cleanName) {
          // Create mock hive if tile not found in loaded tiles but we have tileId and name
          const mockHive = {
            UniqueId: tileId,
            id: tileId,
            Name: cleanName,
            Type: 'Selected'
          } as any;
          setSelectedHive(mockHive);
          if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
            console.log('🔧 Create Note: Tile not in store, created mock hive:', mockHive);
          }
        } else {
          if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
            console.log('❌ Create Note: No hive found for targetId:', targetId);
          }
        }
      } else if (tileId && cleanName) {
        // Create mock hive if tiles not loaded yet but we have tileId and name
        const mockHive = {
          UniqueId: tileId,
          id: tileId,
          Name: cleanName,
          Type: 'Selected'
        } as any;
        setSelectedHive(mockHive);
        if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
          console.log('🔧 Create Note: Tiles not loaded, created mock hive:', mockHive);
        }
      }
    }
  }, [searchParams, tiles]);

  // Load active family members into the store for People Involved dialog
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.accountId) return;
      if (family && family.length > 0) return;
      try {
        const members = await userService.getActiveFamilyMembers(user.accountId);
        if (cancelled) return;
        // Map API FamilyMember -> legacy User shape used by PeopleSelectionModal
        const mapped = members.map((m: any) => ({
          UniqueId: m.id,
          Account_uniqueId: m.accountId,
          FirstName: m.firstName || '',
          LastName: m.lastName || '',
          EmailAddress: m.emailAddress || '',
          EncryptedPassword: '',
          HouseDetails_Image: '',
          HouseDetails_Data: '',
          ActiveUser: !!m.activeUser,
          ActiveFamilyMember: m.activeFamilyMember ? !!m.activeUser : true,
          AvatarImagePath: m.avatarImagePath,
        }));
        setFamily(mapped);
      } catch (e) {
        console.warn('Failed to preload family members for People Involved:', e);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.accountId]);


  const handleSave = async () => {
    if (!user?.id || !user?.accountId) {
      console.error('User not authenticated');
      return;
    }

    if (!title.trim() && !text.trim() && checklistData.length === 0) {
      console.error('Note must have title, text, or checklist items');
      return;
    }

    setIsLoading(true);

    try {
      // For list mode, use "Checklist" as text content unless user entered custom text
      const textContent = isShowFields
        ? text || 'Note content'
        : text.trim() || 'Checklist';

      // Map synthetic tile to real tile for selectedHive
      let realTileId: string | undefined = undefined;
      if (selectedHive) {
        const selectedHiveId = selectedHive.UniqueId;
        const realHiveIds = await mapSyntheticTilesToRealTiles([selectedHiveId], user.id, user.accountId);
        realTileId = realHiveIds.length > 0 ? realHiveIds[0] : undefined;
      }

      // Handle user attribution and single-select assignment (align with tasks/events)
      const contactIdParam = searchParams.get('contactId') || undefined;

      const selectedAssignee = selectedFamilyMembers[0];
      // Always attribute to current user
      const homeMembers: string[] = [user.id];
      // Determine delegate: prefer explicit assignee selection; otherwise infer from People Involved (first person that isn’t me)
      const inferredAssigneeFromPeople = selectedPeople.find(p => p.UniqueId && p.UniqueId !== user.id)?.UniqueId;
      const effectiveDelegateUserId = (selectedAssignee && selectedAssignee.id && selectedAssignee.id !== user.id)
        ? selectedAssignee.id
        : inferredAssigneeFromPeople || undefined;

      const noteData: (Partial<INote> & { delegateUserId?: string }) = {
        User_uniqueId: user.id,
        Account_uniqueId: user.accountId,
        Title: title.trim() || textContent,
        Text: textContent,
        Priority: priority,
        Active: true,
        Deleted: false,
        Scheduled_Time: '00:00',
        Scheduled_Time_End: '23:59',
        tileId: realTileId,
        delegateUserId: effectiveDelegateUserId,
        contactId: contactIdParam,
        HomeMember_uniqueId: homeMemberIdParam || realTileId,
        HomeMembers: homeMembers,
        People_Involved: selectedPeople.map(person => person.UniqueId),
        Checklist_Data: !isShowFields ? JSON.stringify(checklistData) : undefined,
        BlackListed_Family: isPrivacyEnabled ? hideFromPeople.map(person => person.UniqueId) : [],
      };

      const createdNote = await createNote(noteData);
      addNote(createdNote);

      // Navigate back to returnTo page if provided, otherwise use standard logic
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        // Preserve mobile and token params if present
        const currentParams = new URLSearchParams(window.location.search);
        const mobile = currentParams.get('mobile');
        const token = currentParams.get('token');
        const urlObj = new URL(returnTo, window.location.origin);
        if (mobile) urlObj.searchParams.set('mobile', mobile);
        if (token) urlObj.searchParams.set('token', token);
        router.push(urlObj.pathname + urlObj.search);
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsLoading(false);
    }
  };



  // Ensure there's always an empty item at the end for seamless UX
  const getDisplayChecklistData = () => {
    const hasEmptyItem = checklistData.length === 0 || checklistData[checklistData.length - 1].text.trim() !== '';
    if (hasEmptyItem) {
      return [...checklistData, { text: tempLastItemText, checked: false }];
    }
    return checklistData;
  };

  const handleChecklistKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const displayData = getDisplayChecklistData();
      const isLastItem = index === displayData.length - 1;
      const currentText = (e.target as HTMLInputElement).value;

      if (isLastItem) {
        // If it's the last (empty) item and has text, add it to actual data
        if (currentText.trim() !== '') {
          setChecklistData([...checklistData, { text: currentText, checked: false }]);
          setTempLastItemText(''); // Clear the temp text
        }
      } else {
        // Add new checklist item after current one
        const newChecklistData = [...checklistData];
        newChecklistData.splice(index + 1, 0, { text: '', checked: false });
        setChecklistData(newChecklistData);
      }

      // Focus on the new input field after a brief delay
      setTimeout(() => {
        const inputs = document.querySelectorAll('.create-note-checklist-input');
        const nextInput = inputs[index + 1] as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }, 10);
    }
  };

  const updateChecklistItem = (index: number, text: string) => {
    const displayData = getDisplayChecklistData();
    const isLastItem = index === displayData.length - 1;

    if (isLastItem) {
      // If it's the last (empty) item, just update the temp text
      setTempLastItemText(text);
    } else {
      // Update existing item
      const updated = [...checklistData];
      updated[index].text = text;
      setChecklistData(updated);
    }
  };

  const toggleChecklistItem = (index: number) => {
    const displayData = getDisplayChecklistData();
    const isLastItem = index === displayData.length - 1;

    if (isLastItem) {
      // If it's the last (empty) item, add it to the actual data as checked
      const text = tempLastItemText.trim() || 'New item';
      setChecklistData([...checklistData, { text, checked: true }]);
      setTempLastItemText(''); // Clear the temp text
    } else {
      // Toggle existing item
      const updated = [...checklistData];
      updated[index].checked = !updated[index].checked;
      setChecklistData(updated);
    }
  };

  const removeChecklistItem = (index: number) => {
    // Don't remove the last empty item
    const displayData = getDisplayChecklistData();
    const isLastItem = index === displayData.length - 1;

    if (!isLastItem) {
      setChecklistData(checklistData.filter((_, i) => i !== index));
    }
  };

  // Handle hive selection from modal (single-select only)
  const handleHiveSelection = (selectedHives: any[], selectedHive?: any) => {
    if (selectedHive) {
      setSelectedHive(selectedHive);
    } else if (selectedHives.length > 0) {
      setSelectedHive(selectedHives[0]);
    } else {
      setSelectedHive(null);
    }
    setShowHiveSelectionModal(false);
  };

  // Handle family member selection
  const handleFamilyMemberSelection = (selectedMembers: any[], selectedMember?: any) => {
    setSelectedFamilyMembers(selectedMembers);
    setShowFamilyMemberSelectionModal(false);
  };

  const { i18n } = useLanguageContext();

  return (
    <>
      <style jsx>{`
        .create-task-input::placeholder,
        .create-task-textarea::placeholder,
        .create-note-checklist-input::placeholder {
          color: var(--primary-electric-40, #AAB5E5) !important;
          text-align: left;
          font-family: Poppins;
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          line-height: 100%;
          letter-spacing: -0.408px;
        }

        .create-task-input,
        .create-task-textarea,
        .create-note-checklist-input {
          color: var(--primary-electric-100, #2A46BE) !important;
          text-align: left;
          font-family: Poppins;
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          line-height: 100%;
          letter-spacing: -0.408px;
        }
      `}</style>
      <div className="create-note-wrapper">
        <div className="create-note-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          padding: '20px',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <button
          onClick={() => {
            const returnTo = searchParams.get('returnTo');
            if (returnTo) {
              // Preserve mobile and token params if present
              const currentParams = new URLSearchParams(window.location.search);
              const mobile = currentParams.get('mobile');
              const token = currentParams.get('token');
              const urlObj = new URL(returnTo, window.location.origin);
              if (mobile) urlObj.searchParams.set('mobile', mobile);
              if (token) urlObj.searchParams.set('token', token);
              router.push(urlObj.pathname + urlObj.search);
            } else {
              router.back();
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <img
            src="/icons/icon-menu-back.svg"
            width={24}
            height={24}
            alt={i18n.t('Back')}
            style={{ cursor: 'pointer' }}
          />
        </button>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
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
            }}
          >
            {i18n.t("CreateNote") || "Create Note"}
          </CustomText>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginLeft: 'auto'
        }}>
          <button
            onClick={() => setIsSettingsDialogOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon name="settings" width={24} height={24} color={Colors.BLUE} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="create-note-content">
        {/* Title Section */}
        <div className="create-note-title-section">
          {/* Title Label */}
          <div style={{
            color: 'var(--primary-dark-blue-100, #000E50)',
            fontFamily: 'Poppins',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '15px',
            marginBottom: '8px'
          }}>
            {i18n.t('Title')}
          </div>

          {/* Title Field Container */}
          <div style={{
            display: 'flex',
            padding: '8px 0',
            alignItems: 'center',
            gap: '8px',
            alignSelf: 'stretch',
          }}>
            <input
              type="text"
              placeholder={i18n.t("NoteTitlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="create-task-input"
              maxLength={256}
              autoCapitalize="sentences"
              style={{
                fontSize: '20px',
                fontFamily: 'Poppins',
                fontWeight: '500',
                border: 'none',
                outline: 'none',
                width: '100%',
                borderRadius: '12px',
                background: 'var(--primary-electric-3, #F7F9FF)',
                padding: '12px',
              }}
            />
            <div className="create-note-toggle-container">
              <button
                className={`create-note-toggle-btn ${isShowFields ? 'active' : ''}`}
                onClick={() => setIsShowFields(true)}
              >
                <Icon name="textAlignLeft" width={16} height={16} color={isShowFields ? Colors.BLUE : '#666E96'} />
              </button>
              <button
                className={`create-note-toggle-btn ${!isShowFields ? 'active' : ''}`}
                onClick={() => setIsShowFields(false)}
              >
                <Icon name="checklist" width={16} height={16} color={!isShowFields ? Colors.BLUE : '#666E96'} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            marginTop: '12px',
            marginBottom: '12px',
            height: '1px',
            backgroundColor: '#e5e5e5',
            width: '100%'
          }} />
        </div>

        {/* Content Section */}
        <div className="create-note-content-section" style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          alignSelf: 'stretch',
          flexDirection: 'column'
        }}>
          {isShowFields ? (
            // Rich Text Content
            <textarea
              placeholder={i18n.t("WriteYourNote")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="create-task-textarea"
              maxLength={2000}
              autoCapitalize="sentences"
              style={{
                fontSize: '16px',
                fontFamily: 'Poppins',
                fontWeight: '400',
                height: '200px',
                border: 'none',
                outline: 'none',
                width: '100%',
                borderRadius: '12px',
                background: 'var(--primary-electric-3, #F7F9FF)',
                padding: '12px',
                resize: 'none',
              }}
            />
          ) : (
            // Checklist Content
            <div className="create-note-checklist">
              {getDisplayChecklistData().map((item, index) => {
                const isLastItem = index === getDisplayChecklistData().length - 1;
                return (
                  <div key={index} className="create-note-checklist-item">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecklistItem(index)}
                      className="create-note-checkbox"
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateChecklistItem(index, e.target.value)}
                      onKeyDown={(e) => handleChecklistKeyDown(e, index)}
                      placeholder={isLastItem ? i18n.t('AddNewItem') : i18n.t('ChecklistItem')}
                      className="create-note-checklist-input"
                      autoFocus={isLastItem && getDisplayChecklistData().length === 1}
                    />
                    {!isLastItem && (
                      <button
                        onClick={() => removeChecklistItem(index)}
                        className="create-note-remove-btn"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider - only show for checklist */}
        {!isShowFields && (
          <div style={{
            marginTop: '12px',
            marginBottom: '12px',
            height: '1px',
            backgroundColor: '#e5e5e5',
            width: '100%'
          }} />
        )}

        {/* Assign to Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          marginTop: '16px',
        }}>
          <CustomText style={{
            color: 'var(--primary-dark-blue-60, #666E96)',
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '15px',
          }}>
            {i18n.t('AssignTo')}
          </CustomText>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            paddingBottom: '16px',
            backgroundColor: Colors.WHITE,
            borderRadius: '8px',
            cursor: 'pointer',
          }} onClick={() => !selectedHive && setShowHiveSelectionModal(true)}>
            <img
              src="/dents/icon-assign-hive.svg"
              alt="hive"
              style={{
                width: '24px',
                height: '24px',
              }}
            />
            <CustomText style={{
              flex: 1,
              color: selectedHive ? Colors.BLUE : '#999FB9',
              fontSize: '16px',
              fontFamily: 'Poppins',
              fontStyle: 'normal',
              fontWeight: '400',
              lineHeight: '21px',
              letterSpacing: '-0.408px',
            }}>
              {selectedHive ? selectedHive.Name : i18n.t('SelectAHive')}
            </CustomText>
          </div>
        </div>

        {/* Priority Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
        }}>
          <CustomText style={{
            color: 'var(--primary-dark-blue-60, #666E96)',
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '15px',
          }}>
            {i18n.t('Priority')}
          </CustomText>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'stretch',
          }}>
            {/* None Priority */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                opacity: priority === 0 ? 1 : 0.5,
              }}
              onClick={() => setPriority(0)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M13.3333 10H6.66663" stroke="#666E96" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.99996 18.3337C14.6023 18.3337 18.3333 14.6027 18.3333 10.0003C18.3333 5.39795 14.6023 1.66699 9.99996 1.66699C5.39759 1.66699 1.66663 5.39795 1.66663 10.0003C1.66663 14.6027 5.39759 18.3337 9.99996 18.3337Z" stroke="#666E96" strokeWidth="1.25" strokeLinejoin="round"/>
              </svg>
              <CustomText style={{
                color: 'var(--primary-dark-blue-60, #666E96)',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '19px',
                letterSpacing: '-0.084px',
              }}>
                {i18n.t('None')}
              </CustomText>
            </div>

            {/* Low Priority */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                opacity: priority === 1 ? 1 : 0.5,
              }}
              onClick={() => setPriority(1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3.33337 11.667V17.5003" stroke="#6CC47C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.79804 3.1991C7.04367 1.77488 4.4142 2.83108 3.33337 3.68353V12.3545C4.14146 11.426 6.5657 9.98675 9.79804 11.6581C12.6867 13.1518 15.5037 12.3313 16.6667 11.686V3.34011C14.4247 4.35967 12.0145 4.34516 9.79804 3.1991Z" stroke="#6CC47C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <CustomText style={{
                color: 'var(--Accent-Color-Green-1, #6CC47C)',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '19px',
                letterSpacing: '-0.084px',
              }}>
                {i18n.t('Low')}
              </CustomText>
            </div>

            {/* Medium Priority */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                opacity: priority === 2 ? 1 : 0.5,
              }}
              onClick={() => setPriority(2)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3.33337 11.667V17.5003" stroke="#FFA020" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.79804 3.1991C7.04367 1.77488 4.4142 2.83108 3.33337 3.68353V12.3545C4.14146 11.426 6.5657 9.98675 9.79804 11.6581C12.6867 13.1518 15.5037 12.3313 16.6667 11.686V3.34011C14.4247 4.35967 12.0145 4.34516 9.79804 3.1991Z" stroke="#FFA020" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <CustomText style={{
                color: 'var(--Accent-Color-Orange-1, #FFA020)',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '19px',
                letterSpacing: '-0.084px',
              }}>
                {i18n.t('Medium')}
              </CustomText>
            </div>

            {/* High Priority */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                opacity: priority === 3 ? 1 : 0.5,
              }}
              onClick={() => setPriority(3)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3.33337 11.667V17.5003" stroke="#FF6961" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.79804 3.1991C7.04367 1.77488 4.4142 2.83108 3.33337 3.68353V12.3545C4.14146 11.426 6.5657 9.98675 9.79804 11.6581C12.6867 13.1518 15.5037 12.3313 16.6667 11.686V3.34011C14.4247 4.35967 12.0145 4.34516 9.79804 3.1991Z" stroke="#FF6961" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <CustomText style={{
                color: 'var(--Accent-Color-Red-1, #FF6961)',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '19px',
                letterSpacing: '-0.084px',
              }}>
                {i18n.t('High')}
              </CustomText>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ padding: '16px 0 16px 0' }}>
          <button
            onClick={handleSave}
            disabled={isLoading || (!title.trim() && !text.trim() && checklistData.length === 0)}
            style={{
              width: '100%',
              backgroundColor: isLoading || (!title.trim() && !text.trim() && checklistData.length === 0) ? '#d1d5db' : Colors.BLUE,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '16px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              cursor: isLoading || (!title.trim() && !text.trim() && checklistData.length === 0) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            {isLoading ? i18n.t('Saving') : i18n.t('Save')}
          </button>
        </div>
      </div>

      {/* Settings Dialog */}
      <NoteSettingsDialog
        isOpen={isSettingsDialogOpen}
        onRequestClose={() => setIsSettingsDialogOpen(false)}
        selectedHive={selectedHive}
        setSelectedHive={setSelectedHive}
        priority={priority}
        setPriority={setPriority}
        peopleInvolved={selectedPeople}
        setPeopleInvolved={setSelectedPeople}
        isPrivacyEnabled={isPrivacyEnabled}
        setIsPrivacyEnabled={setIsPrivacyEnabled}
        hideFromPeople={hideFromPeople}
        setHideFromPeople={setHideFromPeople}
        onSelectHive={() => {
          setIsSettingsDialogOpen(false);
          // TODO: Open hive selection modal
        }}
        onSelectPeople={() => {
          setIsSettingsDialogOpen(false);
          // TODO: Open people selection modal
        }}
        onTogglePrivacy={() => {
          setIsPrivacyEnabled(!isPrivacyEnabled);
        }}
      />

      {/* Hive Selection Modal */}
      <HiveSelectionModal
        isVisible={showHiveSelectionModal}
        onClose={() => setShowHiveSelectionModal(false)}
        onHiveSelect={handleHiveSelection}
        multiSelect={false}
        initialSelectedHive={selectedHive}
      />

      {/* Family Member Selection Modal */}
      <FamilyMemberSelectionModal
        isVisible={showFamilyMemberSelectionModal}
        onClose={() => setShowFamilyMemberSelectionModal(false)}
        onMemberSelect={(members, member) => {
          setSelectedFamilyMembers(member ? [member] : []);
          setShowFamilyMemberSelectionModal(false);
        }}
        multiSelect={false}
        initialSelectedMembers={[]}
        initialSelectedMember={selectedFamilyMembers[0] || null}
      />
      </div>
    </div>
    </>
  );
};

const CreateNotePage: React.FC = () => {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f8ff'
      }}>
        <LoadingSpinner />
      </div>
    }>
      <CreateNoteContent />
    </Suspense>
  );
};

export default CreateNotePage;
