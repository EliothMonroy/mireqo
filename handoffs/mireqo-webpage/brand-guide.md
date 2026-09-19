# Mireqo — Open City identity assets

Approved direction: option 2, Open City. Prepared 2026-09-19.

The mark is a compact lowercase “m” formed by two welcoming archways. The left arch is deliberately taller. This package turns the selected concept into clean, scalable vector geometry and matching raster exports. All files sit beside `spec.md` for a portable handoff.

## Primary files

| Purpose                              | File(s)                                                                    | Size / treatment                                                   |
| ------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Primary horizontal logo              | `mireqo-logo.svg`, `mireqo-logo.png`                                       | 960 × 240; terracotta symbol, charcoal wordmark, transparent       |
| Horizontal logo for dark backgrounds | `mireqo-logo-on-dark.svg`, `.png`                                          | 960 × 240; cream, transparent                                      |
| Single-color/reversed logo           | `mireqo-logo-mono.svg`, `.png`; `mireqo-logo-reverse.svg`, `.png`          | Charcoal / white, transparent                                      |
| Standalone outlined wordmark         | `mireqo-wordmark.svg`, `.png` and `-on-dark`, `-mono`, `-reverse` variants | 760 × 256; use the primary combined logo in the website header     |
| Symbol                               | `mireqo-mark.svg`, `.png`                                                  | 1024 × 1024; terracotta, transparent                               |
| Light/monochrome symbol              | `mireqo-mark-on-dark.svg`, `.png`; `mireqo-mark-mono.svg`, `.png`          | Cream / charcoal, transparent                                      |
| App icon                             | `mireqo-app-icon.png`                                                      | 1024 × 1024; cream symbol, opaque terracotta square                |
| Optional dark app icon               | `mireqo-app-icon-dark.png`                                                 | 1024 × 1024; cream symbol, opaque dark square                      |
| Android adaptive foreground          | `mireqo-android-adaptive-foreground.png`                                   | 1024 × 1024; cream symbol, transparent padded canvas               |
| Android themed-icon layer            | `mireqo-android-adaptive-monochrome.png`                                   | 1024 × 1024; black silhouette with transparent surrounding pixels  |
| Splash artwork                       | `mireqo-splash-light.png`, `mireqo-splash-dark.png`                        | 1024 × 1024; transparent symbol for cream / dark surfaces          |
| Browser favicon                      | `favicon.svg`, `favicon.ico`                                               | Symbol on terracotta; ICO contains 16, 32, 48px entries            |
| Raster favicon alternatives          | `favicon-16.png`, `favicon-32.png`, `favicon-48.png`, `favicon.png`        | 16, 32, 48, 64px                                                   |
| Apple touch icon                     | `apple-touch-icon.png`                                                     | 180 × 180; opaque                                                  |
| Web metadata icons                   | `web-icon-192.png`, `web-icon-512.png`, `web-maskable-512.png`             | Opaque; maskable version includes additional safe space            |
| Browser metadata                     | `site.webmanifest`                                                         | Local icon references; no service worker or install flow           |
| Visual reference                     | `mireqo-brand-preview.png` / `.svg`                                        | Light/dark lockups and app/favicon examples; not a logo substitute |

Every icon and splash PNG also has a corresponding SVG source with the same basename. Use the PNG where the native framework expects raster files. The SVGs contain filled paths, not embedded bitmap images, external fonts, or network references. Native exports and web exports share the same symbol geometry; only color, canvas, and optical padding differ.

## Color and spacing

- Terracotta: `#93442C`.
- Cream: `#F7F3EB`.
- Charcoal: `#292923`.
- Dark surface: `#1E211E`.
- Use the primary color logo on cream/white. Use the cream logo on dark surfaces. White reverse is available for a single-color treatment.
- Leave clear space around the combined logo of at least one quarter of the symbol's visible height. Do not crowd navigation or page edges against it.
- Recommended website header width: 140–176px. Keep the 4:1 canvas ratio. Use the symbol alone when space is too tight for a readable wordmark.
- The symbol remains recognizable at 16px; the dedicated favicon exports use a larger symbol fraction than app icons for small-size clarity.
- Do not distort, rotate, crop, add gradients, substitute a font, or change the relative size/position of the approved horizontal lockup.
- Rounded app-icon corners in the preview illustrate an OS mask. Actual app PNGs are square, full bleed, and opaque; do not bake a rounded mask into them.

## Website use

Follow the required header/footer/favicon mapping and HTML in `spec.md`. Use SVG for the webpage logo. PNGs are fallback options for consumers that cannot display SVG. A home link should have one accessible brand label; avoid duplicate image/link announcements. A purely decorative repeated mark should use empty alt text.

If including `site.webmanifest`, keep its icon filenames alongside the manifest or update its relative paths together. These files provide branding metadata, not an offline website or proof of installability. Do not introduce an install button.

## App integration handoff

These assets are prepared for the existing Expo project. App configuration and installed binaries have not been changed by this asset-delivery task. A later app implementation should follow Mireqo's normal code-change workflow, copy the selected assets into `apps/mobile/assets/brand/`, and merge the following values into the existing `apps/mobile/app.json` without replacing unrelated configuration:

```json
{
  "expo": {
    "icon": "./assets/brand/mireqo-app-icon.png",
    "android": {
      "icon": "./assets/brand/mireqo-app-icon.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/brand/mireqo-android-adaptive-foreground.png",
        "monochromeImage": "./assets/brand/mireqo-android-adaptive-monochrome.png",
        "backgroundColor": "#93442C"
      }
    }
  }
}
```

The top-level icon provides the default iOS image. The extra dark icon is an optional resource; integrate platform-specific appearance settings only when needed. Keep the adaptive foreground's padding intact and use the separate solid background color. Its complete visible silhouette lies within Android's central 66/108 diameter safe circle.

Splash files are reusable artwork, not an installed plugin. If splash branding is implemented later, use the light symbol over `#F7F3EB` and the dark variant over `#1E211E`; preserve the supplied transparent canvas. Validate the final splash in an appropriate preview/production build, as development clients can display their own launch screen.

Use PNG logo variants for ordinary React Native Image components if SVG rendering is not already available. This pack does not require adding a new runtime font or SVG dependency. Native icon/config changes require a native rebuild and verification on both platforms; file checks alone do not prove launcher integration.

## Sources and provenance

The selected visual concept was generated with the built-in image-generation tool; its exact prompt is preserved in [logo-generation-prompt.md](logo-generation-prompt.md). Its brief: an original warm terracotta lowercase “m” made from two welcoming architectural arches of subtly different heights, paired with the lowercase name `mireqo`, with cream/charcoal variants and a compact app-icon treatment. The production symbol has been reconstructed as editable vector paths; the wordmark is Avenir Next Bold converted to outlines. No font file is included or required by the exported assets. Do not typeset a replacement wordmark: use its supplied outlines.

Verified platform references, 2026-09-19:

- [Expo app icons and splash screens](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/): PNG configuration, square opaque iOS icon, Android foreground/monochrome layers, and splash verification context.
- [Android adaptive icon guidance](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive): foreground/background layers and central safe area.
- [Web manifest icon metadata](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/icons): icon sizes, MIME types, and maskable purpose.

`brand-assets.json` inventories the delivered brand files with sizes and hashes. `brand-validation.md` records the checks performed. This is an asset package, not an App Store submission, an installed app icon, or a deployed website.
