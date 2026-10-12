import type { RunState, Delta } from "./types";
export const clamp = (n: number) => Math.max(0, Math.min(100, Number(n) || 0));
export function stateApi(s: RunState) {
  const copy = <T>(x: T): T => (x == null ? x : structuredClone(x));
  function delta(d: Delta = {}) {
    const c2 =
      s.records["v02:report"]?.route === "ANOMALY" &&
      s.choices["v02:d4"] === "embrace" &&
      !s.flags["v02:reconnect"];
    const next = clamp(s.assim + (d.assim || 0));
    s.assim = c2 && s.assim >= 99 ? Math.max(s.assim, next) : next;
    s.clarity = clamp(
      d.claritySet === undefined ? s.clarity + (d.clarity || 0) : d.claritySet,
    );
  }
  const once = (key: string, d: Delta | number = {}) => {
    if (s.seen[key]) return false;
    s.seen[key] = true;
    delta(typeof d === "number" ? { assim: d } : d);
    return true;
  };
  return {
    get assim() {
      return s.assim;
    },
    get clarity() {
      return s.clarity;
    },
    record: (k: string) => copy(s.records[k]),
    remember: (k: string, f: () => any) => {
      if (!(k in s.records)) s.records[k] = copy(f());
      return copy(s.records[k]);
    },
    flag: (k: string) => !!s.flags[k],
    seen: (k: string) => !!s.seen[k],
    choice: (k: string) => s.choices[k] || "",
    choices: () => copy(s.choices),
    setFlag: (k: string, v: boolean | string | number = true) => {
      s.flags[k] = v;
    },
    once,
    settle: (k: string, d: Delta = {}, flags: Record<string, boolean> = {}) => {
      if (!once(k, d)) return false;
      Object.assign(s.flags, flags);
      return true;
    },
    choose: (
      k: string,
      v: string,
      d: Delta = {},
      flags: Record<string, boolean> = {},
    ) => {
      if (s.choices[k]) return false;
      s.choices[k] = v;
      delta(d);
      Object.assign(s.flags, flags);
      return true;
    },
    add: (n: number) => delta({ assim: n }),
    upTo: (k: string, max: number, n: number) => {
      if ((s.counters[k] || 0) >= max) return false;
      s.counters[k] = (s.counters[k] || 0) + 1;
      delta({ assim: n });
      return true;
    },
  };
}
// FNV-1a seed -> stable name; no runtime entropy is consumed by observe/transition.
export function seededRandom(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => (h >>> 0) / 4294967296;
}
