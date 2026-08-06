import React, { useContext, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { AuthContext } from '../context/AuthContext';
import { subscribeToGlobalLoading } from '../api/api';

export default function PageLayout({ children, role, title }) {
  const { user } = useContext(AuthContext);
  const currentRole = role || user?.role;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingPageData, setIsLoadingPageData] = useState(false);

  useEffect(() => subscribeToGlobalLoading(setIsLoadingPageData), []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex bg-[#f1f5f9] dark:bg-[#0f172a] min-h-screen transition-colors duration-300 relative overflow-x-hidden">
      {/* Sidebar - Responsive handling */}
      <div className={`fixed inset-0 z-40 transition-opacity bg-black/50 lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleSidebar} />
      
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:self-stretch lg:translate-x-0 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar role={currentRole} onClose={() => setIsSidebarOpen(false)} />
      </div>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full relative">
        <Header onMenuClick={toggleSidebar} />
        {title && <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-6">{title}</h1>}
        <div className="w-full overflow-hidden">
          {children}
        </div>
        {isLoadingPageData && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#f1f5f9]/85 dark:bg-[#0f172a]/85 backdrop-blur-[1px]">
            <div className="rounded-xl border border-blue-100 dark:border-blue-900/50 bg-white dark:bg-gray-800 px-5 py-4 text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 shadow-lg">
              Loading page details…
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
