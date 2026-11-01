import { useEffect, useState } from "react";

/** Mount one controller per execution history. Timers are cancelled on pause and unmount. */
export function usePlayback(stepCount: number, speed = 1) {
  const count = Math.max(0, Math.floor(stepCount));
  const last = Math.max(0, count - 1);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const safeIndex = Math.min(index, last);
  useEffect(() => {
    setIndex((i) => Math.min(i, last));
    setPlaying(false);
  }, [count, last]);
  useEffect(() => {
    if (!playing || safeIndex >= last) return;
    const timer = window.setTimeout(
      () => setIndex((i) => Math.min(i + 1, last)),
      800 / Math.max(0.25, speed),
    );
    return () => window.clearTimeout(timer);
  }, [playing, safeIndex, last, speed]);
  useEffect(() => {
    if (safeIndex >= last) setPlaying(false);
  }, [safeIndex, last]);
  return {
    index: safeIndex,
    playing,
    play: () => {
      if (count > 1) {
        if (safeIndex === last) setIndex(0);
        setPlaying(true);
      }
    },
    pause: () => setPlaying(false),
    next: () => {
      setPlaying(false);
      setIndex((i) => Math.min(i + 1, last));
    },
    previous: () => {
      setPlaying(false);
      setIndex((i) => Math.max(0, i - 1));
    },
    reset: () => {
      setPlaying(false);
      setIndex(0);
    },
    seek: (position: number) => {
      setPlaying(false);
      setIndex(Math.max(0, Math.min(last, Math.floor(position))));
    },
  };
}
