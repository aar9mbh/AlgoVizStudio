# Phases 3–8 handoff

The user authorized all remaining phases together. Earlier phase handoffs remain historical records.

## Phase 3 — Trees

Implemented actual BST, AVL, and classical Red-Black Trees in `src/algorithms/trees/index.ts`. Parent pointers permit rotations to update the whole tree before snapshots. AVL stores heights; Red-Black deletion uses a shared black NIL sentinel and sibling-case repair. UI: `src/pages/TreePage.tsx`, SVG: `src/visualizers/TreeCanvas.tsx`. Duplicate keys are ignored. Insert/delete/search and four traversals have real histories.

Verification: ordering, balance factors, AVL height balance, black root, red-parent rules, and equal Red-Black black heights are checked after operations across 45 insertion/deletion schedules per tree type, plus 600 interleaved operations per type. An initial height-cache error was found and fixed. UI build/delete/search/traverse tests pass in the targeted run.

Manual: build AVL `3,2,1`, replay rotation, delete root 2, traverse inorder. Switch to Red-Black, build a sequence, delete nodes, and inspect repair events. Empty/singleton/duplicate/missing cases are handled.

## Phase 4 — Graphs

`src/algorithms/graphs/index.ts` implements BFS, stack-frame DFS, Dijkstra, and Kruskal with path-compressed/ranked DSU. `src/pages/GraphPage.tsx` provides persistent graph editing, weighted directed/undirected edges, topology editing, pointer dragging, and keyboard node movement. Snapshots show frontier, visited order, distances, path, selected/rejected edges, and forest weight. Negative Dijkstra edges and directed Kruskal input are explicitly rejected.

Verification covers paths, directed reachability, zero/negative weights, disconnected forests, loops, parallel edges, and graph editing. A sample graph has two equal-cost shortest routes; tie behavior is documented. Additional seeded Dijkstra results are compared with Floyd–Warshall.

Manual: load sample; run Dijkstra A→F (distance 13); set directed mode and check Kruskal rejection; switch back and inspect total forest weight 13. Add a disconnected node, regenerate Kruskal, and confirm the component count increases.

## Phase 5 — Strings, Greedy, DP

Algorithm modules: `src/algorithms/strings/index.ts`, `greedy/index.ts`, `dynamicProgramming/index.ts`. Pages: `StringPage.tsx`, `GreedyPage.tsx`, `DPPage.tsx`.

Naive/KMP provide character comparisons, LPS preprocessing, mismatch fallbacks, overlap matches, and empty-pattern boundaries. Activity selection shows sorted intervals and decisions. Fractional knapsack shows ratios/fractions/value. Huffman shows queue merges, tree, codebook, and bit length, supporting text or frequency JSON. Knapsack and LCS fill actual DP tables and reconstruct optimal answers.

Verification includes KMP versus an independent matching oracle, Huffman prefix-free codes and known costs, greedy schedule cardinality versus exhaustive subsets, fractional capacity/value checks, knapsack versus brute force, and LCS versus exhaustive subsequences. UI tests cover KMP, Huffman, and LCS workflows.

Manual: ABABA/ABA → matches 0,2; Huffman A:5,B:2,C:1 → 11 bits; fractional (10,60),(20,100) with capacity 20 → 110; LCS ABC/AC → AC. Apply invalid weights/capacities/frequencies to check messages.

## Phase 6 — Performance Lab

`src/utils/benchmark.ts`, `src/workers/benchmark.worker.ts`, `src/pages/PerformancePage.tsx` implement six independent non-recording instrumented sorts, repeated seeded trials, identical copies per trial, warm-ups, rotated order, median runtime/counts, Recharts, CSV, cancellation, and worker cleanup. Timing uses performance.now() and excludes generation/cloning, traces, and animation. Results are never prefilled.

Verification: benchmark algorithms agree with trace algorithms on output and counters; medians, distributions, validation, finite actual timings, and CSV serialization are tested. A live browser run completed the default 50/100/250/500 sizes with five random trials and seed 2026, populating 24 rows. Some small medians were zero because of timer resolution; they were retained as measured.

Manual: run defaults, inspect chart/table, export CSV; repeat with reverse/nearly input; cancel a longer run and navigate away. Numerical results depend on the machine and session.

## Phase 7 — Education, polish, documentation

`src/data/lessons.ts`, `src/components/LessonPanel.tsx`, `src/pages/GuidePage.tsx` provide all 20 lessons. Documentation: README, ARCHITECTURE, generated ALGORITHMS, TESTING, VIVA_PREPARATION (55 Q&A, two-minute explanation, five-minute demo), and PROJECT_REPORT_OUTLINE. `scripts/generate-algorithm-guide.mjs` regenerates the reference from UI lesson data. Shared forms, canvases, tables, responsive styles, focus outlines, reduced-motion support, and loading/empty/error states were added. Performance charts are lazy-loaded.

## Phase 8 — Final validation

See TESTING.md for final command output, test counts, browser evidence, and remaining verification limits. Tests are not a formal proof, and a full accessibility/cross-browser audit has not been completed. Screenshot files are not bundled. Remaining product limitations are documented in README; no requested algorithm is represented solely by a placeholder UI.

Final verification on 28 October 2026: 114 tests passed across 8 files; production build passed; production worker, chart, and CSV export verified. Actual CSV: artifacts/benchmark-2026-10-28.csv. See TESTING.md for exact results and limits.
