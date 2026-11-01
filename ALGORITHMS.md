# AlgoViz Studio — Algorithm Reference

All 20 algorithms below are implemented. This guide is generated from the educational content used by the app; regenerate with `node scripts/generate-algorithm-guide.mjs`. Algorithm space excludes stored visualization histories.

## Binary Search Tree

Source key: `bst`.

An ordered binary tree with smaller keys on the left and larger keys on the right.

Follow comparisons from the root. Delete a two-child node using its inorder successor. Inorder traversal lists keys in ascending order.

```text
Begin operation at the root
Compare key; follow child / visit traversal node
Insert leaf or remove node via successor if needed
Inspect ancestors / black deficit after deletion
Rotate to restore balance while preserving order
Recolor Red-Black nodes when required
Return final tree or traversal output
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| O(1) operation | O(log n) expected¹ | O(n) operation; O(n) traversal | O(n) nodes; O(h) recursive traversal |

Example: Insert 2,1,3; inorder gives 1,2,3. Delete 2 and use successor 3.

Advantages: Simple ordered lookup, insertion, deletion, and traversal.

Limitations: Sorted insertion may produce a chain. Duplicates are ignored.

Applications: Ordered sets and range-oriented search.

Assumptions: h is tree height. ¹ Expected logarithmic depth assumes random insertion order of distinct keys; this is not a balancing guarantee.

## AVL Tree

Source key: `avl`.

A BST whose child subtree heights differ by at most one at every node.

Cache heights and repair ancestors using single or double rotations after insertion and deletion. A rotation preserves inorder order.

```text
Begin operation at the root
Compare key; follow child / visit traversal node
Insert leaf or remove node via successor if needed
Inspect ancestors / black deficit after deletion
Rotate to restore balance while preserving order
Recolor Red-Black nodes when required
Return final tree or traversal output
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| O(1) lookup | O(log n) operation | O(log n) operation; O(n) traversal | O(n) nodes; O(log n) traversal stack |

Example: Insert 3,2,1: rotate right at 3 to produce root 2.

Advantages: Strict balance gives predictable logarithmic searches.

Limitations: Deletion may rebalance several ancestors; rotations add update work.

Applications: Read-heavy ordered collections requiring a height guarantee.

Assumptions: Cached heights make non-visual balance updates constant time per ancestor. Snapshot creation and displayed balance computations are additional visualization work.

## Red-Black Tree

Source key: `redblack`.

A BST with a black root, black NIL leaves, no adjacent red nodes, and equal black height on every root-to-NIL path.

Insertion repairs red-parent conflicts. Deleting a black node can create a black deficit; sibling cases use rotations and recoloring until the deficit is discharged or reaches the root.

```text
Begin operation at the root
Compare key; follow child / visit traversal node
Insert leaf or remove node via successor if needed
Inspect ancestors / black deficit after deletion
Rotate to restore balance while preserving order
Recolor Red-Black nodes when required
Return final tree or traversal output
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| O(1) lookup | O(log n) operation | O(log n) operation; O(n) traversal | O(n) nodes; O(log n) traversal stack |

Example: Insert 10,5,1; rotate and recolor to restore a black root and valid black heights.

Advantages: Logarithmic height with efficient ordered updates.

Limitations: Balancing rules are more intricate; intermediate repair states may violate final invariants.

Applications: Ordered maps and sets.

Assumptions: Absent children use a shared black NIL sentinel. Rotation/fix-up paths are iterative; height is at most 2 log₂(n+1).

## Breadth-First Search

Source key: `bfs`.

Explore the reachable graph in layers using a first-in, first-out queue.

Mark nodes discovered when enqueued so each enters the queue once. Parent links reconstruct a path with the fewest edges.

```text
Initialize state; validate graph and start
Select next vertex or lowest-weight edge
Explore outgoing adjacency / test DSU components
Discover, relax, union, or reject a cycle
Continue until frontier or edge list is exhausted
Reconstruct path from predecessor links
Return traversal, path, or minimum spanning forest
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| O(Vᵣ + Eᵣ) | O(Vᵣ + Eᵣ) | O(Vᵣ + Eᵣ) traversal¹ | O(V + E) adjacency; O(V) traversal |

Example: A–B, A–C, B–D: start A visits A,B,C,D.

Advantages: Finds fewest-edge paths in unweighted graphs.

Limitations: Weights are ignored; only the start component is visited.

