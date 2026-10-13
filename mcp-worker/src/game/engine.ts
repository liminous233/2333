import { CONTENT as C } from "./content";
import { createStory, recapText } from "./story";
import { stateApi, seededRandom } from "./state";
import type { RunState, Locale, PublicScene } from "./types";
const V = C.v02,
  M = C.map,
  E = C.evidence;
type Pair = [string, string];
const pairs = (a: string[][]) => a as Pair[];
export const storyFor = (s: RunState) =>
  createStory(stateApi(s), C, seededRandom(s.seed));
export function fullIdentity(s: RunState) {
  return (
    storyFor(s).infinity() && !!s.seen["v02:present"] && !!s.seen["v02:discuss"]
  );
}
const reportText = (r: typeof C.d4.report.zh) =>
  [r.date, ...r.head, r.to, r.body, r.close, r.sign, r.code].join("\n");
const label = (k: string) =>
  (E.items as Record<string, any>)[k]?.name ||
  (V.items as Record<string, any>)[k] ||
  k;
function rememberItem(s: RunState, k: string) {
  if (!s.inventory.includes(k)) s.inventory.push(k);
}
const bilingual = (s: RunState, zh: string, en?: string) =>
  s.locale === "zh-CN"
    ? zh
    : s.locale === "en"
      ? en || zh
      : en && en !== zh
        ? zh + "\n" + en
        : zh;
