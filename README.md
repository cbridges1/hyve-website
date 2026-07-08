# Hyve Docs

Documentation site for Hyve, built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

Migrated from a Mintlify site. Mintlify-only components (`Card`, `CardGroup`, `Tabs`/`Tab`, `Steps`/`Step`, `Accordion`/`AccordionGroup`, `Info`/`Note`/`Warning`/`Tip`, `Frame`, `ParamField`) were reimplemented as local Astro components in `src/components/mintlify/` so page content needed minimal changes — each page just imports the components it uses.

## Development

```
npm install
npm run dev
```

Local preview at `http://localhost:4321`.

## Build

```
npm run build
npm run preview
```

## Structure

- `src/content/docs/` — documentation pages (mdx), mirrors the original `/docs/...` URL structure
- `src/components/mintlify/` — Mintlify-compatible component shims, including real Font Awesome icons on `Card` via `astro-icon` + `@iconify-json/fa6-solid`/`fa6-brands` (a handful of FA5-era Mintlify icon slugs are aliased to their closest FA6 equivalent — see `ICON_ALIASES` in `Card.astro`)
- `src/assets/`, `public/` — logo, favicon, images
- `astro.config.mjs` — site config and sidebar navigation
- `src/styles/custom.css` — Inter font, accent colors, button/card/sidebar polish to sit closer to Mintlify's "mint" theme

## Homepage

`index.mdx` now uses Starlight's `splash` template with `hero.title`/`hero.tagline`/`hero.actions` frontmatter (sidebar-free, full-width) instead of hand-styled hero markup. The rest of the sections (How it works, Features, Why Hyve, etc.) are unchanged.

## Header, sidebar & colors

`src/styles/custom.css` maps the original `docs.json` palette onto Starlight's color tokens: `colors.primary` (`#000000`) drives the accent color in light mode, `colors.light` (`#FFFFFF`) drives it in dark mode, and `colors.dark` (`#9C9C9C`) is used for hover states in both — the same roles those three colors played in the Mintlify config. The gray scale is de-hued to a neutral black/white/gray palette (Starlight's defaults have a blue tint), and the header/sidebar backgrounds are set flat to match the main content background, matching Mintlify's flush look.

`src/components/Header.astro` overrides Starlight's default header to add a persistent "Docs" link (book icon) next to search — since the homepage has no sidebar, this is the way back into the docs, similar to Mintlify's separate Home/Documentation tabs.

## Not yet migrated

- `api-reference/` (OpenAPI reference pages) — wasn't wired into the live Mintlify site's navigation either, so it was left out. Consider the `starlight-openapi` plugin if you want to bring it in.
- Mintlify's fully separate top-nav tabs (`Home` / `Documentation` as distinct nav-level tabs, each with their own top-level identity) — what's implemented instead is a single persistent "Docs" link in the header, which gets you the same *outcome* (a way back to the docs from the homepage) without the deeper structural rework a true tab system would need.
