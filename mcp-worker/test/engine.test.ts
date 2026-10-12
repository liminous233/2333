import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { CONTENT as C } from "../src/game/content";
import {
  createRun,
  observe,
  transition,
  buildRecap,
  storyFor,
  fullIdentity,
} from "../src/game/engine";
import { stateApi } from "../src/game/state";
import {
  initial,
  walk,
  step,
  paths,
  charge42,
  d4,
  reconnectChain,
} from "./paths";
import type { RunState } from "../src/game/types";
function noLeaks(s: RunState) {
  const text = JSON.stringify([observe(s), buildRecap(s)]);
  if (!s.concluded)
    for (const bad of [
      '"assim"',
      '"clarity"',
      "REPORT_BLACK",
      "EARLY_MOON",
      "ANOMALY",
      "RECONNECT",
      "v02:",
      '"seed"',
      '"flags"',
      '"records"',
      '"counters"',
    ])
      assert(!text.includes(bad), bad);
}
for (const [kind, path] of Object.entries(paths))
  test("fresh game reaches " + kind, () => {
    let s = initial();
    for (const id of path) {
      noLeaks(s);
      assert(observe(s).narrative.length < 4000);
      s = step(s, id);
      assert(
        s.assim >= 0 && s.assim <= 100 && s.clarity >= 0 && s.clarity <= 100,
      );
    }
    assert.equal(s.endingKind, kind);
    assert(s.concluded);
    assert.equal(observe(s).actions.length, 0);
    assert(
      buildRecap(s).recap!.includes(
        C.endingStats.names[kind as keyof typeof C.endingStats.names],
      ),
    );
    const before = structuredClone(s);
    assert.throws(() => transition(s, "go_map"), /RUN_FINISHED/);
    assert.deepEqual(s, before);
  });
test("observe and recap are pure; unavailable actions never mutate input", () => {
  const s = initial(),
    copy = structuredClone(s);
  observe(s);
  buildRecap(s);
  assert.throws(() => transition(s, "solve"));
  assert.throws(() => transition(s, "complete_hymn"));
  assert.deepEqual(s, copy);
  noLeaks(s);
});
test("one-time items and map scores; body and letters use authored text", () => {
  let s = walk(initial(), [
    "inspect_letter",
    "crumple_letter",
    "unfold_letter",
  ]);
  assert.equal(s.text, C.gate.letter.hidden);
  s = walk(s, ["put_back", "authenticate", ...charge42]);
  assert.equal(s.assim, 42);
  s = walk(s, ["visit_chapel", "leave_chapel", "close_room"]);
  assert.equal(s.assim, 42);
  s = walk(s, ["go_evidence", "inspect_candle"]);
  assert(!observe(s).actions.some((a) => a.id === "light"));
});
test("39/40/49/50 reports lock; original route code and seeded old ID persist", () => {
  for (const [value, route] of [
    [39, "REPORT_BLACK"],
    [40, "ANOMALY"],
    [49, "ANOMALY"],
    [50, "EARLY_MOON"],
  ] as const) {
    let s = walk(initial(), ["authenticate", "go_journal", "moon_4"]);
    s.assim = value;
    s = step(s, "open_report");
    assert.equal(storyFor(s).route(), route);
    stateApi(s).add(-30);
    assert.equal(storyFor(s).lockReport(), route);
  }
  let s = walk(initial(), [
    "authenticate",
    ...charge42,
    ...d4,
    "decide_reconnect",
  ]);
  assert.equal(s.assim, 22);
  assert.equal(s.clarity, 70);
  assert.equal(s.choices["ev:candle"], "light");
  const T = storyFor(s);
  assert(!T.decision("reconnect"));
  assert.equal(s.assim, 22);
  assert.equal(T.oldName(), storyFor(structuredClone(s)).oldName());
});
test("99/100 floor applies only to embrace, across all state entry points", () => {
  for (const n of [98, 99, 100])
    for (const mutate of [
      (s: any) => s.add(-10),
      (s: any) => s.once("x", -10),
      (s: any) => s.upTo("x", 2, -10),
      (s: any) => s.choose("x", "a", { assim: -10 }),
      (s: any) => s.settle("x", { assim: -10 }),
    ]) {
      const s = initial();
      s.assim = n;
      s.records["v02:report"] = { route: "ANOMALY" };
      s.choices["v02:d4"] = "embrace";
      mutate(stateApi(s));
      assert.equal(s.assim, n >= 99 ? n : n - 10);
    }
  for (const route of ["", "REPORT_BLACK", "EARLY_MOON", "RECONNECT"]) {
    const s = initial();
    s.assim = 100;
    s.records["v02:report"] = { route };
    stateApi(s).add(-10);
    assert.equal(s.assim, 90);
  }
});
test("infinity requires every link, including both archive readings", () => {
  const completed = walk(initial(), paths.infinity);
  for (const key of [
    "v02:candleList",
    "v02:oldId",
    "v02:archiveDone",
    "v02:messageSent",
    "v02:reconnect",
  ]) {
    const s = structuredClone(completed);
    delete s.flags[key];
    assert(!fullIdentity(s), key);
  }
  for (const key of ["v02:present", "v02:discuss"]) {
    const s = structuredClone(completed);
    delete s.seen[key];
    assert(!fullIdentity(s), key);
  }
  let s = walk(initial(), [
    "authenticate",
    ...charge42,
    ...d4,
    "decide_reconnect",
    "authenticate",
    "go_map",
    "visit_bell",
    "up",
    "archive",
  ]);
  assert(
    !observe(s).actions.some((a) => a.id === "solve" || a.id === "present"),
  );
  assert.throws(() => step(s, "solve"));
  s = walk(initial(), [
    "authenticate",
    ...charge42,
    ...d4,
    "decide_reconnect",
    "authenticate",
    ...reconnectChain.slice(0, 13),
  ]);
  assert(!observe(s).actions.some((a) => a.id === "solve"));
  s = step(s, "discuss");
  assert(observe(s).actions.some((a) => a.id === "solve"));
});
test("church gate, early moon and unfinished hymn cannot bypass credits", () => {
  let s = walk(initial(), ["authenticate", "go_journal"]);
  assert(!observe(s).actions.some((a) => a.id === "moon_5"));
  for (const n of [1, 2, 3, 4]) {
    s = step(s, "moon_" + n);
    s = step(s, "go_journal");
  }
  assert(observe(s).actions.some((a) => a.id === "moon_5"));
  // 42+1 gate+1 dorm+2 gaze+3 dining+1 anemone = 50, all public actions.
  s = walk(initial(), [
    "authenticate",
    ...charge42,
    "visit_gate",
    "close_room",
    "visit_dorm",
    "open_dorm",
    "enter_room",
    "close_room",
    "visit_bell",
    "up",
    "gaze",
    "close_room",
    "visit_dining",
    "forward",
    "close_room",
    "go_evidence",
    "inspect_anemone",
    "put_back",
    "go_journal",
    "moon_4",
    "open_report",
  ]);
  assert.equal(s.assim, 50);
  assert.deepEqual(
    observe(s).actions.map((a) => a.id),
    ["game_over"],
  );
  s = walk(s, ["game_over", "report_church", "join_hymn"]);
  assert(!s.concluded);
  s = step(s, "complete_hymn");
  assert.equal(s.endingKind, "peace");
});
test("native state/story/recap parity including historical route migration", () => {
  const body = {
    getAttribute() {
      return "0";
    },
    setAttribute() {},
    style: { setProperty() {} },
    classList: { toggle() {} },
  };
  for (const flags of [{}, { d4Report: true }, { d4Diamond: true }]) {
    const base = initial();
    base.flags = flags as RunState["flags"];
    let saved = JSON.stringify(base);
    const c: any = {
      window: {
        CC: {},
        localStorage: {
          getItem() {
            return saved;
          },
          setItem(_k: string, v: string) {
            saved = v;
          },
        },
      },
      document: { body, dispatchEvent() {} },
      CustomEvent: class {},
      location: { search: "" },
      Math,
    };
    vm.createContext(c);
    for (const f of [
      "data/content.js",
      "js/state.js",
      "js/story.js",
      "js/story-ui.js",
    ])
      vm.runInContext(
        fs.readFileSync(new URL("../../site/" + f, import.meta.url), "utf8"),
        c,
      );
    const native = c.window.CC;
    assert.equal(storyFor(base).route(), native.story.route());
    for (const d of [12, -5, 100, -200, 42]) {
      stateApi(base).add(d);
      native.state.add(d);
      assert.equal(base.assim, native.state.assim);
    }
    const finished = walk(initial(), paths.infinity);
    assert.equal(
      buildRecap(finished).recap,
      native.storyUI.recapText(finished.records["v02:ending"]),
    );
  }
});
test("bounded exploratory walks have no dead scenes and never leak hidden state", () => {
  // Breadth sample plus deterministic walks exercise branches beyond golden paths.
  let seed = 17;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  for (let n = 0; n < 40; n++) {
    let s = initial();
    for (let i = 0; i < 200 && !s.concluded; i++) {
      noLeaks(s);
      const a = observe(s).actions;
      assert(a.length, s.sceneId);
      s = step(s, a[Math.floor(random() * a.length)].id);
    }
  }
});