Applications: Unweighted routing and level exploration.

Assumptions: Vᵣ/Eᵣ are reachable vertices/edges. ¹ Textbook bounds assume an adjacency list; this bounded visualizer scans its edge list for each node, giving O(VE + V²) including array membership/frontier operations, before snapshot costs.

## Depth-First Search

Source key: `dfs`.

Explore reachable nodes using a last-in, first-out stack.

Use explicit stack frames to preserve recursive depth-first order. Discover one child and descend before exploring remaining siblings; backtrack when a frame has no remaining neighbors.

```text
Initialize state; validate graph and start
Select next vertex or lowest-weight edge
Explore outgoing adjacency / test DSU components
Discover, relax, union, or reject a cycle
Continue until frontier or edge list is exhausted
Reconstruct path from predecessor links
Return traversal, path, or minimum spanning forest
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| O(Vᵣ + Eᵣ) | O(Vᵣ + Eᵣ) | O(Vᵣ + Eᵣ) traversal¹ | O(V + E) adjacency; O(V) traversal |

Example: A→B→D is explored along stack candidates rather than BFS layers.

Advantages: Simple reachability exploration without recursive call-stack growth.

Limitations: The discovery path is not guaranteed shortest. Neighbor order affects output.

Applications: Reachability and graph structure exploration.

Assumptions: ¹ Standard adjacency-list bound. This visualizer scans edge lists and uses array membership, O(VE + V²) before snapshot costs. Explicit neighbor cursors preserve recursive DFS order without using the JavaScript call stack.

## Dijkstra’s Shortest Path

Source key: `dijkstra`.

Finalize the unvisited node with smallest tentative distance, then relax outgoing edges.

For nonnegative weights, finalization is safe because a later path cannot improve a smaller finalized distance. Predecessors reconstruct one shortest path; ties keep the earlier predecessor.

```text
Initialize state; validate graph and start
Select next vertex or lowest-weight edge
Explore outgoing adjacency / test DSU components
Discover, relax, union, or reject a cycle
Continue until frontier or edge list is exhausted
Reconstruct path from predecessor links
Return traversal, path, or minimum spanning forest
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| — | — | O(V² log V + VE)¹ | O(V + E) graph; O(V) search state |

Example: A→B=4, A→C=1, C→B=2 gives distance(A,B)=3.

Advantages: Finds weighted shortest paths on directed or undirected nonnegative graphs.

Limitations: Negative edges are rejected; unreachable nodes retain ∞.

Applications: Route planning and weighted network distance.

Assumptions: ¹ This implementation re-sorts remaining finite-distance candidates at each iteration and scans the edge list; it does not use a priority heap. A heap/adjacency implementation has a different bound.

## Kruskal’s Minimum Spanning Forest

Source key: `kruskal`.

Select cheapest edges that join distinct components of an undirected graph.

Sort by weight. A disjoint-set union structure with path compression and union by rank detects cycles. Process all edges to cover disconnected components.

```text
Initialize state; validate graph and start
Select next vertex or lowest-weight edge
Explore outgoing adjacency / test DSU components
Discover, relax, union, or reject a cycle
Continue until frontier or edge list is exhausted
Reconstruct path from predecessor links
Return traversal, path, or minimum spanning forest
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| — | — | O(E log E + (V+E) α(V)) | O(V + E) |

Example: Edges A–B=1, B–C=2, A–C=5 select the first two; total 3.

Advantages: Handles disconnected graphs, negative weights, and parallel edges.

Limitations: Directed graphs are rejected. A forest is not a shortest-path tree.

Applications: Connecting networks with minimum total edge cost.

Assumptions: α is the inverse Ackermann function from DSU operations. Self-loops are rejected as cycles.

## Naive String Matching

Source key: `naive`.

Try the pattern at every possible text alignment.

Compare characters from left to right; after a mismatch or a full match, shift by one. Overlapping matches are retained.

```text
Initialize all alignment positions
At each alignment compare text[i+j] to pattern[j]
On mismatch stop this alignment
On full match record alignment
Advance alignment by one
Repeat through last valid alignment
Return all matching positions
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| Θ(n−m+1) for nonempty m≤n | Input/alphabet dependent | O(nm) | O(1) extra, excluding matches |

Example: ABABA with ABA matches at positions 0 and 2.

Advantages: Simple, with no preprocessing.

Limitations: Repeats comparisons on repetitive text.

