# Build manifest

Build date: 17 July 2026

| Deliverable | Status | Location |
|---|---|---|
| Web/PWA frontend | Packaged | `releases/AcmeLearn-web.zip` |
| Android native project | Generated and synchronized | `frontends/mobile/android/` |
| Android QA APK | Compiled, debug-signed, archive verified | `releases/AcmeLearn-android-debug.apk` |
| Android source archive | Packaged | `releases/AcmeLearn-android-source.zip` |
| iOS native Xcode project | Generated and synchronized | `frontends/mobile/ios/` |
| iOS source archive | Packaged | `releases/AcmeLearn-ios-source.zip` |
| iOS signed IPA | Requires macOS, Xcode and Apple signing credentials | Not included |
| Supabase Edge Functions | 15 functions packaged | `backend/supabase/functions/` |
| Database | Schemas, RLS, seeds and cron packaged | `database/` |
| Checksums | Generated | `releases/SHA256SUMS.txt` |

## Verification completed

- 43 mobile pages include the native stylesheet and bridge.
- Android manifest and iOS property list parse correctly.
- Android microphone, network and notification permissions are configured.
- iOS microphone disclosure and OAuth custom URL scheme are configured.
- Android APK and all ZIP archives pass integrity tests.
- Bundle identifier/application ID: `com.acmelearn.app`.

## Signing status

The Android APK uses a debug certificate and is intended only for QA installation. Google Play requires a privately signed release AAB. Apple does not permit iOS App Store signing from Linux; the included Xcode project must be archived on macOS using the organization’s Apple Developer team and provisioning profile.
