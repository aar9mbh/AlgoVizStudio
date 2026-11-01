# AlgoViz Studio — Viva preparation

Study and demonstrate the actual code, and reproduce the examples yourself.

## Project introduction and motivation

AlgoViz Studio is a browser-local DAA teaching application covering 20 algorithms across sorting, balanced trees, graphs, strings, greedy methods, and dynamic programming. It separates computation from rendering so students can inspect actual intermediate states instead of watching a fixed animation. A separate performance lab measures instrumented sorting computation in a Web Worker.

The project was chosen to connect abstract invariants and complexity analysis with concrete execution states. A student can predict the next comparison, inspect a tree rotation, follow a distance relaxation, or reconstruct a DP solution and explain why the answer is correct.

## Technology explanation

React components render the current execution state. TypeScript describes step records and catches interface mistakes. Vite serves local development and builds static production assets plus the benchmark worker. Tailwind CSS is installed with its Vite integration; custom CSS provides the project's design system. Motion animates sorting bars and dashboard transitions, SVG draws graphs and trees, Recharts plots measured runtime, and Lucide provides icons. Vitest and Testing Library verify algorithms and UI behavior. LocalStorage saves speed, recently visited modules, sorting input, string input, and graph data. No backend or login is needed.

## How the engine works

1. Validate bounded input.
2. An algorithm computes actual events/states without React.
3. The page stores a history and mounts a fresh keyed controller for a new run.
4. `usePlayback` selects an index; its one-shot timer advances it and cleans up on pause, speed change, or unmount.
5. A renderer uses that state's values, highlighted indices, counters, explanation, and pseudocode line.
6. Previous/seek select earlier immutable snapshots; algorithms do not need to run backward.

Tree operations commit their result immediately, while their history is replayable. Starting a new tree operation uses the previous committed final tree. Graph topology edits invalidate old execution; moving a node changes only layout. Benchmark workers terminate on cancel and page unmount.

## Five-minute demonstration

| Time      | Action and explanation                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0:00–0:30 | Open dashboard. Explain the 20 algorithms, local operation, and six learning paths.                                                                                            |
| 0:30–1:25 | Sorting: apply `3,-1,3,0`. Step a comparison and swap; rewind. Compare Bubble with Merge; seek to the final result. Explain counters versus elapsed time.                      |
| 1:25–2:10 | Trees: build AVL sequence `3,2,1`; replay its right rotation. Switch to Red-Black, build a sample, delete a key, and explain recoloring/black height.                          |
| 2:10–2:55 | Graphs: load sample, run Dijkstra A→F; show distance 13 and a shortest path. Switch directed on and choose Kruskal to demonstrate rejection; switch it off and run the forest. |
| 2:55–3:35 | KMP: text ABABA, pattern ABA. Show LPS [0,0,1] and matches [0,2]. Explain overlap and fallback.                                                                                |
| 3:35–4:15 | DP: LCS ABC and AC gives AC. Show one recurrence and reconstruction. Explain why greedy ratios are valid for fractional but not 0/1 knapsack.                                  |
| 4:15–4:50 | Benchmarks: use 50,100,250,500 and 5 trials. Show median chart, counts, and CSV. Mention timing resolution and JIT effects.                                                    |
| 4:50–5:00 | Show tests/documentation and describe bounded inputs and future improvements.                                                                                                  |

Run the app and tests before the viva. Keep the browser open and select examples beforehand to avoid typing delays. Do not present timing values from another machine as universal results.

## Two-minute explanation

“AlgoViz Studio is an interactive DAA explorer with 20 implemented algorithms. I chose it because code and asymptotic formulas alone do not show how an algorithm's state changes. The app lets me enter data, play or pause, step backward and forward, and see the current explanation and pseudocode.

“The main architectural choice is to separate algorithm computation from React rendering. Algorithms generate immutable execution states. A reusable playback hook selects a state, and React or SVG renders it. Rewinding is selecting an earlier snapshot, so it does not corrupt the underlying algorithm. Timers are cleaned up when a run changes or the page unmounts.

“There are six sorting algorithms, three real tree structures with balanced deletion, graph traversal and optimization, Naive and KMP matching, three greedy algorithms, and two DP algorithms. Tree tests check ordering, AVL balance, and Red-Black black height after operations. Knapsack results are also compared with brute force on small inputs.