Applications: Short patterns and a baseline for KMP.

Assumptions: n and m count Unicode code points. Empty pattern matches all n+1 boundaries. Output space is O(number of matches).

## Knuth–Morris–Pratt

Source key: `kmp`.

Use longest proper prefix/suffix information to skip redundant pattern comparisons.

Build LPS using fallback links. During search, mismatches move the pattern cursor to LPS[j−1] without rewinding the text cursor. After a match, fall back to permit overlaps.

```text
Initialize LPS and cursors
Preprocess: compare pattern[i] and pattern[len]
If equal extend prefix; otherwise fall back via LPS
Search: compare text[i] and pattern[j]
Mismatch: fall back via LPS or advance text at j=0
Full match: record i−m; j = LPS[m−1]
Return all matches
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| O(n+m) | O(n+m) | O(n+m) | O(m) excluding matches |

Example: ABA has LPS [0,0,1]; ABABA matches at 0 and 2.

Advantages: Linear worst-case matching, even on repetitive inputs.

Limitations: Requires preprocessing and careful indexing.

Applications: Repeated-pattern text search.

Assumptions: Indices refer to Unicode code points, not UTF-16 offsets. Empty pattern matches every boundary; output space is additional.

## Activity Selection

Source key: `activity`.

Choose a maximum-size subset of non-overlapping activities on one resource.

Sort by finish time. Select an activity when its start is at least the finish of the last selected activity. This leaves the most room for the remaining schedule.

```text
Sort activities by finish time
Read the next activity
If start ≥ lastFinish, select and update lastFinish
Otherwise reject overlapping activity
Continue through sorted activities
Report selected IDs
Return maximum-size compatible schedule
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| — | — | O(n log n) | O(n) sorted copy and result |

Example: [0,2), [1,4), [2,3) selects the first and third.

Advantages: A local earliest-finish choice gives an optimal number of activities.

Limitations: Does not optimize profit or weighted activities.

Applications: Single-resource interval scheduling.

Assumptions: Intervals are half-open and require finish > start. Finish ties use input ID.

## Fractional Knapsack

Source key: `fractional`.

Maximize value when each positive-weight item can be divided.

Take items in decreasing value/weight ratio, using a fraction of the first item that does not fit. Unlike 0/1 knapsack, splitting is allowed.

```text
Sort by decreasing value/weight
Read next item
Take min(1, remainingCapacity/weight)
Update capacity and accumulated value
Stop taking when capacity is exhausted
Report fractions for original items
Return total value
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| — | — | O(n log n) | O(n) |

Example: Weight 10/value 60 and weight 20/value 100, capacity 20 gives value 110.

Advantages: Optimal divisible selection using a simple greedy rule.

Limitations: Not correct for indivisible 0/1 items; nonpositive weights are rejected.

Applications: Divisible resource allocation.

Assumptions: Weights are positive; values and capacity are nonnegative, finite numbers. Floating-point values may have rounding error.

## Huffman Coding

Source key: `huffman`.

Build a binary prefix code by repeatedly merging the two least frequent symbols or subtrees.

Use 0 for a left edge and 1 for a right edge. Leaf paths are codes; no leaf is an ancestor of another, so no code prefixes another.

```text
Count symbols or read positive frequencies
Sort the priority queue by frequency
Remove the two least frequent nodes
Join them; reinsert their summed parent
Repeat until one tree remains
Assign leaf codes; a singleton uses 0
Return codebook and weighted bit length
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| — | — | O(k² log k + n + B)¹ | O(k² + n + B), including codebook/output |

Example: Frequencies A:5, B:2, C:1 merge C+B, then merge with A.

Advantages: Optimal weighted code length among binary prefix codes for fixed symbol frequencies.

Limitations: The decoder also needs the codebook. Frequency distribution affects compression; not all text compresses.

Applications: Entropy coding and compression.

Assumptions: k distinct symbols, n text length, B output bits. Code strings can total O(k²) characters. ¹ The small teaching priority queue is a sorted array, re-sorted per merge, rather than a binary heap. Custom-frequency mode reports weighted bit length; text mode also encodes the supplied text.

## 0/1 Knapsack

Source key: `knapsack`.

Choose indivisible items of maximum value without exceeding integer capacity.

For each item and capacity, compare exclusion with inclusion from the previous row. Trace backward through the DP table to reconstruct selected items.

