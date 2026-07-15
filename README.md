# MELD+ · Perioperative Risk Brief

Clinical decision support for the liver transplant team.

**Live web app** → https://saifeldin676.github.io/liver-transplant-risk-brief/
**Privacy** → https://saifeldin676.github.io/liver-transplant-risk-brief/privacy/
**Support** → https://saifeldin676.github.io/liver-transplant-risk-brief/support/

**Bundle ID / Package:** `com.meldplus.app` · **Version** 1.0.0 (build 1)

---

## Features

- **MELD 3.0 + MELD-Na** side by side with prognosis (90-day survival, 3-month mortality, Child-Pugh)
- **Intraoperative CRRT** threshold engine — K⁺, pH, HCO₃, lactate, CVP, UOP with full fluid protocol
- **UNOS reference** — Status 1A/1B, Status 7, acuity circles, MELD exception values
- **Cardiac / pulmonary workup** — DSE limitations in ESLD, LVOTO, HPS, PoPH
- **TEG-guided coagulation** — R-time, MA, LY30 with targeted product guidance
- **Management plan** — induction, surgical phases, fluids/acid-base, pain, positioning, equipment
- **Privacy by design** — no storage, no transmission, no analytics, works offline

## Build

```bash
npm install
npm run build

# iOS (requires Xcode on macOS)
npx cap sync ios && npx cap open ios

# Android (requires Android Studio)
npx cap sync android && npx cap open android
```

## Stack

React 18 · Vite · Tailwind · Capacitor 8 · Lucide

## Intended use

Clinical decision support for licensed medical professionals. Does not replace clinical
judgment, institutional protocol, or current OPTN policy. Verify allocation and listing
questions at [optn.transplant.hrsa.gov](https://optn.transplant.hrsa.gov).
