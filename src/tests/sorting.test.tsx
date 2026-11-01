import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { generateSortSteps, parseArray, sortIds } from "../algorithms/sorting";
import { SortingPage } from "../pages/SortingPage";

const cases = [
  [],
  [1],
  [2, 2, 2],
  [1, 2, 3, 4],
  [5, 4, 3, 2, 1],
  [-5, 0, -1, 2, -5],
  [0.1, -0.5, 0, 2.4],
  [3, 1, 2, 1, 3, 2],
];
describe.each(sortIds)("%s execution history", (id) => {
  it.each(cases.map((input, i) => ({ input, label: i })))(
    "sorts case $label without mutating input",
    ({ input }) => {
      const copy = [...input];
      const steps = generateSortSteps(id, input);
      const final = steps.at(-1)!;
      expect(input).toEqual(copy);
      expect(final.items.map((x) => x.value)).toEqual(
        [...input].sort((a, b) => a - b),
      );
      expect(final.items.map((x) => x.id).sort((a, b) => a - b)).toEqual(
        input.map((_, i) => i),
      );
      expect(final.event).toBe("done");
      expect(final.sorted.length).toBe(input.length);
      let comparisons = 0,
        swaps = 0,
        writes = 0;
      steps.forEach((step, i) => {
        expect(step.active.every((j) => j >= 0 && j < input.length)).toBe(true);
        expect(step.line).toBeGreaterThanOrEqual(0);
        expect(step.line).toBeLessThan(7);
        if (step.event === "compare") comparisons++;
        if (step.event === "swap") {
          swaps++;
          writes += 2;
        }
        if (step.event === "write") writes++;
        expect([step.comparisons, step.swaps, step.writes]).toEqual([
          comparisons,
          swaps,
          writes,
        ]);
        if (i > 0 && step.event !== "swap" && step.event !== "write")
          expect(step.items).toEqual(steps[i - 1].items);
        step.sorted.forEach((j) =>
          expect(step.items[j].value).toBe(final.items[j].value),
        );
      });
    },
  );
  it("sorts seeded duplicate-heavy arrays across varied sizes", () => {
    let seed = 718;
    for (let n = 0; n <= 40; n++) {
      const values = Array.from({ length: n }, () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return (seed % 21) - 10;
      });
      const final = generateSortSteps(id, values).at(-1)!;
      expect(final.items.map((x) => x.value)).toEqual(
        [...values].sort((a, b) => a - b),
      );
    }
  });
});
describe("algorithm-specific properties", () => {
  it.each(["bubble", "insertion", "merge"] as const)(
    "%s preserves relative identity of equal elements",
    (id) => {
      const items = generateSortSteps(id, [2, 1, 2, 1, 2, 1]).at(-1)!.items;
      expect(items.filter((x) => x.value === 1).map((x) => x.id)).toEqual([
        1, 3, 5,
      ]);
      expect(items.filter((x) => x.value === 2).map((x) => x.id)).toEqual([
        0, 2, 4,
      ]);
    },
  );
  it("records actual exchanges and main-array writes", () => {
    expect(generateSortSteps("bubble", [2, 1]).at(-1)).toMatchObject({
      comparisons: 1,
      swaps: 1,
      writes: 2,
    });
    expect(generateSortSteps("selection", [3, 2, 1]).at(-1)).toMatchObject({
      comparisons: 3,
      swaps: 1,
      writes: 2,
    });
    expect(generateSortSteps("insertion", [2, 1]).at(-1)).toMatchObject({
      comparisons: 1,
      swaps: 0,
      writes: 2,
    });
    expect(generateSortSteps("merge", [2, 1]).at(-1)).toMatchObject({
      comparisons: 1,
      swaps: 0,
      writes: 2,
    });
  });
  it("early exits Bubble Sort and captures immutable snapshots", () => {
    expect(generateSortSteps("bubble", [1, 2, 3, 4]).at(-1)!.comparisons).toBe(
      3,
    );
    const steps = generateSortSteps("quick", [3, 2, 1]);
    expect(steps[0].items.map((x) => x.value)).toEqual([3, 2, 1]);
    steps.at(-1)!.items[0].value = 999;
    expect(steps[0].items[0].value).toBe(3);
  });
});
describe("input validation", () => {
  it("accepts empty, signed, decimal, comma and whitespace input", () => {
    expect(parseArray(" ")).toEqual([]);
    expect(parseArray("-3, 2.5 0 +4 .2")).toEqual([-3, 2.5, 0, 4, 0.2]);
  });
  it.each([
    "1, nope",
    "Infinity",
    "NaN",
    "1000",
    "1e999",
    "0x10",
    Array(42).fill("1").join(","),
  ])("rejects invalid input %s", (text) =>
    expect(() => parseArray(text)).toThrow(),
  );
  it("guards direct generator calls", () => {
    expect(() => generateSortSteps("bubble", [NaN])).toThrow();
    expect(() => generateSortSteps("bubble", Array(41).fill(1))).toThrow();
  });
});
describe("sorting interface", () => {
  it("switches all algorithms and supports empty input and bounded random generation", () => {
    localStorage.clear();
    render(<SortingPage speed={1} onSpeed={() => {}} />);
    for (const id of sortIds) {
      fireEvent.change(screen.getByLabelText("Algorithm", { exact: true }), {
        target: { value: id },
      });
      fireEvent.change(screen.getByLabelText("Custom array"), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByText("Apply input"));
      expect(
        screen.getByRole("img", { name: "Array state: empty" }),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Next step"));
      expect(
        screen.getByText("Complete: the empty array is already sorted."),
      ).toBeInTheDocument();
    }
    fireEvent.change(screen.getByLabelText("Random array size"), {
      target: { value: "40" },
    });
    fireEvent.click(screen.getByText("Generate random"));
    const saved = JSON.parse(localStorage.getItem("algoviz.sorting.input")!);
    expect(saved).toHaveLength(40);
    expect(saved.every((n: number) => n >= 0 && n < 100)).toBe(true);
  });
  it("applies input, rewinds, and compares the same initial array", () => {
    localStorage.clear();
    render(<SortingPage speed={1} onSpeed={() => {}} />);
    fireEvent.change(screen.getByLabelText("Custom array"), {
      target: { value: "2, 1" },
    });
    fireEvent.click(screen.getByText("Apply input"));
    expect(
      screen.getByRole("img", { name: "Array state: 2, 1" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Next step"));
    expect(screen.getByText("Compare 2 with 1.")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Next step"));
    expect(
      screen.getByRole("img", { name: "Array state: 1, 2" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Previous step"));
    expect(
      screen.getByRole("img", { name: "Array state: 2, 1" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Compare side by side"));
    expect(
      screen.getAllByRole("img", { name: "Array state: 2, 1" }),
    ).toHaveLength(2);
    fireEvent.change(screen.getByLabelText("Execution step"), {
      target: { value: "999" },
    });
    expect(
      screen.getAllByRole("img", { name: "Array state: 1, 2" }),
    ).toHaveLength(2);
    expect(
      within(
        screen.getByRole("region", { name: "Bubble Sort execution" }),
      ).getByText("Complete"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Reset playback"));
    expect(
      screen.getAllByRole("img", { name: "Array state: 2, 1" }),
    ).toHaveLength(2);
  });
  it("keeps the last valid run on invalid input and persists accepted input", () => {
    localStorage.clear();
    render(<SortingPage speed={1} onSpeed={() => {}} />);
    fireEvent.change(screen.getByLabelText("Custom array"), {
      target: { value: "-2, 0, -2" },
    });
    fireEvent.click(screen.getByText("Apply input"));
    expect(localStorage.getItem("algoviz.sorting.input")).toBe("[-2,0,-2]");
    fireEvent.change(screen.getByLabelText("Custom array"), {
      target: { value: "oops" },
    });
    fireEvent.click(screen.getByText("Apply input"));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Array state: -2, 0, -2" }),
    ).toBeInTheDocument();
  });
  it("replaces an active run with a paused new run even for equal history length", () => {
    vi.useFakeTimers();
    localStorage.clear();
    const view = render(<SortingPage speed={1} onSpeed={() => {}} />);
    fireEvent.click(screen.getByLabelText("Play"));
    act(() => vi.advanceTimersByTime(800));
    fireEvent.click(screen.getByText("Apply input"));
    expect(screen.getByLabelText("Play")).toBeInTheDocument();
    expect(screen.getByLabelText("Execution step")).toHaveValue("0");
    view.unmount();
    vi.useRealTimers();
  });
});