“The performance lab runs non-recording sorting functions in a Web Worker. Each trial uses identical input copies, includes warm-ups before measurement, rotates execution order, and reports medians using performance.now(). It measures computation with counters, not animation. Browser timing and memory reporting have limitations, which are explained in the interface.

“The application runs locally without a database or login. I can explain the key files, tests, invariants, and tradeoffs.”

## Likely questions and accurate answers

1. **What problem does the project solve?** It makes intermediate algorithm decisions inspectable and connects them to explanations, invariants, and measured sorting behavior.
2. **Why React?** Its declarative rendering maps a selected execution state to UI, while hooks manage playback and page state.
3. **Why TypeScript?** Step interfaces and typed algorithm IDs prevent many mismatches between computation and visualization.
4. **Why no backend?** All computation, rendering, preferences, and exports fit in the browser; no shared database is required.
5. **What is an invariant?** A statement preserved by algorithm steps, such as BST ordering or a sorted prefix in insertion sort.
6. **How does rewind work?** It selects a previous immutable snapshot; it does not invert swaps or rerun partial code.
7. **How do timers avoid continuing after navigation?** Effect cleanup clears the pending timeout, and keyed runs remount the controller.
8. **How is animation speed implemented?** The next event is scheduled after 800/speed milliseconds; it does not alter algorithm results.
9. **What do comparisons count?** Value comparisons, excluding bounds checks and snapshot copying.
10. **What do writes count?** Assignments to the main array; a distinct-position swap contributes two writes. Temporary merge-buffer copies are excluded.
11. **Which sorting algorithms here are stable?** Bubble, Insertion, and Merge; equal-key relative order is tested using element identities.
12. **Why is Selection Sort unstable?** A long minimum swap can move an equal key past another equal key.
13. **Why can Bubble Sort be linear?** The early-exit flag stops after one swap-free pass on already sorted input.
14. **Why is Insertion Sort useful for nearly sorted data?** Few inversions require few shifts, while each iteration extends a sorted prefix.
15. **Why does Merge Sort use O(n) auxiliary space?** It copies subranges into buffers before writing merged output; recursion adds O(log n), dominated by buffers.
16. **Which Quick Sort partition is used?** Last-element Lomuto partition with a strict less-than comparison.
17. **What causes Quick Sort's worst case here?** Repeated one-sided partitions, including sorted and all-equal data under this pivot policy, yield quadratic work.
18. **Is Quick Sort constant-space here?** Array partitioning is in-place, but the visual algorithm has O(log n) average/O(n) worst recursive stack space. Benchmark code uses an explicit stack.
19. **Why can Heap Sort be linear on all-equal keys?** Each sift immediately finds no greater child in this implementation. Distinct-key best cases have n log n comparison growth.
20. **What is BST deletion with two children?** Copy the inorder successor key, then remove the successor, which has at most one child.
21. **What happens to duplicate tree keys?** They are ignored, with an explicit event. The tree acts as a set.
22. **What is the AVL balance factor?** Height(left) minus height(right); valid final states are −1, 0, or 1.
23. **When does AVL need a double rotation?** Left-right or right-left child imbalance requires a child rotation followed by a parent rotation.
24. **Why does a rotation preserve order?** It changes parent-child links while leaving the inorder sequence and each intervening subtree's key interval unchanged.
25. **What are the Red-Black invariants?** Black root and NIL leaves, no red node with a red child, and equal black counts along every node-to-NIL path, plus BST ordering.
26. **Why is a new Red-Black node red?** It preserves path black counts initially, though it may create a red-parent conflict that fix-up repairs.
27. **Why is Red-Black deletion difficult?** Removing a black node can reduce one path's black height; sibling cases propagate or discharge that deficit by rotations and recoloring.
28. **What is the NIL sentinel for?** It represents absent black leaves and carries a parent during deletion repair, avoiding repeated null special cases.
29. **Does an intermediate repair snapshot satisfy final invariants?** Not necessarily; the UI labels this. Invariants are tested after complete operations.
30. **How do BFS and DFS differ?** BFS uses a queue for layered discovery; the app's iterative DFS uses a stack. DFS discovery paths need not be shortest.
31. **Does BFS consider weights?** No. It minimizes edge count, so it is appropriate for unweighted/equal-cost paths.
32. **Why reject negative edges in Dijkstra?** A later path through a negative edge can improve an already finalized distance, invalidating the finalization argument.
33. **Does Dijkstra here use a heap?** No. It sorts candidate vertices and scans the edge list; its implementation-specific bound is documented rather than claiming a heap bound.
34. **What does Kruskal do on disconnected input?** It returns a minimum spanning forest, with one tree per connected component.
35. **What is DSU?** Disjoint-set union tracks connected components. Path compression and union by rank make repeated operations nearly constant amortized time.
36. **Why are negative edges valid in Kruskal?** The cut/cycle reasoning does not require nonnegative weights; it still chooses cheapest cycle-free connecting edges.
37. **What is KMP's LPS entry?** The length of the longest proper prefix of the pattern prefix ending there that is also its suffix.
38. **How does KMP avoid repeated text comparisons?** On mismatch it uses LPS fallback without rewinding the text index, giving linear total work.
39. **How are empty patterns handled?** Both matchers report all n+1 text boundaries. Indices count Unicode code points.
40. **Why is earliest-finish activity selection correct?** An optimal schedule can exchange its first activity for an earliest-finishing compatible one without reducing room for subsequent activities; repeat on the remaining subproblem.
41. **Why do value/weight ratios solve fractional knapsack but not 0/1?** Fractional exchange can replace any lower-ratio portion with higher-ratio material; indivisibility prevents that exchange in 0/1 selection.
42. **Why is Huffman prefix-free?** Codes terminate only at leaves; no leaf path is an ancestor of another leaf path.
43. **What queue does Huffman use here?** A sorted array re-sorted after each merge, so the implementation is O(k² log k), not the O(k log k) heap version.
44. **What is the 0/1 recurrence?** dp[i][c] is max(excluding item i, value[i]+dp[i−1]c−weight[i]]) if it fits; otherwise exclusion.
45. **Why is knapsack pseudo-polynomial?** O(nC) depends on numeric capacity C, not only the number of bits needed to encode C.
46. **What is the LCS recurrence?** Equal final characters use 1+diagonal; unequal ones take max(upper,left). Backtracking recovers one optimum.
47. **Why can different LCS implementations return different strings?** Several subsequences can share the optimal length; tie-breaking selects one. This implementation favors moving upward.
48. **What exactly is benchmarked?** Non-recording instrumented sorting computation, including counter overhead and algorithm allocations, excluding input generation/cloning, snapshots, and animation.
49. **Why median instead of mean?** Median reduces sensitivity to occasional timing outliers; it does not eliminate JIT, timer-resolution, CPU-load, or device effects.
50. **How is benchmark fairness improved?** Same input per trial, independent copies, two warm-ups per algorithm, repeated trials, seeded generation, and rotating execution order.
51. **Why not show measured memory?** Portable standard JavaScript does not provide reliable per-algorithm heap measurements across browsers; the app states theoretical auxiliary space instead.
52. **How do you avoid freezing the UI?** Benchmarks run in a dedicated worker, and visualization histories use explicit input caps.
53. **What tests are most valuable?** Final results against independent oracles, tree invariants after varied operations, valid reconstruction, counter parity, and important UI workflows.
54. **What are the limits of the tests?** They are finite samples, not a formal proof; full cross-browser and assistive-technology audits have not been completed.
55. **What would you improve next?** Adjacency lists/heaps for larger graphs, streamed events, saved inputs for more modules, a heap-based Huffman queue, and broader browser/accessibility coverage.

## Important code to study

- `src/algorithms/trees/index.ts`: rotate, cached AVL heights, Red-Black fixInsert/fixDelete, and sentinel parent handling.
- `src/algorithms/sorting/index.ts`: actual trace recorder and operation definitions.
- `src/algorithms/graphs/index.ts`: DSU, predecessor links, and validation assumptions.
- `src/algorithms/strings/index.ts`: LPS construction and non-rewinding search.
- `src/algorithms/greedy/index.ts`: selection rules and prefix-code construction.
- `src/algorithms/dynamicProgramming/index.ts`: recurrence and reconstruction.
- `src/hooks/usePlayback.ts`: single timer and lifecycle cleanup.
- `src/utils/benchmark.ts`, `src/workers/benchmark.worker.ts`: independent measurement path and fairness.
- `src/tests/trees.test.ts`, `learning.test.ts`, `benchmark.test.ts`, and `modules.test.tsx`: correctness evidence.

See ALGORITHMS.md for all 20 algorithms and TESTING.md for actual final results. Rehearse the examples yourself; the ability to explain assumptions matters more than memorizing labels.