```text
Initialize row 0 and capacity 0 to zero
For each item i and capacity c
Compute exclude = dp[i−1][c]
If item fits, include = value + dp[i−1][c−weight]
Set dp[i][c] = max(exclude, include)
Backtrack changes between adjacent rows
Return optimum and selected item IDs
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| Θ(nC) | Θ(nC) | Θ(nC) | Θ(nC) |

Example: (w=2,v=3),(w=3,v=4), capacity 3 selects the second item.

Advantages: Finds the optimum when greedy ratios can fail.

Limitations: Pseudo-polynomial in capacity C; items cannot be divided.

Applications: Budgeted selection of indivisible resources.

Assumptions: n items, C integer capacity; positive integer weights and nonnegative values. Ties choose exclusion during reconstruction.

## Longest Common Subsequence

Source key: `lcs`.

Find a longest sequence appearing in both strings in the same order, possibly with gaps.

Equal characters extend a diagonal subsequence; unequal characters take the larger of upper and left cells. Backtrack to recover one optimum.

```text
Initialize empty-prefix row and column to zero
For each pair of prefixes (i,j)
If characters match: 1 + dp[i−1][j−1]
Otherwise max(dp[i−1][j], dp[i][j−1])
Store the chosen length
Backtrack diagonals for matches, otherwise upper/left
Return one longest common subsequence
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| Θ(nm) | Θ(nm) | Θ(nm) | Θ(nm) |

Example: ABC and AC have LCS AC with length 2.

Advantages: Solves an exponential-choice problem with reusable prefix states.

Limitations: Quadratic table space; multiple optimal subsequences may exist.

Applications: Sequence comparison and change analysis.

Assumptions: n,m count Unicode code points. Ties backtrack upward; other equally long subsequences may also be valid.

## Bubble Sort

Source key: `bubble`.

Repeatedly compare adjacent elements and exchange inverted pairs.

Each pass moves the largest remaining element to the end. Stop early when a pass makes no swaps.

```text
repeat for end = n−1 down to 1; changed = false
  for j = 0 to end−1
    compare A[j] and A[j+1]
    if inverted: swap; changed = true
  mark end final
  if not changed: stop
return A
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| Θ(n) | Θ(n²) | Θ(n²) | O(1) |

Example: [3, 1, 2] → [1, 2, 3]

Advantages: Simple to trace; detects an already sorted array in one pass.

Limitations: Quadratic work makes it unsuitable for large inputs.

Applications: Teaching adjacent exchanges and early termination.

Assumptions: Average cases assume random order of distinct keys; numeric comparisons take constant time. Stable: yes. In-place array storage: yes. Space excludes visualization snapshots and includes recursion. Heap Sort has a linear all-equal best case and n log n distinct-key best case.

## Selection Sort

Source key: `selection`.

Find the smallest remaining element and place it at the next output position.

The prefix is final after each iteration; scan the entire remaining suffix to choose its minimum.

```text
for i = 0 to n−1
  min = i; scan j = i+1 to n−1
  if A[j] < A[min]: min = j
  swap A[i] and A[min] if distinct positions
  mark i final
all positions are final
return A
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| Θ(n²) | Θ(n²) | Θ(n²) | O(1) |

Example: [3, 1, 2] → [1, 2, 3]

Advantages: At most n−1 swaps, even when many comparisons are necessary.

Limitations: Always quadratic comparisons; long swaps can reverse equal keys.

Applications: Small arrays where minimizing swaps matters.

Assumptions: Average cases assume random order of distinct keys; numeric comparisons take constant time. Stable: no. In-place array storage: yes. Space excludes visualization snapshots and includes recursion. Heap Sort has a linear all-equal best case and n log n distinct-key best case.

## Insertion Sort

Source key: `insertion`.

Insert each element into its correct place within a growing sorted prefix.

Hold a key, shift strictly larger elements right, then write the key into the gap. A sorted prefix is not yet globally final.

