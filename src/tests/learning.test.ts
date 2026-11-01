import { expect, it } from "vitest";
import { stringSteps } from "../algorithms/strings";
import {
  activitySteps,
  fractionalSteps,
  huffmanSteps,
  parseRows,
} from "../algorithms/greedy";
import { knapsackSteps, lcsSteps } from "../algorithms/dynamicProgramming";
it("Naive and KMP find all overlaps, empty patterns, unicode and absent matches", () => {
  for (const algorithm of ["naive", "kmp"] as const)
    for (const [text, pattern, expected] of [
      ["ABABA", "ABA", [0, 2]],
      ["aaaa", "aa", [0, 1, 2]],
      ["", "", [0]],
      ["abc", "", [0, 1, 2, 3]],
      ["", "a", []],
      ["a", "long", []],
      ["abc", "x", []],
      ["😀a😀", "😀", [0, 2]],
    ] as [string, string, number[]][]) {
      expect(stringSteps(text, pattern, algorithm).at(-1)!.matches).toEqual(
        expected,
      );
    }
  const steps = stringSteps("ABABABC", "ABABC", "kmp");
  expect(steps.at(-1)!.lps).toEqual([0, 0, 1, 2, 0]);
  expect(steps.some((s) => s.phase === "lps")).toBe(true);
});
it("KMP agrees with an independent oracle on all short binary strings", () => {
  const words = [
    "",
    ...Array.from({ length: 63 }, (_, i) => (i + 1).toString(2).slice(1)),
  ];
  for (const text of words)
    for (const pattern of words.filter((p) => p.length <= 3)) {
      const expected = Array.from(
        { length: text.length + 1 },
        (_, i) => i,
      ).filter((i) => text.startsWith(pattern, i));
      expect(stringSteps(text, pattern, "kmp").at(-1)!.matches).toEqual(
        expected,
      );
    }
});
it("selects optimal compatible activities and handles an empty schedule", () => {
  const activities = parseRows("0,2; 1,4; 2,3; 3,5").map(
    ([start, finish], id) => ({ start, finish, id }),
  );
  expect(activitySteps(activities).at(-1)!.selected).toEqual([0, 2, 3]);
  expect(activitySteps([]).at(-1)!.selected).toEqual([]);
  expect(() => activitySteps([{ id: 0, start: 2, finish: 1 }])).toThrow();
});
it("fractional knapsack takes actual fractions and rejects invalid weights", () => {
  const result = fractionalSteps(
    [
      { id: 1, weight: 10, value: 60 },
      { id: 2, weight: 20, value: 100 },
    ],
    20,
  ).at(-1)!;
  expect(result.total).toBe(110);
  expect(result.fractions[2]).toBe(0.5);
  expect(() => fractionalSteps([{ id: 1, weight: 0, value: 1 }], 1)).toThrow();
  expect(() => fractionalSteps([], NaN)).toThrow();
  expect(fractionalSteps([], 0).at(-1)!.total).toBe(0);
});
it("Huffman builds prefix-free codes with known optimal weighted length", () => {
  const result = huffmanSteps("", { A: 5, B: 2, C: 1 }).at(-1)!;
  expect(result.bits).toBe(11);
  const codes = Object.values(result.codes);
  for (const a of codes)
    for (const b of codes) if (a !== b) expect(b.startsWith(a)).toBe(false);
  expect(huffmanSteps("aaaa").at(-1)!).toMatchObject({
    codes: { a: "0" },
    bits: 4,
    encoded: "0000",
  });
  expect(huffmanSteps("").at(-1)!.bits).toBe(0);
  expect(() => huffmanSteps("", { a: -1 })).toThrow();
});
it("0/1 knapsack reconstructs an optimum and does not reuse items", () => {
  const items = [
    { id: 1, weight: 2, value: 3 },
    { id: 2, weight: 3, value: 4 },
    { id: 3, weight: 4, value: 5 },
  ];
  const result = knapsackSteps(items, 5).at(-1)!;
  expect(result.table[3][5]).toBe(7);
  expect(result.selected.sort()).toEqual([1, 2]);
  expect(
    knapsackSteps([{ id: 1, weight: 2, value: 3 }], 4).at(-1)!.table[1][4],
  ).toBe(3);
  expect(knapsackSteps([], 0).at(-1)!.selected).toEqual([]);
  expect(() => knapsackSteps(items, 1.5)).toThrow();
});
it("LCS fills the recurrence and reconstructs a valid optimal subsequence", () => {
  const result = lcsSteps("ABCBDAB", "BDCABA").at(-1)!;
  expect(result.result.length).toBe(4);
  expect(result.table[7][6]).toBe(4);
  const subsequence = (sub: string, text: string) => {
    let i = 0;
    for (const c of text) if (c === sub[i]) i++;
    return i === sub.length;
  };
  expect(subsequence(result.result, "ABCBDAB")).toBe(true);
  expect(subsequence(result.result, "BDCABA")).toBe(true);
  expect(lcsSteps("", "abc").at(-1)!.result).toBe("");
  expect(lcsSteps("😀a", "😀b").at(-1)!.result).toBe("😀");
});
it("DP optimal values agree with brute force on seeded small knapsack cases", () => {
  let seed = 12;
  for (let trial = 0; trial < 40; trial++) {
    const items = Array.from({ length: 6 }, (_, id) => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return { id, weight: 1 + (seed % 6), value: seed % 15 };
    });
    let best = 0;
    for (let mask = 0; mask < 64; mask++) {
      let weight = 0,
        value = 0;
      items.forEach((item, i) => {
        if (mask & (1 << i)) {
          weight += item.weight;
          value += item.value;
        }
      });
      if (weight <= 9) best = Math.max(best, value);
    }
    expect(knapsackSteps(items, 9).at(-1)!.table[6][9]).toBe(best);
  }
});
