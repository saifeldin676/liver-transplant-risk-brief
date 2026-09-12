import React, { useState, useMemo } from "react";
import {
  Activity, AlertTriangle, Heart, Wind, Droplet, Pill, Zap,
  ChevronDown, BookOpen, Shield, ListChecks, Waves, Info, RotateCcw,
  Share2, Copy, X, Users
} from "lucide-react";

/* ══════════════════════════════════════════════════════════
   MELD+ · Perioperative Risk Brief
   Liver transplant anesthesia clinical decision support

   PRIVACY: All computation is local and session-only.
   No data is stored, transmitted, logged, or persisted.
   Closing or refreshing the app discards all entries.
   ══════════════════════════════════════════════════════════ */

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const num = (v) => (v === "" || v === null || isNaN(parseFloat(v)) ? null : parseFloat(v));

/* ══════════════════════════════════════════════════════════
   SOURCES & CITATIONS
   Every score, threshold and recommendation surfaced in this
   app traces to one of the peer-reviewed sources or public
   allocation policies below. Each entry links to the source.
   ══════════════════════════════════════════════════════════ */
const PM = (q) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`;

const REFERENCES = [
  { t: "Kim WR et al. MELD 3.0: the model for end-stage liver disease updated. Gastroenterology 2021;161:1887–1895",
    u: PM("MELD 3.0 the model for end-stage liver disease updated Kim Gastroenterology 2021") },
  { t: "Wiesner R et al. MELD and allocation of donor livers. Gastroenterology 2003;124:91–96",
    u: PM("Wiesner MELD and allocation of donor livers Gastroenterology 2003") },
  { t: "OPTN/UNOS Policy 9: Allocation of Livers and Liver-Intestines (official policy PDF)",
    u: "https://optn.transplant.hrsa.gov/policies-bylaws/policies/" },
  { t: "Karvellas CJ et al. Intraoperative CRRT during liver transplantation: pilot RCT. 2019",
    u: PM("Karvellas intraoperative continuous renal replacement therapy liver transplantation randomized") },
  { t: "Huang HB et al. Intraoperative CRRT in liver transplantation: meta-analysis. 2020",
    u: PM("intraoperative continuous renal replacement therapy liver transplantation meta-analysis Huang") },
  { t: "Townsend DR et al. Intraoperative renal support during liver transplantation. 2018",
    u: PM("Townsend intraoperative renal support during liver transplantation") },
  { t: "KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl 2012",
    u: "https://kdigo.org/guidelines/acute-kidney-injury/" },
  { t: "Adelmann D, Kronish K, Ramsay MA. Anesthesia for liver transplantation. Anesthesiol Clin 2017",
    u: PM("Adelmann Kronish Ramsay anesthesia for liver transplantation Anesthesiology Clinics 2017") },
  { t: "Verbeek TA, Bezinover D et al. Hyponatremia and liver transplantation: narrative review. JCVA 2022",
    u: PM("Verbeek Bezinover hyponatremia and liver transplantation narrative review") },
  { t: "Yang SM et al. Intraoperative hyponatremia predicts 1-year mortality after LT. Sci Rep 2018",
    u: PM("intraoperative hyponatremia one-year mortality liver transplantation Yang Scientific Reports 2018") },
  { t: "Nayyar D et al. Management of severe hypoxemia post-LT in HPS. Am J Transplant 2015",
    u: PM("Nayyar management of severe hypoxemia after liver transplantation hepatopulmonary syndrome") },
  { t: "DuBrock HM, Savale L, Sitbon O, Raevens S, Kawut SM, Fallon MB, Heimbach JK, Chadha RM, Crespo G, Ramsay MAE, Krowka MJ. International Liver Transplantation Society practice guideline update on portopulmonary hypertension. Liver Transpl 2026;32:296–314",
    u: PM("International Liver Transplantation Society practice guideline update on portopulmonary hypertension DuBrock 2025") },
  { t: "Stoker AD et al. DCD liver transplantation: normothermic machine perfusion. Anesth Analg 2025",
    u: PM("donation after circulatory death liver transplantation normothermic machine perfusion anesthesia") },
  { t: "Cailes B, Farouque O et al. LVOTO in liver transplantation. Transplantation 2021",
    u: PM("left ventricular outflow tract obstruction liver transplantation Cailes Farouque") },
  { t: "Radosevich MA et al. THAM in critically ill adults. Anesth Analg 2023",
    u: PM("tromethamine THAM critically ill adults Radosevich") },
  { t: "Horlocker TT et al. ASRA regional anesthesia guidelines, 4th ed. Reg Anesth Pain Med 2018",
    u: "https://www.asra.com/guidelines-articles/guidelines" },
  { t: "Mahmoud S. Intraoperative CRRT During Liver Transplantation. Corewell Health William Beaumont",
    u: PM("intraoperative CRRT during liver transplantation") },
  { t: "Tang LCY et al. Pulmonary function test parameters prior to liver transplantation predict post-transplant survival and respiratory-related death. Liver Transpl 2026",
    u: PM("pulmonary function test parameters prior to liver transplantation predict post-transplant survival respiratory death Tang 2026") },
  { t: "Kia L et al. The utility of pulmonary function testing in predicting outcomes following liver transplantation. Liver Transpl 2016;22:805–811",
    u: PM("utility of pulmonary function testing predicting outcomes following liver transplantation Kia 2016") },
  { t: "Barone M et al. Post-operative complications and mortality risk in liver transplant candidates with obesity: systematic review and meta-analysis. Aliment Pharmacol Ther 2017",
    u: PM("post-operative complications mortality risk liver transplant candidates obesity systematic review meta-analysis Barone 2017") },
  { t: "Moctezuma-Velázquez C et al. Obesity in the liver transplant setting. Nutrients 2019;11:2552",
    u: PM("obesity in the liver transplant setting Moctezuma-Velazquez Nutrients 2019") },
  { t: "Kaur N et al. Impact of morbid obesity on liver transplant candidacy and outcomes: national and regional trends. Transplantation 2020",
    u: PM("impact of morbid obesity liver transplant candidacy outcomes national regional trends Kaur Transplantation 2020") },
  { t: "Carey EJ et al. Six-minute walk distance predicts mortality in liver transplant candidates. Liver Transpl 2010",
    u: PM("six-minute walk distance predicts mortality liver transplant candidates Carey 2010") },
  { t: "Cox-Flaherty K et al. Six-minute walk distance predicts outcomes in liver transplant candidates. Liver Transpl 2023",
    u: PM("six-minute walk distance predicts outcomes liver transplant candidates Cox-Flaherty 2023") },
  { t: "Krist AH et al. (US Preventive Services Task Force). Screening for lung cancer: USPSTF recommendation statement. JAMA 2021;325:962–970",
    u: PM("screening for lung cancer US Preventive Services Task Force recommendation statement JAMA 2021") },
  { t: "Wolf AMD et al. Screening for lung cancer: 2023 guideline update from the American Cancer Society. CA Cancer J Clin 2023",
    u: PM("screening for lung cancer 2023 guideline update American Cancer Society Wolf CA Cancer J Clin") },
  { t: "Lai JC et al. Development of a novel frailty index to predict mortality in patients with end-stage liver disease (Liver Frailty Index). Hepatology 2017;66:564–574",
    u: PM("development of a novel frailty index to predict mortality end-stage liver disease Lai Hepatology 2017") },
  { t: "Wang S et al. Frailty is associated with increased risk of cirrhosis disease progression and death. Hepatology 2021",
    u: PM("frailty associated with increased risk of cirrhosis disease progression and death Wang Hepatology 2021") },
  { t: "Wang CW et al. The range and reproducibility of the Liver Frailty Index. Liver Transpl 2019;25:841–847",
    u: PM("range and reproducibility of the Liver Frailty Index Wang Liver Transplantation 2019") },
  { t: "Kim WR et al. Hyponatremia and mortality among patients on the liver-transplant waiting list (MELD-Na). N Engl J Med 2008;359:1018–1026",
    u: PM("hyponatremia and mortality among patients on the liver transplant waiting list Kim New England Journal Medicine 2008") },
  { t: "Pugh RNH et al. Transection of the oesophagus for bleeding oesophageal varices (Child-Pugh score). Br J Surg 1973;60:646–649",
    u: PM("transection of the oesophagus for bleeding oesophageal varices Pugh British Journal of Surgery 1973") },
];

/* ── MELD 3.0 (OPTN standard since 2023; age ≥12) ──
   Kim WR et al. Gastroenterology 2021;161:1887–1895 */
function meld3(bili, inr, cr, na, alb, female, dialysis) {
  const b = Math.max(bili, 1);
  const i = Math.max(inr, 1);
  const c = dialysis ? 3.0 : clamp(Math.max(cr, 1), 1, 3);
  const n = clamp(na, 125, 137);
  const a = clamp(alb, 1.5, 3.5);
  const raw =
    1.33 * (female ? 1 : 0) +
    4.56 * Math.log(b) +
    0.82 * (137 - n) -
    0.24 * (137 - n) * Math.log(b) +
    9.09 * Math.log(i) +
    11.14 * Math.log(c) +
    1.85 * (3.5 - a) -
    1.83 * (3.5 - a) * Math.log(c) +
    6;
  return clamp(Math.round(raw), 6, 40);
}

/* ── MELD-Na (prior OPTN standard, 2016–2023) ── */
function meldNa(bili, inr, cr, na, dialysis) {
  const b = Math.max(bili, 1);
  const i = Math.max(inr, 1);
  const c = dialysis ? 4.0 : clamp(Math.max(cr, 1), 1, 4);
  const base = 3.78 * Math.log(b) + 11.2 * Math.log(i) + 9.57 * Math.log(c) + 6.43;
  const m = clamp(Math.round(base), 6, 40);
  if (m <= 11) return m;
  const n = clamp(na, 125, 137);
  return clamp(Math.round(m + 1.32 * (137 - n) - 0.033 * m * (137 - n)), 6, 40);
}

/* ── 90-day survival from MELD 3.0 ── */
const survival90 = (m) => (Math.pow(0.946, Math.exp(0.17698 * m - 3.56)) * 100);

/* ── 3-month mortality bands (Wiesner et al. Gastroenterology 2003) ── */
function mortality3mo(m) {
  if (m <= 9) return "1.9%";
  if (m <= 19) return "6.0%";
  if (m <= 29) return "19.6%";
  if (m <= 39) return "52.6%";
  return "71.3%";
}

/* ── Child-Pugh ── */
function childPugh(bili, alb, inr, ascites, enceph) {
  let p = 0;
  p += bili < 2 ? 1 : bili <= 3 ? 2 : 3;
  p += alb > 3.5 ? 1 : alb >= 2.8 ? 2 : 3;
  p += inr < 1.7 ? 1 : inr <= 2.3 ? 2 : 3;
  p += ascites === "none" ? 1 : ascites === "mild" ? 2 : 3;
  p += enceph === "none" ? 1 : enceph === "12" ? 2 : 3;
  const cls = p <= 6 ? "A" : p <= 9 ? "B" : "C";
  return { pts: p, cls, surv1y: { A: "100%", B: "80%", C: "45%" }[cls], mort: { A: "10%", B: "30%", C: "76–82%" }[cls] };
}

/* ── BMI classification (WHO) ── */
function bmiClass(bmi) {
  if (bmi < 18.5) return { label: "Underweight", c: "#FFC857" };
  if (bmi < 25) return { label: "Normal", c: "#7CD992" };
  if (bmi < 30) return { label: "Overweight", c: "#FFC857" };
  if (bmi < 35) return { label: "Obesity I", c: "#FF9A5A" };
  if (bmi < 40) return { label: "Obesity II", c: "#FF9A5A" };
  return { label: "Obesity III", c: "#FF6B6B" };
}

const tierFor = (s) =>
  s <= 9 ? { label: "Low", c: "#7CD992", bg: "#0e1d15", br: "#2d5a3d" }
  : s <= 19 ? { label: "Moderate", c: "#FFC857", bg: "#1d1707", br: "#6b5216" }
  : s <= 29 ? { label: "High", c: "#FF9A5A", bg: "#1f1207", br: "#7a4318" }
  : { label: "Severe", c: "#FF6B6B", bg: "#1f0a0a", br: "#7a2323" };

const CTP_C = { A: "#7CD992", B: "#FFC857", C: "#FF6B6B" };

const INIT = {
  age: "", sex: "male", weightKg: "", heightCm: "",
  smoke: "never", cigsDay: "", smokeYears: "", quitYears: "",
  fev1pp: "", fvcpp: "", fev1fvc: "", dlcopp: "", tlcpp: "",
  lfi: "",
  hgb: "", plts: "", fib: "",
  bili: "", inr: "", creat: "", na: "", alb: "",
  dialysis: false, aki: false, preopCRRT: false,
  k: "", ph: "", hco3: "", lactate: "", cvp: "", uop: "",
  spo2: "", hps: false, poph: false,
  cad: false, ef: "", rvsp: "", lvoto: false, exert: false, dm: false, afib: false,
  rhcCO: "", rhcCI: "", rhcMPAP: "", rhcPAWP: "", rhcPVR: "",
  ascites: "none", enceph: "none", varices: false,
  tegR: "", tegMA: "", tegLY30: "",
  opioid: false, dcd: false,
  hcc: false, alf: false,
  hccLesions: "none", hccLargestCm: "", hccVasc: false, hccExtra: false,
  priorTIPS: "none", pvtGrade: "none",
};

/* ══════════════ UI primitives ══════════════ */
const Card = ({ children, className = "" }) => (
  <div className={`bg-[#101D29] border border-[#1F3645] rounded-xl p-3.5 ${className}`}>{children}</div>
);

const Sec = ({ icon: I, label, color }) => (
  <div className="flex items-center gap-2 mb-2.5 pb-1.5 border-b border-[#1F3645]">
    <I size={13} style={{ color }} />
    <span className="text-[11px] font-bold tracking-wide text-[#E6EEF2] uppercase">{label}</span>
  </div>
);

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[9px] uppercase tracking-wider text-[#8FA3B3]">{label}</span>
    {children}
  </label>
);

const NIn = ({ warn, ...props }) => (
  <input type="number" step="any" inputMode="decimal"
    className={`bg-[#0E1A24] border rounded-md px-2.5 py-2 text-[#E6EEF2] font-mono text-[15px] focus:outline-none w-full ${
      warn ? "border-[#FFC857] focus:border-[#FFC857]" : "border-[#27404F] focus:border-[#4DD8C9]"}`}
    {...props} />
);

/* ── Plausibility ranges ──
   Wide, deliberately permissive bounds — they exist to catch transcription
   slips (1180 typed for a sodium of 118), not to constrain clinical judgment.
   A value outside the range is flagged, never blocked or altered. */
const RANGES = {
  age: [16, 100, "yrs"], heightCm: [100, 230, "cm"], weightKg: [25, 300, "kg"],
  cigsDay: [1, 100, "per day"], smokeYears: [1, 80, "yrs"], quitYears: [0, 70, "yrs"],
  hgb: [3, 20, "g/dL"], plts: [1, 800, "×10³/µL"], fib: [20, 900, "mg/dL"],
  bili: [0.1, 60, "mg/dL"], inr: [0.7, 12, ""], creat: [0.1, 15, "mg/dL"],
  na: [100, 175, "mmol/L"], alb: [0.5, 6, "g/dL"], spo2: [50, 100, "%"],
  k: [1.5, 9, "mmol/L"], ph: [6.6, 7.8, ""], hco3: [2, 45, "mmol/L"],
  lactate: [0.2, 30, "mmol/L"], cvp: [0, 40, "mmHg"], uop: [0, 10, "mL/kg/hr"],
  fev1pp: [10, 150, "% pred"], fvcpp: [10, 150, "% pred"], fev1fvc: [10, 100, "%"],
  dlcopp: [5, 150, "% pred"], tlcpp: [20, 160, "% pred"],
  ef: [5, 80, "%"], rvsp: [5, 150, "mmHg"],
  rhcCO: [1, 15, "L/min"], rhcCI: [0.5, 8, "L/min/m²"], rhcMPAP: [5, 90, "mmHg"],
  rhcPAWP: [0, 45, "mmHg"], rhcPVR: [0.1, 20, "WU"],
  tegR: [0, 60, "min"], tegMA: [0, 90, "mm"], tegLY30: [0, 100, "%"],
  lfi: [1, 7, ""], hccLargestCm: [0.2, 25, "cm"],
};

const outOfRange = (key, value) => {
  const n = num(value);
  const r = RANGES[key];
  return n !== null && r && (n < r[0] || n > r[1]) ? r : null;
};

/* Numeric field with an inline, non-blocking plausibility hint. */
const NumField = ({ label, value, onChange, placeholder, fieldKey }) => {
  const r = outOfRange(fieldKey, value);
  return (
    <Field label={label}>
      <NIn placeholder={placeholder} value={value} onChange={onChange} warn={!!r} />
      {r && (
        <span className="text-[9px] text-[#FFC857] leading-snug mt-0.5">
          Outside the expected range ({r[0]}–{r[1]}{r[2] ? ` ${r[2]}` : ""}) — check this value
        </span>
      )}
    </Field>
  );
};

