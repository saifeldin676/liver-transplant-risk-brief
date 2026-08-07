#!/bin/bash
cd "$HOME/Developer/liver-transplant-risk-brief" || exit 1
echo "==================================================="
echo "  MELD+ v1.1 — Android release build"
echo "==================================================="
echo "[1/5] clearing stale git lock + committing source..."
rm -f .git/index.lock
git add -A
git commit -m "v1.1: smoking, BMI, PFT outcomes, frailty, composite risk, formula refs, zoom, new icon" || echo "  (nothing new to commit)"
echo "[2/5] building web assets (npm run build)..."
npm run build || { echo "WEB BUILD FAILED"; echo "Press any key to close."; read -n 1; exit 1; }
echo "[3/5] syncing Capacitor Android (npx cap sync android)..."
npx cap sync android || { echo "CAP SYNC FAILED"; echo "Press any key to close."; read -n 1; exit 1; }
echo "[4/5] building signed AAB (./gradlew bundleRelease)..."
cd android
./gradlew bundleRelease || { echo "GRADLE BUILD FAILED"; echo "Press any key to close."; read -n 1; exit 1; }
echo "[5/5] done."
echo "==================================================="
echo "  SIGNED AAB READY:"
ls -la app/build/outputs/bundle/release/*.aab
echo "==================================================="
echo ""
echo "  BUILD COMPLETE — tell Claude 'AAB is built'."
echo "  You can leave this window open."
echo ""
