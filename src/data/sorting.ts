import type { SortId } from "../algorithms/sorting";
type Lesson = {
  name: string;
  definition: string;
  principle: string;
  best: string;
  average: string;
  worst: string;
  space: string;
  stable: boolean;
  inPlace: boolean;
  advantages: string;
  limitations: string;
  applications: string;
  pseudocode: string[];
};
export const sortingLessons: Record<SortId, Lesson> = {
  bubble: {
    name: "Bubble Sort",
    definition:
      "Repeatedly compare adjacent elements and exchange inverted pairs.",
    principle:
      "Each pass moves the largest remaining element to the end. Stop early when a pass makes no swaps.",
    best: "Θ(n)",
    average: "Θ(n²)",
    worst: "Θ(n²)",
    space: "O(1)",
    stable: true,
    inPlace: true,
    advantages: "Simple to trace; detects an already sorted array in one pass.",
    limitations: "Quadratic work makes it unsuitable for large inputs.",
    applications: "Teaching adjacent exchanges and early termination.",
    pseudocode: [
      "repeat for end = n−1 down to 1; changed = false",
      "  for j = 0 to end−1",
      "    compare A[j] and A[j+1]",
      "    if inverted: swap; changed = true",
      "  mark end final",
      "  if not changed: stop",
      "return A",
    ],
  },
  selection: {
    name: "Selection Sort",
    definition:
      "Find the smallest remaining element and place it at the next output position.",
    principle:
      "The prefix is final after each iteration; scan the entire remaining suffix to choose its minimum.",
    best: "Θ(n²)",
    average: "Θ(n²)",
    worst: "Θ(n²)",
    space: "O(1)",
    stable: false,
    inPlace: true,
    advantages: "At most n−1 swaps, even when many comparisons are necessary.",
    limitations:
      "Always quadratic comparisons; long swaps can reverse equal keys.",
    applications: "Small arrays where minimizing swaps matters.",
    pseudocode: [
      "for i = 0 to n−1",
      "  min = i; scan j = i+1 to n−1",
      "  if A[j] < A[min]: min = j",
      "  swap A[i] and A[min] if distinct positions",
      "  mark i final",
      "all positions are final",
      "return A",
    ],
  },
  insertion: {
    name: "Insertion Sort",
    definition:
      "Insert each element into its correct place within a growing sorted prefix.",
    principle:
      "Hold a key, shift strictly larger elements right, then write the key into the gap. A sorted prefix is not yet globally final.",
    best: "Θ(n)",
    average: "Θ(n²)",
    worst: "Θ(n²)",
    space: "O(1)",
    stable: true,
    inPlace: true,
    advantages: "Adaptive on nearly sorted inputs; preserves equal-key order.",
    limitations: "Reverse input requires quadratic shifts.",
    applications: "Small or nearly sorted arrays; base cases in hybrid sorts.",
    pseudocode: [
      "for i = 1 to n−1",
      "  key = A[i]; j = i−1",
      "  while j ≥ 0 and A[j] > key",
      "    A[j+1] = A[j]; j = j−1",
      "  A[j+1] = key",
      "prefix grows after each iteration",
      "return A",
    ],
  },
  merge: {
    name: "Merge Sort",
    definition: "Recursively sort halves, then merge their ordered elements.",
    principle:
      "Temporary left and right buffers preserve unread values. Choosing the left buffer on ties makes the merge stable.",
    best: "Θ(n log n)",
    average: "Θ(n log n)",
    worst: "Θ(n log n)",
    space: "O(n)",
    stable: true,
    inPlace: false,
    advantages: "Guaranteed logarithmic recursion depth and n log n work.",
    limitations:
      "Requires linear auxiliary buffers in this array implementation.",
    applications:
      "Stable sorting; the merge principle also supports external sorting.",
    pseudocode: [
      "split [lo, hi) recursively until length < 2",
      "copy sorted halves into left and right buffers",
      "compare the current left and right buffer items",
      "write smaller item (left on tie); advance its cursor",
      "write remaining buffer items",
      "return from this merge",
      "return A",
    ],
  },
  quick: {
    name: "Quick Sort",
    definition:
      "Partition around a pivot and recursively sort the ranges on either side.",
    principle:
      "This implementation uses the last element as a Lomuto pivot. Values strictly smaller move left; the pivot then takes its final position.",
    best: "Θ(n log n)",
    average: "Θ(n log n)",
    worst: "Θ(n²)",
    space: "O(log n) average; O(n) worst",
    stable: false,
    inPlace: true,
    advantages:
      "Partitions within the original array and often has good locality.",
    limitations:
      "Last-element pivots degrade on sorted, reverse, or all-equal input. Recursion uses stack space.",
    applications:
      "General sorting when pivot strategy and worst-case safeguards are chosen carefully.",
    pseudocode: [
      "quick(lo, hi): return if empty; mark if singleton",
      "pivot = A[hi]; boundary = lo",
      "for j = lo to hi−1: compare A[j] < pivot",
      "  if smaller: swap A[boundary], A[j]; boundary++",
      "swap A[boundary], A[hi]; mark boundary final",
      "quick(lo, boundary−1); quick(boundary+1, hi)",
      "return A",
    ],
  },
  heap: {
    name: "Heap Sort",
    definition:
      "Build a max heap and repeatedly move its largest element into the final suffix.",
    principle:
      "Sift down by comparing a parent with its children, exchanging with the largest child until heap order is restored.",
    best: "Θ(n)¹",
    average: "Θ(n log n)",
    worst: "Θ(n log n)",
    space: "O(1)",
    stable: false,
    inPlace: true,
    advantages:
      "Worst-case n log n bound without recursive stack or linear buffers.",
    limitations:
      "Unstable and often less cache friendly than partition-based sorting.",
    applications:
      "Sorting with constant auxiliary algorithm space and a worst-case bound.",
    pseudocode: [
      "build max heap by sifting internal nodes downward",
      "sift(root, size): repeat",
      "  compare root with each existing child; choose largest",
      "  if child larger: swap and continue; otherwise return",
      "swap maximum with end; mark end final; sift reduced heap",
      "repeat extraction until one element remains",
      "return A",
    ],
  },
};
