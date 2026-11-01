import { useState } from "react";
import {
  TreeEngine,
  type TreeKind,
  type TreeStep,
  type TreeView,
} from "../algorithms/trees";
import { parseArray } from "../algorithms/sorting";
import { ExecutionPlayer } from "../components/ExecutionPlayer";
import { TreeCanvas } from "../visualizers/TreeCanvas";
import { LessonPanel } from "../components/LessonPanel";
const names = {
  bst: "Binary Search Tree",
  avl: "AVL Tree",
  redblack: "Red-Black Tree",
};
const height = (n: TreeView | null): number =>
  n ? 1 + Math.max(height(n.left), height(n.right)) : 0;
export function TreePage({
  speed,
  onSpeed,
}: {
  speed: number;
  onSpeed: (n: number) => void;
}) {
  const [kind, setKind] = useState<TreeKind>("avl");
  const [engine, setEngine] = useState(() => {
    const e = new TreeEngine("avl");
    [30, 20, 40, 10, 25, 50].forEach((n) => e.insert(n));
    return e;
  });
  const [steps, setSteps] = useState<TreeStep[]>([
    {
      tree: engine.snapshot(),
      active: [],
      event: "ready",
      description: "Choose an operation to explore this tree.",
      line: 0,
      output: [],
    },
  ]);
  const [run, setRun] = useState(0),
    [value, setValue] = useState("35"),
    [sequence, setSequence] = useState("30, 20, 40, 10, 25, 50"),
    [error, setError] = useState("");
  const show = (s: TreeStep[]) => {
    setSteps(s);
    setRun((r) => r + 1);
    setError("");
  };
  const rebuild = (type: TreeKind) => {
    try {
      const values = parseArray(sequence);
      if (values.some((n) => !Number.isInteger(n)) || new Set(values).size > 31)
        throw new Error("Use at most 31 unique integers.");
      const e = new TreeEngine(type);
      const history = values.flatMap((n) => e.insert(n));
      setEngine(e);
      setKind(type);
      show(
        history.length
          ? history
          : [
              {
                tree: null,
                active: [],
                description: "Empty tree.",
                event: "done",
                output: [],
                line: 6,
              },
            ],
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };
  const operate = (action: "insert" | "delete" | "search") => {
    try {
      if (!value.trim()) throw new Error("Enter a node value.");
      show(engine[action](Number(value)));
    } catch (err) {
      setError((err as Error).message);
    }
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">STRUCTURE / BALANCE / INVARIANTS</span>
          <h1>Tree Visualizer.</h1>
          <p>
            Inspect BST order, AVL rotations, and Red-Black recoloring and
            deletion fix-up.
          </p>
        </div>
      </div>
      <section className="panel lab-form">
        <label>
          Tree type
          <select
            value={kind}
            onChange={(e) => rebuild(e.target.value as TreeKind)}
          >
            {Object.entries(names).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="grow">
          Insertion sequence
          <input
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
          />
        </label>
        <button className="secondary-button" onClick={() => rebuild(kind)}>
          Build tree
        </button>
        <div className="form-break" />
        <label>
          Node value
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        {(["insert", "delete", "search"] as const).map((action) => (
          <button
            className="secondary-button"
            key={action}
            onClick={() => operate(action)}
          >
            {action[0].toUpperCase() + action.slice(1)}
          </button>
        ))}
        <div className="form-break" />
        {(["inorder", "preorder", "postorder", "levelorder"] as const).map(
          (order) => (
            <button
              className="text-button"
              key={order}
              onClick={() => show(engine.traverse(order))}
            >
              {order} traversal
            </button>
          ),
        )}
        <p className="input-help">
          Duplicates are ignored. Maximum 31 unique integers in [−999, 999].
          Height counts nodes (empty = 0). New operations use the committed
          result of the previous operation, even while reviewing its history.
          Intermediate balancing states may temporarily violate invariants.
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
              <div className="section-heading">
                <h2>{names[kind]}</h2>
                <span className="tag">
                  Height {height(s.tree)} · {s.event}
                </span>
              </div>
              <TreeCanvas
                tree={s.tree}
                active={s.active}
                colors={kind === "redblack"}
              />
              <p className="input-help">
                {kind === "redblack"
                  ? "Red and black fills show actual colors; absent children are black NIL leaves."
                  : "bf = height(left) − height(right). Yellow outlines mark active nodes."}
              </p>
              <p>Traversal output: {s.output.join(" → ") || "—"}</p>
            </section>
            <LessonPanel id={kind} line={s.line} />
          </>
        )}
      </ExecutionPlayer>
    </>
  );
}
