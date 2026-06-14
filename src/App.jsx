import { useState, useMemo } from "react";
import {
  AlertTriangle, Heart, Wind, ClipboardList, Activity,
  Droplet, Scale, Pill, Zap, ChevronDown, ChevronUp,
  BookOpen, CheckCircle, XCircle
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

function calcMeld(bili, inr, creat, dialysis) {
  const b = Math.max(parseFloat(bili) || 1, 1);
  const i = Math.max(parseFloat(inr) || 1, 1);
  let c = parseFloat(creat) || 1;
  if (dialysis) c = 4.0;
  c = clamp(Math.max(c, 1), 1, 4);
  const raw = 3.78 * Math.log(b) + 11.2 * Math.log(i) + 9.57 * Math.log(c) + 6.43;
  return { raw, b, i, c };
}

function calcMeldNa(raw, na) {
  const meld = clamp(Math.round(raw), 6, 40);
  if (meld <= 11) return meld;
  const sodium = clamp(parseFloat(na) || 137, 125, 137);
  const meldNa = meld + 1.32 * (137 - sodium) - 0.033 * meld * (137 - sodium);
  return clamp(Math.round(meldNa), 6, 40);
}

function calcChildPugh(bili, alb, inr, ascites, enceph) {
  let pts = 0;
  const b = parseFloat(bili) || 0;
  const a = parseFloat(alb) || 0;
  const i = parseFloat(inr) || 0;
  pts += b < 2 ? 1 : b <= 3 ? 2 : 3;
  pts += a > 3.5 ? 1 : a >= 2.8 ? 2 : 3;
  pts += i < 1.7 ? 1 : i <= 2.3 ? 2 : 3;
  pts += ascites === "none" ? 1 : ascites === "mild" ? 2 : 3;
  pts += enceph === "none" ? 1 : enceph === "12" ? 2 : 3;
  const cls = pts <= 6 ? "A" : pts <= 9 ? "B" : "C";
  const mort = { A: "10%", B: "30%", C: "76–82%" }[cls];
  return { pts, cls, mort };
}

const TIERS = [
  { max: 9,  label: "Low",    ring: "#3FA66B", text: "#7CD992", bg: "#0e1d15" },
  { max: 19, label: "Moderate", ring: "#D9A53E", text: "#FFC857", bg: "#1d1707" },
  { max: 29, label: "High",   ring: "#E0773C", text: "#FF9A5A", bg: "#1f1207" },
  { max: 40, label: "Severe", ring: "#D14C4C", text: "#FF6B6B", bg: "#1f0a0a" },
];
const tierFor = (s) => TIERS.find((t) => s <= t.max) || TIERS[3];

const CTP_COLORS = { A: "#7CD992", B: "#FFC857", C: "#FF6B6B" };

// ─── Initial form state ─────────────────────────────────────────────────────
const INIT = {
  // Demographics
  age: "", weightKg: "", heightCm: "",
  // Labs
  bili: "", inr: "", creat: "", na: "", albumin: "",
  dialysis: false,
  // Pulmonary
  spo2: "", hpsSigns: false, highRVSP: false, copd: false,
  // Cardiac
  cad: false, diabetes: false, exertional: false, lowEF: false, smoking: false, afib: false, lvoto: false,
  // Portal / GI
  varicealBleed: false, ascites: "none", hepEnceph: "none",
  // Coag / TEG
  platelets: "", fibrinogen: "", tegR: "", tegMA: "", tegLY30: "",
  // Other comorbidities
  aki: false, hyponaPreop: false,
  // Drug / pain
  opioidTolerance: false, alcohol: false, benzoUse: false,
  // Surgical
  dcdOrgan: false, vvbAnticipated: false,
};

// ─── Sub-components ─────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-wider text-[#8FA3B3]">{label}</span>
    {children}
  </label>
);

const NInput = (props) => (
  <input type="number" step="any"
    className="bg-[#0E1A24] border border-[#27404F] rounded px-2 py-1.5 text-[#E6EEF2] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#4DD8C9]"
    {...props} />
);

const Check = ({ label, checked, onChange, sub }) => (
  <label className="flex items-start gap-2 text-sm text-[#C9D6DE] cursor-pointer py-0.5">
    <input type="checkbox" checked={checked} onChange={onChange}
      className="mt-0.5 h-3.5 w-3.5 rounded border-[#27404F] accent-[#4DD8C9]" />
    <span>{label}{sub && <span className="text-[10px] text-[#8FA3B3] block">{sub}</span>}</span>
  </label>
);

const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={onChange}
    className="bg-[#0E1A24] border border-[#27404F] rounded px-2 py-1.5 text-[#E6EEF2] text-sm focus:outline-none focus:ring-1 focus:ring-[#4DD8C9]">
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

const SecTitle = ({ icon: Icon, label, color }) => (
  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#1F3645]">
    <Icon size={14} style={{ color }} />
    <span className="text-xs font-semibold tracking-wide text-[#E6EEF2]">{label}</span>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#101D29] border border-[#1F3645] rounded-xl p-4 ${className}`}>
    {children}
  </div>
);

