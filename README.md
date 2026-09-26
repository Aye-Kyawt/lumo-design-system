# Lumo design system

Design tokens exported from the Figma file `Lumo.Token.V1.0.Complete`, built with
[Style Dictionary](https://styledictionary.com) into CSS, Swift and Android
resources, and documented in Storybook.

## Commands

```bash
npm install          # once
npm run build:tokens # tokens/ -> build/
npm run storybook    # builds tokens, then serves the docs on :6006
npm run build:storybook  # static docs into storybook-static/
```

## Layout

| Path              | What it is                                                        |
| ----------------- | ----------------------------------------------------------------- |
| `tokens/`         | The DTCG export from Figma. Generated — edit values in Figma.      |
| `build-tokens.js` | Cleans the export and runs Style Dictionary.                       |
| `build/`          | Build output (git-ignored): CSS per platform, Swift, Android, JSON.|
| `.storybook/`     | Storybook config.                                                  |
| `stories/`        | The token gallery.                                                 |

## Build output

- `build/css/{web,mobile,admin}/tokens.css` — `:root` variables for one platform.
- `build/css/{web,mobile,admin}/tokens-dark.css` — colour overrides scoped to
  `[data-theme="dark"]`.
- `build/css/layout/tokens.{mobile,tablet,desktop,wide}.css` — grid values scoped
  to `[data-breakpoint="…"]`.
- `build/ios/Tokens.swift`, `build/android/colors.xml` — native resources.
- `build/json/*.json` — the same tokens with their type, alias and source file,
  which is what Storybook reads.

Colour, border, elevation, motion and z-index are shared across platforms.
Typography, spacing and sizing are authored per platform; the token names are
identical, only the values differ.

## Storybook

Three toolbar controls drive every page: **Platform** swaps which stylesheet is
loaded, **Theme** sets `data-theme`, and **Breakpoint** sets `data-breakpoint`.
Click any token name to copy it as `var(--name)`.

## Known gaps in the export

Both come from the Figma export, not from this repo, and are flagged on the
pages where they matter:

- Opacity, motion durations, z-index and `--grid-columns` are `FLOAT` variables
  in Figma, but the export types every number as a `dimension` — so they ship
  with a `px` suffix they should not have.
- Eight tokens (`border-style-solid|dashed|dotted`, five `motion-easing-*`) are
  exported as self-references with no value. The build drops them and lists them
  at the end of every run.
