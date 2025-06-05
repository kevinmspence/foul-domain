import { createContext, useContext, useState } from 'react';

const AudioPlayerContext = createContext();

export function AudioPlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentShow, setCurrentShow] = useState(null);
  const [nextTrack, setNextTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = (track, fullQueue = [], show = null) => {
    setCurrentTrack(track);
    setCurrentShow(show);
    const index = fullQueue.findIndex((t) => t.url === track.url);
    setNextTrack(fullQueue[index + 1] || null);
    setQueue(fullQueue);
    setIsPlaying(true);
  };

  const playNext = () => {
    if (!queue.length || !currentTrack) return;
    const index = queue.findIndex((t) => t.url === currentTrack.url);
    const next = queue[index + 1] || null;
    if (next) {
      setCurrentTrack(next);
      setNextTrack(queue[index + 2] || null);
      setIsPlaying(true);
    } else {
      setCurrentTrack(null);
      setNextTrack(null);
      setCurrentShow(null);
      setIsPlaying(false);
    }
  };

  const playPrev = () => {
    if (!queue.length || !currentTrack) return;
    const index = queue.findIndex((t) => t.url === currentTrack.url);
    const prev = queue[index - 1] || null;
    if (prev) {
      setCurrentTrack(prev);
      setNextTrack(queue[index] || null);
      setIsPlaying(true);
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        currentShow,
        nextTrack,
        isPlaying,
        setIsPlaying,
        playTrack,
        playNext,
        playPrev,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
