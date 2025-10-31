import { useRef, useCallback } from 'react';

/**
 * A custom hook to generate and play sound effects using the Web Audio API.
 * This avoids the need for external audio files.
 */
export const useTickSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  /**
   * Lazily initializes and returns the AudioContext.
   * Ensures the context is resumed if it was suspended by the browser.
   */
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioCtxRef.current = new AudioContext();
        } else {
          console.warn("Web Audio API is not supported in this browser.");
          return null;
        }
      } catch (e) {
        console.error("Could not create AudioContext:", e);
        return null;
      }
    }
    
    const audioCtx = audioCtxRef.current;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }, []);


  const playTick = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime;
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1000, now);
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }, [getAudioContext]);

  /**
   * Plays a pleasant, ascending two-tone sound for correct answers.
   */
  const playCorrectSound = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime;

    oscillator.type = 'sine'; // A clean, pure tone
    gainNode.gain.setValueAtTime(0, now);

    // First note: C5
    oscillator.frequency.setValueAtTime(523.25, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.15);

    // Second note: G5
    oscillator.frequency.setValueAtTime(783.99, now + 0.15);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.16);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.4);
  }, [getAudioContext]);

  /**
   * Plays a short, dissonant, descending sound for incorrect answers.
   */
  const playIncorrectSound = useCallback(() => {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime;

    oscillator.type = 'sawtooth'; // A harsher, "buzzy" tone
    oscillator.frequency.setValueAtTime(160, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }, [getAudioContext]);

  return { playTick, playCorrectSound, playIncorrectSound };
};
