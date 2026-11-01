import { useState } from "react";
import {
  activitySteps,
  fractionalSteps,
  huffmanSteps,
  parseRows,
  type GreedyStep,
  type HuffNode,
} from "../algorithms/greedy";
import { ExecutionPlayer } from "../components/ExecutionPlayer";
import { LessonPanel } from "../components/LessonPanel";
type Kind = "activity" | "fractional" | "huffman";
const examples = {
  activity: "0, 2\n1, 4\n2, 3\n3, 5\n5, 7",
  fractional: "10, 60\n20, 100\n30, 120",
  huffman: "ABRACADABRA",
};
export function GreedyPage({
  speed,
  onSpeed,
}: {
  speed: number;
  onSpeed: (n: number) => void;
}) {
  const [kind, setKind] = useState<Kind>("activity"),
    [draft, setDraft] = useState(examples.activity),
    [capacity, setCapacity] = useState("50"),
    [frequencyMode, setFrequencyMode] = useState(false),
    [error, setError] = useState("");
  const [execution, setExecution] = useState<{
    kind: Kind;
    steps: GreedyStep[];
    run: number;
  }>({
    kind: "activity",
    steps: activitySteps(
      parseRows(examples.activity).map(([start, finish], id) => ({
        id: id + 1,
        start,
        finish,
      })),
    ),
    run: 0,
  });
  function generate() {
    try {
      let steps: GreedyStep[];
      if (kind === "activity")
        steps = activitySteps(
          parseRows(draft).map(([start, finish], id) => ({
            id: id + 1,
            start,
            finish,
          })),
        );
      else if (kind === "fractional") {
        if (!capacity.trim()) throw new Error("Enter capacity.");
        steps = fractionalSteps(
          parseRows(draft).map(([weight, value], id) => ({
            id: id + 1,
            weight,
            value,
          })),
          Number(capacity),
        );
      } else if (frequencyMode) {
        const parsed: unknown = JSON.parse(draft);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
          throw new Error("Enter a JSON object of character frequencies.");
        steps = huffmanSteps("", parsed as Record<string, number>);
      } else steps = huffmanSteps(draft);
      setExecution((e) => ({ kind, steps, run: e.run + 1 }));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">LOCAL CHOICES / OPTIMAL STRUCTURE</span>
          <h1>Greedy Algorithm Visualizer.</h1>
          <p>
            Explore why a greedy choice works, and where its assumptions matter.
          </p>
        </div>
      </div>
      <section className="panel lab-form">
        <label>
          Algorithm
          <select
            value={kind}
            onChange={(e) => {
              const k = e.target.value as Kind;
              setKind(k);
              setDraft(examples[k]);
              setFrequencyMode(false);
            }}
          >
            <option value="activity">Activity Selection</option>
            <option value="fractional">Fractional Knapsack</option>
            <option value="huffman">Huffman Coding</option>
          </select>
        </label>
        {kind === "fractional" && (
          <label>
            Capacity
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </label>
        )}
        {kind === "huffman" && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={frequencyMode}
              onChange={(e) => {
                setFrequencyMode(e.target.checked);
                setDraft(
                  e.target.checked ? '{"A":5,"B":2,"C":1}' : examples.huffman,
                );
              }}
            />
            Custom frequency JSON
          </label>
        )}
        <div className="form-break" />
        <label className="grow">
          {kind === "activity"
            ? "Activities: start, finish per line"
            : kind === "fractional"
              ? "Items: weight, value per line"
              : frequencyMode
                ? "Frequencies: one character per key"
                : "Text to encode"}
          <textarea
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </label>
        <button className="primary-button" onClick={generate}>
          Generate execution
        </button>
        <p className="input-help">
          Activity limit 20; item limit 12; Huffman text limit 120, distinct
          symbol limit 24. Apply drafts with Generate execution. Fractional
          knapsack permits splitting; 0/1 knapsack in the DP module does not.
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
              {execution.kind === "activity" ? (
                <>
                  <h2>Activities sorted by finish time</h2>
                  <ActivityTimeline step={s} />
                  <div className="result-strip">
                    <span>Selected: {s.selected.join(", ") || "—"}</span>
                    <span>Rejected: {s.rejected.join(", ") || "—"}</span>
                  </div>
                </>
              ) : execution.kind === "fractional" ? (
                <>
                  <h2>Selection by value / weight ratio</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Weight</th>
                        <th>Value</th>
                        <th>Ratio</th>
                        <th>Fraction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.items.map((i) => (
                        <tr key={i.id}>
                          <td>{i.id}</td>
                          <td>{i.weight}</td>
                          <td>{i.value}</td>
                          <td>{(i.value / i.weight).toFixed(3)}</td>
                          <td>
                            <div className="fraction-bar">
                              <span
                                style={{
                                  width: `${(s.fractions[i.id] ?? 0) * 100}%`,
                                }}
                              />
                            </div>
                            {((s.fractions[i.id] ?? 0) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="result-text">
                    Value: {s.total.toFixed(3)} · Remaining capacity:{" "}
                    {s.remaining.toFixed(3)}
                  </p>
                </>
              ) : (
                <>
                  <h2>Priority queue (smallest first)</h2>
                  <div className="character-row">
                    {s.queue.map((n) => (
                      <span className="tag" key={n.id}>
                        {n.symbol ?? "subtree"}: {n.frequency}
                      </span>
                    ))}
                  </div>
                  <HuffmanCanvas tree={s.tree} />
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Prefix code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(s.codes).map(([symbol, code]) => (
                        <tr key={symbol}>
                          <td>{symbol === " " ? "space" : symbol}</td>
                          <td>
                            <code>{code}</code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="result-text">
                    Weighted encoded length: {s.bits} bits
                  </p>
                  {s.encoded && <p className="encoded-bits">{s.encoded}</p>}
                </>
              )}
            </section>
            <LessonPanel id={execution.kind} line={s.line} />
          </>
        )}
      </ExecutionPlayer>
    </>
  );
}
function ActivityTimeline({ step: s }: { step: GreedyStep }) {
  const min = Math.min(0, ...s.activities.map((a) => a.start)),
    max = Math.max(1, ...s.activities.map((a) => a.finish));
  const x = (time: number) => 70 + ((time - min) / (max - min)) * 490;
  return (
    <div className="canvas-scroll">
      <svg
        viewBox={`0 0 640 ${Math.max(90, s.activities.length * 38 + 35)}`}
        role="img"
        aria-label="Activity timeline"
        style={{ minWidth: 500 }}
      >
        {s.activities.map((a, i) => (
          <g key={a.id}>
            <text x="10" y={i * 38 + 29} fill="#a9bbd1" fontSize="12">
              #{a.id}
            </text>
            <rect
              x={x(a.start)}
              y={i * 38 + 9}
              width={Math.max(1, x(a.finish) - x(a.start))}
              height="25"
              rx="4"
              fill={
                s.selected.includes(a.id)
                  ? "#246f5f"
                  : s.rejected.includes(a.id)
                    ? "#6f334e"
                    : "#263d58"
              }
            />
            <text x={x(a.start) + 5} y={i * 38 + 26} fill="white" fontSize="11">
              {a.start}–{a.finish}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
function HuffmanCanvas({ tree }: { tree: HuffNode | null }) {
  if (!tree)
    return (
      <p className="input-help">
        No merged tree yet. Advance to a merge event.
      </p>
    );
  const nodes: { n: HuffNode; x: number; y: number }[] = [],
    edges: { x: number; y: number; px: number; py: number; bit: string }[] = [];
  let pos = 0;
  const walk = (n: HuffNode, depth: number): { x: number; y: number } => {
    const left = n.left ? walk(n.left, depth + 1) : null;
    const x = 35 + pos++ * 50,
      y = 35 + depth * 65;
    const right = n.right ? walk(n.right, depth + 1) : null;
    nodes.push({ n, x, y });
    if (left) edges.push({ ...left, px: x, py: y, bit: "0" });
    if (right) edges.push({ ...right, px: x, py: y, bit: "1" });
    return { x, y };
  };
  walk(tree, 0);
  const width = Math.max(500, pos * 50 + 25),
    height = Math.max(160, ...nodes.map((n) => n.y + 40));
  return (
    <div className="canvas-scroll">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ minWidth: Math.min(width, 1000) }}
        role="img"
        aria-label="Huffman tree"
      >
        {edges.map((e, i) => (
          <g key={i}>
            <line x1={e.x} y1={e.y} x2={e.px} y2={e.py} stroke="#5b6e89" />
            <text
              x={(e.x + e.px) / 2}
              y={(e.y + e.py) / 2}
              fill="#d4b1fa"
              fontSize="11"
            >
              {e.bit}
            </text>
          </g>
        ))}
        {nodes.map(({ n, x, y }) => (
          <g key={n.id}>
            <circle
              cx={x}
              cy={y}
              r="20"
              fill={n.symbol !== undefined ? "#1f514b" : "#2d294c"}
              stroke="#8ecbbb"
            />
            <text
              x={x}
              y={y + 4}
              fill="white"
              textAnchor="middle"
              fontSize="10"
            >
              {n.symbol !== undefined
                ? `${n.symbol}:${n.frequency}`
                : n.frequency}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
