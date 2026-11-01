import { expect, it } from "vitest";
import {
  graphSteps,
  sampleGraph,
  DisjointSet,
  type Graph,
} from "../algorithms/graphs";
it("BFS discovers shortest unweighted paths and DFS visits each reachable vertex once", () => {
  const bfs = graphSteps(sampleGraph, "bfs", "A", "F").at(-1)!;
  expect(bfs.visited).toEqual(["A", "B", "C", "D", "E", "F"]);
  expect(bfs.path).toEqual(["A", "B", "D", "F"]);
  const dfs = graphSteps(sampleGraph, "dfs", "A", "F").at(-1)!;
  expect(dfs.visited).toEqual(["A", "B", "C", "E", "D", "F"]);
  expect(new Set(dfs.visited).size).toBe(6);
  expect(dfs.path[0]).toBe("A");
  expect(dfs.path.at(-1)).toBe("F");
});
it("Dijkstra reconstructs weighted shortest paths and rejects negative edges", () => {
  const s = graphSteps(sampleGraph, "dijkstra", "A", "F").at(-1)!;
  expect(s.distances.F).toBe(13);
  expect(s.path).toEqual(["A", "C", "E", "F"]);
  expect(() =>
    graphSteps(
      { ...sampleGraph, edges: [{ id: "x", from: "A", to: "B", weight: -1 }] },
      "dijkstra",
      "A",
      "B",
    ),
  ).toThrow(/nonnegative/);
});
it("Kruskal uses DSU and returns a minimum spanning forest on disconnected data", () => {
  expect(graphSteps(sampleGraph, "kruskal", "", "").at(-1)!.total).toBe(13);
  const g: Graph = {
    ...sampleGraph,
    nodes: [...sampleGraph.nodes, { id: "Z", x: 0, y: 0 }],
  };
  const s = graphSteps(g, "kruskal", "", "").at(-1)!;
  expect(s.total).toBe(13);
  expect(s.selected).toHaveLength(5);
  expect(s.description).toMatch(/2 component/);
  expect(() => graphSteps({ ...g, directed: true }, "kruskal", "", "")).toThrow(
    /undirected/,
  );
  const d = new DisjointSet(["a", "b"]);
  expect(d.union("a", "b")).toBe(true);
  expect(d.union("b", "a")).toBe(false);
});
it("handles directed reachability, zero weights, loops, parallel edges, and empty forests", () => {
  const g: Graph = {
    nodes: [
      { id: "A", x: 0, y: 0 },
      { id: "B", x: 0, y: 0 },
      { id: "C", x: 0, y: 0 },
    ],
    directed: true,
    edges: [
      { id: "a", from: "A", to: "B", weight: 0 },
      { id: "b", from: "A", to: "B", weight: 3 },
      { id: "c", from: "B", to: "B", weight: 0 },
    ],
  };
  expect(graphSteps(g, "dijkstra", "A", "B").at(-1)!.distances.B).toBe(0);
  expect(graphSteps(g, "bfs", "B", "A").at(-1)!.path).toEqual([]);
  expect(graphSteps(g, "dijkstra", "A", "C").at(-1)!.distances.C).toBe(
    Infinity,
  );
  expect(
    graphSteps({ nodes: [], edges: [], directed: false }, "kruskal", "", "").at(
      -1,
    )!.total,
  ).toBe(0);
});
