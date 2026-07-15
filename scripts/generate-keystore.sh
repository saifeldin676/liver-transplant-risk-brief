#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  MELD+ · Android upload keystore generator
#  Run once, on your Mac. Never commit the output.
# ─────────────────────────────────────────────────────────────
set -euo pipefail

ALIAS="meldplus-upload"
KEYSTORE="$HOME/keys/meldplus-upload.jks"

echo ""
echo "  MELD+ · Android upload key"
echo "  ──────────────────────────"
echo ""

if ! command -v keytool >/dev/null 2>&1; then
  echo "  ✗ keytool not found."
  echo "    Install a JDK (Android Studio bundles one):"
  echo "    export PATH=\"/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin:\$PATH\""
  exit 1
fi

if [ -f "$KEYSTORE" ]; then
  echo "  ✗ A keystore already exists at:"
  echo "    $KEYSTORE"
  echo ""
  echo "    Do NOT overwrite it — you would lose the ability to update"
  echo "    any app already signed with it. Move it aside first if you"
  echo "    are certain you want a new one."
  exit 1
fi

mkdir -p "$(dirname "$KEYSTORE")"
chmod 700 "$(dirname "$KEYSTORE")"

echo "  You'll be asked for a password. Rules:"
echo "    · at least 12 characters"
echo "    · store it in your password manager NOW, before you type it"
echo "    · you cannot recover it — write it down first"
echo ""
read -r -p "  Ready? [enter] " _

keytool -genkeypair -v \
  -keystore "$KEYSTORE" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 4096 \
  -validity 10000 \
  -storetype JKS

chmod 600 "$KEYSTORE"

echo ""
read -r -s -p "  Re-enter the keystore password (to write the config): " PW
echo ""

PROPS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/android/keystore.properties"
cat > "$PROPS" <<EOF
storeFile=$KEYSTORE
storePassword=$PW
keyAlias=$ALIAS
keyPassword=$PW
EOF
chmod 600 "$PROPS"
unset PW

echo ""
echo "  ✓ Keystore   → $KEYSTORE"
echo "  ✓ Config     → $PROPS   (gitignored)"
echo ""
echo "  Fingerprint — register this with Play if asked:"
keytool -list -v -keystore "$KEYSTORE" -alias "$ALIAS" 2>/dev/null \
  | grep -E "SHA1:|SHA256:" | sed 's/^/    /'
echo ""
echo "  ── BACK UP NOW ──────────────────────────────────────"
echo "  1. Password manager: store the password + this file"
echo "     as an attachment (1Password/Bitwarden support files)"
echo "  2. Encrypted archive to cloud storage:"
echo "       zip -e ~/Desktop/meldplus-key-backup.zip \"$KEYSTORE\""
echo "     then upload to iCloud/Drive and delete the local zip"
echo "  3. Do NOT put it in the git repo. Ever."
echo "  ─────────────────────────────────────────────────────"
echo ""
