import { useRef, useState, useEffect, useCallback } from 'react';

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0); // 0.0 to 1.0
  const [playbackRate, setPlaybackRate] = useState(1.0); // 0.5 to 2.0
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize Audio Context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: 24000 });
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      
      audioContextRef.current = ctx;
      gainNodeRef.current = gainNode;
    }
    
    // Resume if suspended (browser policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const play = useCallback(async (buffer: AudioBuffer) => {
    initAudio();
    stop(); // Stop any current audio

    if (!audioContextRef.current || !gainNodeRef.current) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;
    source.connect(gainNodeRef.current);

    source.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    sourceNodeRef.current = source;
    source.start(0);
    setDuration(buffer.duration);
    setIsPlaying(true);
  }, [initAudio, playbackRate]);

  const stop = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const pause = useCallback(() => {
     if (audioContextRef.current?.state === 'running') {
         audioContextRef.current.suspend();
         setIsPlaying(false);
     }
  }, []);

  const resume = useCallback(() => {
      if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume();
          setIsPlaying(true);
      }
  }, []);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioContextRef.current!.currentTime, 0.1);
    }
  }, [volume]);

  // Update playback rate on active source
  useEffect(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.playbackRate.value = playbackRate;
    }
  }, [playbackRate]);

  // Handle Visibility Change (Background/Foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (audioContextRef.current) {
        if (document.hidden) {
           // Ideally, for a music app, we WANT it to play in background.
           // However, if the browser forces suspension, we can't stop it.
           // We mainly listen to "visible" to ensure we resume if the browser auto-suspended.
        } else {
           if (audioContextRef.current.state === 'suspended' && isPlaying) {
             audioContextRef.current.resume();
           }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  return {
    play,
    stop,
    pause,
    resume,
    isPlaying,
    volume,
    setVolume,
    playbackRate,
    setPlaybackRate,
    initAudio
  };
};
