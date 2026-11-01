import { lessons } from "../data/lessons";
import { TreeRepairNotes } from "./TreeRepairNotes";
export function LessonPanel({ id, line = 0 }: { id: string; line?: number }) {
  const l = lessons[id];
  if (!l) return null;
  return (
    <section className="panel lesson-panel">
      <h2>{l.title} · learning notes</h2>
      <p>{l.definition}</p>
      <div className="pseudocode">
        <h3>Working steps / pseudocode</h3>
        <ol>
          {l.pseudocode.map((code, i) => (
            <li
              key={i}
              className={line === i ? "highlight-line" : ""}
              aria-current={line === i ? "step" : undefined}
            >
              <code>{code}</code>
            </li>
          ))}
        </ol>
      </div>
      <TreeRepairNotes id={id} />
      <div className="complexity-grid">
        {[
          ["Best", l.best],
          ["Average", l.average],
          ["Worst", l.worst],
          ["Auxiliary / working space", l.space],
        ].map(([a, b]) => (
          <div key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
          </div>
        ))}
      </div>
      <details>
        <summary>Principle, example, tradeoffs, and assumptions</summary>
        {[
          ["Working principle", l.principle],
          ["Example", l.example],
          ["Advantages", l.advantages],
          ["Limitations", l.limitations],
          ["Applications", l.applications],
          ["Assumptions", l.assumptions],
        ].map(([a, b]) => (
          <div key={a}>
            <h3>{a}</h3>
            <p>{b}</p>
          </div>
        ))}
      </details>
    </section>
  );
}
