import React from 'react';
import { useAudioPlayer } from './AudioPlayerContext';

export default function SetScroll({ title, entries, showInfo }) {
  const {
    playTrack,
    pause,
    resume,
    isPlaying,
    currentTrack,
  } = useAudioPlayer();

  const queue = entries
    .filter((e) => !!e.audioUrl)
    .map((e) => ({
      title: e.song,
      url: e.audioUrl,
    }));

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
              <div className="flex-1 truncate">
                <span className="text-white font-medium">{entry.song}</span>
                {entry.isEncore && (
                  <span className="ml-2 text-sm text-yellow-300 italic">
                    (Encore)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
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
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
