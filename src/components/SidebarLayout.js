'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useEffect } from 'react';

export default function SidebarLayout({ children }) {
  const { status } = useSession();
  const pathname = usePathname();
  
  // Force dark theme for all users
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  
  // Check if current page is home page
  const isHomePage = pathname === '/' || pathname === '/home';
  
  // Only show the sidebar if authenticated and not on home page
  const showSidebar = status === 'authenticated' && !isHomePage;
  
  return (
    <div className={"min-h-screen bg-[#2a2a60] " + (showSidebar ? 'with-sidebar' : '') + " flex flex-col"}>
      {showSidebar && <Sidebar />}
      <main className={"transition-all duration-300 " + (showSidebar ? 'md:ml-60' : '') + " flex-grow"}>
        {children}
      </main>
      {!showSidebar && <Footer />}
    </div>
  );
} 