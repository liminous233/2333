import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createRun, observe, transition, buildRecap } from "../src/game/engine";
import { CONTENT as C } from "../src/game/content";
const fresh = () => createRun(randomUUID(), "zh-CN");
const walk = (ids: string[]) => ids.reduce((s, id) => transition(s, id).state, fresh());
const report = ["authenticate", "go_journal", "moon_4", "open_report", "complete_report",
  "next_message", "next_message", "next_message"];

test("desktop items never borrow evidence captions at either assimilation level", () => {
  for (const assim of [0, 80]) for (const locale of ["zh-CN", "en", "bilingual"] as const) {
    for (const kind of ["gun", "pen", "card"] as const) {
      const initial = createRun("desktop-check", locale);
      initial.assim = assim;
      const s = transition(initial, "inspect_" + kind).state;
      const view = observe(s), evidence = C.evidence.items[kind];
      assert(!view.narrative.includes(evidence.lo));
      assert(!view.narrative.includes(evidence.hi));
      assert(!view.narrative.includes(C.evidence.items.pen.loanHint));
      assert(view.narrative.includes(locale === "en" ? C.gate.objects[kind].en : C.gate.objects[kind].zh));
      assert.equal(transition(s, "put_back").state.sceneId, "gate");
      if (kind === "card") {
        const back = transition(s, "turn_card").state;
        assert(observe(back).narrative.includes(locale === "en" ? C.gate.card.back : C.v02.cardZh.back));
        assert(observe(transition(back, "turn_card").state).narrative.includes(locale === "en" ? C.gate.card.bureau : C.v02.cardZh.bureau));
      }
      const evidenceState = transition(transition(transition(initial, "authenticate").state, "go_evidence").state, "inspect_" + kind).state;
      assert(observe(evidenceState).narrative.includes(assim >= C.evidence.highAt ? evidence.hi : evidence.lo));
    }
  }
});

test("desktop clue, letter and kraft remain readable without evidence-only actions", () => {
  const clue = walk(["inspect_clue"]);
  assert.equal(observe(clue).narrative, C.gate.clueZh.join("\n"));
  const letter = walk(["inspect_letter"]);
  assert(observe(letter).narrative.includes(C.gate.letter.zh.title));
  assert(observe(transition(letter, "crumple_letter").state).actions.some(a => a.id === "unfold_letter"));
  const initial = fresh(); initial.flags.forever = true;
  const kraft = transition(initial, "inspect_kraft").state;
  assert.equal(observe(kraft).narrative, C.gate.kraft);
  assert(!observe(kraft).actions.some(a => a.id === "merge"));
  assert.throws(() => transition(kraft, "merge"), /UNAVAILABLE_ACTION/);
  const evidence = transition(transition(transition(initial, "authenticate").state, "go_evidence").state, "inspect_kraft").state;
  assert(observe(evidence).actions.some(a => a.id === "merge"));
});

test("cached desktop item saves are corrected on observe without rewriting progress", () => {
  for (const kind of ["gun", "pen", "card"] as const) {
    const s = walk(["inspect_" + kind]);
    s.text = C.evidence.items[kind].lo;
    const before = structuredClone(s), view = observe(s);
    assert(!view.narrative.includes(C.evidence.items[kind].lo));
    assert.equal(view.revision, before.revision);
    assert.deepEqual(s, before);
  }
  const kraft = walk(["inspect_kraft"]);
  kraft.flags.forever = true; kraft.text = "WE Forever"; kraft.options.push(["merge", C.evidence.items.merge.label]);
  const before = structuredClone(kraft);
  assert.equal(observe(kraft).narrative, C.gate.kraft);
  assert.throws(() => transition(kraft, "merge"), /UNAVAILABLE_ACTION/);
  assert.deepEqual(kraft, before);
});

