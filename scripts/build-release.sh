#!/usr/bin/env bash
# Build signed release artifacts for both platforms.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "  → building web assets"
npm run build

echo "  → syncing native projects"
npx cap sync

case "${1:-both}" in
  android|both)
    if [ ! -f android/keystore.properties ]; then
      echo "  ✗ android/keystore.properties missing — run ./scripts/generate-keystore.sh first"
      exit 1
    fi
    echo "  → building signed .aab"
    (cd android && ./gradlew bundleRelease)
    echo "  ✓ android/app/build/outputs/bundle/release/app-release.aab"
    ;;
esac

case "${1:-both}" in
  ios|both)
    echo "  → opening Xcode — then: Product → Archive → Distribute → App Store Connect"
    npx cap open ios
    ;;
esac
