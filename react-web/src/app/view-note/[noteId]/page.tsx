'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import CustomText from '../../../components/CustomText';
import LoadingSpinner from '../../../components/LoadingSpinner';

import DeleteModal from '../../../components/DeleteModal';
import { Colors, Typography } from '../../../styles';
import { useLanguageContext } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { INote, User } from '../../../services/types';
import { getNoteById, deleteNote, updateNote } from '../../../services/services';
import { useNoteStore, useFamilyStore } from '../../../context/store';


import tileService from '../../../services/tileService';




const ViewNoteContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user: authUser } = useAuth();
  
  // Store states - must be declared before any early returns

  const family = useFamilyStore((state) => state.family);

  // Local state
  const [note, setNote] = useState<INote | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHives, setSelectedHives] = useState<any[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<User[]>([]);
  const [checklistData, setChecklistData] = useState<Array<{text: string, checked: boolean}>>([]);
  const [isUpdatingChecklist, setIsUpdatingChecklist] = useState(false);

  const noteId = Array.isArray(params.noteId) ? params.noteId[0] : params.noteId;

  // Load note data - must be before early return
  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true);

        // Validate inputs before making API call
        if (!noteId || !authUser?.accountId) {
          setLoading(false);
          return;
        }
        const fetchedNote = await getNoteById(noteId, authUser.accountId);

        if (fetchedNote) {
          setNote(fetchedNote);

          // Parse checklist data if exists
          if (fetchedNote.Checklist_Data) {
            try {
              const parsedChecklist = JSON.parse(fetchedNote.Checklist_Data);
              if (Array.isArray(parsedChecklist)) {
                setChecklistData(parsedChecklist);
              }
            } catch (error) {
              console.error('Error parsing checklist data:', error);
            }
          } else {
            setChecklistData([]);
          }

          // Update store with the fetched note
          const updateNote = useNoteStore.getState().updateNote;
          updateNote(fetchedNote);

          // Load related data (hives, family members, etc.)
          // Check multiple fields for hive assignment: tileId, HomeMember_uniqueId, or HomeMembers array
          const hiveId = fetchedNote.tileId || fetchedNote.HomeMember_uniqueId || (fetchedNote.HomeMembers && fetchedNote.HomeMembers.length > 0 ? fetchedNote.HomeMembers[0] : null);

          if (hiveId && authUser?.id) {
            // Load hive data for the note
            try {
              const hive = await tileService.getTileById(hiveId, authUser.accountId!, authUser.id!);
              if (hive) {
                setSelectedHives([hive]);
              }
            } catch (error) {
              console.warn(`Failed to load hive ${hiveId}:`, error);
            }
          }

          // Set family members involved in the note
          if (fetchedNote.User_uniqueId) {
            const involvedMember = family.find(member => member.UniqueId === fetchedNote.User_uniqueId);
            if (involvedMember) {
              setSelectedFamily([involvedMember]);
            }
          }
        }
      } catch (error) {
        console.error('Error loading note:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only run if we have both noteId and accountId
    if (noteId && authUser?.accountId) {
      loadNote();
    }
  }, [noteId, authUser?.accountId]); // Simplified dependencies

  // Validate noteId
  if (!noteId || noteId === 'undefined') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f8ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>{i18n.t('InvalidNoteId')}</h2>
          <p>{i18n.t('NoteIdMissingOrInvalid')}</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    if (note && note.UniqueId) {
      const currentParams = new URLSearchParams(window.location.search);
      const returnTo = searchParams.get('returnTo') || '/life';
      const mobile = currentParams.get('mobile');
      const token = currentParams.get('token');

      const url = new URL(`/edit-note/${note.UniqueId}`, window.location.origin);
      if (returnTo) url.searchParams.set('returnTo', returnTo);
      if (mobile) url.searchParams.set('mobile', mobile);
      if (token) url.searchParams.set('token', token);

      router.push(url.pathname + url.search);
    }
  };

  const toggleChecklistItem = async (index: number) => {
    if (!note || !note.UniqueId || isUpdatingChecklist) return;

    try {
      setIsUpdatingChecklist(true);

      // Update local state
      const updatedChecklist = [...checklistData];
      updatedChecklist[index].checked = !updatedChecklist[index].checked;
      setChecklistData(updatedChecklist);

      // Prepare note data for update
      const noteData: Partial<INote> = {
        ...note,
        Checklist_Data: JSON.stringify(updatedChecklist),
      };

      // Update note via API
      const updatedNote = await updateNote(note.UniqueId, noteData);

      // Update local note state
      setNote(updatedNote);

      // Update store with the updated note
      const updateNoteInStore = useNoteStore.getState().updateNote;
      updateNoteInStore(updatedNote);

    } catch (error) {
      console.error('Error updating checklist item:', error);
      // Revert local state on error
      const revertedChecklist = [...checklistData];
      revertedChecklist[index].checked = !revertedChecklist[index].checked;
      setChecklistData(revertedChecklist);
    } finally {
      setIsUpdatingChecklist(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !authUser?.id || !authUser?.accountId) return;

    try {
      setDeleting(true);

      // Delete note via API
      await deleteNote(note.UniqueId!, authUser.id, authUser.accountId);

      // Remove from store
      const deleteNoteFromStore = useNoteStore.getState().deleteNote;
      deleteNoteFromStore(note.UniqueId!);

      // Navigate deterministically to returnTo (or /life) instead of history back
      const currentParams = new URLSearchParams(window.location.search);
      const returnTo = searchParams.get('returnTo') || '/life';
      const mobile = currentParams.get('mobile');
      const token = currentParams.get('token');
      const url = new URL(returnTo, window.location.origin);
      if (mobile) url.searchParams.set('mobile', mobile);
      if (token) url.searchParams.set('token', token);
      router.replace(url.pathname + url.search);
    } catch (error) {
      console.error('Error deleting note:', error);
      alert(i18n.t('FailedToDeleteNote'));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Priority mapping to match backend API (0=None, 1=Low, 2=Medium, 3=High)
  const priorityToTitleColorMap: Record<number, { title: string; color: string }> = {
    0: { title: i18n.t('None'), color: Colors.GREY_COLOR },
    1: { title: i18n.t('Low'), color: Colors.PISTACHIO_GREEN },
    2: { title: i18n.t('Medium'), color: Colors.MUSTARD },
    3: { title: i18n.t('High'), color: Colors.RED },
  };

  const getPriorityLabel = (priority?: number): string => {
    if (priority && priorityToTitleColorMap[priority]) {
      return priorityToTitleColorMap[priority].title;
    }
    return i18n.t('Normal');
  };

  const getPriorityColor = (priority?: number): string => {
    if (priority && priorityToTitleColorMap[priority]) {
      return priorityToTitleColorMap[priority].color;
    }
    return Colors.GREY_COLOR;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f8ff'
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!note) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f8ff',
        padding: '20px'
      }}>
        <CustomText style={{
          fontSize: Typography.FONT_SIZE_18,
          fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
          color: Colors.GREY_COLOR,
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          {i18n.t('NoteNotFound')}
        </CustomText>
        <button
          onClick={() => {
            const currentParams = new URLSearchParams(window.location.search);
            const returnTo = searchParams.get('returnTo') || '/life';
            const mobile = currentParams.get('mobile');
            const token = currentParams.get('token');
            const url = new URL(returnTo, window.location.origin);
            if (mobile) url.searchParams.set('mobile', mobile);
            if (token) url.searchParams.set('token', token);
            router.replace(url.pathname + url.search);
          }}
          style={{
            backgroundColor: Colors.BLUE,
            color: Colors.WHITE,
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            cursor: 'pointer'
          }}
        >
          {i18n.t('GoBack')}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f8ff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Main Container */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        backgroundColor: Colors.WHITE,
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px',
          borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
          backgroundColor: Colors.WHITE,
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <CustomText style={{
            color: Colors.BLUE,
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM
          }}>
            {i18n.t('Back')}
          </CustomText>
        </button>

        <CustomText style={{
          fontSize: Typography.FONT_SIZE_18,
          fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
          color: Colors.MIDNIGHT,
          textAlign: 'center',
          flex: 1,
          marginLeft: '20px',
          marginRight: '20px'
        }}>
          {i18n.t('ViewNote')}
        </CustomText>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleEdit}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              borderRadius: '4px'
            }}
            title={i18n.t('Edit')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              borderRadius: '4px'
            }}
            title={i18n.t('Delete')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H5H21" stroke={Colors.RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke={Colors.RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
        padding: '40px 20px',
        boxSizing: 'border-box',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        {/* Note Title */}
        <div>
          <CustomText style={{
            fontSize: Typography.FONT_SIZE_20,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.MIDNIGHT,
            lineHeight: '1.3',
            marginBottom: '20px'
          }}>
            {note.Title}
          </CustomText>
        </div>

        {/* Note Description */}
        <div>
          <CustomText style={{
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            color: Colors.BLUE,
            lineHeight: '1.5'
          }}>
            {note.Text || i18n.t('NoDescriptionProvided')}
          </CustomText>
        </div>

        {/* Checklist Section */}
        {checklistData.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <CustomText style={{
              fontSize: Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.BLUE
            }}>
              {i18n.t('ChecklistItems')}
            </CustomText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {checklistData.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    borderBottom: index < checklistData.length - 1 ? `1px solid ${Colors.LIGHT_GREY}` : 'none'
                  }}
                >
                  <button
                    onClick={() => toggleChecklistItem(index)}
                    disabled={isUpdatingChecklist}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: isUpdatingChecklist ? 'not-allowed' : 'pointer',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: isUpdatingChecklist ? 0.6 : 1
                    }}
                    title={item.checked ? i18n.t('MarkAsIncomplete') : i18n.t('MarkAsComplete')}
                  >
                    {item.checked ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" fill={Colors.GREEN} stroke={Colors.GREEN} strokeWidth="2"/>
                        <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke={Colors.BLUE} strokeWidth="2" fill="none"/>
                      </svg>
                    )}
                  </button>
                  <CustomText style={{
                    fontSize: Typography.FONT_SIZE_16,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                    color: item.checked ? Colors.GRAY : Colors.BLUE,
                    textDecoration: item.checked ? 'line-through' : 'none',
                    flex: 1,
                    lineHeight: '1.4'
                  }}>
                    {item.text}
                  </CustomText>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notification Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <CustomText style={{
            fontSize: Typography.FONT_SIZE_12,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.BLUE
          }}>
            {i18n.t('Notification')}
          </CustomText>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.0858 13.5858L21.5 15V16.382C21.5 16.7607 21.2878 17.109 20.9413 17.2618C19.3485 17.964 16.2311 19 12 19C7.76887 19 4.65146 17.964 3.05874 17.2618C2.71215 17.109 2.5 16.7607 2.5 16.382V15L3.91421 13.5858C4.28929 13.2107 4.5 12.702 4.5 12.1716V9.5C4.5 5.35786 7.85786 2 12 2C12.5137 2 13.0153 2.05165 13.5 2.15003" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.5 19C15.5 20.6569 13.9102 22 11.9719 22C10.0336 22 8.5 20.6569 8.5 19" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <CustomText style={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              color: Colors.BLUE
            }}>
              {i18n.t('None')}
            </CustomText>
          </div>
        </div>

        {/* Hive Section */}
        {(() => {
          const tileId = note.tileId || note.HomeMember_uniqueId || note.HomeMembers?.[0];
          return (tileId || (note.HomeMembers && note.HomeMembers.length > 0)) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_12,
                fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                color: Colors.BLUE
              }}>
                {i18n.t('Hive')}
              </CustomText>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 22V12H15V22" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  color: Colors.BLUE
                }}>
                  {selectedHives.length > 0 ? selectedHives[0].Name : i18n.t('NoHiveAssigned')}
                </CustomText>
              </div>
            </div>
          );
        })()}

        {/* Privacy and Hide From Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
          {/* Privacy Section */}
          <div style={{ flex: 1 }}>
            <CustomText style={{
              fontSize: Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.BLUE,
              marginBottom: '10px'
            }}>
              {i18n.t('Privacy')}
            </CustomText>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 20.5H2C2 16.634 5.13401 13.5 9 13.5H11C11.695 13.5 12.3663 13.6013 13 13.7899M14 6.5C14 8.70914 12.2091 10.5 10 10.5C7.79086 10.5 6 8.70914 6 6.5C6 4.29086 7.79086 2.5 10 2.5C12.2091 2.5 14 4.29086 14 6.5Z" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16.5 16H15V21.5H22V16H20.5M16.5 16V14.5C16.5 13.3954 17.3954 12.5 18.5 12.5C19.6046 12.5 20.5 13.3954 20.5 14.5V16M16.5 16H20.5" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.BLUE
              }}>
                {i18n.t('VisibleToEveryone')}
              </CustomText>
            </div>
          </div>

          {/* Hide From Section */}
          <div style={{ flex: 1 }}>
            <CustomText style={{
              fontSize: Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.BLUE,
              marginBottom: '10px'
            }}>
              {i18n.t('HideFrom')}
            </CustomText>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A18.5 18.5 0 0 1 19.42 16.42" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1L23 23" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.BLUE
              }}>
                {note.BlackListed_Family && note.BlackListed_Family.length > 0
                  ? i18n.t('XPeople', { count: note.BlackListed_Family.length })
                  : i18n.t('None')
                }
              </CustomText>
            </div>
          </div>
        </div>

        {/* People Involved */}
        {selectedFamily.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <CustomText style={{
              fontSize: Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.BLUE
            }}>
              {i18n.t('PeopleInvolved')}
            </CustomText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {selectedFamily.map((familyMember) => (
                <div
                  key={familyMember.UniqueId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 11L19 13L23 9" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <CustomText style={{
                    fontSize: Typography.FONT_SIZE_16,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                    color: Colors.BLUE
                  }}>
                    {familyMember.FirstName} {familyMember.LastName}
                  </CustomText>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority with Circular Flag Icon */}
        {note.Priority !== undefined && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <CustomText style={{
              fontSize: Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.BLUE
            }}>
              {i18n.t('Priority')}
            </CustomText>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.66699 5.83337V8.75004" stroke={getPriorityColor(note.Priority)} strokeWidth="0.625" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.89932 1.59955C3.52214 0.887438 2.2074 1.41554 1.66699 1.84177V6.17725C2.07103 5.713 3.28315 4.99337 4.89932 5.82904C6.34366 6.57587 7.75216 6.16567 8.33366 5.843V1.67005C7.21266 2.17983 6.00753 2.17258 4.89932 1.59955Z" stroke={getPriorityColor(note.Priority)} strokeWidth="0.625" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <CustomText style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.BLUE
              }}>
                {getPriorityLabel(note.Priority)}
              </CustomText>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isVisible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        category="note"
      />
      </div>
    </div>
  );
};

const ViewNotePage: React.FC = () => {
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
      <ViewNoteContent />
    </Suspense>
  );
};

export default ViewNotePage;