const Flag = ({ text, level = "high" }) => {
  const colors = {
    high: "bg-[#2a0a0a] border-[#5a1a1a] text-[#FFD7D7]",
    med: "bg-[#1f1707] border-[#4a3500] text-[#FFE4A0]",
  };
  return (
    <div className={`text-xs border rounded px-2.5 py-1.5 ${colors[level]}`}>
      {text}
    </div>
  );
};

const Bullet = ({ text, color = "#C9D6DE" }) => (
  <li className="text-xs leading-relaxed" style={{ color }}>{text}</li>
);

const Collapsible = ({ title, color, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color }} />
          <span className="text-xs font-semibold tracking-wide text-[#E6EEF2]">{title}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-[#8FA3B3]" /> : <ChevronDown size={14} className="text-[#8FA3B3]" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </Card>
  );
};

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [f, setF] = useState(INIT);
  const [tab, setTab] = useState("input");

  const set = (key) => (e) =>
    setF((p) => ({ ...p, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  // ── Computed values ──────────────────────────────────────────────────────
  const hasLabs = f.bili !== "" && f.inr !== "" && f.creat !== "";

  const { meld, meldNa, tier, breakdown } = useMemo(() => {
    const { raw, b, i, c } = calcMeld(f.bili, f.inr, f.creat, f.dialysis);
    const meldVal = clamp(Math.round(raw), 6, 40);
    const meldNaVal = calcMeldNa(raw, f.na);
    const contribs = { bili: 3.78 * Math.log(b), inr: 11.2 * Math.log(i), creat: 9.57 * Math.log(c) };
    const total = contribs.bili + contribs.inr + contribs.creat;
    return {
      meld: meldVal, meldNa: meldNaVal, tier: tierFor(meldNaVal),
      breakdown: [
        { label: "Bili", pct: clamp((contribs.bili / total) * 100, 0, 100) },
        { label: "INR", pct: clamp((contribs.inr / total) * 100, 0, 100) },
        { label: "Creat", pct: clamp((contribs.creat / total) * 100, 0, 100) },
      ],
    };
  }, [f]);

  const ctp = useMemo(() =>
    (f.bili !== "" && f.albumin !== "" && f.inr !== "")
      ? calcChildPugh(f.bili, f.albumin, f.inr, f.ascites, f.hepEnceph)
      : null,
    [f.bili, f.albumin, f.inr, f.ascites, f.hepEnceph]
  );

  const bmi = (f.weightKg !== "" && f.heightCm !== "")
    ? parseFloat(f.weightKg) / Math.pow(parseFloat(f.heightCm) / 100, 2)
    : null;
  const bmiLabel = bmi === null ? null
    : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : bmi < 40 ? "Obese" : "Severe obesity";

  const naVal = parseFloat(f.na) || null;
  const spo2Val = parseFloat(f.spo2) || null;
  const plts = parseFloat(f.platelets) || null;
  const fib = parseFloat(f.fibrinogen) || null;
  const rTime = parseFloat(f.tegR) || null;
  const ma = parseFloat(f.tegMA) || null;
  const ly30 = parseFloat(f.tegLY30) || null;

  const coagIssues = [
    plts !== null && plts < 50 && "Platelets <50k",
    fib !== null && fib < 100 && "Fibrinogen <100 mg/dL",
    rTime !== null && rTime > 10 && "TEG R-time prolonged (clotting factor deficiency)",
    ma !== null && ma < 50 && "TEG MA low (platelet dysfunction / thrombocytopenia)",
    ly30 !== null && ly30 > 3 && "TEG LY30 >3% — hyperfibrinolysis (critical: antifibrinolytic needed)",
  ].filter(Boolean);

  const hyperFib = ly30 !== null && ly30 > 3;
  const significantCoag = coagIssues.length > 0;

  // ── Cardiac workup ──────────────────────────────────────────────────────
  const cardiacRisk = (parseFloat(f.age) >= 50) || f.cad || f.diabetes || f.exertional || f.smoking || f.lvoto;
  const cardiacWorkup = [
    "12-lead ECG (QT prolongation common in cirrhosis)",
    "TTE with estimated PASP, RVSP, EF, and LVOT assessment",
  ];
  if (cardiacRisk) cardiacWorkup.push(
    "Dobutamine stress echo (DSE) — note: sensitivity only ~25–41% for CAD in ESLD (Cleveland Clinic / Mayo data); low threshold for coronary angiography if multiple risk factors"
  );
  if (f.cad || f.exertional) cardiacWorkup.push(
    "Coronary angiography preferred over DSE alone when CAD is suspected (AASLD / ACC-AHA threshold low in ESLD)"
  );
  if (f.lvoto) cardiacWorkup.push(
    "LVOTO noted on echo — prevalence 24.3% in LT candidates; requires fluid resuscitation NOT inotropes; avoid dobutamine if LVOTO present"
  );
  if (f.afib) cardiacWorkup.push(
    "Atrial fibrillation workup: rate vs rhythm strategy; DOACs preferred over VKA in cirrhosis; avoid Class I/III antiarrhythmics with prolonged QT"
  );

  // ── Pulmonary workup ──────────────────────────────────────────────────
  const pulmWorkup = ["ABG on room air + CXR"];
  if (f.hpsSigns || (spo2Val !== null && spo2Val < 96))
    pulmWorkup.push("Bubble (agitated saline contrast) echo to screen for intrapulmonary shunting (HPS)");
  if (f.hpsSigns)
    pulmWorkup.push("Tc-99m MAA scan to quantify shunt fraction if bubble echo positive (shunt >20% + PaO2 <50 mmHg = high post-LT mortality risk)");
  if (f.highRVSP)
    pulmWorkup.push("Right heart catheterization mandatory — confirm/exclude PoPH before listing (mPAP >35 with PVR >240 = high risk; mPAP >50 = contraindication without treatment)");
  if (f.copd) pulmWorkup.push("PFTs + pulmonology consult");

  // ── Red flags ────────────────────────────────────────────────────────
  const redFlags = [];
  if (hasLabs && meldNa >= 30) redFlags.push({ text: `MELD-Na ${meldNa} ≥30 — very high perioperative mortality; plan ICU-level monitoring, early MTP activation, and CRRT availability`, level: "high" });
  if (ctp && ctp.cls === "C") redFlags.push({ text: `Child-Pugh Class C (${ctp.pts} pts) — elective surgery contraindicated; abdominal surgery mortality 76–82%`, level: "high" });
  if (f.highRVSP) redFlags.push({ text: "Elevated RVSP/PASP — RHC required before proceeding; severe PoPH (mPAP >50) is a relative contraindication without pulmonary vasodilator therapy", level: "high" });
  if (f.hpsSigns && spo2Val !== null && spo2Val < 90) redFlags.push({ text: "SpO2 <90% RA with HPS signs — severe HPS; prioritize listing; expect post-LT hypoxemia worsening (6–21% incidence; 45% mortality); prepare NO/epoprostenol/ECMO plan", level: "high" });
  if (f.lowEF) redFlags.push({ text: "Reduced LVEF — cirrhotic cardiomyopathy may be masked by vasodilated state; high output state may normalize EF; invasive hemodynamic monitoring mandatory", level: "high" });
  if (f.lvoto) redFlags.push({ text: "LVOTO present — intraoperative hemodynamic collapse risk; avoid vasodilators and inotropes; phenylephrine + fluids preferred vasopressor strategy", level: "high" });
  if (naVal !== null && naVal < 125) redFlags.push({ text: `Na ${naVal} mEq/L — profound hyponatremia; ODS risk if Na rises >8–10 mEq/L/24h intraoperatively; consider pre-LT CRRT-based gradual correction; monitor Na q1–2h intraoperatively`, level: "high" });
  if (naVal !== null && naVal >= 125 && naVal < 130) redFlags.push({ text: `Na ${naVal} mEq/L — intraoperative Na <130 is independent predictor of 1-year mortality (Yang et al.); strict perioperative Na monitoring required`, level: "med" });
  if (f.varicealBleed) redFlags.push({ text: "Variceal bleed history — crossmatch ≥4 units pRBC; TEG/ROTEM-guided resuscitation; have MTP packs available immediately", level: "high" });
  if (f.dialysis || f.aki) redFlags.push({ text: "Renal dysfunction — coordinate intraoperative CRRT availability; avoid nephrotoxins; track lactate and urine output closely; combined kidney-liver transplant (CKLT) consideration if AKI >6 weeks", level: "med" });
  if (f.cad) redFlags.push({ text: "Known CAD — cangrelor bridge may be needed if recent PCI/DES within 3 months (Houston Methodist protocol); coordinate with cardiology on DAPT interruption", level: "high" });
  if (f.dcdOrgan) redFlags.push({ text: "DCD allograft — post-reperfusion syndrome (PRS) incidence higher vs. NMP (42% SCS vs. 11% NMP); have epinephrine + vasopressin boluses prepared; anticipate higher transfusion requirements (Mayo 2025)", level: "med" });
  if (f.afib) redFlags.push({ text: "Atrial fibrillation — post-LT AF incidence 6.8–10.2%; avoid amiodarone if possible (hepatotoxic); DOACs preferred if anticoagulation needed post-LT", level: "med" });
  if (hyperFib) redFlags.push({ text: "Hyperfibrinolysis on TEG (LY30 >3%) — administer tranexamic acid now; anticipate massive coagulopathic hemorrhage; this is the most lethal coag pattern in liver transplant", level: "high" });
  if (f.opioidTolerance) redFlags.push({ text: "Opioid tolerance / SUD — substantially higher analgesic requirements; withdrawal risk; MOUD (buprenorphine/methadone) must continue perioperatively; involve pain/addiction medicine preop", level: "med" });
  if (bmiLabel === "Severe obesity") redFlags.push({ text: "BMI ≥40 — anticipated difficult airway; vascular access challenges; OSA risk with opioids postop; video laryngoscopy planned; opioid-sparing mandatory", level: "med" });

  // ── Intraop monitoring ───────────────────────────────────────────────
  const monitoring = [
    "Arterial line (radial preferred) before induction — beat-to-beat BP essential",
    "Large-bore peripheral IV ×2 + rapid infusion catheter (RIC) or introducer sheath",
    "Central venous access (IJ or subclavian) — CVP trending, vasoactive drug delivery",
    "TEE intraoperatively — monitor RV/LV function, volume status, detect air embolism at reperfusion",
    "Serial TEG/ROTEM q30–60 min — guide product administration by clot mechanics not by standard coag labs",
    "Continuous temperature monitoring — hypothermia exacerbates coagulopathy and prolongs drug clearance",
    "Urine output hourly + lactate q60 min during anhepatic and reperfusion phases",
    "Serum sodium q1–2h intraoperatively — avoid rise >8 mEq/L in 24h (ODS risk)",
  ];
  if (f.highRVSP || f.hpsSigns) monitoring.push("Consider PA catheter or advanced hemodynamic monitoring (PiCCO/FloTrac) if PoPH or severe HPS");
  if (f.vvbAnticipated) monitoring.push("VVB circuit primed and perfusionist available; cannula sites accessed preoperatively; watch for air embolism and line thrombosis");

  // ── Management plan ──────────────────────────────────────────────────
  const mgmt = {
    induction: [
      "Modified RSI — aspiration risk from ascites/gastroparesis",
      "Avoid succinylcholine if severe hyperkalemia or AKI; use rocuronium 1.2 mg/kg",
      "Etomidate or ketamine for induction in hemodynamically compromised patients — avoid propofol bolus if EF low",
      "Reduce opioid induction dose proportionally to hepatic clearance impairment",
    ],
    phases: [
      "Dissection phase: volume-resuscitate to MAP ≥65; vasopressin as first-line vasopressor (portal hypertension benefit); avoid excessive crystalloid",
      "Anhepatic phase: IVC clamping drops preload 30–50% — have phenylephrine/norepinephrine drawn up; monitor K+ q15–20 min (no liver to buffer K+ from blood products)",
      f.lvoto
        ? "Anhepatic: LVOTO risk — use phenylephrine + fluids; avoid dobutamine; titrate to volume first"
        : "Anhepatic: maintain SVR with phenylephrine or vasopressin; limit vasodilators",
      "Pre-reperfusion: calcium chloride 1g IV, sodium bicarbonate or THAM for acidosis (THAM preferred if Na already elevated — no CO2 generation, no hypernatremia per Mayo 2023 review); warm all blood products",
      "Reperfusion: be prepared for PRS (MAP drop >30% from baseline for >1 min in 30% of cases); epinephrine 10–50 mcg boluses ready; vasopressin infusion; calcium repeat dose",
      f.dcdOrgan ? "DCD reperfusion: PRS incidence ~42% with cold storage — higher vasoactive and transfusion requirements; NMP organs have significantly lower PRS risk (Mayo 2025)" : "DBD reperfusion: PRS still occurs in ~30%; standard preparation applies",
    ],
    coag: [
      "TEG-guided transfusion only — avoid FFP/platelets/cryo based on PT/INR alone (standard labs unreliable in ESLD)",
      "R-time >10 min: FFP or 4F-PCC if volume-restricted",
      "MA <50 mm: platelet transfusion if count <50k; cryoprecipitate if fibrinogen <150 mg/dL",
      hyperFib ? "LY30 >3%: administer TXA 1g IV immediately; consider epsilon-aminocaproic acid (EACA) if TXA unavailable — this is life-threatening hyperfibrinolysis" : "Monitor LY30 — if rises >3% at or after reperfusion, administer TXA 1g IV stat",
      "Goal Hgb ≥8 intraop; avoid over-transfusion (portal pressure worsens with high hematocrit)",
    ],
    fluids: [
      "Balanced crystalloid (Plasmalyte preferred) over NS — NS worsens hyperchloremic acidosis; avoid large Na load if pre-existing hyponatremia",
      "Albumin 20–25% for volume support and oncotic pressure (replaces endogenous albumin synthesis loss)",
      "THAM (0.3M) for metabolic acidosis when Na correction is a concern — target pH >7.2 intraop",
      "Track lactate clearance post-reperfusion as marker of new graft function",
    ],
  };

  // ── Post-reperfusion HPS algorithm (from Nayyar et al. AJT 2015) ──
  const hpsAlgo = f.hpsSigns ? [
    "Maintain FiO2 1.0 intraoperatively; avoid hypoxia <88%",
    "Step 1: Trendelenburg positioning — redistributes perfusion away from lung bases where shunts predominate",
    "Step 2: Inhaled epoprostenol (iEPO) 25–50 ng/kg/min or inhaled nitric oxide (iNO) 20–40 ppm",
    "Step 3: IV methylene blue 1.5–2 mg/kg if refractory (NO pathway inhibitor)",
    "Step 4: Embolization of large pulmonary arteriovenous malformations by IR if identified",
    "Step 5: ECMO (VA or VV) — plan ECMO access preoperatively in PaO2 <50 mmHg with shunt >20%",
    "Most HPS resolves 6–12 months post-LT; counsel patient re: prolonged ICU stay",
  ] : null;

  // ── Pain management ──────────────────────────────────────────────────
  const pain = [
    "Acetaminophen 650–1000mg q6–8h scheduled — safe in preserved synthetic function; reduce dose or avoid if severe hepatic failure (risk of accumulation)",
    "Avoid NSAIDs — renal prostaglandin inhibition → precipitates hepatorenal syndrome",
    "Opioid selection: fentanyl or hydromorphone preferred; avoid morphine (M6G accumulates in renal failure); avoid codeine (CYP2D6 unpredictable in cirrhosis)",
    significantCoag
      ? "Neuraxial/regional deferred until coagulopathy corrected — ASRA 2018: platelets >80k, INR <1.5 minimum for epidural; use systemic multimodal analgesia in interim"
      : "Fascial plane blocks (rectus sheath, ESP) appropriate if coagulation acceptable at time of placement — coagulopathy must be reassessed on day of procedure",
    f.opioidTolerance
      ? "Opioid-tolerant patient: continue MOUD (buprenorphine/methadone) perioperatively — abrupt discontinuation causes withdrawal AND paradoxical pain sensitization; coordinate with addiction medicine pre-LT"
      : "Opioid-naive: start low, titrate carefully — hepatic clearance is unpredictable; avoid PCA with lockout in encephalopathy",
    "IV ketamine infusion 0.1–0.3 mg/kg/h — opioid-sparing, NMDA antagonism; especially useful in opioid-tolerant patients or those with baseline high pain",
    "Dexmedetomidine infusion — opioid-sparing, anxiolytic, reduces emergence delirium; caution with bradycardia if baseline HR already low",
    f.opioidTolerance ? "Gabapentin 300–600mg preoperatively (single dose) if no encephalopathy — reduces opioid requirements; use cautiously, not chronically post-LT" : null,
    "Reassess analgesic plan post-reperfusion — new hepatic metabolism resumes; drug clearance improves rapidly; down-titrate infusions",
    bmiLabel === "Obese" || bmiLabel === "Severe obesity"
      ? "Obesity: maximize opioid-sparing regimen; postop continuous pulse oximetry mandatory; CPAP if OSA known"
      : null,
  ].filter(Boolean);

  // ── VVB ──────────────────────────────────────────────────────────────
  const vvbNotes = f.vvbAnticipated ? [
    "VVB used in <3% of modern LT cases (Austin Health series 2024) — reserve for hemodynamic instability on test clamping",
    "Circuit: femoral vein + portal vein → internal jugular; Biomedicus centrifugal pump; Plasmalyte flush at 100–150 mL/h to prevent clotting",
    "Complications: air embolism, DVT, lymphocele, infection, biliary stricture (33% vs 8% non-VVB)",
    "Intraoperative decision: test-clamp IVC first; if MAP drops >30% or cardiac output falls >50% → initiate VVB",
  ] : null;

  const tabStyle = (t) =>
    `px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${tab === t ? "bg-[#4DD8C9] text-[#0B141C]" : "text-[#8FA3B3] hover:text-[#E6EEF2]"}`;

  return (
    <div className="min-h-screen bg-[#0B141C] text-[#E6EEF2] font-sans pb-16">
      <div className="max-w-6xl mx-auto px-3 py-5 sm:px-6">

        {/* Header */}
        <header className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#4DD8C9] mb-1">MELD+</p>
          <h1 className="text-xl sm:text-2xl font-semibold">Perioperative Risk Brief for Liver Transplant Anesthesia</h1>
          <p className="text-xs text-[#8FA3B3] mt-1">Evidence-based · Corewell Health William Beaumont · Adelmann/Ramsay · Bezinover · Nayyar · Mayo 2025 · ASRA 2018</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button className={tabStyle("input")} onClick={() => setTab("input")}>Patient Data</button>
          <button className={tabStyle("results")} onClick={() => setTab("results")}>Risk Brief</button>
          <button className={tabStyle("plan")} onClick={() => setTab("plan")}>Management Plan</button>
        </div>

        {/* ── TAB: Input ── */}
        {tab === "input" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Labs */}
            <Card>
              <SecTitle icon={Activity} label="Core Labs" color="#4DD8C9" />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Age (yrs)"><NInput placeholder="58" value={f.age} onChange={set("age")} /></Field>
                <Field label="Sodium (mEq/L)"><NInput placeholder="136" value={f.na} onChange={set("na")} /></Field>
                <Field label="Total bilirubin (mg/dL)"><NInput placeholder="2.1" value={f.bili} onChange={set("bili")} /></Field>
                <Field label="INR"><NInput placeholder="1.4" value={f.inr} onChange={set("inr")} /></Field>
                <Field label="Creatinine (mg/dL)"><NInput placeholder="1.0" value={f.creat} onChange={set("creat")} /></Field>
                <Field label="Albumin (g/dL)"><NInput placeholder="3.2" value={f.albumin} onChange={set("albumin")} /></Field>
                <Field label="SpO₂ room air (%)"><NInput placeholder="97" value={f.spo2} onChange={set("spo2")} /></Field>
              </div>
              <div className="mt-2 space-y-0.5">
                <Check label="On dialysis (≥2× in past week)" checked={f.dialysis} onChange={set("dialysis")} />
                <Check label="Active AKI" checked={f.aki} onChange={set("aki")} />
                <Check label="Pre-LT hyponatremia being corrected" checked={f.hyponaPreop} onChange={set("hyponaPreop")} />
              </div>
            </Card>

            {/* Body + Portal */}
            <Card>
              <SecTitle icon={Scale} label="Body & Portal Hx" color="#C9A8FF" />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Field label="Weight (kg)"><NInput placeholder="90" value={f.weightKg} onChange={set("weightKg")} /></Field>
                <Field label="Height (cm)"><NInput placeholder="175" value={f.heightCm} onChange={set("heightCm")} /></Field>
              </div>
              {bmi !== null && (
                <div className="text-xs text-[#8FA3B3] mb-2">BMI <span className="font-mono text-[#E6EEF2]">{bmi.toFixed(1)}</span> — {bmiLabel}</div>
              )}
              <Field label="Ascites">
                <Select value={f.ascites} onChange={set("ascites")} options={[["none","None"],["mild","Mild"],["moderate_severe","Moderate / Severe / Refractory"]]} />
              </Field>
              <div className="mt-2 space-y-0.5">
                <Check label="History of variceal bleed" checked={f.varicealBleed} onChange={set("varicealBleed")} />
              </div>
              <Field label="Hepatic encephalopathy" >
                <Select value={f.hepEnceph} onChange={set("hepEnceph")} options={[["none","None"],["12","Grade 1–2"],["34","Grade 3–4"]]} />
              </Field>
            </Card>

            {/* Cardiac */}
            <Card>
              <SecTitle icon={Heart} label="Cardiac Hx" color="#FF9A5A" />
              <div className="space-y-0.5">
                <Check label="Known CAD / prior MI / PCI" checked={f.cad} onChange={set("cad")} />
                <Check label="Atrial fibrillation" checked={f.afib} onChange={set("afib")} />
                <Check label="Diabetes mellitus" checked={f.diabetes} onChange={set("diabetes")} />
                <Check label="Exertional dyspnea / chest pain" checked={f.exertional} onChange={set("exertional")} />
                <Check label="Known reduced LVEF (<55%)" checked={f.lowEF} onChange={set("lowEF")} />
                <Check label="LVOTO on prior echo" checked={f.lvoto} onChange={set("lvoto")} sub="(24% prevalence in ESLD — needs fluids not inotropes)" />
                <Check label="Current / former smoker" checked={f.smoking} onChange={set("smoking")} />
              </div>
            </Card>

            {/* Pulmonary */}
            <Card>
              <SecTitle icon={Wind} label="Pulmonary / HPS / PoPH" color="#7CC4FF" />
              <div className="space-y-0.5">
                <Check label="Known COPD / restrictive lung disease" checked={f.copd} onChange={set("copd")} />
                <Check label="Platypnea-orthodeoxia / spider angiomata + dyspnea" checked={f.hpsSigns} onChange={set("hpsSigns")} sub="Screens positive for HPS — bubble echo required" />
                <Check label="Elevated RVSP / PASP on prior echo" checked={f.highRVSP} onChange={set("highRVSP")} sub="Must rule out PoPH with RHC before listing" />
              </div>
            </Card>

            {/* Coag / TEG */}
            <Card>
              <SecTitle icon={Droplet} label="Coag / TEG Profile" color="#FF6B6B" />
              <p className="text-[10px] text-[#8FA3B3] mb-2">Leave blank if not available — app adapts</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Platelets (×10³/µL)"><NInput placeholder="80" value={f.platelets} onChange={set("platelets")} /></Field>
                <Field label="Fibrinogen (mg/dL)"><NInput placeholder="150" value={f.fibrinogen} onChange={set("fibrinogen")} /></Field>
                <Field label="TEG R-time (min)"><NInput placeholder="6" value={f.tegR} onChange={set("tegR")} /></Field>
                <Field label="TEG MA (mm)"><NInput placeholder="55" value={f.tegMA} onChange={set("tegMA")} /></Field>
                <Field label="TEG LY30 (%)"><NInput placeholder="1" value={f.tegLY30} onChange={set("tegLY30")} /></Field>
              </div>
            </Card>

            {/* Drug / Pain */}
            <Card>
              <SecTitle icon={Pill} label="Drug Hx & Pain Profile" color="#C9A8FF" />
              <div className="space-y-0.5">
                <Check label="Chronic opioid use / opioid tolerance" checked={f.opioidTolerance} onChange={set("opioidTolerance")} />
                <Check label="Alcohol use disorder (active or recent)" checked={f.alcohol} onChange={set("alcohol")} sub="Acute alcohol hepatitis = contraindication to elective LT" />
                <Check label="Benzodiazepine use / dependence" checked={f.benzoUse} onChange={set("benzoUse")} sub="Withdrawal risk; worsens encephalopathy" />
              </div>
              <div className="mt-3">
                <SecTitle icon={Zap} label="Surgical Factors" color="#FFC857" />
                <Check label="DCD (donation after circulatory death) organ" checked={f.dcdOrgan} onChange={set("dcdOrgan")} sub="Higher PRS risk; more vasoactive support needed" />
                <Check label="VVB anticipated / planned" checked={f.vvbAnticipated} onChange={set("vvbAnticipated")} sub="IVC test clamp first; selective modern use only" />
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB: Risk Brief ── */}
        {tab === "results" && (
          <div className="space-y-4">

            {/* Score row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* MELD-Na */}
              <div className="col-span-2 rounded-xl p-4 border"
                style={{ backgroundColor: hasLabs ? tier.bg : "#101D29", borderColor: hasLabs ? tier.ring : "#1F3645" }}>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase tracking-wider text-[#8FA3B3]">MELD-Na</span>
                  {hasLabs && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{ color: tier.text, borderColor: tier.ring }}>{tier.label} Risk</span>
                  )}
                </div>
                <div className="font-mono text-5xl font-bold mt-1" style={{ color: hasLabs ? tier.text : "#46606E" }}>
                  {hasLabs ? meldNa : "—"}
                </div>
                {hasLabs && <>
                  <div className="text-[10px] text-[#8FA3B3]">MELD (unadjusted): {meld}</div>
                  <div className="mt-2 flex h-1.5 rounded-full overflow-hidden bg-[#0E1A24]">
                    {breakdown.map((b, i) => (
                      <div key={b.label} title={`${b.label}: ${b.pct.toFixed(0)}%`}
                        style={{ width: `${b.pct}%`, backgroundColor: ["#4DD8C9", "#FFC857", "#FF9A5A"][i] }} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-[#8FA3B3] mt-0.5">
                    {breakdown.map(b => <span key={b.label}>{b.label} {b.pct.toFixed(0)}%</span>)}
                  </div>
                  {naVal !== null && naVal < 130 && (
                    <div className="text-[10px] mt-1.5 text-[#FFE4A0]">⚠ Na {naVal} — intraop Na &lt;130 = independent 1-year mortality predictor (Yang et al.)</div>
                  )}
                </>}
                {!hasLabs && <p className="text-xs text-[#8FA3B3] mt-2">Enter bili, INR, creatinine to calculate.</p>}
              </div>

              {/* Child-Pugh */}
              <div className="rounded-xl p-4 border border-[#1F3645] bg-[#101D29]">
                <span className="text-[10px] uppercase tracking-wider text-[#8FA3B3]">Child-Pugh</span>
                <div className="font-mono text-4xl font-bold mt-1"
                  style={{ color: ctp ? CTP_COLORS[ctp.cls] : "#46606E" }}>
                  {ctp ? `${ctp.cls}` : "—"}
                </div>
                {ctp && <>
                  <div className="text-[10px] text-[#8FA3B3]">{ctp.pts} pts</div>
                  <div className="text-[10px] mt-1" style={{ color: CTP_COLORS[ctp.cls] }}>Abdom. surgery mortality: {ctp.mort}</div>
                </>}
                {!ctp && <p className="text-[10px] text-[#8FA3B3] mt-1">Needs bili, albumin, INR + ascites + enceph.</p>}
              </div>

              {/* BMI */}
              <div className="rounded-xl p-4 border border-[#1F3645] bg-[#101D29]">
                <span className="text-[10px] uppercase tracking-wider text-[#8FA3B3]">BMI</span>
                <div className="font-mono text-4xl font-bold mt-1 text-[#E6EEF2]">
                  {bmi !== null ? bmi.toFixed(1) : "—"}
                </div>
                {bmi !== null && <div className="text-[10px] mt-1 text-[#8FA3B3]">{bmiLabel}</div>}
              </div>
            </div>

            {/* Coag summary */}
            {coagIssues.length > 0 && (
              <Card>
                <SecTitle icon={Droplet} label="Coag / TEG Findings" color="#FF6B6B" />
                <div className="space-y-1">
                  {coagIssues.map(c => <Flag key={c} text={c} level={c.includes("hyperfibrinolysis") ? "high" : "med"} />)}
                </div>
              </Card>
            )}

            {/* Red flags */}
            <Card>
              <SecTitle icon={AlertTriangle} label="Red Flags" color="#FF6B6B" />
              {redFlags.length === 0
                ? <p className="text-xs text-[#8FA3B3]">No red flags from current inputs.</p>
                : <div className="space-y-1.5">{redFlags.map((r, i) => <Flag key={i} text={r.text} level={r.level} />)}</div>
              }
            </Card>

            {/* Workup */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <SecTitle icon={Heart} label="Cardiac Workup" color="#FF9A5A" />
                <ul className="space-y-1">{cardiacWorkup.map(w => <Bullet key={w} text={w} />)}</ul>
              </Card>
              <Card>
                <SecTitle icon={Wind} label="Pulmonary Workup" color="#7CC4FF" />
                <ul className="space-y-1">{pulmWorkup.map(w => <Bullet key={w} text={w} />)}</ul>
              </Card>
            </div>

            {/* Monitoring */}
            <Card>
              <SecTitle icon={Activity} label="Intraoperative Monitoring" color="#4DD8C9" />
              <ul className="space-y-1">{monitoring.map(m => <Bullet key={m} text={m} />)}</ul>
            </Card>
          </div>
        )}

        {/* ── TAB: Management Plan ── */}
        {tab === "plan" && (
          <div className="space-y-3">

            <Collapsible title="Induction Strategy" icon={Activity} color="#4DD8C9" defaultOpen>
              <ul className="space-y-1">{mgmt.induction.map(m => <Bullet key={m} text={m} />)}</ul>
            </Collapsible>

            <Collapsible title="Surgical Phases — Hemodynamic Plan" icon={Heart} color="#FF9A5A" defaultOpen>
              <ul className="space-y-1">{mgmt.phases.map(m => <Bullet key={m} text={m} />)}</ul>
            </Collapsible>

            <Collapsible title="TEG-Guided Coagulation Management" icon={Droplet} color="#FF6B6B" defaultOpen>
              <ul className="space-y-1">{mgmt.coag.map(m => <Bullet key={m} text={m} />)}</ul>
            </Collapsible>

            <Collapsible title="Fluid, Acid-Base & Electrolyte Strategy" icon={Zap} color="#FFC857">
              <ul className="space-y-1">{mgmt.fluids.map(m => <Bullet key={m} text={m} />)}</ul>
            </Collapsible>

            <Collapsible title="Pain Management Strategy" icon={Pill} color="#C9A8FF">
              <ul className="space-y-1">{pain.map(m => <Bullet key={m} text={m} />)}</ul>
            </Collapsible>

            {hpsAlgo && (
              <Collapsible title="HPS — Post-Reperfusion Hypoxemia Algorithm (Nayyar et al. AJT 2015)" icon={Wind} color="#7CC4FF" defaultOpen>
                <ul className="space-y-1">{hpsAlgo.map(m => <Bullet key={m} text={m} />)}</ul>
              </Collapsible>
            )}

            {vvbNotes && (
              <Collapsible title="Veno-Venous Bypass (VVB)" icon={Activity} color="#FFC857">
                <ul className="space-y-1">{vvbNotes.map(m => <Bullet key={m} text={m} />)}</ul>
              </Collapsible>
            )}

            <Collapsible title="Reference Sources (Your Drive)" icon={BookOpen} color="#8FA3B3">
              <ul className="space-y-1 text-[#8FA3B3]">
                {[
                  "Adelmann D, Kronish K, Ramsay MA — Anesthesia for Liver Transplantation. Anesthesiology Clin 2017",
                  "Starczewska MH et al — Anaesthesia in patients with liver disease. Curr Opin Anesthesiol 2017",
                  "Verbeek TA, Bezinover D et al — Hyponatremia and Liver Transplantation. JCVA 2022 (Penn State/Hershey)",
                  "Yang SM et al — Intraoperative hyponatremia predicts 1-year mortality after LT. Sci Rep 2018",
                  "Nayyar D et al — Management Algorithm for Severe Hypoxemia after LT in HPS. AJT 2015",
                  "Stoker AD et al — DCD LT: Impact of Normothermic Machine Perfusion. Anesth Analg 2025 (Mayo)",
                  "Weinberg L et al — Venovenous bypass in adult LT recipients. PLOS ONE 2024",
                  "Tiwari N et al — Diagnostic accuracy of cardiac testing in LT recipients. IJC 2021",
                  "Cailes B, Farouque O et al — LVOTO in LT: Prevalence, Predictors, Outcomes. Transplantation 2021",
                  "Vandenberk B et al — AFib in cirrhosis and portal hypertension. Aliment Pharmacol Ther 2022",
                  "Radosevich MA et al — THAM in Critically Ill Adults. Anesth Analg 2023 (Mayo)",
                  "Succar L et al — Perioperative cangrelor in LT after recent PCI. Pharmacotherapy 2022",
                  "Horlocker TT et al — ASRA Regional Anesthesia Guidelines (4th Ed). Reg Anesth Pain Med 2018",
                  "Liver Resident Review — University of Florida Dept Anesthesiology 2016",
                  "Janicki PK, Thompson RS — Liver Risk Preop Anesth Grand Rounds. PSU Hershey 2013",
                ].map(r => <li key={r} className="text-[10px] leading-relaxed">{r}</li>)}
              </ul>
            </Collapsible>

          </div>
        )}

        <footer className="text-[10px] text-[#46606E] mt-8 text-center">
          Clinical decision support tool — not a substitute for clinical judgment, formal RHC data, or institutional protocols. MELD+ · Built for Corewell Health William Beaumont Liver Transplant Program.
        </footer>
      </div>
    </div>
  );
}
