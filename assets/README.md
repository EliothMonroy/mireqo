# Shared Mireqo assets

These are canonical resources for the mobile app and website. Keep reusable artwork here; handoff documents reference it rather than owning duplicate copies.

- [Brand resources](brand/): approved Open City logos, icons, splash artwork, browser metadata, and provenance. Start with the [brand guide](brand/brand-guide.md); [inventory](brand/brand-assets.json) paths are relative to `brand/`.
- [App screenshots](screenshots/): unmodified development previews. See the [website spec](../handoffs/mireqo-webpage/spec.md#screenshot-assets) for dimensions, original sources, alternative text, and demo-data disclosure.

For an external website handoff, provide `handoffs/mireqo-webpage/spec.md` together with this `assets/` directory, preserving the repository-relative layout. The receiving agent copies the required resources into the destination website's public assets and adjusts deployed URLs. Mobile integration should reference these canonical resources from the app configuration as shown in the brand guide.

These files do not by themselves configure the app or implement/deploy a website.
