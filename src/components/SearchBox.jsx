import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function SearchBox({ inputClass = '', containerClass = '' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/search/?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();

        const sorted = [
          ...data.filter((item) => item.type === 'song'),
          ...data.filter((item) => item.type === 'show'),
        ];
        setResults(sorted);
        setHasSearched(true);
      } catch (err) {
        console.error('Search error:', err);
        setHasSearched(true);
        setResults([]);
      }
    };
    fetchResults();
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setQuery('');
    setResults([]);
    if (item.type === 'show') router.push(`/shows/${item.slug}`);
    else if (item.type === 'song') router.push(`/songs/${item.slug}`);
  };

  const groupedResults = results.reduce(
    (acc, item) => {
      acc[item.type] = acc[item.type] || [];
      acc[item.type].push(item);
      return acc;
    },
    {}
  );

  return (
    <div ref={containerRef} className={`relative z-10 w-full ${containerClass}`}>
      {/* Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-60 animate-ping left-[10%] top-[30%]" />
        <div className="absolute w-1 h-1 bg-yellow-200 rounded-full opacity-40 animate-pulse left-[70%] top-[10%]" />
        <div className="absolute w-1 h-1 bg-yellow-100 rounded-full opacity-70 animate-ping left-[85%] top-[50%]" />
      </div>

      <input
        type="text"
        placeholder="Search Phish shows, songs, venues, and more."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`relative w-full max-w-[425px] px-5 py-3 text-lg rounded-xl border-2 border-yellow-500 bg-white/80 backdrop-blur-md placeholder:text-yellow-900 text-yellow-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-500 z-10 ${inputClass}`}
      />

      {query.length >= 2 && (
        <div className="absolute top-full left-0 w-full mt-2 z-20 overflow-x-hidden bg-yellow-50/90 border-4 border-yellow-600 rounded-xl shadow-[0_0_40px_rgba(255,238,180,0.6)] max-h-60 font-ticket text-yellow-900 backdrop-blur-sm ring-2 ring-yellow-700/40 animate-slideDown transition-all duration-300">
          {/* Floating runes */}
          <div className="absolute w-full h-full pointer-events-none overflow-hidden z-0">
            <div className="absolute w-3 h-3 bg-yellow-200 rounded-full opacity-30 animate-ping left-[12%] top-[15%]" />
            <div className="absolute w-2 h-2 bg-yellow-100 rounded-full opacity-30 animate-pulse left-[78%] top-[42%]" />
          </div>

          <div className="relative z-10">
            {groupedResults.song && (
              <>
                <div className="px-5 py-2 text-sm font-bold uppercase tracking-wide text-yellow-800 bg-yellow-200 border-b border-yellow-400">
                  Songs
                </div>
                {groupedResults.song.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="px-5 py-3 text-base border-b border-yellow-300 hover:bg-yellow-100 hover:text-yellow-900 transition-all duration-300 ease-in-out cursor-pointer tracking-wide relative group hover:shadow-[0_0_15px_3px_rgba(255,225,100,0.5)] hover:ring-2 hover:ring-yellow-300 hover:scale-[1.01]"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <span className="absolute inset-0 bg-yellow-100 opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-lg"></span>
                  </div>
                ))}
              </>
            )}

            {groupedResults.show && (
              <>
                <div className="px-5 py-2 text-sm font-bold uppercase tracking-wide text-yellow-800 bg-yellow-200 border-t border-yellow-400">
                  Shows
                </div>
                {groupedResults.show.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="px-5 py-3 text-base border-b border-yellow-300 hover:bg-yellow-100 hover:text-yellow-900 transition-all duration-300 ease-in-out cursor-pointer tracking-wide relative group hover:shadow-[0_0_15px_3px_rgba(255,225,100,0.5)] hover:ring-2 hover:ring-yellow-300 hover:scale-[1.01]"
                  >
                    <span className="relative z-10">{item.label}</span>
                    <span className="absolute inset-0 bg-yellow-100 opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-lg"></span>
                  </div>
                ))}
              </>
            )}

            {hasSearched && results.length === 0 && (
              <div className="px-5 py-4 text-base text-yellow-800 italic text-center">
                No matches found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
