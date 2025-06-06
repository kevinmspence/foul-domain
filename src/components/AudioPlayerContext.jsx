import { createContext, useContext, useRef, useState, useEffect } from "react";

const AudioPlayerContext = createContext();

export function AudioPlayerProvider({ children }) {
  const audioRef = useRef(typeof Audio !== "undefined" ? new Audio() : null);
  const currentTrackRef = useRef(null);
  const currentShowRef = useRef(null);
  const queueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const lastPlayedTimeRef = useRef(0);
  const [tick, setTick] = useState(0);

  const forceUpdate = () => setTick((t) => t + 1);

  // 🧠 Load from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = JSON.parse(localStorage.getItem("foul-audio"));
      if (saved?.currentTrack?.url) {
        currentTrackRef.current = saved.currentTrack;
        currentShowRef.current = saved.currentShow;
        queueRef.current = Array.isArray(saved.queue) ? saved.queue : [];
        isPlayingRef.current = false;

        const savedTime = Number(localStorage.getItem("foul-audio-time"));
        if (!isNaN(savedTime)) {
          lastPlayedTimeRef.current = savedTime;
        }

        console.log("🔁 Rehydrated audio state:", {
          title: saved.currentTrack?.title,
          currentTime: savedTime,
        });

        forceUpdate();
      }
    } catch (err) {
      console.error("🎧 Failed to load audio state:", err);
    }
  }, []);

  // 💾 Save to localStorage
  const saveState = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "foul-audio",
        JSON.stringify({
          currentTrack: currentTrackRef.current,
          currentShow: currentShowRef.current,
          queue: queueRef.current,
        })
      );
    } catch (err) {
      console.error("❌ Failed to save audio state:", err);
    }
  };

  // 🎧 Track playback position
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      lastPlayedTimeRef.current = audio.currentTime;
      localStorage.setItem("foul-audio-time", String(audio.currentTime));
    };

    const handlePause = () => {
      localStorage.setItem("foul-audio-time", String(audio.currentTime));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  const playTrack = (track, fullQueue = [], show = null) => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log("🎧 playTrack invoked with:", track?.title);
    console.log("🔁 Existing audio.src:", audio.src);
    console.log("⏱ lastPlayedTimeRef:", lastPlayedTimeRef.current);

    currentTrackRef.current = track;
    currentShowRef.current = show;
    queueRef.current = fullQueue;
    isPlayingRef.current = true;

    audio.src = track.url;

    // ⏱ Resume at last known time if same track
    if (audio.src === track.url && lastPlayedTimeRef.current > 0) {
      audio.currentTime = lastPlayedTimeRef.current;
      console.log("⏮ Seeking to saved position:", lastPlayedTimeRef.current);
    }

    audio.play().catch(console.error);
    saveState();
    forceUpdate();
  };

  const pause = () => {
    audioRef.current?.pause();
    isPlayingRef.current = false;
    forceUpdate();
  };

  const resume = () => {
    audioRef.current?.play().catch(console.error);
    isPlayingRef.current = true;
    forceUpdate();
  };

  const playNext = () => {
    const queue = queueRef.current;
    const index = queue.findIndex((t) => t.url === currentTrackRef.current?.url);
    const next = queue[index + 1];
    if (next) playTrack(next, queue, currentShowRef.current);
    else isPlayingRef.current = false;
    forceUpdate();
  };

  const playPrev = () => {
    const queue = queueRef.current;
    const index = queue.findIndex((t) => t.url === currentTrackRef.current?.url);
    const prev = queue[index - 1];
    if (prev) playTrack(prev, queue, currentShowRef.current);
    forceUpdate();
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack: currentTrackRef.current,
        currentShow: currentShowRef.current,
        isPlaying: isPlayingRef.current,
        playTrack,
        pause,
        resume,
        playNext,
        playPrev,
        audioRef,
        nowPlayingShowId: currentShowRef.current?.id ?? null,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
