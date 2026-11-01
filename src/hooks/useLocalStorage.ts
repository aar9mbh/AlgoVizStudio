import { useState, type Dispatch, type SetStateAction } from "react";

export function useLocalStorage<T>(
  key: string,
  initial: T,
  validate: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
      return validate(parsed) ? parsed : initial;
    } catch {
      return initial;
    }
  });
  const update: Dispatch<SetStateAction<T>> = (next) =>
    setValue((previous) => {
      const resolved =
        typeof next === "function" ? (next as (v: T) => T)(previous) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* Storage may be disabled or full; the session still works. */
      }
      return resolved;
    });
  return [value, update];
}
