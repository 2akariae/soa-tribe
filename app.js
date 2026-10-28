const { useState, useEffect, useMemo, useRef, createContext, useContext } = React;
const LUC = window.lucideReact || {};
function Icon({ n, size = 20, sw = 1.8, className = "" }) {
  const C = LUC[n];
  if (!C) return /* @__PURE__ */ React.createElement("span", { className, style: { display: "inline-block", width: size, height: size } });
  return /* @__PURE__ */ React.createElement(C, { size, strokeWidth: sw, className, "aria-hidden": "true" });
}
// L-logo dyal l-site. Bddel l-fichier logo.jpeg (nafs smiya) bach tbdl l-logo f kolchi.
function Logo({ size = 120 }) {
  return React.createElement("img", {
    src: "logo.jpeg", width: size, height: size,
    alt: "\u0634\u0639\u0627\u0631 \u0627\u0644\u0642\u0628\u064A\u0644\u0629",
    style: { objectFit: "contain", display: "block" }
  });
}
const KEY = "soa_tribe_v2";
const SESSION = "soa_session_v1";
const THRESHOLD = 900;
const MIN_PW = 6;
const ROLES = {
  leader: { label: "\u0627\u0644\u0631\u0626\u064A\u0633", icon: "Crown" },
  chests: { label: "\u0646\u0627\u0626\u0628 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642", icon: "Package" },
  activity: { label: "\u0646\u0627\u0626\u0628 \u0627\u0644\u0646\u0634\u0627\u0637", icon: "Activity" },
  stealing: { label: "\u0634\u064A\u062E \u0627\u0644\u0633\u0631\u0642\u0627\u062A", icon: "Swords" },
  recruit: { label: "\u0634\u064A\u062E \u0627\u0644\u0642\u0628\u0648\u0644", icon: "UserPlus" },
  mod: { label: "\u0645\u0634\u0631\u0641 / \u0646\u0627\u0626\u0628 / \u0634\u064A\u062E", icon: "Shield" }
};
const RANKS = ["\u0639\u0636\u0648", "\u0645\u0634\u0631\u0641", "\u0646\u0627\u0626\u0628", "\u0634\u064A\u062E"];
const TIERS = {
  normal: { label: "\u0639\u0627\u062F\u064A", sub: "\u0623\u0644\u0639\u0627\u0628 \u0645\u0635\u063A\u0651\u0631\u0629", icon: "Package" },
  advanced: { label: "\u0645\u062A\u0642\u062F\u0645", sub: "\u0627\u0644\u0646\u0634\u0627\u0637 \u0648\u0627\u0644\u062F\u0639\u0645", icon: "Gift" },
  rare: { label: "\u0646\u0627\u062F\u0631", sub: "\u0627\u0644\u0646\u0634\u0627\u0637 \u0648\u0627\u0644\u062F\u0639\u0645", icon: "Gem" }
};
const WARN_REASONS = ["\u063A\u064A\u0627\u0628 \u0639\u0646 \u0641\u0639\u0627\u0644\u064A\u0629", "\u0639\u062F\u0645 \u0627\u0644\u062A\u0641\u0627\u0639\u0644", "\u0645\u062E\u0627\u0644\u0641\u0629 \u0627\u0644\u0642\u0648\u0627\u0646\u064A\u0646", "\u0646\u0634\u0627\u0637 \u0623\u0642\u0644 \u0645\u0646 900"];
const can = {
  members: (r) => r === "leader" || r === "recruit",
  activity: (r) => r === "leader" || r === "activity",
  chests: (r) => r === "leader" || r === "chests",
  steal: (r) => r === "leader" || r === "stealing",
  kickAdd: (r) => r === "leader" || r === "recruit",
  leader: (r) => r === "leader"
};
const pad = (n) => String(n).padStart(2, "0");
const dkey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = () => dkey(/* @__PURE__ */ new Date());
const parseKey = (k) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (k, n) => {
  const d = parseKey(k);
  d.setDate(d.getDate() + n);
  return dkey(d);
};
const weekStart = (k) => {
  const d = parseKey(k);
  d.setDate(d.getDate() - (d.getDay() + 1) % 7);
  return dkey(d);
};
const fmt = (k, o) => parseKey(k).toLocaleDateString("ar-u-nu-latn", o);
const fmtShort = (k) => fmt(k, { day: "numeric", month: "short" });
const fmtFull = (k) => fmt(k, { day: "numeric", month: "long", year: "numeric" });
const fmtTs = (ts) => new Date(ts).toLocaleString("ar-u-nu-latn", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const nf = (n) => Number(n || 0).toLocaleString("en");
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const norm = (s) => String(s == null ? "" : s).replace(/[٠-٩]/g, (d) => "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669".indexOf(d)).replace(/[۰-۹]/g, (d) => "\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9".indexOf(d)).trim();
const digitsOnly = (s) => norm(s).replace(/[^\d]/g, "");
const initial = (name) => [...String(name || "\u061F")][0];
const matchQ = (m, q) => {
  const s = norm(q).toLowerCase();
  return !s || m.name.toLowerCase().includes(s) || norm(m.weid).toLowerCase().includes(s);
};
async function copyText(text, notify) {
  try {
    await navigator.clipboard.writeText(text);
    notify("\u062A\u0645 \u0627\u0644\u0646\u0633\u062E");
  } catch (e) {
    notify("\u062A\u0639\u0630\u0651\u0631 \u0627\u0644\u0646\u0633\u062E \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B\u060C \u062D\u062F\u0651\u062F \u0627\u0644\u0646\u0635 \u0648\u0627\u0646\u0633\u062E\u0647 \u064A\u062F\u0648\u064A\u0627\u064B", "warn");
  }
}
const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
async function hashPw(pw, salt) {
  try {
    return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + "|" + pw)));
  } catch (e) {
    return "p:" + salt + pw;
  }
}
const newSalt = () => {
  try {
    return hex(crypto.getRandomValues(new Uint8Array(12)));
  } catch (e) {
    return uid() + uid();
  }
};
const fmtTime = (ts) => new Date(ts).toLocaleTimeString("ar-u-nu-latn", { hour: "2-digit", minute: "2-digit" });
function emptyDb() {
  return { demo: false, users: [], members: [], activity: {}, stealing: {}, chests: [], warnings: [], events: [], attendance: {}, kicks: [], audit: [] };
}
function demoData() {
  const t = todayKey(), w = weekStart(t), pw = addDays(w, -7);
  const base = [
    ["\u0630\u0626\u0628 \u0627\u0644\u0635\u062D\u0631\u0627\u0621", "48213907", "\u0646\u0627\u0626\u0628"],
    ["\u0627\u0644\u0641\u0647\u062F \u0627\u0644\u0623\u0633\u0648\u062F", "39157264", "\u0646\u0627\u0626\u0628"],
    ["\u0638\u0644 \u0627\u0644\u0644\u064A\u0644", "51073482", "\u0634\u064A\u062E"],
    ["\u0635\u0642\u0631 \u0627\u0644\u0634\u0645\u0627\u0644", "27649135", "\u0645\u0634\u0631\u0641"],
    ["\u062D\u0627\u0631\u0633 \u0627\u0644\u0638\u0644\u0627\u0645", "60418829", "\u0634\u064A\u062E"],
    ["\u0631\u0639\u062F", "33902716", "\u0639\u0636\u0648"],
    ["\u0646\u0645\u0631 \u0627\u0644\u062C\u0628\u0644", "71526043", "\u0639\u0636\u0648"],
    ["\u0634\u0628\u062D \u0627\u0644\u063A\u0627\u0628\u0629", "44871350", "\u0639\u0636\u0648"],
    ["\u0627\u0644\u062C\u0648\u0643\u0631", "58209417", "\u0639\u0636\u0648"],
    ["\u0641\u0627\u0631\u0633 \u0627\u0644\u0644\u064A\u0644", "66034871", "\u0639\u0636\u0648"],
    ["\u0632\u0627\u0626\u0631_2291", "90817723", "\u0639\u0636\u0648"]
  ];
  const members = base.map((b, i) => ({ id: "m" + (i + 1), name: b[0], weid: b[1], rank: b[2], joined: addDays(t, -(25 + i * 19)), fake: i === 10 }));
  const cur = [1320, 1105, 980, 1240, 860, 905, 720, 1010, 640, 870];
  const prev = [1180, 990, 1020, 870, 940, 760, 1105, 905, 880, 910];
  const activity = { [w]: {}, [pw]: {} };
  members.forEach((m, i) => {
    if (i < 10) {
      activity[w][m.id] = cur[i];
      activity[pw][m.id] = prev[i];
    }
  });
  const stealing = {};
  for (let d = 0; d <= 13; d++) {
    const k = addDays(t, -d);
    stealing[k] = {};
    members.forEach((m, i) => {
      if (i < 10) {
        const v = (i * 3 + d * 2 + 1) % 7;
        if (v > 0) stealing[k][m.id] = v;
      }
    });
  }
  const mk = (type, i, date, note) => ({ id: uid(), type, memberId: members[i].id, memberName: members[i].name, date, note, by: "\u0646\u0627\u0626\u0628 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642" });
  const att = {};
  members.slice(0, 6).forEach((m, i) => {
    att[m.id] = { in: Date.now() - (i + 2) * 36e5, out: i === 4 ? Date.now() - 36e5 : null };
  });
  return {
    demo: true,
    members,
    activity,
    stealing,
    chests: [
      mk("rare", 0, addDays(t, -1), "\u0623\u0639\u0644\u0649 \u0646\u0634\u0627\u0637 \u0641\u064A \u0627\u0644\u0623\u0633\u0628\u0648\u0639"),
      mk("advanced", 3, addDays(t, -1), "\u062F\u0639\u0645 \u0645\u0633\u062A\u0645\u0631 \u0644\u0644\u0642\u0628\u064A\u0644\u0629"),
      mk("normal", 5, addDays(t, -2), "\u0641\u0627\u0626\u0632 \u0644\u0639\u0628\u0629 \u0627\u0644\u0623\u0633\u0631\u0627\u0631"),
      mk("normal", 7, addDays(t, -2), "\u0641\u0627\u0626\u0632 \u0644\u0639\u0628\u0629 \u0627\u0644\u0623\u0633\u0631\u0627\u0631"),
      mk("advanced", 1, addDays(t, -8), "\u0646\u0634\u0627\u0637 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0645\u0627\u0636\u064A")
    ],
    warnings: [
      { id: uid(), memberId: "m9", memberName: members[8].name, reason: "\u0646\u0634\u0627\u0637 \u0623\u0642\u0644 \u0645\u0646 900", date: addDays(t, -3), by: "\u0645\u0634\u0631\u0641" },
      { id: uid(), memberId: "m7", memberName: members[6].name, reason: "\u063A\u064A\u0627\u0628 \u0639\u0646 \u0641\u0639\u0627\u0644\u064A\u0629", date: addDays(t, -9), by: "\u0646\u0627\u0626\u0628 \u0627\u0644\u0646\u0634\u0627\u0637" }
    ],
    events: [
      { id: uid(), title: "\u0647\u062C\u0648\u0645 \u0627\u0644\u0642\u0628\u064A\u0644\u0629 \u0627\u0644\u0643\u0628\u064A\u0631", date: addDays(t, 2), desc: "\u0627\u0644\u062A\u062C\u0645\u0639 \u0642\u0628\u0644 \u0627\u0644\u0647\u062C\u0648\u0645 \u0628\u0646\u0635\u0641 \u0633\u0627\u0639\u0629. \u0627\u0644\u062D\u0636\u0648\u0631 \u0625\u0644\u0632\u0627\u0645\u064A \u0644\u0623\u0635\u062D\u0627\u0628 \u0641\u0631\u0635 \u0627\u0644\u0633\u0631\u0642\u0627\u062A.", by: "\u0627\u0644\u0631\u0626\u064A\u0633" },
      { id: uid(), title: "\u0628\u0637\u0648\u0644\u0629 \u0627\u0644\u0623\u0633\u0631\u0627\u0631 \u0627\u0644\u0645\u0635\u063A\u0651\u0631\u0629", date: addDays(t, 6), desc: "\u0645\u0633\u0627\u0628\u0642\u0629 \u0623\u0633\u0628\u0648\u0639\u064A\u0629\u060C \u0648\u0627\u0644\u062C\u0648\u0627\u0626\u0632 \u0635\u0646\u0627\u062F\u064A\u0642 \u0639\u0627\u062F\u064A\u0629 \u0644\u0644\u0641\u0627\u0626\u0632\u064A\u0646.", by: "\u0646\u0627\u0626\u0628 \u0627\u0644\u0646\u0634\u0627\u0637" },
      { id: uid(), title: "\u0627\u062C\u062A\u0645\u0627\u0639 \u0627\u0644\u0645\u0634\u0631\u0641\u064A\u0646", date: addDays(t, -4), desc: "\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A \u0648\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u0647\u0627\u0645.", by: "\u0627\u0644\u0631\u0626\u064A\u0633" }
    ],
    attendance: { [t]: att },
    kicks: [
      { id: uid(), name: "\u0645\u062E\u0631\u0651\u0628_\u0627\u0644\u0623\u0633\u0631\u0627\u0631", weid: "12345678", reason: "\u0646\u0634\u0631 \u0631\u0648\u0627\u0628\u0637 \u0645\u062E\u0627\u0644\u0641\u0629 \u062F\u0627\u062E\u0644 \u0627\u0644\u0642\u0628\u064A\u0644\u0629", date: addDays(t, -12), by: "\u0627\u0644\u0631\u0626\u064A\u0633" }
    ]
  };
}
function loadDb() {
  try {
    const r = localStorage.getItem(KEY);
    if (r) {
      const d = JSON.parse(r);
      if (d && Array.isArray(d.users)) return d;
    }
  } catch (e) {
  }
  return emptyDb();
}
function loadSession() {
  try {
    return localStorage.getItem(SESSION) || null;
  } catch (e) {
    return null;
  }
}
const Ctx = createContext(null);
const useApp = () => useContext(Ctx);
const Badge = ({ tone = "gold", icon, children }) => /* @__PURE__ */ React.createElement("span", { className: `badge badge-${tone}` }, icon ? /* @__PURE__ */ React.createElement(Icon, { n: icon, size: 12, sw: 2.2 }) : null, children);
const Btn = ({ kind = "ghost", icon, children, className = "", ...p }) => /* @__PURE__ */ React.createElement("button", { type: "button", className: `btn btn-${kind} ${className}`, ...p }, icon ? /* @__PURE__ */ React.createElement(Icon, { n: icon, size: 18 }) : null, children);
const Field = ({ label, hint, children }) => /* @__PURE__ */ React.createElement("label", { className: "field" }, /* @__PURE__ */ React.createElement("span", { className: "field-label" }, label), children, hint ? /* @__PURE__ */ React.createElement("span", { className: "field-hint" }, hint) : null);
const SearchBox = ({ id, value, onChange, placeholder = "\u0627\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0645\u0639\u0631\u0651\u0641" }) => /* @__PURE__ */ React.createElement("div", { className: "search" }, /* @__PURE__ */ React.createElement(Icon, { n: "Search", size: 18 }), /* @__PURE__ */ React.createElement("input", { id, value, onChange: (e) => onChange(e.target.value), placeholder, "aria-label": placeholder }));
const Empty = ({ icon = "Skull", title, text }) => /* @__PURE__ */ React.createElement("div", { className: "empty" }, /* @__PURE__ */ React.createElement(Icon, { n: icon, size: 32, className: "t-gold" }), /* @__PURE__ */ React.createElement("b", null, title), text ? /* @__PURE__ */ React.createElement("span", null, text) : null);
function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "sheet-wrap", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "sheet", role: "dialog", "aria-modal": "true", "aria-label": title, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "sheet-grab" }), /* @__PURE__ */ React.createElement("div", { className: "sheet-head" }, /* @__PURE__ */ React.createElement("h2", { className: "sheet-title" }, title), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", onClick: onClose, "aria-label": "\u0625\u063A\u0644\u0627\u0642" }, /* @__PURE__ */ React.createElement(Icon, { n: "X" }))), /* @__PURE__ */ React.createElement("div", { className: "sheet-body" }, children)));
}
function DeleteBtn({ onDelete, label = "\u062D\u0630\u0641", icon = "Trash2" }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(t);
  }, [armed]);
  return armed ? /* @__PURE__ */ React.createElement(Btn, { kind: "danger", className: "btn-sm", icon: "AlertTriangle", onClick: onDelete }, "\u062A\u0623\u0643\u064A\u062F") : /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", "aria-label": label, onClick: () => setArmed(true) }, /* @__PURE__ */ React.createElement(Icon, { n: icon, size: 18, className: "t-mute" }));
}
function DayNav({ day, setDay }) {
  const t = todayKey();
  return /* @__PURE__ */ React.createElement("div", { className: "daynav" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", "aria-label": "\u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u0633\u0627\u0628\u0642", onClick: () => setDay(addDays(day, -1)) }, /* @__PURE__ */ React.createElement(Icon, { n: "ChevronRight" })), /* @__PURE__ */ React.createElement("div", { className: "daynav-mid" }, /* @__PURE__ */ React.createElement("strong", null, day === t ? "\u0627\u0644\u064A\u0648\u0645" : fmt(day, { weekday: "long" })), /* @__PURE__ */ React.createElement("span", null, fmtFull(day))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", "aria-label": "\u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u062A\u0627\u0644\u064A", disabled: day >= t, onClick: () => setDay(addDays(day, 1)) }, /* @__PURE__ */ React.createElement(Icon, { n: "ChevronLeft" })));
}
function WeekNav({ wk, setWk }) {
  const cur = weekStart(todayKey());
  return /* @__PURE__ */ React.createElement("div", { className: "daynav" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", "aria-label": "\u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0633\u0627\u0628\u0642", onClick: () => setWk(addDays(wk, -7)) }, /* @__PURE__ */ React.createElement(Icon, { n: "ChevronRight" })), /* @__PURE__ */ React.createElement("div", { className: "daynav-mid" }, /* @__PURE__ */ React.createElement("strong", null, wk === cur ? "\u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u062D\u0627\u0644\u064A" : "\u0623\u0633\u0628\u0648\u0639 \u0633\u0627\u0628\u0642"), /* @__PURE__ */ React.createElement("span", null, fmtShort(wk), " \u2013 ", fmtShort(addDays(wk, 6)))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", "aria-label": "\u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u062A\u0627\u0644\u064A", disabled: wk >= cur, onClick: () => setWk(addDays(wk, 7)) }, /* @__PURE__ */ React.createElement(Icon, { n: "ChevronLeft" })));
}
function SaveBar({ count, onSave, onCancel, label }) {
  if (!count) return null;
  return /* @__PURE__ */ React.createElement("div", { className: "savebar-wrap gutter" }, /* @__PURE__ */ React.createElement("div", { className: "savebar col" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 text-[13.5px]" }, count, " ", count === 1 ? "\u062A\u0639\u062F\u064A\u0644 \u063A\u064A\u0631 \u0645\u062D\u0641\u0648\u0638" : "\u062A\u0639\u062F\u064A\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u0641\u0648\u0638\u0629"), /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", onClick: onCancel }, "\u062A\u0631\u0627\u062C\u0639"), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", className: "btn-sm", icon: "Check", onClick: onSave }, label)));
}
function useDraft(src, key) {
  const [d, setD] = useState({});
  useEffect(() => {
    setD({});
  }, [key]);
  const base = (id) => src[id] === void 0 ? "" : String(src[id]);
  const val = (id) => d[id] !== void 0 ? d[id] : base(id);
  const set = (id, v) => setD((p) => ({ ...p, [id]: v }));
  const dirty = Object.keys(d).filter((id) => d[id] !== base(id));
  return { d, val, set, dirty, reset: () => setD({}) };
}
function Splash({ onDone }) {
  const [stage, setStage] = useState(0);
  const cv = useRef(null);
  const reduce = useMemo(() => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  useEffect(() => {
    const T = reduce ? [100, 500, 900, 1500] : [350, 1500, 3100, 4400];
    const ids = [
      setTimeout(() => setStage(1), T[0]),
      setTimeout(() => setStage(2), T[1]),
      setTimeout(() => setStage(3), T[2]),
      setTimeout(onDone, T[3])
    ];
    return () => ids.forEach(clearTimeout);
  }, []);
  useEffect(() => {
    if (reduce) return;
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let raf, W = 0, H = 0;
    const resize = () => {
      const r = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      c.width = W * r;
      c.height = H * r;
      ctx.setTransform(r, 0, 0, r, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const P = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + 0.4, v: Math.random() * 0.6 + 0.2, a: Math.random() * 0.6 + 0.2, ph: Math.random() * 6.28 }));
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      P.forEach((p) => {
        p.y -= p.v;
        p.ph += 0.02;
        p.x += Math.sin(p.ph) * 0.3;
        if (p.y < -5) {
          p.y = H + 5;
          p.x = Math.random() * W;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(212,175,55,${p.a})`;
        ctx.shadowColor = "#d4af37";
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  const cls = stage >= 3 ? "open" : stage === 2 ? "s2" : stage === 1 ? "s1" : "";
  return /* @__PURE__ */ React.createElement("div", { className: `splash ${cls}`, "aria-label": "\u0634\u0627\u0634\u0629 \u0627\u0644\u062F\u062E\u0648\u0644" }, /* @__PURE__ */ React.createElement("div", { className: "door door-l" }), /* @__PURE__ */ React.createElement("div", { className: "door door-r" }), /* @__PURE__ */ React.createElement("canvas", { ref: cv }), /* @__PURE__ */ React.createElement("div", { className: "splash-logo" }, /* @__PURE__ */ React.createElement("div", { className: "splash-glow" }), /* @__PURE__ */ React.createElement(Logo, { size: 150, id: "lgs" }), /* @__PURE__ */ React.createElement("div", { className: "splash-word" }, /* @__PURE__ */ React.createElement("div", { className: "splash-soa gold-text", lang: "en" }, "SOA"), /* @__PURE__ */ React.createElement("div", { className: "splash-ar" }, "\u0623\u0628\u0646\u0627\u0621 \u0627\u0644\u0641\u0648\u0636\u0649"))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "splash-skip", onClick: onDone }, "\u062A\u062E\u0637\u064A"));
}
function AuthShell({ sub, children }) {
  return /* @__PURE__ */ React.createElement("div", { className: "login gutter" }, /* @__PURE__ */ React.createElement("div", { className: "col" }, /* @__PURE__ */ React.createElement("div", { className: "login-logo" }, /* @__PURE__ */ React.createElement(Logo, { size: 92, id: "lgl" }), /* @__PURE__ */ React.createElement("div", { className: "disp gold-text", style: { fontSize: 30, fontWeight: 700, lineHeight: 1.2 } }, "\u0623\u0628\u0646\u0627\u0621 \u0627\u0644\u0641\u0648\u0636\u0649"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, sub)), children));
}
function PwInput({ id, value, onChange, show, setShow, placeholder = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", autoComplete = "off" }) {
  return /* @__PURE__ */ React.createElement("div", { className: "pw-wrap" }, /* @__PURE__ */ React.createElement("input", { id, className: "input", type: show ? "text" : "password", value, autoComplete, autoCapitalize: "off", onChange: (e) => onChange(e.target.value), placeholder }), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", onClick: () => setShow((s) => !s), "aria-label": show ? "\u0625\u062E\u0641\u0627\u0621 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" : "\u0625\u0638\u0647\u0627\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" }, /* @__PURE__ */ React.createElement(Icon, { n: show ? "EyeOff" : "Eye", size: 20 })));
}
function Setup({ onCreate }) {
  const [f, setF] = useState({ name: "", weid: "", pw: "", pw2: "", demo: false });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const idOk = norm(f.weid).length >= 4;
  const pwShort = f.pw.length > 0 && f.pw.length < MIN_PW;
  const mismatch = f.pw2.length > 0 && f.pw !== f.pw2;
  const ok = f.name.trim() && idOk && f.pw.length >= MIN_PW && f.pw === f.pw2;
  const submit = async (e) => {
    e.preventDefault();
    if (!ok || busy) return;
    setBusy(true);
    await onCreate({ name: f.name.trim(), weid: norm(f.weid), pw: f.pw, demo: f.demo });
  };
  return /* @__PURE__ */ React.createElement(AuthShell, { sub: "\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u0646\u0638\u0627\u0645 \u0644\u0623\u0648\u0644 \u0645\u0631\u0629" }, /* @__PURE__ */ React.createElement("form", { className: "login-card", onSubmit: submit }, /* @__PURE__ */ React.createElement("h1", { className: "h-sec", style: { fontSize: 19 } }, "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0631\u0626\u064A\u0633"), /* @__PURE__ */ React.createElement("div", { className: "note gold" }, /* @__PURE__ */ React.createElement(Icon, { n: "Crown", size: 20 }), /* @__PURE__ */ React.createElement("div", null, "\u0623\u0646\u062A \u0623\u0648\u0644 \u0645\u0633\u062C\u0651\u0644\u060C \u0641\u0633\u062A\u0635\u0628\u062D \u0627\u0644\u0631\u0626\u064A\u0633 \u0628\u0643\u0627\u0645\u0644 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A. \u0648\u0645\u0646 \xAB\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A\xBB \u062A\u0646\u0634\u0626 \u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0646\u0648\u0627\u0628 \u0648\u0627\u0644\u0634\u064A\u0648\u062E \u0648\u0627\u0644\u0645\u0634\u0631\u0641\u064A\u0646.")), /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0633\u0645 \u0627\u0644\u0631\u0626\u064A\u0633" }, /* @__PURE__ */ React.createElement("input", { id: "su-name", className: "input", value: f.name, onChange: (e) => setF({ ...f, name: e.target.value }), placeholder: "\u0627\u0633\u0645\u0643 \u062F\u0627\u062E\u0644 \u0627\u0644\u0644\u0639\u0628\u0629" })), /* @__PURE__ */ React.createElement(Field, { label: "\u0645\u0639\u0631\u0651\u0641 WePlay" }, /* @__PURE__ */ React.createElement("input", { id: "su-weid", className: "input mono", inputMode: "text", autoComplete: "off", value: f.weid, onChange: (e) => setF({ ...f, weid: e.target.value }), placeholder: "\u0645\u062B\u0627\u0644: 48213907" })), /* @__PURE__ */ React.createElement(Field, { label: `\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 (${MIN_PW} \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644)` }, /* @__PURE__ */ React.createElement(PwInput, { id: "su-pw", value: f.pw, onChange: (v) => setF({ ...f, pw: v }), show, setShow, autoComplete: "new-password" })), /* @__PURE__ */ React.createElement(Field, { label: "\u062A\u0623\u0643\u064A\u062F \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" }, /* @__PURE__ */ React.createElement(PwInput, { id: "su-pw2", value: f.pw2, onChange: (v) => setF({ ...f, pw2: v }), show, setShow, autoComplete: "new-password" })), pwShort ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0642\u0635\u064A\u0631\u0629.") : null, mismatch ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "\u0643\u0644\u0645\u062A\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u062A\u064A\u0646.") : null, /* @__PURE__ */ React.createElement("label", { className: "row", style: { gap: 10, fontSize: 14 } }, /* @__PURE__ */ React.createElement("input", { id: "su-demo", type: "checkbox", checked: f.demo, onChange: (e) => setF({ ...f, demo: e.target.checked }), style: { width: 20, height: 20, accentColor: "#d4af37" } }), "\u0627\u0628\u062F\u0623 \u0628\u0623\u0639\u0636\u0627\u0621 \u0648\u0628\u064A\u0627\u0646\u0627\u062A \u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0644\u0644\u0645\u0639\u0627\u064A\u0646\u0629"), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", className: "btn-block", icon: "Crown", type: "submit", disabled: !ok || busy }, "\u062A\u0633\u062C\u064A\u0644 \u0648\u0628\u062F\u0621 \u0627\u0644\u0646\u0638\u0627\u0645"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { textAlign: "center" } }, "\u0627\u062D\u0641\u0638 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0641\u064A \u0645\u0643\u0627\u0646 \u0622\u0645\u0646. \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0633\u062A\u0631\u062C\u0627\u0639\u0647\u0627 \u0644\u0627\u062D\u0642\u0627\u064B.")));
}
function Login({ db, onLogin, onFail }) {
  const [weid, setWeid] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [fails, setFails] = useState(0);
  const [lock, setLock] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!lock) return;
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= lock) {
        setLock(0);
        setFails(0);
        setErr("");
      }
    }, 500);
    return () => clearInterval(t);
  }, [lock]);
  const locked = lock > 0 && now < lock;
  const submit = async (e) => {
    e.preventDefault();
    if (locked || busy) return;
    setBusy(true);
    const id = norm(weid).toLowerCase();
    const u = id ? db.users.find((x) => norm(x.weid).toLowerCase() === id) : null;
    const ok = !!u && await hashPw(pw, u.salt) === u.hash;
    setBusy(false);
    if (!ok) {
      const nf2 = fails + 1;
      setFails(nf2);
      onFail(norm(weid) || "\u0641\u0627\u0631\u063A");
      if (nf2 >= 5) {
        setLock(Date.now() + 3e4);
        setNow(Date.now());
      }
      setErr("\u0627\u0644\u0645\u0639\u0631\u0651\u0641 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629. \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u064A \u0633\u0644\u0651\u0645\u0647\u0627 \u0644\u0643 \u0627\u0644\u0631\u0626\u064A\u0633.");
      return;
    }
    onLogin(u);
  };
  return /* @__PURE__ */ React.createElement(AuthShell, { sub: "\u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0642\u0628\u064A\u0644\u0629" }, /* @__PURE__ */ React.createElement("form", { className: "login-card", onSubmit: submit }, /* @__PURE__ */ React.createElement(Field, { label: "\u0645\u0639\u0631\u0651\u0641 WePlay" }, /* @__PURE__ */ React.createElement("input", { id: "login-weid", className: "input mono", autoComplete: "username", autoCapitalize: "off", value: weid, onChange: (e) => {
    setWeid(e.target.value);
    setErr("");
  }, placeholder: "\u0645\u062B\u0627\u0644: 48213907" })), /* @__PURE__ */ React.createElement(Field, { label: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" }, /* @__PURE__ */ React.createElement(PwInput, { id: "login-pw", value: pw, onChange: (v) => {
    setPw(v);
    setErr("");
  }, show, setShow, autoComplete: "current-password" })), locked ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad", role: "alert" }, /* @__PURE__ */ React.createElement(Icon, { n: "Lock", size: 16 }), "\u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0643\u062B\u064A\u0631\u0629. \u0627\u0646\u062A\u0638\u0631 ", Math.ceil((lock - now) / 1e3), " \u062B\u0627\u0646\u064A\u0629 \u062B\u0645 \u062D\u0627\u0648\u0644 \u0645\u062C\u062F\u062F\u0627\u064B.") : err ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad", role: "alert" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), err) : null, /* @__PURE__ */ React.createElement(Btn, { kind: "gold", className: "btn-block", icon: "Lock", type: "submit", disabled: locked || busy || !weid.trim() || !pw }, "\u062F\u062E\u0648\u0644"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { textAlign: "center" } }, "\u0644\u0643\u0644 \u0645\u0633\u0624\u0648\u0644 \u0645\u0639\u0631\u0651\u0641 \u0648\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u064A\u062D\u062F\u062F\u0647\u0645\u0627 \u0627\u0644\u0631\u0626\u064A\u0633. \u0644\u0627 \u062A\u0634\u0627\u0631\u0643\u0647\u0645\u0627 \u0645\u0639 \u0623\u062D\u062F.")));
}
function WarnForm({ member, onDone }) {
  const { me, mutate, notify, db } = useApp();
  const [reason, setReason] = useState("");
  const count = db.warnings.filter((w) => w.memberId === member.id).length;
  const submit = () => {
    const r = reason.trim();
    if (!r) return;
    mutate((n) => {
      n.warnings.unshift({ id: uid(), memberId: member.id, memberName: member.name, reason: r, date: todayKey(), by: me.name });
    }, `\u0625\u0646\u0630\u0627\u0631 \u0644\u0644\u0639\u0636\u0648 ${member.name}: ${r}`);
    notify(`\u062A\u0645 \u0625\u0635\u062F\u0627\u0631 \u0625\u0646\u0630\u0627\u0631 \u0644\u0640 ${member.name}`);
    onDone();
  };
  return /* @__PURE__ */ React.createElement("div", { className: "form" }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "avatar" }, initial(member.name)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600 } }, member.name), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "\u0625\u0646\u0630\u0627\u0631\u0627\u062A \u0633\u0627\u0628\u0642\u0629: ", count))), /* @__PURE__ */ React.createElement("div", { className: "chips", role: "group", "aria-label": "\u0623\u0633\u0628\u0627\u0628 \u062C\u0627\u0647\u0632\u0629" }, WARN_REASONS.map((r) => /* @__PURE__ */ React.createElement("button", { type: "button", key: r, className: `chip ${reason === r ? "on" : ""}`, onClick: () => setReason(r) }, r))), /* @__PURE__ */ React.createElement(Field, { label: "\u0633\u0628\u0628 \u0627\u0644\u0625\u0646\u0630\u0627\u0631" }, /* @__PURE__ */ React.createElement("textarea", { id: "warn-reason", className: "input", value: reason, onChange: (e) => setReason(e.target.value), placeholder: "\u0627\u0643\u062A\u0628 \u0627\u0644\u0633\u0628\u0628 \u0628\u0648\u0636\u0648\u062D" })), /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: "ShieldAlert", className: "btn-block", disabled: !reason.trim(), onClick: submit }, "\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0625\u0646\u0630\u0627\u0631"));
}
function MemberSheet({ id, onClose }) {
  const { db, me, mutate, notify } = useApp();
  const [mode, setMode] = useState("view");
  const [form, setForm] = useState({});
  const [kickReason, setKickReason] = useState("");
  const m = db.members.find((x) => x.id === id);
  if (!m) return null;
  const t = todayKey(), wk = weekStart(t);
  const pts = db.activity[wk] ? db.activity[wk][m.id] : void 0;
  const low = pts !== void 0 && pts < THRESHOLD;
  const steal = db.stealing[t] && db.stealing[t][m.id] || 0;
  const warns = db.warnings.filter((w) => w.memberId === m.id);
  const attRec = (db.attendance[t] || {})[m.id];
  const present = !!attRec;
  const canEdit = can.members(me.role);
  const startEdit = () => {
    setForm({ name: m.name, weid: m.weid, rank: m.rank, joined: m.joined });
    setMode("edit");
  };
  const idn = norm(form.weid || "").toLowerCase();
  const dupMember = idn && db.members.find((x) => x.id !== m.id && norm(x.weid).toLowerCase() === idn);
  const banned = idn && db.kicks.find((k) => norm(k.weid).toLowerCase() === idn);
  const saveEdit = () => {
    mutate((n) => {
      const x = n.members.find((y) => y.id === m.id);
      x.name = form.name.trim();
      x.weid = norm(form.weid);
      x.rank = form.rank;
      x.joined = form.joined;
    }, `\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0639\u0636\u0648 ${m.name}`);
    notify("\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A");
    setMode("view");
  };
  const togglePresent = () => {
    mutate((n) => {
      const a = n.attendance[t] || {};
      if (a[m.id]) delete a[m.id];
      else a[m.id] = { in: Date.now(), out: null };
      n.attendance[t] = a;
    });
    notify(present ? "\u0623\u064F\u0644\u063A\u064A \u062D\u0636\u0648\u0631 \u0627\u0644\u064A\u0648\u0645" : `\u0633\u064F\u062C\u0651\u0644 \u062D\u0636\u0648\u0631 ${m.name}`);
  };
  const toggleFake = () => {
    mutate((n) => {
      const x = n.members.find((y) => y.id === m.id);
      x.fake = !x.fake;
    }, `${m.fake ? "\u0625\u0632\u0627\u0644\u0629 \u0648\u0633\u0645" : "\u0648\u0633\u0645"} \u062D\u0633\u0627\u0628 \u0648\u0647\u0645\u064A: ${m.name}`);
  };
  const kick = () => {
    const r = kickReason.trim() || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F";
    mutate((n) => {
      n.members = n.members.filter((x) => x.id !== m.id);
      n.kicks.unshift({ id: uid(), name: m.name, weid: m.weid, reason: r, date: todayKey(), by: me.name });
    }, `\u0637\u0631\u062F \u0627\u0644\u0639\u0636\u0648 ${m.name} (${r})`);
    notify(`\u0646\u064F\u0642\u0644 ${m.name} \u0625\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0631\u062F`);
    onClose();
  };
  if (mode === "warn") return /* @__PURE__ */ React.createElement(Sheet, { title: "\u0625\u0635\u062F\u0627\u0631 \u0625\u0646\u0630\u0627\u0631", onClose: () => setMode("view") }, /* @__PURE__ */ React.createElement(WarnForm, { member: m, onDone: () => setMode("view") }));
  if (mode === "edit") return /* @__PURE__ */ React.createElement(Sheet, { title: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0639\u0636\u0648", onClose: () => setMode("view") }, /* @__PURE__ */ React.createElement("div", { className: "form" }, /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0644\u0627\u0633\u0645" }, /* @__PURE__ */ React.createElement("input", { id: "edit-name", className: "input", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) })), /* @__PURE__ */ React.createElement(Field, { label: "\u0645\u0639\u0631\u0651\u0641 WePlay" }, /* @__PURE__ */ React.createElement("input", { id: "edit-weid", className: "input mono", value: form.weid, onChange: (e) => setForm({ ...form, weid: e.target.value }) })), dupMember ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "\u0647\u0630\u0627 \u0627\u0644\u0645\u0639\u0631\u0651\u0641 \u0645\u0633\u062C\u0651\u0644 \u0644\u0644\u0639\u0636\u0648 ", dupMember.name) : null, banned ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "Ban", size: 16 }), "\u0647\u0630\u0627 \u0627\u0644\u0645\u0639\u0631\u0651\u0641 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0631\u062F") : null, /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0644\u0631\u062A\u0628\u0629" }, /* @__PURE__ */ React.createElement("select", { id: "edit-rank", className: "input", value: form.rank, onChange: (e) => setForm({ ...form, rank: e.target.value }) }, RANKS.map((r) => /* @__PURE__ */ React.createElement("option", { key: r }, r)))), /* @__PURE__ */ React.createElement(Field, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u0636\u0645\u0627\u0645" }, /* @__PURE__ */ React.createElement("input", { id: "edit-joined", type: "date", className: "input", value: form.joined, onChange: (e) => setForm({ ...form, joined: e.target.value }) })), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "Check", className: "btn-block", disabled: !form.name.trim() || !idn || !!dupMember || !!banned, onClick: saveEdit }, "\u062D\u0641\u0638")));
  if (mode === "kick") return /* @__PURE__ */ React.createElement(Sheet, { title: "\u0637\u0631\u062F \u0627\u0644\u0639\u0636\u0648", onClose: () => setMode("view") }, /* @__PURE__ */ React.createElement("div", { className: "form" }, /* @__PURE__ */ React.createElement("div", { className: "note warn" }, /* @__PURE__ */ React.createElement(Icon, { n: "UserX", size: 20 }), /* @__PURE__ */ React.createElement("div", null, "\u0633\u064A\u064F\u062D\u0630\u0641 ", m.name, " \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0648\u064A\u064F\u0636\u0627\u0641 \u0645\u0639\u0631\u0651\u0641\u0647 \u0625\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0631\u062F\u060C \u0641\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0633\u062C\u064A\u0644\u0647 \u0645\u0646 \u062C\u062F\u064A\u062F.")), /* @__PURE__ */ React.createElement(Field, { label: "\u0633\u0628\u0628 \u0627\u0644\u0637\u0631\u062F" }, /* @__PURE__ */ React.createElement("textarea", { id: "kick-reason", className: "input", value: kickReason, onChange: (e) => setKickReason(e.target.value), placeholder: "\u0645\u062B\u0627\u0644: \u063A\u064A\u0627\u0628 \u0637\u0648\u064A\u0644 \u0628\u0644\u0627 \u0639\u0630\u0631" })), /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: "UserX", className: "btn-block", onClick: kick }, "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0637\u0631\u062F")));
  return /* @__PURE__ */ React.createElement(Sheet, { title: "\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0639\u0636\u0648", onClose }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "avatar", style: { width: 54, height: 54, fontSize: 24 } }, initial(m.name)), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 18 } }, m.name), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5 mt-1" }, /* @__PURE__ */ React.createElement(Badge, { tone: "gold" }, m.rank), m.fake ? /* @__PURE__ */ React.createElement(Badge, { tone: "fake", icon: "UserX" }, "\u062D\u0633\u0627\u0628 \u0648\u0647\u0645\u064A") : null, low ? /* @__PURE__ */ React.createElement(Badge, { tone: "danger", icon: "AlertTriangle" }, "\u062A\u062D\u0630\u064A\u0631") : null, pts !== void 0 && !low && !m.fake ? /* @__PURE__ */ React.createElement(Badge, { tone: "ok", icon: "Check" }, "\u0646\u0634\u0637") : null))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { paddingBlock: 4 } }, /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "\u0645\u0639\u0631\u0651\u0641 WePlay"), /* @__PURE__ */ React.createElement("span", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "mono" }, m.weid), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", style: { width: 32, height: 32 }, "aria-label": "\u0646\u0633\u062E \u0627\u0644\u0645\u0639\u0631\u0651\u0641", onClick: () => copyText(m.weid, notify) }, /* @__PURE__ */ React.createElement(Icon, { n: "Copy", size: 16 })))), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u0636\u0645\u0627\u0645"), /* @__PURE__ */ React.createElement("span", null, fmtFull(m.joined))), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "\u0646\u0634\u0627\u0637 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639"), /* @__PURE__ */ React.createElement("span", { className: `mono ${low ? "t-danger" : ""}` }, pts === void 0 ? "\u0644\u0645 \u064A\u064F\u0633\u062C\u064E\u0651\u0644" : nf(pts))), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "\u0641\u0631\u0635 \u0627\u0644\u0633\u0631\u0642\u0627\u062A \u0627\u0644\u064A\u0648\u0645"), /* @__PURE__ */ React.createElement("span", { className: "mono" }, steal)), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "\u0627\u0644\u062D\u0636\u0648\u0631 \u0627\u0644\u064A\u0648\u0645"), /* @__PURE__ */ React.createElement("span", null, !attRec ? "\u0644\u0645 \u064A\u064F\u0633\u062C\u064E\u0651\u0644" : attRec.out ? `\u0627\u0646\u0635\u0631\u0641 ${fmtTime(attRec.out)}` : `\u062D\u0627\u0636\u0631${attRec.in ? " \u0645\u0646\u0630 " + fmtTime(attRec.in) : ""}`)), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "\u0627\u0644\u0625\u0646\u0630\u0627\u0631\u0627\u062A"), /* @__PURE__ */ React.createElement("span", { className: warns.length ? "t-danger" : "" }, warns.length))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: "ShieldAlert", onClick: () => setMode("warn") }, "\u0625\u0635\u062F\u0627\u0631 \u0625\u0646\u0630\u0627\u0631"), /* @__PURE__ */ React.createElement(Btn, { icon: present ? "RotateCcw" : "UserCheck", onClick: togglePresent }, present ? "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062D\u0636\u0648\u0631" : "\u062A\u0633\u062C\u064A\u0644 \u062D\u0636\u0648\u0631"), canEdit ? /* @__PURE__ */ React.createElement(Btn, { icon: "Pencil", onClick: startEdit }, "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A") : null, canEdit ? /* @__PURE__ */ React.createElement(Btn, { icon: "UserX", onClick: toggleFake }, m.fake ? "\u0625\u0632\u0627\u0644\u0629 \u0648\u0633\u0645 \u0627\u0644\u0648\u0647\u0645\u064A" : "\u0648\u0633\u0645 \u062D\u0633\u0627\u0628 \u0648\u0647\u0645\u064A") : null, canEdit ? /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: "Ban", className: "btn-block", style: { gridColumn: "1 / -1" }, onClick: () => setMode("kick") }, "\u0637\u0631\u062F \u0627\u0644\u0639\u0636\u0648") : null), warns.length ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "h-sec", style: { fontSize: 15, marginBottom: 6 } }, "\u0633\u062C\u0644 \u0627\u0644\u0625\u0646\u0630\u0627\u0631\u0627\u062A"), /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, warns.slice(0, 5).map((w) => /* @__PURE__ */ React.createElement("div", { key: w.id, className: "list-row" }, /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name", style: { whiteSpace: "normal" } }, w.reason), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, fmtFull(w.date), " \xB7 \u0628\u0648\u0627\u0633\u0637\u0629 ", w.by)))))) : null);
}
function Home({ openMember, go }) {
  const { db, me, mutate, notify } = useApp();
  const t = todayKey(), wk = weekStart(t);
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");
  const warnCount = useMemo(() => {
    const c = {};
    db.warnings.forEach((w) => {
      c[w.memberId] = (c[w.memberId] || 0) + 1;
    });
    return c;
  }, [db.warnings]);
  const rows = db.members.map((m) => {
    const p = db.activity[wk] ? db.activity[wk][m.id] : void 0;
    return { m, pts: p === void 0 ? null : p, steal: db.stealing[t] && db.stealing[t][m.id] || 0, warns: warnCount[m.id] || 0 };
  });
  const low = (r) => r.pts !== null && r.pts < THRESHOLD;
  const counts = { all: rows.length, active: rows.filter((r) => r.pts !== null && !low(r) && !r.m.fake).length, warn: rows.filter(low).length, fake: rows.filter((r) => r.m.fake).length };
  const shown = rows.filter((r) => matchQ(r.m, q) && (f === "all" || f === "active" && r.pts !== null && !low(r) && !r.m.fake || f === "warn" && low(r) || f === "fake" && r.m.fake));
  const recorded = rows.filter((r) => r.pts !== null);
  const avg = recorded.length ? Math.round(recorded.reduce((s, r) => s + r.pts, 0) / recorded.length) : 0;
  const stealToday = rows.reduce((s, r) => s + r.steal, 0);
  const chestsWeek = db.chests.filter((c) => c.date >= wk).length;
  const clearDemo = () => {
    mutate((n) => {
      n.demo = false;
      n.members = [];
      n.activity = {};
      n.stealing = {};
      n.chests = [];
      n.warnings = [];
      n.events = [];
      n.attendance = {};
      n.kicks = [];
    }, "\u0645\u0633\u062D \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629");
    notify("\u062A\u0645 \u0645\u0633\u062D \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629\u060C \u0627\u0628\u062F\u0623 \u0628\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0623\u0639\u0636\u0627\u0621");
  };
  const [askClear, setAskClear] = useState(false);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, db.demo ? /* @__PURE__ */ React.createElement("div", { className: "note gold" }, /* @__PURE__ */ React.createElement(Icon, { n: "Info", size: 20 }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, "\u0628\u064A\u0627\u0646\u0627\u062A \u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0644\u0644\u0645\u0639\u0627\u064A\u0646\u0629. ", can.leader(me.role) ? "\u0627\u0645\u0633\u062D\u0647\u0627 \u0639\u0646\u062F \u0627\u0644\u0628\u062F\u0621 \u0628\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0641\u0639\u0644\u064A\u0629." : "\u064A\u0645\u0633\u062D\u0647\u0627 \u0627\u0644\u0631\u0626\u064A\u0633 \u0639\u0646\u062F \u0627\u0644\u0628\u062F\u0621.", can.leader(me.role) ? /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, askClear ? /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement(Btn, { kind: "danger", className: "btn-sm", icon: "Trash2", onClick: clearDemo }, "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0633\u062D"), /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", onClick: () => setAskClear(false) }, "\u0625\u0644\u063A\u0627\u0621")) : /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", icon: "Trash2", onClick: () => setAskClear(true) }, "\u0645\u0633\u062D \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629")) : null)) : null, /* @__PURE__ */ React.createElement("div", { className: "strip", "aria-label": "\u0645\u0644\u062E\u0635 \u0627\u0644\u0642\u0628\u064A\u0644\u0629" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, counts.all), /* @__PURE__ */ React.createElement("small", null, "\u0639\u0636\u0648")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { className: counts.warn ? "t-danger" : "" }, counts.warn), /* @__PURE__ */ React.createElement("small", null, "\u062A\u062D\u062A ", THRESHOLD)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { className: "t-gold" }, nf(stealToday)), /* @__PURE__ */ React.createElement("small", null, "\u0633\u0631\u0642\u0627\u062A \u0627\u0644\u064A\u0648\u0645")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, chestsWeek), /* @__PURE__ */ React.createElement("small", null, "\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u0623\u0633\u0628\u0648\u0639"))), recorded.length ? /* @__PURE__ */ React.createElement("div", { className: "sub", style: { marginTop: -6 } }, "\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0646\u0634\u0627\u0637 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639: ", /* @__PURE__ */ React.createElement("b", { className: "mono t-gold" }, nf(avg))) : null, /* @__PURE__ */ React.createElement(SearchBox, { id: "member-search", value: q, onChange: setQ }), /* @__PURE__ */ React.createElement("div", { className: "chips", role: "group", "aria-label": "\u062A\u0635\u0641\u064A\u0629 \u0627\u0644\u0623\u0639\u0636\u0627\u0621" }, [["all", "\u0627\u0644\u0643\u0644"], ["active", "\u0646\u0634\u0637"], ["warn", "\u062A\u062D\u0630\u064A\u0631"], ["fake", "\u0648\u0647\u0645\u064A"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { type: "button", key: k, className: `chip ${f === k ? "on" : ""}`, onClick: () => setF(k) }, l, " ", /* @__PURE__ */ React.createElement("b", null, counts[k])))), shown.length === 0 ? db.members.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "Users", title: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0623\u0639\u0636\u0627\u0621 \u0628\u0639\u062F", text: can.members(me.role) ? "\u0627\u0641\u062A\u062D \xAB\u0627\u0644\u0645\u0632\u064A\u062F\xBB \u062B\u0645 \xAB\u062A\u0633\u062C\u064A\u0644 \u0639\u0636\u0648 \u062C\u062F\u064A\u062F\xBB \u0644\u0625\u0636\u0627\u0641\u0629 \u0623\u0648\u0644 \u0639\u0636\u0648." : "\u064A\u0646\u062A\u0638\u0631 \u0634\u064A\u062E \u0627\u0644\u0642\u0628\u0648\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0623\u0639\u0636\u0627\u0621." }) : /* @__PURE__ */ React.createElement(Empty, { icon: "Search", title: "\u0644\u0627 \u0646\u062A\u0627\u0626\u062C \u0645\u0637\u0627\u0628\u0642\u0629", text: "\u063A\u064A\u0651\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0628\u062D\u062B \u0623\u0648 \u0627\u0644\u062A\u0635\u0641\u064A\u0629." }) : shown.map((r) => {
    const isLow = low(r);
    return /* @__PURE__ */ React.createElement("button", { type: "button", key: r.m.id, className: `mcard ${isLow ? "low" : ""}`, onClick: () => openMember(r.m.id) }, /* @__PURE__ */ React.createElement("div", { className: "row", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("div", { className: "avatar" }, initial(r.m.name)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "mc-name" }, r.m.name), /* @__PURE__ */ React.createElement("div", { className: "mc-sub" }, /* @__PURE__ */ React.createElement("span", null, r.m.rank), /* @__PURE__ */ React.createElement("span", { className: "dot" }), /* @__PURE__ */ React.createElement("span", { className: "mono" }, r.m.weid))), /* @__PURE__ */ React.createElement(Icon, { n: "ChevronLeft", size: 18, className: "t-mute" })), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5" }, r.pts === null ? /* @__PURE__ */ React.createElement(Badge, { tone: "mute" }, "\u0644\u0645 \u064A\u064F\u0633\u062C\u064E\u0651\u0644 \u0646\u0634\u0627\u0637") : isLow ? /* @__PURE__ */ React.createElement(Badge, { tone: "danger", icon: "AlertTriangle" }, "\u062A\u062D\u0630\u064A\u0631") : r.m.fake ? null : /* @__PURE__ */ React.createElement(Badge, { tone: "ok", icon: "Check" }, "\u0646\u0634\u0637"), r.m.fake ? /* @__PURE__ */ React.createElement(Badge, { tone: "fake", icon: "UserX" }, "\u062D\u0633\u0627\u0628 \u0648\u0647\u0645\u064A") : null, r.warns >= 3 ? /* @__PURE__ */ React.createElement(Badge, { tone: "danger", icon: "ShieldAlert" }, "\u0625\u0646\u0630\u0627\u0631\u0627\u062A \u0645\u062A\u0643\u0631\u0631\u0629") : null), /* @__PURE__ */ React.createElement("div", { className: "mc-stats" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("small", null, "\u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A"), /* @__PURE__ */ React.createElement("strong", { className: isLow ? "t-danger" : "" }, r.pts === null ? "\u2014" : nf(r.pts))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("small", null, "\u0641\u0631\u0635 \u0627\u0644\u0633\u0631\u0642\u0627\u062A"), /* @__PURE__ */ React.createElement("strong", { className: "t-gold" }, r.steal)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("small", null, "\u0627\u0644\u0625\u0646\u0630\u0627\u0631\u0627\u062A"), /* @__PURE__ */ React.createElement("strong", { className: r.warns ? "t-danger" : "" }, r.warns))));
  }));
}
function Stealing() {
  const { db, me, mutate, notify } = useApp();
  const edit = can.steal(me.role);
  const [day, setDay] = useState(todayKey());
  const [q, setQ] = useState("");
  const dr = useDraft(db.stealing[day] || {}, day);
  const members = db.members;
  const cnt = (id) => parseInt(dr.val(id), 10) || 0;
  const total = members.reduce((s, m) => s + cnt(m.id), 0);
  const stored = (k) => members.reduce((a, m) => a + ((db.stealing[k] || {})[m.id] || 0), 0);
  const dayT = (k) => k === day ? total : stored(k);
  const wk = weekStart(day);
  let weekTotal = 0;
  for (let i = 0; i < 7; i++) weekTotal += dayT(addDays(wk, i));
  const allTotal = Array.from(/* @__PURE__ */ new Set([...Object.keys(db.stealing), day])).reduce((s, k) => s + dayT(k), 0);
  const shown = members.filter((m) => matchQ(m, q));
  const save = () => {
    mutate((n) => {
      n.stealing[day] = n.stealing[day] || {};
      dr.dirty.forEach((id) => {
        const v = parseInt(dr.d[id], 10);
        if (!v || v <= 0) delete n.stealing[day][id];
        else n.stealing[day][id] = v;
      });
    }, `\u062D\u0641\u0638 \u0641\u0631\u0635 \u0627\u0644\u0633\u0631\u0642\u0627\u062A \u0644\u064A\u0648\u0645 ${fmtShort(day)} (\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A ${total})`);
    dr.reset();
    notify("\u062A\u0645 \u062D\u0641\u0638 \u0641\u0631\u0635 \u0627\u0644\u0633\u0631\u0642\u0627\u062A");
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DayNav, { day, setDay }), /* @__PURE__ */ React.createElement("div", { className: "hero-total" }, /* @__PURE__ */ React.createElement("span", { className: "sub" }, "\u0645\u062C\u0645\u0648\u0639 \u0641\u0631\u0635 \u0627\u0644\u0633\u0631\u0642\u0627\u062A \u0644\u0647\u0630\u0627 \u0627\u0644\u064A\u0648\u0645"), /* @__PURE__ */ React.createElement("span", { className: "big gold-text" }, nf(total)), /* @__PURE__ */ React.createElement("div", { className: "hero-sub" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("small", null, "\u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639"), /* @__PURE__ */ React.createElement("strong", null, nf(weekTotal))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("small", null, "\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0643\u0644\u064A"), /* @__PURE__ */ React.createElement("strong", null, nf(allTotal)))), /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", style: { marginTop: 12 }, icon: "Copy", onClick: () => copyText(`\u0625\u062C\u0645\u0627\u0644\u064A \u0641\u0631\u0635 \u0627\u0644\u0633\u0631\u0642\u0627\u062A (${fmtFull(day)}): ${total}
\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0643\u0644\u064A \u0644\u0644\u0642\u0628\u064A\u0644\u0629: ${allTotal}`, notify) }, "\u0646\u0633\u062E \u0627\u0644\u0645\u0644\u062E\u0635 \u0644\u0644\u0647\u062C\u0648\u0645")), !edit ? /* @__PURE__ */ React.createElement("div", { className: "note" }, /* @__PURE__ */ React.createElement(Icon, { n: "Lock", size: 18 }), "\u0627\u0644\u0639\u0631\u0636 \u0641\u0642\u0637. \u064A\u0633\u062C\u0651\u0644 \u0634\u064A\u062E \u0627\u0644\u0633\u0631\u0642\u0627\u062A \u0648\u0627\u0644\u0631\u0626\u064A\u0633 \u0627\u0644\u0641\u0631\u0635.") : null, /* @__PURE__ */ React.createElement(SearchBox, { id: "steal-search", value: q, onChange: setQ }), members.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "Swords", title: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0623\u0639\u0636\u0627\u0621", text: "\u0633\u062C\u0651\u0644 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0623\u0648\u0644\u0627\u064B \u0644\u064A\u0638\u0647\u0631\u0648\u0627 \u0647\u0646\u0627." }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, shown.map((m) => /* @__PURE__ */ React.createElement("div", { key: m.id, className: "list-row" }, /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, m.name), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, m.rank)), edit ? /* @__PURE__ */ React.createElement("div", { className: "stepper" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "step", "aria-label": `\u0625\u0646\u0642\u0627\u0635 ${m.name}`, onClick: () => dr.set(m.id, String(Math.max(0, cnt(m.id) - 1))) }, /* @__PURE__ */ React.createElement(Icon, { n: "Minus", size: 18 })), /* @__PURE__ */ React.createElement("input", { id: `st-${m.id}`, inputMode: "numeric", "aria-label": `\u0641\u0631\u0635 ${m.name}`, value: dr.val(m.id) === "" ? "0" : dr.val(m.id), onChange: (e) => dr.set(m.id, digitsOnly(e.target.value).slice(0, 3)) }), /* @__PURE__ */ React.createElement("button", { type: "button", className: "step plus", "aria-label": `\u0632\u064A\u0627\u062F\u0629 ${m.name}`, onClick: () => dr.set(m.id, String(Math.min(999, cnt(m.id) + 1))) }, /* @__PURE__ */ React.createElement(Icon, { n: "Plus", size: 18 }))) : /* @__PURE__ */ React.createElement("strong", { className: "mono t-gold", style: { fontSize: 18 } }, cnt(m.id))))), /* @__PURE__ */ React.createElement(SaveBar, { count: dr.dirty.length, onSave: save, onCancel: dr.reset, label: "\u062D\u0641\u0638 \u0627\u0644\u064A\u0648\u0645" }));
}
function Chests() {
  const { db, me, mutate, notify } = useApp();
  const edit = can.chests(me.role);
  const t = todayKey(), wk = weekStart(t);
  const [type, setType] = useState("normal");
  const [mid, setMid] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(t);
  const [flt, setFlt] = useState("all");
  const weekCounts = { normal: 0, advanced: 0, rare: 0 };
  db.chests.forEach((c) => {
    if (c.date >= wk && weekCounts[c.type] !== void 0) weekCounts[c.type]++;
  });
  const top = db.members.map((m) => ({ m, p: db.activity[wk] ? db.activity[wk][m.id] : void 0 })).filter((x) => x.p !== void 0).sort((a, b) => b.p - a.p).slice(0, 5);
  const sorted = [...db.members].sort((a, b) => a.name.localeCompare(b.name, "ar"));
  const give = () => {
    const m = db.members.find((x) => x.id === mid);
    if (!m) return;
    mutate((n) => {
      n.chests.unshift({ id: uid(), type, memberId: m.id, memberName: m.name, date, note: note.trim(), by: me.name });
    }, `\u062A\u0633\u0644\u064A\u0645 \u0635\u0646\u062F\u0648\u0642 ${TIERS[type].label} \u0625\u0644\u0649 ${m.name}`);
    notify(`\u0633\u064F\u0644\u0651\u0645 \u0635\u0646\u062F\u0648\u0642 ${TIERS[type].label} \u0625\u0644\u0649 ${m.name}`);
    setNote("");
    setMid("");
  };
  const list = db.chests.filter((c) => flt === "all" || c.type === flt).sort((a, b) => b.date.localeCompare(a.date));
  const groups = [];
  list.forEach((c) => {
    const w = weekStart(c.date);
    let g = groups.find((x) => x.w === w);
    if (!g) {
      g = { w, items: [] };
      groups.push(g);
    }
    g.items.push(c);
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "h-sec", style: { marginBottom: 8 } }, "\u0635\u0646\u0627\u062F\u064A\u0642 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2.5" }, Object.entries(TIERS).map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, className: `tier tier-${k} ${k === "rare" ? "rare" : ""}` }, /* @__PURE__ */ React.createElement(Icon, { n: v.icon, size: 22 }), /* @__PURE__ */ React.createElement("strong", null, weekCounts[k]), /* @__PURE__ */ React.createElement("small", null, v.label))))), edit ? /* @__PURE__ */ React.createElement("div", { className: "card form" }, /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "\u062A\u0633\u0644\u064A\u0645 \u0635\u0646\u062F\u0648\u0642"), /* @__PURE__ */ React.createElement("div", { className: "type-pick", role: "group", "aria-label": "\u0646\u0648\u0639 \u0627\u0644\u0635\u0646\u062F\u0648\u0642" }, Object.entries(TIERS).map(([k, v]) => /* @__PURE__ */ React.createElement("button", { type: "button", key: k, className: `tier-${k} ${type === k ? "on" : ""}`, onClick: () => setType(k) }, /* @__PURE__ */ React.createElement(Icon, { n: v.icon, size: 22 }), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)" } }, v.label), /* @__PURE__ */ React.createElement("small", null, v.sub)))), type !== "normal" && top.length ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "sub", style: { marginBottom: 6 } }, "\u0627\u0644\u0623\u0639\u0644\u0649 \u0646\u0634\u0627\u0637\u0627\u064B \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 (\u0627\u0636\u063A\u0637 \u0644\u0644\u0627\u062E\u062A\u064A\u0627\u0631)"), /* @__PURE__ */ React.createElement("div", { className: "sugg" }, top.map((x) => /* @__PURE__ */ React.createElement("button", { type: "button", key: x.m.id, className: mid === x.m.id ? "on" : "", onClick: () => setMid(x.m.id) }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, x.m.name), /* @__PURE__ */ React.createElement("small", { className: "mono" }, nf(x.p), " \u0646\u0642\u0637\u0629"))))) : null, /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0644\u0645\u0633\u062A\u0644\u0645" }, /* @__PURE__ */ React.createElement("select", { id: "chest-member", className: "input", value: mid, onChange: (e) => setMid(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\u0627\u062E\u062A\u0631 \u0627\u0644\u0639\u0636\u0648"), sorted.map((m) => /* @__PURE__ */ React.createElement("option", { key: m.id, value: m.id }, m.name)))), /* @__PURE__ */ React.createElement(Field, { label: "\u0633\u0628\u0628 \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)" }, /* @__PURE__ */ React.createElement("input", { id: "chest-note", className: "input", value: note, onChange: (e) => setNote(e.target.value), placeholder: type === "normal" ? "\u0645\u062B\u0627\u0644: \u0641\u0627\u0626\u0632 \u0644\u0639\u0628\u0629 \u0627\u0644\u0623\u0633\u0631\u0627\u0631" : "\u0645\u062B\u0627\u0644: \u0623\u0639\u0644\u0649 \u0646\u0634\u0627\u0637 \u0648\u062F\u0639\u0645" })), /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E" }, /* @__PURE__ */ React.createElement("input", { id: "chest-date", type: "date", className: "input", value: date, max: t, onChange: (e) => setDate(e.target.value) })), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "Gift", className: "btn-block", disabled: !mid || !date, onClick: give }, "\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u0635\u0646\u062F\u0648\u0642")) : /* @__PURE__ */ React.createElement("div", { className: "note" }, /* @__PURE__ */ React.createElement(Icon, { n: "Lock", size: 18 }), "\u0627\u0644\u0639\u0631\u0636 \u0641\u0642\u0637. \u064A\u0648\u0632\u0651\u0639 \u0646\u0627\u0626\u0628 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0648\u0627\u0644\u0631\u0626\u064A\u0633 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642."), /* @__PURE__ */ React.createElement("div", { className: "row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "\u0633\u062C\u0644 \u0627\u0644\u0645\u0633\u062A\u0644\u0645\u064A\u0646"), /* @__PURE__ */ React.createElement("span", { className: "sub" }, list.length, " \u0633\u062C\u0644")), /* @__PURE__ */ React.createElement("div", { className: "chips", role: "group", "aria-label": "\u062A\u0635\u0641\u064A\u0629 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642" }, [["all", "\u0627\u0644\u0643\u0644"], ["normal", "\u0639\u0627\u062F\u064A"], ["advanced", "\u0645\u062A\u0642\u062F\u0645"], ["rare", "\u0646\u0627\u062F\u0631"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { type: "button", key: k, className: `chip ${flt === k ? "on" : ""}`, onClick: () => setFlt(k) }, l))), groups.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "Gift", title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0633\u062C\u0644\u0627\u062A", text: "\u0633\u062A\u0638\u0647\u0631 \u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u0645\u0633\u0644\u0651\u0645\u0629 \u0647\u0646\u0627 \u0645\u0639 \u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u0644\u0645 \u0648\u0627\u0644\u062A\u0627\u0631\u064A\u062E." }) : groups.map((g) => /* @__PURE__ */ React.createElement("div", { key: g.w }, /* @__PURE__ */ React.createElement("div", { className: "week-h" }, "\u0623\u0633\u0628\u0648\u0639 ", fmtShort(g.w), " \u2013 ", fmtShort(addDays(g.w, 6))), /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide", style: { marginTop: 6 } }, g.items.map((c) => /* @__PURE__ */ React.createElement("div", { key: c.id, className: "list-row" }, /* @__PURE__ */ React.createElement("span", { className: `tier-${c.type}` }, /* @__PURE__ */ React.createElement(Icon, { n: TIERS[c.type].icon, size: 24 })), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, c.memberName), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, TIERS[c.type].label, " \xB7 ", fmtShort(c.date), c.note ? ` \xB7 ${c.note}` : "")), can.leader(me.role) ? /* @__PURE__ */ React.createElement(DeleteBtn, { label: "\u062D\u0630\u0641 \u0627\u0644\u0633\u062C\u0644", onDelete: () => {
    mutate((n) => {
      n.chests = n.chests.filter((x) => x.id !== c.id);
    }, `\u062D\u0630\u0641 \u0633\u062C\u0644 \u0635\u0646\u062F\u0648\u0642 ${c.memberName}`);
    notify("\u062D\u064F\u0630\u0641 \u0627\u0644\u0633\u062C\u0644");
  } }) : null))))));
}
function ActivityPage() {
  const { db, me, mutate, notify } = useApp();
  const edit = can.activity(me.role);
  const [seg, setSeg] = useState("points");
  const [wk, setWk] = useState(weekStart(todayKey()));
  const [q, setQ] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);
  const [warnFor, setWarnFor] = useState(null);
  const dr = useDraft(db.activity[wk] || {}, wk);
  const members = db.members;
  const pts = (id) => {
    const v = dr.val(id);
    return v === "" ? null : parseInt(v, 10);
  };
  const recorded = members.filter((m) => pts(m.id) !== null);
  const lowN = recorded.filter((m) => pts(m.id) < THRESHOLD).length;
  const avg = recorded.length ? Math.round(recorded.reduce((s, m) => s + pts(m.id), 0) / recorded.length) : 0;
  const shown = members.filter((m) => matchQ(m, q) && (!onlyLow || pts(m.id) !== null && pts(m.id) < THRESHOLD));
  const save = () => {
    mutate((n) => {
      n.activity[wk] = n.activity[wk] || {};
      dr.dirty.forEach((id) => {
        const raw = dr.d[id];
        if (raw === "" || isNaN(parseInt(raw, 10))) delete n.activity[wk][id];
        else n.activity[wk][id] = parseInt(raw, 10);
      });
    }, `\u062D\u0641\u0638 \u0646\u0634\u0627\u0637 \u0623\u0633\u0628\u0648\u0639 ${fmtShort(wk)} (${recorded.length} \u0639\u0636\u0648\u060C ${lowN} \u062A\u062D\u062A ${THRESHOLD})`);
    dr.reset();
    notify("\u062A\u0645 \u062D\u0641\u0638 \u0646\u0634\u0627\u0637 \u0627\u0644\u0623\u0633\u0628\u0648\u0639");
  };
  const weeks = Object.keys(db.activity).filter((k) => Object.keys(db.activity[k]).length).sort().reverse();
  const warnsSorted = [...db.warnings].sort((a, b) => b.date.localeCompare(a.date));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "seg", role: "tablist", "aria-label": "\u0623\u0642\u0633\u0627\u0645 \u0627\u0644\u0646\u0634\u0627\u0637" }, [["points", "\u0627\u0644\u0646\u0642\u0627\u0637"], ["warns", "\u0627\u0644\u0625\u0646\u0630\u0627\u0631\u0627\u062A"], ["hist", "\u0633\u062C\u0644 \u0627\u0644\u0623\u0633\u0627\u0628\u064A\u0639"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { type: "button", role: "tab", "aria-selected": seg === k, key: k, className: seg === k ? "on" : "", onClick: () => setSeg(k) }, l))), seg === "points" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(WeekNav, { wk, setWk }), /* @__PURE__ */ React.createElement("div", { className: "strip", style: { gridTemplateColumns: "repeat(3,1fr)" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, recorded.length, /* @__PURE__ */ React.createElement("span", { className: "t-mute", style: { fontSize: 13 } }, "/", members.length)), /* @__PURE__ */ React.createElement("small", null, "\u0633\u064F\u062C\u0651\u0644 \u0646\u0634\u0627\u0637\u0647\u0645")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { className: lowN ? "t-danger" : "" }, lowN), /* @__PURE__ */ React.createElement("small", null, "\u062A\u062D\u062A ", THRESHOLD)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { className: "t-gold" }, nf(avg)), /* @__PURE__ */ React.createElement("small", null, "\u0627\u0644\u0645\u062A\u0648\u0633\u0637"))), !edit ? /* @__PURE__ */ React.createElement("div", { className: "note" }, /* @__PURE__ */ React.createElement(Icon, { n: "Lock", size: 18 }), "\u0627\u0644\u0639\u0631\u0636 \u0641\u0642\u0637. \u064A\u0633\u062C\u0651\u0644 \u0646\u0627\u0626\u0628 \u0627\u0644\u0646\u0634\u0627\u0637 \u0648\u0627\u0644\u0631\u0626\u064A\u0633 \u0627\u0644\u0646\u0642\u0627\u0637.") : null, /* @__PURE__ */ React.createElement(SearchBox, { id: "act-search", value: q, onChange: setQ }), /* @__PURE__ */ React.createElement("div", { className: "chips" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: `chip ${onlyLow ? "on" : ""}`, onClick: () => setOnlyLow((v) => !v) }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 14 }), "\u062A\u062D\u062A ", THRESHOLD, " \u0641\u0642\u0637")), members.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "Activity", title: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0623\u0639\u0636\u0627\u0621", text: "\u0633\u062C\u0651\u0644 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0623\u0648\u0644\u0627\u064B \u0644\u064A\u0638\u0647\u0631\u0648\u0627 \u0647\u0646\u0627." }) : shown.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "Search", title: "\u0644\u0627 \u0646\u062A\u0627\u0626\u062C" }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, shown.map((m) => {
    const p = pts(m.id);
    const isLow = p !== null && p < THRESHOLD;
    return /* @__PURE__ */ React.createElement("div", { key: m.id, className: `list-row ${isLow ? "low" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, m.name), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, isLow ? /* @__PURE__ */ React.createElement("span", { className: "t-danger" }, "\u0646\u0627\u0642\u0635 ", nf(THRESHOLD - p), " \u0639\u0646 \u0627\u0644\u062D\u062F") : p === null ? "\u0644\u0645 \u064A\u064F\u0633\u062C\u064E\u0651\u0644" : /* @__PURE__ */ React.createElement("span", { className: "t-ok" }, "\u0636\u0645\u0646 \u0627\u0644\u062D\u062F"))), isLow ? /* @__PURE__ */ React.createElement(Badge, { tone: "danger", icon: "AlertTriangle" }, "\u062A\u062D\u0630\u064A\u0631") : null, edit ? /* @__PURE__ */ React.createElement("input", { id: `ap-${m.id}`, className: "input num-input", inputMode: "numeric", "aria-label": `\u0646\u0642\u0627\u0637 ${m.name}`, placeholder: "0", value: dr.val(m.id), onChange: (e) => dr.set(m.id, digitsOnly(e.target.value).slice(0, 5)) }) : /* @__PURE__ */ React.createElement("strong", { className: "mono", style: { fontSize: 17 } }, p === null ? "\u2014" : nf(p)), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn bordered", "aria-label": `\u0625\u0646\u0630\u0627\u0631 ${m.name}`, onClick: () => setWarnFor(m) }, /* @__PURE__ */ React.createElement(Icon, { n: "ShieldAlert", size: 18, className: isLow ? "t-danger" : "t-mute" })));
  })), /* @__PURE__ */ React.createElement(SaveBar, { count: dr.dirty.length, onSave: save, onCancel: dr.reset, label: "\u062D\u0641\u0638 \u0627\u0644\u0623\u0633\u0628\u0648\u0639" })) : null, seg === "warns" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "\u0643\u0644 \u0627\u0644\u0625\u0646\u0630\u0627\u0631\u0627\u062A"), /* @__PURE__ */ React.createElement("span", { className: "sub" }, warnsSorted.length, " \u0625\u0646\u0630\u0627\u0631")), warnsSorted.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "ShieldAlert", title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0625\u0646\u0630\u0627\u0631\u0627\u062A", text: "\u062A\u0635\u062F\u0631 \u0627\u0644\u0625\u0646\u0630\u0627\u0631\u0627\u062A \u0645\u0646 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0639\u0636\u0648 \u0623\u0648 \u0645\u0646 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0646\u0642\u0627\u0637." }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, warnsSorted.map((w) => /* @__PURE__ */ React.createElement("div", { key: w.id, className: "list-row" }, /* @__PURE__ */ React.createElement(Icon, { n: "ShieldAlert", size: 22, className: "t-danger" }), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, w.memberName), /* @__PURE__ */ React.createElement("div", { className: "lr-sub", style: { whiteSpace: "normal" } }, w.reason, " \xB7 ", fmtShort(w.date), " \xB7 ", w.by)), can.leader(me.role) ? /* @__PURE__ */ React.createElement(DeleteBtn, { label: "\u062D\u0630\u0641 \u0627\u0644\u0625\u0646\u0630\u0627\u0631", onDelete: () => {
    mutate((n) => {
      n.warnings = n.warnings.filter((x) => x.id !== w.id);
    }, `\u062D\u0630\u0641 \u0625\u0646\u0630\u0627\u0631 ${w.memberName}`);
    notify("\u062D\u064F\u0630\u0641 \u0627\u0644\u0625\u0646\u0630\u0627\u0631");
  } }) : null)))) : null, seg === "hist" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "\u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A"), weeks.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "ScrollText", title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u0633\u0627\u0628\u064A\u0639 \u0645\u062D\u0641\u0648\u0638\u0629", text: "\u0627\u062D\u0641\u0638 \u0646\u0642\u0627\u0637 \u0623\u0633\u0628\u0648\u0639 \u0644\u064A\u0638\u0647\u0631 \u0647\u0646\u0627." }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, weeks.map((k) => {
    const e = Object.entries(db.activity[k]).filter(([id]) => members.some((m) => m.id === id));
    const vals = e.map(([, v]) => v);
    const av = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    const lw = vals.filter((v) => v < THRESHOLD).length;
    const best = e.sort((a, b) => b[1] - a[1])[0];
    const bm = best && members.find((m) => m.id === best[0]);
    return /* @__PURE__ */ React.createElement("button", { type: "button", key: k, className: "list-row", style: { width: "100%", textAlign: "start" }, onClick: () => {
      setWk(k);
      setSeg("points");
    } }, /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, fmtShort(k), " \u2013 ", fmtShort(addDays(k, 6))), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, vals.length, " \u0639\u0636\u0648 \xB7 \u0645\u062A\u0648\u0633\u0637 ", nf(av), bm ? ` \xB7 \u0627\u0644\u0623\u0639\u0644\u0649: ${bm.name}` : "")), lw ? /* @__PURE__ */ React.createElement(Badge, { tone: "danger" }, lw, " \u062A\u062D\u062A ", THRESHOLD) : /* @__PURE__ */ React.createElement(Badge, { tone: "ok" }, "\u0627\u0644\u0643\u0644 \u0636\u0645\u0646 \u0627\u0644\u062D\u062F"), /* @__PURE__ */ React.createElement(Icon, { n: "ChevronLeft", size: 18, className: "t-mute" }));
  }))) : null, warnFor ? /* @__PURE__ */ React.createElement(Sheet, { title: "\u0625\u0635\u062F\u0627\u0631 \u0625\u0646\u0630\u0627\u0631", onClose: () => setWarnFor(null) }, /* @__PURE__ */ React.createElement(WarnForm, { member: warnFor, onDone: () => setWarnFor(null) })) : null);
}
function Attendance() {
  const { db, mutate, notify } = useApp();
  const [day, setDay] = useState(todayKey());
  const [q, setQ] = useState("");
  const isToday = day === todayKey();
  const rec = db.attendance[day] || {};
  const shown = db.members.filter((m) => matchQ(m, q));
  const here = db.members.filter((m) => rec[m.id]).length;
  const left = db.members.filter((m) => rec[m.id] && rec[m.id].out).length;
  const checkIn = (id) => mutate((n) => {
    const a = n.attendance[day] || {};
    a[id] = { in: isToday ? Date.now() : null, out: null };
    n.attendance[day] = a;
  });
  const checkOut = (id) => mutate((n) => {
    const a = n.attendance[day] || {};
    if (a[id]) a[id].out = Date.now();
    n.attendance[day] = a;
  });
  const undo = (id) => mutate((n) => {
    const a = n.attendance[day] || {};
    delete a[id];
    n.attendance[day] = a;
  });
  const all = () => {
    mutate((n) => {
      const a = n.attendance[day] || {};
      db.members.forEach((m) => {
        if (!a[m.id]) a[m.id] = { in: isToday ? Date.now() : null, out: null };
      });
      n.attendance[day] = a;
    }, `\u062A\u0633\u062C\u064A\u0644 \u062D\u0636\u0648\u0631 \u0627\u0644\u062C\u0645\u064A\u0639 \u0644\u064A\u0648\u0645 ${fmtShort(day)}`);
    notify("\u0633\u064F\u062C\u0651\u0644 \u062D\u0636\u0648\u0631 \u0627\u0644\u062C\u0645\u064A\u0639");
  };
  const clear = () => {
    mutate((n) => {
      n.attendance[day] = {};
    }, `\u0645\u0633\u062D \u062D\u0636\u0648\u0631 \u064A\u0648\u0645 ${fmtShort(day)}`);
    notify("\u0645\u064F\u0633\u062D \u062D\u0636\u0648\u0631 \u0627\u0644\u064A\u0648\u0645");
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DayNav, { day, setDay }), /* @__PURE__ */ React.createElement("div", { className: "card row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "sub" }, "\u0627\u0644\u062D\u0636\u0648\u0631"), /* @__PURE__ */ React.createElement("strong", { className: "mono", style: { fontSize: 24 } }, /* @__PURE__ */ React.createElement("span", { className: "t-gold" }, here), /* @__PURE__ */ React.createElement("span", { className: "t-mute", style: { fontSize: 16 } }, " / ", db.members.length)), isToday ? /* @__PURE__ */ React.createElement("div", { className: "sub" }, "\u0627\u0646\u0635\u0631\u0641 \u0645\u0646\u0647\u0645 ", left) : null), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", onClick: clear }, "\u0645\u0633\u062D"), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", className: "btn-sm", icon: "CheckCircle2", onClick: all }, "\u062D\u0636\u0648\u0631 \u0627\u0644\u0643\u0644"))), /* @__PURE__ */ React.createElement(SearchBox, { id: "att-search", value: q, onChange: setQ }), db.members.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "UserCheck", title: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0623\u0639\u0636\u0627\u0621" }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, shown.map((m) => {
    const r = rec[m.id];
    return /* @__PURE__ */ React.createElement("div", { key: m.id, className: `list-row ${r ? "" : ""}`, style: r && !r.out ? { background: "rgba(212,175,55,.06)" } : void 0 }, /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, m.name), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, !r ? m.rank : r.out ? `\u062D\u0636\u0631 ${r.in ? fmtTime(r.in) : ""} \xB7 \u0627\u0646\u0635\u0631\u0641 ${fmtTime(r.out)}` : `\u062D\u0627\u0636\u0631${r.in ? " \u0645\u0646\u0630 " + fmtTime(r.in) : ""}`)), !r ? /* @__PURE__ */ React.createElement(Btn, { kind: "gold", className: "btn-sm", icon: "LogIn", onClick: () => checkIn(m.id) }, "\u062D\u0636\u0648\u0631") : null, r && !r.out && isToday ? /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", icon: "LogOut", onClick: () => checkOut(m.id) }, "\u0627\u0646\u0635\u0631\u0627\u0641") : null, r && r.out ? /* @__PURE__ */ React.createElement(Badge, { tone: "mute" }, "\u0627\u0646\u0635\u0631\u0641") : null, r && (r.out || !isToday) ? /* @__PURE__ */ React.createElement(Badge, { tone: "ok", icon: "Check" }, "\u062D\u0636\u0631") : null, r ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", "aria-label": `\u0625\u0644\u063A\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 ${m.name}`, onClick: () => undo(m.id) }, /* @__PURE__ */ React.createElement(Icon, { n: "RotateCcw", size: 18, className: "t-mute" })) : null);
  })));
}
function Events() {
  const { db, me, mutate, notify } = useApp();
  const t = todayKey();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", date: t, desc: "" });
  const up = db.events.filter((e) => e.date >= t).sort((a, b) => a.date.localeCompare(b.date));
  const past = db.events.filter((e) => e.date < t).sort((a, b) => b.date.localeCompare(a.date));
  const add = () => {
    mutate((n) => {
      n.events.push({ id: uid(), title: f.title.trim(), date: f.date, desc: f.desc.trim(), by: me.name });
    }, `\u0625\u0636\u0627\u0641\u0629 \u0641\u0639\u0627\u0644\u064A\u0629: ${f.title.trim()}`);
    notify("\u0623\u064F\u0636\u064A\u0641\u062A \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629");
    setOpen(false);
    setF({ title: "", date: t, desc: "" });
  };
  const card = (e, isUp) => /* @__PURE__ */ React.createElement("div", { key: e.id, className: "list-row", style: { alignItems: "flex-start", opacity: isUp ? 1 : 0.7 } }, /* @__PURE__ */ React.createElement("div", { className: `date-block ${isUp ? "up" : ""}` }, /* @__PURE__ */ React.createElement("b", null, fmt(e.date, { day: "numeric" })), /* @__PURE__ */ React.createElement("small", null, fmt(e.date, { month: "short" }))), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name", style: { whiteSpace: "normal" } }, e.title), /* @__PURE__ */ React.createElement("div", { className: "lr-sub", style: { whiteSpace: "normal" } }, fmt(e.date, { weekday: "long" }), " \xB7 \u0623\u0636\u0627\u0641\u0647\u0627 ", e.by), e.desc ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, marginTop: 4 } }, e.desc) : null), can.leader(me.role) || e.by === me.name ? /* @__PURE__ */ React.createElement(DeleteBtn, { label: "\u062D\u0630\u0641 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629", onDelete: () => {
    mutate((n) => {
      n.events = n.events.filter((x) => x.id !== e.id);
    }, `\u062D\u0630\u0641 \u0641\u0639\u0627\u0644\u064A\u0629: ${e.title}`);
    notify("\u062D\u064F\u0630\u0641\u062A \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629");
  } }) : null);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "Plus", className: "btn-block", onClick: () => setOpen(true) }, "\u0625\u0636\u0627\u0641\u0629 \u0641\u0639\u0627\u0644\u064A\u0629"), /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "\u0627\u0644\u0642\u0627\u062F\u0645\u0629"), up.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "CalendarDays", title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0642\u0627\u062F\u0645\u0629", text: "\u0623\u0636\u0641 \u0641\u0639\u0627\u0644\u064A\u0629 \u0628\u062A\u0627\u0631\u064A\u062E\u0647\u0627 \u0648\u0648\u0635\u0641\u0647\u0627 \u0644\u064A\u0631\u0627\u0647\u0627 \u0627\u0644\u062C\u0645\u064A\u0639." }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, up.map((e) => card(e, true))), past.length ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "\u0627\u0644\u0633\u0627\u0628\u0642\u0629"), /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, past.map((e) => card(e, false)))) : null, open ? /* @__PURE__ */ React.createElement(Sheet, { title: "\u0641\u0639\u0627\u0644\u064A\u0629 \u062C\u062F\u064A\u062F\u0629", onClose: () => setOpen(false) }, /* @__PURE__ */ React.createElement("div", { className: "form" }, /* @__PURE__ */ React.createElement(Field, { label: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629" }, /* @__PURE__ */ React.createElement("input", { id: "ev-title", className: "input", value: f.title, onChange: (e) => setF({ ...f, title: e.target.value }), placeholder: "\u0645\u062B\u0627\u0644: \u0647\u062C\u0648\u0645 \u0627\u0644\u0642\u0628\u064A\u0644\u0629" })), /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E" }, /* @__PURE__ */ React.createElement("input", { id: "ev-date", type: "date", className: "input", value: f.date, onChange: (e) => setF({ ...f, date: e.target.value }) })), /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0644\u0648\u0635\u0641" }, /* @__PURE__ */ React.createElement("textarea", { id: "ev-desc", className: "input", value: f.desc, onChange: (e) => setF({ ...f, desc: e.target.value }), placeholder: "\u0627\u0644\u0648\u0642\u062A\u060C \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0645\u0646 \u0627\u0644\u0623\u0639\u0636\u0627\u0621\u060C \u0627\u0644\u062C\u0648\u0627\u0626\u0632..." })), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "Check", className: "btn-block", disabled: !f.title.trim() || !f.date, onClick: add }, "\u062D\u0641\u0638 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0629"))) : null);
}
function Kicks() {
  const { db, me, mutate, notify } = useApp();
  const add = can.kickAdd(me.role);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [f, setF] = useState({ name: "", weid: "", reason: "" });
  const idn = norm(f.weid).toLowerCase();
  const inKick = idn && db.kicks.find((k) => norm(k.weid).toLowerCase() === idn);
  const inMem = idn && db.members.find((m) => norm(m.weid).toLowerCase() === idn);
  const save = () => {
    mutate((n) => {
      n.kicks.unshift({ id: uid(), name: f.name.trim(), weid: norm(f.weid), reason: f.reason.trim() || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F", date: todayKey(), by: me.name });
    }, `\u0625\u0636\u0627\u0641\u0629 ${f.name.trim()} \u0625\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0631\u062F`);
    notify("\u0623\u064F\u0636\u064A\u0641 \u0625\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0631\u062F");
    setOpen(false);
    setF({ name: "", weid: "", reason: "" });
  };
  const list = db.kicks.filter((k) => {
    const s = norm(q).toLowerCase();
    return !s || k.name.toLowerCase().includes(s) || norm(k.weid).toLowerCase().includes(s);
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "note" }, /* @__PURE__ */ React.createElement(Icon, { n: "Ban", size: 20, className: "t-danger" }), /* @__PURE__ */ React.createElement("div", null, "\u0623\u064A \u0645\u0639\u0631\u0651\u0641 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0633\u062C\u064A\u0644\u0647 \u0639\u0636\u0648\u0627\u064B \u062C\u062F\u064A\u062F\u0627\u064B.")), add ? /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: "Plus", className: "btn-block", onClick: () => setOpen(true) }, "\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0631\u062F") : null, /* @__PURE__ */ React.createElement(SearchBox, { id: "kick-search", value: q, onChange: setQ }), list.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "Ban", title: db.kicks.length ? "\u0644\u0627 \u0646\u062A\u0627\u0626\u062C" : "\u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0641\u0627\u0631\u063A\u0629", text: db.kicks.length ? "" : "\u0644\u0627 \u064A\u0648\u062C\u062F \u0623\u062D\u062F \u0641\u064A \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0631\u062F \u062D\u0627\u0644\u064A\u0627\u064B." }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, list.map((k) => /* @__PURE__ */ React.createElement("div", { key: k.id, className: "list-row", style: { alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { className: "avatar", style: { borderColor: "rgba(239,106,91,.5)", color: "var(--danger)" } }, initial(k.name)), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, k.name), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, /* @__PURE__ */ React.createElement("span", { className: "mono" }, k.weid), " \xB7 ", fmtShort(k.date)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, marginTop: 2 } }, k.reason), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, "\u0623\u0636\u0627\u0641\u0647 ", k.by)), can.leader(me.role) ? /* @__PURE__ */ React.createElement(DeleteBtn, { label: "\u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631", icon: "RotateCcw", onDelete: () => {
    mutate((n) => {
      n.kicks = n.kicks.filter((x) => x.id !== k.id);
    }, `\u0631\u0641\u0639 \u0627\u0644\u062D\u0638\u0631 \u0639\u0646 ${k.name}`);
    notify("\u0631\u064F\u0641\u0639 \u0627\u0644\u062D\u0638\u0631");
  } }) : null))), open ? /* @__PURE__ */ React.createElement(Sheet, { title: "\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0631\u062F", onClose: () => setOpen(false) }, /* @__PURE__ */ React.createElement("div", { className: "form" }, /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0644\u0627\u0633\u0645" }, /* @__PURE__ */ React.createElement("input", { id: "k-name", className: "input", value: f.name, onChange: (e) => setF({ ...f, name: e.target.value }) })), /* @__PURE__ */ React.createElement(Field, { label: "\u0645\u0639\u0631\u0651\u0641 WePlay" }, /* @__PURE__ */ React.createElement("input", { id: "k-weid", className: "input mono", value: f.weid, onChange: (e) => setF({ ...f, weid: e.target.value }) })), inKick ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "\u0647\u0630\u0627 \u0627\u0644\u0645\u0639\u0631\u0651\u0641 \u0645\u0648\u062C\u0648\u062F \u0645\u0633\u0628\u0642\u0627\u064B \u0641\u064A \u0627\u0644\u0642\u0627\u0626\u0645\u0629") : null, inMem ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "\u0647\u0630\u0627 \u0627\u0644\u0645\u0639\u0631\u0651\u0641 \u0644\u0639\u0636\u0648 \u062D\u0627\u0644\u064A (", inMem.name, "). \u0627\u0633\u062A\u062E\u062F\u0645 \u0632\u0631 \xAB\u0637\u0631\u062F \u0627\u0644\u0639\u0636\u0648\xBB \u0645\u0646 \u0628\u0637\u0627\u0642\u062A\u0647.") : null, /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0644\u0633\u0628\u0628" }, /* @__PURE__ */ React.createElement("textarea", { id: "k-reason", className: "input", value: f.reason, onChange: (e) => setF({ ...f, reason: e.target.value }) })), /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: "Ban", className: "btn-block", disabled: !f.name.trim() || !idn || !!inKick || !!inMem, onClick: save }, "\u0625\u0636\u0627\u0641\u0629 \u0644\u0644\u0642\u0627\u0626\u0645\u0629"))) : null);
}
function Recruit() {
  const { db, me, mutate, notify } = useApp();
  const t = todayKey();
  const [f, setF] = useState({ name: "", weid: "", joined: t, rank: "\u0639\u0636\u0648" });
  const idn = norm(f.weid).toLowerCase();
  const dup = idn && db.members.find((m) => norm(m.weid).toLowerCase() === idn);
  const ban = idn && db.kicks.find((k) => norm(k.weid).toLowerCase() === idn);
  const sameName = f.name.trim() && db.members.find((m) => m.name.trim() === f.name.trim());
  const ok = f.name.trim() && idn.length >= 4 && !dup && !ban && f.joined;
  const submit = () => {
    mutate((n) => {
      n.members.push({ id: uid(), name: f.name.trim(), weid: norm(f.weid), rank: f.rank, joined: f.joined, fake: false });
    }, `\u062A\u0633\u062C\u064A\u0644 \u0639\u0636\u0648 \u062C\u062F\u064A\u062F: ${f.name.trim()}`);
    notify(`\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 ${f.name.trim()}`);
    setF({ name: "", weid: "", joined: t, rank: "\u0639\u0636\u0648" });
  };
  const recent = [...db.members].reverse().slice(0, 5);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "card form" }, /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0633\u0645 \u0627\u0644\u0639\u0636\u0648" }, /* @__PURE__ */ React.createElement("input", { id: "rc-name", className: "input", value: f.name, onChange: (e) => setF({ ...f, name: e.target.value }), placeholder: "\u0627\u0644\u0627\u0633\u0645 \u062F\u0627\u062E\u0644 \u0627\u0644\u0644\u0639\u0628\u0629" })), sameName ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "\u064A\u0648\u062C\u062F \u0639\u0636\u0648 \u0628\u0646\u0641\u0633 \u0627\u0644\u0627\u0633\u0645. \u062A\u0623\u0643\u062F \u0623\u0646\u0647 \u0634\u062E\u0635 \u0645\u062E\u062A\u0644\u0641.") : null, /* @__PURE__ */ React.createElement(Field, { label: "\u0645\u0639\u0631\u0651\u0641 WePlay" }, /* @__PURE__ */ React.createElement("input", { id: "rc-weid", className: "input mono", value: f.weid, onChange: (e) => setF({ ...f, weid: e.target.value }), placeholder: "\u0645\u062B\u0627\u0644: 48213907" })), ban ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad", role: "alert" }, /* @__PURE__ */ React.createElement(Icon, { n: "Ban", size: 16 }), /* @__PURE__ */ React.createElement("span", null, "\u0645\u0645\u0646\u0648\u0639 \u0627\u0644\u062A\u0633\u062C\u064A\u0644: \u0627\u0644\u0645\u0639\u0631\u0651\u0641 \u0641\u064A \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0631\u062F (\u0627\u0644\u0633\u0628\u0628: ", ban.reason, ").")) : null, dup ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad", role: "alert" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), /* @__PURE__ */ React.createElement("span", null, "\u0627\u0644\u0645\u0639\u0631\u0651\u0641 \u0645\u0633\u062C\u0651\u0644 \u0645\u0633\u0628\u0642\u0627\u064B \u0628\u0627\u0633\u0645 ", dup.name, ".")) : null, !ban && !dup && idn.length >= 4 ? /* @__PURE__ */ React.createElement("div", { className: "status-line good" }, /* @__PURE__ */ React.createElement(Icon, { n: "CheckCircle2", size: 16 }), "\u0627\u0644\u0645\u0639\u0631\u0651\u0641 \u063A\u064A\u0631 \u0645\u0643\u0631\u0631 \u0648\u063A\u064A\u0631 \u0645\u062D\u0638\u0648\u0631.") : null, /* @__PURE__ */ React.createElement(Field, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u0636\u0645\u0627\u0645" }, /* @__PURE__ */ React.createElement("input", { id: "rc-date", type: "date", className: "input", value: f.joined, max: t, onChange: (e) => setF({ ...f, joined: e.target.value }) })), /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0644\u0631\u062A\u0628\u0629" }, /* @__PURE__ */ React.createElement("select", { id: "rc-rank", className: "input", value: f.rank, onChange: (e) => setF({ ...f, rank: e.target.value }) }, RANKS.map((r) => /* @__PURE__ */ React.createElement("option", { key: r }, r)))), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "UserPlus", className: "btn-block", disabled: !ok, onClick: submit }, "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0639\u0636\u0648")), recent.length ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "\u0622\u062E\u0631 \u0627\u0644\u0645\u0633\u062C\u0651\u0644\u064A\u0646"), /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, recent.map((m) => /* @__PURE__ */ React.createElement("div", { key: m.id, className: "list-row" }, /* @__PURE__ */ React.createElement("div", { className: "avatar" }, initial(m.name)), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, m.name), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, /* @__PURE__ */ React.createElement("span", { className: "mono" }, m.weid), " \xB7 \u0627\u0646\u0636\u0645 ", fmtShort(m.joined))))))) : null);
}
function genPw() {
  const a = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  const r = window.crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(10)) : Array.from({ length: 10 }, () => Math.floor(Math.random() * 1e9));
  for (let i = 0; i < 10; i++) s += a[r[i] % a.length];
  return s;
}
function Accounts() {
  const { db, me, mutate, notify } = useApp();
  const [edit, setEdit] = useState(null);
  const [created, setCreated] = useState(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const openNew = () => {
    setShow(true);
    setEdit({ id: null, name: "", weid: "", role: "mod", password: genPw() });
  };
  const idn = edit ? norm(edit.weid).toLowerCase() : "";
  const clash = edit && idn && db.users.find((u) => u.id !== edit.id && norm(u.weid).toLowerCase() === idn);
  const banned = edit && idn && db.kicks.find((k) => norm(k.weid).toLowerCase() === idn);
  const pwBad = edit && (!edit.id || edit.password) && edit.password.length < MIN_PW;
  const valid = edit && edit.name.trim() && idn.length >= 4 && !clash && !banned && !pwBad;
  const save = async () => {
    if (!valid || busy) return;
    setBusy(true);
    const e = { ...edit, name: edit.name.trim(), weid: norm(edit.weid) };
    let cred = {};
    if (e.password) {
      const salt = newSalt();
      cred = { salt, hash: await hashPw(e.password, salt) };
    }
    mutate((n) => {
      if (e.id) {
        const u = n.users.find((x) => x.id === e.id);
        u.name = e.name;
        u.weid = e.weid;
        u.role = e.role;
        if (cred.hash) {
          u.salt = cred.salt;
          u.hash = cred.hash;
        }
      } else n.users.push({ id: uid(), name: e.name, weid: e.weid, role: e.role, ...cred });
    }, `${e.id ? e.password ? "\u062A\u0639\u062F\u064A\u0644 \u0648\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631" : "\u062A\u0639\u062F\u064A\u0644" : "\u0625\u0646\u0634\u0627\u0621"} \u062D\u0633\u0627\u0628 ${e.name} (${ROLES[e.role].label})`);
    setBusy(false);
    setEdit(null);
    if (e.password) setCreated({ name: e.name, weid: e.weid, role: e.role, password: e.password, isNew: !e.id });
    else notify("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062D\u0633\u0627\u0628");
  };
  const roleOptions = edit ? Object.entries(ROLES).filter(([k]) => k !== "leader" || edit.role === "leader") : [];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "note gold" }, /* @__PURE__ */ React.createElement(Icon, { n: "KeyRound", size: 20 }), /* @__PURE__ */ React.createElement("div", null, "\u062A\u0646\u0634\u0626 \u0647\u0646\u0627 \u0645\u0639\u0631\u0651\u0641\u0627\u062A \u0648\u0643\u0644\u0645\u0627\u062A \u0645\u0631\u0648\u0631 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0646. \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0644\u0627 \u062A\u064F\u0639\u0631\u0636 \u0628\u0639\u062F \u0627\u0644\u062D\u0641\u0638\u060C \u0641\u0633\u0644\u0651\u0645\u0647\u0627 \u0644\u0635\u0627\u062D\u0628\u0647\u0627 \u0641\u0648\u0631\u0627\u064B. \u0648\u0625\u0646 \u0646\u0633\u064A\u0647\u0627 \u062A\u0636\u0639 \u0644\u0647 \u0643\u0644\u0645\u0629 \u062C\u062F\u064A\u062F\u0629.")), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "UserPlus", className: "btn-block", onClick: openNew }, "\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628 \u062C\u062F\u064A\u062F"), /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, db.users.map((u) => /* @__PURE__ */ React.createElement("div", { key: u.id, className: "list-row" }, /* @__PURE__ */ React.createElement("span", { className: "menu-ico" }, /* @__PURE__ */ React.createElement(Icon, { n: ROLES[u.role].icon, size: 20 })), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, u.name, u.id === me.id ? /* @__PURE__ */ React.createElement("span", { className: "t-gold", style: { fontSize: 12 } }, " (\u0623\u0646\u062A)") : null), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, ROLES[u.role].label, " \xB7 ", /* @__PURE__ */ React.createElement("span", { className: "mono" }, u.weid))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn bordered", "aria-label": `\u062A\u0639\u062F\u064A\u0644 ${u.name}`, onClick: () => {
    setShow(false);
    setEdit({ ...u, password: "" });
  } }, /* @__PURE__ */ React.createElement(Icon, { n: "Pencil", size: 18 })), u.id !== me.id ? /* @__PURE__ */ React.createElement(DeleteBtn, { label: `\u062D\u0630\u0641 ${u.name}`, onDelete: () => {
    mutate((n) => {
      n.users = n.users.filter((x) => x.id !== u.id);
    }, `\u062D\u0630\u0641 \u062D\u0633\u0627\u0628 ${u.name}`);
    notify("\u062D\u064F\u0630\u0641 \u0627\u0644\u062D\u0633\u0627\u0628");
  } }) : null))), edit ? /* @__PURE__ */ React.createElement(Sheet, { title: edit.id ? "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062D\u0633\u0627\u0628" : "\u062D\u0633\u0627\u0628 \u062C\u062F\u064A\u062F", onClose: () => setEdit(null) }, /* @__PURE__ */ React.createElement("div", { className: "form" }, /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u0624\u0648\u0644" }, /* @__PURE__ */ React.createElement("input", { id: "ac-name", className: "input", value: edit.name, onChange: (e) => setEdit({ ...edit, name: e.target.value }) })), /* @__PURE__ */ React.createElement(Field, { label: "\u0645\u0639\u0631\u0651\u0641 WePlay" }, /* @__PURE__ */ React.createElement("input", { id: "ac-weid", className: "input mono", value: edit.weid, onChange: (e) => setEdit({ ...edit, weid: e.target.value }) })), clash ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "\u0647\u0630\u0627 \u0627\u0644\u0645\u0639\u0631\u0651\u0641 \u0644\u0647 \u062D\u0633\u0627\u0628 \u0645\u0633\u0628\u0642\u0627\u064B (", clash.name, ").") : null, banned ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "Ban", size: 16 }), "\u0647\u0630\u0627 \u0627\u0644\u0645\u0639\u0631\u0651\u0641 \u0641\u064A \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0631\u062F.") : null, /* @__PURE__ */ React.createElement(Field, { label: "\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" }, /* @__PURE__ */ React.createElement("select", { id: "ac-role", className: "input", value: edit.role, disabled: edit.id === me.id, onChange: (e) => setEdit({ ...edit, role: e.target.value }) }, roleOptions.map(([k, v]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, v.label)))), /* @__PURE__ */ React.createElement(Field, { label: edit.id ? "\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062C\u062F\u064A\u062F\u0629 (\u0627\u062A\u0631\u0643\u0647\u0627 \u0641\u0627\u0631\u063A\u0629 \u062F\u0648\u0646 \u062A\u063A\u064A\u064A\u0631)" : "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", hint: `${MIN_PW} \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.` }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement(PwInput, { id: "ac-pw", value: edit.password, onChange: (v) => setEdit({ ...edit, password: v }), show, setShow, placeholder: edit.id ? "\u0628\u062F\u0648\u0646 \u062A\u063A\u064A\u064A\u0631" : "", autoComplete: "new-password" })), /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", icon: "RotateCcw", onClick: () => {
    setShow(true);
    setEdit({ ...edit, password: genPw() });
  } }, "\u062A\u0648\u0644\u064A\u062F"))), pwBad ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0642\u0635\u064A\u0631\u0629.") : null, /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "Check", className: "btn-block", disabled: !valid || busy, onClick: save }, "\u062D\u0641\u0638"))) : null, created ? /* @__PURE__ */ React.createElement(Sheet, { title: created.isNew ? "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062D\u0633\u0627\u0628" : "\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", onClose: () => setCreated(null) }, /* @__PURE__ */ React.createElement("div", { className: "note warn" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 20 }), /* @__PURE__ */ React.createElement("div", null, "\u0627\u0646\u0633\u062E \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0622\u0646 \u0648\u0633\u0644\u0651\u0645\u0647\u0627 \u0644\u0640 ", created.name, ". \u0644\u0646 \u062A\u0638\u0647\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { paddingBlock: 4 } }, /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629"), /* @__PURE__ */ React.createElement("span", null, ROLES[created.role].label)), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "\u0645\u0639\u0631\u0651\u0641 WePlay"), /* @__PURE__ */ React.createElement("span", { className: "mono" }, created.weid)), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631"), /* @__PURE__ */ React.createElement("span", { className: "mono t-gold" }, created.password))), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "Copy", className: "btn-block", onClick: () => copyText(`\u0642\u0628\u064A\u0644\u0629 \u0623\u0628\u0646\u0627\u0621 \u0627\u0644\u0641\u0648\u0636\u0649
\u0627\u0644\u0645\u0639\u0631\u0651\u0641: ${created.weid}
\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631: ${created.password}`, notify) }, "\u0646\u0633\u062E \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644")) : null);
}
function Audit() {
  const { db } = useApp();
  return db.audit.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "ScrollText", title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0645\u0644\u064A\u0627\u062A \u0645\u0633\u062C\u0651\u0644\u0629", text: "\u062A\u0638\u0647\u0631 \u0647\u0646\u0627 \u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644 \u0648\u0627\u0644\u062A\u0639\u062F\u064A\u0644 \u0648\u0627\u0644\u062D\u0630\u0641 \u0648\u0627\u0644\u0625\u0646\u0630\u0627\u0631\u0627\u062A." }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, db.audit.map((a) => /* @__PURE__ */ React.createElement("div", { key: a.id, className: "list-row", style: { alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("span", { className: "menu-ico", style: { width: 36, height: 36 } }, /* @__PURE__ */ React.createElement(Icon, { n: (ROLES[a.role] || ROLES.mod).icon, size: 17 })), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14 } }, a.text), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, a.by, " \xB7 ", fmtTs(a.ts))))));
}
function More({ setSub, onLogout }) {
  const { db, me } = useApp();
  const items = [
    { k: "attend", icon: "CheckCircle2", title: "\u0627\u0644\u062D\u0636\u0648\u0631", desc: "\u062A\u0633\u062C\u064A\u0644 \u062D\u0636\u0648\u0631 \u0627\u0644\u0623\u0639\u0636\u0627\u0621 \u0627\u0644\u064A\u0648\u0645\u064A", show: true },
    { k: "events", icon: "CalendarDays", title: "\u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A", desc: "\u062C\u062F\u0648\u0644 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A \u0648\u062A\u0648\u0627\u0631\u064A\u062E\u0647\u0627", show: true, n: db.events.filter((e) => e.date >= todayKey()).length },
    { k: "recruit", icon: "UserPlus", title: "\u062A\u0633\u062C\u064A\u0644 \u0639\u0636\u0648 \u062C\u062F\u064A\u062F", desc: "\u0645\u0639 \u0641\u062D\u0635 \u0627\u0644\u062A\u0643\u0631\u0627\u0631 \u0648\u0627\u0644\u062D\u0638\u0631", show: can.members(me.role) },
    { k: "kicks", icon: "Ban", title: "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0631\u062F", desc: "\u0627\u0644\u0645\u0639\u0631\u0651\u0641\u0627\u062A \u0627\u0644\u0645\u0645\u0646\u0648\u0639\u0629 \u0645\u0646 \u0627\u0644\u0627\u0646\u0636\u0645\u0627\u0645", show: true, n: db.kicks.length },
    { k: "accounts", icon: "KeyRound", title: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A", desc: "\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0631\u0645\u0648\u0632", show: can.leader(me.role) },
    { k: "audit", icon: "ScrollText", title: "\u0633\u062C\u0644 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A", desc: "\u0645\u0646 \u0641\u0639\u0644 \u0645\u0627\u0630\u0627 \u0648\u0645\u062A\u0649", show: can.leader(me.role) }
  ].filter((i) => i.show);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "card row" }, /* @__PURE__ */ React.createElement("div", { className: "avatar" }, /* @__PURE__ */ React.createElement(Icon, { n: ROLES[me.role].icon, size: 22 })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "font-semibold" }, me.name), /* @__PURE__ */ React.createElement("div", { className: "sub" }, ROLES[me.role].label, " \xB7 ", /* @__PURE__ */ React.createElement("span", { className: "mono" }, me.weid)))), /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, items.map((i) => /* @__PURE__ */ React.createElement("button", { type: "button", key: i.k, className: "menu-item", onClick: () => setSub(i.k) }, /* @__PURE__ */ React.createElement("span", { className: "menu-ico" }, /* @__PURE__ */ React.createElement(Icon, { n: i.icon, size: 22 })), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontWeight: 600 } }, i.title), /* @__PURE__ */ React.createElement("span", { className: "sub", style: { display: "block" } }, i.desc)), i.n ? /* @__PURE__ */ React.createElement(Badge, { tone: "gold" }, i.n) : null, /* @__PURE__ */ React.createElement(Icon, { n: "ChevronLeft", size: 18, className: "t-mute" })))), /* @__PURE__ */ React.createElement("div", { className: "note" }, /* @__PURE__ */ React.createElement(Icon, { n: "Info", size: 18 }), /* @__PURE__ */ React.createElement("div", null, "\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u062D\u0641\u0648\u0638\u0629 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u062C\u0647\u0627\u0632 \u0641\u0642\u0637. \u0644\u0627 \u062A\u062A\u0632\u0627\u0645\u0646 \u0628\u064A\u0646 \u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u0633\u0624\u0648\u0644\u064A\u0646.")), /* @__PURE__ */ React.createElement(Btn, { icon: "LogOut", className: "btn-block", onClick: onLogout }, "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C"));
}
const NAV = [
  { k: "home", label: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", icon: "Users" },
  { k: "steal", label: "\u0627\u0644\u0633\u0631\u0642\u0627\u062A", icon: "Swords" },
  { k: "chests", label: "\u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642", icon: "Package" },
  { k: "activity", label: "\u0627\u0644\u0646\u0634\u0627\u0637", icon: "Activity" },
  { k: "more", label: "\u0627\u0644\u0645\u0632\u064A\u062F", icon: "MoreHorizontal" }
];
const TITLES = {
  home: "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0639\u0636\u0627\u0621",
  steal: "\u0641\u0631\u0635 \u0627\u0644\u0633\u0631\u0642\u0627\u062A",
  chests: "\u0627\u0644\u0635\u0646\u0627\u062F\u064A\u0642 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A\u0629",
  activity: "\u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A",
  more: "\u0627\u0644\u0645\u0632\u064A\u062F",
  attend: "\u0627\u0644\u062D\u0636\u0648\u0631",
  events: "\u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0648\u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A",
  kicks: "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0637\u0631\u062F",
  recruit: "\u062A\u0633\u062C\u064A\u0644 \u0639\u0636\u0648 \u062C\u062F\u064A\u062F",
  accounts: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A",
  audit: "\u0633\u062C\u0644 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A"
};
function App() {
  const [db, setDb] = useState(loadDb);
  const [sid, setSid] = useState(loadSession);
  const [tab, setTab] = useState("home");
  const [sub, setSub] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const [toast, setToast] = useState(null);
  const me = db.users.find((u) => u.id === sid) || null;
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (e) {
    }
  }, [db]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, sub]);
  const notify = (text, kind = "ok") => setToast({ text, kind, k: Math.random() });
  const mutate = (fn, log, actor) => setDb((prev) => {
    const n = JSON.parse(JSON.stringify(prev));
    fn(n);
    const who = actor || me;
    if (log && who) n.audit.unshift({ id: uid(), ts: Date.now(), by: who.name, role: who.role, text: log });
    n.audit = n.audit.slice(0, 300);
    return n;
  });
  const onLogin = (u) => {
    mutate(() => {
    }, "\u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644", u);
    try {
      localStorage.setItem(SESSION, u.id);
    } catch (e) {
    }
    setSid(u.id);
    setTab("home");
    setSub(null);
  };
  const onFail = (id) => mutate(() => {
  }, `\u0645\u062D\u0627\u0648\u0644\u0629 \u062F\u062E\u0648\u0644 \u0641\u0627\u0634\u0644\u0629 \u0628\u0627\u0644\u0645\u0639\u0631\u0651\u0641 ${id}`, { name: `ID ${id}`, role: "mod" });
  const onSetup = async ({ name, weid, pw, demo }) => {
    const salt = newSalt();
    const hash = await hashPw(pw, salt);
    const user = { id: uid(), name, weid, role: "leader", salt, hash };
    const n = { ...emptyDb(), ...demo ? demoData() : {}, users: [user] };
    n.audit = [{ id: uid(), ts: Date.now(), by: name, role: "leader", text: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0631\u0626\u064A\u0633 \u0648\u0628\u062F\u0621 \u0627\u0644\u0646\u0638\u0627\u0645" }];
    setDb(n);
    try {
      localStorage.setItem(SESSION, user.id);
    } catch (e) {
    }
    setSid(user.id);
    setTab("home");
    setSub(null);
  };
  const onLogout = () => {
    try {
      localStorage.removeItem(SESSION);
    } catch (e) {
    }
    setSid(null);
    setSub(null);
    setTab("home");
  };
  if (db.users.length === 0) return /* @__PURE__ */ React.createElement(Setup, { onCreate: onSetup });
  if (!me) return /* @__PURE__ */ React.createElement(Login, { db, onLogin, onFail });
  const page = tab === "more" && sub ? sub : tab;
  const goTab = (k) => {
    setTab(k);
    setSub(null);
  };
  let body = null;
  if (page === "home") body = /* @__PURE__ */ React.createElement(Home, { openMember: setMemberId, go: goTab });
  else if (page === "steal") body = /* @__PURE__ */ React.createElement(Stealing, null);
  else if (page === "chests") body = /* @__PURE__ */ React.createElement(Chests, null);
  else if (page === "activity") body = /* @__PURE__ */ React.createElement(ActivityPage, null);
  else if (page === "more") body = /* @__PURE__ */ React.createElement(More, { setSub, onLogout });
  else if (page === "attend") body = /* @__PURE__ */ React.createElement(Attendance, null);
  else if (page === "events") body = /* @__PURE__ */ React.createElement(Events, null);
  else if (page === "kicks") body = /* @__PURE__ */ React.createElement(Kicks, null);
  else if (page === "recruit") body = can.members(me.role) ? /* @__PURE__ */ React.createElement(Recruit, null) : /* @__PURE__ */ React.createElement(Empty, { icon: "Lock", title: "\u0644\u0627 \u062A\u0645\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" });
  else if (page === "accounts") body = can.leader(me.role) ? /* @__PURE__ */ React.createElement(Accounts, null) : /* @__PURE__ */ React.createElement(Empty, { icon: "Lock", title: "\u0644\u0627 \u062A\u0645\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" });
  else if (page === "audit") body = can.leader(me.role) ? /* @__PURE__ */ React.createElement(Audit, null) : /* @__PURE__ */ React.createElement(Empty, { icon: "Lock", title: "\u0644\u0627 \u062A\u0645\u0644\u0643 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" });
  return /* @__PURE__ */ React.createElement(Ctx.Provider, { value: { db, me, mutate, notify } }, /* @__PURE__ */ React.createElement("header", { className: "header" }, /* @__PURE__ */ React.createElement("div", { className: "header-in gutter col" }, tab === "more" && sub ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn bordered", "aria-label": "\u0631\u062C\u0648\u0639", onClick: () => setSub(null) }, /* @__PURE__ */ React.createElement(Icon, { n: "ChevronRight" })) : /* @__PURE__ */ React.createElement(Logo, { size: 34, id: "lgh" }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("h1", { className: "header-title gold-text" }, TITLES[page]), /* @__PURE__ */ React.createElement("p", { className: "header-sub" }, "\u0623\u0628\u0646\u0627\u0621 \u0627\u0644\u0641\u0648\u0636\u0649 SOA")), /* @__PURE__ */ React.createElement("div", { className: "role-chip" }, /* @__PURE__ */ React.createElement(Icon, { n: ROLES[me.role].icon, size: 14 }), ROLES[me.role].label))), /* @__PURE__ */ React.createElement("main", { className: "main gutter col" }, body), /* @__PURE__ */ React.createElement("nav", { className: "nav", "aria-label": "\u0627\u0644\u062A\u0646\u0642\u0644 \u0627\u0644\u0631\u0626\u064A\u0633\u064A" }, /* @__PURE__ */ React.createElement("div", { className: "nav-in col" }, NAV.map((n) => /* @__PURE__ */ React.createElement("button", { type: "button", key: n.k, className: `nav-btn ${tab === n.k ? "on" : ""}`, "aria-current": tab === n.k ? "page" : void 0, onClick: () => goTab(n.k) }, /* @__PURE__ */ React.createElement(Icon, { n: n.icon, size: 22, sw: tab === n.k ? 2.2 : 1.7 }), /* @__PURE__ */ React.createElement("span", null, n.label))))), memberId ? /* @__PURE__ */ React.createElement(MemberSheet, { id: memberId, onClose: () => setMemberId(null) }) : null, toast ? /* @__PURE__ */ React.createElement("div", { className: "toast-wrap", key: toast.k }, /* @__PURE__ */ React.createElement("div", { className: `toast ${toast.kind === "warn" ? "warn" : ""}`, role: "status" }, /* @__PURE__ */ React.createElement(Icon, { n: toast.kind === "warn" ? "AlertTriangle" : "CheckCircle2", size: 18 }), toast.text)) : null);
}
function Root() {
  const [splash, setSplash] = useState(true);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(App, null), splash ? /* @__PURE__ */ React.createElement(Splash, { onDone: () => setSplash(false) }) : null);
}
document.documentElement.dir = "rtl";
document.documentElement.lang = "ar";
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(Root, null));

