import { sortIds, type SortId } from "../algorithms/sorting";
export type Distribution = "random" | "sorted" | "reverse" | "nearly";
export type BenchmarkConfig = {
  sizes: number[];
  trials: number;
  distribution: Distribution;
  seed: number;
};
export type BenchmarkRow = {
  algorithm: SortId;
  size: number;
  medianMs: number;
  comparisons: number;
  swaps: number;
  writes: number;
};
/** Non-recording instrumented algorithms: no snapshots, React, or animation inside this path. Mutates a. */
export function measuredSort(id: SortId, a: number[]) {
  let comparisons = 0,
    swaps = 0,
    writes = 0;
  const cmp = (x: number, y: number) => {
    comparisons++;
    return x - y;
  };
  const swap = (i: number, j: number) => {
    if (i === j) return;
    [a[i], a[j]] = [a[j], a[i]];
    swaps++;
    writes += 2;
  };
  const write = (i: number, value: number) => {
    a[i] = value;
    writes++;
  };
  if (id === "bubble")
    for (let end = a.length - 1; end > 0; end--) {
      let changed = false;
      for (let j = 0; j < end; j++)
        if (cmp(a[j], a[j + 1]) > 0) {
          swap(j, j + 1);
          changed = true;
        }
      if (!changed) break;
    }
  else if (id === "selection")
    for (let i = 0; i < a.length; i++) {
      let min = i;
      for (let j = i + 1; j < a.length; j++) if (cmp(a[j], a[min]) < 0) min = j;
      swap(i, min);
    }
  else if (id === "insertion")
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= 0) {
        if (cmp(a[j], key) <= 0) break;
        write(j + 1, a[j]);
        j--;
      }
      write(j + 1, key);
    }
  else if (id === "merge") {
    const merge = (lo: number, hi: number) => {
      if (hi - lo < 2) return;
      const mid = Math.floor((lo + hi) / 2);
      merge(lo, mid);
      merge(mid, hi);
      const left = a.slice(lo, mid),
        right = a.slice(mid, hi);
      let l = 0,
        r = 0,
        k = lo;
      while (l < left.length && r < right.length)
        write(k++, cmp(left[l], right[r]) <= 0 ? left[l++] : right[r++]);
      while (l < left.length) write(k++, left[l++]);
      while (r < right.length) write(k++, right[r++]);
    };
    merge(0, a.length);
  } else if (id === "quick") {
    const ranges: [number, number][] = [[0, a.length - 1]];
    while (ranges.length) {
      const [lo, hi] = ranges.pop()!;
      if (lo >= hi) continue;
      const pivot = a[hi];
      let boundary = lo;
      for (let j = lo; j < hi; j++)
        if (cmp(a[j], pivot) < 0) {
          swap(boundary, j);
          boundary++;
        }
      swap(boundary, hi);
      ranges.push([lo, boundary - 1], [boundary + 1, hi]);
    }
  } else {
    const sift = (root: number, size: number) => {
      while (true) {
        let max = root;
        const l = 2 * root + 1,
          r = l + 1;
        if (l < size && cmp(a[l], a[max]) > 0) max = l;
        if (r < size && cmp(a[r], a[max]) > 0) max = r;
        if (max === root) return;
        swap(root, max);
        root = max;
      }
    };
    for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) sift(i, a.length);
    for (let end = a.length - 1; end > 0; end--) {
      swap(0, end);
      sift(0, end);
    }
  }
  return { comparisons, swaps, writes };
}
export function median(values: number[]) {
  if (!values.length) throw new Error("Median requires samples.");
  const v = [...values].sort((a, b) => a - b),
    mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}
export function benchmarkInput(
  size: number,
  distribution: Distribution,
  random: () => number,
): number[] {
  const values = Array.from({ length: size }, () =>
    Math.floor(random() * 10000),
  );
  if (distribution !== "random") values.sort((a, b) => a - b);
  if (distribution === "reverse") values.reverse();
  if (distribution === "nearly")
    for (let i = 0; i < Math.max(1, Math.floor(size * 0.02)); i++) {
      const a = Math.floor(random() * size),
        b = Math.floor(random() * size);
      if (size) [values[a], values[b]] = [values[b], values[a]];
    }
  return values;
}
export function runBenchmark(
  config: BenchmarkConfig,
  progress?: (done: number, total: number) => void,
): BenchmarkRow[] {
  const { sizes, trials, distribution } = config;
  if (
    !sizes.length ||
    sizes.length > 6 ||
    sizes.some((n) => !Number.isInteger(n) || n < 2 || n > 2000) ||
    !Number.isInteger(trials) ||
    trials < 1 ||
    trials > 9 ||
    !["random", "sorted", "reverse", "nearly"].includes(distribution) ||
    !Number.isInteger(config.seed)
  )
    throw new Error(
      "Use 1–6 sizes from 2–2000, 1–9 trials, a valid distribution, and an integer seed.",
    );
  let seed = config.seed >>> 0;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  // Warm up each implementation equally; exclude these executions from the results.
  for (const id of sortIds)
    for (let w = 0; w < 2; w++)
      measuredSort(id, benchmarkInput(64, "random", random));
  const rows: BenchmarkRow[] = [];
  let done = 0;
  for (const size of sizes) {
    const samples = new Map(
      sortIds.map((id) => [
        id,
        [] as {
          ms: number;
          comparisons: number;
          swaps: number;
          writes: number;
        }[],
      ]),
    );
    for (let trial = 0; trial < trials; trial++) {
      const base = benchmarkInput(size, distribution, random);
      // Rotate order between trials to reduce systematic order bias; clone outside the timer.
      for (let i = 0; i < sortIds.length; i++) {
        const id = sortIds[(i + trial) % sortIds.length],
          input = [...base];
        const start = performance.now();
        const counts = measuredSort(id, input);
        const elapsed = performance.now() - start;
        samples.get(id)!.push({ ms: elapsed, ...counts });
        progress?.(++done, sizes.length * trials * sortIds.length);
      }
    }
    for (const id of sortIds) {
      const values = samples.get(id)!;
      rows.push({
        algorithm: id,
        size,
        medianMs: median(values.map((v) => v.ms)),
        comparisons: median(values.map((v) => v.comparisons)),
        swaps: median(values.map((v) => v.swaps)),
        writes: median(values.map((v) => v.writes)),
      });
    }
  }
  return rows;
}
export function benchmarkCSV(rows: BenchmarkRow[], config: BenchmarkConfig) {
  return [
    "algorithm,size,median_ms,median_comparisons,median_swaps,median_main_array_writes,distribution,trials,seed",
    ...rows.map((r) =>
      [
        r.algorithm,
        r.size,
        r.medianMs,
        r.comparisons,
        r.swaps,
        r.writes,
        config.distribution,
        config.trials,
        config.seed,
      ].join(","),
    ),
  ].join("\r\n");
}
