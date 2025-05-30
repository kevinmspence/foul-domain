import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import prisma from '@/lib/prisma';
import Head from 'next/head';
import Link from 'next/link';

function sanitizeForFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function getServerSideProps(context) {
  const slug = context.params.slug;
  const songName = decodeURIComponent(slug).replace(/-/g, ' ').toLowerCase();

  const entries = await prisma.setlistEntry.findMany({
    where: {
      song: {
        equals: songName,
        mode: 'insensitive',
      },
    },
    include: {
      show: true,
    },
    orderBy: {
      show: {
        showDate: 'desc',
      },
    },
  });

  const serializableEntries = entries.map((entry) => ({
    ...entry,
    show: {
      ...entry.show,
      showDate: entry.show.showDate.toISOString(),
    },
  }));

  const host = context.req.headers.host || 'fouldomain.com';
  const protocol = context.req.headers['x-forwarded-proto'] || 'https';
  const canonicalUrl = `${protocol}://${host}/songs/${slug}`;

  return {
    props: {
      entries: serializableEntries,
      songName,
      canonicalUrl,
    },
  };
}

export default function SongPage({ entries, songName, canonicalUrl }) {
  const [visibleCount, setVisibleCount] = useState(25);
  const [sortField, setSortField] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [sortedEntries, setSortedEntries] = useState(entries);
  const loaderRef = useRef(null);

  const songTitle = entries[0]?.song || songName.replace(/-/g, ' ');
  const firstDate = entries.at(-1)?.show.showDate.split('T')[0];
  const lastDate = entries[0]?.show.showDate.split('T')[0];

  const bgStyle = {
    backgroundImage: `url('/song-backgrounds/${sanitizeForFilename(songName)}.webp')`,
    backgroundColor: '#0d0d0d',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'bottom right',
  };

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 25, sortedEntries.length));
  }, [sortedEntries]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [loadMore]);

  const sortBy = (field) => {
    const isAsc = sortField === field ? !sortAsc : true;
    setSortField(field);
    setSortAsc(isAsc);

    const sorted = [...entries].sort((a, b) => {
      const valA = field === 'date' ? new Date(a.show.showDate) : a.show[field].toLowerCase();
      const valB = field === 'date' ? new Date(b.show.showDate) : b.show[field].toLowerCase();
      return isAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    setSortedEntries(sorted);
    setVisibleCount(25);
  };

  return (
    <div className="min-h-screen text-yellow-100 font-ticket px-4 sm:px-6 py-12" style={bgStyle}>
      <Head>
        <title>{`${songTitle} – Every Time Played by Phish - Foul Domain`}</title>
        <meta
          name="description"
          content={`Explore every time Phish has played “${songTitle}”, performed ${entries.length} times from ${firstDate || 'the beginning'} to ${lastDate || 'recently'}.`}
        />
        <meta property="og:title" content={`${songTitle} – Foul Domain`} />
        <meta
          property="og:description"
          content={`Explore every time Phish has played “${songTitle}”, performed ${entries.length} times from ${firstDate || 'the beginning'} to ${lastDate || 'recently'}.`}
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div className="flex justify-center mb-6">
        <h1 className="text-6xl sm:text-7xl font-bold text-yellow-100 drop-shadow-md text-center">
          {songTitle}
        </h1>
      </div>

      <div className="flex flex-wrap justify-center gap-6 mb-10 sm:flex-row sm:gap-6">
        {/* Mobile slider container */}
        <div className="flex sm:hidden overflow-x-auto gap-4 px-2 w-full">
          <div className="min-w-[240px] flex-shrink-0 bg-yellow-900/40 text-yellow-100 rounded-xl px-6 py-4 border border-yellow-700 text-center">
            <p className="text-lg font-bold uppercase tracking-wider">Times Played</p>
            <p className="text-2xl">{entries.length}</p>
          </div>
          {firstDate && (
            <div className="min-w-[240px] flex-shrink-0 bg-yellow-900/40 text-yellow-100 rounded-xl px-6 py-4 border border-yellow-700 text-center">
              <p className="text-lg font-bold uppercase tracking-wider">First Played</p>
              <p className="text-xl">{firstDate}</p>
            </div>
          )}
          {lastDate && (
            <div className="min-w-[240px] flex-shrink-0 bg-yellow-900/40 text-yellow-100 rounded-xl px-6 py-4 border border-yellow-700 text-center">
              <p className="text-lg font-bold uppercase tracking-wider">Last Played</p>
              <p className="text-xl">{lastDate}</p>
            </div>
          )}
        </div>

        {/* Desktop stacked cards */}
        <div className="hidden sm:flex flex-wrap justify-center gap-6">
          <div className="bg-yellow-900/40 text-yellow-100 rounded-xl px-6 py-4 border border-yellow-700 text-center">
            <p className="text-lg font-bold uppercase tracking-wider">Times Played</p>
            <p className="text-2xl">{entries.length}</p>
          </div>
          {firstDate && (
            <div className="bg-yellow-900/40 text-yellow-100 rounded-xl px-6 py-4 border border-yellow-700 text-center">
              <p className="text-lg font-bold uppercase tracking-wider">First Played</p>
              <p className="text-xl">{firstDate}</p>
            </div>
          )}
          {lastDate && (
            <div className="bg-yellow-900/40 text-yellow-100 rounded-xl px-6 py-4 border border-yellow-700 text-center">
              <p className="text-lg font-bold uppercase tracking-wider">Last Played</p>
              <p className="text-xl">{lastDate}</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full flex justify-center">
        <div className="w-full max-w-[900px]">
          <div className="h-[100px] bg-no-repeat bg-top bg-[length:100%_100%]" style={{ backgroundImage: "url('/scroll-top.png')" }} />

          <div className="bg-repeat-y bg-[length:100%_100%] px-4 py-6" style={{ backgroundImage: "url('/scroll-middle.png')" }}>
            <div className="overflow-x-auto px-2 sm:px-6">
              <div className="w-full max-w-[75vw] sm:max-w-[720px] mx-auto">
                <table className="w-full table-fixed font-ticket border-collapse text-sm sm:text-base">
                  <colgroup>
                    <col className="w-[40%] sm:w-[28%]" />
                    <col className="w-[60%] sm:w-[42%]" />
                    <col className="hidden sm:table-column sm:w-[15%]" />
                    <col className="hidden sm:table-column sm:w-[15%]" />
                  </colgroup>

                  <thead className="bg-yellow-800 text-yellow-100 uppercase shadow-inner shadow-yellow-950 text-sm sm:text-base">
                    <tr>
                      <th onClick={() => sortBy('date')} className="py-2 px-3 border border-yellow-700 cursor-pointer">
                        Date <span className="ml-1">{sortField === 'date' ? (sortAsc ? '▲' : '▼') : '⋯'}</span>
                      </th>
                      <th onClick={() => sortBy('venue')} className="py-2 px-3 border border-yellow-700 cursor-pointer">
                        Venue <span className="ml-1">{sortField === 'venue' ? (sortAsc ? '▲' : '▼') : '⋯'}</span>
                      </th>
                      <th onClick={() => sortBy('city')} className="py-2 px-3 border border-yellow-700 cursor-pointer hidden sm:table-cell">
                        City <span className="ml-1">{sortField === 'city' ? (sortAsc ? '▲' : '▼') : '⋯'}</span>
                      </th>
                      <th onClick={() => sortBy('state')} className="py-2 px-3 border border-yellow-700 cursor-pointer hidden sm:table-cell">
                        State <span className="ml-1">{sortField === 'state' ? (sortAsc ? '▲' : '▼') : '⋯'}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEntries.slice(0, visibleCount).map((entry, idx) => (
                      <tr key={entry.id} className={`${idx % 2 === 0 ? 'bg-yellow-950/10' : 'bg-yellow-900/5'} hover:bg-yellow-800/40 hover:text-yellow-50 transition-all duration-150`}>
                        <td className="py-1 px-3 border border-yellow-700 text-sm sm:text-base">
                          <Link href={`/shows/${entry.show.showDate.split('T')[0]}`} className="text-sky-300 hover:text-sky-100 hover:underline">
                            {entry.show.showDate.split('T')[0]}
                          </Link>
                        </td>
                        <td className="py-1 px-3 border border-yellow-700 text-sm sm:text-base">
                          {entry.show.venue}
                        </td>
                        <td className="py-1 px-3 border border-yellow-700 text-sm sm:text-base hidden sm:table-cell">
                          {entry.show.city}
                        </td>
                        <td className="py-1 px-3 border border-yellow-700 text-sm sm:text-base hidden sm:table-cell">
                          {entry.show.state}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td ref={loaderRef} colSpan={4} className="h-8"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="h-[100px] bg-no-repeat bg-bottom bg-[length:100%_100%]" style={{ backgroundImage: "url('/scroll-bottom.png')" }} />
        </div>
      </div>
    </div>
  );
}
