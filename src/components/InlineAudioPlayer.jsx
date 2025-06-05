import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

let globalAudioRef = null;
let currentPlayerId = null;

const InlineAudioPlayer = forwardRef(({ src, nextRef }, ref) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const idRef = useRef(crypto.randomUUID());

  useImperativeHandle(ref, () => ({
    play: () => {
      togglePlay(true);
    },
  }));

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss.toString().padStart(2, '0')}`;
  };

  const togglePlay = (forcePlay = false) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (globalAudioRef && globalAudioRef !== audio) {
      globalAudioRef.pause();
    }

    if (forcePlay || audio.paused) {
      audio.play();
      globalAudioRef = audio;
      currentPlayerId = idRef.current;
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    setProgress((audio.currentTime / audio.duration) * 100);
    setTime(audio.currentTime);
  };

  const onSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const audio = audioRef.current;
    if (audio && audio.duration) {
      audio.currentTime = percent * audio.duration;
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setTime(0);

    // 👇 Play the next track if available
    if (nextRef?.current?.play) {
      nextRef.current.play();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPlayerId !== idRef.current && isPlaying) {
        setIsPlaying(false);
      }
    }, 200);

    return () => {
      clearInterval(interval);
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        if (globalAudioRef === audio) globalAudioRef = null;
      }
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col items-start gap-1 w-full max-w-xs">
      <div className="flex items-center gap-2">
        <button
          onClick={() => togglePlay()}
          className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-900 rounded-full shadow hover:bg-gray-300 transition"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <span className="text-sm text-gray-700">{formatTime(time)}</span>
      </div>

      <div
        className="w-full h-2 bg-gray-300 rounded overflow-hidden cursor-pointer"
        onClick={onSeek}
      >
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        className="hidden"
      />
    </div>
  );
});

export default InlineAudioPlayer;
