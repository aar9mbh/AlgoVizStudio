import { useState } from "react";
import {
  graphSteps,
  sampleGraph,
  validGraph,
  type Graph,
  type GraphAlgorithm,
  type GraphStep,
} from "../algorithms/graphs";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { ExecutionPlayer } from "../components/ExecutionPlayer";
import { LessonPanel } from "../components/LessonPanel";
const blank: GraphStep = {
  description: "Edit the graph, then generate an execution.",
  line: 0,
  visited: [],
  frontier: [],
  activeEdges: [],
  selected: [],
  rejected: [],
  distances: {},
  path: [],
  total: 0,
};
export function GraphPage({
  speed,
  onSpeed,
}: {
  speed: number;
  onSpeed: (n: number) => void;
}) {
  const [graph, setGraph] = useLocalStorage(
    "algoviz.graph",
    sampleGraph,
    validGraph,
  );
  const [algorithm, setAlgorithm] = useState<GraphAlgorithm>("bfs"),
    [start, setStart] = useState("A"),
    [destination, setDestination] = useState("F");
  const [nodeId, setNodeId] = useState("G"),
    [from, setFrom] = useState("A"),
    [to, setTo] = useState("B"),
    [weight, setWeight] = useState("1");
  const [steps, setSteps] = useState([blank]),
    [run, setRun] = useState(0),
    [error, setError] = useState(""),
    [drag, setDrag] = useState<string | null>(null);
  function edit(next: Graph) {
    setGraph(next);
    setSteps([blank]);
    setRun((r) => r + 1);
    setError("");
  }
  function execute() {
    try {
      setSteps(graphSteps(graph, algorithm, start, destination));
      setRun((r) => r + 1);
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }
  const nodeSelect = (
    label: string,
    value: string,
    change: (n: string) => void,
  ) => (
    <label>
      {label}
      <select
        value={value}
        onChange={(e) => {
          change(e.target.value);
          if (label === "Start" || label === "Destination") {
            setSteps([blank]);
            setRun((r) => r + 1);
          }
        }}
      >
        <option value="" disabled>
          Select node
        </option>
        {graph.nodes.map((n) => (
          <option key={n.id}>{n.id}</option>
        ))}
      </select>
    </label>
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            CONNECTIONS / PATHS / SPANNING FORESTS
          </span>
          <h1>Graph Algorithm Visualizer.</h1>
          <p>Drag nodes, edit weighted edges, and follow each discovery.</p>
        </div>
      </div>
      <section className="panel lab-form">
        <label>
          Algorithm
          <select
            value={algorithm}
            onChange={(e) => {
              setAlgorithm(e.target.value as GraphAlgorithm);
              setSteps([blank]);
              setRun((r) => r + 1);
            }}
          >
            {[
              ["bfs", "Breadth-First Search"],
              ["dfs", "Depth-First Search"],
              ["dijkstra", "Dijkstra"],
              ["kruskal", "Kruskal"],
            ].map(([id, name]) => (
              <option value={id} key={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {nodeSelect("Start", start, setStart)}
        {nodeSelect("Destination", destination, setDestination)}
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={graph.directed}
            onChange={(e) => edit({ ...graph, directed: e.target.checked })}
          />
          Directed graph
        </label>
        <button className="primary-button" onClick={execute}>
          Generate execution
        </button>
        <button
          className="secondary-button"
          onClick={() => edit(structuredClone(sampleGraph))}
        >
          Sample graph
        </button>
        <button
          className="secondary-button"
          onClick={() => edit({ nodes: [], edges: [], directed: false })}
        >
          Clear graph
        </button>
        <div className="form-break" />
        <label>
          Node ID
          <input
            maxLength={4}
            value={nodeId}
            onChange={(e) => setNodeId(e.target.value)}
          />
        </label>
        <button
          className="secondary-button"
          onClick={() => {
            if (
              !/^[A-Za-z0-9]{1,4}$/.test(nodeId) ||
              graph.nodes.some((n) => n.id === nodeId) ||
              graph.nodes.length >= 16
            ) {
              setError(
                "Use a unique 1–4 character alphanumeric ID; maximum 16 nodes.",
              );
              return;
            }
            edit({
              ...graph,
              nodes: [
                ...graph.nodes,
                {
                  id: nodeId,
                  x: 70 + (graph.nodes.length % 5) * 110,
                  y: 60 + Math.floor(graph.nodes.length / 5) * 100,
                },
              ],
            });
          }}
        >
          Add node
        </button>
        <button
          className="secondary-button"
          onClick={() =>
            edit({
              ...graph,
              nodes: graph.nodes.filter((n) => n.id !== nodeId),
              edges: graph.edges.filter(
                (e) => e.from !== nodeId && e.to !== nodeId,
              ),
            })
          }
        >
          Remove node by ID
        </button>
        <div className="form-break" />
        {nodeSelect("Edge from", from, setFrom)}
        {nodeSelect("Edge to", to, setTo)}
        <label>
          Weight
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </label>
        <button
          className="secondary-button"
          onClick={() => {
            if (
              !graph.nodes.some((n) => n.id === from) ||
              !graph.nodes.some((n) => n.id === to) ||
              !weight.trim() ||
              !Number.isFinite(Number(weight)) ||
              Math.abs(Number(weight)) > 999 ||
              graph.edges.length >= 80
            ) {
              setError(
                "Choose existing endpoints and a finite weight in [−999,999]; maximum 80 edges.",
              );
              return;
            }
            edit({
              ...graph,
              edges: [
                ...graph.edges,
                { id: crypto.randomUUID(), from, to, weight: Number(weight) },
              ],
            });
          }}
        >
          Add edge
        </button>
        <p className="input-help">
          Remove edges using the list below. Parallel edges and self-loops are
          allowed. BFS/DFS explore only the reachable component and ignore
          weights. BFS finds fewest-edge paths; DFS shows a discovery path.
          Edits invalidate the old execution; dragging only changes layout.
        </p>
        {error && (
          <p role="alert" className="input-error">
            {error}
          </p>
        )}
      </section>
      <ExecutionPlayer key={run} steps={steps} speed={speed} onSpeed={onSpeed}>
        {(s) => (
          <>
            <section className="panel lab-canvas">
              <svg
                className="graph-canvas"
                viewBox="0 0 650 350"
                role="img"
                aria-label="Editable graph"
                onPointerMove={(e) => {
                  if (!drag) return;
                  const point = e.currentTarget.createSVGPoint();
                  point.x = e.clientX;
                  point.y = e.clientY;
                  const matrix = e.currentTarget.getScreenCTM();
                  if (!matrix) return;
                  const p = point.matrixTransform(matrix.inverse());
                  setGraph((g) => ({
                    ...g,
                    nodes: g.nodes.map((n) =>
                      n.id === drag
                        ? {
                            ...n,
                            x: Math.max(25, Math.min(625, p.x)),
                            y: Math.max(25, Math.min(325, p.y)),
                          }
                        : n,
                    ),
                  }));
                }}
                onPointerUp={() => setDrag(null)}
                onPointerCancel={() => setDrag(null)}
              >
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M0 0L10 5L0 10z" fill="#a5b9cf" />
                  </marker>
                </defs>
                {graph.edges.map((edge) => {
                  const a = graph.nodes.find((n) => n.id === edge.from)!,
                    b = graph.nodes.find((n) => n.id === edge.to)!;
                  const color = s.activeEdges.includes(edge.id)
                    ? "#f5cc80"
                    : s.selected.includes(edge.id)
                      ? "#63e5ce"
                      : s.rejected.includes(edge.id)
                        ? "#b15c79"
                        : "#50627c";
                  return (
                    <g key={edge.id}>
                      {a.id === b.id ? (
                        <path
                          d={`M${a.x - 10} ${a.y - 18}c-45-50 65-50 20 0`}
                          stroke={color}
                          fill="none"
                          strokeWidth="2"
                        />
                      ) : (
                        <line
                          x1={a.x}
                          y1={a.y}
                          x2={b.x}
                          y2={b.y}
                          stroke={color}
                          strokeWidth="2"
                          markerEnd={graph.directed ? "url(#arrow)" : undefined}
                        />
                      )}
                      <text
                        x={(a.x + b.x) / 2}
                        y={(a.y + b.y) / 2 - 9}
                        fill={color}
                        stroke="#101521"
                        strokeWidth="4"
                        paintOrder="stroke"
                        fontSize="13"
                      >
                        {edge.weight}
                      </text>
                    </g>
                  );
                })}
                {graph.nodes.map((n) => (
                  <g
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Node ${n.id}; arrow keys move it`}
                    onKeyDown={(e) => {
                      const delta: Record<string, [number, number]> = {
                        ArrowLeft: [-10, 0],
                        ArrowRight: [10, 0],
                        ArrowUp: [0, -10],
                        ArrowDown: [0, 10],
                      };
                      if (delta[e.key]) {
                        e.preventDefault();
                        const [dx, dy] = delta[e.key];
                        setGraph((g) => ({
                          ...g,
                          nodes: g.nodes.map((x) =>
                            x.id === n.id
                              ? {
                                  ...x,
                                  x: Math.max(25, Math.min(625, x.x + dx)),
                                  y: Math.max(25, Math.min(325, x.y + dy)),
                                }
                              : x,
                          ),
                        }));
                      }
                    }}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setDrag(n.id);
                    }}
                  >
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="22"
                      fill={
                        s.path.includes(n.id)
                          ? "#1b6b5d"
                          : s.visited.includes(n.id)
                            ? "#4d3b72"
                            : "#152c3a"
                      }
                      stroke={s.frontier.includes(n.id) ? "#f5cc80" : "#79d8ca"}
                      strokeWidth="2"
                    />
                    <text
                      x={n.x}
                      y={n.y + 5}
                      fill="white"
                      textAnchor="middle"
                      fontSize="14"
                    >
                      {n.id}
                    </text>
                  </g>
                ))}
                {!graph.nodes.length && (
                  <text x="325" y="175" textAnchor="middle" fill="#92a6c0">
                    Add nodes to build your graph
                  </text>
                )}
              </svg>
              <div className="result-strip">
                <span>Visited: {s.visited.join(", ") || "—"}</span>
                <span>
                  {algorithm === "bfs"
                    ? "Queue"
                    : algorithm === "dfs"
                      ? "Stack"
                      : "Candidates"}
                  : {s.frontier.join(", ") || "—"}
                </span>
                <span>Forest weight: {s.total}</span>
              </div>
              <p className="input-help">
                Distances / discovery depths:{" "}
                {graph.nodes
                  .map(
                    (n) =>
                      `${n.id}: ${s.distances[n.id] === Infinity ? "∞" : (s.distances[n.id] ?? "—")}`,
                  )
                  .join(" · ")}
              </p>
              <div className="edge-list">
                {graph.edges.map((e) => (
                  <button
                    key={e.id}
                    className="tag"
                    title="Remove edge"
                    onClick={() =>
                      edit({
                        ...graph,
                        edges: graph.edges.filter((x) => x.id !== e.id),
                      })
                    }
                  >
                    {e.from} {graph.directed ? "→" : "–"} {e.to} ({e.weight}) ×{" "}
                    {s.selected.includes(e.id)
                      ? "selected"
                      : s.rejected.includes(e.id)
                        ? "rejected"
                        : ""}
                  </button>
                ))}
              </div>
            </section>
            <LessonPanel id={algorithm} line={s.line} />
          </>
        )}
      </ExecutionPlayer>
    </>
  );
}
