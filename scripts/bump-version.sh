#!/usr/bin/env bash
# Bump version across package.json, iOS, and Android together.
#   ./scripts/bump-version.sh 1.0.1
set -euo pipefail

[ $# -eq 1 ] || { echo "usage: $0 <version>   e.g. $0 1.0.1"; exit 1; }
VER="$1"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Android versionCode must strictly increase on every upload.
# NOTE: CI (.github/workflows/android.yml) overrides this with 1000 + run_number
# at build time; the local value only matters for a hand-built AAB.
CUR=$(grep -oE 'versionCode [0-9]+' "$ROOT/android/app/build.gradle" | grep -oE '[0-9]+')
NEXT=$((CUR + 1))

# The iOS build number is a SEPARATE counter — it must exceed the highest build
# already uploaded to App Store Connect, which has nothing to do with the Android
# versionCode. Deriving one from the other produced a build number below the
# shipped one and an upload rejection. Read the current iOS value and increment it.
IOS_CUR=$(grep -oE 'CURRENT_PROJECT_VERSION = [0-9]+' "$ROOT/ios/App/App.xcodeproj/project.pbxproj" | grep -oE '[0-9]+' | sort -n | tail -1)
IOS_NEXT=$((IOS_CUR + 1))

sed -i.bak -E "s/versionCode [0-9]+/versionCode $NEXT/"        "$ROOT/android/app/build.gradle"
sed -i.bak -E "s/versionName \"[^\"]+\"/versionName \"$VER\"/" "$ROOT/android/app/build.gradle"
rm -f "$ROOT/android/app/build.gradle.bak"

node -e "
  const fs=require('fs'), p='$ROOT/package.json';
  const j=JSON.parse(fs.readFileSync(p)); j.version='$VER';
  fs.writeFileSync(p, JSON.stringify(j,null,2)+'\n');
"

if command -v plutil >/dev/null 2>&1; then
  PLIST="$ROOT/ios/App/App/Info.plist"
  plutil -replace CFBundleShortVersionString -string "$VER"      "$PLIST"
  plutil -replace CFBundleVersion            -string "$IOS_NEXT" "$PLIST"
fi

# Keep the Xcode build settings in step with the plist.
if [ -f "$ROOT/ios/App/App.xcodeproj/project.pbxproj" ]; then
  sed -i.bak -E "s/MARKETING_VERSION = [0-9.]+;/MARKETING_VERSION = $VER;/" \
    "$ROOT/ios/App/App.xcodeproj/project.pbxproj"
  sed -i.bak -E "s/CURRENT_PROJECT_VERSION = [0-9]+;/CURRENT_PROJECT_VERSION = $IOS_NEXT;/" \
    "$ROOT/ios/App/App.xcodeproj/project.pbxproj"
  rm -f "$ROOT/ios/App/App.xcodeproj/project.pbxproj.bak"
fi

echo "  ✓ version $VER"
echo "    iOS      build $IOS_NEXT   (must exceed the highest build in App Store Connect)"
echo "    Android  versionCode $NEXT (CI overrides with 1000 + run_number)"
