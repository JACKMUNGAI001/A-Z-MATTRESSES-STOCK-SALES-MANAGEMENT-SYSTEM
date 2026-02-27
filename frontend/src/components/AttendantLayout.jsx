import React from 'react';
import PageLayout from './PageLayout';

export default function AttendantLayout({ children }) {
  return (
    <PageLayout role="attendant">
      {children}
    </PageLayout>
  );
}