```text
for i = 1 to n−1
  key = A[i]; j = i−1
  while j ≥ 0 and A[j] > key
    A[j+1] = A[j]; j = j−1
  A[j+1] = key
prefix grows after each iteration
return A
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| Θ(n) | Θ(n²) | Θ(n²) | O(1) |

Example: [3, 1, 2] → [1, 2, 3]

Advantages: Adaptive on nearly sorted inputs; preserves equal-key order.

Limitations: Reverse input requires quadratic shifts.

Applications: Small or nearly sorted arrays; base cases in hybrid sorts.

Assumptions: Average cases assume random order of distinct keys; numeric comparisons take constant time. Stable: yes. In-place array storage: yes. Space excludes visualization snapshots and includes recursion. Heap Sort has a linear all-equal best case and n log n distinct-key best case.

## Merge Sort

Source key: `merge`.

Recursively sort halves, then merge their ordered elements.

Temporary left and right buffers preserve unread values. Choosing the left buffer on ties makes the merge stable.

```text
split [lo, hi) recursively until length < 2
copy sorted halves into left and right buffers
compare the current left and right buffer items
write smaller item (left on tie); advance its cursor
write remaining buffer items
return from this merge
return A
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| Θ(n log n) | Θ(n log n) | Θ(n log n) | O(n) |

Example: [3, 1, 2] → [1, 2, 3]

Advantages: Guaranteed logarithmic recursion depth and n log n work.

Limitations: Requires linear auxiliary buffers in this array implementation.

Applications: Stable sorting; the merge principle also supports external sorting.

Assumptions: Average cases assume random order of distinct keys; numeric comparisons take constant time. Stable: yes. In-place array storage: no. Space excludes visualization snapshots and includes recursion. Heap Sort has a linear all-equal best case and n log n distinct-key best case.

## Quick Sort

Source key: `quick`.

Partition around a pivot and recursively sort the ranges on either side.

This implementation uses the last element as a Lomuto pivot. Values strictly smaller move left; the pivot then takes its final position.

```text
quick(lo, hi): return if empty; mark if singleton
pivot = A[hi]; boundary = lo
for j = lo to hi−1: compare A[j] < pivot
  if smaller: swap A[boundary], A[j]; boundary++
swap A[boundary], A[hi]; mark boundary final
quick(lo, boundary−1); quick(boundary+1, hi)
return A
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| Θ(n log n) | Θ(n log n) | Θ(n²) | O(log n) average; O(n) worst |

Example: [3, 1, 2] → [1, 2, 3]

Advantages: Partitions within the original array and often has good locality.

Limitations: Last-element pivots degrade on sorted, reverse, or all-equal input. Recursion uses stack space.

Applications: General sorting when pivot strategy and worst-case safeguards are chosen carefully.

Assumptions: Average cases assume random order of distinct keys; numeric comparisons take constant time. Stable: no. In-place array storage: yes. Space excludes visualization snapshots and includes recursion. Heap Sort has a linear all-equal best case and n log n distinct-key best case.

## Heap Sort

Source key: `heap`.

Build a max heap and repeatedly move its largest element into the final suffix.

Sift down by comparing a parent with its children, exchanging with the largest child until heap order is restored.

```text
build max heap by sifting internal nodes downward
sift(root, size): repeat
  compare root with each existing child; choose largest
  if child larger: swap and continue; otherwise return
swap maximum with end; mark end final; sift reduced heap
repeat extraction until one element remains
return A
```

| Best | Average | Worst | Working space |
|---|---|---|---|
| Θ(n)¹ | Θ(n log n) | Θ(n log n) | O(1) |

Example: [3, 1, 2] → [1, 2, 3]

Advantages: Worst-case n log n bound without recursive stack or linear buffers.

Limitations: Unstable and often less cache friendly than partition-based sorting.

Applications: Sorting with constant auxiliary algorithm space and a worst-case bound.

Assumptions: Average cases assume random order of distinct keys; numeric comparisons take constant time. Stable: no. In-place array storage: yes. Space excludes visualization snapshots and includes recursion. Heap Sort has a linear all-equal best case and n log n distinct-key best case.

## Background references

Background theory was checked against these teaching sources; their implementation variants can differ from this project.

- [Princeton sorting summary](https://algs4.cs.princeton.edu/cheatsheet/)
- [Princeton heap analysis](https://algs4.cs.princeton.edu/24pq/)
- [Princeton quicksort analysis](https://algs4.cs.princeton.edu/23quicksort/)
- [IISc Red-Black deletion notes](https://gtl.csa.iisc.ac.in/dsa/node117.html)
- [Cornell balanced-tree lecture](https://www.cs.cornell.edu/courses/cs211/2005fa/Lectures/L17-ADT/L17cs211fa05.pdf)
- [MIT dynamic programming subproblems](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/28461a74f81101874a13d9679a40584d_MIT6_006S20_lec16.pdf)
