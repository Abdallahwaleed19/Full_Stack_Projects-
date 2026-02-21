import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

// إذاعة القرآن الكريم - القاهرة (مصادر بديلة عند فشل الأول)
const RADIO_URLS = [
  'https://qurancairo.radioca.st/stream',
  'https://liveradio.quranradioo.com/stream',
  'https://n0a.radiojar.com/8s5u5tpdtwzuv',
  'https://stream.radiojar.com/8s5u5tpdtwzuv',
  'https://icecast.radiojar.com/8s5u5tpdtwzuv',
];

const RadioContext = createContext(null);

export function RadioProvider({ children }) {
  const audioRef = useRef(null);
  const urlIndexRef = useRef(0);
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [radioError, setRadioError] = useState(null);

  const getAudio = useCallback((url) => {
    if (!url) url = RADIO_URLS[urlIndexRef.current] || RADIO_URLS[0];
    const a = new Audio(url);
    a.onplay = () => { setRadioError(null); setIsPlaying(true); };
    a.onpause = () => setIsPlaying(false);
    a.onended = () => setIsPlaying(false);
    a.onerror = () => setIsPlaying(false);
    return a;
  }, []);

  const tryPlay = useCallback((a) => {
    return a.play().then(() => { setRadioError(null); }).catch((e) => {
      const next = urlIndexRef.current + 1;
      if (next < RADIO_URLS.length) {
        urlIndexRef.current = next;
        audioRef.current = getAudio(RADIO_URLS[next]);
        return tryPlay(audioRef.current);
      }
      setRadioError(true);
      setIsPlaying(false);
      console.error('Radio play failed:', e);
    });
  }, [getAudio]);

  const startRadio = useCallback(() => {
    setRadioError(null);
    urlIndexRef.current = 0;
    setIsActive(true);
    const url = RADIO_URLS[0];
    audioRef.current = getAudio(url);
    tryPlay(audioRef.current);
  }, [getAudio, tryPlay]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => {
        setRadioError(true);
        console.error('Radio play failed:', e);
      });
    }
  }, [isPlaying]);

  const stopRadio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsActive(false);
    setIsPlaying(false);
    setRadioError(null);
  }, []);

  const value = {
    isActive,
    isPlaying,
    radioError,
    startRadio,
    togglePlayPause,
    stopRadio,
  };

  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
}

export function useRadio() {
  return useContext(RadioContext);
}
