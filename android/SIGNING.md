# MELD+ · Android signing

## One-time setup

```bash
./scripts/generate-keystore.sh
```

Creates `~/keys/meldplus-upload.jks` and `android/keystore.properties` (both gitignored),
then prints your SHA-1/SHA-256 fingerprints.

## Then build the release bundle

Android Studio → **Build → Generate Signed Bundle / APK → Android App Bundle**
(signing is already wired via Gradle, so it picks up the key automatically)

Or CLI:
```bash
npm run build && npx cap sync android
cd android && ./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab
```

## Play App Signing — read this

Google Play uses **Play App Signing** by default. That means:

- The key you just made is an **upload key**, not the final app signing key
- Google holds the real signing key and re-signs your app
- **If you lose the upload key, Google can reset it** — email Play support,
  register a new upload key, and continue publishing

This is a genuine safety net that did not exist before 2017. It does *not*
make backup optional — a reset takes days and blocks urgent updates — but
losing this key is recoverable, unlike the old model.

## Backup

1. **Password manager** — store the password, attach the `.jks` file
2. **Encrypted archive** —
   ```bash
   zip -e ~/Desktop/meldplus-key-backup.zip ~/keys/meldplus-upload.jks
   ```
   upload to iCloud/Drive, then delete the local zip
3. **Never** commit to git — `.gitignore` blocks it, don't force past it

## Separate from BoomSweep

This key is only for `com.meldplus.app`. Do not reuse BoomSweep's keystore:
separate keys mean a compromise of one app never touches the other.
