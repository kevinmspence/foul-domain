import React, { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useAudioPlayer } from './AudioPlayerContext';
import Modal from './Modal';
import PlaylistPickerModal from './PlaylistPickerModal'; // ✅ IMPORT the real modal
import { toast } from 'react-hot-toast';

export default function SetScroll({ title, entries, showInfo }) {
  const { data: session, status } = useSession();
  const {
    playTrack,
    pause,
    resume,
    isPlaying,
    currentTrack,
  } = useAudioPlayer();

  const [playlists, setPlaylists] = useState([]);
  const [modalEntryId, setModalEntryId] = useState(null);

  async function refreshPlaylists() {
    try {
      const res = await fetch('/api/playlists');
      const data = await res.json();
      setPlaylists(data);
    } catch (err) {
      console.error('Failed to refresh playlists:', err);
    }
  }

  useEffect(() => {
    refreshPlaylists();
  }, []);

  const queue = entries
    .filter((e) => !!e.audioUrl)
    .map((e) => ({
      title: e.song,
      url: e.audioUrl,
    }));

  const handlePlaylistClick = (entryId) => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      toast.custom((t) => (
        <div className={`bg-gray-800 text-white px-4 py-3 rounded shadow-md border border-yellow-200 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
          <p className="mb-2 text-sm">Please sign in to save favorites</p>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              signIn("google", {
                callbackUrl: window.location.href,
                redirect: false,
              }).then((res) => {
                if (res?.url) {
                  window.location.href = res.url;
                }
              });
            }}
            className="text-yellow-300 hover:text-yellow-200 underline text-sm"
          >
            Sign in with Google →
          </button>
        </div>
      ));
      return;
    }

    setModalEntryId(entryId);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl mb-10 shadow-sm">
      <h4 className="text-lg font-semibold text-white px-4 pt-4 pb-2 border-b border-white/10">
        {title}
      </h4>

      <ul className="divide-y divide-white/10">
        {entries.map((entry, i) => {
          const audioUrl = entry.audioUrl || null;
          const duration = entry.durationSeconds || null;

          const isThisTrackPlaying =
            currentTrack?.url === audioUrl && isPlaying;

          const handleToggle = () => {
            if (!audioUrl) return;
            if (currentTrack?.url === audioUrl) {
              if (isPlaying) pause();
              else resume();
            } else {
              playTrack(
                { title: entry.song, url: audioUrl },
                queue,
                showInfo
              );
            }
          };

          return (
            <li
              key={entry.sequence || i}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/5 transition"
            >
              <div className="flex-1 overflow-hidden">
                <span className="block text-white font-medium truncate">
                  {entry.song}
                </span>
                {entry.isEncore && (
                  <span className="ml-2 text-sm text-yellow-300 italic">
                    (Encore)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {audioUrl ? (
                  <button
                    onClick={handleToggle}
                    className="text-indigo-400 hover:text-indigo-200 transition text-lg"
                    title={isThisTrackPlaying ? 'Pause' : 'Play'}
                    aria-label={isThisTrackPlaying ? 'Pause track' : 'Play track'}
                  >
                    {isThisTrackPlaying ? '❚❚' : '▶'}
                  </button>
                ) : (
                  <span className="text-sm text-white/40 italic">No audio</span>
                )}

                {duration && (
                  <span className="text-sm text-white/60 w-12 text-right tabular-nums">
                    {Math.floor(duration / 60)}:
                    {(duration % 60).toString().padStart(2, '0')}
                  </span>
                )}

                <button
                  onClick={() => handlePlaylistClick(entry.id)}
                  className="text-white/60 hover:text-yellow-300 text-xl"
                  title="Add to playlist"
                >
                  ➕
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {modalEntryId && (
        <Modal onClose={() => setModalEntryId(null)}>
          <PlaylistPickerModal
            playlists={playlists}
            entryId={modalEntryId}
            onClose={() => setModalEntryId(null)}
            onAdd={refreshPlaylists}
          />
        </Modal>
      )}
    </div>
  );
}