test("pen foreshadows the loan only after lighting, then disappears on entering D4", () => {
  let s = walk(["authenticate", "go_evidence", "inspect_pen"]);
  assert(!observe(s).narrative.includes("一天后借走"));
  const originalText = observe(s).narrative;
  for (const id of ["put_back", "inspect_candle", "light", "put_back", "inspect_pen"])
    s = transition(s, id).state;
  assert.equal(observe(s).narrative, originalText + "\n你的朋友将会在一天后借走它。");
  const score = [s.assim, s.clarity];
  s = transition(transition(s, "put_back").state, "inspect_pen").state;
  assert.deepEqual([s.assim, s.clarity], score);
  assert.equal(observe(s).narrative.split("一天后借走").length, 2);
  for (const id of ["go_journal", "moon_4", "go_evidence"])
    s = transition(s, id).state;
  // Visiting D4 is sufficient; opening/completing the report is not required.
  s = JSON.parse(JSON.stringify(s));
  assert(!observe(s).actions.some(a => a.id === "inspect_pen"));
  assert(!observe(s).inventory.includes(C.evidence.items.pen.name));
  assert(!buildRecap(s).inventory.includes(C.evidence.items.pen.name));
  const before = structuredClone(s);
  assert.throws(() => transition(s, "inspect_pen"), /UNAVAILABLE_ACTION/);
  assert.deepEqual(s, before);
  assert.deepEqual([s.assim, s.clarity], score);
  const unlit = walk(["authenticate", "go_evidence", "inspect_candle", "back", "put_back", "inspect_pen"]);
  assert(!observe(unlit).narrative.includes("一天后借走"));
  const after = walk(["authenticate", "go_journal", "moon_4", "go_evidence"]);
  assert(!observe(after).actions.some(a => a.id === "inspect_pen"));
});

test("candle distinguishes postponing from choosing, and confirms the saved action", () => {
  const s = walk(["authenticate", "go_evidence", "inspect_candle"]);
  const actions = observe(s).actions;
  assert.notEqual(actions.find(a => a.id === "back")!.label, actions.find(a => a.id === "put_back")!.label);
  const postponed = transition(s, "put_back").state;
  assert.equal(postponed.choices["ev:candle"], undefined);
  assert.equal(postponed.assim, s.assim);
  const lit = transition(s, "light").state;
  assert(observe(lit).narrative.includes("香烛已点燃"));
  assert.equal(lit.choices["ev:candle"], "light");
  assert.equal(lit.assim, 12);
  const revisited = transition(transition(lit, "put_back").state, "inspect_candle").state;
  assert(observe(revisited).narrative.includes("香烛已点燃"));
  const unlit = transition(s, "back").state;
  assert(observe(unlit).narrative.includes("不点燃"));
  assert.equal(unlit.choices["ev:candle"], "back");
});

test("hall retains authored dialogue while restoring dates and speaker attribution", () => {
  let s = walk([...report, "go_map", "visit_hall"]);
  assert.equal(observe(s).narrative, "DAY 6\n" + C.v02.tribunalHall.day6);
  s = transition(s, "listen").state;
  assert.equal(observe(s).narrative, "DAY 7\n" + C.v02.tribunalHall.day7);
  const score = [s.assim, s.clarity];
  s = transition(s, "hall_leave").state;
  assert.equal(observe(s).narrative, C.v02.tribunalHall.messages.map((text, i) =>
    (i === 1 ? "维西娅：" : "莱恩：") + text).join("\n"));
  s = transition(transition(s, "go_map").state, "visit_hall").state;
  assert.deepEqual([s.assim, s.clarity], score);
  assert(observe(s).narrative.startsWith("DAY 7\n"));
});

test("journal exposes only entry read marks without changing the church gate", () => {
  let s = walk(["authenticate", "go_evidence", "go_journal"]);
  assert(observe(s).narrative.includes("前往证物柜：未读"));
  assert(!observe(s).actions.some(a => a.id === "moon_5"));
  s = transition(transition(s, "moon_1").state, "go_journal").state;
  assert(observe(s).narrative.includes("前往证物柜：已读"));
  assert(!observe(s).actions.some(a => a.id === "moon_5"));
  assert(!/同化|明晰|REPORT_BLACK|ANOMALY/.test(observe(s).narrative));
});

test("report keeps its map hint and offers completed conversation exits on return", () => {
  let s = walk(report);
  assert.equal(observe(s).actions.find(a => a.id === "go_map")!.label, C.d4.mapHint);
  s = transition(transition(s, "go_journal").state, "moon_4").state;
  assert(observe(s).actions.some(a => a.id === "report_church"));
  assert(observe(s).actions.some(a => a.id === "open_report"));
  assert.equal(transition(s, "report_church").state.sceneId, "church");
  const unfinished = walk(["authenticate", "go_journal", "moon_4", "open_report", "complete_report", "go_journal", "moon_4"]);
  assert(!observe(unfinished).actions.some(a => a.id === "report_church"));
  assert.equal(observe(transition(fresh(), "inspect_letter").state).title, "欢迎信");
});
