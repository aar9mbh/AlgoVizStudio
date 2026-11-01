import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import type { usePlayback } from "../hooks/usePlayback";

type Props = {
  playback: ReturnType<typeof usePlayback>;
  count: number;
  speed: number;
  onSpeed: (speed: number) => void;
};
export function PlaybackControls({
  playback: p,
  count,
  speed,
  onSpeed,
}: Props) {
  return (
    <div className="playback">
      <div className="transport">
        <button
          className="icon-button"
          aria-label="Reset playback"
          title="Reset"
          onClick={p.reset}
        >
          <RotateCcw size={17} />
        </button>
        <button
          className="icon-button"
          aria-label="Previous step"
          title="Previous step"
          disabled={p.index === 0}
          onClick={p.previous}
        >
          <SkipBack size={18} />
        </button>
        <button
          className="play-button"
          aria-label={p.playing ? "Pause" : "Play"}
          disabled={count < 2}
          onClick={p.playing ? p.pause : p.play}
        >
          {p.playing ? (
            <Pause size={18} />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
        </button>
        <button
          className="icon-button"
          aria-label="Next step"
          title="Next step"
          disabled={p.index >= count - 1}
          onClick={p.next}
        >
          <SkipForward size={18} />
        </button>
      </div>
      <label className="scrubber">
        <span>
          Step {count ? p.index + 1 : 0} / {count}
        </span>
        <input
          aria-label="Execution step"
          type="range"
          min={0}
          max={Math.max(0, count - 1)}
          value={p.index}
          onChange={(e) => p.seek(Number(e.target.value))}
        />
      </label>
      <label className="speed">
        Speed
        <select
          aria-label="Animation speed"
          value={speed}
          onChange={(e) => onSpeed(Number(e.target.value))}
        >
          {[0.25, 0.5, 1, 1.5, 2, 3].map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
