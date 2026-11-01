import { sortingLessons } from "./sorting";
export type Lesson = {
  title: string;
  definition: string;
  principle: string;
  best: string;
  average: string;
  worst: string;
  space: string;
  advantages: string;
  limitations: string;
  applications: string;
  example: string;
  pseudocode: string[];
  assumptions: string;
};
const treeCode = [
  "Begin operation at the root",
  "Compare key; follow child / visit traversal node",
  "Insert leaf or remove node via successor if needed",
  "Inspect ancestors / black deficit after deletion",
  "Rotate to restore balance while preserving order",
  "Recolor Red-Black nodes when required",
  "Return final tree or traversal output",
];
const graphCode = [
  "Initialize state; validate graph and start",
  "Select next vertex or lowest-weight edge",
  "Explore outgoing adjacency / test DSU components",
  "Discover, relax, union, or reject a cycle",
  "Continue until frontier or edge list is exhausted",
  "Reconstruct path from predecessor links",
  "Return traversal, path, or minimum spanning forest",
];
const base = {
  best: "—",
  average: "—",
  worst: "",
  space: "",
  advantages: "",
  limitations: "",
  applications: "",
  example: "",
  assumptions:
    "Costs exclude stored visualization histories. n denotes input size.",
};
export const lessons: Record<string, Lesson> = {
  bst: {
    ...base,
    title: "Binary Search Tree",
    definition:
      "An ordered binary tree with smaller keys on the left and larger keys on the right.",
    principle:
      "Follow comparisons from the root. Delete a two-child node using its inorder successor. Inorder traversal lists keys in ascending order.",
    best: "O(1) operation",
    average: "O(log n) expected¹",
    worst: "O(n) operation; O(n) traversal",
    space: "O(n) nodes; O(h) recursive traversal",
    advantages: "Simple ordered lookup, insertion, deletion, and traversal.",
    limitations:
      "Sorted insertion may produce a chain. Duplicates are ignored.",
    applications: "Ordered sets and range-oriented search.",
    example: "Insert 2,1,3; inorder gives 1,2,3. Delete 2 and use successor 3.",
    pseudocode: treeCode,
    assumptions:
      "h is tree height. ¹ Expected logarithmic depth assumes random insertion order of distinct keys; this is not a balancing guarantee.",
  },
  avl: {
    ...base,
    title: "AVL Tree",
    definition:
      "A BST whose child subtree heights differ by at most one at every node.",
    principle:
      "Cache heights and repair ancestors using single or double rotations after insertion and deletion. A rotation preserves inorder order.",
    best: "O(1) lookup",
    average: "O(log n) operation",
    worst: "O(log n) operation; O(n) traversal",
    space: "O(n) nodes; O(log n) traversal stack",
    advantages: "Strict balance gives predictable logarithmic searches.",
    limitations:
      "Deletion may rebalance several ancestors; rotations add update work.",
    applications:
      "Read-heavy ordered collections requiring a height guarantee.",
    example: "Insert 3,2,1: rotate right at 3 to produce root 2.",
    pseudocode: treeCode,
    assumptions:
      "Cached heights make non-visual balance updates constant time per ancestor. Snapshot creation and displayed balance computations are additional visualization work.",
  },
  redblack: {
    ...base,
    title: "Red-Black Tree",
    definition:
      "A BST with a black root, black NIL leaves, no adjacent red nodes, and equal black height on every root-to-NIL path.",
    principle:
      "Insertion repairs red-parent conflicts. Deleting a black node can create a black deficit; sibling cases use rotations and recoloring until the deficit is discharged or reaches the root.",
    best: "O(1) lookup",
    average: "O(log n) operation",
    worst: "O(log n) operation; O(n) traversal",
    space: "O(n) nodes; O(log n) traversal stack",
    advantages: "Logarithmic height with efficient ordered updates.",
    limitations:
      "Balancing rules are more intricate; intermediate repair states may violate final invariants.",
    applications: "Ordered maps and sets.",
    example:
      "Insert 10,5,1; rotate and recolor to restore a black root and valid black heights.",
    pseudocode: treeCode,
    assumptions:
      "Absent children use a shared black NIL sentinel. Rotation/fix-up paths are iterative; height is at most 2 log₂(n+1).",
  },
  bfs: {
    ...base,
    title: "Breadth-First Search",
    definition:
      "Explore the reachable graph in layers using a first-in, first-out queue.",
    principle:
      "Mark nodes discovered when enqueued so each enters the queue once. Parent links reconstruct a path with the fewest edges.",
    best: "O(Vᵣ + Eᵣ)",
    average: "O(Vᵣ + Eᵣ)",
    worst: "O(Vᵣ + Eᵣ) traversal¹",
    space: "O(V + E) adjacency; O(V) traversal",
    advantages: "Finds fewest-edge paths in unweighted graphs.",
    limitations: "Weights are ignored; only the start component is visited.",
    applications: "Unweighted routing and level exploration.",
    example: "A–B, A–C, B–D: start A visits A,B,C,D.",
    pseudocode: graphCode,
    assumptions:
      "Vᵣ/Eᵣ are reachable vertices/edges. ¹ Textbook bounds assume an adjacency list; this bounded visualizer scans its edge list for each node, giving O(VE + V²) including array membership/frontier operations, before snapshot costs.",
  },
  dfs: {
    ...base,
    title: "Depth-First Search",
    definition: "Explore reachable nodes using a last-in, first-out stack.",
    principle:
      "Use explicit stack frames to preserve recursive depth-first order. Discover one child and descend before exploring remaining siblings; backtrack when a frame has no remaining neighbors.",
    best: "O(Vᵣ + Eᵣ)",
    average: "O(Vᵣ + Eᵣ)",
    worst: "O(Vᵣ + Eᵣ) traversal¹",
    space: "O(V + E) adjacency; O(V) traversal",
    advantages:
      "Simple reachability exploration without recursive call-stack growth.",
    limitations:
      "The discovery path is not guaranteed shortest. Neighbor order affects output.",
    applications: "Reachability and graph structure exploration.",
    example: "A→B→D is explored along stack candidates rather than BFS layers.",
    pseudocode: graphCode,
    assumptions:
      "¹ Standard adjacency-list bound. This visualizer scans edge lists and uses array membership, O(VE + V²) before snapshot costs. Explicit neighbor cursors preserve recursive DFS order without using the JavaScript call stack.",
  },
  dijkstra: {
    ...base,
    title: "Dijkstra’s Shortest Path",
    definition:
      "Finalize the unvisited node with smallest tentative distance, then relax outgoing edges.",
    principle:
      "For nonnegative weights, finalization is safe because a later path cannot improve a smaller finalized distance. Predecessors reconstruct one shortest path; ties keep the earlier predecessor.",
    best: "—",
    average: "—",
    worst: "O(V² log V + VE)¹",
    space: "O(V + E) graph; O(V) search state",
    advantages:
      "Finds weighted shortest paths on directed or undirected nonnegative graphs.",
    limitations: "Negative edges are rejected; unreachable nodes retain ∞.",
    applications: "Route planning and weighted network distance.",
    example: "A→B=4, A→C=1, C→B=2 gives distance(A,B)=3.",
    pseudocode: graphCode,
    assumptions:
      "¹ This implementation re-sorts remaining finite-distance candidates at each iteration and scans the edge list; it does not use a priority heap. A heap/adjacency implementation has a different bound.",
  },
  kruskal: {
    ...base,
    title: "Kruskal’s Minimum Spanning Forest",
    definition:
      "Select cheapest edges that join distinct components of an undirected graph.",
    principle:
      "Sort by weight. A disjoint-set union structure with path compression and union by rank detects cycles. Process all edges to cover disconnected components.",
    best: "—",
    average: "—",
    worst: "O(E log E + (V+E) α(V))",
    space: "O(V + E)",
    advantages:
      "Handles disconnected graphs, negative weights, and parallel edges.",
    limitations:
      "Directed graphs are rejected. A forest is not a shortest-path tree.",
    applications: "Connecting networks with minimum total edge cost.",
    example: "Edges A–B=1, B–C=2, A–C=5 select the first two; total 3.",
    pseudocode: graphCode,
    assumptions:
      "α is the inverse Ackermann function from DSU operations. Self-loops are rejected as cycles.",
  },
  naive: {
    ...base,
    title: "Naive String Matching",
    definition: "Try the pattern at every possible text alignment.",
    principle:
      "Compare characters from left to right; after a mismatch or a full match, shift by one. Overlapping matches are retained.",
    best: "Θ(n−m+1) for nonempty m≤n",
    average: "Input/alphabet dependent",
    worst: "O(nm)",
    space: "O(1) extra, excluding matches",
    advantages: "Simple, with no preprocessing.",
    limitations: "Repeats comparisons on repetitive text.",
    applications: "Short patterns and a baseline for KMP.",
    example: "ABABA with ABA matches at positions 0 and 2.",
    pseudocode: [
      "Initialize all alignment positions",
      "At each alignment compare text[i+j] to pattern[j]",
      "On mismatch stop this alignment",
      "On full match record alignment",
      "Advance alignment by one",
      "Repeat through last valid alignment",
      "Return all matching positions",
    ],
    assumptions:
      "n and m count Unicode code points. Empty pattern matches all n+1 boundaries. Output space is O(number of matches).",
  },
  kmp: {
    ...base,
    title: "Knuth–Morris–Pratt",
    definition:
      "Use longest proper prefix/suffix information to skip redundant pattern comparisons.",
    principle:
      "Build LPS using fallback links. During search, mismatches move the pattern cursor to LPS[j−1] without rewinding the text cursor. After a match, fall back to permit overlaps.",
    best: "O(n+m)",
    average: "O(n+m)",
    worst: "O(n+m)",
    space: "O(m) excluding matches",
    advantages: "Linear worst-case matching, even on repetitive inputs.",
    limitations: "Requires preprocessing and careful indexing.",
    applications: "Repeated-pattern text search.",
    example: "ABA has LPS [0,0,1]; ABABA matches at 0 and 2.",
    pseudocode: [
      "Initialize LPS and cursors",
      "Preprocess: compare pattern[i] and pattern[len]",
      "If equal extend prefix; otherwise fall back via LPS",
      "Search: compare text[i] and pattern[j]",
      "Mismatch: fall back via LPS or advance text at j=0",
      "Full match: record i−m; j = LPS[m−1]",
      "Return all matches",
    ],
    assumptions:
      "Indices refer to Unicode code points, not UTF-16 offsets. Empty pattern matches every boundary; output space is additional.",
  },
  activity: {
    ...base,
    title: "Activity Selection",
    definition:
      "Choose a maximum-size subset of non-overlapping activities on one resource.",
    principle:
      "Sort by finish time. Select an activity when its start is at least the finish of the last selected activity. This leaves the most room for the remaining schedule.",
    best: "—",
    average: "—",
    worst: "O(n log n)",
    space: "O(n) sorted copy and result",
    advantages:
      "A local earliest-finish choice gives an optimal number of activities.",
    limitations: "Does not optimize profit or weighted activities.",
    applications: "Single-resource interval scheduling.",
    example: "[0,2), [1,4), [2,3) selects the first and third.",
    pseudocode: [
      "Sort activities by finish time",
      "Read the next activity",
      "If start ≥ lastFinish, select and update lastFinish",
      "Otherwise reject overlapping activity",
      "Continue through sorted activities",
      "Report selected IDs",
      "Return maximum-size compatible schedule",
    ],
    assumptions:
      "Intervals are half-open and require finish > start. Finish ties use input ID.",
  },
  fractional: {
    ...base,
    title: "Fractional Knapsack",
    definition: "Maximize value when each positive-weight item can be divided.",
    principle:
      "Take items in decreasing value/weight ratio, using a fraction of the first item that does not fit. Unlike 0/1 knapsack, splitting is allowed.",
    best: "—",
    average: "—",
    worst: "O(n log n)",
    space: "O(n)",
    advantages: "Optimal divisible selection using a simple greedy rule.",
    limitations:
      "Not correct for indivisible 0/1 items; nonpositive weights are rejected.",
    applications: "Divisible resource allocation.",
    example:
      "Weight 10/value 60 and weight 20/value 100, capacity 20 gives value 110.",
    pseudocode: [
      "Sort by decreasing value/weight",
      "Read next item",
      "Take min(1, remainingCapacity/weight)",
      "Update capacity and accumulated value",
      "Stop taking when capacity is exhausted",
      "Report fractions for original items",
      "Return total value",
    ],
    assumptions:
      "Weights are positive; values and capacity are nonnegative, finite numbers. Floating-point values may have rounding error.",
  },
  huffman: {
    ...base,
    title: "Huffman Coding",
    definition:
      "Build a binary prefix code by repeatedly merging the two least frequent symbols or subtrees.",
    principle:
      "Use 0 for a left edge and 1 for a right edge. Leaf paths are codes; no leaf is an ancestor of another, so no code prefixes another.",
    best: "—",
    average: "—",
    worst: "O(k² log k + n + B)¹",
    space: "O(k² + n + B), including codebook/output",
    advantages:
      "Optimal weighted code length among binary prefix codes for fixed symbol frequencies.",
    limitations:
      "The decoder also needs the codebook. Frequency distribution affects compression; not all text compresses.",
    applications: "Entropy coding and compression.",
    example: "Frequencies A:5, B:2, C:1 merge C+B, then merge with A.",
    pseudocode: [
      "Count symbols or read positive frequencies",
      "Sort the priority queue by frequency",
      "Remove the two least frequent nodes",
      "Join them; reinsert their summed parent",
      "Repeat until one tree remains",
      "Assign leaf codes; a singleton uses 0",
      "Return codebook and weighted bit length",
    ],
    assumptions:
      "k distinct symbols, n text length, B output bits. Code strings can total O(k²) characters. ¹ The small teaching priority queue is a sorted array, re-sorted per merge, rather than a binary heap. Custom-frequency mode reports weighted bit length; text mode also encodes the supplied text.",
  },
  knapsack: {
    ...base,
    title: "0/1 Knapsack",
    definition:
      "Choose indivisible items of maximum value without exceeding integer capacity.",
    principle:
      "For each item and capacity, compare exclusion with inclusion from the previous row. Trace backward through the DP table to reconstruct selected items.",
    best: "Θ(nC)",
    average: "Θ(nC)",
    worst: "Θ(nC)",
    space: "Θ(nC)",
    advantages: "Finds the optimum when greedy ratios can fail.",
    limitations: "Pseudo-polynomial in capacity C; items cannot be divided.",
    applications: "Budgeted selection of indivisible resources.",
    example: "(w=2,v=3),(w=3,v=4), capacity 3 selects the second item.",
    pseudocode: [
      "Initialize row 0 and capacity 0 to zero",
      "For each item i and capacity c",
      "Compute exclude = dp[i−1][c]",
      "If item fits, include = value + dp[i−1][c−weight]",
      "Set dp[i][c] = max(exclude, include)",
      "Backtrack changes between adjacent rows",
      "Return optimum and selected item IDs",
    ],
    assumptions:
      "n items, C integer capacity; positive integer weights and nonnegative values. Ties choose exclusion during reconstruction.",
  },
  lcs: {
    ...base,
    title: "Longest Common Subsequence",
    definition:
      "Find a longest sequence appearing in both strings in the same order, possibly with gaps.",
    principle:
      "Equal characters extend a diagonal subsequence; unequal characters take the larger of upper and left cells. Backtrack to recover one optimum.",
    best: "Θ(nm)",
    average: "Θ(nm)",
    worst: "Θ(nm)",
    space: "Θ(nm)",
    advantages:
      "Solves an exponential-choice problem with reusable prefix states.",
    limitations:
      "Quadratic table space; multiple optimal subsequences may exist.",
    applications: "Sequence comparison and change analysis.",
    example: "ABC and AC have LCS AC with length 2.",
    pseudocode: [
      "Initialize empty-prefix row and column to zero",
      "For each pair of prefixes (i,j)",
      "If characters match: 1 + dp[i−1][j−1]",
      "Otherwise max(dp[i−1][j], dp[i][j−1])",
      "Store the chosen length",
      "Backtrack diagonals for matches, otherwise upper/left",
      "Return one longest common subsequence",
    ],
    assumptions:
      "n,m count Unicode code points. Ties backtrack upward; other equally long subsequences may also be valid.",
  },
};

for (const [id, lesson] of Object.entries(sortingLessons)) {
  lessons[id] = {
    ...lesson,
    title: lesson.name,
    example: "[3, 1, 2] → [1, 2, 3]",
    assumptions: `Average cases assume random order of distinct keys; numeric comparisons take constant time. Stable: ${lesson.stable ? "yes" : "no"}. In-place array storage: ${lesson.inPlace ? "yes" : "no"}. Space excludes visualization snapshots and includes recursion. Heap Sort has a linear all-equal best case and n log n distinct-key best case.`,
  };
}
