import { useState } from "react";
import { lessons } from "../data/lessons";
import { LessonPanel } from "../components/LessonPanel";
export function GuidePage() {
  const [id, setId] = useState("bubble");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">LEARN / EXPLAIN / EXPERIMENT</span>
          <h1>Algorithm Learning Guide.</h1>
          <p>
            Definitions, working principles, pseudocode, examples, and
            complexity for all 20 algorithms.
          </p>
        </div>
      </div>
      <section className="panel lab-form">
        <label className="grow">
          Study an algorithm
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {Object.entries(lessons)
              .sort((a, b) => a[1].title.localeCompare(b[1].title))
              .map(([key, l]) => (
                <option key={key} value={key}>
                  {l.title}
                </option>
              ))}
          </select>
        </label>
        <p className="input-help">
          Start with an invariant, predict the next state, then compare your
          prediction with the execution. Complexity describes growth; measured
          runtime also depends on the browser and machine. Each visualizer
          highlights the explanation for its current event.
        </p>
      </section>
      <LessonPanel id={id} />
      <section className="panel lesson-panel">
        <h2>Eight phases, one inspectable project</h2>
        <ol>
          {[
            "Foundation and playback engine",
            "Six sorting algorithms and comparison",
            "BST, AVL, and Red-Black Trees",
            "Graph editor and four graph algorithms",
            "String matching, greedy algorithms, and DP",
            "Background benchmarks and CSV export",
            "Learning content and documentation",
            "Automated checks and browser review",
          ].map((phase) => (
            <li key={phase}>{phase}</li>
          ))}
        </ol>
        <p>
          The project was developed with AI assistance. Study the implementation
          and tests, reproduce the examples, and explain tradeoffs in your own
          words. TESTING.md records what has actually been verified.
        </p>
      </section>
    </>
  );
}
