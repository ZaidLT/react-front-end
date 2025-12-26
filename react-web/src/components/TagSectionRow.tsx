'use client';

import React, { useState } from 'react';
import { Colors } from '../styles/index';
import {
  FONT_FAMILY_POPPINS_REGULAR,
  FONT_SIZE_12,
  FONT_SIZE_16,
} from '../styles/typography';
import { useLanguageContext } from '../context/LanguageContext';
import CustomText from './CustomText';
import Icon from './Icon';
import { ITag } from '../services/types';
import { useAuth } from '../context/AuthContext';

interface Props {
  setTagList: React.Dispatch<React.SetStateAction<ITag[]>>;
  tagList: ITag[];
}

const TagSectionRow: React.FC<Props> = ({ setTagList, tagList }) => {
  const { i18n } = useLanguageContext();
  const { user } = useAuth();
  const [currentTagInput, setCurrentTagInput] = useState<string>('');

  const addTag = async () => {
    const trimmedTag = currentTagInput.trim();
    if (!trimmedTag) return;

    // For now, create a simple tag object
    // TODO: Implement proper tag creation API call
    const newTag: ITag = {
      UniqueId: `temp-${Date.now()}`,
      TagName: trimmedTag,
      Account_uniqueId: user?.accountId || '',
      User_uniqueId: user?.id || '',
    };

    setTagList((prevList) => [...prevList, newTag]);
    setCurrentTagInput('');
  };

  const removeTag = (tag: ITag) => {
    setTagList((prevList) => prevList.filter((t) => t.TagName !== tag.TagName));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag();
    }
  };

  return (
    <div style={styles.tagSectionContainer}>
      <CustomText style={styles.tagLabel}>
        Tag
      </CustomText>

      <div style={styles.tagInputContainer}>
        <Icon name="tag" width={24} height={24} />
        <input
          style={styles.tagTextInput}
          placeholder={i18n.t('CreateATag')}
          value={currentTagInput}
          onChange={(e) => setCurrentTagInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />

        {/* Scrollable Container */}
        <div style={styles.scrollableContainer}>
          <div style={styles.scrollContent}>
            {tagList.map((tag, index) => (
              <div
                key={index}
                style={styles.tag}
              >
                <div style={styles.tagNameContainer}>
                  <Icon name="tag" width={16} height={16} />
                  <CustomText style={styles.tagText}>{tag.TagName}</CustomText>
                </div>
                <div
                  onClick={() => removeTag(tag)}
                  style={styles.removeButton}
                >
                  <CustomText style={styles.removeText}>×</CustomText>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  tagSectionContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: '20px',
  } as React.CSSProperties,
  tagLabel: {
    color: Colors.BLUE,
    fontSize: FONT_SIZE_12,
    fontWeight: '600',
    marginBottom: '8px',
    alignSelf: 'flex-start',
  } as React.CSSProperties,
  tagInputContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    height: '42px',
  } as React.CSSProperties,
  tagTextInput: {
    flex: 1,
    paddingLeft: '10px',
    fontSize: FONT_SIZE_16,
    fontFamily: FONT_FAMILY_POPPINS_REGULAR,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
  } as React.CSSProperties,
  tag: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '2px',
    paddingHorizontal: '14px',
    borderRadius: '40px',
    gap: '8px',
    background: 'linear-gradient(90deg, #DEF7F6 0%, #EDEEFF 100%)',
    marginRight: '8px',
  } as React.CSSProperties,
  tagNameContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
  } as React.CSSProperties,
  tagText: {
    fontSize: FONT_SIZE_12,
    fontFamily: FONT_FAMILY_POPPINS_REGULAR,
  } as React.CSSProperties,
  removeButton: {
    cursor: 'pointer',
    padding: '2px',
  } as React.CSSProperties,
  removeText: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: Colors.GREY_COLOR,
  } as React.CSSProperties,
  scrollContent: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
  } as React.CSSProperties,
  scrollableContainer: {
    maxHeight: '32px',
    maxWidth: '60%',
    overflow: 'hidden',
  } as React.CSSProperties,
};

export default TagSectionRow;
