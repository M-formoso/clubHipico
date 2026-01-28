import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main className="min-h-[calc(100vh-3.5rem)] w-full flex-1 p-3 sm:p-4 sm:min-h-[calc(100vh-4rem)] lg:ml-64 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
