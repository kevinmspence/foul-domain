import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import sql from '@/lib/sql';
import ScrollWrapper from '@/components/ScrollWrapper';

function sanitizeForFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function slugToSong(slug) {
  return slug
    .replace(/-/g, ' ')                  // hyphens → spaces
    .replace(/\bac\b/gi, 'AC')           // optional: fix known cases
    .replace(/\bdc\b/gi, 'DC')
    .trim();
}

export async function getServerSideProps(context) {
  const slug = context.params.slug;
  const songName = slugToSong(slug).toLowerCase();
  const normalizedSlug = songName.replace(/[^a-z0-9]/gi, '');

  const result = await sql`
    SELECT se.*, s."showdate", s.venue, s.city, s.state
    FROM "SetlistEntry" se
    JOIN "Show" s ON se."showid" = s."showid"
    WHERE REPLACE(REPLACE(REPLACE(LOWER(se.song), '/', ''), ' ', ''), '-', '') = ${normalizedSlug}
    ORDER BY s."showdate" DESC;
  `;

  const rows = Array.isArray(result) ? result : result?.rows || [];

  const serializableEntries = rows.map((entry) => ({
    ...entry,
    showdate: entry.showdate.toISOString(),
    show: {
      showDate: entry.showdate.toISOString(),
      venue: entry.venue,
      city: entry.city,
      state: entry.state,
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
  const [sortBy, setSortBy] = useState('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [backgroundMiddle, setBackgroundMiddle] = useState(null);

  const backgroundTop = '/scroll-top.png';
  const backgroundBottom = '/scroll-bottom.png';

  useEffect(() => {
    const cached = sessionStorage.getItem(`bg-${songName}`);
    if (cached) {
      setBackgroundMiddle(cached);
      return;
    }

    const slug = sanitizeForFilename(songName);
    const testImage = (src) =>
      new Promise((resolve) => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => resolve(src);
        img.onerror = () => resolve(null);
      });

    const tryImages = async () => {
      const custom = `/song-backgrounds/${slug}.webp`;
      const found = (await testImage(custom)) || '/song-backgrounds/default.png';
      sessionStorage.setItem(`bg-${songName}`, found);
      setBackgroundMiddle(found);
    };

    tryImages();
  }, [songName]);

  if (!backgroundMiddle) {
    return (
      <div className="min-h-screen bg-black text-yellow-100 font-ticket flex items-center justify-center">
        <p className="text-xl animate-pulse">Loading background...</p>
      </div>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortBy === 'venue') return a.show.venue.localeCompare(b.show.venue) * dir;
    if (sortBy === 'city') return a.show.city.localeCompare(b.show.city) * dir;
    if (sortBy === 'state') return a.show.state.localeCompare(b.show.state) * dir;
    return (new Date(a.show.showDate) - new Date(b.show.showDate)) * dir;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  const firstPlayed = entries[entries.length - 1]?.show.showDate;
  const lastPlayed = entries[0]?.show.showDate;

  return (
    <>
      <Head>
        <title>{`Foul Domain – ${songName}`}</title>
        <meta name="description" content={`Performance history for ${songName}`} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div
        className="min-h-screen text-yellow-100 font-ticket px-0 pt-0 pb-0 bg-cover bg-no-repeat bg-fixed"
        style={{
          backgroundImage: `url(${backgroundMiddle})`,
          backgroundPosition: 'bottom right',
          backgroundSize: 'cover',
        }}
      >
        <div className="text-center mb-2 drop-shadow-[0_0_20px_rgba(255,255,200,0.6)] pt-4">
          <h1
            className="text-3xl sm:text-4xl text-yellow-200 capitalize mt-6 mb-4"
            style={{ fontFamily: 'Rock Salt, cursive', textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
          >
            {songName}
          </h1>
        </div>

        <div className="flex justify-center gap-6 mb-6 text-yellow-300 text-lg font-bold">
          <div className="bg-yellow-900/20 px-4 py-2 rounded border border-yellow-500">
            Times Played: {entries.length}
          </div>
          <div className="bg-yellow-900/20 px-4 py-2 rounded border border-yellow-500">
            First Played: {firstPlayed ? new Date(firstPlayed).toLocaleDateString() : '—'}
          </div>
          <div className="bg-yellow-900/20 px-4 py-2 rounded border border-yellow-500">
            Last Played: {lastPlayed ? new Date(lastPlayed).toLocaleDateString() : '—'}
          </div>
        </div>

        {entries.length === 0 ? (
          <p className="text-center text-lg">No performances found for this song.</p>
        ) : (
          <div className="max-w-[825px] mx-auto">
            <ScrollWrapper
              backgroundTop={backgroundTop}
              backgroundMiddle={backgroundMiddle}
              backgroundBottom={backgroundBottom}
            >
              <div
                className="text-center text-yellow-200 text-xl tracking-wide mt-6 mb-4"
                style={{ fontFamily: 'Rock Salt, cursive' }}
              >
                Every time played
              </div>
              <div className="flex justify-center overflow-x-auto">
                <table className="w-[85%] max-w-[640px] mx-auto text-left border-collapse text-yellow-100">
                  <thead>
                    <tr className="bg-yellow-300 text-black">
                      <th className="cursor-pointer p-2 border border-yellow-700" onClick={() => handleSort('date')}>Date</th>
                      <th className="cursor-pointer p-2 border border-yellow-700" onClick={() => handleSort('venue')}>Venue</th>
                      <th className="cursor-pointer p-2 border border-yellow-700" onClick={() => handleSort('city')}>City</th>
                      <th className="cursor-pointer p-2 border border-yellow-700" onClick={() => handleSort('state')}>State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEntries.map((entry, index) => {
                      const showUrl = new Date(entry.show.showDate).toISOString().split('T')[0];
                      return (
                        <tr
                          key={index}
                          className={`hover:bg-yellow-300 hover:text-black transition-all duration-150 ${index % 2 === 0 ? 'bg-yellow-950/10' : 'bg-yellow-900/5'}`}
                        >
                          <td className="p-2 border border-yellow-700 underline">
                            <Link href={`/shows/${showUrl}`}>
                              {new Date(entry.show.showDate).toLocaleDateString()}
                            </Link>
                          </td>
                          <td className="p-2 border border-yellow-700">{entry.show.venue}</td>
                          <td className="p-2 border border-yellow-700">{entry.show.city}</td>
                          <td className="p-2 border border-yellow-700">{entry.show.state}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </ScrollWrapper>
          </div>
        )}
      </div>
    </>
  );
}
