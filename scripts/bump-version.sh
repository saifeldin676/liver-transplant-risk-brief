#!/usr/bin/env bash
# Bump version across package.json, iOS, and Android together.
#   ./scripts/bump-version.sh 1.0.1
set -euo pipefail

[ $# -eq 1 ] || { echo "usage: $0 <version>   e.g. $0 1.0.1"; exit 1; }
VER="$1"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Android versionCode must strictly increase on every upload
CUR=$(grep -oE 'versionCode [0-9]+' "$ROOT/android/app/build.gradle" | grep -oE '[0-9]+')
NEXT=$((CUR + 1))

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
  plutil -replace CFBundleShortVersionString -string "$VER"  "$PLIST"
  plutil -replace CFBundleVersion            -string "$NEXT" "$PLIST"
fi

echo "  ✓ version $VER · build $NEXT  (package.json, iOS, Android)"
