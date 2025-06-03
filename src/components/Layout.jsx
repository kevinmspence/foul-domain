import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load sidebar state from localStorage on desktop
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored !== null) setCollapsed(stored === 'true');
  }, []);

  const toggleSidebar = (forceState = null) => {
    const next = forceState !== null ? forceState : !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', next);
  };

  return (
    <>
      {/* Sidebar with support for off-canvas behavior */}
      <Sidebar
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Overlay for mobile to close sidebar when clicking outside */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ☰ toggle button – top-left for testing */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 bg-gray-800 text-white px-3 py-2 rounded-md shadow-md md:hidden"
          aria-label="Open Menu"
        >
          ☰
        </button>
      )}

      {/* Main content area */}
      <div
        className={`transition-all duration-300 min-h-screen bg-black text-white
          md:ml-${collapsed ? '16' : '64'} ${isMobileOpen ? 'overflow-hidden' : ''}`}
      >
        <main>{children}</main>
      </div>
    </>
  );
}
