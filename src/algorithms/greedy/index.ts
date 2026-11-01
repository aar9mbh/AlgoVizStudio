export type Activity = { id: number; start: number; finish: number };
export type Item = { id: number; weight: number; value: number };
export type HuffNode = {
  id: number;
  frequency: number;
  symbol?: string;
  left?: HuffNode;
  right?: HuffNode;
};
export type GreedyStep = {
  description: string;
  line: number;
  selected: number[];
  rejected: number[];
  fractions: Record<number, number>;
  total: number;
  remaining: number;
  activities: Activity[];
  items: Item[];
  queue: HuffNode[];
  tree: HuffNode | null;
  codes: Record<string, string>;
  bits: number;
  encoded: string;
};
const state = (): GreedyStep => ({
  description: "Ready",
  line: 0,
  selected: [],
  rejected: [],
  fractions: {},
  total: 0,
  remaining: 0,
  activities: [],
  items: [],
  queue: [],
  tree: null,
  codes: {},
  bits: 0,
  encoded: "",
});
export function activitySteps(activities: Activity[]): GreedyStep[] {
  if (
    activities.length > 20 ||
    activities.some(
      (a) =>
        !Number.isFinite(a.start) ||
        !Number.isFinite(a.finish) ||
        a.finish <= a.start ||
        Math.abs(a.start) > 999 ||
        Math.abs(a.finish) > 999,
    ) ||
    new Set(activities.map((a) => a.id)).size !== activities.length
  )
    throw new Error(
      "Use at most 20 activities with finite times in [−999,999] and finish > start.",
    );
  const s = state(),
    steps: GreedyStep[] = [];
  s.activities = [...activities].sort(
    (a, b) => a.finish - b.finish || a.id - b.id,
  );
  const emit = (d: string, line: number) => {
    steps.push({ ...structuredClone(s), description: d, line });
  };
  emit("Sort by increasing finish time.", 0);
  let finish = -Infinity;
  for (const a of s.activities) {
    emit(`Consider activity ${a.id}: [${a.start}, ${a.finish}).`, 1);
    if (a.start >= finish) {
      s.selected.push(a.id);
      finish = a.finish;
      emit(
        `Select ${a.id}: it does not overlap the last selected activity.`,
        2,
      );
    } else {
      s.rejected.push(a.id);
      emit(`Reject ${a.id}: it overlaps the selected schedule.`, 3);
    }
  }
  emit(`Complete: ${s.selected.length} compatible activities.`, 6);
  return steps;
}
export function validateItems(
  items: Item[],
  capacity: number,
  integer = false,
) {
  if (
    items.length > 12 ||
    new Set(items.map((i) => i.id)).size !== items.length ||
    !Number.isFinite(capacity) ||
    capacity < 0 ||
    capacity > (integer ? 40 : 999) ||
    (integer && !Number.isInteger(capacity)) ||
    items.some(
      (i) =>
        !Number.isFinite(i.weight) ||
        i.weight <= 0 ||
        i.weight > 999 ||
        !Number.isFinite(i.value) ||
        i.value < 0 ||
        i.value > 999 ||
        (integer && !Number.isInteger(i.weight)),
    )
  )
    throw new Error(
      integer
        ? "Use ≤12 items, positive integer weights, nonnegative values ≤999, and integer capacity 0–40."
        : "Use ≤12 items, positive weights ≤999, nonnegative values ≤999, and capacity 0–999.",
    );
}
export function fractionalSteps(items: Item[], capacity: number): GreedyStep[] {
  validateItems(items, capacity);
  const s = state(),
    steps: GreedyStep[] = [];
  s.remaining = capacity;
  s.items = [...items].sort(
    (a, b) => b.value / b.weight - a.value / a.weight || a.id - b.id,
  );
  const emit = (d: string, line: number) =>
    steps.push({ ...structuredClone(s), description: d, line });
  emit("Sort items by descending value-to-weight ratio.", 0);
  for (const item of s.items) {
    emit(`Item ${item.id}: ratio ${(item.value / item.weight).toFixed(3)}.`, 1);
    const fraction = Math.min(1, s.remaining / item.weight);
    s.fractions[item.id] = fraction;
    if (fraction > 0) s.selected.push(item.id);
    s.remaining = Math.max(0, s.remaining - fraction * item.weight);
    s.total += fraction * item.value;
    emit(
      `Take ${(fraction * 100).toFixed(1)}% of item ${item.id}; accumulated value ${s.total.toFixed(3)}.`,
      3,
    );
  }
  emit(`Complete: total value ${s.total.toFixed(3)}.`, 6);
  return steps;
}
export function huffmanSteps(
  text: string,
  custom?: Record<string, number>,
): GreedyStep[] {
  const chars = Array.from(text);
  if (chars.length > 120)
    throw new Error("Limit Huffman text to 120 characters.");
  const frequencies = new Map<string, number>();
  if (custom) Object.entries(custom).forEach(([c, n]) => frequencies.set(c, n));
  else chars.forEach((c) => frequencies.set(c, (frequencies.get(c) ?? 0) + 1));
  if (
    frequencies.size > 24 ||
    [...frequencies].some(
      ([c, n]) =>
        Array.from(c).length !== 1 || !Number.isInteger(n) || n <= 0 || n > 999,
    )
  )
    throw new Error(
      "Use ≤24 distinct symbols with positive integer frequencies ≤999.",
    );
  const s = state(),
    steps: GreedyStep[] = [];
  let id = 0;
  s.queue = [...frequencies].map(([symbol, frequency]) => ({
    id: id++,
    symbol,
    frequency,
  }));
  const sort = () =>
      s.queue.sort((a, b) => a.frequency - b.frequency || a.id - b.id),
    emit = (d: string, line: number) =>
      steps.push({ ...structuredClone(s), description: d, line });
  sort();
  emit("Initialize the priority queue from symbol frequencies.", 0);
  while (s.queue.length > 1) {
    sort();
    emit(
      "The two least frequent nodes are at the front of the priority queue.",
      1,
    );
    const left = s.queue.shift()!,
      right = s.queue.shift()!;
    s.tree = {
      id: id++,
      frequency: left.frequency + right.frequency,
      left,
      right,
    };
    s.queue.push(s.tree);
    sort();
    emit(
      `Merge weights ${left.frequency} and ${right.frequency} into ${s.tree.frequency}.`,
      3,
    );
  }
  s.tree = s.queue[0] ?? null;
  const assign = (n: HuffNode, code: string) => {
    if (n.symbol !== undefined) s.codes[n.symbol] = code || "0";
    else {
      if (n.left) assign(n.left, code + "0");
      if (n.right) assign(n.right, code + "1");
    }
  };
  if (s.tree) assign(s.tree, "");
  s.bits = [...frequencies].reduce(
    (total, [c, n]) => total + n * s.codes[c].length,
    0,
  );
  if (!custom) s.encoded = chars.map((c) => s.codes[c]).join("");
  emit(
    `Complete: ${s.bits} encoded bits; codes are prefix-free. A singleton uses code 0.`,
    6,
  );
  return steps;
}
export function parseRows(text: string): number[][] {
  if (!text.trim()) return [];
  return text
    .trim()
    .split(/\n|;/)
    .filter((row) => row.trim())
    .map((row) => {
      const parts = row.trim().split(/[\s,]+/);
      if (
        parts.length !== 2 ||
        parts.some((x) => !/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(x))
      )
        throw new Error("Enter one pair of numbers per line: first, second.");
      return parts.map(Number);
    });
}
