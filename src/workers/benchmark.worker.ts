import { runBenchmark, type BenchmarkConfig } from "../utils/benchmark";
self.onmessage = (event: MessageEvent<BenchmarkConfig>) => {
  try {
    const rows = runBenchmark(event.data, (done, total) =>
      self.postMessage({ type: "progress", done, total }),
    );
    self.postMessage({ type: "result", rows });
  } catch (err) {
    self.postMessage({ type: "error", message: (err as Error).message });
  }
};
