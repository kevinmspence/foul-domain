// components/Layout.jsx
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(true); // start safe for SSR

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }
  }, []);

  const toggleSidebar = (forceState = null) => {
    setCollapsed((prev) => {
      const next = forceState !== null ? forceState : !prev;
      localStorage.setItem('sidebar-collapsed', next);
      return next;
    });
  };

  return (
    <>
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
      <div
        className={`transition-all duration-300 min-h-screen bg-black text-white ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {children}
      </div>
    </>
  );
}
