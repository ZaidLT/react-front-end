'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Colors, Typography } from '../../styles';

// Use dynamic import with SSR disabled for components that use router
const ComponentDemo = dynamic(() => import('../../components/ComponentDemo'), {
  ssr: false
});

const ComponentDemoPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
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
        marginBottom: '20px'
      }}>
        Component Demo
      </h1>
      <ComponentDemo />
    </div>
  );
};

export default ComponentDemoPage;