function screen(s: RunState, id: string, text: string, options: Pair[] = []) {
  s.sceneId = id;
  s.text = text;
  s.options = options;
  if (!s.visited.includes(id.split(":")[0])) s.visited.push(id.split(":")[0]);
}
function addNav(s: RunState): Pair[] {
  if (!s.authed || s.sceneId === "gate" || s.concluded || s.sceneId === "rite")
    return [];
  const T = storyFor(s);
  return [
    ["go_map", "唱诗院地图"],
    ["go_evidence", "证物柜"],
    ["go_journal", "回望穹顶"],
  ].filter(
    ([id]) => T.guard(id.slice(3)) === id.slice(3) && s.sceneId !== id.slice(3),
  ) as Pair[];
}
function itemChoices(s: RunState, k: string): Pair[] {
  const key = k === "kraft" || k === "forever" ? "ev:merge" : "ev:" + k;
  if (s.choices[key]) return [];
  if (k === "kraft" || k === "forever")
    return s.flags.forever ? [["merge", E.items.merge.label]] : [];
  if (k === "missing")
    return C.missing.choices
      .filter((c) => s.assim < C.missing.forceAt || c.id === "forget")
      .map((c) => [c.id, c.label]);
  return ((E.items as Record<string, any>)[k]?.choices || []).map((c: any) => [
    c.id,
    c.label,
  ]);
}
function item(s: RunState, k: string, side = "front") {
  const it = (E.items as Record<string, any>)[k] || {},
    old = k === "oldId";
  let text = it.text || (it.hi ? (s.assim >= E.highAt ? it.hi : it.lo) : "");
  const actions: Pair[] = [];
  if (k === "letter") {
    if (side === "hidden") text = C.gate.letter.hidden;
    else {
      const l = C.gate.letter;
      const zh = [
        l.zh.title,
        l.zh.greeting,
        ...l.zh.body,
        l.zh.closing,
        l.zh.signature,
        l.zh.signOff,
      ].join("\n");
      const en = [
        l.title,
        l.greeting,
        ...l.body,
        l.closing,
        l.signature,
        l.signOff,
      ].join("\n");
      text = bilingual(s, zh, en);
    }
    actions.push([
      side === "crumpled" ? "unfold_letter" : "crumple_letter",
      side === "crumpled" ? "展开纸团" : "揉成纸团",
    ]);
    if (side === "crumpled") text = "欢迎信被揉成了纸团。";
  } else if (k === "card" || old) {
    const prayer =
      old || (storyFor(s).route() === "ANOMALY" && s.flags["v02:nightPrayer"]);
    const zh = V.cardZh,
      en = C.gate.card;
    if (side === "back")
      text = bilingual(
        s,
        prayer ? V.prayer.zh : zh.back,
        prayer ? V.prayer.en : en.back,
      );
    else {
      const name = old ? String(s.records["v02:oldName"]) : "";
      const zfields = old
        ? [[V.items.oldLabel[1], name], ...zh.fields.slice(1)]
        : zh.fields;
      const efields = old
        ? [[V.items.oldLabel[0], name], ...en.fields.slice(1)]
        : en.fields;
      text +=
        "\n" +
        bilingual(
          s,
          [zh.bureau, ...zfields.map((x) => x.join("："))].join("\n"),
          [en.bureau, ...efields.map((x) => x.join(": "))].join("\n"),
        );
      if (old) text += "\n" + V.items.worn;
    }
    actions.push(["turn_card", side === "back" ? "翻回正面" : "翻看背面"]);
  } else if (k === "candleList")
    text = [
      bilingual(s, V.items.listTitle[1], V.items.listTitle[0]),
      V.items.headers[1].join(" / "),
      ...V.items.rows.map((r) => r.join(" / ")),
    ].join("\n");
  else if (k === "clue")
    text = bilingual(s, C.gate.clueZh.join("\n"), C.gate.clue.join("\n"));
  else if (k === "hymn") text += "\n" + bilingual(s, C.hymn.zh, C.hymn.en);
  else if (k === "rules")
    text =
      bilingual(s, C.rules.titleZh, C.rules.title) +
      "\n" +
      C.rules.items
        .map((r, i) => i + 1 + ". " + bilingual(s, r.zh, r.en))
        .join("\n");
  else if (k === "kraft" || k === "forever")
    text = s.choices["ev:merge"]
      ? "WE Forever"
      : k === "kraft"
        ? C.gate.kraft
        : E.items.forever.ink;
  else if (k === "missing") {
    if (s.choices["ev:missing"] === "forget") text = "纸袋再也抽不出纸。";
    else if (side === "open")
      text = [
        C.missing.head,
        ...C.missing.meta.map(
          (r) => r[0] + "：" + (r[2] === "blur" ? "██ 年 █ 月 ██ 日" : r[1]),
        ),
        ...C.missing.people.map((p) =>
          [p.name, p.sex, p.age, p.job, p.when, p.where].join(" · "),
        ),
      ].join("\n");
    else {
      text = C.missing.hint;
      actions.push(["pull_file", "抽出旧纸"]);
    }
  }
  actions.push(...itemChoices(s, k));
  actions.push(["put_back", "放回"]);
  screen(s, "item:" + k + ":" + side, text, actions);
}
function enter(s: RunState, page: string) {
  const S = stateApi(s),
    T = storyFor(s);
  if (page === "gate") {
    screen(
      s,
      "gate",
      s.flags["v02:reconnect"]
        ? V.welcomeBack
        : "维西娅·卡鲁的桌面档案夹。左侧是一封欢迎信，右侧摆着调查用物件。",
      [
        ["inspect_letter", "查看欢迎信"],
        ...["card", "gun", "clue", "pen", "kraft"].map(
          (k) => ["inspect_" + k, label(k)] as Pair,
        ),
        ["authenticate", C.gate.button],
      ],
    );
    return;
  }
  if (page === "home") {
    screen(s, "home", C.home.intro + "\n" + C.home.note, [
      ["go_map", C.home.startHint],
      ["inspect_party", C.home.partyHint || "查看同行人员"],
    ]);
    return;
  }
  if (page === "map") {
    let text = M.welcome.zh.join("\n");
    if (s.assim === 100)
      text +=
        "\n外围地图逐渐融化，白色眼睛在花田间睁开，只留下银莲花田和卡塔西斯圣堂。";
    else if (T.route() === "RECONNECT")
      text +=
        "\n" +
        (s.flags["v02:messageSent"]
          ? V.messageReady
          : s.flags["v02:archiveDone"]
            ? V.gateReady
            : T.hasEvidence()
              ? V.cluesReady
              : V.update);
    screen(
      s,
      "map",
      text,
      M.rooms
        .filter((r) => s.assim !== 100 || ["field", "cathedral"].includes(r.id))
        .map((r) => ["visit_" + r.id, r.zh]),
    );
    return;
  }
  if (page === "evidence") {
    const ks = Object.keys(E.items).filter(
      (k) =>
        k !== "merge" &&
        (k !== "forever" || (s.flags.forever && !s.choices["ev:merge"])),
    );
    for (const k of ["candleList", "oldId"])
      if (s.flags["v02:" + k]) ks.push(k);
    screen(
      s,
      "evidence",
      "一只打开的手提箱。",
      ks.map((k) => ["inspect_" + k, label(k)]),
    );
    return;
  }
  if (page === "rules" || page === "missing") {
    s.returnTo = "journal";
    item(s, page);
    return;
  }
  if (page === "journal") {
    const options: Pair[] = C.journal.moons
      .filter((m) => !m.twin && (m.route !== "church" || T.churchOpen()))
      .map((m) => ["moon_" + m.n, m.label]);
    if ([1, 2, 3, 4, 5].every((n) => s.seen["moon:" + n]))
      options.push(["moon_6", "凝视双月"]);
    screen(
      s,
      "journal",
      "森林上方，月相依次展开。" +
        (!T.churchOpen() ? "\n" + C.journal.churchClosed : ""),
      options,
    );
    return;
  }
  if (page === "d4") {
    screen(s, "d4", "莫比乌斯环月亮悬在蓝色十字架之下。", [
      ["open_report", "展开报告"],
    ]);
    return;
  }
  if (page === "church") {
    if (!T.churchOpen() || (T.route() === "RECONNECT" && !fullIdentity(s)))
      throw Error("UNAVAILABLE_ACTION");
    if (T.peaceVariant()) S.setFlag("v02:peaceLock");
    S.once("moon:5");
    screen(s, "church", C.church.welcome + "\n白色的教堂中，大颂礼即将开始。", [
      ["join_hymn", C.church.join],
    ]);
    return;
  }
  throw Error("UNAVAILABLE_ACTION");
}
function visit(s: RunState, name: string) {
  const S = stateApi(s),
    T = storyFor(s),
    route = T.route(),
    reconnect = route === "RECONNECT",
    black = T.blackMap(),
    c2 = route === "ANOMALY" && S.choice("v02:d4") === "embrace",
    H = V.anomaly;
  S.once("v02:room:" + name);
  const room = (text: string, options: Pair[] = [], step = "") =>
    screen(s, "room:" + name + (step ? ":" + step : ""), text, options);
  if (reconnect && !["bell", "studio", "parlour", "gate"].includes(name)) {
    room(V.locked);
    return;
  }
  if ((reconnect || black) && name === "studio") {
    if (S.flag("v02:studioLocked")) {
      room(V.studio.locked);
      return;
    }
    S.once("v02:day:5");
    room(V.studio.intro, pairs(V.studio.options));
    return;
  }
  if ((reconnect || black) && name === "parlour") {
    S.once("v02:day:6");
    room(V.parlour.intro, [["take_id", V.parlour.take]]);
    return;
  }
  if (reconnect && name === "gate") {
    if (!S.flag("v02:archiveDone")) {
      room(V.gateLocked);
      return;
    }
    S.once("day:7");
    room(V.ourSky, [["send_message", V.action]]);
    return;
  }
  if (route === "REPORT_BLACK" && name === "hall") {
    S.once("day:6", { clarity: 1 });
    S.once("v02:hallTribunal", { assim: -3 });
    const read = S.seen("v02:hallEavesdrop");
    room(
      read ? V.tribunalHall.day7 : V.tribunalHall.day6,
      read ? [["hall_leave", V.leave]] : [["listen", V.tribunalHall.listen]],
    );
    return;
  }
  if (c2) {
    if (name === "hall") {
      let stage = 0;
      H.hall.stages.forEach((x, i) => {
        if (S.seen(x.key)) stage = i;
      });
      hall(s, stage);
      return;
    }
    if (name === "gate" || name === "cathedral") {
      S.once("day:7");
      room(
        H[name],
        name === "cathedral" ? [["enter_church", H.enterChurch]] : [],
      );
      return;
    }
    if (name === "field") {
      room(H.field);
      return;
    }
    if (name === "dining") {
      room(H.diningIntro, [["forward", H.forward]]);
      return;
    }
    if (name === "chapel") {
      S.once("day:6");
      room(M.chapel.text.join("\n"), [
        ["pray", M.chapel.pray],
        ["walk", M.chapel.walk],
        ["leave_chapel", M.chapel.leave],
      ]);
      return;
    }
    if (name === "dorm") {
      room(H.nightIntro, [["enter_room", M.dorm.enter]]);
      return;
    }
  }
  switch (name) {
    case "gate":
      S.once("map:gate", M.gate.assim);
      room(M.gate.text);
      break;
    case "studio":
      room(M.studio);
      break;
    case "field":
      if (black) S.once("day:7");
      room(black ? M.day7.text : M.field);
      break;
    case "parlour":
      room(M.parlour);
      break;
    case "hall":
      room(M.hall);
      break;
    case "dorm":
      room(
        black ? M.dorm.report.text : M.dorm.text,
        black
          ? [["read_message", M.dorm.report.view]]
          : [["open_dorm", "查看居室"]],
      );
      break;
    case "chapel":
      if (black) S.once("map:chapel:day6", M.chapel.day6.enterAssim);
      room((black ? M.chapel.day6 : M.chapel).text.join("\n"), [
        ["pray", M.chapel.pray],
        ["walk", M.chapel.walk],
        ["leave_chapel", M.chapel.leave],
      ]);
      break;
    case "bell":
      room("钟楼。", [["up", M.bell.up]]);
      break;
    case "dining":
      room(M.dining.text, [["forward", M.dining.forward]]);
      break;
    case "cathedral":
      S.once("map:cathedral", 2);
      room(M.cathedral.text);
      break;
    default:
      throw Error("UNAVAILABLE_ACTION");
  }
}
function hall(s: RunState, n: number) {
  const H = V.anomaly.hall,
    x = H.stages[n];
  stateApi(s).settle(x.key, x.delta);
  screen(
    s,
    "room:hall:" + n,
    x.text,
    n === 3
      ? [["hall_church", H.church]]
      : [
          [
            ["hall_enter", H.enter],
            ["hall_next", H.next],
            ["hall_portrait", H.view],
          ][n] as Pair,
        ],
  );
}
function archiveOptions(s: RunState): Pair[] {
  return [
    ["present", V.archive.presentLabel],
    ["discuss", V.archive.discussLabel],
    ...(storyFor(s).archiveReady() ? [["solve", V.archive.solve] as Pair] : []),
  ];
}
function finish(s: RunState) {
  const T = storyFor(s),
    peace = T.peace() || s.flags.d4Diamond;
  if (!s.flags["v02:hymnComplete"]) throw Error("UNAVAILABLE_ACTION");
  const kind = peace ? "peace" : fullIdentity(s) ? "infinity" : "bliss";
  if (!peace) s.flags.bliss = true;
  const ending = T.finish(kind);
  s.endingKind =
    kind === "peace" && ending.variant === "overline-v" ? "peace-v" : kind;
  s.concluded = true;
  screen(s, "ending", C.endingStats.names[s.endingKind], []);
  if (kind === "infinity")
    s.text += "\n" + bilingual(s, V.infinityTextZh, V.infinityText);
  else if (kind === "peace") {
    s.text +=
      "\n" +
      bilingual(
        s,
        V.creditsZh["No visitor was harmed. Every visitor was kept."],
        "No visitor was harmed. Every visitor was kept.",
      );
    if (s.endingKind === "peace-v")
      s.text += "\n" + bilingual(s, V.peaceV.welcome[1], V.peaceV.welcome[0]);
  } else s.text += "\n" + C.bliss.zh;
  if (s.clarity >= C.ending.clarityAt && kind !== "bliss")
    s.text +=
      "\n" +
      bilingual(
        s,
        V.creditsZh[C.ending.thanks as keyof typeof V.creditsZh] ||
          C.ending.thanks,
        C.ending.thanks,
      );
}
export function createRun(
  seed: string,
  locale: Locale = "zh-CN",
  runId = seed,
): RunState {
  const s: RunState = {
    schemaVersion: 1,
    runId,
    seed,
    locale,
    revision: 0,
    sceneId: "gate",
    assim: 0,
    clarity: 0,
    authed: false,
    flags: {},
    seen: {},
    counters: {},
    choices: {},
    records: {},
    inventory: [],
    stepCount: 0,
    concluded: false,
    text: "",
    options: [],
    returnTo: "gate",
    visited: [],
    publicChoices: [],
  };
  enter(s, "gate");
  return s;
}
export function observe(s: RunState): PublicScene {
  const actions = [...s.options, ...addNav(s)];
  if (s.sceneId.startsWith("room:")) actions.push(["close_room", "返回地图"]);
  const unique = Array.from(
    new Map(actions.map(([id, label]) => [id, { id, label }])).values(),
  );
  const title = s.sceneId.startsWith("room:")
    ? M.rooms.find((r) => r.id === s.sceneId.split(":")[1])?.zh
    : s.sceneId.startsWith("item:")
      ? label(s.sceneId.split(":")[1])
      : (
          {
            gate: "身份录入",
            home: C.site.title,
            map: "唱诗院地图",
            evidence: "证物柜",
            journal: "八日日志",
            d4: "DAY 4",
            report: "述职报告",
            messages: "消息",
            church: "教堂",
            rite: "大颂礼",
            ending: "终",
          } as Record<string, string>
        )[s.sceneId];
  return {
    run_id: s.runId,
    revision: s.revision,
    scene_id: s.sceneId,
    title: title || C.site.title,
    narrative: s.text,
    inventory: s.inventory.map(label),
    actions: s.concluded ? [] : unique,
    concluded: s.concluded,
    ...(s.concluded
      ? {
          ending: C.endingStats.names[s.endingKind!],
          record_hint:
            "调用 get_run_record 阅读本局回望；其中 share_text 可直接复制分享。",
        }
      : {}),
    ...(s.locale !== "zh-CN"
      ? {
          locale_notice:
            "English is experimental. Existing bilingual source is used; passages without English retain the authored Chinese.",
        }
      : {}),
  };
}
export function transition(
  input: RunState,
  actionId: string,
): { state: RunState; event: { action: string; label: string } } {
  const action = observe(input).actions.find((x) => x.id === actionId);
  if (input.concluded) throw Error("RUN_FINISHED");
  if (!action) throw Error("UNAVAILABLE_ACTION");
  const s = structuredClone(input),
    S = stateApi(s),
    T = storyFor(s),
    id = actionId;
  const c2 = T.route() === "ANOMALY" && S.choice("v02:d4") === "embrace",
    black = T.blackMap(),
    reconnect = T.route() === "RECONNECT";
  if (id.startsWith("go_")) enter(s, id.slice(3));
  else if (id === "close_room") enter(s, "map");
  else if (id.startsWith("moon_")) {
    const n = Number(id.slice(5));
    S.once("moon:" + n);
    if (n === 6) enter(s, "church");
    else enter(s, C.journal.moons[n - 1].route!);
  } else if (id === "authenticate") {
    s.authed = true;
    if (reconnect) S.setFlag("v02:reentered");
    enter(s, "home");
  } else if (id === "inspect_party") {
    s.text = C.home.partyHint + "\n" + V.party;
  } else if (id.startsWith("visit_")) visit(s, id.slice(6));
  else if (id.startsWith("inspect_")) {
    const k = id.slice(8);
    s.returnTo = s.sceneId === "gate" ? "gate" : "evidence";
    if (k === "anemone") S.once("ev:anemone", E.items.anemone.assim);
    if (k !== "letter") rememberItem(s, k);
    item(s, k);
  } else if (s.sceneId.startsWith("item:")) {
    const [, k, side] = s.sceneId.split(":");
    if (id === "put_back") enter(s, s.returnTo);
    else if (id === "turn_card") item(s, k, side === "back" ? "front" : "back");
    else if (id === "crumple_letter") {
      s.records.paperHidden = side !== "hidden";
      item(s, k, "crumpled");
    } else if (id === "unfold_letter")
      item(s, k, s.records.paperHidden ? "hidden" : "front");
    else if (id === "pull_file") item(s, k, "open");
    else {
      const key = k === "kraft" || k === "forever" ? "ev:merge" : "ev:" + k;
      const list =
        k === "missing"
          ? C.missing.choices
          : k === "kraft" || k === "forever"
            ? [{ id: "merge", ...E.items.merge }]
            : (E.items as Record<string, any>)[k].choices;
      const choice = list.find((x: any) => x.id === id);
      S.choose(key, id, choice);
      if (k === "candle" && id === "light") S.setFlag("candleLit");
      if (!s.publicChoices.includes(choice.label))
        s.publicChoices.push(choice.label);
      item(s, k, side);
    }
  } else if (id === "open_report") {
    const r = T.lockReport();
    screen(
      s,
      "report",
      r === "EARLY_MOON"
        ? "报告纸上长满银莲花。\n" + C.d4.gameOver
        : bilingual(s, reportText(C.d4.report.zh), reportText(C.d4.report.en)),
      r === "EARLY_MOON"
        ? [["game_over", C.d4.gameOver]]
        : [["complete_report", C.d4.done]],
    );
  } else if (id === "game_over") {
    s.text = C.d4.toChurch;
    s.options = [["report_church", C.d4.toChurch]];
  } else if (id === "report_church") {
    if (T.route() === "EARLY_MOON") S.setFlag("d4Diamond");
    else S.setFlag("v02:churchFromReport");
    enter(s, "church");
  } else if (id === "complete_report" || id === "next_message") {
    if (id === "complete_report") {
      S.setFlag("d4Report");
      s.counters.chat = 0;
    } else s.counters.chat++;
    const messages = T.route() === "ANOMALY" ? V.anomaly.chat : C.d4.chat,
      n = s.counters.chat;
    const options: Pair[] =
      n < messages.length - 1
        ? [["next_message", "查看下一条消息"]]
        : T.route() === "ANOMALY"
          ? V.anomaly.options.map(([v, l]) => ["decide_" + v, l])
          : [
              ["go_journal", C.d4.back],
              ["report_church", C.d4.toChurch],
              ["go_map", C.d4.mapHint],
            ];
    const m = messages[n];
    screen(
      s,
      "messages",
      (id === "complete_report"
        ? bilingual(s, C.d4.ping.zh, C.d4.ping.en) + "\n"
        : "") +
        (m.who === "ryan" ? "莱恩：" : "维西娅：") +
        (m.text || "（蓝色空白气泡缓慢扭曲。）"),
      options,
    );
  } else if (id.startsWith("decide_")) {
    const value = id.slice(7);
    if (!T.decision(value)) throw Error("UNAVAILABLE_ACTION");
    s.publicChoices.push(action.label);
    enter(
      s,
      value === "reconnect"
        ? "gate"
        : value === "church"
          ? "church"
          : "journal",
    );
  } else if (id === "join_hymn") {
    const peace = T.peace() || S.flag("d4Diamond");
    screen(
      s,
      "rite",
      peace
        ? (T.peaceVariant() ? V.peaceV.holyText : C.church.holyText) +
            "\n双月神像显现，整页泛起颗粒噪声。"
        : C.church.lines.map((l) => bilingual(s, l.zh, l.en)).join("\n"),
      [
        [
          "complete_hymn",
          peace
            ? C.church.holyGo
            : bilingual(s, C.church.last.zh, C.church.last.en),
        ],
      ],
    );
  } else if (id === "complete_hymn") {
    S.setFlag("v02:hymnComplete");
    finish(s);
  } else if (s.sceneId.startsWith("room:")) {
    const [, room, step] = s.sceneId.split(":"),
      H = V.anomaly;
    const show = (text: string, options = s.options, newStep = step) =>
      screen(s, "room:" + room + (newStep ? ":" + newStep : ""), text, options);
    if (room === "studio") {
      if (id === "hide") {
        S.once("v02:hide", V.delta.hide);
        show(V.studio.hide);
      }
      if (id === "search") {
        S.settle("v02:search", V.delta.search, { "v02:candleList": true });
        rememberItem(s, "candleList");
        show(
          V.studio.after +
            "\n" +
            [
              V.items.listTitle[1],
              V.items.headers[1].join(" / "),
              ...V.items.rows.map((r) => r.join(" / ")),
            ].join("\n"),
        );
      }
      if (id === "down")
        show(
          S.flag("v02:candleList") ? V.studio.expel : V.studio.wait,
          S.flag("v02:candleList") ? [["exit_studio", V.leave]] : s.options,
        );
      if (id === "exit_studio") {
        S.setFlag("v02:studioLocked");
        enter(s, "map");
      }
    } else if (room === "parlour" && id === "take_id") {
      T.oldName();
      S.settle("v02:oldId", V.delta.oldId, { "v02:oldId": true });
      rememberItem(s, "oldId");
      show(
        V.parlour.after +
          "\n" +
          V.items.oldLabel[1] +
          "：" +
          s.records["v02:oldName"],
        [["inspect_oldId", V.parlour.inspect]],
      );
    } else if (room === "gate" && id === "send_message") {
      if (!fullArchive(s)) throw Error("UNAVAILABLE_ACTION");
      S.setFlag("v02:messageSent");
      show(V.sent, [["go_journal", V.toDome]]);
    } else if (room === "hall") {
      if (id === "listen") {
        S.once("v02:hallEavesdrop");
        show(V.tribunalHall.day7, [["hall_leave", V.leave]]);
      }
      if (id === "hall_leave") show(V.tribunalHall.messages.join("\n"), []);
      if (id === "hall_enter") hall(s, 1);
      if (id === "hall_next") hall(s, 2);
      if (id === "hall_portrait") hall(s, 3);
      if (id === "hall_church") {
        if (s.assim === 100) visit(s, "cathedral");
        else {
          S.setFlag("v02:peaceLock");
          enter(s, "church");
        }
      }
    } else if (room === "cathedral") {
      if (id === "enter_church")
        show(H.tomorrow, [
          ["tomorrow_no", H.no],
          ["tomorrow_yes", H.yes],
        ]);
      if (id === "tomorrow_no") enter(s, "map");
      if (id === "tomorrow_yes") {
        S.setFlag("v02:peaceLock");
        enter(s, "church");
      }
    } else if (room === "dorm") {
      if (id === "open_dorm")
        show(M.dorm.text, [
          ["wander", M.dorm.wander],
          ["enter_room", M.dorm.enter],
        ]);
      if (id === "wander") {
        S.once("map:dorm:wander", { clarity: M.dorm.wanderClarity });
        S.setFlag("forever");
        rememberItem(s, "forever");
        show(M.dorm.wanderText + "\n" + M.dorm.got);
      }
      if (id === "enter_room") {
        if (c2) show(H.nightIntro, [["night_prayer", H.nightLabel]]);
        else {
          S.once("map:dorm:enter", M.dorm.enterAssim);
          show(M.dorm.enterText);
        }
      }
      if (id === "night_prayer") {
        S.settle("v02:nightPrayer", V.delta.night, { "v02:nightPrayer": true });
        show(H.night + "\n" + bilingual(s, V.prayer.zh, V.prayer.en), [
          ["go_evidence", H.evidence],
        ]);
      }
      if (id === "read_message") {
        const n = Number(step || 0);
        show(
          M.dorm.report.messages[n].text,
          n < 2 ? [["read_message", "下一条消息"]] : [],
          String(n + 1),
        );
      }
    } else if (room === "dining") {
      if (id === "forward") {
        if (!c2) S.once("map:girl", 3);
        show(
          c2 ? H.girl : black ? M.dining.clothText : M.dining.girlText,
          c2 ? [["touch_head", "轻点女孩的头"]] : [],
        );
      }
      if (id === "touch_head") show(H.head);
    } else if (room === "chapel") {
      const chapel = black ? { ...M.chapel, ...M.chapel.day6 } : M.chapel;
      if (id === "pray") {
        if (c2) {
          const chosen = S.choice("v02:prayer");
          show(
            chosen ? (H as any)[chosen] : H.pray,
            chosen
              ? [
                  ["walk", chapel.walk],
                  ["leave_chapel", chapel.leave],
                ]
              : [
                  ["eyes", H.eyesLabel],
                  ["continue", H.continueLabel],
                ],
          );
        } else {
          S.once("map:chapel:pray", chapel.prayAssim);
          show(chapel.prayText);
        }
      }
      if (id === "eyes" || id === "continue") {
        S.choose("v02:prayer", id, V.delta[id]);
        s.publicChoices.push(action.label);
        show(H[id], [
          ["walk", chapel.walk],
          ["leave_chapel", chapel.leave],
        ]);
      }
      if (id === "walk")
        show(c2 ? H.walk : chapel.walkText, [
          ...(!c2 ? [["pray", chapel.pray] as Pair] : []),
          ["out", chapel.out],
          ["leave_chapel", chapel.leave],
        ]);
      if (id === "out") {
        if (c2) S.once("v02:out", V.delta.out);
        else S.once("map:chapel:walk", { clarity: chapel.walkClarity });
        show(c2 ? H.out : chapel.outText, [
          ...(!c2 ? [["pray", chapel.pray] as Pair] : []),
          ["leave_chapel", chapel.leave],
        ]);
      }
      if (id === "leave_chapel") {
        if (!c2) S.once("map:chapel:leave", chapel.leaveAssim);
        show(c2 ? H.leave : chapel.leaveText, []);
      }
    } else if (room === "bell") {
      const B = M.bell;
      if (id === "up")
        show(S.flag("d4Report") ? B.day5.upText : "", [
          ["archive", B.archive],
          ["gaze", B.gaze],
        ]);
      if (id === "gaze") {
        S.once("map:gaze", 2);
        show(c2 ? H.gaze : black ? B.day5.gazeText : B.gazeText);
      }
      if (id === "archive") {
        if (!S.flag("d4Report") || (reconnect && !T.hasEvidence()))
          show(reconnect ? V.archiveLocked : B.archiveText, [
            ["try_door", V.tryDoor],
            ["up", B.up],
          ]);
        else if (reconnect) {
          S.once("day:5");
          show(V.archive.intro, archiveOptions(s));
        } else
          show(B.day5.archiveText, [
            ["open_archive", B.day5.open],
            ...(black ? [["gaze", B.gaze] as Pair] : []),
          ]);
      }
      if (id === "try_door") show(V.tryText);
      if (id === "open_archive") {
        if (c2) {
          S.once("v02:archive", V.delta.archive);
          S.once("day:5");
        } else S.once("day:5", { clarity: 1 });
        show(
          c2 ? H.archive : B.day5.openText,
          black ? [["gaze", B.gaze]] : [["up", B.up]],
        );
      }
      if (id === "present" || id === "discuss") {
        S.once("v02:" + id);
        show(V.archive[id], archiveOptions(s));
      }
      if (id === "solve") {
        if (!T.archiveReady()) throw Error("UNAVAILABLE_ACTION");
        S.setFlag("v02:archiveDone");
        show(V.archive.done, []);
      }
    }
  } else throw Error("UNAVAILABLE_ACTION");
  s.stepCount++;
  s.revision++;
  return { state: s, event: { action: id, label: action.label } };
}
function fullArchive(s: RunState) {
  return storyFor(s).archiveReady() && !!s.flags["v02:archiveDone"];
}
export function buildRecap(s: RunState) {
  const S = stateApi(s);
  const days = Array.from({ length: 8 }, (_, i) => i + 1).filter(
    (i) => S.seen("day:" + i) || S.seen("v02:day:" + i),
  );
  const rooms = M.rooms
    .filter((r) => S.seen("v02:room:" + r.id))
    .map((r) => r.zh);
  const recap = s.concluded
    ? recapText(s.records["v02:ending"], C)
    : undefined;
  return {
    run_id: s.runId,
    revision: s.revision,
    concluded: s.concluded,
    days,
    areas: rooms,
    inventory: s.inventory.map(label),
    choices: s.publicChoices,
    ...(s.concluded
      ? {
          ending: C.endingStats.names[s.endingKind!],
          recap,
          share_text: `CASE 0110 · ${C.site.title}\n${recap}`,
        }
      : {}),
  };
}
