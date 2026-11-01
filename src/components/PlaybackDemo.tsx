import { usePlayback } from "../hooks/usePlayback";
import { PlaybackControls } from "./PlaybackControls";

const steps = [
  "Ready to explore",
  "Inspect the current state",
  "Move to the next event",
  "Review the explanation",
  "Execution complete",
];
export function PlaybackDemo({
  speed,
  onSpeed,
}: {
  speed: number;
  onSpeed: (speed: number) => void;
}) {
  const playback = usePlayback(steps.length, speed);
  return (
    <section className="panel demo">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE PLAYBACK ENGINE</span>
          <h2>Your pace. Your understanding.</h2>
        </div>
        <span className="tag">Interactive control demo</span>
      </div>
      <div className="demo-track">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`demo-node ${i === playback.index ? "active" : ""} ${i < playback.index ? "done" : ""}`}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
          </div>
        ))}
      </div>
      <p className="demo-description" aria-live="polite">
        {steps[playback.index]}
        <span>
          A five-state walkthrough of the shared controls. Open Sorting to
          explore real algorithm events.
        </span>
      </p>
      <PlaybackControls
        playback={playback}
        count={steps.length}
        speed={speed}
        onSpeed={onSpeed}
      />
    </section>
  );
}
