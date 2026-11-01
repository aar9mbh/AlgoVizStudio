# Testing — final implementation

## Actual final results — 28 October 2026

| Check | Actual result |
|---|---|
| `npm test` | **114 tests passed, 8 files passed**, 22.62 seconds |
| `npm run build` | **Passed**, including TypeScript and production worker packaging; Vite build 16.57 seconds |
| `npm run docs` | **Passed**, generated reference for all 20 algorithms |
| Production browser check | Lazy-loaded lab rendered and its built worker completed real trials |
| Production CSV export | Downloaded successfully; actual result copied to `artifacts/benchmark-2026-10-28.csv` |
| Responsive smoke check | DP form/playback inspected at 390×844; sidebar opened, navigated, and closed correctly |

Production assets: main JavaScript about 459 kB, deferred performance page about 383 kB, worker about 3 kB, CSS about 34 kB (uncompressed). Final build produced no oversized-chunk warning.

## Repeatable commands

```sh
npm install
npm test
npm run build
npm run preview
```

Use the printed Local URL for browser testing. `npm run dev` serves development. `npm run docs` regenerates the reference; `npm run format` formats source and documentation.

## Automated coverage

| File | Tests | What is checked |
|---|---:|---|
| `foundation.test.tsx` | 8 | Playback boundaries/lifecycle, timer cleanup, route validation, storage failures, search/navigation |
| `sorting.test.tsx` | 72 | Six sorts, edge cases, seeded arrays of length 0–40, stable identities, snapshots, counters, input/UI behavior |
| `trees.test.ts` | 10 | BST order, AVL balance/height, Red-Black root/red-child/black-height rules; 45 insertion/deletion schedules and 600 interleaved operations per tree type; search/traversal/repair events |
| `graphs.test.ts` | 4 | BFS/DFS order, Dijkstra paths, Kruskal/DSU forest, disconnected/directed graphs, zero/negative weights, loops/parallel edges |
| `learning.test.ts` | 8 | Naive/KMP boundaries and oracle, LPS, greedy results, Huffman prefix codes/cost, knapsack brute force, DP reconstruction/Unicode |
| `benchmark.test.ts` | 2 | Non-recording/trace sort output and counter parity, medians, finite actual timings, distributions, validation, CSV |
| `modules.test.tsx` | 6 | Tree operations, graph execution/editing/rejection, KMP overlaps, Huffman encoding, LCS reconstruction |
| `properties.test.ts` | 4 | Dijkstra vs Floyd–Warshall, activity selection vs exhaustive subsets, fractional capacity/value, LCS vs exhaustive subsequences |

Independent oracles reduce the risk of tests merely restating implementation. Tree checks are applied to final committed states; intermediate fix-up snapshots can intentionally violate final invariants.

## Browser evidence

- Sorting custom input and comparison were verified in the earlier phase.
- AVL sequence `3,2,1` reached a three-node balanced tree with height 2.
- KMP ABABA/ABA produced positions 0 and 2.
- The DP table, form, playback, and mobile sidebar were inspected at 390 pixels, with viewport reset afterward.
- Production `#performance` lazy-loaded successfully. Defaults (50,100,250,500; 5 random trials; seed 2026) generated 24 measured result rows. The chart displayed them and CSV export downloaded successfully.
- Small measured medians included zero because of timer resolution; no artificial replacement values were used. The CSV is one session's actual output, not a portable performance claim.

## Failures found and resolved

- An initial AVL height-cache update was in the wrong traversal loop; invariant tests caught it and the rebalance path was corrected.
- A sample Dijkstra expectation assumed a different equal-cost path. The test now reflects the stable first-predecessor tie policy; both routes have cost 13.
- Full integration found a missing JSX handler brace in graph keyboard editing; it was fixed before the final build.
- A high-concurrency test run alongside builds exceeded the default five-second budget in four tests. No assertions failed in that run. The harness now uses two workers and a 30-second timeout for resource-constrained machines; the final clean run passed all 114 tests, with individual heavy cases below three seconds.
- Offline lockfile refresh needed an uncached optional platform package. A registry-backed lockfile-only refresh completed successfully. Package and lockfile version are 1.0.0.
- Development reloads briefly interrupted browser checks during formatting/build activity. Final checks used the stable production preview and confirmed built-worker execution/export.

## Limits

No numerical code-coverage percentage was measured. Tests are finite evidence, not formal proofs. Browser smoke checks do not replace exhaustive end-to-end, multi-browser, screen-reader, or accessibility auditing. Screenshot files are not bundled. Pointer dragging, benchmark cancellation under every race, every graph rendering arrangement, and every possible input are not exhaustively automated. Input caps and remaining UI/data-structure tradeoffs are listed in README.md.
