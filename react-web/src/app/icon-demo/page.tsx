'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Colors, Typography } from '../../styles';
import { FLAGS_MAPPED } from '../../assets/flags/flagsMapped';

// Use dynamic import with SSR disabled for components that use router
const Icon = dynamic(() => import('../../components/Icon'), {
  ssr: false
});

const IconDemoPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Define some common icons to display - only include icons that actually exist in the project
  const commonIcons = [
    // Special icons that are directly defined in the Icon component
    'family', 'family-icon', 'eeva-logo', 'house-icon', 'alarm',
    'clock-alarm', 'search-alt', 'location',

    // Directly imported SVG icons
    'house', 'task', 'flag', 'flag_circle', 'calendar', 'user', 'search', 'settings',

    // Icons from ICONS_MAP
    'eye', 'fridge', 'backArrow', 'plus', 'close', 'checkmark', 'profile',

    // Icons from iconMapping.ts
    'briefcase', 'heart', 'dollar-sign', 'map', 'shopping-cart',
    'calendar-today', 'calendar-upcoming', 'calendar-month', 'checkmark-circle',
    'list-all', 'mail'
  ];

  // Define squiggle icons
  const squiggleIcons = [
    'squiggles-basic-burst-01',
    'squiggles-basic-burst',
    'squiggles-basic',
    'squiggles-basic-turquoise',
    'purple-squiggles',
    'squiggles-basic-box',
    'squiggles-basic-check',
    'squiggles-basic-line',
    'squiggles-basic-plus-01',
    'squiggles-burst',
    'squiggles-circles',
    'squiggles-bended-arrow-purple',
    'squiggles-basic-arrow-05',
    'squiggles-bended-arrow',
    'squiggles-horizontal-loops',
    'squiggles-basic-oval-select',
    'squiggles-basic-oval',
    'squiggles-basic-check-01',
    'squiggles-bended-arrow-2'
  ];

  // Flag icons
  const flagIcons = Object.keys(FLAGS_MAPPED);

  // Filter icons based on search term
  const filteredCommonIcons = commonIcons.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSquiggleIcons = squiggleIcons.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFlagIcons = flagIcons.filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/home" style={{
          textDecoration: 'none',
          color: Colors.BLUE,
          fontSize: Typography.FONT_SIZE_16,
          fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
        }}>
          ← Back to Home
        </Link>
      </div>

      <h1 style={{
        fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
        fontSize: Typography.FONT_SIZE_24,
        color: Colors.MIDNIGHT,
        marginBottom: '10px'
      }}>
        Icon Demo
      </h1>
      <p>This page demonstrates common icons in the application.</p>
      <p>Note: Not all icons may render correctly as this is a demo page.</p>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search icons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            width: '300px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
      </div>

      <h2>Common Icons ({filteredCommonIcons.length})</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {filteredCommonIcons.map(iconName => (
          <div
            key={iconName}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '120px',
              height: '100px',
              padding: '10px',
              border: '1px solid #eee',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <Icon name={iconName} width={40} height={40} color={Colors.BLUE} />
            <div style={{
              marginTop: '10px',
              fontSize: '12px',
              textAlign: 'center',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              {iconName}
            </div>
          </div>
        ))}
      </div>

      <h2>Squiggle Icons ({filteredSquiggleIcons.length})</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {filteredSquiggleIcons.map(iconName => (
          <div
            key={iconName}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '120px',
              height: '100px',
              padding: '10px',
              border: '1px solid #eee',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <img
              src={`/hive-icons/${iconName}.svg`}
              alt={iconName}
              width={40}
              height={40}
              style={{ objectFit: 'contain' }}
            />
            <div style={{
              marginTop: '10px',
              fontSize: '12px',
              textAlign: 'center',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              {iconName}
            </div>
          </div>
        ))}
      </div>

      <h2>Flag Icons ({filteredFlagIcons.length})</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {filteredFlagIcons.map(iconName => (
          <div
            key={iconName}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '120px',
              height: '100px',
              padding: '10px',
              border: '1px solid #eee',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <Icon name={iconName} width={40} height={40} />
            <div style={{
              marginTop: '10px',
              fontSize: '12px',
              textAlign: 'center',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}>
              {iconName}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconDemoPage;