test("C2 at 95 stays ordinary peace, 100 waits for the full hymn", () => {
  let s = walk(initial(), [
    "authenticate",
    ...charge42,
    "visit_dining",
    "forward",
    "close_room",
    ...d4,
    "decide_embrace",
    "go_map",
    "visit_dining",
    "forward",
    "close_room",
    "visit_hall",
    "hall_enter",
    "hall_next",
    "hall_portrait",
  ]);
  // The anomaly dining scene deliberately does not award the original map:girl +3.
  assert.equal(s.assim, 95);
  assert(!s.concluded);
  s = walk(s, ["hall_church", "join_hymn"]);
  assert(!s.concluded);
  s = step(s, "complete_hymn");
  assert.equal(s.endingKind, "peace");
});
test("studio expulsion requires taking the list and actually leaving", () => {
  let s = walk(initial(), [
    "authenticate",
    ...d4,
    "go_map",
    "visit_studio",
    "down",
  ]);
  assert(!s.flags["v02:studioLocked"]);
  assert(observe(s).actions.some((a) => a.id === "search"));
  s = walk(s, ["search", "down"]);
  assert(!s.flags["v02:studioLocked"]);
  s = step(s, "exit_studio");
  assert(s.flags["v02:studioLocked"]);
  s = step(s, "visit_studio");
  assert(!observe(s).actions.some((a) => a.id === "search"));
});
test("black hall and archive retain distinct original clarity rewards", () => {
  let s = walk(initial(), ["authenticate", ...d4, "go_map", "visit_hall"]);
  assert.equal(s.clarity, 1);
  s = walk(s, [
    "listen",
    "hall_leave",
    "close_room",
    "visit_hall",
    "close_room",
    "visit_bell",
    "up",
    "archive",
    "open_archive",
  ]);
  assert.equal(s.clarity, 2);
  assert(s.text.includes(C.map.bell.day5.openText));
});
