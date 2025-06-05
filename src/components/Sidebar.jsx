// components/Sidebar.jsx
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  CalendarDays,
  House,
  Music,
  Mail,
  Search,
  Sparkle,
  BookOpen
} from 'lucide-react';

export default function Sidebar({ collapsed, toggleSidebar, isMobileOpen, setIsMobileOpen }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const sidebarRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);

    function handleResize() {
      setIsDesktop(window.innerWidth >= 768);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`)
          .then((res) => res.json())
          .then(setSearchResults)
          .catch(() => setSearchResults([]));
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        toggleSidebar(true);
        setIsMobileOpen(false);
        setSearchOpen(false);
        setSearchTerm('');
        setSearchResults([]);
      }
    }

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [toggleSidebar, isMobileOpen]);

  const handleSearchClick = () => {
    if (collapsed && isDesktop) {
      toggleSidebar(false);
      setTimeout(() => setSearchOpen(true), 300);
    } else {
      setSearchOpen((prev) => !prev);
    }
  };

  if (!isMounted) return null;

  const shouldCollapseText = collapsed && isDesktop;

  return (
    <div
      ref={sidebarRef}
      className={`fixed top-0 left-0 h-screen bg-gray-900 text-white z-50 transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:transition-all md:duration-300
        ${collapsed ? 'md:w-16' : 'md:w-64'} 
        w-64`}
    >
      <div className="p-4 flex justify-end md:hidden">
        <button onClick={() => setIsMobileOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div className="hidden md:flex justify-between items-center p-4">
        <button onClick={() => toggleSidebar()}>
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav className="flex flex-col gap-4 p-4">
        {[
          { href: '/', icon: House, label: 'Home' },
          { href: '/shows/recent', icon: Sparkle, label: 'Most Recent Show' },
          { href: '/year', icon: CalendarDays, label: 'Shows' },
          { href: '/songs', icon: Music, label: 'Songs' },
          { href: '/contact', icon: Mail, label: 'Contact' }
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={label}
            href={href}
            title={label}
            className="flex items-center gap-3 hover:text-gray-300"
          >
            <Icon size={20} />
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                shouldCollapseText ? 'opacity-0 w-0' : 'opacity-100 w-auto'
              }`}
            >
              {label}
            </span>
          </Link>
        ))}

        <button
          onClick={handleSearchClick}
          className="flex items-center gap-3 hover:text-gray-300 focus:outline-none"
          title="Search"
        >
          <Search size={20} />
          <span
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
              shouldCollapseText ? 'opacity-0 w-0' : 'opacity-100 w-auto'
            }`}
          >
            Search
          </span>
        </button>

        {searchOpen && (
          <div className="mt-2 relative">
            <input
              ref={searchRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search songs or shows..."
              className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none"
            />
            {searchResults.length > 0 && (
              <ul className="absolute left-0 right-0 bg-gray-800 border border-gray-700 mt-1 rounded shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <li key={result.id}>
                    <Link
                      href={
                        result.type === 'song'
                          ? `/songs/${result.slug}`
                          : `/shows/${result.slug}`
                      }
                      className="block px-3 py-2 hover:bg-gray-700"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchTerm('');
                        setSearchResults([]);
                        if (window.innerWidth < 768) {
                          setIsMobileOpen(false);
                        }
                      }}
                    >
                      {result.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
