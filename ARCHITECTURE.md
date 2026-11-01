# Architecture

## Source structure

```text
src/
  App.tsx, main.tsx, styles.css        Shell, dashboard, entry, design system
  algorithms/
    sorting/index.ts                  Six pure immutable step generators
    trees/index.ts                    BST/AVL/Red-Black engine
    graphs/index.ts                   BFS/DFS/Dijkstra/Kruskal and DSU
    strings/index.ts                  Naive/KMP and LPS history
    greedy/index.ts                   Activity/fractional/Huffman
    dynamicProgramming/index.ts       Knapsack/LCS and reconstruction
  components/                         PlaybackControls, ExecutionPlayer, LessonPanel,
                                      TreeRepairNotes, ModuleArt, PlaybackDemo
  pages/                              Module forms, execution and page-specific views
  visualizers/                        SortingStage, TreeCanvas
  hooks/                              Playback lifecycle, validated LocalStorage
  data/                               Catalog and educational content
  utils/benchmark.ts                  Independent non-recording instrumented sorts
  workers/benchmark.worker.ts         Worker message adapter
  tests/                              Correctness, properties, invariants, workflows
scripts/generate-algorithm-guide.mjs   Reference generation from lesson data
```

Types are colocated with their algorithms. Page-specific visualizers stay within their page where reuse is unnecessary. Algorithm logic does not import React.

## Data flow

Validated input → algorithm computation → immutable history → playback index → React/SVG rendering + pseudocode/explanation.

Benchmark configuration → worker → non-recording sorts → real medians → chart/table/CSV.

Hash navigation needs no server-side route rewriting. Unknown routes fall back to Dashboard. Page-keyed mounting releases timers/workers on navigation.

## Playback engine

`usePlayback(count,speed)` uses one timeout at a time. Cleanup cancels it on pause, speed/event changes, and unmount. End-of-history pauses; play from the end restarts. Next/previous/seek pause first. Rewind selects an immutable snapshot rather than undoing mutations.

Pages increment a run key for new execution histories, including replacements with the same length. `ExecutionPlayer` supplies shared transport/explanation. Sorting has a wrapper indexing two histories simultaneously; a completed panel holds its final state. Comparison event counts are not elapsed runtime.

## Trees

A TreeEngine instance owns the committed tree. Parent pointers allow rotations to reconnect the live root before recording. AVL caches heights. Red-Black insert/delete use classical parent/uncle/sibling cases and a shared black NIL sentinel with deletion-parent context. Two-child deletion copies the successor key, then removes the successor.

Snapshots copy public node views without cycles and compute displayed balance factors independently of cached heights. Intermediate repair events may violate final invariants; tests check committed states. Duplicates are ignored. Starting another operation while replaying uses the prior committed final tree.

## Graphs and state

Graphs store IDs, layout, weighted edges, and directed mode. Topology edits invalidate old histories; moving nodes changes layout only. BFS uses a queue; DFS uses explicit recursive-equivalent frames and neighbor cursors. Dijkstra sorts candidates and scans edges. Kruskal uses path compression and union by rank. Notes disclose implementation-specific costs rather than claiming a heap-based bound.

Validated LocalStorage persists speed, recent module, sorting/string input, and graphs. Other drafts are session state. Invalid drafts do not replace valid executions. Storage failure does not prevent operation.

## Benchmark isolation

The performance page is lazy-loaded to defer Recharts. A worker runs non-recording numeric sorts with operation counters. Generate one input per size/trial and copy it separately for each algorithm outside the timer. Two warm-ups per algorithm and rotated trial order precede median reporting. Timing uses performance.now() around sorting only; counters and algorithm allocations are included. Cancel/unmount terminates the worker. Results are not hardcoded or persisted. Benchmark Quick Sort uses an explicit stack.

## Memory and education

Full bounded snapshots provide deterministic rewind. Sorting storage is O(events × n); DP stores a table per event. Caps bound these costs. Auxiliary-space labels exclude visualization histories and include core algorithm stack/buffers. No portable measured heap use is claimed.

Lesson data contains definitions, principles, pseudocode, examples, complexities, tradeoffs, applications, and assumptions. Detailed tree repair notes supplement event-level pseudocode. ALGORITHMS.md is generated from lesson data to avoid drift.

## Verification boundaries

Vitest checks results against independent oracles, tree invariants, histories, counters, and UI workflows. The production build checks TypeScript and worker packaging. Browser smoke checks exercise rendering and real worker integration. These are finite evidence, not formal proofs or complete cross-browser/accessibility certification.
