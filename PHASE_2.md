# Phase 2 — Sorting

## Implemented

Six ascending sorts generate actual immutable event histories: optimized Bubble, Selection, stable Insertion, stable top-down Merge, last-pivot Lomuto Quick, and iterative-sift Heap Sort. No native array sort is used for the implementations. Tests use native numeric sort as an independent correctness oracle.

The sorting page supports custom input, random sizes 2–40, example loading, duplicate and negative numbers, decimals, empty and singleton arrays, and LocalStorage input restoration. An invalid draft leaves the previous valid execution intact. Applying input or changing either algorithm creates a fresh paused controller, even if the new history has the same event count.

The animated bars, event explanations, pseudocode highlighting, counters, final positions, pivots, and educational sections use the generated states. Insertion and merge can temporarily contain repeated item identities during writes; the chart correctly keys by array position. Negative values use striped bars scaled by magnitude, with signed labels. Large arrays scroll within the chart to preserve readable values.

Comparison mode uses identical initial arrays and one shared transport. Each tick advances one event in each panel, and shorter histories hold their final state. This is a trace comparison, not a runtime comparison. Independent measurements remain Phase 6 work.

## Counter definitions

- Comparison: a numeric value comparison; excludes index and loop-bound checks.
- Swap: exchange of two distinct positions; counts two writes. Self-swaps are skipped.
- Write: one assignment into the main array, including swaps, insertion shifts/key placement, and merge output.
- Temporary buffer copies, local assignments, and visualization snapshots are excluded.

Auxiliary space on the page describes the underlying algorithm, including recursion, not the visualization. Snapshot histories add O(events × n) storage; quadratic traces can therefore require O(n³) snapshot storage. The 40-item limit bounds that cost.

## Files created

- `src/algorithms/sorting/index.ts`: input validation, types, algorithms, trace recorder.
- `src/data/sorting.ts`: pseudocode and educational content for six sorts.
- `src/pages/SortingPage.tsx`: configuration, saved inputs, comparison, shared controller.
- `src/visualizers/SortingStage.tsx`: bars, counters, pseudocode, complexity and lessons.
- `src/tests/sorting.test.tsx`: algorithm, trace, validation, and UI behavior tests.
- `ALGORITHMS.md`: implemented sorting reference.
- `PHASE_2.md`: this handoff.

Modified: `src/App.tsx`, `src/styles.css`, `src/components/PlaybackDemo.tsx`, `src/tests/foundation.test.tsx`, README, ARCHITECTURE, and TESTING. Historical Phase 1 handoff is retained as a record of that phase.

## Manual verification

1. Run `npm run dev`, open the printed URL, and select Sorting.
2. Apply `3, -1, 3, 0`. Next/previous should replay the real states; reset returns the original order.
3. Play, pause, resume, seek to the end, then play again. Switch an algorithm during playback: the new run starts paused.
4. Enable comparison and select Merge versus Bubble. Both start with the same input; both end at `-1, 0, 3, 3`.
5. Apply empty input, one number, all equal values, sorted data, reverse data, and decimal values. Apply `oops` or 41 numbers to check validation.
6. Change random size and generate data. Reload to confirm the applied input and speed persist.
7. Expand each lesson and explain its invariant, pseudocode, stability, complexity, and counter definitions.

## Remaining

Phases 3–8: trees, graphs, strings, greedy, DP, benchmarking, full learning-guide integration, remaining viva/report documentation, screenshots, final browser/accessibility audit. Sorting inputs are intentionally capped; benchmark-scale input support belongs to a separate execution path. No tree work has begun.

## Verified results

Final check on 28 October 2026: 80 tests passed across 2 files; production build passed including TypeScript. Browser smoke check confirmed custom signed input and identical sorted results in Bubble/Merge comparison. See TESTING.md for counts and limits.
