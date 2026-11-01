export type StringStep = {
  description: string;
  line: number;
  phase: "lps" | "search" | "done";
  i: number;
  j: number;
  offset: number;
  lps: number[];
  matches: number[];
  comparisons: number;
  mismatch: boolean;
};
export function stringSteps(
  text: string,
  pattern: string,
  algorithm: "naive" | "kmp",
): StringStep[] {
  const t = Array.from(text),
    p = Array.from(pattern);
  if (t.length > 120 || p.length > 30)
    throw new Error("Limit text to 120 and pattern to 30 Unicode characters.");
  const steps: StringStep[] = [],
    lps = Array(p.length).fill(0),
    matches: number[] = [];
  let comparisons = 0;
  const emit = (
    description: string,
    line: number,
    phase: StringStep["phase"],
    i: number,
    j: number,
    offset = 0,
    mismatch = false,
  ) =>
    steps.push({
      description,
      line,
      phase,
      i,
      j,
      offset,
      lps: [...lps],
      matches: [...matches],
      comparisons,
      mismatch,
    });
  emit(
    "Initialize matching state. Indices are zero-based Unicode code-point positions.",
    0,
    "search",
    -1,
    -1,
  );
  if (!p.length) {
    matches.push(...Array.from({ length: t.length + 1 }, (_, i) => i));
    emit(
      "Empty pattern matches every boundary, including the final boundary.",
      6,
      "done",
      -1,
      -1,
    );
    return steps;
  }
  if (algorithm === "kmp") {
    let i = 1,
      len = 0;
    while (i < p.length) {
      comparisons++;
      emit(
        `LPS: compare pattern[${i}] (${p[i]}) with pattern[${len}] (${p[len]}).`,
        1,
        "lps",
        i,
        len,
        0,
        p[i] !== p[len],
      );
      if (p[i] === p[len]) {
        len++;
        lps[i] = len;
        emit(
          `Set LPS[${i}] = ${len}: this prefix is also a suffix.`,
          2,
          "lps",
          i,
          len - 1,
        );
        i++;
      } else if (len > 0) {
        len = lps[len - 1];
        emit(
          `Fall back to prefix length ${len}; keep preprocessing index ${i}.`,
          2,
          "lps",
          i,
          len,
        );
      } else {
        lps[i] = 0;
        emit(`No nonempty border: LPS[${i}] = 0.`, 2, "lps", i, 0);
        i++;
      }
    }
    i = 0;
    let j = 0;
    while (i < t.length) {
      comparisons++;
      emit(
        `Compare text[${i}] (${t[i]}) and pattern[${j}] (${p[j]}).`,
        3,
        "search",
        i,
        j,
        i - j,
        t[i] !== p[j],
      );
      if (t[i] === p[j]) {
        i++;
        j++;
        if (j === p.length) {
          matches.push(i - j);
          emit(
            `Match at ${i - j}. Keep overlap using LPS[${j - 1}].`,
            5,
            "search",
            i - 1,
            j - 1,
            i - j,
          );
          j = lps[j - 1];
        }
      } else if (j > 0) {
        j = lps[j - 1];
        emit(
          `Mismatch: pattern cursor falls back to ${j}; text cursor stays at ${i}.`,
          4,
          "search",
          i,
          j,
          i - j,
          true,
        );
      } else i++;
    }
  } else {
    for (let offset = 0; offset <= t.length - p.length; offset++) {
      let j = 0;
      while (j < p.length) {
        comparisons++;
        emit(
          `Alignment ${offset}: compare text[${offset + j}] and pattern[${j}].`,
          1,
          "search",
          offset + j,
          j,
          offset,
          t[offset + j] !== p[j],
        );
        if (t[offset + j] !== p[j]) {
          emit(
            "Mismatch: shift alignment right by one.",
            2,
            "search",
            offset + j,
            j,
            offset,
            true,
          );
          break;
        }
        j++;
      }
      if (j === p.length) {
        matches.push(offset);
        emit(
          `Full match at position ${offset}.`,
          3,
          "search",
          offset + p.length - 1,
          p.length - 1,
          offset,
        );
      }
    }
  }
  emit(
    `Complete. Matching positions: ${matches.join(", ") || "none"}. Comparisons include KMP preprocessing when selected.`,
    6,
    "done",
    -1,
    -1,
  );
  return steps;
}
