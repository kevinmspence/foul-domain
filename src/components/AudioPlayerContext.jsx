import { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioPlayerContext = createContext();

export function AudioPlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentShow, setCurrentShow] = useState(null);
  const [nextTrack, setNextTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleEnded = () => playNext();
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const playTrack = (track, fullQueue = [], show = null) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = track.url;
    audio.play().catch(console.error);

    setCurrentTrack(track);
    setCurrentShow(show);
    const index = fullQueue.findIndex((t) => t.url === track.url);
    setNextTrack(fullQueue[index + 1] || null);
    setQueue(fullQueue);
    setIsPlaying(true);
  };

  const pause = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const playNext = () => {
    if (!queue.length || !currentTrack) return;
    const index = queue.findIndex((t) => t.url === currentTrack.url);
    const next = queue[index + 1] || null;
    if (next) {
      playTrack(next, queue, currentShow);
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
      playTrack(prev, queue, currentShow);
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
        pause,       // ✅ Now exposed
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
