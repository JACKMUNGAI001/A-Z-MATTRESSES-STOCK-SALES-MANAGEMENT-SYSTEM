import React, { useContext } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthContext } from '../context/AuthContext';

export default function PageLayout({ children, role, title }) {
  const { user } = useContext(AuthContext);
  const currentRole = role || user?.role;

  return (
    <div className="flex bg-[#f1f5f9] dark:bg-[#0f172a] min-h-screen transition-colors duration-300">
      <Sidebar role={currentRole} />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Header />
        {title && <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
