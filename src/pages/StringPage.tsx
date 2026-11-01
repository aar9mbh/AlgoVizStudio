import { useState } from "react";
import { stringSteps } from "../algorithms/strings";
import { ExecutionPlayer } from "../components/ExecutionPlayer";
import { LessonPanel } from "../components/LessonPanel";
import { useLocalStorage } from "../hooks/useLocalStorage";
const valid = (v: unknown): v is { text: string; pattern: string } =>
  !!v &&
  typeof v === "object" &&
  typeof (v as { text: unknown }).text === "string" &&
  typeof (v as { pattern: unknown }).pattern === "string" &&
  Array.from((v as { text: string }).text).length <= 120 &&
  Array.from((v as { pattern: string }).pattern).length <= 30;
export function StringPage({
  speed,
  onSpeed,
}: {
  speed: number;
  onSpeed: (n: number) => void;
}) {
  const [saved, setSaved] = useLocalStorage(
    "algoviz.strings",
    { text: "ABABABCABABABCAB", pattern: "ABABC" },
    valid,
  );
  const [text, setText] = useState(saved.text),
    [pattern, setPattern] = useState(saved.pattern),
    [algorithm, setAlgorithm] = useState<"naive" | "kmp">("kmp");
  const [execution, setExecution] = useState(() => ({
      text: saved.text,
      pattern: saved.pattern,
      algorithm: "kmp" as "naive" | "kmp",
      steps: stringSteps(saved.text, saved.pattern, "kmp"),
      run: 0,
    })),
    [error, setError] = useState("");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PATTERNS / PREFIXES / OVERLAPS</span>
          <h1>String Matching Visualizer.</h1>
          <p>
            Watch every character comparison, including KMP’s LPS preprocessing.
          </p>
        </div>
      </div>
      <section className="panel lab-form">
        <label>
          Algorithm
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as "naive" | "kmp")}
          >
            <option value="kmp">KMP</option>
            <option value="naive">Naive String Matching</option>
          </select>
        </label>
        <label className="grow">
          Text
          <input value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <label>
          Pattern
          <input value={pattern} onChange={(e) => setPattern(e.target.value)} />
        </label>
        <button
          className="primary-button"
          onClick={() => {
            try {
              const steps = stringSteps(text, pattern, algorithm);
              setExecution((e) => ({
                text,
                pattern,
                algorithm,
                steps,
                run: e.run + 1,
              }));
              setSaved({ text, pattern });
              setError("");
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          Generate execution
        </button>
        <p className="input-help">
          Text ≤120 and pattern ≤30 Unicode code points. Empty pattern matches
          all boundaries. Change draft inputs, then generate to apply them.
        </p>
        {error && (
          <p role="alert" className="input-error">
            {error}
          </p>
        )}
      </section>
      <ExecutionPlayer
        key={execution.run}
        steps={execution.steps}
        speed={speed}
        onSpeed={onSpeed}
      >
        {(s) => (
          <>
            <section className="panel lab-canvas">
              <div className="result-strip">
                <span>Phase: {s.phase}</span>
                <span>
                  i = {s.i}, j = {s.j}
                </span>
                <span>Comparisons: {s.comparisons}</span>
              </div>
              <h3>{s.phase === "lps" ? "Pattern preprocessing" : "Text"}</h3>
              <div className="character-row">
                {Array.from(
                  s.phase === "lps" ? execution.pattern : execution.text,
                ).map((char, i) => (
                  <div
                    key={i}
                    className={`character ${s.i === i ? (s.mismatch ? "mismatch" : "matching") : ""} ${s.phase !== "lps" && s.matches.some((pos) => i >= pos && i < pos + Array.from(execution.pattern).length) ? "found" : ""}`}
                  >
                    <span>{char === " " ? "␠" : char}</span>
                    <small>{i}</small>
                  </div>
                ))}
              </div>
              <h3>
                Pattern ·{" "}
                {s.phase === "lps"
                  ? "prefix comparison"
                  : `alignment ${s.offset}`}
              </h3>
              <div className="character-row">
                {Array.from(execution.pattern).map((char, j) => (
                  <div
                    key={j}
                    className={`character ${s.j === j ? (s.mismatch ? "mismatch" : "matching") : ""}`}
                  >
                    <span>{char === " " ? "␠" : char}</span>
                    <small>{j}</small>
                  </div>
                ))}
              </div>
              {execution.algorithm === "kmp" && (
                <>
                  <h3>
                    LPS array (longest proper prefix which is also a suffix)
                  </h3>
                  <div className="character-row">
                    {s.lps.map((n, i) => (
                      <div
                        key={i}
                        className={`character ${s.phase === "lps" && s.i === i ? "matching" : ""}`}
                      >
                        <span>{n}</span>
                        <small>{i}</small>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <p className="result-text">
                Matches: {s.matches.join(", ") || "none yet"}
              </p>
              <p className="input-help">
                Amber/teal outlines show current comparisons; pink indicates a
                mismatch; green fills mark found text ranges. Rows wrap for
                readability; alignment is given numerically.
              </p>
            </section>
            <LessonPanel id={execution.algorithm} line={s.line} />
          </>
        )}
      </ExecutionPlayer>
    </>
  );
}
