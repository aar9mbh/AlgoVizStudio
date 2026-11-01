import type { ReactNode } from "react";
import { usePlayback } from "../hooks/usePlayback";
import { PlaybackControls } from "./PlaybackControls";
export type ExecutionStep = { description: string; line?: number };
export function ExecutionPlayer<T extends ExecutionStep>({
  steps,
  speed,
  onSpeed,
  children,
}: {
  steps: T[];
  speed: number;
  onSpeed: (n: number) => void;
  children: (step: T) => ReactNode;
}) {
  const playback = usePlayback(steps.length, speed);
  const step = steps[playback.index];
  return (
    <>
      <section className="panel execution-controls">
        <PlaybackControls
          playback={playback}
          count={steps.length}
          speed={speed}
          onSpeed={onSpeed}
        />
      </section>
      {step && (
        <>
          <div className="step-explanation" aria-live="polite">
            <span className="eyebrow">EXECUTION STATE</span>
            <p>{step.description}</p>
          </div>
          {children(step)}
        </>
      )}
    </>
  );
}
