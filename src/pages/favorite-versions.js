import Head from 'next/head';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import sql from '@/lib/sql';
import { useAudioPlayer } from '@/components/AudioPlayerContext';
import { useState } from 'react';

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) return { redirect: { destination: '/auth/signin', permanent: false } };

  const userId = session.user.id;

  const results = await sql`
    SELECT v."entryid", se.song, se."audioUrl", se."durationSeconds", se."sequence",
           s."showdate", s.venue, s.city, s.state
    FROM "FavoriteVersion" v
    JOIN "SetlistEntry" se ON v."entryid" = se.id
    JOIN "Show" s ON se."showid" = s."showid"
    WHERE v."userid" = ${userId}
    ORDER BY s."showdate" DESC, se.sequence ASC;
  `;

  const versions = results.map((r) => ({
    entryId: r.entryid,
    song: r.song,
    audioUrl: r.audioUrl,
    duration: r.durationSeconds,
    sequence: r.sequence,
    showdate: r.showdate.toISOString().split('T')[0],
    venue: r.venue,
    city: r.city,
    state: r.state,
  }));

  return { props: { versions } };
}

export default function FavoriteVersionsPage({ versions }) {
  const { playTrack, pause, resume, isPlaying, currentTrack } = useAudioPlayer();
  const [favoritedIds, setFavoritedIds] = useState(new Set(versions.map((v) => v.entryId)));

  const toggleFavorite = async (entryId) => {
    const res = await fetch('/api/favorites/toggle-version', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId }),
    });
    if (res.ok) {
      setFavoritedIds((prev) => {
        const copy = new Set(prev);
        if (copy.has(entryId)) copy.delete(entryId);
        else copy.add(entryId);
        return copy;
      });
    }
  };

  return (
    <>
      <Head>
        <title>Favorite Versions | Foul Domain</title>
      </Head>
      <main className="min-h-screen px-4 sm:px-6 lg:px-8 py-10 bg-gray-950 text-white pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-indigo-400 text-center mb-8 font-sans">Favorite Versions</h1>
          <ul className="space-y-4">
            {versions.map((v) => {
              const isThisTrackPlaying = currentTrack?.url === v.audioUrl && isPlaying;
              const date = new Date(v.showdate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              });
              return (
                <li
                  key={v.entryId}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <Link
                      href={`/shows/${v.showdate}`}
                      className="text-indigo-300 hover:underline"
                    >
                      {v.song} – {date} @ {v.venue}
                    </Link>
                    <div className="text-sm text-white/60">
                      {v.city}, {v.state} • {Math.floor(v.duration / 60)}:{(v.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {v.audioUrl ? (
                      <button
                        onClick={() => {
                          if (currentTrack?.url === v.audioUrl) {
                            isPlaying ? pause() : resume();
                          } else {
                            playTrack({ title: v.song, url: v.audioUrl }, [
                              { title: v.song, url: v.audioUrl },
                            ], {
                              venue: v.venue,
                              date,
                            });
                          }
                        }}
                        className="text-indigo-400 hover:text-indigo-200 text-lg"
                      >
                        {isThisTrackPlaying ? '❚❚' : '▶'}
                      </button>
                    ) : (
                      <span className="text-sm text-white/40 italic">No audio</span>
                    )}

                    <button
                      onClick={() => toggleFavorite(v.entryId)}
                      className="text-yellow-400 hover:text-yellow-200 text-xl"
                      title="Unfavorite"
                    >
                      ★
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </>
  );
}
