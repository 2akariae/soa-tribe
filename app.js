const { useState, useEffect, useMemo, useRef, createContext, useContext } = React;
const LUC = window.LucideReact || window.lucideReact || {};
function Icon({ n, size = 20, sw = 1.8, className = "" }) {
  const C = LUC[n];
  if (!C) return /* @__PURE__ */ React.createElement("span", { className, style: { display: "inline-block", width: size, height: size } });
  return /* @__PURE__ */ React.createElement(C, { size, strokeWidth: sw, className, "aria-hidden": "true" });
}
const LOGO_CROP = { x: 50, y: 365, w: 765, h: 925, iw: 914, ih: 1600 };
function Logo({ size = 120 }) {
  const c = LOGO_CROP, k = size / c.h;
  return /* @__PURE__ */ React.createElement(
    "span",
    {
      className: "logo-img",
      role: "img",
      "aria-label": "شعار القبيلة",
      style: { width: Math.round(c.w * k), height: size, backgroundImage: "url(logo.jpeg)", backgroundSize: `${c.iw * k}px ${c.ih * k}px`, backgroundPosition: `${-c.x * k}px ${-c.y * k}px` }
    }
  );
}
const THRESHOLD = 900;
const MIN_PW = 6;
const ROLES = {
  leader: { label: "الرئيس", icon: "Crown" },
  chests: { label: "نائب الصناديق", icon: "Package" },
  activity: { label: "نائب النشاط", icon: "Activity" },
  stealing: { label: "شيخ السرقات", icon: "Swords" },
  recruit: { label: "شيخ القبول", icon: "UserPlus" },
  mod: { label: "مشرف / نائب / شيخ", icon: "Shield" }
};
const RANKS = ["عضو", "مشرف", "نائب", "شيخ"];
const TIERS = {
  normal: { label: "عادي", sub: "ألعاب مصغّرة", icon: "Package" },
  advanced: { label: "متقدم", sub: "النشاط والدعم", icon: "Gift" },
  rare: { label: "نادر", sub: "النشاط والدعم", icon: "Gem" }
};
const WARN_REASONS = ["غياب عن فعالية", "عدم التفاعل", "مخالفة القوانين", "نشاط أقل من 900"];
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
const norm = (s) => String(s == null ? "" : s).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).trim();
const digitsOnly = (s) => norm(s).replace(/[^\d]/g, "");
const initial = (name) => [...String(name || "؟")][0];
const matchQ = (m, q) => {
  const s = norm(q).toLowerCase();
  return !s || m.name.toLowerCase().includes(s) || validId(m.weid) && norm(m.weid).toLowerCase().includes(s);
};
const ID_RE = /^[A-Za-z0-9]{4,20}$/;
const validId = (s) => ID_RE.test(norm(s));
async function copyText(text, notify) {
  try {
    await navigator.clipboard.writeText(text);
    notify("تم النسخ");
  } catch (e) {
    notify("تعذّر النسخ تلقائياً، حدّد النص وانسخه يدوياً", "warn");
  }
}
const fmtTime = (ts) => new Date(ts).toLocaleTimeString("ar-u-nu-latn", { hour: "2-digit", minute: "2-digit" });
function emptyDb() {
  return { demo: false, users: [], members: [], activity: {}, stealing: {}, chests: [], warnings: [], events: [], attendance: {}, kicks: [], audit: [] };
}
function demoData() {
  const t = todayKey(), w = weekStart(t), pw = addDays(w, -7);
  const base = [
    ["ذئب الصحراء", "48213907", "نائب"],
    ["الفهد الأسود", "39157264", "نائب"],
    ["ظل الليل", "51073482", "شيخ"],
    ["صقر الشمال", "27649135", "مشرف"],
    ["حارس الظلام", "60418829", "شيخ"],
    ["رعد", "33902716", "عضو"],
    ["نمر الجبل", "71526043", "عضو"],
    ["شبح الغابة", "44871350", "عضو"],
    ["الجوكر", "58209417", "عضو"],
    ["فارس الليل", "66034871", "عضو"],
    ["زائر_2291", "90817723", "عضو"]
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
  const mk = (type, i, date, note) => ({ id: uid(), type, memberId: members[i].id, memberName: members[i].name, date, note, by: "نائب الصناديق" });
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
      mk("rare", 0, addDays(t, -1), "أعلى نشاط في الأسبوع"),
      mk("advanced", 3, addDays(t, -1), "دعم مستمر للقبيلة"),
      mk("normal", 5, addDays(t, -2), "فائز لعبة الأسرار"),
      mk("normal", 7, addDays(t, -2), "فائز لعبة الأسرار"),
      mk("advanced", 1, addDays(t, -8), "نشاط الأسبوع الماضي")
    ],
    warnings: [
      { id: uid(), memberId: "m9", memberName: members[8].name, reason: "نشاط أقل من 900", date: addDays(t, -3), by: "مشرف" },
      { id: uid(), memberId: "m7", memberName: members[6].name, reason: "غياب عن فعالية", date: addDays(t, -9), by: "نائب النشاط" }
    ],
    events: [
      { id: uid(), title: "هجوم القبيلة الكبير", date: addDays(t, 2), desc: "التجمع قبل الهجوم بنصف ساعة. الحضور إلزامي لأصحاب فرص السرقات.", by: "الرئيس" },
      { id: uid(), title: "بطولة الأسرار المصغّرة", date: addDays(t, 6), desc: "مسابقة أسبوعية، والجوائز صناديق عادية للفائزين.", by: "نائب النشاط" },
      { id: uid(), title: "اجتماع المشرفين", date: addDays(t, -4), desc: "مراجعة النشاط الأسبوعي وتوزيع المهام.", by: "الرئيس" }
    ],
    attendance: { [t]: att },
    kicks: [
      { id: uid(), name: "مخرّب_الأسرار", weid: "12345678", reason: "نشر روابط مخالفة داخل القبيلة", date: addDays(t, -12), by: "الرئيس" }
    ]
  };
}
const Ctx = createContext(null);
const useApp = () => useContext(Ctx);
const Badge = ({ tone = "gold", icon, children }) => /* @__PURE__ */ React.createElement("span", { className: `badge badge-${tone}` }, icon ? /* @__PURE__ */ React.createElement(Icon, { n: icon, size: 12, sw: 2.2 }) : null, children);
const Btn = ({ kind = "ghost", icon, children, className = "", ...p }) => /* @__PURE__ */ React.createElement("button", { type: "button", className: `btn btn-${kind} ${className}`, ...p }, icon ? /* @__PURE__ */ React.createElement(Icon, { n: icon, size: 18 }) : null, children);
const Field = ({ label, hint, children }) => /* @__PURE__ */ React.createElement("label", { className: "field" }, /* @__PURE__ */ React.createElement("span", { className: "field-label" }, label), children, hint ? /* @__PURE__ */ React.createElement("span", { className: "field-hint" }, hint) : null);
const SearchBox = ({ id, value, onChange, placeholder = "ابحث بالاسم أو المعرّف" }) => /* @__PURE__ */ React.createElement("div", { className: "search" }, /* @__PURE__ */ React.createElement(Icon, { n: "Search", size: 18 }), /* @__PURE__ */ React.createElement("input", { id, value, onChange: (e) => onChange(e.target.value), placeholder, "aria-label": placeholder }));
const Empty = ({ icon = "Skull", title, text }) => /* @__PURE__ */ React.createElement("div", { className: "empty" }, /* @__PURE__ */ React.createElement(Icon, { n: icon, size: 32, className: "t-gold" }), /* @__PURE__ */ React.createElement("b", null, title), text ? /* @__PURE__ */ React.createElement("span", null, text) : null);
function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return /* @__PURE__ */ React.createElement("div", { className: "sheet-wrap", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: "sheet", role: "dialog", "aria-modal": "true", "aria-label": title, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "sheet-grab" }), /* @__PURE__ */ React.createElement("div", { className: "sheet-head" }, /* @__PURE__ */ React.createElement("h2", { className: "sheet-title" }, title), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", onClick: onClose, "aria-label": "إغلاق" }, /* @__PURE__ */ React.createElement(Icon, { n: "X" }))), /* @__PURE__ */ React.createElement("div", { className: "sheet-body" }, children)));
}
function DeleteBtn({ onDelete, label = "حذف", icon = "Trash2" }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(t);
  }, [armed]);
  return armed ? /* @__PURE__ */ React.createElement(Btn, { kind: "danger", className: "btn-sm", icon: "AlertTriangle", onClick: onDelete }, "تأكيد") : /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", "aria-label": label, onClick: () => setArmed(true) }, /* @__PURE__ */ React.createElement(Icon, { n: icon, size: 18, className: "t-mute" }));
}
function ConfirmBtn({ onConfirm, label, icon = "Trash2", ...p }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3500);
    return () => clearTimeout(t);
  }, [armed]);
  return /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: armed ? "AlertTriangle" : icon, onClick: () => armed ? onConfirm() : setArmed(true), ...p }, armed ? "اضغط مرة أخرى للتأكيد" : label);
}
function IdText({ id }) {
  return validId(id) ? /* @__PURE__ */ React.createElement("span", { className: "mono" }, norm(id)) : /* @__PURE__ */ React.createElement(Badge, { tone: "danger", icon: "AlertTriangle" }, "معرّف تالف");
}
function IdError({ value }) {
  if (!norm(value)) return null;
  return validId(value) ? null : /* @__PURE__ */ React.createElement("div", { className: "status-line bad", role: "alert" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "المعرّف يجب أن يكون من 4 إلى 20 خانة، أرقاماً أو أحرفاً إنجليزية فقط، بلا مسافات.");
}
function DayNav({ day, setDay }) {
  const t = todayKey();
  return /* @__PURE__ */ React.createElement("div", { className: "daynav" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", "aria-label": "اليوم السابق", onClick: () => setDay(addDays(day, -1)) }, /* @__PURE__ */ React.createElement(Icon, { n: "ChevronRight" })), /* @__PURE__ */ React.createElement("div", { className: "daynav-mid" }, /* @__PURE__ */ React.createElement("strong", null, day === t ? "اليوم" : fmt(day, { weekday: "long" })), /* @__PURE__ */ React.createElement("span", null, fmtFull(day))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", "aria-label": "اليوم التالي", disabled: day >= t, onClick: () => setDay(addDays(day, 1)) }, /* @__PURE__ */ React.createElement(Icon, { n: "ChevronLeft" })));
}
function WeekNav({ wk, setWk }) {
  const cur = weekStart(todayKey());
  return /* @__PURE__ */ React.createElement("div", { className: "daynav" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", "aria-label": "الأسبوع السابق", onClick: () => setWk(addDays(wk, -7)) }, /* @__PURE__ */ React.createElement(Icon, { n: "ChevronRight" })), /* @__PURE__ */ React.createElement("div", { className: "daynav-mid" }, /* @__PURE__ */ React.createElement("strong", null, wk === cur ? "الأسبوع الحالي" : "أسبوع سابق"), /* @__PURE__ */ React.createElement("span", null, fmtShort(wk), " – ", fmtShort(addDays(wk, 6)))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", "aria-label": "الأسبوع التالي", disabled: wk >= cur, onClick: () => setWk(addDays(wk, 7)) }, /* @__PURE__ */ React.createElement(Icon, { n: "ChevronLeft" })));
}
function SaveBar({ count, onSave, onCancel, label }) {
  if (!count) return null;
  return /* @__PURE__ */ React.createElement("div", { className: "savebar-wrap gutter" }, /* @__PURE__ */ React.createElement("div", { className: "savebar col" }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 text-[13.5px]" }, count, " ", count === 1 ? "تعديل غير محفوظ" : "تعديلات غير محفوظة"), /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", onClick: onCancel }, "تراجع"), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", className: "btn-sm", icon: "Check", onClick: onSave }, label)));
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
  return /* @__PURE__ */ React.createElement("div", { className: `splash ${cls}`, "aria-label": "شاشة الدخول" }, /* @__PURE__ */ React.createElement("div", { className: "door door-l" }), /* @__PURE__ */ React.createElement("div", { className: "door door-r" }), /* @__PURE__ */ React.createElement("canvas", { ref: cv }), /* @__PURE__ */ React.createElement("div", { className: "splash-logo" }, /* @__PURE__ */ React.createElement("div", { className: "splash-glow" }), /* @__PURE__ */ React.createElement(Logo, { size: 250 }), /* @__PURE__ */ React.createElement("div", { className: "splash-word" }, /* @__PURE__ */ React.createElement("div", { className: "splash-soa gold-text", lang: "en" }, "SOA"), /* @__PURE__ */ React.createElement("div", { className: "splash-ar" }, "أبناء الفوضى"))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "splash-skip", onClick: onDone }, "تخطي"));
}
function AuthShell({ sub, children }) {
  return /* @__PURE__ */ React.createElement("div", { className: "login gutter" }, /* @__PURE__ */ React.createElement("div", { className: "col" }, /* @__PURE__ */ React.createElement("div", { className: "login-logo" }, /* @__PURE__ */ React.createElement(Logo, { size: 130 }), /* @__PURE__ */ React.createElement("div", { className: "disp gold-text", style: { fontSize: 30, fontWeight: 700, lineHeight: 1.2 } }, "أبناء الفوضى"), /* @__PURE__ */ React.createElement("div", { className: "sub" }, sub)), children));
}
function PwInput({ id, value, onChange, show, setShow, placeholder = "••••••••", autoComplete = "off" }) {
  return /* @__PURE__ */ React.createElement("div", { className: "pw-wrap" }, /* @__PURE__ */ React.createElement("input", { id, className: "input", type: show ? "text" : "password", value, autoComplete, autoCapitalize: "off", onChange: (e) => onChange(e.target.value), placeholder }), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", onClick: () => setShow((s) => !s), "aria-label": show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور" }, /* @__PURE__ */ React.createElement(Icon, { n: show ? "EyeOff" : "Eye", size: 20 })));
}
function Setup({ onCreate, error }) {
  const [f, setF] = useState({ name: "", weid: "", pw: "", pw2: "", demo: false });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const idOk = validId(f.weid);
  const pwShort = f.pw.length > 0 && f.pw.length < MIN_PW;
  const mismatch = f.pw2.length > 0 && f.pw !== f.pw2;
  const ok = f.name.trim() && idOk && f.pw.length >= MIN_PW && f.pw === f.pw2;
  const submit = async (e) => {
    e.preventDefault();
    if (!ok || busy) return;
    setBusy(true);
    await onCreate({ name: f.name.trim(), weid: norm(f.weid), pw: f.pw, demo: f.demo });
    setBusy(false);
  };
  return /* @__PURE__ */ React.createElement(AuthShell, { sub: "إعداد النظام لأول مرة" }, /* @__PURE__ */ React.createElement("form", { className: "login-card", onSubmit: submit }, /* @__PURE__ */ React.createElement("h1", { className: "h-sec", style: { fontSize: 19 } }, "تسجيل الرئيس"), /* @__PURE__ */ React.createElement("div", { className: "note gold" }, /* @__PURE__ */ React.createElement(Icon, { n: "Crown", size: 20 }), /* @__PURE__ */ React.createElement("div", null, "أنت أول مسجّل، فستصبح الرئيس بكامل الصلاحيات. ومن «إدارة الحسابات» تنشئ حسابات النواب والشيوخ والمشرفين.")), /* @__PURE__ */ React.createElement(Field, { label: "اسم الرئيس" }, /* @__PURE__ */ React.createElement("input", { id: "su-name", className: "input", maxLength: 40, value: f.name, onChange: (e) => setF({ ...f, name: e.target.value }), placeholder: "اسمك داخل اللعبة" })), /* @__PURE__ */ React.createElement(Field, { label: "معرّف WePlay" }, /* @__PURE__ */ React.createElement("input", { id: "su-weid", className: "input mono", maxLength: 24, autoComplete: "off", autoCapitalize: "off", spellCheck: false, inputMode: "text", value: f.weid, onChange: (e) => setF({ ...f, weid: e.target.value }), placeholder: "مثال: 48213907" })), /* @__PURE__ */ React.createElement(IdError, { value: f.weid }), /* @__PURE__ */ React.createElement(Field, { label: `كلمة المرور (${MIN_PW} أحرف على الأقل)` }, /* @__PURE__ */ React.createElement(PwInput, { id: "su-pw", value: f.pw, onChange: (v) => setF({ ...f, pw: v }), show, setShow, autoComplete: "new-password" })), /* @__PURE__ */ React.createElement(Field, { label: "تأكيد كلمة المرور" }, /* @__PURE__ */ React.createElement(PwInput, { id: "su-pw2", value: f.pw2, onChange: (v) => setF({ ...f, pw2: v }), show, setShow, autoComplete: "new-password" })), pwShort ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "كلمة المرور قصيرة.") : null, mismatch ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "كلمتا المرور غير متطابقتين.") : null, error ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad", role: "alert" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), error) : null, /* @__PURE__ */ React.createElement("label", { className: "row", style: { gap: 10, fontSize: 14 } }, /* @__PURE__ */ React.createElement("input", { id: "su-demo", type: "checkbox", checked: f.demo, onChange: (e) => setF({ ...f, demo: e.target.checked }), style: { width: 20, height: 20, accentColor: "#d4af37" } }), "ابدأ بأعضاء وبيانات تجريبية للمعاينة"), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", className: "btn-block", icon: "Crown", type: "submit", disabled: !ok || busy }, "تسجيل وبدء النظام"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { textAlign: "center" } }, "احفظ كلمة المرور في مكان آمن. لا يمكن استرجاعها لاحقاً.")));
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
    let ok = false, code = "";
    try {
      await window.FB.signIn(norm(weid), pw);
      ok = true;
    } catch (e2) {
      code = e2 && e2.code || "";
    }
    setBusy(false);
    if (!ok) {
      if (/network|unavailable/.test(code)) {
        setErr("تعذّر الاتصال. تحقق من الإنترنت وأعد المحاولة.");
        return;
      }
      if (/too-many-requests/.test(code)) {
        setLock(Date.now() + 6e4);
        setNow(Date.now());
        setErr("");
        return;
      }
      const nf2 = fails + 1;
      setFails(nf2);
      if (nf2 >= 5) {
        setLock(Date.now() + 3e4);
        setNow(Date.now());
      }
      setErr("المعرّف أو كلمة المرور غير صحيحة. استخدم البيانات التي سلّمها لك الرئيس.");
      return;
    }
    onLogin();
  };
  return /* @__PURE__ */ React.createElement(AuthShell, { sub: "نظام إدارة القبيلة" }, /* @__PURE__ */ React.createElement("form", { className: "login-card", onSubmit: submit }, /* @__PURE__ */ React.createElement(Field, { label: "معرّف WePlay" }, /* @__PURE__ */ React.createElement("input", { id: "login-weid", className: "input mono", maxLength: 24, autoComplete: "username", autoCapitalize: "off", value: weid, onChange: (e) => {
    setWeid(e.target.value);
    setErr("");
  }, placeholder: "مثال: 48213907" })), /* @__PURE__ */ React.createElement(Field, { label: "كلمة المرور" }, /* @__PURE__ */ React.createElement(PwInput, { id: "login-pw", value: pw, onChange: (v) => {
    setPw(v);
    setErr("");
  }, show, setShow, autoComplete: "current-password" })), locked ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad", role: "alert" }, /* @__PURE__ */ React.createElement(Icon, { n: "Lock", size: 16 }), "محاولات كثيرة. انتظر ", Math.ceil((lock - now) / 1e3), " ثانية ثم حاول مجدداً.") : err ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad", role: "alert" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), err) : null, /* @__PURE__ */ React.createElement(Btn, { kind: "gold", className: "btn-block", icon: "Lock", type: "submit", disabled: locked || busy || !weid.trim() || !pw }, "دخول"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { textAlign: "center" } }, "لكل مسؤول معرّف وكلمة مرور يحددهما الرئيس. لا تشاركهما مع أحد.")));
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
    }, `إنذار للعضو ${member.name}: ${r}`);
    notify(`تم إصدار إنذار لـ ${member.name}`);
    onDone();
  };
  return /* @__PURE__ */ React.createElement("div", { className: "form" }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "avatar" }, initial(member.name)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600 } }, member.name), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "إنذارات سابقة: ", count))), /* @__PURE__ */ React.createElement("div", { className: "chips", role: "group", "aria-label": "أسباب جاهزة" }, WARN_REASONS.map((r) => /* @__PURE__ */ React.createElement("button", { type: "button", key: r, className: `chip ${reason === r ? "on" : ""}`, onClick: () => setReason(r) }, r))), /* @__PURE__ */ React.createElement(Field, { label: "سبب الإنذار" }, /* @__PURE__ */ React.createElement("textarea", { id: "warn-reason", className: "input", value: reason, onChange: (e) => setReason(e.target.value), placeholder: "اكتب السبب بوضوح" })), /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: "ShieldAlert", className: "btn-block", disabled: !reason.trim(), onClick: submit }, "إصدار الإنذار"));
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
    }, `تعديل بيانات العضو ${m.name}`);
    notify("تم حفظ التعديلات");
    setMode("view");
  };
  const togglePresent = () => {
    mutate((n) => {
      const a = n.attendance[t] || {};
      if (a[m.id]) delete a[m.id];
      else a[m.id] = { in: Date.now(), out: null };
      n.attendance[t] = a;
    });
    notify(present ? "أُلغي حضور اليوم" : `سُجّل حضور ${m.name}`);
  };
  const toggleFake = () => {
    mutate((n) => {
      const x = n.members.find((y) => y.id === m.id);
      x.fake = !x.fake;
    }, `${m.fake ? "إزالة وسم" : "وسم"} حساب وهمي: ${m.name}`);
  };
  const remove = () => {
    mutate((n) => {
      n.members = n.members.filter((x) => x.id !== m.id);
    }, `حذف سجل العضو ${m.name} (خطأ إدخال)`);
    notify("حُذف سجل العضو");
    onClose();
  };
  const kick = () => {
    const r = kickReason.trim() || "غير محدد";
    mutate((n) => {
      n.members = n.members.filter((x) => x.id !== m.id);
      n.kicks.unshift({ id: uid(), name: m.name, weid: m.weid, reason: r, date: todayKey(), by: me.name });
    }, `طرد العضو ${m.name} (${r})`);
    notify(`نُقل ${m.name} إلى قائمة الطرد`);
    onClose();
  };
  if (mode === "warn") return /* @__PURE__ */ React.createElement(Sheet, { title: "إصدار إنذار", onClose: () => setMode("view") }, /* @__PURE__ */ React.createElement(WarnForm, { member: m, onDone: () => setMode("view") }));
  if (mode === "edit") return /* @__PURE__ */ React.createElement(Sheet, { title: "تعديل العضو", onClose: () => setMode("view") }, /* @__PURE__ */ React.createElement("div", { className: "form" }, /* @__PURE__ */ React.createElement(Field, { label: "الاسم" }, /* @__PURE__ */ React.createElement("input", { id: "edit-name", className: "input", maxLength: 40, value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) })), /* @__PURE__ */ React.createElement(Field, { label: "معرّف WePlay" }, /* @__PURE__ */ React.createElement("input", { id: "edit-weid", className: "input mono", maxLength: 24, autoComplete: "off", autoCapitalize: "off", spellCheck: false, value: form.weid, onChange: (e) => setForm({ ...form, weid: e.target.value }) })), /* @__PURE__ */ React.createElement(IdError, { value: form.weid }), dupMember ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "هذا المعرّف مسجّل للعضو ", dupMember.name) : null, banned ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "Ban", size: 16 }), "هذا المعرّف موجود في قائمة الطرد") : null, /* @__PURE__ */ React.createElement(Field, { label: "الرتبة" }, /* @__PURE__ */ React.createElement("select", { id: "edit-rank", className: "input", value: form.rank, onChange: (e) => setForm({ ...form, rank: e.target.value }) }, RANKS.map((r) => /* @__PURE__ */ React.createElement("option", { key: r }, r)))), /* @__PURE__ */ React.createElement(Field, { label: "تاريخ الانضمام" }, /* @__PURE__ */ React.createElement("input", { id: "edit-joined", type: "date", className: "input", value: form.joined, onChange: (e) => setForm({ ...form, joined: e.target.value }) })), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "Check", className: "btn-block", disabled: !form.name.trim() || !validId(form.weid) || !!dupMember || !!banned, onClick: saveEdit }, "حفظ")));
  if (mode === "kick") return /* @__PURE__ */ React.createElement(Sheet, { title: "طرد العضو", onClose: () => setMode("view") }, /* @__PURE__ */ React.createElement("div", { className: "form" }, /* @__PURE__ */ React.createElement("div", { className: "note warn" }, /* @__PURE__ */ React.createElement(Icon, { n: "UserX", size: 20 }), /* @__PURE__ */ React.createElement("div", null, "سيُحذف ", m.name, " من القائمة ويُضاف معرّفه إلى قائمة الطرد، فلا يمكن تسجيله من جديد.")), /* @__PURE__ */ React.createElement(Field, { label: "سبب الطرد" }, /* @__PURE__ */ React.createElement("textarea", { id: "kick-reason", className: "input", value: kickReason, onChange: (e) => setKickReason(e.target.value), placeholder: "مثال: غياب طويل بلا عذر" })), !validId(m.weid) ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "معرّف هذا العضو تالف فلا يمكن حظره. عدّل المعرّف أولاً، أو احذف التسجيل إن كان خطأ إدخال.") : null, /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: "UserX", className: "btn-block", disabled: !validId(m.weid), onClick: kick }, "تأكيد الطرد")));
  return /* @__PURE__ */ React.createElement(Sheet, { title: "بطاقة العضو", onClose }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { className: "avatar", style: { width: 54, height: 54, fontSize: 24 } }, initial(m.name)), /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 18 } }, m.name), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5 mt-1" }, /* @__PURE__ */ React.createElement(Badge, { tone: "gold" }, m.rank), m.fake ? /* @__PURE__ */ React.createElement(Badge, { tone: "fake", icon: "UserX" }, "حساب وهمي") : null, low ? /* @__PURE__ */ React.createElement(Badge, { tone: "danger", icon: "AlertTriangle" }, "تحذير") : null, pts !== void 0 && !low && !m.fake ? /* @__PURE__ */ React.createElement(Badge, { tone: "ok", icon: "Check" }, "نشط") : null))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { paddingBlock: 4 } }, /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "معرّف WePlay"), /* @__PURE__ */ React.createElement("span", { className: "row" }, /* @__PURE__ */ React.createElement(IdText, { id: m.weid }), validId(m.weid) ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", style: { width: 32, height: 32 }, "aria-label": "نسخ المعرّف", onClick: () => copyText(m.weid, notify) }, /* @__PURE__ */ React.createElement(Icon, { n: "Copy", size: 16 })) : null)), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "تاريخ الانضمام"), /* @__PURE__ */ React.createElement("span", null, fmtFull(m.joined))), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "نشاط هذا الأسبوع"), /* @__PURE__ */ React.createElement("span", { className: `mono ${low ? "t-danger" : ""}` }, pts === void 0 ? "لم يُسجَّل" : nf(pts))), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "فرص السرقات اليوم"), /* @__PURE__ */ React.createElement("span", { className: "mono" }, steal)), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "الحضور اليوم"), /* @__PURE__ */ React.createElement("span", null, !attRec ? "لم يُسجَّل" : attRec.out ? `انصرف ${fmtTime(attRec.out)}` : `حاضر${attRec.in ? " منذ " + fmtTime(attRec.in) : ""}`)), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "الإنذارات"), /* @__PURE__ */ React.createElement("span", { className: warns.length ? "t-danger" : "" }, warns.length))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: "ShieldAlert", onClick: () => setMode("warn") }, "إصدار إنذار"), /* @__PURE__ */ React.createElement(Btn, { icon: present ? "RotateCcw" : "UserCheck", onClick: togglePresent }, present ? "إلغاء الحضور" : "تسجيل حضور"), canEdit ? /* @__PURE__ */ React.createElement(Btn, { icon: "Pencil", onClick: startEdit }, "تعديل البيانات") : null, canEdit ? /* @__PURE__ */ React.createElement(Btn, { icon: "UserX", onClick: toggleFake }, m.fake ? "إزالة وسم الوهمي" : "وسم حساب وهمي") : null, canEdit ? /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: "Ban", className: "btn-block", style: { gridColumn: "1 / -1" }, onClick: () => setMode("kick") }, "طرد العضو") : null, canEdit ? /* @__PURE__ */ React.createElement(ConfirmBtn, { icon: "Trash2", label: "حذف التسجيل (خطأ إدخال)", className: "btn-block", style: { gridColumn: "1 / -1" }, onConfirm: remove }) : null), warns.length ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "h-sec", style: { fontSize: 15, marginBottom: 6 } }, "سجل الإنذارات"), /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, warns.slice(0, 5).map((w) => /* @__PURE__ */ React.createElement("div", { key: w.id, className: "list-row" }, /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name", style: { whiteSpace: "normal" } }, w.reason), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, fmtFull(w.date), " · بواسطة ", w.by)))))) : null);
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
  const counts = { all: rows.length, active: rows.filter((r) => r.pts !== null && !low(r) && !r.m.fake).length, warn: rows.filter(low).length, fake: rows.filter((r) => r.m.fake).length, bad: rows.filter((r) => !validId(r.m.weid)).length };
  const ff = f === "bad" && !counts.bad ? "all" : f;
  const shown = rows.filter((r) => matchQ(r.m, q) && (ff === "all" || ff === "active" && r.pts !== null && !low(r) && !r.m.fake || ff === "warn" && low(r) || ff === "fake" && r.m.fake || ff === "bad" && !validId(r.m.weid)));
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
    }, "مسح البيانات التجريبية");
    notify("تم مسح البيانات التجريبية، ابدأ بتسجيل الأعضاء");
  };
  const [askClear, setAskClear] = useState(false);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, db.demo ? /* @__PURE__ */ React.createElement("div", { className: "note gold" }, /* @__PURE__ */ React.createElement(Icon, { n: "Info", size: 20 }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, "بيانات تجريبية للمعاينة. ", can.leader(me.role) ? "امسحها عند البدء بالبيانات الفعلية." : "يمسحها الرئيس عند البدء.", can.leader(me.role) ? /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, askClear ? /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement(Btn, { kind: "danger", className: "btn-sm", icon: "Trash2", onClick: clearDemo }, "تأكيد المسح"), /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", onClick: () => setAskClear(false) }, "إلغاء")) : /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", icon: "Trash2", onClick: () => setAskClear(true) }, "مسح البيانات التجريبية")) : null)) : null, counts.bad && can.members(me.role) ? /* @__PURE__ */ React.createElement("div", { className: "note warn" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 20 }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, counts.bad, " ", counts.bad === 1 ? "عضو" : "أعضاء", " بمعرّف WePlay تالف (نص طويل أو رموز غير مسموحة). افتح بطاقة العضو ثم «تعديل البيانات» لتصحيح المعرّف، أو احذف التسجيل إن كان خطأ إدخال.", /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", icon: "Search", onClick: () => setF("bad") }, "عرض التالفين")))) : null, /* @__PURE__ */ React.createElement("div", { className: "strip", "aria-label": "ملخص القبيلة" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, counts.all), /* @__PURE__ */ React.createElement("small", null, "عضو")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { className: counts.warn ? "t-danger" : "" }, counts.warn), /* @__PURE__ */ React.createElement("small", null, "تحت ", THRESHOLD)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { className: "t-gold" }, nf(stealToday)), /* @__PURE__ */ React.createElement("small", null, "سرقات اليوم")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, chestsWeek), /* @__PURE__ */ React.createElement("small", null, "صناديق الأسبوع"))), recorded.length ? /* @__PURE__ */ React.createElement("div", { className: "sub", style: { marginTop: -6 } }, "متوسط النشاط هذا الأسبوع: ", /* @__PURE__ */ React.createElement("b", { className: "mono t-gold" }, nf(avg))) : null, /* @__PURE__ */ React.createElement(SearchBox, { id: "member-search", value: q, onChange: setQ }), /* @__PURE__ */ React.createElement("div", { className: "chips", role: "group", "aria-label": "تصفية الأعضاء" }, [["all", "الكل"], ["active", "نشط"], ["warn", "تحذير"], ["fake", "وهمي"], ...counts.bad ? [["bad", "معرّف تالف"]] : []].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { type: "button", key: k, className: `chip ${ff === k ? "on" : ""}`, onClick: () => setF(k) }, l, " ", /* @__PURE__ */ React.createElement("b", null, counts[k])))), shown.length === 0 ? db.members.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "Users", title: "لا يوجد أعضاء بعد", text: can.members(me.role) ? "افتح «المزيد» ثم «تسجيل عضو جديد» لإضافة أول عضو." : "ينتظر شيخ القبول تسجيل الأعضاء." }) : /* @__PURE__ */ React.createElement(Empty, { icon: "Search", title: "لا نتائج مطابقة", text: "غيّر كلمة البحث أو التصفية." }) : shown.map((r) => {
    const isLow = low(r);
    return /* @__PURE__ */ React.createElement("button", { type: "button", key: r.m.id, className: `mcard ${isLow ? "low" : ""}`, onClick: () => openMember(r.m.id) }, /* @__PURE__ */ React.createElement("div", { className: "row", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("div", { className: "avatar" }, initial(r.m.name)), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "mc-name" }, r.m.name), /* @__PURE__ */ React.createElement("div", { className: "mc-sub" }, /* @__PURE__ */ React.createElement("span", null, r.m.rank), /* @__PURE__ */ React.createElement("span", { className: "dot" }), /* @__PURE__ */ React.createElement(IdText, { id: r.m.weid }))), /* @__PURE__ */ React.createElement(Icon, { n: "ChevronLeft", size: 18, className: "t-mute" })), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5" }, r.pts === null ? /* @__PURE__ */ React.createElement(Badge, { tone: "mute" }, "لم يُسجَّل نشاط") : isLow ? /* @__PURE__ */ React.createElement(Badge, { tone: "danger", icon: "AlertTriangle" }, "تحذير") : r.m.fake ? null : /* @__PURE__ */ React.createElement(Badge, { tone: "ok", icon: "Check" }, "نشط"), r.m.fake ? /* @__PURE__ */ React.createElement(Badge, { tone: "fake", icon: "UserX" }, "حساب وهمي") : null, r.warns >= 3 ? /* @__PURE__ */ React.createElement(Badge, { tone: "danger", icon: "ShieldAlert" }, "إنذارات متكررة") : null), /* @__PURE__ */ React.createElement("div", { className: "mc-stats" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("small", null, "النشاط الأسبوعي"), /* @__PURE__ */ React.createElement("strong", { className: isLow ? "t-danger" : "" }, r.pts === null ? "—" : nf(r.pts))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("small", null, "فرص السرقات"), /* @__PURE__ */ React.createElement("strong", { className: "t-gold" }, r.steal)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("small", null, "الإنذارات"), /* @__PURE__ */ React.createElement("strong", { className: r.warns ? "t-danger" : "" }, r.warns))));
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
    }, `حفظ فرص السرقات ليوم ${fmtShort(day)} (الإجمالي ${total})`);
    dr.reset();
    notify("تم حفظ فرص السرقات");
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DayNav, { day, setDay }), /* @__PURE__ */ React.createElement("div", { className: "hero-total" }, /* @__PURE__ */ React.createElement("span", { className: "sub" }, "مجموع فرص السرقات لهذا اليوم"), /* @__PURE__ */ React.createElement("span", { className: "big gold-text" }, nf(total)), /* @__PURE__ */ React.createElement("div", { className: "hero-sub" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("small", null, "هذا الأسبوع"), /* @__PURE__ */ React.createElement("strong", null, nf(weekTotal))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("small", null, "المجموع الكلي"), /* @__PURE__ */ React.createElement("strong", null, nf(allTotal)))), /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", style: { marginTop: 12 }, icon: "Copy", onClick: () => copyText(`إجمالي فرص السرقات (${fmtFull(day)}): ${total}
الإجمالي الكلي للقبيلة: ${allTotal}`, notify) }, "نسخ الملخص للهجوم")), !edit ? /* @__PURE__ */ React.createElement("div", { className: "note" }, /* @__PURE__ */ React.createElement(Icon, { n: "Lock", size: 18 }), "العرض فقط. يسجّل شيخ السرقات والرئيس الفرص.") : null, /* @__PURE__ */ React.createElement(SearchBox, { id: "steal-search", value: q, onChange: setQ }), members.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "Swords", title: "لا يوجد أعضاء", text: "سجّل الأعضاء أولاً ليظهروا هنا." }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, shown.map((m) => /* @__PURE__ */ React.createElement("div", { key: m.id, className: "list-row" }, /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, m.name), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, m.rank)), edit ? /* @__PURE__ */ React.createElement("div", { className: "stepper" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "step", "aria-label": `إنقاص ${m.name}`, onClick: () => dr.set(m.id, String(Math.max(0, cnt(m.id) - 1))) }, /* @__PURE__ */ React.createElement(Icon, { n: "Minus", size: 18 })), /* @__PURE__ */ React.createElement("input", { id: `st-${m.id}`, inputMode: "numeric", "aria-label": `فرص ${m.name}`, value: dr.val(m.id) === "" ? "0" : dr.val(m.id), onChange: (e) => dr.set(m.id, digitsOnly(e.target.value).slice(0, 3)) }), /* @__PURE__ */ React.createElement("button", { type: "button", className: "step plus", "aria-label": `زيادة ${m.name}`, onClick: () => dr.set(m.id, String(Math.min(999, cnt(m.id) + 1))) }, /* @__PURE__ */ React.createElement(Icon, { n: "Plus", size: 18 }))) : /* @__PURE__ */ React.createElement("strong", { className: "mono t-gold", style: { fontSize: 18 } }, cnt(m.id))))), /* @__PURE__ */ React.createElement(SaveBar, { count: dr.dirty.length, onSave: save, onCancel: dr.reset, label: "حفظ اليوم" }));
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
    }, `تسليم صندوق ${TIERS[type].label} إلى ${m.name}`);
    notify(`سُلّم صندوق ${TIERS[type].label} إلى ${m.name}`);
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
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "h-sec", style: { marginBottom: 8 } }, "صناديق هذا الأسبوع"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2.5" }, Object.entries(TIERS).map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, className: `tier tier-${k} ${k === "rare" ? "rare" : ""}` }, /* @__PURE__ */ React.createElement(Icon, { n: v.icon, size: 22 }), /* @__PURE__ */ React.createElement("strong", null, weekCounts[k]), /* @__PURE__ */ React.createElement("small", null, v.label))))), edit ? /* @__PURE__ */ React.createElement("div", { className: "card form" }, /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "تسليم صندوق"), /* @__PURE__ */ React.createElement("div", { className: "type-pick", role: "group", "aria-label": "نوع الصندوق" }, Object.entries(TIERS).map(([k, v]) => /* @__PURE__ */ React.createElement("button", { type: "button", key: k, className: `tier-${k} ${type === k ? "on" : ""}`, onClick: () => setType(k) }, /* @__PURE__ */ React.createElement(Icon, { n: v.icon, size: 22 }), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)" } }, v.label), /* @__PURE__ */ React.createElement("small", null, v.sub)))), type !== "normal" && top.length ? /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "sub", style: { marginBottom: 6 } }, "الأعلى نشاطاً هذا الأسبوع (اضغط للاختيار)"), /* @__PURE__ */ React.createElement("div", { className: "sugg" }, top.map((x) => /* @__PURE__ */ React.createElement("button", { type: "button", key: x.m.id, className: mid === x.m.id ? "on" : "", onClick: () => setMid(x.m.id) }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600 } }, x.m.name), /* @__PURE__ */ React.createElement("small", { className: "mono" }, nf(x.p), " نقطة"))))) : null, /* @__PURE__ */ React.createElement(Field, { label: "المستلم" }, /* @__PURE__ */ React.createElement("select", { id: "chest-member", className: "input", value: mid, onChange: (e) => setMid(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "" }, "اختر العضو"), sorted.map((m) => /* @__PURE__ */ React.createElement("option", { key: m.id, value: m.id }, m.name)))), /* @__PURE__ */ React.createElement(Field, { label: "سبب الاستحقاق (اختياري)" }, /* @__PURE__ */ React.createElement("input", { id: "chest-note", className: "input", value: note, onChange: (e) => setNote(e.target.value), placeholder: type === "normal" ? "مثال: فائز لعبة الأسرار" : "مثال: أعلى نشاط ودعم" })), /* @__PURE__ */ React.createElement(Field, { label: "التاريخ" }, /* @__PURE__ */ React.createElement("input", { id: "chest-date", type: "date", className: "input", value: date, max: t, onChange: (e) => setDate(e.target.value) })), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "Gift", className: "btn-block", disabled: !mid || !date, onClick: give }, "تسليم الصندوق")) : /* @__PURE__ */ React.createElement("div", { className: "note" }, /* @__PURE__ */ React.createElement(Icon, { n: "Lock", size: 18 }), "العرض فقط. يوزّع نائب الصناديق والرئيس الصناديق."), /* @__PURE__ */ React.createElement("div", { className: "row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "سجل المستلمين"), /* @__PURE__ */ React.createElement("span", { className: "sub" }, list.length, " سجل")), /* @__PURE__ */ React.createElement("div", { className: "chips", role: "group", "aria-label": "تصفية الصناديق" }, [["all", "الكل"], ["normal", "عادي"], ["advanced", "متقدم"], ["rare", "نادر"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { type: "button", key: k, className: `chip ${flt === k ? "on" : ""}`, onClick: () => setFlt(k) }, l))), groups.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "Gift", title: "لا توجد سجلات", text: "ستظهر الصناديق المسلّمة هنا مع اسم المستلم والتاريخ." }) : groups.map((g) => /* @__PURE__ */ React.createElement("div", { key: g.w }, /* @__PURE__ */ React.createElement("div", { className: "week-h" }, "أسبوع ", fmtShort(g.w), " – ", fmtShort(addDays(g.w, 6))), /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide", style: { marginTop: 6 } }, g.items.map((c) => /* @__PURE__ */ React.createElement("div", { key: c.id, className: "list-row" }, /* @__PURE__ */ React.createElement("span", { className: `tier-${c.type}` }, /* @__PURE__ */ React.createElement(Icon, { n: TIERS[c.type].icon, size: 24 })), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, c.memberName), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, TIERS[c.type].label, " · ", fmtShort(c.date), c.note ? ` · ${c.note}` : "")), can.leader(me.role) ? /* @__PURE__ */ React.createElement(DeleteBtn, { label: "حذف السجل", onDelete: () => {
    mutate((n) => {
      n.chests = n.chests.filter((x) => x.id !== c.id);
    }, `حذف سجل صندوق ${c.memberName}`);
    notify("حُذف السجل");
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
    }, `حفظ نشاط أسبوع ${fmtShort(wk)} (${recorded.length} عضو، ${lowN} تحت ${THRESHOLD})`);
    dr.reset();
    notify("تم حفظ نشاط الأسبوع");
  };
  const weeks = Object.keys(db.activity).filter((k) => Object.keys(db.activity[k]).length).sort().reverse();
  const warnsSorted = [...db.warnings].sort((a, b) => b.date.localeCompare(a.date));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "seg", role: "tablist", "aria-label": "أقسام النشاط" }, [["points", "النقاط"], ["warns", "الإنذارات"], ["hist", "سجل الأسابيع"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { type: "button", role: "tab", "aria-selected": seg === k, key: k, className: seg === k ? "on" : "", onClick: () => setSeg(k) }, l))), seg === "points" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(WeekNav, { wk, setWk }), /* @__PURE__ */ React.createElement("div", { className: "strip", style: { gridTemplateColumns: "repeat(3,1fr)" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, recorded.length, /* @__PURE__ */ React.createElement("span", { className: "t-mute", style: { fontSize: 13 } }, "/", members.length)), /* @__PURE__ */ React.createElement("small", null, "سُجّل نشاطهم")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { className: lowN ? "t-danger" : "" }, lowN), /* @__PURE__ */ React.createElement("small", null, "تحت ", THRESHOLD)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", { className: "t-gold" }, nf(avg)), /* @__PURE__ */ React.createElement("small", null, "المتوسط"))), !edit ? /* @__PURE__ */ React.createElement("div", { className: "note" }, /* @__PURE__ */ React.createElement(Icon, { n: "Lock", size: 18 }), "العرض فقط. يسجّل نائب النشاط والرئيس النقاط.") : null, /* @__PURE__ */ React.createElement(SearchBox, { id: "act-search", value: q, onChange: setQ }), /* @__PURE__ */ React.createElement("div", { className: "chips" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: `chip ${onlyLow ? "on" : ""}`, onClick: () => setOnlyLow((v) => !v) }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 14 }), "تحت ", THRESHOLD, " فقط")), members.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "Activity", title: "لا يوجد أعضاء", text: "سجّل الأعضاء أولاً ليظهروا هنا." }) : shown.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "Search", title: "لا نتائج" }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, shown.map((m) => {
    const p = pts(m.id);
    const isLow = p !== null && p < THRESHOLD;
    return /* @__PURE__ */ React.createElement("div", { key: m.id, className: `list-row ${isLow ? "low" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, m.name), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, isLow ? /* @__PURE__ */ React.createElement("span", { className: "t-danger" }, "ناقص ", nf(THRESHOLD - p), " عن الحد") : p === null ? "لم يُسجَّل" : /* @__PURE__ */ React.createElement("span", { className: "t-ok" }, "ضمن الحد"))), isLow ? /* @__PURE__ */ React.createElement(Badge, { tone: "danger", icon: "AlertTriangle" }, "تحذير") : null, edit ? /* @__PURE__ */ React.createElement("input", { id: `ap-${m.id}`, className: "input num-input", inputMode: "numeric", "aria-label": `نقاط ${m.name}`, placeholder: "0", value: dr.val(m.id), onChange: (e) => dr.set(m.id, digitsOnly(e.target.value).slice(0, 5)) }) : /* @__PURE__ */ React.createElement("strong", { className: "mono", style: { fontSize: 17 } }, p === null ? "—" : nf(p)), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn bordered", "aria-label": `إنذار ${m.name}`, onClick: () => setWarnFor(m) }, /* @__PURE__ */ React.createElement(Icon, { n: "ShieldAlert", size: 18, className: isLow ? "t-danger" : "t-mute" })));
  })), /* @__PURE__ */ React.createElement(SaveBar, { count: dr.dirty.length, onSave: save, onCancel: dr.reset, label: "حفظ الأسبوع" })) : null, seg === "warns" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "كل الإنذارات"), /* @__PURE__ */ React.createElement("span", { className: "sub" }, warnsSorted.length, " إنذار")), warnsSorted.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "ShieldAlert", title: "لا توجد إنذارات", text: "تصدر الإنذارات من بطاقة العضو أو من قائمة النقاط." }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, warnsSorted.map((w) => /* @__PURE__ */ React.createElement("div", { key: w.id, className: "list-row" }, /* @__PURE__ */ React.createElement(Icon, { n: "ShieldAlert", size: 22, className: "t-danger" }), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, w.memberName), /* @__PURE__ */ React.createElement("div", { className: "lr-sub", style: { whiteSpace: "normal" } }, w.reason, " · ", fmtShort(w.date), " · ", w.by)), can.leader(me.role) ? /* @__PURE__ */ React.createElement(DeleteBtn, { label: "حذف الإنذار", onDelete: () => {
    mutate((n) => {
      n.warnings = n.warnings.filter((x) => x.id !== w.id);
    }, `حذف إنذار ${w.memberName}`);
    notify("حُذف الإنذار");
  } }) : null)))) : null, seg === "hist" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "السجل التاريخي"), weeks.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "ScrollText", title: "لا توجد أسابيع محفوظة", text: "احفظ نقاط أسبوع ليظهر هنا." }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, weeks.map((k) => {
    const e = Object.entries(db.activity[k]).filter(([id]) => members.some((m) => m.id === id));
    const vals = e.map(([, v]) => v);
    const av = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    const lw = vals.filter((v) => v < THRESHOLD).length;
    const best = e.sort((a, b) => b[1] - a[1])[0];
    const bm = best && members.find((m) => m.id === best[0]);
    return /* @__PURE__ */ React.createElement("button", { type: "button", key: k, className: "list-row", style: { width: "100%", textAlign: "start" }, onClick: () => {
      setWk(k);
      setSeg("points");
    } }, /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, fmtShort(k), " – ", fmtShort(addDays(k, 6))), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, vals.length, " عضو · متوسط ", nf(av), bm ? ` · الأعلى: ${bm.name}` : "")), lw ? /* @__PURE__ */ React.createElement(Badge, { tone: "danger" }, lw, " تحت ", THRESHOLD) : /* @__PURE__ */ React.createElement(Badge, { tone: "ok" }, "الكل ضمن الحد"), /* @__PURE__ */ React.createElement(Icon, { n: "ChevronLeft", size: 18, className: "t-mute" }));
  }))) : null, warnFor ? /* @__PURE__ */ React.createElement(Sheet, { title: "إصدار إنذار", onClose: () => setWarnFor(null) }, /* @__PURE__ */ React.createElement(WarnForm, { member: warnFor, onDone: () => setWarnFor(null) })) : null);
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
    }, `تسجيل حضور الجميع ليوم ${fmtShort(day)}`);
    notify("سُجّل حضور الجميع");
  };
  const clear = () => {
    mutate((n) => {
      n.attendance[day] = {};
    }, `مسح حضور يوم ${fmtShort(day)}`);
    notify("مُسح حضور اليوم");
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(DayNav, { day, setDay }), /* @__PURE__ */ React.createElement("div", { className: "card row", style: { justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "sub" }, "الحضور"), /* @__PURE__ */ React.createElement("strong", { className: "mono", style: { fontSize: 24 } }, /* @__PURE__ */ React.createElement("span", { className: "t-gold" }, here), /* @__PURE__ */ React.createElement("span", { className: "t-mute", style: { fontSize: 16 } }, " / ", db.members.length)), isToday ? /* @__PURE__ */ React.createElement("div", { className: "sub" }, "انصرف منهم ", left) : null), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", onClick: clear }, "مسح"), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", className: "btn-sm", icon: "CheckCircle2", onClick: all }, "حضور الكل"))), /* @__PURE__ */ React.createElement(SearchBox, { id: "att-search", value: q, onChange: setQ }), db.members.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "UserCheck", title: "لا يوجد أعضاء" }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, shown.map((m) => {
    const r = rec[m.id];
    return /* @__PURE__ */ React.createElement("div", { key: m.id, className: `list-row ${r ? "" : ""}`, style: r && !r.out ? { background: "rgba(212,175,55,.06)" } : void 0 }, /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, m.name), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, !r ? m.rank : r.out ? `حضر ${r.in ? fmtTime(r.in) : ""} · انصرف ${fmtTime(r.out)}` : `حاضر${r.in ? " منذ " + fmtTime(r.in) : ""}`)), !r ? /* @__PURE__ */ React.createElement(Btn, { kind: "gold", className: "btn-sm", icon: "LogIn", onClick: () => checkIn(m.id) }, "حضور") : null, r && !r.out && isToday ? /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", icon: "LogOut", onClick: () => checkOut(m.id) }, "انصراف") : null, r && r.out ? /* @__PURE__ */ React.createElement(Badge, { tone: "mute" }, "انصرف") : null, r && (r.out || !isToday) ? /* @__PURE__ */ React.createElement(Badge, { tone: "ok", icon: "Check" }, "حضر") : null, r ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn", "aria-label": `إلغاء تسجيل ${m.name}`, onClick: () => undo(m.id) }, /* @__PURE__ */ React.createElement(Icon, { n: "RotateCcw", size: 18, className: "t-mute" })) : null);
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
    }, `إضافة فعالية: ${f.title.trim()}`);
    notify("أُضيفت الفعالية");
    setOpen(false);
    setF({ title: "", date: t, desc: "" });
  };
  const card = (e, isUp) => /* @__PURE__ */ React.createElement("div", { key: e.id, className: "list-row", style: { alignItems: "flex-start", opacity: isUp ? 1 : 0.7 } }, /* @__PURE__ */ React.createElement("div", { className: `date-block ${isUp ? "up" : ""}` }, /* @__PURE__ */ React.createElement("b", null, fmt(e.date, { day: "numeric" })), /* @__PURE__ */ React.createElement("small", null, fmt(e.date, { month: "short" }))), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name", style: { whiteSpace: "normal" } }, e.title), /* @__PURE__ */ React.createElement("div", { className: "lr-sub", style: { whiteSpace: "normal" } }, fmt(e.date, { weekday: "long" }), " · أضافها ", e.by), e.desc ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, marginTop: 4 } }, e.desc) : null), can.leader(me.role) || e.by === me.name ? /* @__PURE__ */ React.createElement(DeleteBtn, { label: "حذف الفعالية", onDelete: () => {
    mutate((n) => {
      n.events = n.events.filter((x) => x.id !== e.id);
    }, `حذف فعالية: ${e.title}`);
    notify("حُذفت الفعالية");
  } }) : null);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "Plus", className: "btn-block", onClick: () => setOpen(true) }, "إضافة فعالية"), /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "القادمة"), up.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "CalendarDays", title: "لا توجد فعاليات قادمة", text: "أضف فعالية بتاريخها ووصفها ليراها الجميع." }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, up.map((e) => card(e, true))), past.length ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "السابقة"), /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, past.map((e) => card(e, false)))) : null, open ? /* @__PURE__ */ React.createElement(Sheet, { title: "فعالية جديدة", onClose: () => setOpen(false) }, /* @__PURE__ */ React.createElement("div", { className: "form" }, /* @__PURE__ */ React.createElement(Field, { label: "عنوان الفعالية" }, /* @__PURE__ */ React.createElement("input", { id: "ev-title", className: "input", value: f.title, onChange: (e) => setF({ ...f, title: e.target.value }), placeholder: "مثال: هجوم القبيلة" })), /* @__PURE__ */ React.createElement(Field, { label: "التاريخ" }, /* @__PURE__ */ React.createElement("input", { id: "ev-date", type: "date", className: "input", value: f.date, onChange: (e) => setF({ ...f, date: e.target.value }) })), /* @__PURE__ */ React.createElement(Field, { label: "الوصف" }, /* @__PURE__ */ React.createElement("textarea", { id: "ev-desc", className: "input", value: f.desc, onChange: (e) => setF({ ...f, desc: e.target.value }), placeholder: "الوقت، المطلوب من الأعضاء، الجوائز..." })), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "Check", className: "btn-block", disabled: !f.title.trim() || !f.date, onClick: add }, "حفظ الفعالية"))) : null);
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
      n.kicks.unshift({ id: uid(), name: f.name.trim(), weid: norm(f.weid), reason: f.reason.trim() || "غير محدد", date: todayKey(), by: me.name });
    }, `إضافة ${f.name.trim()} إلى قائمة الطرد`);
    notify("أُضيف إلى قائمة الطرد");
    setOpen(false);
    setF({ name: "", weid: "", reason: "" });
  };
  const list = db.kicks.filter((k) => {
    const s = norm(q).toLowerCase();
    return !s || k.name.toLowerCase().includes(s) || norm(k.weid).toLowerCase().includes(s);
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "note" }, /* @__PURE__ */ React.createElement(Icon, { n: "Ban", size: 20, className: "t-danger" }), /* @__PURE__ */ React.createElement("div", null, "أي معرّف في هذه القائمة لا يمكن تسجيله عضواً جديداً.")), add ? /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: "Plus", className: "btn-block", onClick: () => setOpen(true) }, "إضافة إلى قائمة الطرد") : null, /* @__PURE__ */ React.createElement(SearchBox, { id: "kick-search", value: q, onChange: setQ }), list.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "Ban", title: db.kicks.length ? "لا نتائج" : "القائمة فارغة", text: db.kicks.length ? "" : "لا يوجد أحد في قائمة الطرد حالياً." }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, list.map((k) => /* @__PURE__ */ React.createElement("div", { key: k.id, className: "list-row", style: { alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { className: "avatar", style: { borderColor: "rgba(239,106,91,.5)", color: "var(--danger)" } }, initial(k.name)), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, k.name), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, /* @__PURE__ */ React.createElement(IdText, { id: k.weid }), " · ", fmtShort(k.date)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, marginTop: 2 } }, k.reason), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, "أضافه ", k.by)), can.leader(me.role) ? /* @__PURE__ */ React.createElement(DeleteBtn, { label: "رفع الحظر", icon: "RotateCcw", onDelete: () => {
    mutate((n) => {
      n.kicks = n.kicks.filter((x) => x.id !== k.id);
    }, `رفع الحظر عن ${k.name}`);
    notify("رُفع الحظر");
  } }) : null))), open ? /* @__PURE__ */ React.createElement(Sheet, { title: "إضافة إلى قائمة الطرد", onClose: () => setOpen(false) }, /* @__PURE__ */ React.createElement("div", { className: "form" }, /* @__PURE__ */ React.createElement(Field, { label: "الاسم" }, /* @__PURE__ */ React.createElement("input", { id: "k-name", className: "input", maxLength: 40, value: f.name, onChange: (e) => setF({ ...f, name: e.target.value }) })), /* @__PURE__ */ React.createElement(Field, { label: "معرّف WePlay" }, /* @__PURE__ */ React.createElement("input", { id: "k-weid", className: "input mono", maxLength: 24, autoComplete: "off", autoCapitalize: "off", spellCheck: false, value: f.weid, onChange: (e) => setF({ ...f, weid: e.target.value }) })), /* @__PURE__ */ React.createElement(IdError, { value: f.weid }), inKick ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "هذا المعرّف موجود مسبقاً في القائمة") : null, inMem ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "هذا المعرّف لعضو حالي (", inMem.name, "). استخدم زر «طرد العضو» من بطاقته.") : null, /* @__PURE__ */ React.createElement(Field, { label: "السبب" }, /* @__PURE__ */ React.createElement("textarea", { id: "k-reason", className: "input", value: f.reason, onChange: (e) => setF({ ...f, reason: e.target.value }) })), /* @__PURE__ */ React.createElement(Btn, { kind: "danger", icon: "Ban", className: "btn-block", disabled: !f.name.trim() || !validId(f.weid) || !!inKick || !!inMem, onClick: save }, "إضافة للقائمة"))) : null);
}
function Recruit() {
  const { db, me, mutate, notify } = useApp();
  const t = todayKey();
  const [f, setF] = useState({ name: "", weid: "", joined: t, rank: "عضو" });
  const idn = norm(f.weid).toLowerCase();
  const dup = idn && db.members.find((m) => norm(m.weid).toLowerCase() === idn);
  const ban = idn && db.kicks.find((k) => norm(k.weid).toLowerCase() === idn);
  const sameName = f.name.trim() && db.members.find((m) => m.name.trim() === f.name.trim());
  const ok = f.name.trim() && validId(f.weid) && !dup && !ban && f.joined;
  const submit = () => {
    mutate((n) => {
      n.members.push({ id: uid(), name: f.name.trim(), weid: norm(f.weid), rank: f.rank, joined: f.joined, fake: false });
    }, `تسجيل عضو جديد: ${f.name.trim()}`);
    notify(`تم تسجيل ${f.name.trim()}`);
    setF({ name: "", weid: "", joined: t, rank: "عضو" });
  };
  const recent = [...db.members].reverse().slice(0, 5);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "card form" }, /* @__PURE__ */ React.createElement(Field, { label: "اسم العضو" }, /* @__PURE__ */ React.createElement("input", { id: "rc-name", className: "input", maxLength: 40, value: f.name, onChange: (e) => setF({ ...f, name: e.target.value }), placeholder: "الاسم داخل اللعبة" })), sameName ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "يوجد عضو بنفس الاسم. تأكد أنه شخص مختلف.") : null, /* @__PURE__ */ React.createElement(Field, { label: "معرّف WePlay" }, /* @__PURE__ */ React.createElement("input", { id: "rc-weid", className: "input mono", maxLength: 24, autoComplete: "off", autoCapitalize: "off", spellCheck: false, value: f.weid, onChange: (e) => setF({ ...f, weid: e.target.value }), placeholder: "مثال: 48213907" })), /* @__PURE__ */ React.createElement(IdError, { value: f.weid }), ban ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad", role: "alert" }, /* @__PURE__ */ React.createElement(Icon, { n: "Ban", size: 16 }), /* @__PURE__ */ React.createElement("span", null, "ممنوع التسجيل: المعرّف في قائمة الطرد (السبب: ", ban.reason, ").")) : null, dup ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad", role: "alert" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), /* @__PURE__ */ React.createElement("span", null, "المعرّف مسجّل مسبقاً باسم ", dup.name, ".")) : null, !ban && !dup && validId(f.weid) ? /* @__PURE__ */ React.createElement("div", { className: "status-line good" }, /* @__PURE__ */ React.createElement(Icon, { n: "CheckCircle2", size: 16 }), "المعرّف غير مكرر وغير محظور.") : null, /* @__PURE__ */ React.createElement(Field, { label: "تاريخ الانضمام" }, /* @__PURE__ */ React.createElement("input", { id: "rc-date", type: "date", className: "input", value: f.joined, max: t, onChange: (e) => setF({ ...f, joined: e.target.value }) })), /* @__PURE__ */ React.createElement(Field, { label: "الرتبة" }, /* @__PURE__ */ React.createElement("select", { id: "rc-rank", className: "input", value: f.rank, onChange: (e) => setF({ ...f, rank: e.target.value }) }, RANKS.map((r) => /* @__PURE__ */ React.createElement("option", { key: r }, r)))), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "UserPlus", className: "btn-block", disabled: !ok, onClick: submit }, "تسجيل العضو")), recent.length ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "h-sec" }, "آخر المسجّلين"), /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, recent.map((m) => /* @__PURE__ */ React.createElement("div", { key: m.id, className: "list-row" }, /* @__PURE__ */ React.createElement("div", { className: "avatar" }, initial(m.name)), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, m.name), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, /* @__PURE__ */ React.createElement(IdText, { id: m.weid }), " · انضم ", fmtShort(m.joined))))))) : null);
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
  const valid = edit && edit.name.trim() && validId(edit.weid) && !clash && !banned && !pwBad;
  const save = async () => {
    if (!valid || busy) return;
    setBusy(true);
    const e = { ...edit, name: edit.name.trim(), weid: norm(edit.weid) };
    try {
      await window.FB.saveUser(e);
    } catch (err) {
      setBusy(false);
      notify(window.FB.errMsg(err), "warn");
      return;
    }
    mutate(() => {
    }, `${e.id ? e.password ? "تعديل وتغيير كلمة مرور" : "تعديل" : "إنشاء"} حساب ${e.name} (${ROLES[e.role].label})`);
    setBusy(false);
    setEdit(null);
    if (e.password) setCreated({ name: e.name, weid: e.weid, role: e.role, password: e.password, isNew: !e.id });
    else notify("تم تحديث الحساب");
  };
  const roleOptions = edit ? Object.entries(ROLES).filter(([k]) => k !== "leader" || edit.role === "leader") : [];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "note gold" }, /* @__PURE__ */ React.createElement(Icon, { n: "KeyRound", size: 20 }), /* @__PURE__ */ React.createElement("div", null, "تنشئ هنا معرّفات وكلمات مرور المسؤولين. كلمة المرور لا تُعرض بعد الحفظ، فسلّمها لصاحبها فوراً. وإن نسيها تضع له كلمة جديدة.")), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "UserPlus", className: "btn-block", onClick: openNew }, "إنشاء حساب جديد"), /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, db.users.map((u) => /* @__PURE__ */ React.createElement("div", { key: u.id, className: "list-row" }, /* @__PURE__ */ React.createElement("span", { className: "menu-ico" }, /* @__PURE__ */ React.createElement(Icon, { n: ROLES[u.role].icon, size: 20 })), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { className: "lr-name" }, u.name, u.id === me.id ? /* @__PURE__ */ React.createElement("span", { className: "t-gold", style: { fontSize: 12 } }, " (أنت)") : null), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, ROLES[u.role].label, " · ", /* @__PURE__ */ React.createElement("span", { className: "mono" }, u.weid))), /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn bordered", "aria-label": `تعديل ${u.name}`, onClick: () => {
    setShow(false);
    setEdit({ ...u, password: "" });
  } }, /* @__PURE__ */ React.createElement(Icon, { n: "Pencil", size: 18 })), u.id !== me.id ? /* @__PURE__ */ React.createElement(DeleteBtn, { label: `حذف ${u.name}`, onDelete: () => {
    window.FB.deleteUser(u).then(() => {
      mutate(() => {
      }, `حذف حساب ${u.name}`);
      notify("حُذف الحساب");
    }).catch((err) => notify(window.FB.errMsg(err), "warn"));
  } }) : null))), edit ? /* @__PURE__ */ React.createElement(Sheet, { title: edit.id ? "تعديل الحساب" : "حساب جديد", onClose: () => setEdit(null) }, /* @__PURE__ */ React.createElement("div", { className: "form" }, /* @__PURE__ */ React.createElement(Field, { label: "اسم المسؤول" }, /* @__PURE__ */ React.createElement("input", { id: "ac-name", className: "input", maxLength: 40, value: edit.name, onChange: (e) => setEdit({ ...edit, name: e.target.value }) })), /* @__PURE__ */ React.createElement(Field, { label: "معرّف WePlay" }, /* @__PURE__ */ React.createElement("input", { id: "ac-weid", className: "input mono", maxLength: 24, autoComplete: "off", autoCapitalize: "off", spellCheck: false, value: edit.weid, onChange: (e) => setEdit({ ...edit, weid: e.target.value }) })), /* @__PURE__ */ React.createElement(IdError, { value: edit.weid }), clash ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "هذا المعرّف له حساب مسبقاً (", clash.name, ").") : null, banned ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "Ban", size: 16 }), "هذا المعرّف في قائمة الطرد.") : null, /* @__PURE__ */ React.createElement(Field, { label: "الصلاحية" }, /* @__PURE__ */ React.createElement("select", { id: "ac-role", className: "input", value: edit.role, disabled: edit.id === me.id, onChange: (e) => setEdit({ ...edit, role: e.target.value }) }, roleOptions.map(([k, v]) => /* @__PURE__ */ React.createElement("option", { key: k, value: k }, v.label)))), /* @__PURE__ */ React.createElement(Field, { label: edit.id ? "كلمة مرور جديدة (اتركها فارغة دون تغيير)" : "كلمة المرور", hint: `${MIN_PW} أحرف على الأقل.` }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement(PwInput, { id: "ac-pw", value: edit.password, onChange: (v) => setEdit({ ...edit, password: v }), show, setShow, placeholder: edit.id ? "بدون تغيير" : "", autoComplete: "new-password" })), /* @__PURE__ */ React.createElement(Btn, { className: "btn-sm", icon: "RotateCcw", onClick: () => {
    setShow(true);
    setEdit({ ...edit, password: genPw() });
  } }, "توليد"))), pwBad ? /* @__PURE__ */ React.createElement("div", { className: "status-line bad" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 16 }), "كلمة المرور قصيرة.") : null, /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "Check", className: "btn-block", disabled: !valid || busy, onClick: save }, "حفظ"))) : null, created ? /* @__PURE__ */ React.createElement(Sheet, { title: created.isNew ? "تم إنشاء الحساب" : "تم تغيير كلمة المرور", onClose: () => setCreated(null) }, /* @__PURE__ */ React.createElement("div", { className: "note warn" }, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 20 }), /* @__PURE__ */ React.createElement("div", null, "انسخ البيانات الآن وسلّمها لـ ", created.name, ". لن تظهر كلمة المرور مرة أخرى.")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { paddingBlock: 4 } }, /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "الصلاحية"), /* @__PURE__ */ React.createElement("span", null, ROLES[created.role].label)), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "معرّف WePlay"), /* @__PURE__ */ React.createElement("span", { className: "mono" }, created.weid)), /* @__PURE__ */ React.createElement("div", { className: "kv" }, /* @__PURE__ */ React.createElement("span", null, "كلمة المرور"), /* @__PURE__ */ React.createElement("span", { className: "mono t-gold" }, created.password))), /* @__PURE__ */ React.createElement(Btn, { kind: "gold", icon: "Copy", className: "btn-block", onClick: () => copyText(`قبيلة أبناء الفوضى
المعرّف: ${created.weid}
كلمة المرور: ${created.password}`, notify) }, "نسخ بيانات الدخول")) : null);
}
function Audit() {
  const { db } = useApp();
  return db.audit.length === 0 ? /* @__PURE__ */ React.createElement(Empty, { icon: "ScrollText", title: "لا توجد عمليات مسجّلة", text: "تظهر هنا عمليات الدخول والتعديل والحذف والإنذارات." }) : /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, db.audit.map((a) => /* @__PURE__ */ React.createElement("div", { key: a.id, className: "list-row", style: { alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("span", { className: "menu-ico", style: { width: 36, height: 36 } }, /* @__PURE__ */ React.createElement(Icon, { n: (ROLES[a.role] || ROLES.mod).icon, size: 17 })), /* @__PURE__ */ React.createElement("div", { className: "lr-main" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14 } }, a.text), /* @__PURE__ */ React.createElement("div", { className: "lr-sub" }, a.by, " · ", fmtTs(a.ts))))));
}
function More({ setSub, onLogout }) {
  const { db, me } = useApp();
  const items = [
    { k: "attend", icon: "CheckCircle2", title: "الحضور", desc: "تسجيل حضور الأعضاء اليومي", show: true },
    { k: "events", icon: "CalendarDays", title: "الأنشطة والفعاليات", desc: "جدول الفعاليات وتواريخها", show: true, n: db.events.filter((e) => e.date >= todayKey()).length },
    { k: "recruit", icon: "UserPlus", title: "تسجيل عضو جديد", desc: "مع فحص التكرار والحظر", show: can.members(me.role) },
    { k: "kicks", icon: "Ban", title: "قائمة الطرد", desc: "المعرّفات الممنوعة من الانضمام", show: true, n: db.kicks.length },
    { k: "accounts", icon: "KeyRound", title: "إدارة الحسابات", desc: "إنشاء الحسابات وتحديد الرموز", show: can.leader(me.role) },
    { k: "audit", icon: "ScrollText", title: "سجل العمليات", desc: "من فعل ماذا ومتى", show: can.leader(me.role) }
  ].filter((i) => i.show);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "card row" }, /* @__PURE__ */ React.createElement("div", { className: "avatar" }, /* @__PURE__ */ React.createElement(Icon, { n: ROLES[me.role].icon, size: 22 })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "font-semibold" }, me.name), /* @__PURE__ */ React.createElement("div", { className: "sub" }, ROLES[me.role].label, " · ", /* @__PURE__ */ React.createElement("span", { className: "mono" }, me.weid)))), /* @__PURE__ */ React.createElement("div", { className: "card card-flush divide" }, items.map((i) => /* @__PURE__ */ React.createElement("button", { type: "button", key: i.k, className: "menu-item", onClick: () => setSub(i.k) }, /* @__PURE__ */ React.createElement("span", { className: "menu-ico" }, /* @__PURE__ */ React.createElement(Icon, { n: i.icon, size: 22 })), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontWeight: 600 } }, i.title), /* @__PURE__ */ React.createElement("span", { className: "sub", style: { display: "block" } }, i.desc)), i.n ? /* @__PURE__ */ React.createElement(Badge, { tone: "gold" }, i.n) : null, /* @__PURE__ */ React.createElement(Icon, { n: "ChevronLeft", size: 18, className: "t-mute" })))), /* @__PURE__ */ React.createElement("div", { className: "note" }, /* @__PURE__ */ React.createElement(Icon, { n: "Info", size: 18 }), /* @__PURE__ */ React.createElement("div", null, "البيانات محفوظة على هذا الجهاز فقط. لا تتزامن بين أجهزة المسؤولين.")), /* @__PURE__ */ React.createElement(Btn, { icon: "LogOut", className: "btn-block", onClick: onLogout }, "تسجيل الخروج"));
}
const NAV = [
  { k: "home", label: "الرئيسية", icon: "Users" },
  { k: "steal", label: "السرقات", icon: "Swords" },
  { k: "chests", label: "الصناديق", icon: "Package" },
  { k: "activity", label: "النشاط", icon: "Activity" },
  { k: "more", label: "المزيد", icon: "MoreHorizontal" }
];
const TITLES = {
  home: "قائمة الأعضاء",
  steal: "فرص السرقات",
  chests: "الصناديق الأسبوعية",
  activity: "النشاط الأسبوعي",
  more: "المزيد",
  attend: "الحضور",
  events: "الأنشطة والفعاليات",
  kicks: "قائمة الطرد",
  recruit: "تسجيل عضو جديد",
  accounts: "إدارة الحسابات",
  audit: "سجل العمليات"
};
const DATA_KEYS = ["demo", "members", "activity", "stealing", "chests", "warnings", "events", "attendance", "kicks", "audit"];
function Centered({ children }) {
  return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center", color: "var(--muted)" } }, children);
}
function App() {
  const FB = window.FB;
  const [db, setDb] = useState(emptyDb);
  const dbRef = useRef(db);
  const apply = (n) => {
    dbRef.current = n;
    setDb(n);
  };
  const [setupDone, setSetupDone] = useState(null);
  const [authUid, setAuthUid] = useState(void 0);
  const [ready, setReady] = useState({ data: false, users: false });
  const [fatal, setFatal] = useState("");
  const [setupErr, setSetupErr] = useState("");
  const [tab, setTab] = useState("home");
  const [sub, setSub] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const [toast, setToast] = useState(null);
  const loginFlag = useRef(false);
  const me = db.users.find((u) => u.id === authUid) || null;
  useEffect(() => {
    FB.hasSetup().then(setSetupDone).catch(() => setSetupDone(true));
    return FB.onAuth((u) => setAuthUid(u ? u.uid : null));
  }, []);
  useEffect(() => {
    setFatal("");
    if (!authUid) {
      apply(emptyDb());
      setReady({ data: false, users: false });
      return;
    }
    const fail = (e) => setFatal(/permission/.test(e && e.code || "") ? "لا تملك صلاحية قراءة البيانات. إمّا أن الحساب غير مفعّل أو تم حذفه، أو لم تُنشر قواعد Firestore بعد." : FB.errMsg(e));
    const off1 = FB.watchData((data) => {
      const n = { ...dbRef.current };
      DATA_KEYS.forEach((k) => {
        n[k] = data[k] !== void 0 ? data[k] : emptyDb()[k];
      });
      apply(n);
      setReady((r) => ({ ...r, data: true }));
    }, fail);
    const off2 = FB.watchUsers((users) => {
      apply({ ...dbRef.current, users });
      setReady((r) => ({ ...r, users: true }));
    }, fail);
    return () => {
      off1();
      off2();
    };
  }, [authUid]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab, sub]);
  const notify = (text, kind = "ok") => setToast({ text, kind, k: Math.random() });
  const mutate = (fn, log, actor) => {
    const prev = dbRef.current;
    const n = JSON.parse(JSON.stringify(prev));
    fn(n);
    const who = actor || me;
    if (log && who) n.audit.unshift({ id: uid(), ts: Date.now(), by: who.name, role: who.role, text: log });
    n.audit = n.audit.slice(0, 300);
    apply(n);
    const patch = {};
    DATA_KEYS.forEach((k) => {
      if (JSON.stringify(n[k]) !== JSON.stringify(prev[k])) patch[k] = n[k];
    });
    if (Object.keys(patch).length) FB.save(patch).catch((e) => notify(FB.errMsg(e), "warn"));
  };
  useEffect(() => {
    if (me && ready.data && loginFlag.current) {
      loginFlag.current = false;
      mutate(() => {
      }, "تسجيل دخول", me);
    }
  }, [me && me.id, ready.data]);
  const onLogin = () => {
    loginFlag.current = true;
    setTab("home");
    setSub(null);
  };
  const onFail = () => {
  };
  const onSetup = async ({ name, weid, pw, demo }) => {
    setSetupErr("");
    const data = { ...emptyDb(), ...demo ? demoData() : {} };
    delete data.users;
    data.audit = [{ id: uid(), ts: Date.now(), by: name, role: "leader", text: "تسجيل الرئيس وبدء النظام" }];
    try {
      await FB.setupFirst({ name, weid, pw, data });
      setSetupDone(true);
    } catch (e) {
      setSetupErr(FB.errMsg(e));
    }
  };
  const onLogout = () => {
    FB.signOut();
    setSub(null);
    setTab("home");
  };
  if (fatal) return /* @__PURE__ */ React.createElement(Centered, null, /* @__PURE__ */ React.createElement(Icon, { n: "AlertTriangle", size: 36, className: "t-danger" }), /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 360 } }, fatal), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-gold", onClick: onLogout }, "تسجيل الخروج"));
  if (setupDone === null || authUid === void 0) return /* @__PURE__ */ React.createElement(Centered, null, "جارٍ التحميل...");
  if (!authUid) return setupDone ? /* @__PURE__ */ React.createElement(Login, { db, onLogin, onFail }) : /* @__PURE__ */ React.createElement(Setup, { onCreate: onSetup, error: setupErr });
  if (!ready.data || !ready.users) return /* @__PURE__ */ React.createElement(Centered, null, "جارٍ التحميل...");
  if (!me) return /* @__PURE__ */ React.createElement(Centered, null, "هذا الحساب غير مفعّل أو تم حذفه.", /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-gold", onClick: onLogout }, "خروج"));
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
  else if (page === "recruit") body = can.members(me.role) ? /* @__PURE__ */ React.createElement(Recruit, null) : /* @__PURE__ */ React.createElement(Empty, { icon: "Lock", title: "لا تملك الصلاحية" });
  else if (page === "accounts") body = can.leader(me.role) ? /* @__PURE__ */ React.createElement(Accounts, null) : /* @__PURE__ */ React.createElement(Empty, { icon: "Lock", title: "لا تملك الصلاحية" });
  else if (page === "audit") body = can.leader(me.role) ? /* @__PURE__ */ React.createElement(Audit, null) : /* @__PURE__ */ React.createElement(Empty, { icon: "Lock", title: "لا تملك الصلاحية" });
  return /* @__PURE__ */ React.createElement(Ctx.Provider, { value: { db, me, mutate, notify } }, /* @__PURE__ */ React.createElement("header", { className: "header" }, /* @__PURE__ */ React.createElement("div", { className: "header-in gutter col" }, tab === "more" && sub ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "icon-btn bordered", "aria-label": "رجوع", onClick: () => setSub(null) }, /* @__PURE__ */ React.createElement(Icon, { n: "ChevronRight" })) : /* @__PURE__ */ React.createElement(Logo, { size: 46 }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("h1", { className: "header-title gold-text" }, TITLES[page]), /* @__PURE__ */ React.createElement("p", { className: "header-sub" }, "أبناء الفوضى SOA")), /* @__PURE__ */ React.createElement("div", { className: "role-chip" }, /* @__PURE__ */ React.createElement(Icon, { n: ROLES[me.role].icon, size: 14 }), ROLES[me.role].label))), /* @__PURE__ */ React.createElement("main", { className: "main gutter col" }, body), /* @__PURE__ */ React.createElement("nav", { className: "nav", "aria-label": "التنقل الرئيسي" }, /* @__PURE__ */ React.createElement("div", { className: "nav-in col" }, NAV.map((n) => /* @__PURE__ */ React.createElement("button", { type: "button", key: n.k, className: `nav-btn ${tab === n.k ? "on" : ""}`, "aria-current": tab === n.k ? "page" : void 0, onClick: () => goTab(n.k) }, /* @__PURE__ */ React.createElement(Icon, { n: n.icon, size: 22, sw: tab === n.k ? 2.2 : 1.7 }), /* @__PURE__ */ React.createElement("span", null, n.label))))), memberId ? /* @__PURE__ */ React.createElement(MemberSheet, { id: memberId, onClose: () => setMemberId(null) }) : null, toast ? /* @__PURE__ */ React.createElement("div", { className: "toast-wrap", key: toast.k }, /* @__PURE__ */ React.createElement("div", { className: `toast ${toast.kind === "warn" ? "warn" : ""}`, role: "status" }, /* @__PURE__ */ React.createElement(Icon, { n: toast.kind === "warn" ? "AlertTriangle" : "CheckCircle2", size: 18 }), toast.text)) : null);
}
function Root() {
  const [splash, setSplash] = useState(true);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(App, null), splash ? /* @__PURE__ */ React.createElement(Splash, { onDone: () => setSplash(false) }) : null);
}
document.documentElement.dir = "rtl";
document.documentElement.lang = "ar";
window.startApp = function() {
  if (window.__started) return;
  window.__started = true;
  ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(Root, null));
};
if (window.FB) window.startApp();
setTimeout(() => {
  if (!window.__started) document.getElementById("root").innerHTML = '<div style="min-height:100vh;display:grid;place-items:center;padding:24px;text-align:center;color:#a39b87">تعذّر الاتصال بخدمة Firebase. تحقق من الإنترنت وأعد تحميل الصفحة.</div>';
}, 12e3);
