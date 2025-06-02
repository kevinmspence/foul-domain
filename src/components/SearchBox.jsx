import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function SearchBox() {
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
    <div className="relative w-full max-w-xl mx-auto" ref={boxRef}>
      <input
        type="text"
        className="w-full px-5 py-3 text-lg font-ticket rounded-lg border-2 border-yellow-400 bg-yellow-50 text-black shadow-[0_0_12px_rgba(255,240,170,0.6)] focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
        placeholder="Search for a song, show, or venue..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setShowDropdown(true)}
      />

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-2 bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-xl max-h-80 overflow-auto font-ticket text-black text-base animate-fade-slide">
          {results.map((result) => (
            <li key={result.id}>
              <Link
                href={
                  result.type === 'song'
                    ? `/songs/${result.slug}`
                    : `/shows/${result.slug}`
                }
                className="block px-4 py-3 hover:bg-yellow-200 hover:text-black transition-all border-b border-yellow-300 last:border-b-0"
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
