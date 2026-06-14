# MELD+ · Perioperative Risk Brief

> *Know the risk before you open.*

**Clinical decision support for the liver transplant team.**

[![Web App](https://img.shields.io/badge/Web_App-Live-4DD8C9?style=flat-square)](https://saifeldin676.github.io/liver-transplant-risk-brief/)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue?style=flat-square)](https://capacitorjs.com)
[![Version](https://img.shields.io/badge/Version-1.0.0-green?style=flat-square)]()

---

## What Is MELD+?

MELD+ is a point-of-care clinical decision support tool built for **liver transplant anesthesiologists**, **hepatologists**, and **transplant surgeons**. Enter patient labs and clinical history — get an instant, structured perioperative risk brief.

**No login. No data stored. Works offline.**

---

## Features

| Module | Details |
|--------|---------|
| **MELD-Na & Child-Pugh** | Live calculation with risk tier and score breakdown |
| **Cardiac Workup** | DSE limitation caveat, LVOTO management, AF/DOAC guidance, CAD thresholds |
| **Pulmonary Workup** | HPS bubble echo, Tc-99m MAA, RHC indications for PoPH |
| **TEG/Coag Profile** | R-time, MA, LY30 with targeted transfusion guidance |
| **Red Flags** | ODS, hyperfibrinolysis, severe PoPH, DCD organ, variceal bleed |
| **Hemodynamic Plan** | Phase-by-phase: dissection → anhepatic → reperfusion |
| **HPS Algorithm** | Post-reperfusion hypoxemia stepwise protocol (Nayyar AJT 2015) |
| **Pain Management** | Adapts to opioid tolerance, AKI, coagulopathy, obesity |
| **VVB Protocol** | Selective use criteria, circuit setup, Beaumont protocol |
| **Fluid/Acid-Base** | THAM vs. bicarb, Plasmalyte, Na correction strategy |

---

## Evidence Base

- Adelmann & Ramsay — *Anesthesia for Liver Transplantation* · Anesthesiology Clin 2017
- Verbeek, Bezinover et al. — *Hyponatremia and Liver Transplantation* · JCVA 2022
- Yang et al. — *Intraoperative Hyponatremia Predicts 1-Year Mortality* · Sci Rep 2018
- Nayyar et al. — *HPS Post-LT Hypoxemia Algorithm* · AJT 2015
- Stoker et al. — *DCD LT: NMP vs. Cold Storage* · Anesth Analg 2025 (Mayo)
- Cailes et al. — *LVOTO in Liver Transplant* · Transplantation 2021
- Radosevich et al. — *THAM in Critically Ill Adults* · Anesth Analg 2023 (Mayo)
- ASRA — *Regional Anesthesia in Antithrombotic Patients*, 4th Ed. 2018

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 18 + Tailwind CSS |
| Build | Vite |
| Mobile | Capacitor 8 (iOS + Android) |
| Web Deploy | GitHub Pages |
| Icons | Lucide React |

---

## Running Locally

```bash
git clone https://github.com/saifeldin676/liver-transplant-risk-brief.git
cd liver-transplant-risk-brief
npm install
npm run dev
```

## Building for Mobile

**Requirements:** Xcode (iOS) / Android Studio (Android)

```bash
# Install dependencies
npm install

# Build web assets + sync to native platforms
npm run cap:sync

# Open in Xcode (iOS)
npm run cap:ios

# Open in Android Studio (Android)
npm run cap:android
```

---

## Developer

**Saifeldin Ahmed Mahmoud, MD, PhD**
Triple board-certified: Adult Cardiac · Pediatric · Liver Transplant Anesthesia
Director of Liver Transplant Anesthesia — Corewell Health William Beaumont Hospital
Associate Professor, Anesthesiology & Perioperative Medicine — Penn State Hershey

---

## Disclaimer

MELD+ is a clinical decision support tool for use by licensed medical professionals.
It does not replace clinical judgment, institutional protocols, or formal diagnostic studies.

---

*© 2025 Saifeldin Ahmed Mahmoud, MD, PhD. All rights reserved.*
