import React, { useState } from 'react';
import { Colors, Typography } from '../styles';

export interface TabItem {
  key: string;
  title: string;
  content: React.ReactNode;
  badge?: number;
}

interface TabViewProps {
  tabs: TabItem[];
  initialTab?: string;
  onTabChange?: (tabKey: string) => void;
  style?: React.CSSProperties;
}

const TabView: React.FC<TabViewProps> = ({
  tabs,
  initialTab,
  onTabChange,
  style,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || (tabs.length > 0 ? tabs[0].key : ''));

  const handleTabPress = (tabKey: string) => {
    setActiveTab(tabKey);
    if (onTabChange) {
      onTabChange(tabKey);
    }
  };

  const activeTabContent = tabs.find(tab => tab.key === activeTab)?.content;

  return (
    <div style={{ ...style }}>
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${Colors.COSMIC}`,
        marginBottom: 16,
      }}>
        {tabs.map(tab => (
          <div
            key={tab.key}
            onClick={() => handleTabPress(tab.key)}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              position: 'relative',
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              fontSize: 14,
              color: activeTab === tab.key ? Colors.PRIMARY_ELECTRIC_BLUE : Colors.GREY_COLOR,
              borderBottom: activeTab === tab.key ? `2px solid ${Colors.PRIMARY_ELECTRIC_BLUE}` : 'none',
              marginBottom: activeTab === tab.key ? -1 : 0,
            }}
          >
            {tab.title}
            {tab.badge !== undefined && tab.badge > 0 && (
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: Colors.PRIMARY_ELECTRIC_BLUE,
                color: Colors.WHITE,
                borderRadius: 10,
                fontSize: 10,
                minWidth: 16,
                height: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}>
                {tab.badge}
              </div>
            )}
          </div>
        ))}
      </div>
      <div>
        {activeTabContent}
      </div>
    </div>
  );
};

export default TabView;
