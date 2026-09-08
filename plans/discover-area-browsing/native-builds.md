# Coordinator native build evidence

Both commands ran in the authoritative discover-area-browsing worktree with the pinned mise toolchain after SQLite/network dependencies were installed. Both completed with exit code 0, installed the built application and launched its development-client URL. Later JavaScript-only corrections were verified through Metro in the platform notes; no native dependency changes followed these builds.

- Android: `mise exec -- pnpm android --device Medium_Phone --no-bundler`. Log `/tmp/mireqo-discover-android.log`; 455 Gradle tasks. Target emulator-5554, Medium_Phone, Android 17/API 37.
- iOS: `mise exec -- pnpm ios --device C588ADDD-FC8A-48E8-BA7D-B14D9093962D --no-bundler`. Log `/tmp/mireqo-discover-ios.log`. Target iPhone 17 Pro, iOS 26.5, Xcode 26.6.
- CocoaPods bundle: `mise exec -- bundle config set --local path vendor/bundle`, then `mise exec -- bundle install`. Log `/tmp/mireqo-discover-bundle.log`; installation completed successfully.
- Current Metro: started with `EXPO_PUBLIC_API_URL=http://127.0.0.1:3000 mise exec -- pnpm dev --clear`, session 90651, log `/tmp/mireqo-discover-metro.log`. Android reverse mappings connect ports 3000 and 8081. Native clients use `exp+mireqo://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081`.

See android-native.md and ios-native.md for actual feature interactions and screenshots. Builds alone do not establish behavior. API process ownership/current log is recorded in those handoff notes.
