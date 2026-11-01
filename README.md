# AlgoViz Studio

**Interactive Algorithm Explorer & Performance Lab** — an original browser-local DAA project with 20 implemented algorithms.

## Install and run

Install Node.js 22.12+ (or a compatible current LTS) with npm. In this folder:

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite, normally http://127.0.0.1:5173. Vite chooses the next port if occupied. Installation needs network access; the installed app needs no account, paid API, backend, remote fonts, or database. Use an HTTP server, not a file URL.

```sh
npm test
npm run build
npm run preview
```

Build checks TypeScript and writes static assets plus a benchmark worker to `dist/`. Preview serves that production bundle. Use `npm ci` with the included lockfile for reproducible installation. On Windows, reopen your terminal after installing Node if npm is not on PATH; this machine also supports PowerShell invocation via `& 'C:\Program Files\nodejs\npm.cmd' run dev`.

## Features

- Responsive dark dashboard, searchable categories, nine navigation destinations, hash links, and learning guide.
- Sorting: Bubble, Selection, Insertion, Merge, Quick, Heap; real histories, custom/random signed arrays, counters, pseudocode, stability/space lessons, and comparison.
- Trees: BST, AVL, Red-Black; insert/delete/search, four traversals, duplicate policy, height/balance/colors, rotations, recoloring, and deletion repair.
- Graphs: editable directed/undirected weighted graphs, pointer dragging and keyboard node movement, BFS queue, DFS frame stack, Dijkstra distances/path, Kruskal DSU and forest weight.
- Strings: Naive and KMP with character comparisons, LPS preprocessing, fallbacks, overlap matches, empty boundaries, and Unicode code-point indexing.
- Greedy: Activity Selection timeline, Fractional Knapsack ratios/fractions/value, Huffman queue/tree/codes/bit length from text or custom frequency JSON.
- DP: 0/1 Knapsack and LCS table filling, recurrence explanations, and reconstruction.
- Performance: independent instrumented sorts in a worker; seeded distributions, warm-ups, repeated trials, medians, Recharts, cancellation, and CSV.
- Shared play/pause/resume, previous/next, seek/reset/speed; LocalStorage preferences and selected inputs.

## Stack

React, TypeScript, Vite, Tailwind CSS v4 integration with custom component CSS, Motion, SVG, lazy-loaded Recharts, Lucide, Vitest, Testing Library, and LocalStorage.

## Manual walkthrough

1. Search Dashboard for KMP, then an unknown phrase; clear the empty state.
2. Sorting: apply `3,-1,3,0`, play/rewind, compare Bubble and Merge, seek to `-1,0,3,3`. Try empty, singleton, duplicate, reverse, decimal, and invalid input.
3. Trees: build AVL `3,2,1`; replay its right rotation. Delete 2, traverse inorder, then switch to Red-Black and inspect repair events.
4. Graphs: load sample; Dijkstra A→F has distance 13. Directed Kruskal is rejected. Undirected Kruskal has weight 13; add an isolated node for a forest.
5. Strings: ABABA/ABA yields matches 0,2 and LPS [0,0,1]. Try an empty pattern and no match.
6. Greedy: Huffman frequency JSON `{"A":5,"B":2,"C":1}` gives 11 weighted bits. Fractional items `10,60;20,100`, capacity 20, give value 110.
7. DP: LCS ABC/AC reconstructs AC. 0/1 items `2,3;3,4`, capacity 3, select item 2.
8. Performance: run defaults, inspect chart/table, export CSV, change distribution, and test cancel. Small actual medians may be zero at browser timer resolution.
9. Navigate away while playing; return to a paused run. Reload to confirm saved inputs/speed.
10. Narrow the window and use keyboard controls. Full cross-browser and accessibility auditing remains future work.

## Persistence

Speed, recent module, sorting input, string input, and graph topology/layout are stored locally. Other module drafts are session-only. Corrupt/blocked storage falls back to defaults or session state. No cloud synchronization is used.

## Known limits

- Trace caps: sorting 40 values in [−999,999]; trees 31 unique integers; graph 16 nodes/80 edges; text 120/pattern 30 code points; activities 20; items 12; Huffman 24 symbols; LCS 24×24; DP capacity 40.
- Benchmark caps: 1–6 sizes from 2–2000 and 1–9 trials. Timing includes counter overhead, excludes preparation/animation, and depends on browser/device/JIT/timer resolution.
- Space figures describe underlying algorithms, including stacks/buffers, not stored trace snapshots or measured JavaScript heap use.
- Graphs scan edge lists; Dijkstra sorts candidates. Huffman uses a sorted-array queue. Learning notes disclose implementation-specific bounds.
- Parallel graph edges can overlap visually; the edge list exposes each for individual removal. Self-loops are supported. String matching is case-sensitive without normalization.
- Negative bars show magnitudes with signed labels and striped fills. Large charts/tables scroll.
- Tree operations commit final results before replay; a new operation uses the committed tree. Intermediate repair states may violate final invariants.
- Topology edits invalidate graph traces; moving nodes only changes layout. BFS/DFS visit the start component. DFS is not a shortest-path algorithm.
- No formal correctness proof, full multi-browser certification, or completed assistive-technology audit is claimed.

## Screenshots

Browser views were visually inspected. No screenshot files are bundled. Capture actual screenshots from your local app for the report, labeling input and execution state; do not substitute mockups.

An actual production-browser benchmark export is included at [artifacts/benchmark-2026-10-28.csv](artifacts/benchmark-2026-10-28.csv). It records one session's measured results, not universal timing claims. Final verification: 114 tests passed across 8 files; production build passed. See TESTING.md for methodology and limits.

## Documentation

[ARCHITECTURE.md](ARCHITECTURE.md), [ALGORITHMS.md](ALGORITHMS.md), [TESTING.md](TESTING.md), [VIVA_PREPARATION.md](VIVA_PREPARATION.md), [PROJECT_REPORT_OUTLINE.md](PROJECT_REPORT_OUTLINE.md), and [PHASES_3_TO_8.md](PHASES_3_TO_8.md). Earlier phase handoffs are historical records.

Regenerate algorithm reference from UI lesson data using `node scripts/generate-algorithm-guide.mjs`.
