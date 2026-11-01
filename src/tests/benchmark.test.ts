import { expect, it } from "vitest";
import {
  measuredSort,
  median,
  runBenchmark,
  benchmarkInput,
  benchmarkCSV,
} from "../utils/benchmark";
import { generateSortSteps, sortIds } from "../algorithms/sorting";
it("non-recording sorts agree with visual algorithms on output and counts", () => {
  for (const id of sortIds)
    for (const input of [
      [],
      [1],
      [3, 2, 1],
      [-1, 2, 2, 0],
      [1, 1, 1],
      [1, 2, 3, 4],
    ]) {
      const a = [...input],
        counts = measuredSort(id, a),
        last = generateSortSteps(id, input).at(-1)!;
      expect(a).toEqual(last.items.map((x) => x.value));
      expect(counts).toEqual({
        comparisons: last.comparisons,
        swaps: last.swaps,
        writes: last.writes,
      });
    }
});
it("calculates medians, distributions, actual finite timings and CSV", () => {
  expect(median([8, 1, 5])).toBe(5);
  expect(median([4, 2])).toBe(3);
  expect(benchmarkInput(4, "sorted", () => 0.3)).toEqual([
    3000, 3000, 3000, 3000,
  ]);
  const config = {
    sizes: [5, 10],
    trials: 3,
    distribution: "reverse" as const,
    seed: 1,
  };
  const rows = runBenchmark(config);
  expect(rows).toHaveLength(12);
  expect(
    rows.every((r) => Number.isFinite(r.medianMs) && r.medianMs >= 0),
  ).toBe(true);
  expect(
    rows.find((r) => r.algorithm === "selection" && r.size === 10)!.comparisons,
  ).toBe(45);
  expect(benchmarkCSV(rows, config).split("\r\n")).toHaveLength(13);
  expect(() => runBenchmark({ ...config, sizes: [100000] })).toThrow();
});
