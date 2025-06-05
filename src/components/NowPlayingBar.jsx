import { useRef, useEffect, useState } from 'react';
import { useAudioPlayer } from './AudioPlayerContext';

export default function NowPlayingBar() {
  const {
    currentTrack,
    currentShow,
    nextTrack,
    isPlaying,
    setIsPlaying,
    playNext,
    playPrev,
  } = useAudioPlayer();

  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack) {
      audio.src = currentTrack.url;
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const audio = audioRef.current;
    if (audio?.duration) {
      audio.currentTime = percent * audio.duration;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const update = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
      setTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setTime(0);
      playNext();
    };

    audio.addEventListener('timeupdate', update);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', update);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playNext]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-gray-300 bg-white shadow-lg z-50 px-4 py-3 text-gray-900">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-3 md:gap-6 justify-between">
        
        {/* Left: Song title and location/date */}
        <div className="w-full md:w-1/3 truncate">
          <div className="font-bold text-sm md:text-base truncate">{currentTrack.title}</div>
          {currentShow && (
            <div className="text-xs text-gray-600 truncate">
              {currentShow.venue}, {currentShow.city} {currentShow.state} — {currentShow.date}
            </div>
          )}
        </div>

        {/* Center: Timeline + controls */}
        <div className="w-full md:w-2/3 flex flex-col gap-2">
          <div
            className="h-2 w-full bg-gray-200 rounded cursor-pointer relative overflow-hidden"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-indigo-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <button onClick={playPrev} title="Previous" className="hover:text-black">⏮</button>
            <span>{formatTime(time)}</span>
            <button
              onClick={togglePlay}
              className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <span>{formatTime(duration)}</span>
            <button onClick={playNext} title="Next" className="hover:text-black">⏭</button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
