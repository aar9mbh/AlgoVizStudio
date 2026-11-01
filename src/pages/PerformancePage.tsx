import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { sortIds } from "../algorithms/sorting";
import { sortingLessons } from "../data/sorting";
import {
  benchmarkCSV,
  type BenchmarkConfig,
  type BenchmarkRow,
  type Distribution,
} from "../utils/benchmark";
const colors = [
  "#63e5ce",
  "#b99aff",
  "#e4a3bb",
  "#8cc4fa",
  "#f3cb7a",
  "#9fc794",
];
export function PerformancePage() {
  const [sizes, setSizes] = useState("50, 100, 250, 500"),
    [trials, setTrials] = useState("5"),
    [distribution, setDistribution] = useState<Distribution>("random"),
    [seed, setSeed] = useState("2026");
  const [rows, setRows] = useState<BenchmarkRow[]>([]),
    [config, setConfig] = useState<BenchmarkConfig | null>(null),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState("");
  const worker = useRef<Worker | null>(null);
  useEffect(() => () => worker.current?.terminate(), []);
  function start() {
    const c: BenchmarkConfig = {
      sizes: [
        ...new Set(
          sizes
            .split(/[\s,]+/)
            .filter(Boolean)
            .map(Number),
        ),
      ].sort((a, b) => a - b),
      trials: Number(trials),
      distribution,
      seed: Number(seed),
    };
    if (
      !c.sizes.length ||
      c.sizes.length > 6 ||
      c.sizes.some((n) => !Number.isInteger(n) || n < 2 || n > 2000) ||
      !trials.trim() ||
      !Number.isInteger(c.trials) ||
      c.trials < 1 ||
      c.trials > 9 ||
      !seed.trim() ||
      !Number.isInteger(c.seed)
    ) {
      setError(
        "Enter 1–6 sizes between 2 and 2000, 1–9 trials, and an integer seed.",
      );
      return;
    }
    worker.current?.terminate();
    setError("");
    setRows([]);
    setConfig(c);
    setBusy(true);
    setProgress(0);
    try {
      const w = new Worker(
        new URL("../workers/benchmark.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.current = w;
      w.onmessage = (e) => {
        if (worker.current !== w) return;
        if (e.data.type === "progress") setProgress(e.data.done / e.data.total);
        else if (e.data.type === "result") {
          setRows(e.data.rows);
          setBusy(false);
          w.terminate();
        } else {
          setError(e.data.message);
          setBusy(false);
          w.terminate();
        }
      };
      w.onerror = () => {
        if (worker.current !== w) return;
        setError("The benchmark worker failed. Try a smaller input or reload.");
        setBusy(false);
        w.terminate();
      };
      w.postMessage(c);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }
  function exportCSV() {
    if (!config) return;
    const url = URL.createObjectURL(
      new Blob([benchmarkCSV(rows, config)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "algoviz-benchmark.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const chart = [...new Set(rows.map((r) => r.size))].map((size) =>
    Object.fromEntries([
      ["size", size],
      ...rows
        .filter((r) => r.size === size)
        .map((r) => [r.algorithm, r.medianMs]),
    ]),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MEASURE / COMPARE / QUESTION</span>
          <h1>Performance Analysis Lab.</h1>
          <p>Real computation, repeated trials, and transparent assumptions.</p>
        </div>
      </div>
      <section className="panel lab-form">
        <label className="grow">
          Input sizes
          <input
            value={sizes}
            disabled={busy}
            onChange={(e) => setSizes(e.target.value)}
          />
        </label>
        <label>
          Trials
          <input
            type="number"
            min="1"
            max="9"
            disabled={busy}
            value={trials}
            onChange={(e) => setTrials(e.target.value)}
          />
        </label>
        <label>
          Distribution
          <select
            disabled={busy}
            value={distribution}
            onChange={(e) => setDistribution(e.target.value as Distribution)}
          >
            {["random", "sorted", "reverse", "nearly"].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Seed
          <input
            type="number"
            disabled={busy}
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
          />
        </label>
        <button className="primary-button" disabled={busy} onClick={start}>
          Run benchmarks
        </button>
        {busy && (
          <button
            className="secondary-button"
            onClick={() => {
              worker.current?.terminate();
              worker.current = null;
              setBusy(false);
              setError(
                "Benchmark cancelled. No partial results are displayed.",
              );
            }}
          >
            Cancel
          </button>
        )}
        <button
          className="secondary-button"
          disabled={!rows.length || busy}
          onClick={exportCSV}
        >
          Export CSV
        </button>
        {error && (
          <p role="alert" className="input-error">
            {error}
          </p>
        )}
      </section>
      {busy && (
        <section className="panel lab-canvas" role="status">
          <h2>
            Measuring in a background worker… {Math.round(progress * 100)}%
          </h2>
          <progress value={progress} max={1} />
          <p className="input-help">
            The main interface remains responsive. Warm-up runs are excluded.
          </p>
        </section>
      )}
      {!rows.length && !busy && (
        <section className="panel empty-state">
          <h2>No measurements yet</h2>
          <p>Run a benchmark to populate the chart and exportable results.</p>
        </section>
      )}
      {!!rows.length && (
        <section className="panel lab-canvas">
          <h2>Median runtime (milliseconds)</h2>
          <p className="input-help">
            {config?.trials} trial(s) · {config?.distribution} · seed{" "}
            {config?.seed} · two warm-up runs per algorithm. These results
            describe this browser session.
          </p>
          <div className="benchmark-chart">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chart}>
                <CartesianGrid stroke="#263248" strokeDasharray="4 4" />
                <XAxis
                  dataKey="size"
                  stroke="#98a8bd"
                  label={{
                    value: "Input size (n)",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis stroke="#98a8bd" />
                <Tooltip
                  contentStyle={{
                    background: "#152034",
                    borderColor: "#33435d",
                  }}
                />
                <Legend />
                {sortIds.map((id, i) => (
                  <Line
                    key={id}
                    dataKey={id}
                    name={sortingLessons[id].name}
                    stroke={colors[i]}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>n</th>
                  <th>Median ms</th>
                  <th>Comparisons</th>
                  <th>Swaps</th>
                  <th>Writes</th>
                  <th>Worst time</th>
                  <th>Aux. space¹</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.algorithm}${r.size}`}>
                    <td>{sortingLessons[r.algorithm].name}</td>
                    <td>{r.size}</td>
                    <td>{r.medianMs.toFixed(6)}</td>
                    <td>{r.comparisons}</td>
                    <td>{r.swaps}</td>
                    <td>{r.writes}</td>
                    <td>{sortingLessons[r.algorithm].worst}</td>
                    <td>{sortingLessons[r.algorithm].space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <section className="panel lesson-panel">
        <h2>What these measurements mean</h2>
        <p>
          Each trial generates one seeded input for its size/distribution; every
          algorithm receives an identical copy. Input generation and cloning
          occur outside the timer. The measured interval uses performance.now()
          around an instrumented numeric sorting implementation with operation
          counters. It excludes all animation and event snapshots. Counts are
          medians across the same trials, and are separate from runtime and
          theoretical complexity.
        </p>
        <p>
          Two 64-element warm-up runs per algorithm precede sampling, and
          algorithm order rotates between trials. Runtime depends on browser
          timer resolution, JIT compilation, CPU load, and device. Small timings
          can be noisy or zero; more trials help but do not remove environmental
          effects. Nearly sorted data starts sorted and receives approximately
          2% random pair exchanges.
        </p>
        <p>
          ¹ Space is a theoretical algorithm bound, not measured JavaScript heap
          use. JavaScript memory measurements are not portable. The benchmark
          Quick Sort uses an explicit partition stack to avoid recursion
          overflow; the displayed O(n) worst-case stack bound is conservative.
          No unrelated algorithms are compared.
        </p>
      </section>
    </>
  );
}
