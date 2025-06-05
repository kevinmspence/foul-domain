import { createContext, useContext, useRef, useState } from 'react';

const AudioPlayerContext = createContext();

export function AudioPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentShow, setCurrentShow] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nowPlayingShowId, setNowPlayingShowId] = useState(null); // ✅ new state

  const playTrack = (track, fullQueue = [], show = null) => {
    setCurrentTrack(track);
    setCurrentShow(show);
    setQueue(fullQueue);
    setIsPlaying(true);
    setNowPlayingShowId(show?.id || null); // ✅ set show ID
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    audioRef.current?.play().catch(console.error);
    setIsPlaying(true);
  };

  const playNext = () => {
    if (!queue.length || !currentTrack) return;
    const index = queue.findIndex((t) => t.url === currentTrack.url);
    const next = queue[index + 1];
    if (next) playTrack(next, queue, currentShow);
    else setIsPlaying(false);
  };

  const playPrev = () => {
    if (!queue.length || !currentTrack) return;
    const index = queue.findIndex((t) => t.url === currentTrack.url);
    const prev = queue[index - 1];
    if (prev) playTrack(prev, queue, currentShow);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        currentShow,
        isPlaying,
        playTrack,
        pause,
        resume,
        playNext,
        playPrev,
        audioRef,
        nowPlayingShowId, // ✅ include in context
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
