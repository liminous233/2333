import { createRun, transition, observe } from "../src/game/engine";
import type { RunState, EndingKind } from "../src/game/types";
export const runId = "00000000-0000-4000-8000-000000000011";
export const initial = () => createRun("reproducible-name", "zh-CN", runId);
export const step = (s: RunState, id: string) => transition(s, id).state;
export function walk(s: RunState, path: string[]) {
  for (const id of path) {
    if (!observe(s).actions.some((a) => a.id === id))
      throw Error(
        `Missing ${id} in ${s.sceneId}: ${observe(s).actions.map((a) => a.id)}`,
      );
    s = step(s, id);
  }
  return s;
}
export const report = [
  "open_report",
  "complete_report",
  "next_message",
  "next_message",
  "next_message",
];
export const charge42 = [
  "go_evidence",
  "inspect_candle",
  "light",
  "put_back",
  "inspect_hymn",
  "sing",
  "put_back",
  "inspect_missing",
  "forget",
  "put_back",
  "go_map",
  "visit_chapel",
  "leave_chapel",
  "close_room",
];
export const d4 = ["go_journal", "moon_3", ...report];
export const reconnectChain = [
  "go_map",
  "visit_studio",
  "hide",
  "search",
  "down",
  "exit_studio",
  "visit_parlour",
  "take_id",
  "close_room",
  "visit_bell",
  "up",
  "archive",
  "present",
  "discuss",
  "solve",
  "close_room",
  "visit_gate",
  "send_message",
  "go_journal",
  "moon_5",
];
export const paths: Record<EndingKind, string[]> = {
  bliss: ["authenticate", ...d4, "report_church", "join_hymn", "complete_hymn"],
  peace: [
    "authenticate",
    ...charge42,
    ...d4,
    "decide_church",
    "join_hymn",
    "complete_hymn",
  ],
  "peace-v": [
    "authenticate",
    ...charge42,
    ...d4,
    "decide_embrace",
    "go_map",
    "visit_dorm",
    "enter_room",
    "night_prayer",
    "close_room",
    "visit_hall",
    "hall_enter",
    "hall_next",
    "hall_portrait",
    "hall_church",
    "enter_church",
    "tomorrow_yes",
    "join_hymn",
    "complete_hymn",
  ],
  infinity: [
    "authenticate",
    ...charge42,
    ...d4,
    "decide_reconnect",
    "authenticate",
    ...reconnectChain,
    "join_hymn",
    "complete_hymn",
  ],
};
