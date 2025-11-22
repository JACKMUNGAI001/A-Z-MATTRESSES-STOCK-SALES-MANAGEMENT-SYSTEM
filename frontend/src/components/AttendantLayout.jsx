import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AttendantLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar role="attendant" />
      <main className="flex-1 p-6">
        <Header />
        {children}
      </main>
    </div>
  );
}
