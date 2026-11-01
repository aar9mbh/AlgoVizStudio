export const sortIds = [
  "bubble",
  "selection",
  "insertion",
  "merge",
  "quick",
  "heap",
] as const;
export type SortId = (typeof sortIds)[number];
export type SortEvent =
  | "ready"
  | "compare"
  | "swap"
  | "write"
  | "pivot"
  | "sorted"
  | "done";
export type Element = { value: number; id: number };
export type SortStep = {
  items: Element[];
  event: SortEvent;
  active: number[];
  sorted: number[];
  pivot: number | null;
  line: number;
  description: string;
  comparisons: number;
  swaps: number;
  writes: number;
};
export const MAX_SORT_SIZE = 40;
export function validArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length <= MAX_SORT_SIZE &&
    value.every(
      (n) => typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= 999,
    )
  );
}
export function parseArray(text: string): number[] {
  if (!text.trim()) return [];
  const tokens = text.trim().split(/[\s,]+/);
  if (tokens.some((t) => !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(t)))
    throw new Error("Use numbers separated by commas or spaces.");
  const values = tokens.map(Number);
  if (!validArray(values))
    throw new Error(
      `Use up to ${MAX_SORT_SIZE} finite numbers between −999 and 999.`,
    );
  return values;
}

/** Immutable, bounded execution histories. Counts exclude index/bounds checks and copies into snapshots. */
export function generateSortSteps(id: SortId, input: number[]): SortStep[] {
  if (!validArray(input)) throw new Error("Invalid visualization input.");
  const a = input.map((value, id) => ({ value, id }));
  const steps: SortStep[] = [];
  const settled = new Set<number>();
  let comparisons = 0,
    swaps = 0,
    writes = 0,
    pivot: number | null = null;
  const emit = (
    event: SortEvent,
    active: number[],
    line: number,
    description: string,
  ) => {
    steps.push({
      items: a.map((x) => ({ ...x })),
      event,
      active: [...active],
      sorted: [...settled],
      pivot,
      line,
      description,
      comparisons,
      swaps,
      writes,
    });
  };
  const compare = (x: Element, y: Element, indices: number[], line: number) => {
    comparisons++;
    emit("compare", indices, line, `Compare ${x.value} with ${y.value}.`);
    return x.value - y.value;
  };
  const swap = (i: number, j: number, line: number) => {
    if (i === j) return;
    [a[i], a[j]] = [a[j], a[i]];
    swaps++;
    writes += 2;
    emit(
      "swap",
      [i, j],
      line,
      `Swap positions ${i} and ${j}; two main-array writes.`,
    );
  };
  const write = (i: number, item: Element, line: number) => {
    a[i] = item;
    writes++;
    emit("write", [i], line, `Write ${item.value} to position ${i}.`);
  };
  const mark = (i: number, line: number) => {
    settled.add(i);
    emit(
      "sorted",
      [i],
      line,
      `Position ${i} has its final value ${a[i].value}.`,
    );
  };
  emit(
    "ready",
    [],
    0,
    `Ready: ${input.length} elements. Sorting is ascending; positions are zero-based.`,
  );
  if (id === "bubble") {
    for (let end = a.length - 1; end > 0; end--) {
      let changed = false;
      for (let j = 0; j < end; j++) {
        if (compare(a[j], a[j + 1], [j, j + 1], 2) > 0) {
          swap(j, j + 1, 3);
          changed = true;
        }
      }
      mark(end, 4);
      if (!changed) {
        emit(
          "sorted",
          [],
          5,
          "No swaps in this pass: the remaining prefix is already sorted.",
        );
        break;
      }
    }
  } else if (id === "selection") {
    for (let i = 0; i < a.length; i++) {
      let min = i;
      for (let j = i + 1; j < a.length; j++)
        if (compare(a[j], a[min], [j, min], 2) < 0) min = j;
      swap(i, min, 3);
      mark(i, 4);
    }
  } else if (id === "insertion") {
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      emit(
        "pivot",
        [i],
        1,
        `Hold key ${key.value}. The prefix before position ${i} is sorted, but not necessarily final.`,
      );
      while (j >= 0) {
        if (compare(a[j], key, [j], 2) <= 0) break;
        write(j + 1, a[j], 3);
        j--;
      }
      write(j + 1, key, 4);
    }
  } else if (id === "merge") {
    const merge = (lo: number, hi: number) => {
      if (hi - lo < 2) return;
      const mid = Math.floor((lo + hi) / 2);
      merge(lo, mid);
      merge(mid, hi);
      // Copy each half before overwriting the main array; take the left item on ties for stability.
      const left = a.slice(lo, mid),
        right = a.slice(mid, hi);
      let l = 0,
        r = 0,
        k = lo;
      emit(
        "ready",
        [],
        1,
        `Merge sorted ranges [${lo}, ${mid}) and [${mid}, ${hi}).`,
      );
      while (l < left.length && r < right.length) {
        const item =
          compare(left[l], right[r], [lo + l, mid + r], 2) <= 0
            ? left[l++]
            : right[r++];
        write(k++, item, 3);
      }
      while (l < left.length) write(k++, left[l++], 4);
      while (r < right.length) write(k++, right[r++], 4);
    };
    merge(0, a.length);
  } else if (id === "quick") {
    const quick = (lo: number, hi: number) => {
      if (lo > hi) return;
      if (lo === hi) {
        mark(lo, 5);
        return;
      }
      pivot = hi;
      const key = a[hi];
      let boundary = lo;
      emit(
        "pivot",
        [hi],
        1,
        `Choose last element ${key.value} as pivot for [${lo}, ${hi}].`,
      );
      for (let j = lo; j < hi; j++)
        if (compare(a[j], key, [j, hi], 2) < 0) {
          swap(boundary, j, 3);
          boundary++;
        }
      swap(boundary, hi, 4);
      pivot = boundary;
      mark(boundary, 4);
      pivot = null;
      quick(lo, boundary - 1);
      quick(boundary + 1, hi);
    };
    quick(0, a.length - 1);
  } else {
    const sift = (root: number, size: number) => {
      // Iterative sift-down keeps Heap Sort's auxiliary algorithm space constant.
      while (true) {
        let largest = root;
        const left = 2 * root + 1,
          right = left + 1;
        if (left < size && compare(a[left], a[largest], [left, largest], 2) > 0)
          largest = left;
        if (
          right < size &&
          compare(a[right], a[largest], [right, largest], 2) > 0
        )
          largest = right;
        if (largest === root) return;
        swap(root, largest, 3);
        root = largest;
      }
    };
    for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) sift(i, a.length);
    for (let end = a.length - 1; end > 0; end--) {
      swap(0, end, 4);
      mark(end, 4);
      sift(0, end);
    }
  }
  pivot = null;
  a.forEach((_, i) => settled.add(i));
  emit(
    "done",
    [],
    6,
    a.length
      ? "Complete: every element is in ascending order."
      : "Complete: the empty array is already sorted.",
  );
  return steps;
}
