import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Load collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored !== null) setCollapsed(stored === 'true');
  }, []);

  const toggleSidebar = (forceState = null) => {
    const next = forceState !== null ? forceState : !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', next);
  };

  // Gesture support for swipe open/close on mobile
  useEffect(() => {
    function handleTouchStart(e) {
      touchStartX.current = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
      touchEndX.current = e.touches[0].clientX;
    }

    function handleTouchEnd() {
      const start = touchStartX.current;
      const end = touchEndX.current;

      if (start !== null && end !== null) {
        const deltaX = end - start;

        if (start < 40 && deltaX > 50) setIsMobileOpen(true); // Swipe right
        if (deltaX < -50) setIsMobileOpen(false);             // Swipe left
      }

      touchStartX.current = null;
      touchEndX.current = null;
    }

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ☰ Floating open button (mobile only, bottom-left) */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white px-3 py-2 rounded-full shadow-lg md:hidden"
          aria-label="Open Menu"
        >
          ☰
        </button>
      )}

      {/* Main content area (pushes right on desktop) */}
      <div
        className={`transition-all duration-300 min-h-screen bg-black text-white ${
          collapsed ? 'md:ml-16' : 'md:ml-64'
        } ${isMobileOpen ? 'overflow-hidden' : ''}`}
      >
        <main>{children}</main>
      </div>
    </>
  );
}
