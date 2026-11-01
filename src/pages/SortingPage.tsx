import { useMemo, useState } from "react";
import {
  generateSortSteps,
  MAX_SORT_SIZE,
  parseArray,
  sortIds,
  validArray,
  type SortId,
} from "../algorithms/sorting";
import { sortingLessons } from "../data/sorting";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePlayback } from "../hooks/usePlayback";
import { PlaybackControls } from "../components/PlaybackControls";
import { SortingStage } from "../visualizers/SortingStage";

const initial = [38, 14, 52, 23, 8, 45, 31, 17];
export function SortingPage({
  speed,
  onSpeed,
}: {
  speed: number;
  onSpeed: (speed: number) => void;
}) {
  const [input, setInput] = useLocalStorage(
    "algoviz.sorting.input",
    initial,
    validArray,
  );
  const [draft, setDraft] = useState(input.join(", "));
  const [size, setSize] = useState(Math.max(2, input.length));
  const [algorithm, setAlgorithm] = useState<SortId>("bubble");
  const [second, setSecond] = useState<SortId>("merge");
  const [compare, setCompare] = useState(false);
  const [error, setError] = useState("");
  const [run, setRun] = useState(0);
  function apply(values: number[]) {
    setInput(values);
    setDraft(values.join(", "));
    setError("");
    setRun((r) => r + 1);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SORTING / SIX WAYS TO FIND ORDER</span>
          <h1>
            Sorting Visualizer<span className="accent">.</span>
          </h1>
          <p>
            Follow real comparisons, exchanges, and writes. Rewind any decision.
          </p>
        </div>
        <span className="phase-pill">6 algorithms available</span>
      </div>
      <section className="panel sort-setup" aria-label="Sorting configuration">
        <div className="sort-options">
          <label>
            Algorithm
            <select
              value={algorithm}
              onChange={(e) => {
                setAlgorithm(e.target.value as SortId);
                setRun((r) => r + 1);
              }}
            >
              {sortIds.map((id) => (
                <option value={id} key={id}>
                  {sortingLessons[id].name}
                </option>
              ))}
            </select>
          </label>
          <label className="compare-toggle">
            <input
              type="checkbox"
              checked={compare}
              onChange={(e) => {
                setCompare(e.target.checked);
                setRun((r) => r + 1);
              }}
            />{" "}
            Compare side by side
          </label>
          {compare && (
            <label>
              Compare with
              <select
                value={second}
                onChange={(e) => {
                  setSecond(e.target.value as SortId);
                  setRun((r) => r + 1);
                }}
              >
                {sortIds.map((id) => (
                  <option value={id} key={id}>
                    {sortingLessons[id].name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            try {
              apply(parseArray(draft));
            } catch (err) {
              setError((err as Error).message);
            }
          }}
          className="array-form"
        >
          <label>
            Custom array
            <input
              aria-describedby="array-help"
              aria-invalid={!!error}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="38, 14, 52, 23"
            />
          </label>
          <button className="secondary-button" type="submit">
            Apply input
          </button>
        </form>
        <div className="random-controls">
          <label>
            Random size: {size}
            <input
              aria-label="Random array size"
              type="range"
              min={2}
              max={MAX_SORT_SIZE}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </label>
          <button
            className="secondary-button"
            onClick={() =>
              apply(
                Array.from({ length: size }, () =>
                  Math.floor(Math.random() * 100),
                ),
              )
            }
          >
            Generate random
          </button>
          <button className="text-button" onClick={() => apply(initial)}>
            Load example
          </button>
        </div>
        <p id="array-help" className="input-help">
          Up to {MAX_SORT_SIZE} numbers from −999 to 999; commas or spaces.
          Duplicates, decimals, negatives, and an empty input are supported.
          Apply or change algorithms to start a new paused run.
        </p>
        {error && (
          <p role="alert" className="input-error">
            {error}
          </p>
        )}
      </section>
      <SortingRun
        key={run}
        input={input}
        algorithm={algorithm}
        second={compare ? second : null}
        speed={speed}
        onSpeed={onSpeed}
      />
    </>
  );
}
function SortingRun({
  input,
  algorithm,
  second,
  speed,
  onSpeed,
}: {
  input: number[];
  algorithm: SortId;
  second: SortId | null;
  speed: number;
  onSpeed: (n: number) => void;
}) {
  const left = useMemo(
    () => generateSortSteps(algorithm, input),
    [algorithm, input],
  );
  const right = useMemo(
    () => (second ? generateSortSteps(second, input) : null),
    [second, input],
  );
  const count = Math.max(left.length, right?.length ?? 0);
  const playback = usePlayback(count, speed);
  return (
    <>
      <div className="sort-legend">
        <span className="legend-compare">Comparison</span>
        <span className="legend-swap">Swap / write</span>
        <span className="legend-pivot">Pivot / held key</span>
        <span className="legend-sorted">Final position</span>
      </div>
      {second && (
        <p className="input-help comparison-note">
          Identical initial input; one event per panel per tick. A finished
          panel holds its result. Step counts and animation duration are not
          runtime benchmarks.
        </p>
      )}
      <section className="panel sort-transport">
        <PlaybackControls
          playback={playback}
          count={count}
          speed={speed}
          onSpeed={onSpeed}
        />
        <p className="input-help">
          Comparisons count value comparisons only. Swaps exchange distinct
          positions; each adds two main-array writes. Writes also include
          insertion shifts, key placement, and merge output. Temporary buffer
          copies and snapshot copies are excluded.
        </p>
      </section>
      <div className={second ? "sort-stages comparing" : "sort-stages"}>
        <SortingStage
          algorithm={algorithm}
          steps={left}
          index={playback.index}
          input={input}
        />
        {second && right && (
          <SortingStage
            algorithm={second}
            steps={right}
            index={playback.index}
            input={input}
          />
        )}
      </div>
    </>
  );
}
