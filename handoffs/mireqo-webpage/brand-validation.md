# Brand asset validation

Prepared and checked 2026-09-19. Scope: exported assets and documentation, not installed native/web integration.

- All 54 brand resources are listed in `brand-assets.json` with SHA-256 hashes; screenshots are retained separately and unchanged.
- Every SVG parses successfully, contains vector paths rather than embedded raster artwork, and has no external font, script, image, or network dependency. Light/dark/monochrome horizontal variants have identical path geometry.
- Main horizontal SVG independently rendered through macOS AppKit at its declared 960 × 240 size. The complete symbol and `mireqo` wordmark display without clipping. The PNG preview was visually checked on cream and dark backgrounds and at representative small icon sizes.
- iOS/default and dark app PNGs are exactly 1024 × 1024, RGB without alpha. Every pixel is opaque; square corners remain present for OS masking.
- Adaptive foreground and monochrome PNGs are 1024 × 1024 with transparency. Their maximum nontransparent pixel radius is 304.13px, inside the Android safe-circle radius of 312.88px at this canvas size. Both layers use identical symbol geometry and padding.
- Transparent logos, standalone wordmark, and splash files have visible artwork, transparent margins, and no content touching/clipping the canvas edges.
- Apple touch and web icons are opaque and their dimensions match their filenames and manifest declarations.
- Favicon ICO contains three correctly indexed PNG entries at 16, 32, and 48px; offsets, byte lengths, and embedded image contents match the standalone exports. The operating system identifies it as a three-image Windows icon resource.
- Every manifest image reference and relative Markdown image/document link resolves within the handoff directory.
- The final ZIP is checked for CRC errors and contains the same files as this directory, with no external asset dependencies.

Remaining integration checks belong to the receiving implementer: actual browser favicon/touch-icon behavior at the deployment base path, launcher masks/themed icons on Android, and iOS icon/splash behavior after a native build. No app build, store upload, deployment, or application configuration change is claimed here.
