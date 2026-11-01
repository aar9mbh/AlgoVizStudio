import { useState } from "react";
import { knapsackSteps, lcsSteps } from "../algorithms/dynamicProgramming";
import { parseRows } from "../algorithms/greedy";
import { ExecutionPlayer } from "../components/ExecutionPlayer";
import { LessonPanel } from "../components/LessonPanel";
type Kind = "knapsack" | "lcs";
export function DPPage({
  speed,
  onSpeed,
}: {
  speed: number;
  onSpeed: (n: number) => void;
}) {
  const [kind, setKind] = useState<Kind>("knapsack"),
    [items, setItems] = useState("2, 3\n3, 4\n4, 5\n5, 8"),
    [capacity, setCapacity] = useState("8"),
    [a, setA] = useState("ABCBDAB"),
    [b, setB] = useState("BDCABA"),
    [error, setError] = useState("");
  const [execution, setExecution] = useState(() => ({
    kind: "knapsack" as Kind,
    a: "",
    b: "",
    steps: knapsackSteps(
      parseRows(items).map(([weight, value], id) => ({
        weight,
        value,
        id: id + 1,
      })),
      8,
    ),
    run: 0,
  }));
  function generate() {
    try {
      if (kind === "knapsack" && !capacity.trim())
        throw new Error("Enter integer capacity.");
      const steps =
        kind === "knapsack"
          ? knapsackSteps(
              parseRows(items).map(([weight, value], id) => ({
                weight,
                value,
                id: id + 1,
              })),
              Number(capacity),
            )
          : lcsSteps(a, b);
      setExecution((e) => ({ kind, a, b, steps, run: e.run + 1 }));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            REUSE SUBPROBLEMS / RECONSTRUCT SOLUTIONS
          </span>
          <h1>Dynamic Programming Visualizer.</h1>
          <p>
            Fill real DP states, then walk backward to recover an optimal
            solution.
          </p>
        </div>
      </div>
      <section className="panel lab-form">
        <label>
          Algorithm
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
          >
            <option value="knapsack">0/1 Knapsack</option>
            <option value="lcs">Longest Common Subsequence</option>
          </select>
        </label>
        {kind === "knapsack" ? (
          <>
            <label className="grow">
              Items: weight, value per line
              <textarea
                rows={4}
                value={items}
                onChange={(e) => setItems(e.target.value)}
              />
            </label>
            <label>
              Integer capacity
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </label>
          </>
        ) : (
          <>
            <label>
              First string
              <input value={a} onChange={(e) => setA(e.target.value)} />
            </label>
            <label>
              Second string
              <input value={b} onChange={(e) => setB(e.target.value)} />
            </label>
          </>
        )}
        <button className="primary-button" onClick={generate}>
          Generate execution
        </button>
        <p className="input-help">
          Knapsack: ≤12 items, positive integer weights and capacity 0–40. LCS:
          ≤24 Unicode code points per string. The table uses bounded immutable
          snapshots. Greedy commits to a local choice; DP compares alternatives
          and stores subproblem optima.
        </p>
        {error && (
          <p className="input-error" role="alert">
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
              <h2>
                {execution.kind === "knapsack"
                  ? "Best value by item prefix and capacity"
                  : "LCS length by string prefixes"}
              </h2>
              <p className="input-help">
                Columns:{" "}
                {execution.kind === "knapsack"
                  ? "capacity"
                  : "second-string prefix"}{" "}
                · Rows:{" "}
                {execution.kind === "knapsack"
                  ? "item prefix"
                  : "first-string prefix"}{" "}
                · Teal: current cell · Violet: reconstruction path
              </p>
              <div className="table-scroll">
                <table className="dp-table">
                  <thead>
                    <tr>
                      <th>i / j</th>
                      {s.table[0].map((_, j) => (
                        <th key={j}>
                          {execution.kind === "lcs" && j > 0
                            ? `${j}: ${Array.from(execution.b)[j - 1]}`
                            : j}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.map((row, i) => (
                      <tr key={i}>
                        <th>
                          {execution.kind === "lcs" && i > 0
                            ? `${i}: ${Array.from(execution.a)[i - 1]}`
                            : i}
                        </th>
                        {row.map((value, j) => (
                          <td
                            key={j}
                            className={
                              s.row === i && s.col === j
                                ? "current-cell"
                                : s.path.some(([r, c]) => r === i && c === j)
                                  ? "path-cell"
                                  : ""
                            }
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="result-text">
                {execution.kind === "knapsack"
                  ? s.result
                  : `Reconstructed LCS: “${s.result}”`}
              </p>
              {execution.kind === "knapsack" && (
                <p>Selected item IDs: {s.selected.join(", ") || "none yet"}</p>
              )}
            </section>
            <LessonPanel id={execution.kind} line={s.line} />
          </>
        )}
      </ExecutionPlayer>
    </>
  );
}
