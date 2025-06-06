import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAudioPlayer } from "@/components/AudioPlayerContext";

export default function PlaylistDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [playlist, setPlaylist] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const { playTrack, pause, resume, isPlaying, currentTrack } = useAudioPlayer();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/playlists/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPlaylist(data.playlist);
        setEntries(data.entries);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load playlist", err);
        setLoading(false);
      });
  }, [id]);

  const handleRemove = async (entryId) => {
    const res = await fetch(`/api/playlists/${id}/entries`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId }),
    });
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.entryid !== entryId));
    }
  };

  const handlePlay = (entry) => {
    const track = { title: entry.song, url: entry.audioUrl };
    const queue = entries.map((e) => ({ title: e.song, url: e.audioUrl }));

    if (currentTrack?.url === entry.audioUrl) {
      isPlaying ? pause() : resume();
    } else {
      playTrack(track, queue, {
        venue: entry.venue,
        city: entry.city,
        state: entry.state,
        date: entry.showdate,
      });
    }
  };

  return (
    <>
      <Head>
        <title>{playlist ? playlist.name : "Playlist"} | Foul Domain</title>
      </Head>

      <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-indigo-400">
            {playlist?.name || "Playlist"}
          </h1>

          {loading ? (
            <p>Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-white/50">This playlist has no versions yet.</p>
          ) : (
            <ul className="divide-y divide-white/10 border border-white/10 rounded-lg overflow-hidden">
              {entries.map((entry) => {
                const isThisTrack = currentTrack?.url === entry.audioUrl;
                return (
                  <li key={entry.entryid} className="px-4 py-3 flex items-center justify-between gap-4">
                    <div>
                      <Link
                        href={`/shows/${entry.showdate.split("T")[0]}`}
                        className="text-indigo-300 hover:underline"
                      >
                        {entry.song}
                      </Link>
                      <div className="text-sm text-white/50">
                        {entry.venue} — {entry.city}, {entry.state} ({entry.showdate.split("T")[0]})
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {entry.audioUrl && (
                        <button
                          onClick={() => handlePlay(entry)}
                          className="text-indigo-400 hover:text-indigo-200 text-lg"
                          title={isThisTrack && isPlaying ? "Pause" : "Play"}
                        >
                          {isThisTrack && isPlaying ? "❚❚" : "▶"}
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(entry.entryid)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