const Sel = ({ value, onChange, options }) => (
  <select value={value} onChange={onChange}
    className="bg-[#0E1A24] border border-[#27404F] rounded-md px-2.5 py-2 text-[#E6EEF2] text-[13px] focus:outline-none focus:border-[#4DD8C9] w-full">
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

const Chk = ({ label, sub, checked, onChange }) => (
  <label className="flex items-start gap-2.5 text-[12px] text-[#C9D6DE] cursor-pointer py-1">
    <input type="checkbox" checked={checked} onChange={onChange}
      className="mt-0.5 h-4 w-4 rounded accent-[#4DD8C9] flex-shrink-0" />
    <span className="leading-snug">
      {label}
      {sub && <span className="block text-[10px] text-[#56707F] mt-0.5">{sub}</span>}
    </span>
  </label>
);

const Flag = ({ text, level = "high" }) => {
  const s = {
    high: "bg-[#1f0a0a] border-[#5a1a1a] text-[#FFD7D7]",
    med: "bg-[#1d1707] border-[#4a3500] text-[#FFE4A0]",
    info: "bg-[#0d1a24] border-[#1e3a52] text-[#C8DEFF]",
    ok: "bg-[#0e1d15] border-[#2d5a3d] text-[#B8F0C8]",
  }[level];
  return <div className={`text-[11.5px] leading-relaxed border rounded-lg px-2.5 py-2 ${s}`}>{text}</div>;
};

const Bul = ({ children }) => (
  <li className="text-[11.5px] text-[#C9D6DE] leading-relaxed pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-[#4DD8C9] before:font-bold">
    {children}
  </li>
);

const Collap = ({ title, icon: I, color, children, open: initOpen = false }) => {
  const [open, setOpen] = useState(initOpen);
  /* Expand when the condition that should open this section becomes true —
     e.g. ticking "Hepatocellular carcinoma" opens the Milan / T2 check.
     Collapsing is left to the user. */
  const wasOpen = React.useRef(initOpen);
  React.useEffect(() => {
    if (initOpen && !wasOpen.current) setOpen(true);
    wasOpen.current = initOpen;
  }, [initOpen]);
  return (
    <div className="bg-[#101D29] border border-[#1F3645] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3.5 py-3">
        <span className="flex items-center gap-2 text-[11px] font-bold text-[#E6EEF2] uppercase tracking-wide">
          <I size={13} style={{ color }} />{title}
        </span>
        <ChevronDown size={14} className={`text-[#8FA3B3] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-3.5 pb-3.5 -mt-1">{children}</div>}
    </div>
  );
};

/* Collapsible formula + reference disclosure, shown under any score */
const Formula = ({ name, body, refText, refUrl }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#7CC4FF] hover:text-[#A8D8FF]">
        <BookOpen size={10} />{open ? "Hide formula" : "Formula & reference"}
      </button>
      {open && (
        <div className="mt-1.5 bg-[#0E1A24] border border-[#1a2e40] rounded-md p-2.5">
          <div className="text-[10px] font-bold text-[#E6EEF2] mb-1">{name}</div>
          <div className="font-mono text-[9.5px] text-[#C9D6DE] leading-relaxed whitespace-pre-wrap">{body}</div>
          {refUrl
            ? <a href={refUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#7CC4FF] underline block mt-1.5">{refText}</a>
            : <div className="text-[9px] text-[#56707F] mt-1.5">{refText}</div>}
        </div>
      )}
    </div>
  );
};

/* ══════════════ App ══════════════ */
export default function App() {
  /* Two working slots, held in memory only. Nothing is written to disk:
     switching between cases keeps both in view during a single session, and
     closing the app discards them. */
  const [cases, setCases] = useState([INIT, INIT]);
  const [active, setActive] = useState(0);
  const f = cases[active];
  const setF = (u) => setCases((cs) => cs.map((c, i) => (i === active ? (typeof u === "function" ? u(c) : u) : c)));

  const [tab, setTab] = useState("patient");
  const [zoom, setZoom] = useState(1);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(null);
  const zoomStep = (d) => setZoom((z) => clamp(Math.round((z + d) * 100) / 100, 0.9, 1.8));
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const caseLabel = (i) => `Case ${String.fromCharCode(65 + i)}`;
  const caseFilled = (c) => Object.keys(INIT).some((k) => c[k] !== INIT[k]);
  const resetAll = () => {
    if (window.confirm(`Reset ${caseLabel(active)}? This clears every field for this case and cannot be undone. The other case is not affected.`)) {
      setF(INIT);
      setTab("patient");
    }
  };

  const v = useMemo(() => ({
    age: num(f.age), bili: num(f.bili), inr: num(f.inr), creat: num(f.creat),
    na: num(f.na), alb: num(f.alb), k: num(f.k), ph: num(f.ph), hco3: num(f.hco3),
    lactate: num(f.lactate), cvp: num(f.cvp), uop: num(f.uop), spo2: num(f.spo2),
    plts: num(f.plts), fib: num(f.fib), tegR: num(f.tegR), tegMA: num(f.tegMA), tegLY30: num(f.tegLY30),
    hgb: num(f.hgb),
    weightKg: num(f.weightKg), heightCm: num(f.heightCm),
    cigsDay: num(f.cigsDay), smokeYears: num(f.smokeYears), quitYears: num(f.quitYears),
    fev1pp: num(f.fev1pp), fvcpp: num(f.fvcpp), fev1fvc: num(f.fev1fvc), dlcopp: num(f.dlcopp), tlcpp: num(f.tlcpp),
    lfi: num(f.lfi),
    ef: num(f.ef), rvsp: num(f.rvsp),
    rhcCO: num(f.rhcCO), rhcCI: num(f.rhcCI), rhcMPAP: num(f.rhcMPAP), rhcPAWP: num(f.rhcPAWP), rhcPVR: num(f.rhcPVR),
    hccLargestCm: num(f.hccLargestCm),
  }), [f]);

  const hasCore = v.bili !== null && v.inr !== null && v.creat !== null;
  const has3 = hasCore && v.na !== null && v.alb !== null;

  /* Reduced systolic function, derived from the entered ejection fraction. */
  const efLow = v.ef !== null && v.ef < 55;

  const m3 = has3 ? meld3(v.bili, v.inr, v.creat, v.na, v.alb, f.sex === "female", f.dialysis) : null;
  const mNa = hasCore ? meldNa(v.bili, v.inr, v.creat, v.na ?? 137, f.dialysis) : null;
  const t3 = m3 !== null ? tierFor(m3) : null;
  const ctp = (v.bili !== null && v.alb !== null && v.inr !== null)
    ? childPugh(v.bili, v.alb, v.inr, f.ascites, f.enceph) : null;

  /* ── CRRT threshold engine (Mahmoud, Intraoperative CRRT During LT) ── */
  const crrt = useMemo(() => {
    const met = [];
    if (f.preopCRRT) met.push({ t: "Already on CRRT pre-transplant", d: "Continue intraoperatively — do not interrupt", ref: "Clinical practice" });
    if (v.k !== null && v.k > 5.5) met.push({ t: `Refractory hyperkalemia — K⁺ ${v.k} mmol/L`, d: "Threshold K⁺ >5.5–6.0 mmol/L", ref: "Karvellas 2019; Townsend 2018" });
    if ((v.ph !== null && v.ph < 7.10) || (v.hco3 !== null && v.hco3 < 12))
      met.push({ t: `Severe metabolic acidosis${v.ph !== null ? ` — pH ${v.ph}` : ""}${v.hco3 !== null ? ` · HCO₃ ${v.hco3}` : ""}`, d: "Threshold pH <7.10 or HCO₃ <12 mmol/L", ref: "Townsend 2018; Huang 2020" });
    if (v.cvp !== null && v.cvp > 18) met.push({ t: `Hypervolemia — CVP ${v.cvp} mmHg`, d: "Threshold CVP >18–20 mmHg or weight gain >10%", ref: "EMJ Reviews; Liver Transpl 2020" });
    if (v.uop !== null && v.uop < 0.3) met.push({ t: `Refractory oliguria — UOP ${v.uop} mL/kg/hr`, d: "Threshold <0.3 mL/kg/hr >6 hrs, or anuria >12 hrs", ref: "KDIGO 2012" });
    if (v.na !== null && v.na < 125) met.push({ t: `Severe hyponatremia — Na⁺ ${v.na} mmol/L`, d: "Threshold Na⁺ <125 mmol/L — CRRT allows controlled correction", ref: "AASLD; EMJ Reviews" });
    if (v.lactate !== null && v.lactate > 6) met.push({ t: `Lactate clearance failure — ${v.lactate} mmol/L`, d: "Threshold lactate >6–8 mmol/L", ref: "Townsend 2018" });

    const antic = [];
    if (m3 !== null && m3 > 35) antic.push("MELD >35");
    if (v.na !== null && v.na < 125) antic.push("Na <125");
    if (v.lactate !== null && v.lactate > 6) antic.push("lactate >6");

    const contra = [];
    if (f.tegLY30 !== "" && v.tegLY30 > 3) contra.push("Hyperfibrinolysis on TEG — severe coagulopathy with active bleeding is a relative contraindication");
    if (v.plts !== null && v.plts < 50) contra.push("Platelets <50k — assess bleeding before circuit anticoagulation");

    return { met, antic, contra };
  }, [f, v, m3]);

  /* ── Body habitus + smoking → pulmonary/metabolic workup engine ──
     BMI class (WHO); pack-years = (cig/day ÷ 20) × years smoked.
     Triggers reference: Tang 2026, Kia 2016 (PFT/DLCO); USPSTF 2021 /
     ACS 2023 (LDCT); Carey 2010, Cox-Flaherty 2023 (6MWD); Barone 2017,
     Moctezuma-Velázquez 2019, Kaur 2020 (obesity). */
  const metab = useMemo(() => {
    const bmi = (v.weightKg !== null && v.heightCm !== null && v.heightCm > 0)
      ? v.weightKg / Math.pow(v.heightCm / 100, 2) : null;
    const bmiC = bmi !== null ? bmiClass(bmi) : null;
    const packYears = (f.smoke !== "never" && v.cigsDay !== null && v.smokeYears !== null)
      ? (v.cigsDay / 20) * v.smokeYears : null;

    // Recommended tests (deduped), each with rationale + source
    const tests = [];
    const add = (t, d, ref) => { if (!tests.find((x) => x.t === t)) tests.push({ t, d, ref }); };

    // Baseline chest imaging for every candidate
    add("Chest radiograph (CXR)", "Baseline pre-transplant screen for effusion, infection, and parenchymal disease.", "Pre-LT standard");

    // Pulmonary function testing (FEV1 + DLCO)
    const pftReasons = [];
    if (f.smoke === "current" || f.smoke === "former") pftReasons.push("smoking history");
    if (packYears !== null && packYears >= 10) pftReasons.push(`${packYears.toFixed(0)} pack-years`);
    if (f.exert) pftReasons.push("exertional dyspnea");
    if (f.hps) pftReasons.push("HPS features");
    if (f.poph) pftReasons.push("elevated RVSP/PoPH");
    if (v.spo2 !== null && v.spo2 < 96) pftReasons.push(`SpO₂ ${v.spo2}%`);
    if (bmi !== null && bmi >= 35) pftReasons.push(`BMI ${bmi.toFixed(1)}`);
    if (pftReasons.length > 0)
      add("Pulmonary function test — spirometry + DLCO", `Indicated: ${pftReasons.join(", ")}. Low DLCO independently predicts post-LT respiratory death; low FEV1 predicts worse survival; restrictive pattern predicts prolonged ventilation and ICU stay.`, "Tang 2026; Kia 2016");

    // Low-dose CT lung cancer screening (USPSTF/ACS)
    const ldctEligible = v.age !== null && v.age >= 50 && v.age <= 80 &&
      packYears !== null && packYears >= 20 &&
      (f.smoke === "current" || (f.smoke === "former" && (v.quitYears === null || v.quitYears <= 15)));
    if (ldctEligible)
      add("Low-dose chest CT — lung cancer screening", `Meets USPSTF/ACS criteria (age 50–80, ≥20 pack-years, current smoker or quit ≤15 y). Screen before listing given immunosuppression after transplant.`, "USPSTF 2021; ACS 2023");

    // Diagnostic chest CT
    if (f.hps)
      add("Chest CT (contrast) + shunt quantification", "HPS features — characterize intrapulmonary shunting and exclude parenchymal disease.", "Nayyar 2015");
    else if ((f.smoke === "current" || f.smoke === "former") && f.exert && !ldctEligible)
      add("Chest CT", "Smoking history with exertional dyspnea and abnormal screen — evaluate parenchymal / airway disease.", "Kia 2016");

    // 6-minute walk test
    const sixReasons = [];
    if (f.exert) sixReasons.push("exertional dyspnea");
    if (bmi !== null && bmi >= 30) sixReasons.push("obesity");
    if (f.poph || f.hps) sixReasons.push("pulmonary vascular disease");
    if (packYears !== null && packYears >= 20) sixReasons.push("heavy smoking history");
    if (sixReasons.length > 0)
      add("Six-minute walk test (6MWT)", `Functional / frailty assessment (${sixReasons.join(", ")}). 6MWD <250 m predicts waitlist mortality; each 50 m decrease ≈ 25% higher death risk.`, "Carey 2010; Cox-Flaherty 2023");

    // Actions / flags
    const actions = [];
    if (f.smoke === "current")
      actions.push({ t: "Active smoker — cessation counseling", d: "Current smoking at assessment is independently associated with poorer post-LT survival (aHR ≈ 1.95). Refer to cessation; document abstinence per program policy.", ref: "Tang 2026", lvl: "high" });
    if (bmi !== null && bmi >= 40)
      actions.push({ t: `BMI ${bmi.toFixed(1)} — Obesity III (relative contraindication)`, d: "Class III obesity is a relative contraindication with higher post-LT mortality. Formal cardiopulmonary workup (echo, PFT, 6MWT), dietitian-led weight loss, and evaluation for bariatric surgery (sleeve gastrectomy has the best LT evidence).", ref: "Barone 2017; Kaur 2020; Moctezuma-Velázquez 2019", lvl: "high" });
    else if (bmi !== null && bmi >= 35)
      actions.push({ t: `BMI ${bmi.toFixed(1)} — Obesity II`, d: "Screen for OSA, formal cardiovascular risk assessment, difficult-airway and dosing planning, and respiratory optimization. Begin structured weight loss.", ref: "Moctezuma-Velázquez 2019", lvl: "med" });
    else if (bmi !== null && bmi >= 30)
      actions.push({ t: `BMI ${bmi.toFixed(1)} — Obesity I`, d: "BMI >30 raises post-op complications (esp. cardiopulmonary and infectious). Cardiovascular risk assessment and respiratory optimization; encourage diet/exercise without precipitating frailty.", ref: "Barone 2017", lvl: "med" });
    else if (bmi !== null && bmi < 18.5)
      actions.push({ t: `BMI ${bmi.toFixed(1)} — Underweight`, d: "Assess for sarcopenia and frailty; nutrition and prehabilitation referral. Malnutrition independently worsens perioperative outcomes.", ref: "Moctezuma-Velázquez 2019", lvl: "med" });

    return { bmi, bmiC, packYears, tests, actions };
  }, [f, v]);

  /* ── PFT interpretation → predicted post-LT respiratory course ──
     Pattern (ATS/ERS): obstruction FEV1/FVC <70%; restriction FVC or TLC
     <80% predicted with non-obstructive ratio. Outcome associations:
     restrictive disease and low DLCO/TLC predict prolonged post-LT
     mechanical ventilation and longer ICU/hospital stay (Kia 2016);
     low DLCO independently predicts respiratory-cause death and low FEV1
     predicts worse overall survival (Tang 2026). Bands are qualitative
     risk associations, not precise time predictions. */
  const pft = useMemo(() => {
    const { fev1pp, fvcpp, fev1fvc, dlcopp, tlcpp } = v;
    const any = [fev1pp, fvcpp, fev1fvc, dlcopp, tlcpp].some((x) => x !== null);
    if (!any) return null;

    const obstruction = fev1fvc !== null && fev1fvc < 70;
    const restriction = (!obstruction) && ((fvcpp !== null && fvcpp < 80) || (tlcpp !== null && tlcpp < 80));
    let pattern = "Normal / non-specific";
    if (obstruction && restriction) pattern = "Mixed obstructive + restrictive";
    else if (obstruction) pattern = "Obstructive";
    else if (restriction) pattern = "Restrictive";

    const dlcoSev = dlcopp === null ? null
      : dlcopp >= 75 ? { label: "Normal", c: "#7CD992" }
      : dlcopp >= 60 ? { label: "Mild ↓", c: "#FFC857" }
      : dlcopp >= 40 ? { label: "Moderate ↓", c: "#FF9A5A" }
      : { label: "Severe ↓", c: "#FF6B6B" };

    // Prolonged ventilation + ICU/hospital LOS risk
    let ventLvl = "low";
    if (restriction || (tlcpp !== null && tlcpp < 70) || (dlcopp !== null && dlcopp < 40) || (fvcpp !== null && fvcpp < 60))
      ventLvl = "high";
    else if ((fvcpp !== null && fvcpp < 80) || (dlcopp !== null && dlcopp < 60) || (tlcpp !== null && tlcpp < 80))
      ventLvl = "med";

    // Respiratory-cause mortality risk (post-LT)
    let respLvl = "low";
    if ((dlcopp !== null && dlcopp < 40) || f.smoke === "current") respLvl = "high";
    else if (dlcopp !== null && dlcopp < 60) respLvl = "med";

    // Overall survival signal
    let survLvl = "low";
    if ((fev1pp !== null && fev1pp < 60) || f.smoke === "current") survLvl = "high";
    else if (fev1pp !== null && fev1pp < 70) survLvl = "med";

    const word = (l) => l === "high" ? "Higher" : l === "med" ? "Moderate" : "Baseline";
    return {
      pattern, obstruction, restriction, dlcoSev,
      vent: { lvl: ventLvl, word: word(ventLvl) },
      resp: { lvl: respLvl, word: word(respLvl) },
      surv: { lvl: survLvl, word: word(survLvl) },
    };
  }, [v, f.smoke]);

  const lvlStyle = (l) => l === "high"
    ? { c: "#FF6B6B", bg: "#1f0a0a", br: "#5a1a1a" }
    : l === "med" ? { c: "#FFC857", bg: "#1d1707", br: "#4a3500" }
    : { c: "#7CD992", bg: "#0e1d15", br: "#2d5a3d" };

  /* ── Frailty: Liver Frailty Index category (Lai 2017; cut-offs Wang 2021) ──
     LFI is entered from the validated tool (grip strength, 5 chair-stand
     time, 3-position balance). Robust <3.2 · Pre-frail 3.2–4.4 · Frail ≥4.5. */
  const frailty = useMemo(() => {
    if (v.lfi === null) return null;
    const s = v.lfi;
    if (s < 3.2) return { label: "Robust", pts: 0, c: "#7CD992" };
    if (s < 4.5) return { label: "Pre-frail", pts: 1, c: "#FFC857" };
    return { label: "Frail", pts: 2, c: "#FF6B6B" };
  }, [v.lfi]);

  /* ── Pulmonary hypertension / POPH engine ──
     ILTS practice guideline update on portopulmonary hypertension
     (DuBrock, Savale, Sitbon, … Krowka. Liver Transpl 2026;32:296–314),
     which adopts the ESC/ERS revised haemodynamic definitions:
       PH                    mPAP >20 mmHg
       Precapillary (POPH)   mPAP >20, PAWP ≤15, PVR >2 WU
       Isolated postcapillary mPAP >20, PAWP >15, PVR ≤2 WU
       Combined pre/post      mPAP >20, PAWP >15, PVR >2 WU
     Severity (Table 2): mild 20<mPAP<35 · moderate 35≤mPAP<45 · severe mPAP≥45.
     Screening (Rec 3–5): echo for all LT/TIPS candidates; PH-expert consultation
     ± RHC for estimated RVSP >40 mmHg (lowered from 50) or more than mild RV
     dilation/dysfunction.
     LT candidacy (Rec 13–14): absolute contraindications are mPAP >45–50 mmHg,
     PVR >5 WU, or severe RV dysfunction; LT with MELD exception is considered
     at mPAP <35, or mPAP 35–45 with PVR <3 WU.
     PVR is entered in Wood units; 1 WU = 80 dyn·s·cm⁻⁵. */
  const ph = useMemo(() => {
    const { rvsp, rhcMPAP: mpap, rhcPAWP: pawp, rhcPVR: pvr } = v;
    const echoTrigger = rvsp !== null && rvsp > 40;
    const hasRHC = mpap !== null;
    if (!echoTrigger && !hasRHC && !f.poph) return null;

    let sev = null, pattern = null, candidacy = null;
    if (hasRHC) {
      sev = mpap <= 20 ? { label: "No PH", c: "#7CD992" }
        : mpap < 35 ? { label: "Mild", c: "#FFC857" }
        : mpap < 45 ? { label: "Moderate", c: "#FF9A5A" }
        : { label: "Severe", c: "#FF6B6B" };

      if (mpap > 20) {
        if (pvr !== null && pawp !== null) {
          pattern = pawp <= 15 && pvr > 2 ? "Precapillary — POPH pattern"
            : pawp > 15 && pvr > 2 ? "Combined pre- and postcapillary"
            : pawp > 15 ? "Isolated postcapillary"
            : "mPAP elevated with PVR ≤2 WU — high-flow / hyperdynamic pattern";
        } else if (pvr !== null) {
          pattern = pvr > 2 ? "PVR >2 WU — enter PAWP to confirm a precapillary (POPH) pattern"
            : "PVR ≤2 WU — favours a high-flow or postcapillary mechanism";
        } else {
          pattern = "Enter PVR (and PAWP) to classify the pattern";
        }

        // LT candidacy per Rec 13/14
        if (mpap > 45 || (pvr !== null && pvr > 5)) {
          candidacy = { lvl: "high", text: `mPAP ${mpap} mmHg${pvr !== null ? ` · PVR ${pvr} WU` : ""} — meets the ILTS absolute-contraindication range (mPAP >45–50 mmHg, PVR >5 WU, or severe RV dysfunction). Escalate PAH therapy; LT only after haemodynamics improve, by multidisciplinary decision.` };
        } else if (mpap >= 35) {
          candidacy = pvr !== null && pvr < 3
            ? { lvl: "med", text: `mPAP ${mpap} mmHg with PVR ${pvr} WU (<3) — LT with POPH MELD exception may be considered on multidisciplinary evaluation (ILTS Rec 14).` }
            : { lvl: "med", text: `mPAP ${mpap} mmHg (35–45) — consider escalation of PAH therapy and deferral of LT unless PVR is <3 WU (ILTS Rec 14).` };
        } else {
          candidacy = { lvl: "ok", text: `mPAP ${mpap} mmHg (<35) — within the range where LT is considered; evaluate for a POPH MELD exception if criteria are otherwise met (ILTS Rec 14).` };
        }
      }
    }

    const poph = hasRHC && mpap > 20 && (pvr === null || pvr > 2) && (pawp === null || pawp <= 15);
    const confirmedPH = hasRHC && mpap > 20;
    return { echoTrigger, hasRHC, sev, pattern, candidacy, poph, confirmedPH, active: confirmedPH || echoTrigger || f.poph };
  }, [v, f.poph]);

  /* ── Hyponatremia / sodium management protocol ──
     Verbeek TA, Bezinover D, et al. Hyponatremia and liver transplantation:
     a narrative review. J Cardiothorac Vasc Anesth 2022. Correction targets:
     preoperative 4–8 mmol/L per day (4–6 when ODS risk is high; therapeutic
     limit ≤8 in any 24 h), intraoperative ≤6 mmol/L per 24 h, postoperative
     4–6 mmol/L per day. An intraoperative rise >10 mmol/L is associated with
     higher 90-day mortality and more neurologic complications. */
  const naProt = useMemo(() => {
    if (v.na === null || v.na >= 135) return null;
    const tier = v.na < 125 ? { label: "Severe", c: "#FF6B6B", lvl: "high" }
      : v.na < 130 ? { label: "Moderate", c: "#FF9A5A", lvl: "med" }
      : { label: "Mild", c: "#FFC857", lvl: "med" };
    // ODS risk factors captured elsewhere in the app
    const odsRisk = [];
    if (v.na <= 105) odsRisk.push("Na⁺ ≤105 mmol/L");
    if (v.na < 120) odsRisk.push("profound hyponatremia");
    odsRisk.push("advanced liver disease");
    if (v.k !== null && v.k < 3.5) odsRisk.push(`hypokalemia (K⁺ ${v.k})`);
    if (metab.bmi !== null && metab.bmi < 18.5) odsRisk.push("malnutrition / underweight");
    return { tier, odsRisk, highRisk: odsRisk.length > 1 };
  }, [v.na, v.k, metab.bmi]);

  /* ── HCC Milan / OPTN T2 exception check ──
     T2 (OPTN Policy 9): 1 lesion 2–5 cm, or 2–3 lesions each 1–3 cm, with no
     macrovascular invasion and no extrahepatic spread. If met, the candidate is
     eligible for the standard HCC exception (score set to MMaT − 3) after the
     mandatory 6-month waiting period. Reference material only — the NLRB and the
     transplant program adjudicate the actual exception request. */
  const milan = useMemo(() => {
    if (f.hccLesions === "none") return null;
    if (f.hccVasc) return { meets: false, text: "Does not meet Milan / T2 criteria — macrovascular invasion present." };
    if (f.hccExtra) return { meets: false, text: "Does not meet Milan / T2 criteria — extrahepatic spread present." };
    if (f.hccLesions === "gt3") return { meets: false, text: "Does not meet Milan / T2 criteria — more than 3 lesions." };
    if (v.hccLargestCm === null) return { meets: null, text: "Enter the size of the largest lesion to complete the check." };
    if (f.hccLesions === "1") {
      return v.hccLargestCm >= 2 && v.hccLargestCm <= 5
        ? { meets: true, text: `Meets Milan / T2 criteria — 1 lesion at ${v.hccLargestCm} cm (within 2–5 cm), no vascular invasion, no extrahepatic spread. Eligible for the standard HCC exception: score set to MMaT − 3 after the mandatory 6-month wait.` }
        : { meets: false, text: `Does not meet Milan / T2 criteria — a solitary lesion must be 2–5 cm (entered ${v.hccLargestCm} cm).` };
    }
    if (f.hccLesions === "23") {
      return v.hccLargestCm >= 1 && v.hccLargestCm <= 3
        ? { meets: true, text: `Meets Milan / T2 criteria — 2–3 lesions, largest ${v.hccLargestCm} cm (each within 1–3 cm), no vascular invasion, no extrahepatic spread. Eligible for the standard HCC exception: score set to MMaT − 3 after the mandatory 6-month wait.` }
        : { meets: false, text: `Does not meet Milan / T2 criteria — with 2–3 lesions each must be 1–3 cm (largest entered ${v.hccLargestCm} cm).` };
    }
    return null;
  }, [f.hccLesions, f.hccVasc, f.hccExtra, v.hccLargestCm]);

  /* ── Composite Perioperative Risk (HEURISTIC — not a validated score,
     and NOT the MELD allocation score). Transparent aggregation of MELD 3.0,
     Child-Pugh, frailty (LFI), PFT, BMI, smoking, and cardiopulmonary flags
     for situational awareness only. */
  const composite = useMemo(() => {
    const parts = [];
    let pts = 0;
    const push = (label, p, detail) => { if (p > 0) { pts += p; parts.push({ label, p, detail }); } };

    if (m3 !== null) push(`MELD 3.0 ${m3}`, m3 >= 30 ? 3 : m3 >= 20 ? 2 : m3 >= 15 ? 1 : 0,
      m3 >= 30 ? "≥30" : m3 >= 20 ? "20–29" : m3 >= 15 ? "15–19" : "<15");
    if (ctp) push(`Child-Pugh ${ctp.cls}`, ctp.cls === "C" ? 2 : ctp.cls === "B" ? 1 : 0, `${ctp.pts} pts`);
    if (frailty) push(`Frailty — ${frailty.label}`, frailty.pts, `LFI ${v.lfi}`);
    if (pft) {
      const hi = [pft.vent, pft.resp, pft.surv].some((x) => x.lvl === "high");
      const me = [pft.vent, pft.resp, pft.surv].some((x) => x.lvl === "med");
      push("Pulmonary (PFT)", hi ? 2 : me ? 1 : 0, pft.pattern);
    }
    if (metab.bmi !== null) push(`BMI ${metab.bmi.toFixed(1)}`, metab.bmi >= 40 ? 2 : (metab.bmi >= 35 || metab.bmi < 18.5) ? 1 : 0, metab.bmiC.label);
    if (f.smoke === "current") push("Current smoker", 1, "");
    const cflags = [];
    if (f.cad) cflags.push("CAD");
    if (efLow) cflags.push("low EF");
    if (f.lvoto) cflags.push("LVOTO");
    if (f.poph) cflags.push("PoPH");
    if (f.hps && v.spo2 !== null && v.spo2 < 90) cflags.push("HPS hypoxemia");
    if (cflags.length > 0) push("Cardiopulmonary flags", Math.min(cflags.length, 2), cflags.join(", "));

    if (m3 === null && !ctp && parts.length === 0) return null;
    const tier = pts >= 9 ? { label: "Very High", c: "#FF6B6B", bg: "#1f0a0a", br: "#7a2323" }
      : pts >= 6 ? { label: "High", c: "#FF9A5A", bg: "#1f1207", br: "#7a4318" }
      : pts >= 3 ? { label: "Moderate", c: "#FFC857", bg: "#1d1707", br: "#6b5216" }
      : { label: "Low", c: "#7CD992", bg: "#0e1d15", br: "#2d5a3d" };
    return { pts, tier, parts };
  }, [m3, ctp, frailty, pft, metab, f, v.lfi, v.spo2, efLow]);

  /* ── UNOS status logic ── */
  const unos = useMemo(() => {
    const notes = [];
    if (f.alf) notes.push({ t: "Adult Status 1A candidate", d: "Acute liver failure — verify: encephalopathy onset ≤56 days of first symptom, no pre-existing liver disease, ICU admission, AND ≥1 of: ventilator dependence, dialysis/CVVHD, or INR >2.0. Receives MELD 40 equivalent priority; 500 NM allocation circle.", lvl: "high" });
    if (m3 !== null && m3 >= 37) notes.push({ t: `MELD ${m3} — highest acuity tier`, d: "MELD ≥37: allocated across 150 → 250 → 500 NM acuity circles ahead of all lower tiers.", lvl: "high" });
    else if (m3 !== null && m3 >= 33) notes.push({ t: `MELD ${m3} — tier 33–36`, d: "Allocated across 150 → 250 → 500 NM circles after Status 1A/1B and MELD ≥37.", lvl: "med" });
    else if (m3 !== null && m3 >= 29) notes.push({ t: `MELD ${m3} — tier 29–32`, d: "Allocated across 150 → 250 → 500 NM circles.", lvl: "med" });
    else if (m3 !== null && m3 >= 15) notes.push({ t: `MELD ${m3} — tier 15–28`, d: "Allocated within 150 → 250 NM circles. MELD ≥15 is the accepted survival-benefit threshold for transplant.", lvl: "info" });
    else if (m3 !== null) notes.push({ t: `MELD ${m3} — below 15`, d: "Transplant may confer net harm below MELD 15; local allocation only. Reassess for exception criteria.", lvl: "info" });
    if (f.hcc) notes.push({ t: "HCC exception → MMaT − 3", d: "If within Milan/T2 criteria (1 lesion 2–5 cm, or 2–3 lesions each 1–3 cm, no vascular invasion, no extrahepatic spread): after a 6-month waiting period, listed at MMaT − 3. Example: if area MMaT = 31, exception score = 28. Fixed — does not escalate every 3 months as under the old policy.", lvl: "info" });
    if (f.hps && v.spo2 !== null && v.spo2 < 90) notes.push({ t: "HPS exception → MMaT − 3", d: "PaO₂ <60 mmHg on room air with documented intrapulmonary shunting qualifies for a MMaT − 3 exception score.", lvl: "info" });
    if (f.poph || ph?.confirmedPH) notes.push({ t: "POPH exception → MMaT − 3", d: "Precapillary PH in portal hypertension (mPAP >20 mmHg, PAWP ≤15, PVR >2 WU) on PAH therapy. Post-treatment haemodynamics must reach mPAP <35 mmHg, or mPAP 35–45 with PVR <3 WU, with serial RHC every 3 months to maintain the exception. mPAP >45–50, PVR >5 WU, or severe RV dysfunction are absolute contraindications to LT.", lvl: "info" });
    return notes;
  }, [f, m3, v.spo2, ph]);

  /* Entered values that fall outside the plausibility ranges — surfaced so a
     mistyped figure on one tab cannot quietly drive a score on another. */
  const implausible = useMemo(
    () => Object.keys(RANGES).filter((k) => outOfRange(k, f[k])),
    [f]
  );

  /* ── Red flags ── */
  const flags = useMemo(() => {
    const r = [];
    if (implausible.length) r.push({ t: `${implausible.length} entered value${implausible.length === 1 ? "" : "s"} outside the expected range — check for a transcription error before relying on these scores. Look for the amber fields on the Patient tab.`, l: "med" });
    if (m3 !== null && m3 >= 30) r.push({ t: `MELD 3.0 ${m3} — 3-month mortality ${mortality3mo(m3)}. ICU-level monitoring, early MTP readiness, CRRT availability.`, l: "high" });
    if (ctp?.cls === "C") r.push({ t: `Child-Pugh C (${ctp.pts} pts) — 1-year survival ${ctp.surv1y}; non-transplant abdominal surgery mortality ${ctp.mort}.`, l: "high" });
    if (crrt.met.length > 0) r.push({ t: `IoCRRT criteria met (${crrt.met.length}) — see CRRT tab. Coordinate nephrology + perfusion before induction.`, l: "high" });
    if (v.na !== null && v.na < 125) r.push({ t: `Na⁺ ${v.na} — ODS risk. Follow the sodium protocol on the Plan tab: limit the intraoperative change to ≤6 mmol/L per 24 h, check Na⁺ frequently, and involve nephrology.`, l: "high" });
    else if (v.na !== null && v.na < 130) r.push({ t: `Na⁺ ${v.na} — intraoperative Na <130 is an independent predictor of 1-year mortality (Yang et al.).`, l: "med" });
    if (v.tegLY30 !== null && v.tegLY30 > 3) r.push({ t: `TEG LY30 ${v.tegLY30}% — hyperfibrinolysis. TXA 1 g IV now. Most lethal coagulation pattern in LT.`, l: "high" });
    if (f.poph && !ph?.hasRHC) r.push({ t: "Elevated RVSP / PASP on echo — right heart catheterization required before listing to confirm precapillary PH (mPAP >20 mmHg, PAWP ≤15, PVR >2 WU) and to guide PAH therapy (ILTS 2026).", l: "high" });
    if (f.hps && v.spo2 !== null && v.spo2 < 90) r.push({ t: `SpO₂ ${v.spo2}% with HPS features — prepare inhaled NO/epoprostenol; consider ECMO planning if PaO₂ <50 mmHg.`, l: "high" });
    if (f.lvoto) r.push({ t: "LVOTO — fluids and phenylephrine, not inotropes. Dobutamine contraindicated. 24.3% prevalence in LT candidates.", l: "high" });
    if (f.cad) r.push({ t: "Known CAD — DSE sensitivity only 25–41% in ESLD. Low threshold for coronary angiography. Cangrelor bridge if recent PCI/DES.", l: "high" });
    if (efLow) r.push({ t: `EF ${v.ef}% (<55%) — cirrhotic cardiomyopathy may be masked by the vasodilated state. Invasive hemodynamic monitoring mandatory.`, l: "high" });
    if (v.rvsp !== null && v.rvsp > 40) r.push({ t: `RVSP ${v.rvsp} mmHg on echo (>40) — refer for PH expert consultation ± right heart catheterization before listing (ILTS 2026).`, l: "med" });
    if (ph?.poph) r.push({ t: `Precapillary pulmonary hypertension on RHC — POPH pattern. Refer to a PH expert for PAH therapy (PDE5 inhibitor, sGC stimulator, ERA, or prostacyclin analogue) to reduce mPAP and PVR before transplant. Avoid TIPS and beta-blockers.`, l: "high" });
    if (ph?.confirmedPH) r.push({ t: `Confirmed pulmonary hypertension — intraoperative plan changes: PA catheter + TEE monitoring, inhaled nitric oxide or inhaled prostacyclin immediately available, RV inotrope (milrinone/dobutamine) ready, and VA-ECMO capability identified before induction.`, l: "high" });
    if (v.rhcMPAP !== null && (v.rhcMPAP > 45 || (v.rhcPVR !== null && v.rhcPVR > 5))) r.push({ t: `mPAP ${v.rhcMPAP} mmHg${v.rhcPVR !== null ? ` · PVR ${v.rhcPVR} WU` : ""} — within the ILTS absolute-contraindication range for LT (mPAP >45–50, PVR >5 WU, or severe RV dysfunction) until treated.`, l: "high" });
    if (v.plts !== null && v.plts < 50) r.push({ t: `Platelets ${v.plts}k — defer neuraxial. ASRA: platelets >80k, INR <1.5 minimum for epidural.`, l: "med" });
    if (f.dcd) r.push({ t: "DCD allograft — post-reperfusion syndrome ~42% with cold storage vs 11% with NMP (Mayo 2025). Higher vasoactive and transfusion needs.", l: "med" });
    if (f.opioid) r.push({ t: "Opioid tolerance — continue MOUD perioperatively. Add ketamine/dexmedetomidine. Involve pain/addiction medicine pre-LT.", l: "med" });
    if (f.varices) r.push({ t: "Variceal bleed history — crossmatch ≥4 units pRBC. TEG-guided resuscitation. MTP packs immediately available.", l: "med" });
    return r;
  }, [f, v, m3, ctp, crrt, efLow, ph, implausible]);

  /* ── Shareable brief ──
     Assembles the computed output — scores, red flags, CRRT verdict, PH and
     sodium plans, allocation context — as plain text for handoff or for
     pasting into the medical record. Carries no patient identifiers: the app
     never asks for a name, MRN, or date of birth, so none can appear here. */
  const buildBrief = () => {
    const L = [];
    const rule = (t) => L.push("", `── ${t} ${"─".repeat(Math.max(0, 46 - t.length))}`);
    const kv = (k, val) => L.push(`${k.padEnd(22)}${val}`);
    const now = new Date();

    L.push("MELD+ · PERIOPERATIVE RISK BRIEF");
    L.push(`${caseLabel(active)} · generated ${now.toLocaleString()}`);
    L.push("No patient identifiers are included in this summary.");
    if (implausible.length) L.push(`!! ${implausible.length} entered value${implausible.length === 1 ? " is" : "s are"} outside the expected range — verify before use.`);

    rule("INPUTS");
    const demo = [];
    if (v.age !== null) demo.push(`Age ${v.age}`);
    demo.push(f.sex === "female" ? "female" : "male");
    if (metab.bmi !== null) demo.push(`BMI ${metab.bmi.toFixed(1)} (${metab.bmiC.label})`);
    if (f.smoke !== "never") demo.push(`${f.smoke} smoker${metab.packYears !== null ? `, ${metab.packYears.toFixed(0)} pack-years` : ""}`);
    L.push(demo.join(" · "));
    const labs = [];
    if (v.bili !== null) labs.push(`Total bili ${v.bili}`);
    if (v.inr !== null) labs.push(`INR ${v.inr}`);
    if (v.creat !== null) labs.push(`Creat ${v.creat}`);
    if (v.na !== null) labs.push(`Na ${v.na}`);
    if (v.alb !== null) labs.push(`Alb ${v.alb}`);
    if (v.hgb !== null) labs.push(`Hgb ${v.hgb}`);
    if (v.plts !== null) labs.push(`Plts ${v.plts}k`);
    if (v.fib !== null) labs.push(`Fib ${v.fib}`);
    if (labs.length) L.push(labs.join(" · "));
    const card = [];
    if (v.ef !== null) card.push(`LVEF ${v.ef}%`);
    if (v.rvsp !== null) card.push(`RVSP ${v.rvsp} mmHg`);
    if (v.rhcMPAP !== null) card.push(`mPAP ${v.rhcMPAP}`);
    if (v.rhcPAWP !== null) card.push(`PAWP ${v.rhcPAWP}`);
    if (v.rhcPVR !== null) card.push(`PVR ${v.rhcPVR} WU`);
    if (v.rhcCO !== null) card.push(`CO ${v.rhcCO}`);
    if (v.rhcCI !== null) card.push(`CI ${v.rhcCI}`);
    if (card.length) L.push(card.join(" · "));
    if (pft) L.push(`PFT: ${pft.pattern}${pft.dlcoSev ? ` · DLCO ${pft.dlcoSev.label}` : ""}`);

    rule("SCORES");
    kv("MELD 3.0", m3 !== null ? `${m3} / 40 · ${t3.label} risk` : "— (incomplete)");
    kv("MELD-Na", mNa !== null ? `${mNa} / 40${m3 !== null ? ` · Δ ${m3 - mNa > 0 ? "+" : ""}${m3 - mNa}` : ""}` : "—");
    if (m3 !== null) {
      kv("90-day survival", `${survival90(m3).toFixed(1)}%`);
      kv("3-month mortality", mortality3mo(m3));
    }
    if (ctp) kv("Child-Pugh", `${ctp.cls} · ${ctp.pts} pts · 1-yr survival ${ctp.surv1y}`);
    if (frailty) kv("Frailty (LFI)", `${v.lfi} · ${frailty.label}`);
    if (composite) {
      kv("Composite risk", `${composite.tier.label} (${composite.pts} pts) — heuristic, not an allocation score`);
      composite.parts.forEach((p) => L.push(`   · ${p.label}${p.detail ? ` (${p.detail})` : ""} +${p.p}`));
    }

    rule(`RED FLAGS (${flags.length})`);
    if (!flags.length) L.push("None from current inputs.");
    flags.forEach((r) => L.push(`[${r.l === "high" ? "HIGH" : r.l === "med" ? "MED " : "INFO"}] ${r.t}`));

    rule("INTRAOPERATIVE CRRT");
    L.push(crrt.met.length > 0 ? `INDICATED — ${crrt.met.length} criteri${crrt.met.length === 1 ? "on" : "a"} met`
      : crrt.antic.length > 0 ? "ANTICIPATE — prime the circuit" : "No criteria met");
    crrt.met.forEach((c) => L.push(`   · ${c.t} — ${c.d}`));
    if (crrt.antic.length) L.push(`   Anticipate: ${crrt.antic.join(" · ")}`);
    crrt.contra.forEach((c) => L.push(`   ! ${c}`));

    if (ph?.active) {
      rule("PULMONARY HYPERTENSION");
      if (ph.sev) L.push(`Severity: ${ph.sev.label}${v.rhcMPAP !== null ? ` (mPAP ${v.rhcMPAP} mmHg)` : ""}`);
      if (ph.pattern) L.push(ph.pattern);
      if (ph.candidacy) L.push(ph.candidacy.text);
      L.push("Intraoperative plan (ILTS 2026):");
      L.push("   · PA catheter + TEE monitoring throughout");
      L.push("   · Inhaled nitric oxide 20–40 ppm or inhaled epoprostenol checked and in the room before induction");
      L.push("   · Continue IV/SC prostacyclin therapy uninterrupted; resume oral/inhaled agents postoperatively");
      L.push("   · Milrinone or dobutamine ready for RV support");
      L.push("   · Norepinephrine / vasopressin / epinephrine as vasopressors");
      L.push("   · VA-ECMO capability identified before induction (rescue for acute RV failure)");
      L.push("   · Avoid hypoxaemia, hypercarbia, acidosis, hypothermia, high airway pressures — all raise PVR");
    }

    if (naProt) {
      rule("SODIUM PROTOCOL");
      L.push(`Na⁺ ${v.na} mmol/L — ${naProt.tier.label} hyponatremia`);
      L.push(`Correction limits: preop 4–8 mmol/L/day (4–6 if ODS risk high) · intraop ≤6 mmol/L per 24 h · postop 4–6 mmol/L/day`);
      if (naProt.odsRisk.length) L.push(`ODS risk factors: ${naProt.odsRisk.join(" · ")}`);
      L.push("   · Limit sodium-containing fluids and products; hypotonic carriers where volume allows");
      L.push("   · Low-sodium CRRT (119–126 mmol/L) rather than standard 140 mmol/L dialysate");
      L.push("   · THAM rather than bicarbonate for acidosis");
      L.push("   · Re-lower with free water ± desmopressin if Na⁺ climbs too fast");
    }

    const plan = [];
    if (v.tegLY30 !== null && v.tegLY30 > 3) plan.push(`Hyperfibrinolysis (LY30 ${v.tegLY30}%) — TXA 1 g IV`);
    if ((v.plts !== null && v.plts < 80) || (v.inr !== null && v.inr > 1.5)) plan.push("Regional deferred — ASRA thresholds not met (plts >80k, INR <1.5); systemic multimodal only");
    if (f.lvoto) plan.push("LVOTO — fluids + phenylephrine; dobutamine contraindicated");
    if (f.dcd) plan.push("DCD graft — higher post-reperfusion syndrome risk; anticipate vasoactive and transfusion needs");
    if (f.hps) plan.push("HPS — stepwise hypoxemia plan: Trendelenburg → inhaled epoprostenol/NO → methylene blue → embolization → ECMO");
    if (f.opioid) plan.push("Opioid tolerance — continue MOUD; ketamine/dexmedetomidine adjuncts");
    if (f.varices) plan.push("Variceal bleed history — crossmatch ≥4 units pRBC, MTP packs available");
    if (plan.length) { rule("OTHER KEY PLAN POINTS"); plan.forEach((p) => L.push(`   · ${p}`)); }

    if (unos.length) {
      rule("ALLOCATION CONTEXT");
      unos.forEach((n) => L.push(`${n.t} — ${n.d}`));
    }

    if (f.hcc || milan) {
      rule("HCC — MILAN / T2");
      L.push(milan ? milan.text : "HCC flagged — Milan / T2 exception check not completed (enter lesion count and size on the Patient tab).");
    }

    L.push("");
    L.push("─".repeat(50));
    L.push("MELD+ is clinical decision support for licensed clinicians. It does not");
    L.push("diagnose, prescribe, or replace clinical judgment, institutional protocol,");
    L.push("or current OPTN policy. Verify allocation questions at optn.transplant.hrsa.gov.");
    return L.join("\n");
  };

  const briefText = showShare ? buildBrief() : "";

  const copyBrief = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(briefText);
      ok = true;
    } catch {
      /* Older WKWebView / non-secure context — fall back where available. */
      try {
        const ta = document.getElementById("brief-text");
        if (ta && typeof document.execCommand === "function") {
          ta.focus(); ta.select();
          ok = document.execCommand("copy");
        }
      } catch { ok = false; }
    }
    setCopied(ok ? "done" : "fail");
    window.setTimeout(() => setCopied(null), 2500);
  };

  const shareBrief = async () => {
    const title = `MELD+ brief — ${caseLabel(active)}`;
    if (navigator.share) {
      try { await navigator.share({ title, text: briefText }); return; } catch { /* dismissed */ }
    }
    const blob = new Blob([briefText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `MELDplus-brief-${caseLabel(active).replace(" ", "-")}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const TabBtn = ({ id, children }) => (
    <button onClick={() => setTab(id)}
      className={`px-3 py-1.5 text-[11px] font-bold rounded-full whitespace-nowrap transition-colors ${
        tab === id ? "bg-[#4DD8C9] text-[#0B141C]" : "text-[#8FA3B3] hover:text-[#E6EEF2]"}`}>
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0B141C] text-[#E6EEF2]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-3 py-4 sm:px-5 sm:py-6 pb-16" style={{ zoom }}>

        {/* Header */}
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-[22px] font-extrabold tracking-tight text-[#FFD166]">MELD+</h1>
              <span className="text-[11px] text-[#8FA3B3]">Perioperative Risk Brief</span>
            </div>
            <p className="text-[10px] text-[#56707F] mt-0.5">
              Liver transplant anesthesia · clinical decision support
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Share — builds a de-identified brief from the current case */}
            <button onClick={() => setShowShare(true)} aria-label="Share brief"
              className="flex items-center gap-1 h-8 px-2.5 rounded-full bg-[#0e1d15] border border-[#2d5a3d] text-[#B8F0C8] text-[10px] font-bold uppercase tracking-wide hover:border-[#4DD8C9] transition-colors">
              <Share2 size={12} />Share
            </button>
            {/* Reset — clears all entered values for the active case */}
            <button onClick={resetAll} aria-label="Reset all fields"
              className="flex items-center gap-1 h-8 px-2.5 rounded-full bg-[#101D29] border border-[#1F3645] text-[#8FA3B3] text-[10px] font-bold uppercase tracking-wide hover:text-[#FF6B6B] hover:border-[#5a1a1a] transition-colors">
              <RotateCcw size={12} />Reset
            </button>
            {/* Text-zoom control (pinch-to-zoom is also enabled) */}
            <div className="flex items-center gap-1 bg-[#101D29] border border-[#1F3645] rounded-full px-1 py-0.5">
              <button onClick={() => zoomStep(-0.1)} aria-label="Decrease text size"
                className="w-7 h-7 rounded-full text-[#C9D6DE] text-[15px] font-bold hover:bg-[#1F3645] disabled:opacity-40" disabled={zoom <= 0.9}>A−</button>
              <span className="text-[9px] text-[#8FA3B3] w-9 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
              <button onClick={() => zoomStep(0.1)} aria-label="Increase text size"
                className="w-7 h-7 rounded-full text-[#E6EEF2] text-[17px] font-bold hover:bg-[#1F3645] disabled:opacity-40" disabled={zoom >= 1.8}>A+</button>
            </div>
          </div>
        </header>

        {/* Privacy banner */}
        <div className="flex items-center gap-2 bg-[#0e1d15] border border-[#2d5a3d] rounded-lg px-3 py-2 mb-3">
          <Shield size={13} className="text-[#7CD992] flex-shrink-0" />
          <span className="text-[10px] text-[#B8F0C8] leading-snug">
            Session-only. No patient data is stored, transmitted, or logged. All computation is local to this device.
          </span>
        </div>

        {/* Case slots — two working cases held in memory for this session only */}
        <div className="flex items-center gap-2 mb-4">
          <Users size={12} className="text-[#8FA3B3] flex-shrink-0" />
          <div className="flex gap-1 bg-[#101D29] border border-[#1F3645] rounded-full p-0.5">
            {cases.map((c, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                  active === i ? "bg-[#4DD8C9] text-[#0B141C]" : "text-[#8FA3B3] hover:text-[#E6EEF2]"}`}>
                {caseLabel(i)}
                {caseFilled(c) && <span className={`w-1.5 h-1.5 rounded-full ${active === i ? "bg-[#0B141C]" : "bg-[#4DD8C9]"}`} />}
              </button>
            ))}
          </div>
          <span className="text-[9px] text-[#56707F] leading-snug">Two cases side by side · cleared when the app closes</span>
        </div>

        {/* Share panel */}
        {showShare && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-start sm:items-center justify-center p-3 overflow-y-auto">
            <div className="bg-[#101D29] border border-[#1F3645] rounded-xl w-full max-w-2xl my-4">
              <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#1F3645]">
                <span className="flex items-center gap-2 text-[11px] font-bold text-[#E6EEF2] uppercase tracking-wide">
                  <Share2 size={13} className="text-[#7CD992]" />Share brief · {caseLabel(active)}
                </span>
                <button onClick={() => setShowShare(false)} aria-label="Close" className="text-[#8FA3B3] hover:text-[#E6EEF2]">
                  <X size={16} />
                </button>
              </div>
              <div className="p-3.5">
                <div className="flex items-start gap-2 bg-[#0e1d15] border border-[#2d5a3d] rounded-lg px-2.5 py-2 mb-2.5">
                  <Shield size={12} className="text-[#7CD992] flex-shrink-0 mt-0.5" />
                  <span className="text-[9.5px] text-[#B8F0C8] leading-snug">
                    De-identified by construction — the app never collects a name, MRN, or date of birth, so none can appear here.
                    Paste into the medical record; do not send over unsecured channels.
                  </span>
                </div>
                <textarea id="brief-text" readOnly value={briefText}
                  className="w-full h-72 bg-[#0E1A24] border border-[#27404F] rounded-md p-2.5 font-mono text-[10px] leading-relaxed text-[#C9D6DE] focus:outline-none focus:border-[#4DD8C9]" />
                <div className="flex flex-wrap gap-2 mt-2.5">
                  <button onClick={copyBrief}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#4DD8C9] text-[#0B141C] text-[11px] font-bold">
                    <Copy size={12} />{copied === "done" ? "Copied ✓" : copied === "fail" ? "Select & copy manually" : "Copy text"}
                  </button>
                  <button onClick={shareBrief}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#101D29] border border-[#27404F] text-[#C9D6DE] text-[11px] font-bold hover:border-[#4DD8C9]">
                    <Share2 size={12} />Share / save file
                  </button>
                  <button onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#101D29] border border-[#27404F] text-[#C9D6DE] text-[11px] font-bold hover:border-[#4DD8C9]">
                    <BookOpen size={12} />Print / save PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Print / PDF view ──
            A laid-out one-pager for the anesthesia record and the wall of the
            room: big numbers, red flags first, checkboxes against the actions
            that have to happen before induction. Screen-hidden; print-only. */}
        <div className="brief-print" aria-hidden="true">
          <div className="bp-head">
            <div className="bp-headleft">
              <div className="bp-title">MELD+ · Perioperative Risk Brief</div>
              <div className="bp-sub">Liver transplant anesthesia · clinical decision support</div>
              <div className="bp-meta">
                <strong>{caseLabel(active)}</strong> · {new Date().toLocaleString()}
                <span className="bp-noid"> · no identifiers auto-filled</span>
              </div>
            </div>
            {/* Blank box for the addressograph / patient label, applied by hand
                after printing. The app never captures identifiers itself. */}
            <div className="bp-sticker">
              <span className="bp-sticker-cap">Patient label</span>
            </div>
          </div>

          {implausible.length > 0 && (
            <div className="bp-warn">⚠ {implausible.length} entered value{implausible.length === 1 ? " is" : "s are"} outside the expected range — verify before use.</div>
          )}

          <div className="bp-scores">
            {[
              ["MELD 3.0", m3 ?? "—", m3 !== null ? `${t3.label} risk` : "incomplete"],
              ["MELD-Na", mNa ?? "—", m3 !== null && mNa !== null ? `Δ ${m3 - mNa > 0 ? "+" : ""}${m3 - mNa}` : ""],
              ["Child-Pugh", ctp?.cls ?? "—", ctp ? `${ctp.pts} pts · 1-yr ${ctp.surv1y}` : ""],
              ["90-day surv.", m3 !== null ? `${survival90(m3).toFixed(0)}%` : "—", m3 !== null ? `3-mo mort. ${mortality3mo(m3)}` : ""],
              ["Composite", composite ? composite.pts : "—", composite ? `${composite.tier.label} · heuristic` : ""],
            ].map(([k, val, sub]) => (
              <div className="bp-score" key={k}>
                <div className="bp-score-k">{k}</div>
                <div className="bp-score-v">{val}</div>
                <div className="bp-score-s">{sub}</div>
              </div>
            ))}
          </div>

          <div className="bp-inputs">
            {[
              v.age !== null ? `${v.age} y` : null, f.sex === "female" ? "F" : "M",
              metab.bmi !== null ? `BMI ${metab.bmi.toFixed(1)}` : null,
              f.smoke !== "never" ? `${f.smoke} smoker${metab.packYears !== null ? ` ${metab.packYears.toFixed(0)} py` : ""}` : null,
              v.bili !== null ? `bili ${v.bili}` : null, v.inr !== null ? `INR ${v.inr}` : null,
              v.creat !== null ? `creat ${v.creat}` : null, v.na !== null ? `Na ${v.na}` : null,
              v.alb !== null ? `alb ${v.alb}` : null, v.hgb !== null ? `Hgb ${v.hgb}` : null,
              v.plts !== null ? `plt ${v.plts}k` : null, v.fib !== null ? `fib ${v.fib}` : null,
              v.ef !== null ? `EF ${v.ef}%` : null, v.rvsp !== null ? `RVSP ${v.rvsp}` : null,
              v.rhcMPAP !== null ? `mPAP ${v.rhcMPAP}` : null, v.rhcPVR !== null ? `PVR ${v.rhcPVR} WU` : null,
              frailty ? `LFI ${v.lfi} (${frailty.label})` : null,
            ].filter(Boolean).join("  ·  ")}
          </div>

          <div className="bp-sec bp-flags">
            <div className="bp-sec-h">Red flags ({flags.length})</div>
            {flags.length === 0 ? <div className="bp-line">None from current inputs.</div>
              : flags.map((r, i) => (
                <div className="bp-line" key={i}>
                  <span className={`bp-tag ${r.l === "high" ? "hi" : "md"}`}>{r.l === "high" ? "HIGH" : "MED"}</span>{r.t}
                </div>
              ))}
          </div>

          <div className="bp-cols">
            <div className="bp-col">
              <div className="bp-sec">
                <div className="bp-sec-h">Intraoperative CRRT</div>
                <div className="bp-verdict">{crrt.met.length > 0 ? `INDICATED — ${crrt.met.length} criteri${crrt.met.length === 1 ? "on" : "a"} met`
                  : crrt.antic.length > 0 ? "ANTICIPATE — prime the circuit" : "No criteria met"}</div>
                {crrt.met.map((c, i) => <div className="bp-line" key={i}>☐ {c.t}</div>)}
                {crrt.antic.length > 0 && <div className="bp-line">Anticipate: {crrt.antic.join(" · ")}</div>}
                {crrt.met.length > 0 && <div className="bp-line">☐ Nephrology + perfusion notified · warm all CRRT fluids</div>}
              </div>

              {naProt && (
                <div className="bp-sec">
                  <div className="bp-sec-h">Sodium protocol · Na⁺ {v.na} ({naProt.tier.label})</div>
                  <div className="bp-line"><strong>Intraoperative ceiling ≤6 mmol/L per 24 h</strong> (preop 4–8/day, 4–6 if ODS risk; postop 4–6/day)</div>
                  {naProt.odsRisk.length > 0 && <div className="bp-line">ODS risk: {naProt.odsRisk.join(" · ")}</div>}
                  <div className="bp-line">☐ Na⁺ q1–2 h and after large transfusions</div>
                  <div className="bp-line">☐ Low-sodium CRRT (119–126 mmol/L), not standard 140</div>
                  <div className="bp-line">☐ Hypotonic carriers · limit Na-rich products (FFP ~172) · factor concentrates</div>
                  <div className="bp-line">☐ THAM not bicarbonate · DDAVP + free water if Na⁺ climbs too fast</div>
                </div>
              )}
            </div>

            <div className="bp-col">
              {ph?.active && (
                <div className="bp-sec">
                  <div className="bp-sec-h">Pulmonary hypertension{ph.sev ? ` · ${ph.sev.label}` : ""}</div>
                  {ph.pattern && <div className="bp-line">{ph.pattern}</div>}
                  {ph.candidacy && <div className="bp-line">{ph.candidacy.text}</div>}
                  <div className="bp-line">☐ PA catheter + TEE</div>
                  <div className="bp-line">☐ Inhaled NO 20–40 ppm or inhaled epoprostenol <strong>checked and in the room</strong></div>
                  <div className="bp-line">☐ IV/SC prostacyclin continued uninterrupted</div>
                  <div className="bp-line">☐ Milrinone or dobutamine drawn up (RV support)</div>
                  <div className="bp-line">☐ Norepinephrine / vasopressin / epinephrine ready</div>
                  <div className="bp-line">☐ VA-ECMO capability identified before induction</div>
                  <div className="bp-line">Avoid hypoxaemia · hypercarbia · acidosis · hypothermia · high airway pressures</div>
                </div>
              )}

              {(() => {
                const pts = [];
                if (v.tegLY30 !== null && v.tegLY30 > 3) pts.push(`Hyperfibrinolysis LY30 ${v.tegLY30}% — TXA 1 g IV`);
                if ((v.plts !== null && v.plts < 80) || (v.inr !== null && v.inr > 1.5)) pts.push("Regional deferred — ASRA thresholds not met");
                if (f.lvoto) pts.push("LVOTO — fluids + phenylephrine; no dobutamine");
                if (f.dcd) pts.push("DCD graft — higher post-reperfusion syndrome risk");
                if (f.hps) pts.push("HPS — Trendelenburg → inhaled epoprostenol/NO → methylene blue → ECMO");
                if (f.opioid) pts.push("Opioid tolerance — continue MOUD; ketamine / dexmedetomidine");
                if (f.varices) pts.push("Variceal bleed history — crossmatch ≥4 U pRBC, MTP available");
                if (efLow) pts.push(`LVEF ${v.ef}% — invasive haemodynamic monitoring`);
                return pts.length ? (
                  <div className="bp-sec">
                    <div className="bp-sec-h">Other key plan points</div>
                    {pts.map((p, i) => <div className="bp-line" key={i}>☐ {p}</div>)}
                  </div>
                ) : null;
              })()}

              {(unos.length > 0 || milan) && (
                <div className="bp-sec">
                  <div className="bp-sec-h">Allocation</div>
                  {unos.map((n, i) => <div className="bp-line" key={i}><strong>{n.t}</strong></div>)}
                  {milan && <div className="bp-line">{milan.text}</div>}
                </div>
              )}
            </div>
          </div>

          <div className="bp-foot">
            MELD+ is clinical decision support for licensed clinicians. It does not diagnose, prescribe, or replace clinical judgment,
            institutional protocol, or current OPTN policy. Composite risk is a heuristic, not an allocation score. Verify allocation
            questions at optn.transplant.hrsa.gov. The app stores and transmits nothing — but once a patient label is applied, this
            sheet carries identifiers: file it in the record or dispose of it per your institution's policy.
          </div>
        </div>

        <style>{`
          .brief-print { display: none; }
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body * { visibility: hidden !important; }
            .brief-print, .brief-print * { visibility: visible !important; }
            .brief-print {
              display: block !important; position: absolute; left: 0; top: 0; width: 100%;
              color: #000; background: #fff;
              font-family: -apple-system, "Helvetica Neue", Arial, sans-serif;
              font-size: 9pt; line-height: 1.35;
            }
            .bp-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8pt;
              border-bottom: 2pt solid #000; padding-bottom: 4pt; margin-bottom: 6pt; }
            .bp-headleft { flex: 1; }
            .bp-title { font-size: 15pt; font-weight: 800; letter-spacing: -0.2pt; }
            .bp-sub { font-size: 8pt; color: #444; }
            .bp-meta { font-size: 8pt; margin-top: 2pt; }
            .bp-noid { color: #444; font-style: italic; }
            /* Addressograph / patient label area — sized for a standard
               4in x 1.25in hospital label with room to spare. */
            .bp-sticker { width: 78mm; height: 30mm; border: 0.75pt dashed #555;
              position: relative; flex: none; }
            .bp-sticker-cap { position: absolute; top: 1.5pt; left: 3pt;
              font-size: 6.5pt; color: #888; text-transform: uppercase; letter-spacing: 0.4pt; }
            .bp-warn { border: 1pt solid #000; background: #f2f2f2; padding: 3pt 5pt;
              font-weight: 700; font-size: 8.5pt; margin-bottom: 5pt; }
            .bp-scores { display: flex; gap: 4pt; margin-bottom: 5pt; }
            .bp-score { flex: 1; border: 1pt solid #000; padding: 3pt 4pt; text-align: center; }
            .bp-score-k { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.3pt; color: #333; }
            .bp-score-v { font-size: 19pt; font-weight: 800; line-height: 1.05; }
            .bp-score-s { font-size: 7pt; color: #333; }
            .bp-inputs { font-size: 8pt; border-bottom: 0.5pt solid #999; padding-bottom: 4pt; margin-bottom: 6pt; }
            .bp-sec { margin-bottom: 6pt; break-inside: avoid; }
            .bp-sec-h { font-size: 8.5pt; font-weight: 800; text-transform: uppercase;
              letter-spacing: 0.3pt; border-bottom: 0.75pt solid #000; margin-bottom: 3pt; padding-bottom: 1pt; }
            .bp-flags { border: 1.5pt solid #000; padding: 4pt 5pt; }
            .bp-flags .bp-sec-h { border-bottom: none; margin-bottom: 2pt; }
            .bp-line { font-size: 8.5pt; margin-bottom: 2pt; }
            .bp-tag { display: inline-block; min-width: 26pt; text-align: center; font-size: 7pt;
              font-weight: 800; border: 0.75pt solid #000; padding: 0 2pt; margin-right: 4pt; }
            .bp-tag.hi { background: #000; color: #fff; }
            .bp-verdict { font-weight: 800; font-size: 9.5pt; margin-bottom: 2pt; }
            .bp-cols { display: flex; gap: 10pt; align-items: flex-start; }
            .bp-col { flex: 1; }
            .bp-foot { margin-top: 6pt; padding-top: 3pt; border-top: 0.5pt solid #999;
              font-size: 6.5pt; color: #333; line-height: 1.3; }
          }
        `}</style>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          <TabBtn id="patient">Patient</TabBtn>
          <TabBtn id="scores">Scores</TabBtn>
          <TabBtn id="crrt">CRRT</TabBtn>
          <TabBtn id="unos">UNOS</TabBtn>
          <TabBtn id="plan">Plan</TabBtn>
          <TabBtn id="sources">Sources</TabBtn>
          <TabBtn id="info">Info</TabBtn>
        </div>

        {/* ═══════════ PATIENT ═══════════ */}
        {tab === "patient" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">

            <Card>
              <Sec icon={Activity} label="Demographics & Body Habitus" color="#C9A8FF" />
              <div className="grid grid-cols-2 gap-2.5">
                <NumField label="Age (yrs)" placeholder="58" value={f.age} onChange={set("age")} fieldKey="age" />
                <Field label="Sex (for MELD 3.0)">
                  <Sel value={f.sex} onChange={set("sex")} options={[["male", "Male"], ["female", "Female"]]} />
                </Field>
                <NumField label="Height (cm)" placeholder="175" value={f.heightCm} onChange={set("heightCm")} fieldKey="heightCm" />
                <NumField label="Weight (kg)" placeholder="82" value={f.weightKg} onChange={set("weightKg")} fieldKey="weightKg" />
              </div>
              {metab.bmi !== null && (
                <div className="mt-2 flex items-center justify-between bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-[#8FA3B3]">BMI</span>
                  <span className="font-mono text-[15px] font-bold" style={{ color: metab.bmiC.c }}>
                    {metab.bmi.toFixed(1)} <span className="text-[10px] font-semibold">· {metab.bmiC.label}</span>
                  </span>
                </div>
              )}
              <div className="mt-2.5">
                <Field label="Smoking status">
                  <Sel value={f.smoke} onChange={set("smoke")} options={[["never", "Never"], ["former", "Former"], ["current", "Current"]]} />
                </Field>
              </div>
              {f.smoke !== "never" && (
                <div className="grid grid-cols-2 gap-2.5 mt-2">
                  <NumField label="Cigarettes / day" placeholder="20" value={f.cigsDay} onChange={set("cigsDay")} fieldKey="cigsDay" />
                  <NumField label="Years smoked" placeholder="25" value={f.smokeYears} onChange={set("smokeYears")} fieldKey="smokeYears" />
                  {f.smoke === "former" && <NumField label="Years since quit" placeholder="3" value={f.quitYears} onChange={set("quitYears")} fieldKey="quitYears" />}
                </div>
              )}
              {metab.packYears !== null && (
                <div className="mt-2 flex items-center justify-between bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-[#8FA3B3]">Pack-years</span>
                  <span className="font-mono text-[15px] font-bold text-[#FF9A5A]">{metab.packYears.toFixed(0)}</span>
                </div>
              )}
              <Formula
                name="Body Mass Index (WHO)"
                body={"BMI = weight(kg) ÷ height(m)²\n<18.5 underweight · 18.5–24.9 normal · 25–29.9 overweight\n30–34.9 obesity I · 35–39.9 obesity II · ≥40 obesity III"}
                refText="WHO classification of body-mass index"
              />
              {metab.packYears !== null && (
                <Formula
                  name="Pack-years (cumulative tobacco exposure)"
                  body={"Pack-years = (cigarettes per day ÷ 20) × years smoked"}
                  refText="Standard tobacco-exposure metric; USPSTF lung-cancer screening 2021"
                  refUrl={PM("screening for lung cancer US Preventive Services Task Force recommendation statement JAMA 2021")}
                />
              )}
            </Card>

            <Card>
              <Sec icon={Waves} label="Labs, Renal & CRRT" color="#4DD8C9" />

              <div className="text-[9px] font-bold uppercase tracking-wider text-[#8FA3B3] mb-1.5">Blood counts</div>
              <div className="grid grid-cols-3 gap-2.5">
                <NumField label="Hemoglobin (g/dL)" placeholder="10.5" value={f.hgb} onChange={set("hgb")} fieldKey="hgb" />
                <NumField label="Platelets (×10³/µL)" placeholder="80" value={f.plts} onChange={set("plts")} fieldKey="plts" />
                <NumField label="Fibrinogen (mg/dL)" placeholder="150" value={f.fib} onChange={set("fib")} fieldKey="fib" />
              </div>

              <div className="text-[9px] font-bold uppercase tracking-wider text-[#8FA3B3] mb-1.5 mt-3">Renal & MELD labs</div>
              <p className="text-[9px] text-[#56707F] mb-1.5 leading-relaxed">MELD 3.0, MELD-Na and Child-Pugh all use serum <strong className="text-[#8FA3B3]">total</strong> bilirubin — not direct / conjugated.</p>
              <div className="grid grid-cols-2 gap-2.5">
                <NumField label="Total bilirubin (mg/dL)" placeholder="2.1" value={f.bili} onChange={set("bili")} fieldKey="bili" />
                <NumField label="INR" placeholder="1.4" value={f.inr} onChange={set("inr")} fieldKey="inr" />
                <NumField label="Creatinine (mg/dL)" placeholder="1.0" value={f.creat} onChange={set("creat")} fieldKey="creat" />
                <NumField label="Sodium (mmol/L)" placeholder="136" value={f.na} onChange={set("na")} fieldKey="na" />
                <NumField label="Albumin (g/dL)" placeholder="3.2" value={f.alb} onChange={set("alb")} fieldKey="alb" />
                <NumField label="SpO₂ room air (%)" placeholder="97" value={f.spo2} onChange={set("spo2")} fieldKey="spo2" />
              </div>

              <div className="text-[9px] font-bold uppercase tracking-wider text-[#8FA3B3] mb-1 mt-3">Dialysis / CRRT status</div>
              <Chk label="Dialysis ≥2× in past 7 days, or CVVHD ≥24 h" sub="Sets creatinine to 3.0 (MELD 3.0) / 4.0 (MELD-Na)" checked={f.dialysis} onChange={set("dialysis")} />
              <Chk label="Already on CRRT pre-transplant" sub="Continue intraoperatively — do not interrupt" checked={f.preopCRRT} onChange={set("preopCRRT")} />
              <Chk label="Active AKI" checked={f.aki} onChange={set("aki")} />

              <div className="text-[9px] font-bold uppercase tracking-wider text-[#8FA3B3] mb-1.5 mt-3">Metabolic / CRRT inputs</div>
              <div className="grid grid-cols-2 gap-2.5">
                <NumField label="Potassium (mmol/L)" placeholder="4.2" value={f.k} onChange={set("k")} fieldKey="k" />
                <NumField label="pH" placeholder="7.35" value={f.ph} onChange={set("ph")} fieldKey="ph" />
                <NumField label="HCO₃ (mmol/L)" placeholder="22" value={f.hco3} onChange={set("hco3")} fieldKey="hco3" />
                <NumField label="Lactate (mmol/L)" placeholder="2.0" value={f.lactate} onChange={set("lactate")} fieldKey="lactate" />
                <NumField label="CVP (mmHg)" placeholder="12" value={f.cvp} onChange={set("cvp")} fieldKey="cvp" />
                <NumField label="UOP (mL/kg/hr)" placeholder="0.8" value={f.uop} onChange={set("uop")} fieldKey="uop" />
              </div>
            </Card>

            <Card>
              <Sec icon={Wind} label="Pulmonary Function (PFT)" color="#4DD8C9" />
              <p className="text-[9.5px] text-[#56707F] mb-2 leading-relaxed">Enter % predicted (and FEV₁/FVC ratio). Drives the predicted post-transplant respiratory course on the Scores tab.</p>
              <div className="grid grid-cols-2 gap-2.5">
                <NumField label="FEV₁ (% pred)" placeholder="85" value={f.fev1pp} onChange={set("fev1pp")} fieldKey="fev1pp" />
                <NumField label="FVC (% pred)" placeholder="88" value={f.fvcpp} onChange={set("fvcpp")} fieldKey="fvcpp" />
                <NumField label="FEV₁/FVC (%)" placeholder="78" value={f.fev1fvc} onChange={set("fev1fvc")} fieldKey="fev1fvc" />
                <NumField label="DLCO (% pred)" placeholder="72" value={f.dlcopp} onChange={set("dlcopp")} fieldKey="dlcopp" />
                <NumField label="TLC (% pred)" placeholder="90" value={f.tlcpp} onChange={set("tlcpp")} fieldKey="tlcpp" />
              </div>
            </Card>

            <Card>
              <Sec icon={Heart} label="Cardiac" color="#FF9A5A" />
              <div className="grid grid-cols-2 gap-2.5">
                <NumField label="LVEF (%)" placeholder="60" value={f.ef} onChange={set("ef")} fieldKey="ef" />
                <NumField label="RVSP on echo (mmHg)" placeholder="32" value={f.rvsp} onChange={set("rvsp")} fieldKey="rvsp" />
              </div>
              {v.ef !== null && (
                <div className="mt-2 flex items-center justify-between bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-[#8FA3B3]">LVEF</span>
                  <span className="text-[12px] font-bold" style={{ color: efLow ? "#FF6B6B" : "#7CD992" }}>
                    {efLow ? "Reduced (<55%)" : "Preserved (≥55%)"}
                  </span>
                </div>
              )}
              {v.rvsp !== null && v.rvsp > 40 && (
                <div className="mt-2">
                  <Flag level="med" text={`RVSP ${v.rvsp} mmHg (>40) — ILTS 2026 advises pulmonary hypertension expert consultation ± right heart catheterization. More than mild RV dilation or dysfunction on echo prompts the same referral.`} />
                </div>
              )}
              <div className="mt-2">
                <Chk label="Known CAD / prior MI / PCI" checked={f.cad} onChange={set("cad")} />
                <Chk label="LVOTO on echo" sub="Fluids + phenylephrine — not inotropes" checked={f.lvoto} onChange={set("lvoto")} />
                <Chk label="Exertional dyspnea / chest pain" checked={f.exert} onChange={set("exert")} />
                <Chk label="Diabetes mellitus" checked={f.dm} onChange={set("dm")} />
                <Chk label="Atrial fibrillation" checked={f.afib} onChange={set("afib")} />
              </div>
            </Card>

            <Card>
              <Sec icon={Waves} label="Right Heart Catheterization" color="#7CC4FF" />
              <p className="text-[9.5px] text-[#56707F] mb-2 leading-relaxed">
                Enter measured RHC values when echo RVSP is elevated (&gt;40 mmHg per ILTS 2026) or POPH is suspected.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <NumField label="Cardiac output (L/min)" placeholder="5.5" value={f.rhcCO} onChange={set("rhcCO")} fieldKey="rhcCO" />
                <NumField label="Cardiac index (L/min/m²)" placeholder="3.0" value={f.rhcCI} onChange={set("rhcCI")} fieldKey="rhcCI" />
                <NumField label="Mean PAP (mmHg)" placeholder="22" value={f.rhcMPAP} onChange={set("rhcMPAP")} fieldKey="rhcMPAP" />
                <NumField label="PAWP / wedge (mmHg)" placeholder="10" value={f.rhcPAWP} onChange={set("rhcPAWP")} fieldKey="rhcPAWP" />
                <NumField label="PVR (Wood units)" placeholder="2.2" value={f.rhcPVR} onChange={set("rhcPVR")} fieldKey="rhcPVR" />
              </div>
              {v.rhcPVR !== null && (
                <div className="mt-2 flex items-center justify-between bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-[#8FA3B3]">PVR converted</span>
                  <span className="font-mono text-[12px] text-[#C9D6DE]">{v.rhcPVR} WU = {(v.rhcPVR * 80).toFixed(0)} dyn·s·cm⁻⁵</span>
                </div>
              )}
              {ph?.hasRHC && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-1.5">
                    <span className="text-[10px] uppercase tracking-wide text-[#8FA3B3]">Severity (ILTS)</span>
                    <span className="text-[12px] font-bold" style={{ color: ph.sev.c }}>{ph.sev.label}</span>
                  </div>
                  {ph.pattern && <Flag level={ph.poph ? "high" : "info"} text={ph.pattern} />}
                  {ph.candidacy && <Flag level={ph.candidacy.lvl} text={ph.candidacy.text} />}
                </div>
              )}
              <Formula
                name="Pulmonary hypertension — RHC definitions (ESC/ERS, adopted by ILTS)"
                body={"PH                      mPAP >20 mmHg\nPrecapillary (POPH)     mPAP >20 · PAWP ≤15 · PVR >2 WU\nIsolated postcapillary  mPAP >20 · PAWP >15 · PVR ≤2 WU\nCombined pre/post       mPAP >20 · PAWP >15 · PVR >2 WU\n\nSeverity   mild 20<mPAP<35 · moderate 35≤mPAP<45 · severe mPAP≥45\nLT         considered at mPAP <35, or mPAP 35–45 with PVR <3 WU\nAbsolute contraindication:  mPAP >45–50 · PVR >5 WU · severe RV dysfunction\n\n1 Wood unit = 80 dyn·s·cm⁻⁵.  Cardiac index = cardiac output ÷ BSA."}
                refText="ILTS practice guideline update on portopulmonary hypertension. Liver Transpl 2026;32:296–314"
                refUrl={PM("International Liver Transplantation Society practice guideline update on portopulmonary hypertension DuBrock 2025")}
              />
            </Card>

            <Card>
              <Sec icon={Wind} label="Pulmonary" color="#7CC4FF" />
              <Chk label="Platypnea-orthodeoxia / spider angiomata + dyspnea" sub="Screens for HPS — bubble echo indicated" checked={f.hps} onChange={set("hps")} />
              <Chk label="Elevated RVSP / PASP on echo" sub="RHC required before listing" checked={f.poph} onChange={set("poph")} />
            </Card>

            <Card>
              <Sec icon={Droplet} label="Portal / Coagulation" color="#FF6B6B" />
              <div className="space-y-2 mb-2">
                <Field label="Ascites">
                  <Sel value={f.ascites} onChange={set("ascites")} options={[["none", "None"], ["mild", "Mild"], ["sev", "Moderate / Refractory"]]} />
                </Field>
                <Field label="Encephalopathy">
                  <Sel value={f.enceph} onChange={set("enceph")} options={[["none", "None"], ["12", "Grade 1–2"], ["34", "Grade 3–4"]]} />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <NumField label="TEG R (min)" placeholder="6" value={f.tegR} onChange={set("tegR")} fieldKey="tegR" />
                <NumField label="TEG MA (mm)" placeholder="55" value={f.tegMA} onChange={set("tegMA")} fieldKey="tegMA" />
                <NumField label="TEG LY30 (%)" placeholder="1" value={f.tegLY30} onChange={set("tegLY30")} fieldKey="tegLY30" />
              </div>
              <p className="text-[9px] text-[#56707F] mt-2 leading-relaxed">Platelets and fibrinogen are entered under Labs, Renal &amp; CRRT.</p>
              <div className="mt-2">
                <Chk label="History of variceal bleed" checked={f.varices} onChange={set("varices")} />
              </div>
            </Card>

            <Card>
              <Sec icon={ListChecks} label="Listing & Surgical" color="#C9A8FF" />
              <Chk label="Acute liver failure (fulminant)" sub="Assess for Status 1A eligibility" checked={f.alf} onChange={set("alf")} />
              <Chk label="Hepatocellular carcinoma" sub="Open the Milan / T2 exception check below" checked={f.hcc} onChange={set("hcc")} />
              <Chk label="DCD allograft" sub="Higher post-reperfusion syndrome risk" checked={f.dcd} onChange={set("dcd")} />
              <Chk label="Chronic opioid use / tolerance" checked={f.opioid} onChange={set("opioid")} />
            </Card>

            <div className="sm:col-span-2 lg:col-span-3">
              <Collap title="HCC — Milan / T2 Exception Check" icon={ListChecks} color="#FF9A5A" open={f.hcc}>
                <p className="text-[10px] text-[#8FA3B3] mb-2 leading-relaxed">
                  Enter tumour burden to see whether the candidate qualifies for the standard HCC exception pathway.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="Number of lesions">
                    <Sel value={f.hccLesions} onChange={set("hccLesions")}
                      options={[["none", "Select…"], ["1", "1 lesion"], ["23", "2–3 lesions"], ["gt3", "More than 3"]]} />
                  </Field>
                  <NumField label="Largest lesion (cm)" placeholder="3.5" value={f.hccLargestCm} onChange={set("hccLargestCm")} fieldKey="hccLargestCm" />
                </div>
                <div className="mt-2">
                  <Chk label="Macrovascular invasion present" checked={f.hccVasc} onChange={set("hccVasc")} />
                  <Chk label="Extrahepatic spread present" checked={f.hccExtra} onChange={set("hccExtra")} />
                </div>
                {milan && (
                  <div className="mt-2.5">
                    <Flag level={milan.meets === true ? "ok" : milan.meets === false ? "high" : "info"} text={milan.text} />
                  </div>
                )}
                <Formula
                  name="Milan / OPTN T2 criteria"
                  body={"Qualifies if BOTH:\n  • 1 lesion 2–5 cm,  OR  2–3 lesions each 1–3 cm\n  • No macrovascular invasion AND no extrahepatic spread\n\nIf met: mandatory 6-month wait, then the score is set to MMaT − 3\n(it does not add fixed points and does not escalate every 3 months)."}
                  refText="OPTN/UNOS Policy 9 — standard HCC exception"
                  refUrl="https://optn.transplant.hrsa.gov/policies-bylaws/policies/"
                />
                <p className="text-[9.5px] text-[#56707F] mt-2 leading-relaxed">
                  Reference material for situational awareness. The transplant programme and the NLRB adjudicate the actual exception request.
                </p>
              </Collap>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <Collap title="Portal HTN — TIPS & PVT" icon={Droplet} color="#FF6B6B">
                <div className="grid grid-cols-2 gap-2.5 mt-1">
                  <Field label="Prior TIPS">
                    <Sel value={f.priorTIPS} onChange={set("priorTIPS")} options={[["none", "None"], ["patent", "Patent / functioning"], ["stenotic", "Stenotic / dysfunctional"], ["malpos", "Malpositioned"], ["occluded", "Occluded / thrombosed"]]} />
                  </Field>
                  <Field label="PVT grade (Yerdel)">
                    <Sel value={f.pvtGrade} onChange={set("pvtGrade")} options={[["none", "None"], ["1", "I (<50% PV)"], ["2", "II (>50% / total PV)"], ["3", "III (PV + prox SMV)"], ["4", "IV (PV + entire SMV)"]]} />
                  </Field>
                </div>
                {f.priorTIPS === "none" && f.pvtGrade === "none" && (
                  <div className="mt-2 text-[10px] text-[#56707F] italic">No TIPS and no PVT — no additional details shown.</div>
                )}
                {f.pvtGrade !== "none" && (
                  <div className="mt-2">
                    <Flag level={(f.pvtGrade === "3" || f.pvtGrade === "4") ? "high" : "med"}
                      text={(f.pvtGrade === "3" || f.pvtGrade === "4")
                        ? "Grade III–IV PVT independently predicts adverse post-transplant outcomes — 1-yr survival ~89% (grade 0/1) → ~67% (grade 3/4). Higher grade tracks with more biliary complications and may require non-anatomic inflow (reno-portal / cavoportal), which carries higher morbidity. Absence of other risk factors improves outcomes even in severe PVT."
                        : "Grade I–II PVT: transplant generally feasible via thrombectomy or end-to-end anastomosis; outcomes approach non-PVT patients when no other risk factors. Anticoagulation aids recanalization and lowers all-cause mortality (bleeding risk). Vitamin-K antagonists raise INR and artificially inflate MELD."} />
                  </div>
                )}
                {f.priorTIPS !== "none" && (
                  <div className="mt-2">
                    <Flag level={f.priorTIPS === "patent" ? "info" : "high"}
                      text={f.priorTIPS === "patent"
                        ? "Patent pre-LT TIPS: no significant difference in graft or patient survival vs no TIPS (may lengthen waitlist time). Confirm stent position on cross-sectional imaging before transplant."
                        : "Dysfunctional / malpositioned / occluded TIPS: cranial migration into the IVC or right atrium, or caudal extension into the SMV / portal confluence, can complicate the caval or portal anastomosis — flag for surgical planning."} />
                  </div>
                )}
                {(f.priorTIPS !== "none" || f.pvtGrade !== "none") && (
                  <Formula
                    name="TIPS & portal vein thrombosis in liver transplant"
                    body={"• Patent pre-LT TIPS: no significant survival difference vs no TIPS; longer waitlist (Sellers 2018).\n• PVT grade 3–4 & need for surgical PVT correction independently predict adverse outcomes; 1-yr OS 89%→67% (Di Benedetto 2024).\n• Anticoagulation reduces all-cause mortality & aids recanalization in cirrhosis + PVT (Guerrero 2023, IMPORTAL).\n• VKA inflates INR/MELD; non-anatomic inflow ↑ morbidity/mortality (Francoz 2012). Grading per Yerdel 2000."}
                    refText="Sellers 2018; Di Benedetto 2024; Guerrero 2023; Francoz 2012 — tap for PubMed"
                    refUrl={PM("portal vein thrombosis and liver transplantation management matching and outcomes Di Benedetto International Journal of Surgery 2024")}
                  />
                )}
              </Collap>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <Card>
                <Sec icon={Activity} label="Frailty (Liver Frailty Index)" color="#C9A8FF" />
                <div className="grid sm:grid-cols-2 gap-2.5 items-end">
                  <NumField label="LFI score" placeholder="3.8" value={f.lfi} onChange={set("lfi")} fieldKey="lfi" />
                  {frailty && (
                    <div className="flex items-center justify-between bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-2">
                      <span className="text-[10px] uppercase tracking-wide text-[#8FA3B3]">Category</span>
                      <span className="text-[13px] font-bold" style={{ color: frailty.c }}>{frailty.label}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2.5">
                  {[["Robust", "< 3.2", "#7CD992"], ["Pre-frail", "3.2 – 4.4", "#FFC857"], ["Frail", "≥ 4.5", "#FF6B6B"]].map(([label, range, c]) => (
                    <div key={label} className="bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-1.5 text-center">
                      <div className="text-[10px] font-bold" style={{ color: c }}>{label}</div>
                      <div className="text-[10px] font-mono text-[#8FA3B3] mt-0.5">{range}</div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] font-bold text-[#E6EEF2] uppercase tracking-wide mt-3 mb-1.5">How to obtain the LFI</div>
                <p className="text-[10px] text-[#8FA3B3] mb-2 leading-relaxed">
                  Three bedside performance tests, done in clinic in about five minutes. Measure each, then enter the three raw values into the
                  validated calculator — it returns the single LFI score you type above.
                </p>
                <ul className="space-y-1.5">
                  <Bul>
                    <strong className="text-[#C9A8FF]">1 · Grip strength (kg)</strong> — hand-held dynamometer, dominant hand. Patient seated,
                    elbow at 90°, arm unsupported. Three maximal squeezes with a brief rest between; record the <em>average</em> of the three.
                  </Bul>
                  <Bul>
                    <strong className="text-[#C9A8FF]">2 · Chair stands (seconds)</strong> — standard armless chair, arms folded across the chest.
                    Time how long it takes to rise fully and sit back down <em>five</em> times. Stop at 60 s if unable to complete.
                  </Bul>
                  <Bul>
                    <strong className="text-[#C9A8FF]">3 · Balance (seconds)</strong> — time held, up to 10 s each, in three foot positions:
                    side-by-side, semi-tandem (heel beside the big toe), and full tandem (heel directly in front of toe). Sum the three times.
                  </Bul>
                </ul>
                <p className="text-[9.5px] text-[#56707F] mt-2 leading-relaxed">
                  The LFI equation weights and combines the three measures; it is not a simple sum, so use the calculator rather than estimating.
                  Repeat at each clinic visit — a rising LFI over time carries prognostic weight of its own.
                  <a href="https://liverfrailtyindex.ucsf.edu" target="_blank" rel="noopener noreferrer" className="text-[#7CC4FF] underline ml-1">Open the UCSF calculator</a>
                </p>
                <Formula
                  name="Liver Frailty Index"
                  body={"LFI combines dominant-hand grip strength, 5× chair-stand time, and 3-position\nbalance time into one continuous score.\n\nRobust < 3.2   ·   Pre-frail 3.2 – 4.4   ·   Frail ≥ 4.5\n\nCaptures functional decline that MELD does not, and improves prediction of\nwaitlist mortality over MELD-Na alone."}
                  refText="Lai JC et al. Hepatology 2017;66:564–574; cut-offs Wang 2021; reproducibility Wang 2019"
                  refUrl={PM("development of a novel frailty index to predict mortality end-stage liver disease Lai Hepatology 2017")}
                />
              </Card>
            </div>
          </div>
        )}

        {/* ═══════════ SCORES ═══════════ */}
        {tab === "scores" && (
          <div className="space-y-3">

            {/* Dual MELD */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 border" style={{ backgroundColor: t3?.bg ?? "#101D29", borderColor: t3?.br ?? "#1F3645" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#E6EEF2]">MELD 3.0</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#4DD8C9]/15 text-[#4DD8C9] font-bold">OPTN CURRENT</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <div className="font-mono text-5xl font-black leading-none" style={{ color: t3?.c ?? "#46606E" }}
                    title="MELD 3.0 (Kim 2021). Tap 'Formula & reference' below for the equation and source.">
                    {m3 ?? "—"}
                  </div>
                  {t3 && <span className="text-[11px] text-[#8FA3B3]">/ 40</span>}
                </div>
                {t3 && <div className="text-[10px] font-bold mt-1.5" style={{ color: t3.c }}>{t3.label} risk · allocation score</div>}
                {!has3 && <div className="text-[10px] text-[#56707F] mt-1.5">Needs bili, INR, creat, Na, albumin</div>}
              </div>

              <div className="rounded-xl p-4 border border-[#1F3645] bg-[#101D29]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#E6EEF2]">MELD-Na</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#56707F]/15 text-[#8FA3B3] font-bold">PRIOR STD</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <div className="font-mono text-5xl font-black leading-none text-[#8FA3B3]"
                    title="MELD-Na (Kim 2008; OPTN Policy 9). Tap 'Formula & reference' below for the equation and source.">{mNa ?? "—"}</div>
                  {mNa !== null && <span className="text-[11px] text-[#56707F]">/ 40</span>}
                </div>
                {m3 !== null && mNa !== null && (
                  <div className="text-[10px] mt-1.5 text-[#56707F]">
                    Δ {m3 - mNa > 0 ? "+" : ""}{m3 - mNa} vs MELD 3.0
                    {f.sex === "female" && m3 - mNa > 0 && <span className="text-[#C9A8FF]"> · sex adjustment</span>}
                  </div>
                )}
                {!hasCore && <div className="text-[10px] text-[#56707F] mt-1.5">Needs bili, INR, creat</div>}
              </div>
            </div>

            <Card>
              <Formula
                name="MELD 3.0 (OPTN, current since 2023)"
                body={"MELD 3.0 = 1.33·(1 if female) + 4.56·ln(bili) + 0.82·(137−Na) − 0.24·(137−Na)·ln(bili)\n  + 9.09·ln(INR) + 11.14·ln(creat) + 1.85·(3.5−alb) − 1.83·(3.5−alb)·ln(creat) + 6\nBounds: bili, INR, creat floored at 1.0; creat capped at 3.0 (3.0 if on dialysis); Na 125–137; albumin 1.5–3.5. Rounded, range 6–40."}
                refText="Kim WR et al. Gastroenterology 2021;161:1887–1895"
                refUrl={PM("MELD 3.0 the model for end-stage liver disease updated Kim Gastroenterology 2021")}
              />
              <Formula
                name="MELD-Na (OPTN, 2016–2023)"
                body={"MELD(i) = 3.78·ln(bili) + 11.2·ln(INR) + 9.57·ln(creat) + 6.43   (creat capped 4.0; 4.0 if dialysis)\nIf MELD(i) > 11:  MELD-Na = MELD(i) + 1.32·(137−Na) − 0.033·MELD(i)·(137−Na)\nNa 125–137. Rounded, range 6–40."}
                refText="Kim WR et al. N Engl J Med 2008;359:1018–1026; OPTN Policy 9"
                refUrl={PM("hyponatremia and mortality among patients on the liver transplant waiting list Kim New England Journal Medicine 2008")}
              />
            </Card>

            {/* Prognosis */}
            {m3 !== null && (
              <Card>
                <Sec icon={Info} label="Prognosis & Outcome" color="#4DD8C9" />
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-[#0E1A24] border border-[#1a2e40] rounded-lg p-2.5">
                    <div className="text-[9px] text-[#8FA3B3] uppercase tracking-wide">90-day survival</div>
                    <div className="font-mono text-2xl font-bold mt-0.5" style={{ color: t3.c }}>
                      {survival90(m3).toFixed(1)}<span className="text-sm">%</span>
                    </div>
                    <div className="text-[9px] text-[#56707F] mt-0.5">MELD 3.0 model</div>
                  </div>
                  <div className="bg-[#0E1A24] border border-[#1a2e40] rounded-lg p-2.5">
                    <div className="text-[9px] text-[#8FA3B3] uppercase tracking-wide">3-mo mortality</div>
                    <div className="font-mono text-2xl font-bold mt-0.5 text-[#FF9A5A]">{mortality3mo(m3)}</div>
                    <div className="text-[9px] text-[#56707F] mt-0.5">Wiesner 2003 band</div>
                  </div>
                  <div className="bg-[#0E1A24] border border-[#1a2e40] rounded-lg p-2.5">
                    <div className="text-[9px] text-[#8FA3B3] uppercase tracking-wide">Child-Pugh</div>
                    <div className="font-mono text-2xl font-bold mt-0.5" style={{ color: ctp ? CTP_C[ctp.cls] : "#46606E" }}>
                      {ctp?.cls ?? "—"}
                    </div>
                    <div className="text-[9px] text-[#56707F] mt-0.5">{ctp ? `${ctp.pts} pts · 1-yr ${ctp.surv1y}` : "needs albumin"}</div>
                  </div>
                </div>
                <Formula
                  name="90-day survival (MELD 3.0 model)"
                  body={"Survival = 0.946^(exp(0.17698·MELD3.0 − 3.56)) × 100%"}
                  refText="Kim WR et al. Gastroenterology 2021 (MELD 3.0 survival model)"
                  refUrl={PM("MELD 3.0 the model for end-stage liver disease updated Kim Gastroenterology 2021")}
                />
                <Formula
                  name="3-month mortality bands (native MELD)"
                  body={"MELD ≤9 → 1.9%   ·   10–19 → 6.0%   ·   20–29 → 19.6%\n30–39 → 52.6%   ·   ≥40 → 71.3%"}
                  refText="Wiesner R et al. Gastroenterology 2003;124:91–96"
                  refUrl={PM("Wiesner MELD and allocation of donor livers Gastroenterology 2003")}
                />
                <Formula
                  name="Child-Turcotte-Pugh score"
                  body={"1–3 points each:\n  bilirubin  <2 / 2–3 / >3 mg/dL\n  albumin    >3.5 / 2.8–3.5 / <2.8 g/dL\n  INR        <1.7 / 1.7–2.3 / >2.3\n  ascites    none / mild / moderate–refractory\n  enceph.    none / grade 1–2 / grade 3–4\nClass A = 5–6 · B = 7–9 · C = 10–15."}
                  refText="Pugh RNH et al. Br J Surg 1973;60:646–649"
                  refUrl={PM("transection of the oesophagus for bleeding oesophageal varices Pugh British Journal of Surgery 1973")}
                />
                <div className="mt-2.5 text-[10px] text-[#56707F] leading-relaxed">
                  MELD ≥15 is the accepted survival-benefit threshold for transplant. Below 15, transplant may confer net harm.
                  MELD does not capture frailty, sarcopenia, or functional decline — integrate with clinical assessment.
                </div>
              </Card>
            )}

            {/* Composite perioperative risk — heuristic, distinct from MELD */}
            {composite && (
              <div className="rounded-xl border-2 border-[#3a2d52] bg-[#141024] p-3.5">
                <div className="flex items-center gap-2 mb-2.5 pb-1.5 border-b border-[#2a2440]">
                  <Shield size={13} style={{ color: "#C9A8FF" }} />
                  <span className="text-[11px] font-bold tracking-wide text-[#E6EEF2] uppercase">Composite Perioperative Risk</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#C9A8FF]/15 text-[#C9A8FF] font-bold ml-auto">HEURISTIC</span>
                </div>
                <div className="rounded-xl p-3 border mb-2 flex items-center justify-between" style={{ backgroundColor: composite.tier.bg, borderColor: composite.tier.br }}>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-[#8FA3B3]">Aggregate tier</div>
                    <div className="text-xl font-extrabold" style={{ color: composite.tier.c }}>{composite.tier.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-3xl font-black leading-none" style={{ color: composite.tier.c }}>{composite.pts}</div>
                    <div className="text-[9px] text-[#56707F]">points</div>
                  </div>
                </div>
                {composite.parts.length > 0 && (
                  <div className="space-y-1">
                    {composite.parts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between px-2.5 py-1.5 bg-[#0E1A24] border border-[#1a2e40] rounded-md">
                        <span className="text-[11px] text-[#C9D6DE]">{p.label}{p.detail ? <span className="text-[#56707F]"> · {p.detail}</span> : null}</span>
                        <span className="text-[10px] font-bold text-[#8FA3B3]">+{p.p}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-[9.5px] text-[#56707F] mt-2 leading-relaxed">
                  <strong className="text-[#FFC857]">A heuristic aggregate — not a validated score, and not the MELD allocation score.</strong> It sums risk points across MELD 3.0, Child-Pugh, frailty (LFI), PFT, BMI, smoking, and cardiopulmonary flags for perioperative situational awareness only. Component evidence: Kim 2021 (MELD 3.0), Lai 2017 (LFI), Kia 2016 · Tang 2026 (PFT), Barone 2017 (obesity). MELD 3.0 remains the score used for listing and allocation.
                </p>
                <Formula
                  name="Composite point scheme (heuristic)"
                  body={"MELD 3.0:  ≥30 → 3 · 20–29 → 2 · 15–19 → 1\nChild-Pugh:  C → 2 · B → 1\nFrailty (LFI):  Frail → 2 · Pre-frail → 1\nPFT:  any Higher band → 2 · any Moderate → 1\nBMI:  ≥40 → 2 · 35–39.9 or <18.5 → 1\nCurrent smoker → 1\nCardiopulmonary flags (CAD, low EF, LVOTO, PoPH, HPS hypoxemia) → +1 each, max 2\n\nTier:  0–2 Low · 3–5 Moderate · 6–8 High · ≥9 Very High"}
                  refText="Non-validated aggregation for situational awareness. Components: Kim 2021, Lai 2017, Kia 2016 / Tang 2026, Barone 2017."
                />
              </div>
            )}

            {/* Red flags — enlarged for prominence */}
            <div className="rounded-xl border-2 border-[#5a1a1a] bg-[#160a0a] p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#3a1414]">
                <AlertTriangle size={18} className="text-[#FF6B6B]" />
                <span className="text-[14px] font-extrabold tracking-wide text-[#FFD7D7] uppercase">Red Flags</span>
                {flags.length > 0 && (
                  <span className="ml-auto text-[12px] font-bold text-[#FF6B6B] bg-[#FF6B6B]/15 rounded-full px-2.5 py-0.5">{flags.length}</span>
                )}
              </div>
              {flags.length === 0
                ? <p className="text-[12px] text-[#8a9aa5]">None from current inputs.</p>
                : <div className="space-y-2">
                    {flags.map((r, i) => {
                      const st = r.l === "high" ? { c: "#FF6B6B", bg: "#1f0a0a", br: "#7a2323" }
                        : r.l === "med" ? { c: "#FFC857", bg: "#1d1707", br: "#6b5216" }
                        : { c: "#7CC4FF", bg: "#0d1a24", br: "#1e3a52" };
                      return (
                        <div key={i} className="flex items-start gap-2.5 rounded-lg border p-3" style={{ backgroundColor: st.bg, borderColor: st.br }}>
                          <AlertTriangle size={16} style={{ color: st.c }} className="flex-shrink-0 mt-0.5" />
                          <span className="text-[13px] leading-relaxed text-[#F0E4E4]">{r.t}</span>
                        </div>
                      );
                    })}
                  </div>}
            </div>

            {/* Pulmonary & metabolic workup */}
            <Card>
              <Sec icon={Wind} label="Pulmonary & Metabolic Workup" color="#7CC4FF" />
              {metab.actions.length > 0 && (
                <div className="space-y-2 mb-2.5">
                  {metab.actions.map((a, i) => (
                    <div key={i} className={`rounded-lg px-3 py-2 border ${a.lvl === "high" ? "bg-[#1f0a0a] border-[#5a1a1a]" : "bg-[#1d1707] border-[#4a3500]"}`}>
                      <div className={`text-[12px] font-bold ${a.lvl === "high" ? "text-[#FFD7D7]" : "text-[#FFE4A0]"}`}>{a.t}</div>
                      <div className="text-[10.5px] text-[#8FA3B3] mt-1 leading-relaxed">{a.d}</div>
                      <div className="text-[9px] text-[#56707F] mt-1">{a.ref}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-[10px] font-bold text-[#E6EEF2] uppercase tracking-wide mb-1.5">Recommended tests</div>
              <div className="space-y-1.5">
                {metab.tests.map((t, i) => (
                  <div key={i} className="bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-2">
                    <div className="text-[11.5px] font-semibold text-[#C8DEFF]">{t.t}</div>
                    <div className="text-[10px] text-[#8FA3B3] mt-0.5 leading-relaxed">{t.d}</div>
                    <div className="text-[9px] text-[#56707F] mt-1">{t.ref}</div>
                  </div>
                ))}
              </div>
              <p className="text-[9.5px] text-[#56707F] mt-2 leading-relaxed">
                Enter height, weight, and smoking history on the Patient tab to drive these recommendations. Blank fields are not evaluated.
              </p>
            </Card>

            {/* Predicted post-transplant respiratory course (PFT + smoking) */}
            {(pft || f.smoke !== "never") && (
              <Card>
                <Sec icon={Activity} label="Predicted Post-Transplant Respiratory Course" color="#FF9A5A" />
                {pft && (
                  <>
                    <div className="flex gap-2 mb-2.5">
                      <div className="flex-1 bg-[#0E1A24] border border-[#1a2e40] rounded-lg p-2.5">
                        <div className="text-[9px] text-[#8FA3B3] uppercase tracking-wide">PFT pattern</div>
                        <div className="text-[13px] font-bold mt-0.5 text-[#E6EEF2]">{pft.pattern}</div>
                      </div>
                      {pft.dlcoSev && (
                        <div className="flex-1 bg-[#0E1A24] border border-[#1a2e40] rounded-lg p-2.5">
                          <div className="text-[9px] text-[#8FA3B3] uppercase tracking-wide">DLCO</div>
                          <div className="text-[13px] font-bold mt-0.5" style={{ color: pft.dlcoSev.c }}>{pft.dlcoSev.label}</div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {[
                        ["Prolonged mechanical ventilation & ICU stay", pft.vent, "Restrictive pattern and low DLCO/TLC predict longer post-LT ventilation and ICU/hospital length of stay."],
                        ["Respiratory-cause mortality (post-LT)", pft.resp, "Low DLCO independently predicts respiratory cause of death after transplant."],
                        ["Overall post-transplant survival", pft.surv, "Low FEV₁ and current smoking are associated with poorer overall survival."],
                      ].map(([label, band, why]) => {
                        const s = lvlStyle(band.lvl);
                        return (
                          <div key={label} className="rounded-lg px-3 py-2 border" style={{ backgroundColor: s.bg, borderColor: s.br }}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11.5px] font-semibold text-[#E6EEF2]">{label}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ color: s.c, backgroundColor: s.c + "1A" }}>{band.word} risk</span>
                            </div>
                            <div className="text-[9.5px] text-[#8FA3B3] mt-1 leading-relaxed">{why}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-[9px] text-[#56707F] mt-2 leading-relaxed">Kia 2016; Tang 2026. Qualitative risk associations from pre-LT PFTs — not a precise time prediction.</div>
                  </>
                )}
                {f.smoke !== "never" && (
                  <div className="mt-2.5 rounded-lg px-3 py-2 border" style={f.smoke === "current" ? { backgroundColor: "#1f0a0a", borderColor: "#5a1a1a" } : { backgroundColor: "#1d1707", borderColor: "#4a3500" }}>
                    <div className={`text-[11.5px] font-bold ${f.smoke === "current" ? "text-[#FFD7D7]" : "text-[#FFE4A0]"}`}>
                      {f.smoke === "current" ? "Current smoker — worse projected survival" : "Former smoker"}
                      {metab.packYears !== null ? ` · ${metab.packYears.toFixed(0)} pack-years` : ""}
                    </div>
                    <div className="text-[9.5px] text-[#8FA3B3] mt-1 leading-relaxed">
                      {f.smoke === "current"
                        ? "Current smoking at assessment is independently associated with ~2× hazard of poorer post-LT survival. Cessation before transplant is advised."
                        : "Residual pulmonary and malignancy risk persists; ensure PFT and lung-cancer screening are addressed in the workup above."}
                    </div>
                    <div className="text-[9px] text-[#56707F] mt-1">Tang 2026</div>
                  </div>
                )}
              </Card>
            )}

            {/* Workup */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Card>
                <Sec icon={Heart} label="Cardiac Workup" color="#FF9A5A" />
                <ul className="space-y-1">
                  <Bul>12-lead ECG — QT prolongation common in cirrhosis</Bul>
                  <Bul>TTE with PASP, RVSP, EF, and LVOT assessment</Bul>
                  {(v.age >= 50 || f.cad || f.dm || f.exert) && <Bul>Dobutamine stress echo — sensitivity only 25–41% in ESLD; low threshold to proceed to angiography</Bul>}
                  {(f.cad || f.exert) && <Bul>Coronary angiography preferred over DSE alone when CAD is suspected</Bul>}
                  {f.lvoto && <Bul>LVOTO present — avoid dobutamine; hemodynamic plan is fluids + phenylephrine</Bul>}
                  {efLow && <Bul>LVEF {v.ef}% — reduced systolic function; invasive hemodynamic monitoring and a cardiology review before listing</Bul>}
                  {v.rvsp !== null && v.rvsp > 40 && <Bul>RVSP {v.rvsp} mmHg (&gt;40) — PH expert consultation ± right heart catheterization; measure mPAP, PAWP, PVR, and cardiac output/index (ILTS 2026)</Bul>}
                  {f.afib && <Bul>AF: rate over rhythm; DOACs preferred over VKA in cirrhosis; avoid amiodarone (hepatotoxic)</Bul>}
                </ul>
              </Card>
              <Card>
                <Sec icon={Wind} label="Pulmonary Workup" color="#7CC4FF" />
                <ul className="space-y-1">
                  <Bul>Room-air ABG + chest radiograph</Bul>
                  {(f.hps || (v.spo2 !== null && v.spo2 < 96)) && <Bul>Agitated saline contrast (bubble) echo — screen for intrapulmonary shunt</Bul>}
                  {f.hps && <Bul>Tc-99m MAA scan to quantify shunt fraction; shunt &gt;20% with PaO₂ &lt;50 mmHg carries high post-LT mortality</Bul>}
                  {(f.poph || (v.rvsp !== null && v.rvsp > 40)) && <Bul>Right heart catheterization — required before listing. POPH = mPAP &gt;20 mmHg with PAWP ≤15 and PVR &gt;2 WU; mPAP &gt;45–50, PVR &gt;5 WU, or severe RV dysfunction are absolute contraindications (ILTS 2026)</Bul>}
                  {ph?.active && <Bul><strong className="text-[#7CC4FF]">PH expert consultation</strong> — PAH therapy (PDE5 inhibitor, sGC stimulator, endothelin receptor antagonist, or prostacyclin analogue) to lower mPAP and PVR before transplant; avoid TIPS and beta-blockers in POPH</Bul>}
                  {v.rhcMPAP !== null && <Bul>RHC recorded: mPAP {v.rhcMPAP} mmHg{v.rhcPAWP !== null ? `, PAWP ${v.rhcPAWP} mmHg` : ""}{v.rhcPVR !== null ? `, PVR ${v.rhcPVR} WU (${(v.rhcPVR * 80).toFixed(0)} dyn·s·cm⁻⁵)` : ""}{v.rhcCO !== null ? `, CO ${v.rhcCO} L/min` : ""}{v.rhcCI !== null ? `, CI ${v.rhcCI} L/min/m²` : ""}</Bul>}
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════════ CRRT ═══════════ */}
        {tab === "crrt" && (
          <div className="space-y-3">

            {/* Verdict */}
            <div className="rounded-xl p-4 border"
              style={{
                backgroundColor: crrt.met.length > 0 ? "#1f0a0a" : crrt.antic.length > 0 ? "#1d1707" : "#0e1d15",
                borderColor: crrt.met.length > 0 ? "#7a2323" : crrt.antic.length > 0 ? "#6b5216" : "#2d5a3d",
              }}>
              <div className="text-[9px] uppercase tracking-wider text-[#8FA3B3] mb-1">Intraoperative CRRT</div>
              <div className="text-xl font-extrabold" style={{ color: crrt.met.length > 0 ? "#FF6B6B" : crrt.antic.length > 0 ? "#FFC857" : "#7CD992" }}>
                {crrt.met.length > 0 ? `Indicated — ${crrt.met.length} criteri${crrt.met.length === 1 ? "on" : "a"} met`
                  : crrt.antic.length > 0 ? "Anticipate — prepare circuit"
                  : "No criteria met"}
              </div>
              {crrt.antic.length > 0 && crrt.met.length === 0 && (
                <div className="text-[10px] text-[#FFE4A0] mt-1">Anticipate need: {crrt.antic.join(" · ")}</div>
              )}
              {crrt.met.length > 0 && (
                <div className="text-[10px] text-[#FFD7D7] mt-1">Coordinate nephrology + perfusion before induction. Warm all CRRT fluids.</div>
              )}
            </div>

            {/* Criteria met */}
            {crrt.met.length > 0 && (
              <Card>
                <Sec icon={AlertTriangle} label="Criteria Met" color="#FF6B6B" />
                <div className="space-y-2">
                  {crrt.met.map((c, i) => (
                    <div key={i} className="bg-[#1f0a0a] border border-[#5a1a1a] rounded-lg px-3 py-2">
                      <div className="text-[12px] font-bold text-[#FFD7D7]">{c.t}</div>
                      <div className="text-[10px] text-[#FFB0B0] mt-0.5">{c.d}</div>
                      <div className="text-[9px] text-[#8a5555] mt-1">{c.ref}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Contraindications */}
            {crrt.contra.length > 0 && (
              <Card>
                <Sec icon={AlertTriangle} label="Relative Contraindications" color="#FFC857" />
                <div className="space-y-1.5">{crrt.contra.map((c, i) => <Flag key={i} text={c} level="med" />)}</div>
                <div className="mt-2 text-[10px] text-[#56707F]">Also confirm CRRT machine and trained team availability.</div>
              </Card>
            )}

            {/* Threshold reference */}
            <Card>
              <Sec icon={ListChecks} label="Initiation Thresholds" color="#4DD8C9" />
              <div className="space-y-1">
                {[
                  ["Refractory hyperkalemia", "K⁺ >5.5–6.0 mmol/L", v.k !== null && v.k > 5.5],
                  ["Severe metabolic acidosis", "pH <7.10 · HCO₃ <12 mmol/L", (v.ph !== null && v.ph < 7.10) || (v.hco3 !== null && v.hco3 < 12)],
                  ["Hypervolemia", "CVP >18–20 mmHg · weight gain >10%", v.cvp !== null && v.cvp > 18],
                  ["Refractory oliguria / anuria", "UOP <0.3 mL/kg/hr >6 h · anuria >12 h", v.uop !== null && v.uop < 0.3],
                  ["Severe hyponatremia", "Na⁺ <125 mmol/L", v.na !== null && v.na < 125],
                  ["Lactate clearance failure", "Lactate >6–8 mmol/L", v.lactate !== null && v.lactate > 6],
                  ["Preoperative CRRT", "Already on CRRT", f.preopCRRT],
                ].map(([label, thresh, hit]) => (
                  <div key={label} className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border ${hit ? "bg-[#1f0a0a] border-[#5a1a1a]" : "bg-[#0E1A24] border-[#1a2e40]"}`}>
                    <div>
                      <div className={`text-[11px] font-semibold ${hit ? "text-[#FFD7D7]" : "text-[#C9D6DE]"}`}>{label}</div>
                      <div className="text-[9px] text-[#56707F] font-mono">{thresh}</div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${hit ? "bg-[#FF6B6B] text-[#1f0a0a]" : "bg-[#1a2e40] text-[#46606E]"}`}>
                      {hit ? "MET" : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Fluid protocol */}
            <Card>
              <Sec icon={Droplet} label="CRRT Fluid Protocol" color="#7CC4FF" />
              <div className="space-y-1">
                {[
                  ["Replacement fluid", "Bicarbonate-based only — no lactate buffer"],
                  ["Dialysate", "Bicarbonate-buffered, low K⁺ (2 mmol/L)"],
                  ["Anticoagulation", "Regional citrate preferred over heparin"],
                  ["Potassium", "0–2 mmol/L"],
                  ["Calcium", "Calcium-free fluid if RCA used + separate IV calcium"],
                  ["Magnesium", "1.5–2.0 mg/dL (0.6–0.8 mmol/L)"],
                  ["Sodium", "Match baseline — low-sodium dialysate (119–126 mmol/L) when hyponatremic; limit intraoperative change to ≤6 mmol/L/24 h (ODS risk)"],
                ].map(([k, val]) => (
                  <div key={k} className="flex gap-2 py-1 border-b border-[#1a2e40] last:border-0">
                    <div className="text-[10px] text-[#8FA3B3] w-[110px] flex-shrink-0 uppercase tracking-wide">{k}</div>
                    <div className="text-[11px] text-[#E6EEF2] flex-1">{val}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Benefits + monitoring */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Card>
                <Sec icon={Zap} label="Benefits" color="#7CD992" />
                <ul className="space-y-1">
                  <Bul>Precise volume management during massive transfusion and reperfusion</Bul>
                  <Bul>Electrolyte and acid-base correction</Bul>
                  <Bul>Hemodynamic stability</Bul>
                  <Bul>Thermal control</Bul>
                  <Bul>Reduced cerebral edema risk in hyponatremia</Bul>
                  <Bul>Improved lactate clearance and metabolic support</Bul>
                </ul>
              </Card>
              <Card>
                <Sec icon={Activity} label="Intraoperative Monitoring" color="#4DD8C9" />
                <ul className="space-y-1">
                  <Bul>K⁺, Na⁺, lactate, ionized Ca²⁺, and pH hourly</Bul>
                  <Bul>Warm CRRT fluids to maintain core temperature</Bul>
                  <Bul>Circuit pressures and filter life</Bul>
                  <Bul>Citrate accumulation: total/ionized Ca ratio &gt;2.5 signals toxicity</Bul>
                </ul>
              </Card>
            </div>

            <div className="text-[10px] text-[#56707F] leading-relaxed px-1">
              <strong className="text-[#8FA3B3]">Evidence:</strong> Karvellas et al. 2019 (pilot RCT — IoCRRT safe and feasible) ·
              Huang et al. 2020 (meta-analysis — no short-term mortality difference) ·
              Townsend et al. 2018 (pH as low as 6.97, K⁺ &gt;5.3 triggered CRRT) · KDIGO 2012 · AASLD guidelines.
              Adapted from <em>Intraoperative CRRT During Liver Transplantation</em>, S. Mahmoud, MD, PhD.
            </div>
          </div>
        )}

        {/* ═══════════ UNOS ═══════════ */}
        {tab === "unos" && (
          <div className="space-y-3">

            {/* Glossary */}
            <div className="flex items-start gap-2 bg-[#0d1a24] border border-[#1e3a52] rounded-lg px-3 py-2">
              <Info size={13} className="text-[#7CC4FF] flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-[#C8DEFF] leading-relaxed">
                <strong>NM</strong> = nautical miles (1 NM ≈ 1.15 statute miles ≈ 1.85 km), measured from the donor hospital.
                &nbsp;<strong>MMaT</strong> = median MELD at transplant within a 250 NM circle of the transplant hospital, recalculated every 6 months.
                &nbsp;<strong>NLRB</strong> = National Liver Review Board.
              </div>
            </div>

            {/* Patient-specific */}
            {unos.length > 0 && (
              <Card>
                <Sec icon={ListChecks} label="This Candidate" color="#4DD8C9" />
                <div className="space-y-2">
                  {unos.map((n, i) => (
                    <div key={i} className={`rounded-lg px-3 py-2 border ${
                      n.lvl === "high" ? "bg-[#1f0a0a] border-[#5a1a1a]"
                      : n.lvl === "med" ? "bg-[#1d1707] border-[#4a3500]"
                      : "bg-[#0d1a24] border-[#1e3a52]"}`}>
                      <div className={`text-[12px] font-bold ${
                        n.lvl === "high" ? "text-[#FFD7D7]" : n.lvl === "med" ? "text-[#FFE4A0]" : "text-[#C8DEFF]"}`}>{n.t}</div>
                      <div className="text-[10.5px] text-[#8FA3B3] mt-1 leading-relaxed">{n.d}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Collap title="Status 1A — Adult" icon={AlertTriangle} color="#FF6B6B" open>
              <p className="text-[10.5px] text-[#8FA3B3] mb-2 leading-relaxed">
                Most urgent status. Receives MELD 40 equivalent priority and a 500 NM allocation circle.
                Fewer than 1% of candidates are Status 1A at any time. Requires a Liver Status 1A Justification Form;
                recertification every 7 days.
              </p>
              <div className="text-[10px] font-bold text-[#E6EEF2] uppercase tracking-wide mb-1">Qualifying conditions (≥1)</div>
              <ul className="space-y-1 mb-2.5">
                <Bul><strong className="text-[#FFD7D7]">Fulminant hepatic failure</strong> — life expectancy &lt;7 days without transplant. Encephalopathy onset within 56 days of first symptom, no pre-existing liver disease, ICU admission, plus ≥1 of: ventilator dependence · dialysis/CVVHD · INR &gt;2.0</Bul>
                <Bul><strong className="text-[#FFD7D7]">Anhepatic</strong> — native liver removed</Bul>
                <Bul><strong className="text-[#FFD7D7]">Primary non-function</strong> — within 7 days of transplant, with AST ≥3000 and ≥1 of: INR ≥2.5 · arterial pH ≤7.30 · venous pH ≤7.25 · lactate ≥4 mmol/L</Bul>
                <Bul><strong className="text-[#FFD7D7]">Hepatic artery thrombosis</strong> — within 7 days of transplant, meeting the same laboratory criteria as PNF</Bul>
                <Bul><strong className="text-[#FFD7D7]">Acute decompensated Wilson disease</strong></Bul>
              </ul>
              <Flag level="info" text="HAT occurring 7–14 days post-transplant that does not meet Status 1A criteria is eligible for a MELD 40 exception instead." />
            </Collap>

            <Collap title="Status 1B — Pediatric only" icon={ListChecks} color="#FFC857">
              <p className="text-[10.5px] text-[#8FA3B3] mb-2 leading-relaxed">
                Restricted to candidates under 18 years. Chronically ill pediatric patients with severe decompensation.
                Requires a Status 1B Justification Form.
              </p>
              <ul className="space-y-1">
                <Bul>Chronic liver disease with calculated MELD/PELD &gt;25, plus ≥1 complication of chronic liver disease</Bul>
                <Bul>PELD exception meeting standard metabolic disease criteria for ≥30 days</Bul>
                <Bul>Hepatoblastoma</Bul>
                <Bul>Organic acidemia or urea cycle defect</Bul>
              </ul>
            </Collap>

            <Collap title="Status 7 — Inactive" icon={Info} color="#8FA3B3">
              <p className="text-[10.5px] text-[#8FA3B3] mb-2 leading-relaxed">
                Candidate remains on the waiting list and <strong className="text-[#E6EEF2]">continues to accrue waiting time</strong>,
                but is <strong className="text-[#E6EEF2]">not eligible to receive organ offers</strong>. Reversible — the candidate
                returns to active status when the barrier resolves.
              </p>
              <div className="text-[10px] font-bold text-[#E6EEF2] uppercase tracking-wide mb-1">Common reasons for inactivation</div>
              <ul className="space-y-1 mb-2.5">
                <Bul>Too sick to transplant — active sepsis, uncontrolled infection, hemodynamic instability</Bul>
                <Bul>Too well — clinical improvement, MELD no longer supports transplant benefit</Bul>
                <Bul>Active substance use, or non-adherence with the treatment plan</Bul>
                <Bul>Incomplete workup, insurance or financial clearance pending</Bul>
                <Bul>Candidate preference — temporary personal deferral</Bul>
                <Bul>Recent malignancy requiring observation interval</Bul>
              </ul>
              <Flag level="med" text="Anesthesia relevance: a Status 7 patient presenting for an unrelated procedure is by definition not transplant-eligible at that moment. Confirm the reason for inactivation — active infection and hemodynamic instability change the perioperative plan materially." />
            </Collap>

            <Collap title="Acuity Circles — Distribution" icon={Waves} color="#7CC4FF">
              <p className="text-[10.5px] text-[#8FA3B3] mb-2 leading-relaxed">
                Replaced DSA/region-based allocation in February 2020. Organs are distributed in concentric nautical-mile
                circles measured from the donor hospital, descending by acuity tier.
              </p>
              <div className="space-y-1">
                {[
                  ["Status 1A / 1B", "500 NM", "#FF6B6B"],
                  ["MELD ≥ 37", "150 → 250 → 500 NM", "#FF9A5A"],
                  ["MELD 33–36", "150 → 250 → 500 NM", "#FFC857"],
                  ["MELD 29–32", "150 → 250 → 500 NM", "#FFC857"],
                  ["MELD 15–28", "150 → 250 NM", "#7CC4FF"],
                  ["MELD < 15", "Local, then national", "#8FA3B3"],
                ].map(([tier, circle, color]) => (
                  <div key={tier} className="flex items-center justify-between px-2.5 py-1.5 bg-[#0E1A24] border border-[#1a2e40] rounded-md">
                    <span className="text-[11px] font-semibold" style={{ color }}>{tier}</span>
                    <span className="text-[10px] font-mono text-[#8FA3B3]">{circle}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#56707F] mt-2 leading-relaxed">
                Proximity points (0–3) are added based on distance from the donor hospital, so an allocation MELD may exceed 40.
              </p>
            </Collap>

            <Collap title="MELD Exceptions — Point Values" icon={BookOpen} color="#C9A8FF">
              <p className="text-[10.5px] text-[#8FA3B3] mb-2.5 leading-relaxed">
                For conditions where the calculated MELD underestimates true mortality risk. Standard exceptions are granted
                automatically; all others are adjudicated by the NLRB. Most exceptions do not add a fixed number of points —
                instead the candidate's score is <strong className="text-[#E6EEF2]">set to</strong> a value derived from MMaT.
              </p>
              <div className="space-y-1.5">
                {[
                  ["Hepatocellular carcinoma", "MMaT − 3", "#FF9A5A", "Milan/T2: 1 lesion 2–5 cm, or 2–3 lesions each 1–3 cm, no vascular invasion, no extrahepatic spread. Mandatory 6-month wait, then score set to MMaT − 3. Example: area MMaT 31 → listed at 28."],
                  ["Hepatopulmonary syndrome", "MMaT − 3", "#FF9A5A", "PaO₂ <60 mmHg on room air with documented intrapulmonary shunting."],
                  ["Portopulmonary hypertension", "MMaT − 3", "#FF9A5A", "Precapillary PH: mPAP >20 mmHg, PAWP ≤15, PVR >2 WU. On PAH therapy, post-treatment mPAP <35 mmHg — or mPAP 35–45 with PVR <3 WU — with serial RHC every 3 months to maintain the exception."],
                  ["Familial amyloid polyneuropathy", "MMaT − 3", "#FF9A5A", "Biopsy-confirmed with a documented TTR mutation."],
                  ["Cystic fibrosis", "MMaT − 3", "#FF9A5A", "FEV₁ <40% predicted or deteriorating pulmonary function."],
                  ["Hilar cholangiocarcinoma", "MMaT − 3", "#FF9A5A", "Enrolled in an approved neoadjuvant protocol; tumor <3 cm."],
                  ["Primary hyperoxaluria", "MMaT (no −3)", "#FFC857", "AGT deficiency on biopsy/genetics, on kidney list with eGFR ≤25 on two occasions ≥42 days apart. Full MMaT — no 3-point reduction, given very high mortality."],
                  ["HAT 7–14 days post-transplant", "MELD 40", "#FF6B6B", "Hepatic artery thrombosis after 7 days but within 14 days, not meeting Status 1A criteria. Fixed MELD 40 — not MMaT-based."],
                  ["Transplant oncology (iCCA, NET, CRLM)", "MMaT − 20", "#7CC4FF", "Intrahepatic cholangiocarcinoma, neuroendocrine tumors, colorectal liver metastases. Score set to MMaT − 20 (floor of 15); reviewed by the Transplant Oncology Review Board."],
                ].map(([t, pts, color, d]) => (
                  <div key={t} className="bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-2">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-[#E6EEF2]">{t}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ color, backgroundColor: color + "1A" }}>{pts}</span>
                    </div>
                    <div className="text-[10px] text-[#8FA3B3] leading-relaxed">{d}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-[#56707F] leading-relaxed">
                If MMaT − 20 falls below 15, the score is floored at 15 (Policy 9.4.E). Exception scores are recalculated
                when MMaT is readjusted every 6 months.
              </div>
            </Collap>

            <Flag level="info" text="OPTN policy is revised periodically. Verify against current policy at optn.transplant.hrsa.gov before any listing decision. This reference is for perioperative situational awareness — it is not a listing authority." />
          </div>
        )}

        {/* ═══════════ PLAN ═══════════ */}
        {tab === "plan" && (
          <div className="space-y-2.5">
            <Collap title="Induction" icon={Activity} color="#4DD8C9" open>
              <ul className="space-y-1">
                <Bul>Modified RSI — aspiration risk from ascites and gastroparesis</Bul>
                <Bul>Rocuronium 1.2 mg/kg; avoid succinylcholine with hyperkalemia or AKI</Bul>
                <Bul>Etomidate or ketamine if hemodynamically compromised; avoid propofol bolus with low EF</Bul>
                <Bul>Reduce opioid induction dose in proportion to hepatic clearance impairment</Bul>
              </ul>
            </Collap>

            <Collap title="Surgical Phases" icon={Heart} color="#FF9A5A" open>
              <ul className="space-y-1">
                <Bul><strong className="text-[#FF9A5A]">Dissection</strong> — vasopressin first-line (portal hypertension benefit), MAP ≥65, limit crystalloid</Bul>
                <Bul><strong className="text-[#FF9A5A]">Anhepatic</strong> — IVC clamping drops preload 30–50%; phenylephrine drawn up; K⁺ q15–20 min (no hepatic buffering of transfused K⁺)</Bul>
                {f.lvoto && <Bul><strong className="text-[#FF6B6B]">LVOTO</strong> — phenylephrine + volume; dobutamine and vasodilators contraindicated</Bul>}
                <Bul><strong className="text-[#FF9A5A]">Pre-reperfusion</strong> — CaCl₂ 1 g IV; THAM preferred over bicarbonate when Na is a concern (no CO₂ generation, no sodium load); warm all products</Bul>
                <Bul><strong className="text-[#FF9A5A]">Reperfusion</strong> — PRS in ~30%: epinephrine 10–50 mcg boluses ready, vasopressin infusion, repeat calcium</Bul>
                {f.dcd && <Bul><strong className="text-[#FFC857]">DCD graft</strong> — PRS ~42% with cold storage vs 11% with NMP (Mayo 2025); anticipate higher vasoactive and transfusion requirements</Bul>}
              </ul>
            </Collap>

            <Collap title="TEG-Guided Coagulation" icon={Droplet} color="#FF6B6B" open={v.tegLY30 !== null && v.tegLY30 > 3}>
              <ul className="space-y-1">
                <Bul>TEG/ROTEM-guided only — PT/INR is unreliable in ESLD (rebalanced hemostasis)</Bul>
                <Bul>R-time &gt;10 min → FFP, or 4F-PCC if volume-restricted</Bul>
                <Bul>MA &lt;50 mm → platelets if count &lt;50k; cryoprecipitate if fibrinogen &lt;150 mg/dL</Bul>
                {v.tegLY30 !== null && v.tegLY30 > 3
                  ? <Bul><strong className="text-[#FF6B6B]">LY30 {v.tegLY30}% — hyperfibrinolysis active. TXA 1 g IV now. EACA if TXA unavailable.</strong></Bul>
                  : <Bul>Monitor LY30 — if &gt;3% at or after reperfusion, TXA 1 g IV stat</Bul>}
                <Bul>Target Hgb ≥8; avoid over-transfusion — raises portal pressure</Bul>
                <Bul>Serial TEG q30–60 min throughout the case</Bul>
              </ul>
            </Collap>

            <Collap title="Fluid & Acid-Base" icon={Zap} color="#FFC857">
              <ul className="space-y-1">
                <Bul>Balanced crystalloid (Plasmalyte) over normal saline — avoids hyperchloremic acidosis</Bul>
                <Bul>Albumin 20–25% for volume and oncotic support</Bul>
                <Bul>THAM 0.3 M for metabolic acidosis when sodium load is a concern; target pH &gt;7.2</Bul>
                <Bul>Sodium q1–2 h — limit the intraoperative change to ≤6 mmol/L per 24 h to avoid osmotic demyelination (see the sodium protocol above when Na⁺ &lt;135)</Bul>
                <Bul>Lactate clearance post-reperfusion is a marker of new graft function</Bul>
              </ul>
            </Collap>

            <Collap title="Pain Management" icon={Pill} color="#C9A8FF">
              <ul className="space-y-1">
                <Bul>Acetaminophen 650–1000 mg q6–8 h scheduled; reduce or avoid in severe hepatic failure</Bul>
                <Bul>No NSAIDs — renal prostaglandin inhibition precipitates hepatorenal syndrome</Bul>
                <Bul>Fentanyl or hydromorphone; avoid morphine (M6G accumulation) and codeine (unpredictable CYP2D6)</Bul>
                {(v.plts !== null && v.plts < 80) || (v.inr !== null && v.inr > 1.5)
                  ? <Bul><strong className="text-[#FFC857]">Regional deferred</strong> — ASRA 2018 thresholds not met (platelets &gt;80k, INR &lt;1.5). Systemic multimodal only until corrected.</Bul>
                  : <Bul>Fascial plane blocks (rectus sheath, ESP) reasonable if coagulation is acceptable at time of placement</Bul>}
                <Bul>Ketamine 0.1–0.3 mg/kg/h — opioid-sparing NMDA antagonism</Bul>
                <Bul>Dexmedetomidine — opioid-sparing, anxiolytic, reduces emergence delirium</Bul>
                <Bul><strong className="text-[#C9A8FF]">Methadone</strong> — a single intraoperative dose (0.1–0.2 mg/kg IV) provides long-acting analgesia via μ-agonism plus NMDA antagonism and reduces postoperative opioid requirements; caution with QT prolongation (common in cirrhosis) — check baseline ECG, and note hepatic metabolism prolongs its half-life</Bul>
                {f.opioid && <Bul><strong className="text-[#C9A8FF]">Opioid tolerance</strong> — continue home buprenorphine or methadone maintenance per addiction medicine; abrupt discontinuation causes withdrawal and paradoxical hyperalgesia; involve the acute pain service</Bul>}
                <Bul>Reassess after reperfusion — hepatic clearance resumes rapidly; down-titrate infusions</Bul>
              </ul>
            </Collap>

            {ph?.active && (
              <Collap title="Pulmonary Hypertension — Intraoperative Management" icon={Wind} color="#FF6B6B" open>
                <p className="text-[10px] text-[#56707F] mb-2">ILTS practice guideline update on portopulmonary hypertension, Liver Transpl 2026;32:296–314 (Rec 15–17)</p>
                {ph.sev && (
                  <div className="mb-2 flex items-center justify-between bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-1.5">
                    <span className="text-[10px] uppercase tracking-wide text-[#8FA3B3]">Severity · mPAP {v.rhcMPAP} mmHg</span>
                    <span className="text-[12px] font-bold" style={{ color: ph.sev.c }}>{ph.sev.label}</span>
                  </div>
                )}
                <div className="text-[10px] font-bold text-[#E6EEF2] uppercase tracking-wide mb-1">Monitoring</div>
                <ul className="space-y-1 mb-2.5">
                  <Bul><strong className="text-[#FF6B6B]">Pulmonary artery catheter</strong> — intraoperative PA catheter haemodynamic monitoring is advised in PH, absent contraindications. Trend mPAP, PVR, CO and transpulmonary gradient through every phase</Bul>
                  <Bul><strong className="text-[#FF6B6B]">TEE</strong> — complements invasive haemodynamics; assess RV size and function continuously and to detect intraoperative complications</Bul>
                  <Bul>Arterial line before induction; anticipate that induction and IVC clamping are the points of greatest RV vulnerability</Bul>
                </ul>
                <div className="text-[10px] font-bold text-[#E6EEF2] uppercase tracking-wide mb-1">Drugs & equipment in the room before induction</div>
                <ul className="space-y-1 mb-2.5">
                  <Bul><strong className="text-[#7CC4FF]">Inhaled nitric oxide 20–40 ppm</strong> or <strong className="text-[#7CC4FF]">inhaled prostacyclin analogue</strong> (epoprostenol) — confirm the circuit, cylinder, and delivery device are physically present and checked before the patient enters the room</Bul>
                  <Bul><strong className="text-[#7CC4FF]">Continue pre-transplant PAH therapy</strong> — all continuous IV or subcutaneous prostacyclin analogs run uninterrupted throughout the case; oral and inhaled agents resume postoperatively</Bul>
                  <Bul><strong className="text-[#7CC4FF]">RV inotropy</strong> — milrinone or dobutamine for additional pulmonary vasodilatation and RV inotropic support</Bul>
                  <Bul><strong className="text-[#7CC4FF]">Vasopressors</strong> — norepinephrine, vasopressin, and epinephrine are the preferred agents to maintain systemic perfusion and coronary pressure to the RV in PAH</Bul>
                  <Bul><strong className="text-[#FF6B6B]">VA-ECMO</strong> — identify capability and the team before induction; it is the rescue for cardiovascular collapse from acute RV failure. Consider early with decompensation (high bleeding/thrombosis risk — involve haematology and perfusion)</Bul>
                </ul>
                <div className="text-[10px] font-bold text-[#E6EEF2] uppercase tracking-wide mb-1">Physiological targets</div>
                <ul className="space-y-1">
                  <Bul>Avoid hypoxaemia, hypercarbia, acidosis, hypothermia and high airway pressures — every one of them raises PVR</Bul>
                  <Bul>Maintain sinus rhythm and preload without volume overloading the RV; treat arrhythmia promptly</Bul>
                  <Bul>Reperfusion is the highest-risk moment — anticipate an acute rise in PVR and have the inhaled vasodilator running before the clamp comes off</Bul>
                </ul>
                <Flag level="info" text="Pre-transplant: PAH therapy is used to reduce mPAP and PVR (Rec 12). TIPS and beta-blockers are avoided in POPH. Post-LT, all PAH therapy continues under PH-expert supervision, with echo and clinical evaluation within 3 months." />
              </Collap>
            )}

            {naProt && (
              <Collap title="Hyponatremia — Sodium Management Protocol" icon={Droplet} color="#7CC4FF" open={v.na < 130}>
                <p className="text-[10px] text-[#56707F] mb-2">Verbeek TA, Bezinover D, et al. Hyponatremia and liver transplantation: a narrative review. J Cardiothorac Vasc Anesth 2022</p>
                <div className="flex items-center justify-between bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-1.5 mb-2.5">
                  <span className="text-[10px] uppercase tracking-wide text-[#8FA3B3]">Na⁺ {v.na} mmol/L</span>
                  <span className="text-[12px] font-bold" style={{ color: naProt.tier.c }}>{naProt.tier.label} hyponatremia</span>
                </div>

                <div className="text-[10px] font-bold text-[#E6EEF2] uppercase tracking-wide mb-1">Correction limits</div>
                <div className="space-y-1 mb-2.5">
                  {[
                    ["Preoperative", "4–8 mmol/L per day", "4–6 mmol/L per day if ODS risk is high; therapeutic limit ≤8 in any 24 h"],
                    ["Intraoperative", "≤6 mmol/L per 24 h", "An intraoperative rise >10 mmol/L is associated with higher 90-day mortality and more neurologic complications"],
                    ["Postoperative", "4–6 mmol/L per day", "Sodium normalises on its own — the task is to stop it rising too fast"],
                  ].map(([phase, goal, note]) => (
                    <div key={phase} className="bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#E6EEF2]">{phase}</span>
                        <span className="text-[11px] font-mono font-bold text-[#7CD992]">{goal}</span>
                      </div>
                      <div className="text-[9.5px] text-[#8FA3B3] mt-1 leading-relaxed">{note}</div>
                    </div>
                  ))}
                </div>

                {naProt.odsRisk.length > 0 && (
                  <div className="mb-2.5">
                    <Flag level={naProt.highRisk ? "high" : "med"}
                      text={`ODS risk factors present: ${naProt.odsRisk.join(" · ")}. ${naProt.highRisk ? "Use the lower 4–6 mmol/L per day target." : ""}`} />
                  </div>
                )}

                <div className="text-[10px] font-bold text-[#E6EEF2] uppercase tracking-wide mb-1">Intraoperative measures (consult nephrology)</div>
                <ul className="space-y-1 mb-2.5">
                  <Bul>Check Na⁺ frequently — q1–2 h, and around every large transfusion</Bul>
                  <Bul>Limit sodium-containing IV fluids; use hypotonic carriers (0.45% saline, 5% dextrose) where volume allows</Bul>
                  <Bul>Limit sodium-rich blood products — FFP runs ~172 mmol/L. Viscoelastic testing to limit transfusion; prefer coagulation factor concentrates</Bul>
                  <Bul><strong className="text-[#7CC4FF]">Low-sodium CRRT</strong> — standard 140 mmol/L dialysate can drive an excessive rise; reduced-sodium dialysate/replacement fluid (e.g. 119–126 mmol/L) keeps Na⁺ stable</Bul>
                  <Bul>Low-sodium veno-venous bypass priming solution if VVB is used</Bul>
                  <Bul>THAM rather than sodium bicarbonate to treat acidosis — no sodium load</Bul>
                  <Bul><strong className="text-[#FFC857]">If Na⁺ rises too fast</strong> — re-lower it: free water / hypotonic fluid ± desmopressin (DDAVP), and switch to low-sodium CRRT</Bul>
                </ul>
                <Flag level="med" text="Hypertonic saline (3–5%) has one indication here: severe symptomatic hyponatremia with life-threatening features — seizures, coma, or cardiorespiratory distress. Otherwise the risk runs the other way, toward overcorrection and osmotic demyelination." />
              </Collap>
            )}

            {f.hps && (
              <Collap title="HPS — Post-Reperfusion Hypoxemia" icon={Wind} color="#7CC4FF" open>
                <p className="text-[10px] text-[#56707F] mb-2">Nayyar et al., Am J Transplant 2015</p>
                <ul className="space-y-1">
                  <Bul>FiO₂ 1.0; avoid SpO₂ &lt;88%</Bul>
                  <Bul><strong>Step 1</strong> — Trendelenburg: redistributes perfusion away from basal shunts</Bul>
                  <Bul><strong>Step 2</strong> — inhaled epoprostenol 25–50 ng/kg/min or inhaled NO 20–40 ppm</Bul>
                  <Bul><strong>Step 3</strong> — IV methylene blue 1.5–2 mg/kg if refractory</Bul>
                  <Bul><strong>Step 4</strong> — IR embolization of large pulmonary AVMs if identified</Bul>
                  <Bul><strong>Step 5</strong> — ECMO (VA or VV); plan access preoperatively if PaO₂ &lt;50 mmHg with shunt &gt;20%</Bul>
                  <Bul>Most HPS resolves 6–12 months post-LT; counsel regarding prolonged ICU stay</Bul>
                </ul>
              </Collap>
            )}

            <Collap title="Monitoring & Access" icon={Activity} color="#4DD8C9">
              <ul className="space-y-1">
                <Bul>Arterial line — placement timing per clinical judgment; often placed after induction unless the patient is unstable or a difficult catheterization is anticipated</Bul>
                <Bul>Large-bore peripheral access ×2 plus rapid infusion catheter</Bul>
                <Bul>Central venous access — CVP trending, vasoactive delivery</Bul>
                <Bul>TEE — RV/LV function, volume state, air embolism at reperfusion</Bul>
                {ph?.active && <Bul><strong className="text-[#FF6B6B]">Pulmonary artery catheter</strong> — advised in pulmonary hypertension alongside TEE; trend mPAP, PVR and cardiac output through each phase (ILTS 2026)</Bul>}
                <Bul>Serial TEG/ROTEM q30–60 min</Bul>
                <Bul>Core temperature continuously — hypothermia worsens coagulopathy</Bul>
                <Bul>Hourly urine output; lactate q60 min through anhepatic and reperfusion</Bul>
                {(crrt.met.length > 0 || crrt.antic.length > 0) && <Bul><strong className="text-[#7CC4FF]">CRRT anticipated</strong> — K⁺, Na⁺, lactate, ionized Ca²⁺, pH hourly; warm circuit fluids</Bul>}
              </ul>
            </Collap>

            <Collap title="Equipment & Temperature" icon={Zap} color="#7CC4FF">
              <ul className="space-y-1">
                <Bul><strong className="text-[#7CC4FF]">Underbody forced-air / water warming blanket</strong> — full-length underbody unit; liver transplant is long with large exposed surface area and massive transfusion. Combine with a fluid warmer on all lines</Bul>
                <Bul><strong className="text-[#7CC4FF]">R2 defibrillation/pacing pads</strong> placed before induction — reperfusion arrhythmias and hyperkalemic arrest are real; pads allow immediate cardioversion/defibrillation without repositioning</Bul>
                <Bul>Fluid warmer and rapid infuser primed; blood products checked and immediately available</Bul>
                <Bul>Cell salvage available (avoid in HCC/infection per institutional policy)</Bul>
                {ph?.active && <Bul><strong className="text-[#FF6B6B]">Inhaled nitric oxide / inhaled epoprostenol</strong> — confirm cylinder, circuit and delivery device are in the room and checked before induction; identify VA-ECMO capability for RV-failure rescue</Bul>}
                <Bul>Upper-body forced-air blanket once the surgical field is established, if feasible</Bul>
              </ul>
            </Collap>

            <Collap title="Positioning & Nerve Protection" icon={Shield} color="#C9A8FF">
              <p className="text-[10px] text-[#56707F] mb-2">Long case, coagulopathy, and edema all raise pressure-injury and neuropathy risk. Document a pre-op skin check.</p>
              <ul className="space-y-1">
                <Bul><strong className="text-[#C9A8FF]">Sacrum</strong> — foam or gel sacral dressing; the most common site of intraoperative pressure ulcers in prolonged supine cases</Bul>
                <Bul><strong className="text-[#C9A8FF]">Heels</strong> — float heels off the table with a pillow or heel-suspension boots; offload completely</Bul>
                <Bul><strong className="text-[#C9A8FF]">Shoulders / occiput</strong> — pad shoulders and head; avoid shoulder braces in steep positioning (brachial plexus stretch)</Bul>
                <Bul><strong className="text-[#C9A8FF]">Foot drop</strong> — padded boots keep ankles neutral and protect the common peroneal nerve at the fibular head</Bul>
                <Bul><strong className="text-[#C9A8FF]">Ulnar nerve</strong> — forearms supinated/neutral, elbows padded; keep arms &lt;90° abduction to protect the brachial plexus</Bul>
                <Bul>Eyes taped and padded; check pressure points again after any table tilt or repositioning</Bul>
                <Bul>Reassess all pressure points hourly during the case — edema shifts contact areas</Bul>
              </ul>
            </Collap>

            <Collap title="Evidence Base — Sources & Citations" icon={BookOpen} color="#8FA3B3" open>
              <p className="text-[10px] text-[#8FA3B3] mb-2 leading-relaxed">
                Every score, threshold, and recommendation in MELD+ is drawn from the peer-reviewed
                literature and public allocation policy listed below. Tap any citation to open the
                original source.
              </p>
              <ul className="space-y-1.5">
                {REFERENCES.map((r) => (
                  <li key={r.t}>
                    <a
                      href={r.u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#7CC4FF] underline decoration-[#25506f] leading-relaxed block hover:text-[#A8D8FF]"
                    >
                      {r.t}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="text-[9px] text-[#56707F] mt-3 leading-relaxed">
                MELD+ is a reference tool for licensed clinicians. It is not a regulated medical
                device and does not diagnose or treat. Always seek a physician's advice in addition
                to using this app and before making any medical decision.
              </p>
            </Collap>
          </div>
        )}

        {/* ═══════════ SOURCES ═══════════ */}
        {tab === "sources" && (
          <div className="space-y-3">
            <Card>
              <Sec icon={BookOpen} label="Sources & Citations" color="#7CC4FF" />
              <p className="text-[11.5px] text-[#C9D6DE] leading-relaxed mb-1">
                Every score, threshold, and recommendation in MELD+ is drawn from the peer-reviewed
                literature and published OPTN/UNOS allocation policy listed below. Tap any citation to
                open the original source in your browser.
              </p>
            </Card>

            <Card>
              <Sec icon={ListChecks} label="Primary References" color="#4DD8C9" />
              <ul className="space-y-2">
                {REFERENCES.map((r, i) => (
                  <li key={r.t} className="flex gap-2">
                    <span className="text-[10px] font-mono text-[#56707F] flex-shrink-0 pt-0.5 w-5 text-right">{i + 1}.</span>
                    <a
                      href={r.u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#7CC4FF] underline decoration-[#25506f] leading-relaxed block hover:text-[#A8D8FF]"
                    >
                      {r.t}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <Sec icon={AlertTriangle} label="Intended Use & Disclaimer" color="#FF6B6B" />
              <p className="text-[11px] text-[#C9D6DE] leading-relaxed">
                MELD+ is an educational and clinical reference tool for qualified, licensed healthcare
                professionals. It is not a medical device and does not diagnose, treat, prescribe, or
                replace clinical judgment. All outputs are reference material to inform — never replace —
                a clinician's decision. Always seek a physician's advice in addition to using this app and
                before making any medical decision. Verify all allocation and listing questions against
                current policy at optn.transplant.hrsa.gov.
              </p>
            </Card>
          </div>
        )}

        {/* ═══════════ INFO ═══════════ */}
        {tab === "info" && (
          <div className="space-y-3">

            {/* ── About ── */}
            <Card>
              <Sec icon={Info} label="About MELD+" color="#FFD166" />
              <p className="text-[11.5px] text-[#C9D6DE] leading-relaxed mb-3">
                MELD+ turns pre-transplant patient data into a structured perioperative brief. Enter labs and clinical
                findings; it returns MELD 3.0 and MELD-Na with prognosis, targeted cardiac and pulmonary workup,
                intraoperative CRRT thresholds, UNOS allocation context, and a phase-by-phase management plan.
              </p>
              <p className="text-[11.5px] text-[#C9D6DE] leading-relaxed mb-3">
                It is built for the people in the room: liver transplant anesthesiologists, hepatologists, transplant
                surgeons, and the fellows and residents training alongside them. Every recommendation traces to
                peer-reviewed literature or published OPTN policy — the sources are listed under Plan → Evidence Base.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["No login", "Open and use"],
                  ["No storage", "Session-only"],
                  ["Offline", "No connection needed"],
                ].map(([t, d]) => (
                  <div key={t} className="bg-[#0E1A24] border border-[#1a2e40] rounded-lg px-2.5 py-2 text-center">
                    <div className="text-[11px] font-bold text-[#4DD8C9]">{t}</div>
                    <div className="text-[9px] text-[#56707F] mt-0.5">{d}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Developer ── */}
            <Card>
              <Sec icon={BookOpen} label="Developer" color="#C9A8FF" />
              <div className="text-[13px] font-bold text-[#E6EEF2]">Saifeldin Ahmed Mahmoud, MD, PhD</div>
              <div className="text-[11px] text-[#8FA3B3] mt-1.5 leading-relaxed">
                ABA board-certified Adult Cardiac, Pediatric anesthesiologist.
              </div>
              <div className="mt-2.5 space-y-1.5">
                {[
                  "Director of Liver Transplant Anesthesia",
                  "Associate Professor of Anesthesiology",
                ].map((role) => (
                  <div key={role} className="bg-[#0E1A24] border border-[#1a2e40] rounded-md px-2.5 py-2">
                    <div className="text-[11px] font-semibold text-[#C9A8FF]">{role}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10.5px] text-[#56707F] mt-2.5 leading-relaxed">
                Author of 11 peer-reviewed publications, with presentations at ASA, ILTS, SPA, IARS, and SFN.
                MELD+ grew out of the pre-case brief he works through before every transplant.
              </div>
            </Card>

            {/* ── FAQ ── */}
            <div className="pt-1">
              <div className="text-[11px] font-bold tracking-wide text-[#E6EEF2] uppercase mb-2 px-1">
                Frequently Asked Questions
              </div>
              <div className="space-y-2">

                <Collap title="Which score does UNOS actually use?" icon={Info} color="#4DD8C9" open>
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed">
                    MELD 3.0. OPTN adopted it in 2023, replacing MELD-Na. It adds serum albumin and a sex coefficient
                    (+1.33 for female candidates), reweights the existing variables, and introduces interaction terms
                    between sodium and bilirubin and between creatinine and albumin. MELD+ shows MELD-Na alongside it
                    for continuity — many published outcome studies and institutional protocols still reference it.
                  </p>
                </Collap>

                <Collap title="Why do MELD 3.0 and MELD-Na differ for my patient?" icon={Info} color="#4DD8C9">
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed mb-2">
                    Three reasons, and the app shows you the delta:
                  </p>
                  <ul className="space-y-1">
                    <Bul><strong>Sex</strong> — female candidates gain 1.33 points, correcting for creatinine
                    overestimating renal function in women</Bul>
                    <Bul><strong>Albumin</strong> — low albumin raises MELD 3.0; MELD-Na ignores it entirely</Bul>
                    <Bul><strong>Creatinine cap</strong> — MELD 3.0 caps at 3.0 mg/dL, MELD-Na at 4.0, so severe renal
                    failure scores differently</Bul>
                  </ul>
                </Collap>

                <Collap title="What are Case A and Case B, and what does Share do?" icon={Users} color="#4DD8C9">
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed mb-2">
                    Two independent working cases, so you can hold a second patient alongside the one in front of you without losing the first.
                    Switch between them with the Case A / Case B control under the privacy banner; a dot marks a case that has data in it.
                    Reset clears only the case you are on.
                  </p>
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed mb-2">
                    Both live in memory for the current session only. Closing the app discards them — nothing is written to the device,
                    so the privacy position is unchanged.
                  </p>
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed">
                    <strong>Share</strong> assembles the computed output — scores, red flags, CRRT verdict, pulmonary hypertension and sodium plans,
                    allocation context — as plain text you can copy, send, or print to PDF. It is de-identified by construction: the app never asks
                    for a name, MRN, or date of birth, so none can appear in the brief. Paste it into the medical record; do not send it over
                    unsecured channels.
                  </p>
                </Collap>

                <Collap title="Is patient data stored or transmitted anywhere?" icon={Shield} color="#7CD992">
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed">
                    No. Every calculation runs locally on the device. Nothing is written to disk, sent over a network,
                    or logged. There is no account, no analytics, and no backend. Closing or refreshing the app discards
                    everything you entered. Because no protected health information ever leaves the device, MELD+ does
                    not act as a business associate under HIPAA — the exposure simply does not exist.
                  </p>
                </Collap>

                <Collap title="Can I use this to make a listing decision?" icon={AlertTriangle} color="#FF6B6B">
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed">
                    No. The UNOS section is reference material for perioperative situational awareness — it tells you
                    where a candidate sits in the allocation landscape so you can anticipate urgency and resource needs.
                    Listing, status assignment, and exception requests go through your transplant program and the NLRB,
                    against current OPTN policy. OPTN revises policy regularly; verify anything consequential at
                    optn.transplant.hrsa.gov.
                  </p>
                </Collap>

                <Collap title="Why does the app cap creatinine?" icon={Info} color="#4DD8C9">
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed">
                    Because the formulas do. MELD 3.0 caps creatinine at 3.0 mg/dL and MELD-Na at 4.0. Dialysis twice in
                    seven days, or 24 hours of CVVHD, sets creatinine to the cap regardless of the measured value — the
                    dialysis itself signals the renal failure. Bilirubin and INR are floored at 1.0 to prevent negative
                    logarithms, and sodium is bounded 125–137.
                  </p>
                </Collap>

                <Collap title="What is MMaT, and why minus 3?" icon={Info} color="#C9A8FF">
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed">
                    MMaT is the median MELD at transplant within a 250 nautical mile circle of the transplant hospital,
                    recalculated every six months. Most exception scores are set to MMaT − 3 rather than adding fixed
                    points. The 3-point reduction exists because HCC candidates were previously transplanted ahead of
                    sicker patients — the subtraction restores balance without eliminating access. Primary hyperoxaluria
                    is listed at full MMaT given its mortality, and HAT at 7–14 days post-transplant gets a fixed MELD 40.
                  </p>
                </Collap>

                <Collap title="Why does it tell me to defer regional anesthesia?" icon={Droplet} color="#FF6B6B">
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed">
                    The pain section checks platelets and INR against ASRA 2018 thresholds (platelets &gt;80k, INR &lt;1.5
                    for neuraxial). If either fails, it recommends systemic multimodal analgesia instead. Coagulation in
                    end-stage liver disease is rebalanced rather than simply impaired, so reassess on the day of any
                    planned block — the numbers move.
                  </p>
                </Collap>

                <Collap title="How does the CRRT tool decide?" icon={Waves} color="#7CC4FF">
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed mb-2">
                    It checks seven published thresholds against what you enter and returns one of three verdicts:
                  </p>
                  <ul className="space-y-1">
                    <Bul><strong className="text-[#FF6B6B]">Indicated</strong> — one or more criteria met; the tool names
                    which and cites the source</Bul>
                    <Bul><strong className="text-[#FFC857]">Anticipate</strong> — no criterion met yet, but MELD &gt;35,
                    Na &lt;125, or lactate &gt;6 predicts need; prime the circuit</Bul>
                    <Bul><strong className="text-[#7CD992]">No criteria met</strong></Bul>
                  </ul>
                  <p className="text-[10.5px] text-[#56707F] leading-relaxed mt-2">
                    Blank fields are simply not evaluated — the tool never assumes a normal value you did not enter.
                  </p>
                </Collap>

                <Collap title="What does MELD not capture?" icon={AlertTriangle} color="#FFC857">
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed">
                    Frailty, sarcopenia, functional decline, quality of life, and refractory symptoms — none of which
                    appear in the formula. A patient with a modest MELD can be far sicker than the number suggests, which
                    is the entire reason the exception pathways exist. MELD is a structured risk estimate inside a
                    broader clinical assessment, not a replacement for one.
                  </p>
                </Collap>

                <Collap title="What is the Liver Frailty Index (LFI)?" icon={Activity} color="#C9A8FF">
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed mb-2">
                    The Liver Frailty Index is a performance-based measure of physical frailty developed specifically for
                    cirrhosis. It combines three bedside tests: dominant-hand <strong>grip strength</strong> (dynamometer,
                    average of 3), <strong>chair stands</strong> (time to rise from a chair 5 times, arms folded), and
                    <strong> balance</strong> (seconds held in side-by-side, semi-tandem, and tandem stances). It captures
                    functional decline that MELD misses and improves prediction of waitlist mortality over MELD-Na alone.
                  </p>
                  <ul className="space-y-1">
                    <Bul><strong className="text-[#7CD992]">Robust</strong> — LFI &lt;3.2</Bul>
                    <Bul><strong className="text-[#FFC857]">Pre-frail</strong> — LFI 3.2–4.4</Bul>
                    <Bul><strong className="text-[#FF6B6B]">Frail</strong> — LFI ≥4.5; independently associated with cirrhosis progression, unplanned hospitalization, and death</Bul>
                  </ul>
                  <p className="text-[10px] text-[#56707F] leading-relaxed mt-2">
                    Enter the score from the validated tool on the Patient tab. Lai et al., Hepatology 2017; Wang et al., Hepatology 2021.
                  </p>
                </Collap>

                <Collap title="What is the Composite Perioperative Risk, and is it validated?" icon={Shield} color="#C9A8FF">
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed mb-2">
                    It is a <strong>heuristic</strong> that adds up risk points across several validated domains — MELD 3.0,
                    Child-Pugh, the Liver Frailty Index, pulmonary function, BMI/obesity, smoking, and major cardiopulmonary
                    flags — into a single Low / Moderate / High / Very High tier for quick situational awareness before surgery.
                  </p>
                  <Flag level="med" text="It is NOT a validated score and NOT the MELD allocation score. MELD 3.0 remains the number used for listing and organ allocation. The composite simply flags patients who carry risk across multiple domains — always integrate with full clinical assessment." />
                  <p className="text-[10px] text-[#56707F] leading-relaxed mt-2">
                    Each component links to its own source under Plan → Evidence Base and the Sources tab.
                  </p>
                </Collap>

                <Collap title="How current is the evidence?" icon={BookOpen} color="#8FA3B3">
                  <p className="text-[11px] text-[#C9D6DE] leading-relaxed">
                    Sources span 2003 to 2025 and are listed in full under Plan → Evidence Base. The scoring formulas
                    follow Kim et al. 2021 (MELD 3.0) and current OPTN policy. CRRT thresholds derive from Karvellas 2019,
                    Townsend 2018, Huang 2020, and KDIGO 2012. Guidelines change — treat this as a well-sourced reference,
                    not a live feed.
                  </p>
                </Collap>

              </div>
            </div>

            {/* ── Disclaimer ── */}
            <Card>
              <Sec icon={AlertTriangle} label="Intended Use" color="#FF6B6B" />
              <p className="text-[11px] text-[#C9D6DE] leading-relaxed">
                MELD+ is clinical decision support for licensed medical professionals. It does not diagnose, prescribe,
                or replace clinical judgment, institutional protocol, formal hemodynamic or catheterization data, or
                current OPTN policy. Outputs are reference material to inform a clinician's decision — never a substitute
                for one. Verify all allocation and listing questions against current policy at optn.transplant.hrsa.gov.
              </p>
            </Card>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-6 pt-4 border-t border-[#1F3645]">
          <p className="text-[9.5px] text-[#46606E] text-center leading-relaxed">
            <strong className="text-[#8FA3B3]">MELD+</strong> · Clinical decision support for licensed anesthesiologists, hepatologists, and transplant surgeons.
            Does not replace clinical judgment, institutional protocol, formal RHC or catheterization data, or current OPTN policy.
          </p>
        </footer>
      </div>
    </div>
  );
}
