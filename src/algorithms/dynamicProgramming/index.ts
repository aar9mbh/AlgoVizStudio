import { validateItems, type Item } from "../greedy";
export type DPStep = {
  description: string;
  line: number;
  table: number[][];
  row: number;
  col: number;
  selected: number[];
  result: string;
  path: [number, number][];
};
export function knapsackSteps(items: Item[], capacity: number): DPStep[] {
  validateItems(items, capacity, true);
  const table = Array.from({ length: items.length + 1 }, () =>
      Array(capacity + 1).fill(0),
    ),
    steps: DPStep[] = [],
    selected: number[] = [],
    path: [number, number][] = [];
  const emit = (description: string, line: number, row: number, col: number) =>
    steps.push({
      description,
      line,
      table: table.map((r) => [...r]),
      row,
      col,
      selected: [...selected],
      result: `Value ${table[items.length][capacity]}`,
      path: [...path],
    });
  emit("Initialize empty-item and zero-capacity base cases to zero.", 0, 0, 0);
  for (let i = 1; i <= items.length; i++)
    for (let c = 1; c <= capacity; c++) {
      const item = items[i - 1],
        exclude = table[i - 1][c],
        include =
          item.weight <= c
            ? item.value + table[i - 1][c - item.weight]
            : -Infinity;
      // Previous row prevents using an indivisible item more than once.
      table[i][c] = Math.max(exclude, include);
      emit(
        `dp[${i}][${c}] = max(exclude ${exclude}, include ${include === -Infinity ? "not feasible" : include}) = ${table[i][c]}.`,
        4,
        i,
        c,
      );
    }
  let c = capacity;
  for (let i = items.length; i > 0; i--) {
    path.push([i, c]);
    if (table[i][c] !== table[i - 1][c]) {
      selected.push(items[i - 1].id);
      c -= items[i - 1].weight;
      emit(
        `Reconstruct: select item ${items[i - 1].id}; remaining capacity ${c}.`,
        5,
        i,
        c,
      );
    } else emit(`Reconstruct: exclude item ${items[i - 1].id}.`, 5, i, c);
  }
  emit(
    `Optimal value ${table[items.length][capacity]}; selected items ${selected.join(", ") || "none"}.`,
    6,
    items.length,
    capacity,
  );
  return steps;
}
export function lcsSteps(a: string, b: string): DPStep[] {
  const x = Array.from(a),
    y = Array.from(b);
  if (x.length > 24 || y.length > 24)
    throw new Error("Limit each LCS string to 24 Unicode characters.");
  const table = Array.from({ length: x.length + 1 }, () =>
      Array(y.length + 1).fill(0),
    ),
    steps: DPStep[] = [],
    path: [number, number][] = [],
    output: string[] = [];
  const emit = (description: string, line: number, row: number, col: number) =>
    steps.push({
      description,
      line,
      table: table.map((r) => [...r]),
      row,
      col,
      selected: [],
      result: output.join(""),
      path: [...path],
    });
  emit("Initialize empty-prefix base cases.", 0, 0, 0);
  for (let i = 1; i <= x.length; i++)
    for (let j = 1; j <= y.length; j++) {
      const equal = x[i - 1] === y[j - 1];
      table[i][j] = equal
        ? 1 + table[i - 1][j - 1]
        : Math.max(table[i - 1][j], table[i][j - 1]);
      emit(
        equal
          ? `${x[i - 1]} matches ${y[j - 1]}: 1 + diagonal = ${table[i][j]}.`
          : `${x[i - 1]} ≠ ${y[j - 1]}: max(upper, left) = ${table[i][j]}.`,
        equal ? 2 : 3,
        i,
        j,
      );
    }
  let i = x.length,
    j = y.length;
  while (i > 0 && j > 0) {
    path.push([i, j]);
    if (x[i - 1] === y[j - 1]) {
      output.unshift(x[i - 1]);
      i--;
      j--;
    } else if (table[i - 1][j] >= table[i][j - 1]) i--;
    else j--;
    emit(
      `Backtrack: subsequence reconstructed so far “${output.join("")}”.`,
      5,
      i,
      j,
    );
  }
  emit(
    `LCS length ${table[x.length][y.length]}; one LCS is “${output.join("")}”.`,
    6,
    x.length,
    y.length,
  );
  return steps;
}
