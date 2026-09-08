# Android implementer native verification

Actual `emulator-5554`, Medium_Phone, reported model `sdk_gphone16k_arm64`, Android17. Coordinator rebuilt/installed native dependencies with the repository Android command (455 tasks; coordinator owns exact build log). Parent implementer operated actual app with adb input/uiautomator, screenshots and native appearance/connectivity controls, 2026-09-07. Metro clear restart after scoped TypeBox CJS resolution fix; actual runtime then passed. API http://127.0.0.1:3000 with adb reverse3000, Metro8081 reverse.

Verified on current app code:

- First-launch manual selector fetched all3 actual SQL-backed areas; no permission/account dialog. Selected Coacalco, Tultitlán and Mexico City; respective venue/neighborhood text changed correctly, including Cuauhtémoc/MiguelHidalgo/Tlalpan/Iztapalapa city boroughs.
- Modal selected state is both checkmark and native selected accessibility state; native Back dismissed it. Process force-stop/relaunch restored Tultitlán, MexicoCity and finally Coacalco through SQLite.
- First-load transport failure after removing Android reverse3000 and restarting showed area-load retry with no fabricated cards. Restoring reverse and tapping retry restored previously persisted MexicoCity without selecting again.
- Native first-page and next-page loading/append succeeded. All10 fixtures reachable; explicit free/monetary prices, unannounced/date-only/timezone dates, long text and postponed/cancelled states inspected. Null and failed remote images show calm fallback; unknown price is omitted.
- Controlled empty Tultitlán response verified empty/change-area/refresh controls. Only synthetic Tultitlán rows temporarily removed transactionally; immediate same-date seed restored all30 records and Refresh events recovered content.
- Confirmed device offline via WiFi/data disabled showed offline banner with retained same-area cards. Device connectivity restored afterward.
- Controlled nonmutating exclusive catalog table lock produced cached-refresh503; banner said previously loaded events, retained cards and Try again recovered. A further pull-to-refresh during the lock also kept content. Error never claimed confirmed offline for backend failure.
- Native pagination fault exposed a backend cursor-boundary catch misclassification; fixed and added integration regression. Restarted API on current code, repeated native fault and verified ordinary unavailable message, existing page retained, Retry loading more succeeded after lock release. All temporary locks auto-released; no fault remains.
- Light and dark appearance inspected, plus font_scale1.3: native labels wrap, cards grow, prices/area actions remain readable/reachable without clipping. Defaults restored (`font_scale1.0`, night no, WiFi/data enabled, reverse3000+8081).

Visual QA corrected intrinsic image sizing (explicit100% width/height) and category overlay positioning; original illustration compositions now fit covers in both appearances. Removed duplicate area description lines. Existing Expo development-client Tools overlay is development tooling, not an application action.

Screenshots in evidence/: android-final-light.png, android-selector.png, android-dark-large.png, android-first-error.png, android-offline.png, android-empty.png, android-refresh-error.png, android-pagination-error.png, android-fallback.png, android-long-title.png. Some state screenshots precede the final small category-position fix; current final-light/selector/pagination checks include it. Android final state is restored Coacalco, no active fault.

Current API session16023, log `/tmp/mireqo-discover-api-current.log`; it replaces prior PID88462 and runs latest cursor-outage fix. Metro remains coordinator-owned. iOS evidence and independent tester verification remain separate requirements.
