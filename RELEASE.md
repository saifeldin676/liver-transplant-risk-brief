# MELD+ · Release

**Bundle ID / Package:** `com.meldplus.app` — separate from BoomSweep, no shared keys.

## First time only

```bash
./scripts/generate-keystore.sh          # Android upload key → ~/keys/meldplus-upload.jks
```

Then in Xcode: **App target → Signing & Capabilities → Team** = your Apple Developer account.
Bundle ID already reads `com.meldplus.app`.

## Every release

```bash
./scripts/bump-version.sh 1.0.1         # bumps package.json + iOS + Android together
./scripts/build-release.sh              # builds both
./scripts/build-release.sh android      # or one at a time
./scripts/build-release.sh ios
```

**Android** → `android/app/build/outputs/bundle/release/app-release.aab` → upload to Play Console
**iOS** → Xcode opens → Product → Archive → Distribute App → App Store Connect

`versionCode` must strictly increase on every Play upload — `bump-version.sh` handles that.

## Keys — never commit

`.gitignore` blocks `*.jks`, `*.keystore`, `keystore.properties`, `*.p12`, `*.mobileprovision`.
Verified: `git check-ignore` confirms these are unstageable.

Back up the keystore to a password manager **and** an encrypted archive:
```bash
zip -e ~/Desktop/meldplus-key-backup.zip ~/keys/meldplus-upload.jks
```

Play App Signing is on by default, so this is an **upload key** — if lost, Google can reset it
(days of delay, not permanent loss). Back it up anyway.

## Store URLs

- Privacy → https://saifeldin676.github.io/liver-transplant-risk-brief/privacy/
- Support → https://saifeldin676.github.io/liver-transplant-risk-brief/support/
