import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function SearchBox({ containerClass = '' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error('❌ Invalid API response:', data);
          setResults([]);
          return;
        }

        const sorted = [
          ...data.filter((item) => item.type === 'song'),
          ...data.filter((item) => item.type === 'show'),
        ];

        setResults(sorted);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      }
    };

    const debounce = setTimeout(fetchResults, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className={`relative ${containerClass}`} ref={boxRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        placeholder="Search for a song, show, or venue..."
        className="w-full px-4 py-2 text-sm sm:text-base text-gray-100 bg-gray-900 border border-gray-600 focus:outline-none focus:border-indigo-400 font-mono placeholder-gray-500"
      />

      {showDropdown && results.length > 0 && (
        <ul className="absolute left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-md z-10 max-h-64 overflow-y-auto text-left text-sm">
          {results.map((result) => (
            <li key={result.id}>
              <Link
                href={
                  result.type === 'song'
                    ? `/songs/${result.slug}`
                    : `/shows/${result.slug}`
                }
                className="block px-4 py-2 hover:bg-indigo-800 hover:text-white transition"
              >
                {result.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
