import type { TreeView } from "../algorithms/trees";
export function TreeCanvas({
  tree,
  active = [],
  colors = false,
}: {
  tree: TreeView | null;
  active?: number[];
  colors?: boolean;
}) {
  const nodes: {
    node: TreeView;
    x: number;
    y: number;
    parent?: { x: number; y: number };
  }[] = [];
  const count = (n: TreeView | null): number =>
    n ? 1 + count(n.left) + count(n.right) : 0;
  const size = count(tree),
    width = Math.max(600, size * 55);
  let position = 0;
  const layout = (
    node: TreeView | null,
    depth: number,
  ): { x: number; y: number } | undefined => {
    if (!node) return;
    const left = layout(node.left, depth + 1);
    const x = 35 + position++ * 55,
      y = 40 + depth * 75;
    const right = layout(node.right, depth + 1);
    if (left) nodes.find((n) => n.x === left.x)!.parent = { x, y };
    if (right) nodes.find((n) => n.x === right.x)!.parent = { x, y };
    nodes.push({ node, x, y });
    return { x, y };
  };
  layout(tree, 0);
  const height = Math.max(200, ...nodes.map((n) => n.y + 55));
  return (
    <div className="canvas-scroll">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ minWidth: Math.min(width, 900) }}
        role="img"
        aria-label={`Tree with ${size} nodes`}
      >
        {nodes
          .filter((n) => n.parent)
          .map((n) => (
            <line
              key={`e${n.x}`}
              x1={n.x}
              y1={n.y}
              x2={n.parent!.x}
              y2={n.parent!.y}
              stroke="#42546d"
              strokeWidth="2"
            />
          ))}
        {nodes.map(({ node, x, y }) => (
          <g
            key={x}
            className={active.includes(node.value) ? "active-node" : ""}
          >
            <circle
              cx={x}
              cy={y}
              r="22"
              fill={
                colors
                  ? node.color === "red"
                    ? "#8f2b48"
                    : "#162335"
                  : "#173d3a"
              }
              stroke={
                active.includes(node.value)
                  ? "#ffe59e"
                  : colors
                    ? "#bb91dc"
                    : "#63e5ce"
              }
              strokeWidth="2"
            />
            <text x={x} y={y + 5} textAnchor="middle" fill="#fff" fontSize="13">
              {node.value}
            </text>
            {!colors && (
              <text
                x={x}
                y={y + 37}
                textAnchor="middle"
                fill="#8dacc7"
                fontSize="9"
              >
                bf {node.balance}
              </text>
            )}
          </g>
        ))}
        {!tree && (
          <text x={width / 2} y="100" textAnchor="middle" fill="#8fa2bc">
            Empty tree · insert a value to begin
          </text>
        )}
      </svg>
    </div>
  );
}
