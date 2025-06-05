import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import sql from '@/lib/sql';
import { useAudioPlayer } from '@/components/AudioPlayerContext';

function slugToSong(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\bac\b/gi, 'AC')
    .replace(/\bdc\b/gi, 'DC')
    .trim();
}

function toTitleCase(str) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function getServerSideProps(context) {
  const slug = context.params.slug;
  const songName = slugToSong(slug);
  const normalizedSlug = songName.toLowerCase().replace(/[\s/-]/g, '');

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
  const { playTrack } = useAudioPlayer();

  const sortedEntries = [...entries].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortBy === 'venue') return a.show.venue.localeCompare(b.show.venue) * dir;
    if (sortBy === 'city') return a.show.city.localeCompare(b.show.city) * dir;
    if (sortBy === 'state') return a.show.state.localeCompare(b.show.state) * dir;
    if (sortBy === 'duration') return ((a.durationSeconds || 0) - (b.durationSeconds || 0)) * dir;
    return (new Date(a.show.showDate) - new Date(b.show.showDate)) * dir;
  });

  const firstPlayed = entries[entries.length - 1]?.show.showDate;
  const lastPlayed = entries[0]?.show.showDate;

  const formatDuration = (secs) => {
    if (!secs || secs <= 0) return '—';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlay = (entry) => {
    const show = {
      venue: entry.show.venue,
      city: entry.show.city,
      state: entry.show.state,
      date: new Date(entry.show.showDate).toLocaleDateString(),
    };

    const track = {
      title: toTitleCase(songName),
      url: entry.audioUrl,
    };

    playTrack(track, [track], show);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`Foul Domain – ${toTitleCase(songName)}`}</title>
        <meta name="description" content={`Performance history for ${songName}`} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <main className="min-h-screen bg-gray-950 text-gray-100 font-mono px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-wide text-center capitalize">
            {songName}
          </h1>

          <div className="flex flex-wrap justify-center gap-4 my-8 text-sm sm:text-base text-gray-200">
            <div className="px-4 py-2 bg-gray-800 border border-gray-700 rounded">
              Times Played: {entries.length}
            </div>
            <div className="px-4 py-2 bg-gray-800 border border-gray-700 rounded">
              First Played: {firstPlayed ? new Date(firstPlayed).toLocaleDateString() : '—'}
            </div>
            <div className="px-4 py-2 bg-gray-800 border border-gray-700 rounded">
              Last Played: {lastPlayed ? new Date(lastPlayed).toLocaleDateString() : '—'}
            </div>
          </div>

          {entries.length === 0 ? (
            <p className="text-center text-lg">No performances found for this song.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-800 rounded">
              <table className="min-w-full text-sm sm:text-base text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-gray-200">
                    <th onClick={() => toggleSort('date')} className="px-4 py-3 border-b border-gray-700 text-center cursor-pointer">Date</th>
                    <th onClick={() => toggleSort('venue')} className="px-4 py-3 border-b border-gray-700 text-center cursor-pointer">Venue</th>
                    <th onClick={() => toggleSort('city')} className="hidden sm:table-cell px-4 py-3 border-b border-gray-700 text-center cursor-pointer">City</th>
                    <th onClick={() => toggleSort('state')} className="hidden sm:table-cell px-4 py-3 border-b border-gray-700 text-center cursor-pointer">State</th>
                    <th onClick={() => toggleSort('duration')} className="px-4 py-3 border-b border-gray-700 text-center cursor-pointer">Duration</th>
                    <th className="px-4 py-3 border-b border-gray-700 text-center">Play</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((entry, index) => {
                    const showUrl = new Date(entry.show.showDate).toISOString().split('T')[0];
                    return (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-gray-900/50' : 'bg-gray-900/30'}
                      >
                        <td className="px-4 py-2 border-t border-gray-800 text-center">
                          <Link href={`/shows/${showUrl}`} className="hover:underline text-indigo-300">
                            {new Date(entry.show.showDate).toLocaleDateString()}
                          </Link>
                        </td>
                        <td className="px-4 py-2 border-t border-gray-800 text-center">
                          {entry.show.venue}
                        </td>
                        <td className="hidden sm:table-cell px-4 py-2 border-t border-gray-800 text-center">
                          {entry.show.city}
                        </td>
                        <td className="hidden sm:table-cell px-4 py-2 border-t border-gray-800 text-center">
                          {entry.show.state}
                        </td>
                        <td className="px-4 py-2 border-t border-gray-800 text-center">
                          {formatDuration(entry.durationSeconds)}
                        </td>
                        <td className="px-4 py-2 border-t border-gray-800 text-center">
                          {entry.audioUrl ? (
                            <button
                              onClick={() => handlePlay(entry)}
                              className="text-indigo-400 hover:text-indigo-200 transition"
                              title="Play track"
                              aria-label="Play track"
                            >
                              ▶
                            </button>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
