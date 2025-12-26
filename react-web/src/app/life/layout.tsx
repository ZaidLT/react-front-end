'use client';

import React from 'react';

interface LifeLayoutProps {
  children: React.ReactNode;
}

const LifeLayout: React.FC<LifeLayoutProps> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
};

export default LifeLayout;
