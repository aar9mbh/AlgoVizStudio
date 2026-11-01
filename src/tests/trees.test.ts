import { describe, expect, it } from "vitest";
import { TreeEngine, type TreeKind, type TreeView } from "../algorithms/trees";
function verify(
  tree: TreeView | null,
  kind: TreeKind,
  lo = -Infinity,
  hi = Infinity,
): { height: number; black: number } {
  if (!tree) return { height: 0, black: 1 };
  expect(tree.value).toBeGreaterThan(lo);
  expect(tree.value).toBeLessThan(hi);
  const left = verify(tree.left, kind, lo, tree.value),
    right = verify(tree.right, kind, tree.value, hi);
  expect(tree.balance).toBe(left.height - right.height);
  if (kind === "avl") expect(Math.abs(tree.balance)).toBeLessThanOrEqual(1);
  if (kind === "redblack") {
    expect(left.black).toBe(right.black);
    if (tree.color === "red") {
      expect(tree.left?.color ?? "black").toBe("black");
      expect(tree.right?.color ?? "black").toBe("black");
    }
  }
  return {
    height: 1 + Math.max(left.height, right.height),
    black: left.black + (tree.color === "black" ? 1 : 0),
  };
}
describe.each(["bst", "avl", "redblack"] as const)("%s invariants", (kind) => {
  it("preserves invariants under interleaved insertions and deletions", () => {
    const engine = new TreeEngine(kind),
      expected = new Set<number>();
    let seed = 61;
    for (let i = 0; i < 600; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const value = (seed >>> 4) % 30;
      if (seed % 3 === 0) {
        engine.delete(value);
        expected.delete(value);
      } else {
        engine.insert(value);
        expected.add(value);
      }
      verify(engine.snapshot(), kind);
      expect(engine.values()).toEqual([...expected].sort((a, b) => a - b));
      if (kind === "redblack" && engine.snapshot())
        expect(engine.snapshot()!.color).toBe("black");
    }
  });
  it("handles ordered, reverse, zigzag, and seeded insertion/deletion schedules", () => {
    let seed = 817;
    for (let trial = 0; trial < 45; trial++) {
      const engine = new TreeEngine(kind),
        expected = new Set<number>();
      let values = Array.from({ length: 25 }, (_, i) => i - 12);
      if (trial === 1) values.reverse();
      if (trial > 1)
        for (let i = values.length - 1; i > 0; i--) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          const j = seed % (i + 1);
          [values[i], values[j]] = [values[j], values[i]];
        }
      for (const value of values) {
        engine.insert(value);
        expected.add(value);
        verify(engine.snapshot(), kind);
        expect(engine.values()).toEqual([...expected].sort((a, b) => a - b));
        if (kind === "redblack") expect(engine.snapshot()!.color).toBe("black");
      }
      for (let i = values.length - 1; i > 0; i--) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const j = seed % (i + 1);
        [values[i], values[j]] = [values[j], values[i]];
      }
      for (const value of values) {
        engine.delete(value);
        expected.delete(value);
        verify(engine.snapshot(), kind);
        expect(engine.values()).toEqual([...expected].sort((a, b) => a - b));
        if (kind === "redblack" && engine.snapshot())
          expect(engine.snapshot()!.color).toBe("black");
      }
      expect(engine.snapshot()).toBeNull();
    }
  });
  it("supports duplicate/missing operations, search and traversals", () => {
    const engine = new TreeEngine(kind);
    [2, 1, 3].forEach((n) => engine.insert(n));
    expect(engine.insert(2).some((s) => s.event === "duplicate")).toBe(true);
    expect(engine.delete(99).some((s) => s.event === "missing")).toBe(true);
    expect(engine.search(3).at(-1)!.description).toBe("Found 3.");
    expect(engine.search(4).at(-1)!.description).toBe("4 was not found.");
    expect(engine.traverse("inorder").at(-1)!.output).toEqual([1, 2, 3]);
    expect(engine.traverse("preorder").at(-1)!.output).toEqual([2, 1, 3]);
    expect(engine.traverse("postorder").at(-1)!.output).toEqual([1, 3, 2]);
    expect(engine.traverse("levelorder").at(-1)!.output).toEqual([2, 1, 3]);
  });
});
it("captures AVL rotations and Red-Black deletion repair events", () => {
  const avl = new TreeEngine("avl");
  avl.insert(3);
  avl.insert(2);
  expect(avl.insert(1).some((s) => s.event === "rotate")).toBe(true);
  const rb = new TreeEngine("redblack");
  [7, 3, 18, 10, 22, 8, 11, 26].forEach((n) => rb.insert(n));
  const history = [...rb.delete(3), ...rb.delete(10)];
  expect(
    history.some((s) => s.event === "rotate" || s.event === "recolor"),
  ).toBe(true);
  verify(rb.snapshot(), "redblack");
});
