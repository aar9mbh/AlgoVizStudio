export type GraphNode = { id: string; x: number; y: number };
export type Edge = { id: string; from: string; to: string; weight: number };
export type Graph = { nodes: GraphNode[]; edges: Edge[]; directed: boolean };
export type GraphAlgorithm = "bfs" | "dfs" | "dijkstra" | "kruskal";
export type GraphStep = {
  description: string;
  line: number;
  visited: string[];
  frontier: string[];
  activeEdges: string[];
  selected: string[];
  rejected: string[];
  distances: Record<string, number>;
  path: string[];
  total: number;
};
export class DisjointSet {
  private parents = new Map<string, string>();
  private ranks = new Map<string, number>();
  constructor(ids: string[]) {
    ids.forEach((id) => {
      this.parents.set(id, id);
      this.ranks.set(id, 0);
    });
  }
  find(id: string): string {
    const p = this.parents.get(id);
    if (p === undefined) throw new Error("Unknown DSU element");
    if (p !== id) this.parents.set(id, this.find(p));
    return this.parents.get(id)!;
  }
  union(a: string, b: string) {
    let x = this.find(a),
      y = this.find(b);
    if (x === y) return false;
    if (this.ranks.get(x)! < this.ranks.get(y)!) [x, y] = [y, x];
    this.parents.set(y, x);
    if (this.ranks.get(x) === this.ranks.get(y))
      this.ranks.set(x, this.ranks.get(x)! + 1);
    return true;
  }
}
export function validGraph(value: unknown): value is Graph {
  if (!value || typeof value !== "object") return false;
  const g = value as Graph;
  return (
    Array.isArray(g.nodes) &&
    g.nodes.length <= 16 &&
    g.nodes.every(
      (n) =>
        typeof n.id === "string" &&
        /^[A-Za-z0-9]{1,4}$/.test(n.id) &&
        Number.isFinite(n.x) &&
        Number.isFinite(n.y),
    ) &&
    new Set(g.nodes.map((n) => n.id)).size === g.nodes.length &&
    Array.isArray(g.edges) &&
    g.edges.length <= 80 &&
    g.edges.every(
      (e) =>
        typeof e.id === "string" &&
        g.nodes.some((n) => n.id === e.from) &&
        g.nodes.some((n) => n.id === e.to) &&
        Number.isFinite(e.weight) &&
        Math.abs(e.weight) <= 999,
    ) &&
    new Set(g.edges.map((e) => e.id)).size === g.edges.length &&
    typeof g.directed === "boolean"
  );
}
export const sampleGraph: Graph = {
  directed: false,
  nodes: [
    { id: "A", x: 90, y: 170 },
    { id: "B", x: 240, y: 70 },
    { id: "C", x: 240, y: 270 },
    { id: "D", x: 420, y: 70 },
    { id: "E", x: 420, y: 270 },
    { id: "F", x: 560, y: 170 },
  ],
  edges: [
    ["A", "B", 4],
    ["A", "C", 2],
    ["B", "C", 1],
    ["B", "D", 5],
    ["C", "E", 8],
    ["D", "E", 2],
    ["D", "F", 6],
    ["E", "F", 3],
  ].map(([from, to, weight], i) => ({
    id: `e${i}`,
    from: String(from),
    to: String(to),
    weight: Number(weight),
  })),
};
export function graphSteps(
  g: Graph,
  algorithm: GraphAlgorithm,
  start: string,
  destination: string,
): GraphStep[] {
  if (!validGraph(g))
    throw new Error("Invalid graph (maximum 16 nodes and 80 edges).");
  if (algorithm === "kruskal" && g.directed)
    throw new Error(
      "Kruskal requires an undirected graph. Switch off directed mode.",
    );
  if (algorithm === "dijkstra" && g.edges.some((e) => e.weight < 0))
    throw new Error(
      "Dijkstra requires nonnegative weights. A negative edge invalidates its greedy finalization rule.",
    );
  if (algorithm !== "kruskal" && !g.nodes.some((n) => n.id === start))
    throw new Error("Choose an existing start node.");
  if (algorithm !== "kruskal" && !g.nodes.some((n) => n.id === destination))
    throw new Error("Choose an existing destination node.");
  const steps: GraphStep[] = [],
    visited: string[] = [],
    frontier: string[] = [],
    selected: string[] = [],
    rejected: string[] = [],
    path: string[] = [];
  const distances: Record<string, number> = {},
    parent = new Map<string, { node: string; edge: string }>();
  let total = 0;
  g.nodes.forEach((n) => (distances[n.id] = Infinity));
  const emit = (description: string, line = 0, activeEdges: string[] = []) =>
    steps.push({
      description,
      line,
      visited: [...visited],
      frontier: [...frontier],
      activeEdges: [...activeEdges],
      selected: [...selected],
      rejected: [...rejected],
      distances: { ...distances },
      path: [...path],
      total,
    });
  const neighbors = (id: string) =>
    g.edges.flatMap((e) =>
      e.from === id
        ? [{ node: e.to, edge: e }]
        : !g.directed && e.to === id
          ? [{ node: e.from, edge: e }]
          : [],
    );
  emit("Ready to execute on the current graph.");
  if (algorithm === "kruskal") {
    const dsu = new DisjointSet(g.nodes.map((n) => n.id));
    for (const edge of [...g.edges].sort(
      (a, b) => a.weight - b.weight || a.id.localeCompare(b.id),
    )) {
      emit(`Consider ${edge.from}–${edge.to} with weight ${edge.weight}.`, 1, [
        edge.id,
      ]);
      if (dsu.union(edge.from, edge.to)) {
        selected.push(edge.id);
        total += edge.weight;
        emit(
          `Select edge: it joins different components. Forest weight = ${total}.`,
          2,
          [edge.id],
        );
      } else {
        rejected.push(edge.id);
        emit("Reject this edge: it would create a cycle.", 3, [edge.id]);
      }
    }
    const components = new Set(g.nodes.map((n) => dsu.find(n.id))).size;
    emit(
      `Minimum spanning ${components === 1 ? "tree" : "forest"} complete: ${components} component(s), total weight ${total}.`,
      6,
    );
    return steps;
  }
  distances[start] = 0;
  if (algorithm === "dijkstra") {
    while (true) {
      const candidates = g.nodes
        .filter((n) => !visited.includes(n.id) && distances[n.id] < Infinity)
        .sort((a, b) => distances[a.id] - distances[b.id]);
      frontier.splice(0, frontier.length, ...candidates.map((n) => n.id));
      if (!candidates.length) break;
      const current = candidates[0].id;
      visited.push(current);
      emit(`Finalize ${current} at distance ${distances[current]}.`, 1);
      for (const { node, edge } of neighbors(current)) {
        emit(`Explore edge ${current} → ${node}.`, 2, [edge.id]);
        if (
          !visited.includes(node) &&
          distances[current] + edge.weight < distances[node]
        ) {
          distances[node] = distances[current] + edge.weight;
          parent.set(node, { node: current, edge: edge.id });
          emit(`Relax ${node}: distance becomes ${distances[node]}.`, 3, [
            edge.id,
          ]);
        }
      }
    }
  } else if (algorithm === "dfs") {
    const discovered = new Set([start]);
    const frames = [{ node: start, adjacent: neighbors(start), next: 0 }];
    visited.push(start);
    frontier.push(start);
    emit(`Enter ${start}; push its DFS frame.`, 1);
    while (frames.length) {
      const frame = frames[frames.length - 1];
      if (frame.next >= frame.adjacent.length) {
        frames.pop();
        frontier.pop();
        emit(`Backtrack from ${frame.node}; its neighbors are exhausted.`, 4);
        continue;
      }
      const { node, edge } = frame.adjacent[frame.next++];
      emit(`Explore edge ${frame.node} → ${node}.`, 2, [edge.id]);
      if (!discovered.has(node)) {
        discovered.add(node);
        parent.set(node, { node: frame.node, edge: edge.id });
        distances[node] = distances[frame.node] + 1;
        visited.push(node);
        frontier.push(node);
        frames.push({ node, adjacent: neighbors(node), next: 0 });
        emit(
          `Discover ${node}; descend before exploring remaining siblings.`,
          3,
          [edge.id],
        );
      }
    }
  } else {
    const discovered = new Set([start]);
    frontier.push(start);
    while (frontier.length) {
      const current = frontier.shift()!;
      visited.push(current);
      emit(`Visit ${current}; queue is [${frontier.join(", ")}].`, 1);
      const adjacent = neighbors(current);
      for (const { node, edge } of adjacent) {
        emit(`Explore edge ${current} → ${node}.`, 2, [edge.id]);
        if (!discovered.has(node)) {
          discovered.add(node);
          distances[node] = distances[current] + 1;
          parent.set(node, { node: current, edge: edge.id });
          frontier.push(node);
          emit(
            `Discover ${node}; add it to the ${algorithm === "bfs" ? "queue" : "stack"}.`,
            3,
            [edge.id],
          );
        }
      }
    }
  }
  if (
    g.nodes.some((n) => n.id === destination) &&
    distances[destination] < Infinity
  ) {
    let current = destination;
    path.unshift(current);
    while (current !== start) {
      const p = parent.get(current);
      if (!p) break;
      selected.unshift(p.edge);
      current = p.node;
      path.unshift(current);
    }
  }
  emit(
    `${algorithm === "dfs" ? "DFS discovery path" : "Shortest path"} to ${destination}: ${path.length ? path.join(" → ") : "unreachable"}. ${algorithm === "dijkstra" ? "Weighted distance" : "Discovery depth / edge count"} = ${distances[destination] ?? "—"}.`,
    6,
  );
  return steps;
}
