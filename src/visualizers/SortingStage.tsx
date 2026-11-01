import { motion, useReducedMotion } from "motion/react";
import type { SortId, SortStep } from "../algorithms/sorting";
import { sortingLessons } from "../data/sorting";

export function SortingStage({
  algorithm,
  steps,
  index,
  input,
}: {
  algorithm: SortId;
  steps: SortStep[];
  index: number;
  input: number[];
}) {
  const step = steps[Math.min(index, steps.length - 1)];
  const lesson = sortingLessons[algorithm];
  const reduced = useReducedMotion();
  const max = Math.max(1, ...input.map(Math.abs));
  return (
    <section
      className="panel sorting-stage"
      aria-label={`${lesson.name} execution`}
    >
      <div className="section-heading">
        <h2>{lesson.name}</h2>
        <span className="tag">
          {step.event === "done"
            ? "Complete"
            : `Event ${Math.min(index + 1, steps.length)} / ${steps.length}`}
        </span>
      </div>
      <div className="sort-metrics">
        <span>
          <strong>{step.comparisons}</strong> comparisons
        </span>
        <span>
          <strong>{step.swaps}</strong> swaps
        </span>
        <span>
          <strong>{step.writes}</strong> writes
        </span>
      </div>
      <div
        className="bar-chart"
        role="img"
        aria-label={`Array state: ${step.items.map((x) => x.value).join(", ") || "empty"}`}
      >
        {step.items.length ? (
          step.items.map((item, i) => {
            const active = step.active.includes(i);
            const state =
              step.event === "compare" && active
                ? "compare"
                : (step.event === "swap" || step.event === "write") && active
                  ? "swap"
                  : step.pivot === i || (step.event === "pivot" && active)
                    ? "pivot"
                    : step.sorted.includes(i)
                      ? "sorted"
                      : "idle";
            // Position keys show array writes faithfully; item identities can be duplicated during a shift.
            const height = 5 + (Math.abs(item.value) / max) * 90;
            return (
              <div
                className={`bar-slot ${item.value < 0 ? "negative" : ""}`}
                key={i}
              >
                <span className="bar-value">{item.value}</span>
                <div className="bar-space">
                  <motion.div
                    className={`sort-bar ${state}`}
                    initial={false}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: reduced ? 0 : 0.15 }}
                  />
                </div>
                <span className="bar-index">{i}</span>
              </div>
            );
          })
        ) : (
          <div className="empty-array">
            ∅<span>The empty array is already sorted.</span>
          </div>
        )}
      </div>
      <p className="input-help">
        Bar length = absolute value; negative values have a striped fill. Labels
        show signed values.
      </p>
      <div className="step-explanation" aria-live="polite">
        <span className="eyebrow">{step.event.toUpperCase()}</span>
        <p>{step.description}</p>
        {algorithm === "merge" && step.event === "compare" && (
          <small>
            Compare the saved buffer items; highlighted positions identify their
            source slots, which may already have been overwritten.
          </small>
        )}
      </div>
      <div className="pseudocode">
        <h3>Pseudocode</h3>
        <ol>
          {lesson.pseudocode.map((line, i) => (
            <li
              className={step.line === i ? "highlight-line" : ""}
              key={i}
              aria-current={step.line === i ? "step" : undefined}
            >
              <code>{line}</code>
            </li>
          ))}
        </ol>
      </div>
      <div className="complexity-grid">
        {[
          ["Best", lesson.best],
          ["Average", lesson.average],
          ["Worst", lesson.worst],
          ["Auxiliary space", lesson.space],
          ["Stable", lesson.stable ? "Yes" : "No"],
          ["In-place", lesson.inPlace ? "Yes" : "No"],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <details className="sort-lesson">
        <summary>Understand {lesson.name}</summary>
        <h3>What it does</h3>
        <p>{lesson.definition}</p>
        <h3>How it works</h3>
        <p>{lesson.principle}</p>
        <h3>Example</h3>
        <p>
          [3, 1, 2] → [1, 2, 3]. Apply this input and step through to see the
          decisions.
        </p>
        <h3>Advantages</h3>
        <p>{lesson.advantages}</p>
        <h3>Limitations</h3>
        <p>{lesson.limitations}</p>
        <h3>Applications</h3>
        <p>{lesson.applications}</p>
        <h3>Complexity assumptions</h3>
        <p>
          n is the number of elements, with constant-time numeric comparisons.
          Average cases assume randomly ordered distinct keys. Space describes
          the underlying algorithm, including recursion, and excludes this
          visualizer’s stored snapshots. In-place refers to array
          partitioning/storage; Quick Sort still uses its recursion stack.
        </p>
        {algorithm === "heap" && (
          <p>
            ¹ For this sift-down implementation, all equal keys can finish in
            Θ(n). With distinct keys, the best case is Θ(n log n). The displayed
            bound permits duplicate-heavy input.
          </p>
        )}
      </details>
    </section>
  );
}
