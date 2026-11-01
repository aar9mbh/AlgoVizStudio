import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { usePlayback } from "../hooks/usePlayback";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { parsePage } from "../data/catalog";

beforeEach(() => {
  localStorage.clear();
  location.hash = "";
});
afterEach(() => vi.useRealTimers());

describe("playback lifecycle", () => {
  it("steps, clamps, rewinds, seeks, and resets", () => {
    const { result } = renderHook(() => usePlayback(3));
    act(() => result.current.previous());
    expect(result.current.index).toBe(0);
    act(() => result.current.next());
    expect(result.current.index).toBe(1);
    act(() => result.current.seek(99));
    expect(result.current.index).toBe(2);
    act(() => result.current.next());
    expect(result.current.index).toBe(2);
    act(() => result.current.reset());
    expect(result.current.index).toBe(0);
  });
  it("plays at the selected speed, pauses, resumes, ends, and replays", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => usePlayback(3, 2));
    act(() => result.current.play());
    act(() => vi.advanceTimersByTime(400));
    expect(result.current.index).toBe(1);
    act(() => result.current.pause());
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.index).toBe(1);
    act(() => result.current.play());
    act(() => vi.advanceTimersByTime(400));
    expect(result.current.index).toBe(2);
    expect(result.current.playing).toBe(false);
    act(() => result.current.play());
    expect(result.current.index).toBe(0);
    expect(result.current.playing).toBe(true);
  });
  it("cleans timers on unmount and safely shrinks histories", () => {
    vi.useFakeTimers();
    const { result, rerender, unmount } = renderHook(
      ({ count }) => usePlayback(count),
      { initialProps: { count: 5 } },
    );
    act(() => result.current.seek(4));
    rerender({ count: 2 });
    expect(result.current.index).toBe(1);
    act(() => result.current.reset());
    act(() => result.current.play());
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not play an empty or single-state history", () => {
    const { result, rerender } = renderHook(({ count }) => usePlayback(count), {
      initialProps: { count: 0 },
    });
    act(() => result.current.play());
    expect(result.current.playing).toBe(false);
    rerender({ count: 1 });
    act(() => result.current.play());
    expect(result.current.playing).toBe(false);
  });
});
describe("preferences and navigation", () => {
  it("validates routes including unknown hashes", () => {
    expect(parsePage("#/graphs")).toBe("graphs");
    expect(parsePage("#bad")).toBe("dashboard");
    expect(parsePage("#__proto__")).toBe("dashboard");
  });
  it("survives corrupt and unavailable storage", () => {
    localStorage.setItem("test", "{bad");
    const valid = (v: unknown): v is number => typeof v === "number";
    const { result } = renderHook(() => useLocalStorage("test", 1, valid));
    expect(result.current[0]).toBe(1);
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    spy.mockRestore();
  });
  it("filters the dashboard and provides an empty-state recovery", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Search algorithm categories"), {
      target: { value: "KMP" },
    });
    expect(
      screen.getByRole("button", { name: /2 algorithms.*String Matching/s }),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search algorithm categories"), {
      target: { value: "not-an-algorithm" },
    });
    expect(screen.getByText("No algorithms found")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Clear search" })[0]);
    expect(screen.queryByText("No algorithms found")).not.toBeInTheDocument();
  });
  it("opens a module, persists the visit, and restores playback speed", () => {
    localStorage.setItem("algoviz.speed", "2");
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Start exploring/ }));
    expect(
      screen.getByRole("heading", { name: /Sorting Visualizer/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Sorting configuration" }),
    ).toBeInTheDocument();
    expect(localStorage.getItem("algoviz.recent")).toBe('"sorting"');
    expect(screen.getByLabelText("Animation speed")).toHaveValue("2");
  });
});
