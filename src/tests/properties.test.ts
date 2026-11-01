import { expect, it } from "vitest";
import { graphSteps, type Graph } from "../algorithms/graphs";
import { activitySteps, fractionalSteps } from "../algorithms/greedy";
import { lcsSteps } from "../algorithms/dynamicProgramming";
it("Dijkstra distances agree with Floyd–Warshall on seeded directed graphs", () => {
  let seed = 45;
  for (let trial = 0; trial < 25; trial++) {
    const nodes = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        x: 0,
        y: 0,
      })),
      edges: Graph["edges"] = [];
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 5; j++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        if (i !== j && seed % 3 !== 0)
          edges.push({
            id: `${i}${j}`,
            from: String(i),
            to: String(j),
            weight: seed % 10,
          });
      }
    const d = Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 5 }, (_, j) => (i === j ? 0 : Infinity)),
    );
    edges.forEach((e) => (d[Number(e.from)][Number(e.to)] = e.weight));
    for (let k = 0; k < 5; k++)
      for (let i = 0; i < 5; i++)
        for (let j = 0; j < 5; j++)
          d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
    const result = graphSteps(
      { nodes, edges, directed: true },
      "dijkstra",
      "0",
      "4",
    ).at(-1)!;
    for (let j = 0; j < 5; j++)
      expect(result.distances[String(j)]).toBe(d[0][j]);
  }
});
it("activity selection cardinality agrees with exhaustive subset search", () => {
  for (let trial = 0; trial < 24; trial++) {
    const activities = Array.from({ length: 7 }, (_, id) => ({
      id,
      start: (id * 7 + trial * 3) % 12,
      finish: ((id * 7 + trial * 3) % 12) + 1 + ((id + trial) % 5),
    }));
    let best = 0;
    for (let mask = 0; mask < 128; mask++) {
      const selected = activities
        .filter((_, i) => mask & (1 << i))
        .sort((a, b) => a.start - b.start);
      if (
        selected.every((a, i) => i === 0 || a.start >= selected[i - 1].finish)
      )
        best = Math.max(best, selected.length);
    }
    expect(activitySteps(activities).at(-1)!.selected.length).toBe(best);
  }
});
it("fractional selection obeys capacity and reconstructs its stated value", () => {
  const items = [
    { id: 0, weight: 3, value: 8 },
    { id: 1, weight: 7, value: 12 },
    { id: 2, weight: 5, value: 6 },
  ];
  for (let capacity = 0; capacity <= 20; capacity++) {
    const s = fractionalSteps(items, capacity).at(-1)!;
    const weight = items.reduce(
        (sum, i) => sum + i.weight * (s.fractions[i.id] ?? 0),
        0,
      ),
      value = items.reduce(
        (sum, i) => sum + i.value * (s.fractions[i.id] ?? 0),
        0,
      );
    expect(weight).toBeLessThanOrEqual(capacity + 1e-9);
    expect(value).toBeCloseTo(s.total);
  }
});
it("LCS lengths agree with exhaustive subsequences for short binary words", () => {
  const words = ["", "A", "B", "AA", "AB", "BA", "BB", "ABA", "BAB", "AABB"];
  const isSub = (sub: string, text: string) => {
    let i = 0;
    for (const c of text) if (c === sub[i]) i++;
    return i === sub.length;
  };
  for (const a of words)
    for (const b of words) {
      let best = 0;
      for (let mask = 0; mask < 1 << a.length; mask++) {
        const sub = Array.from(a)
          .filter((_, i) => mask & (1 << i))
          .join("");
        if (isSub(sub, b)) best = Math.max(best, sub.length);
      }
      const result = lcsSteps(a, b).at(-1)!.result;
      expect(result.length).toBe(best);
      expect(isSub(result, a) && isSub(result, b)).toBe(true);
    }
});
