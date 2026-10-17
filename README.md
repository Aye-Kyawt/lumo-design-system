# Lumo design system

Design tokens exported from the Figma file `Lumo.Token.V1.0.Complete`, built with
[Style Dictionary](https://styledictionary.com) into CSS, Swift and Android
resources, and documented in Storybook.

## Install

The package is **`@aye-kyawt/lumo-design-system`**.

```bash
npm install @aye-kyawt/lumo-design-system
```

> **Not published yet.** `package.json` carries `"private": true` as a deliberate guard, there
> are no git tags, and no version has been released — so the command above will not resolve
> today. It is the install command for this package, recorded so that the release chain has
> something to check and so nobody has to guess it later. `npm run release:publish` is the only
> thing that lifts the guard, and it puts it straight back.

`react` and `react-dom` are peer dependencies — 19 or newer. The package ships ESM and CJS
builds with TypeScript declarations generated from the JSDoc on the components.

### Usage

Load the two stylesheets once, at your app's entry point. **`tokens.css` must come first** —
every component declaration reads from it:

```js
import '@aye-kyawt/lumo-design-system/tokens.css';
import '@aye-kyawt/lumo-design-system/styles.css';
```

Then import the components you need:

```jsx
import { Badge, Button, Card, CardLayoutVertical } from '@aye-kyawt/lumo-design-system';

export function ReleaseRow({ onPublish }) {
  return (
    <Card padding="lg">
      <CardLayoutVertical
        headerProps={{ title: 'Release 0.2.0', subtitle: false }}
        body={<Badge tone="success" label="Cleared" />}
        footer
        footerContent={
          <Button label="Publish" iconLeft={false} iconRight={false} onClick={onPublish} />
        }
      />
    </Card>
  );
}
```

Note `iconLeft={false} iconRight={false}` on the button. Both default to **`true`**, with
`iconLeftName` and `iconRightName` defaulting to `add`, so a bare
`<Button label="Publish" />` renders a plus icon on each side of the label. The defaults come
from the Figma component set; turn them off for a text-only button.

Ten components are exported: `Accordion`, `Badge`, `Button`, `Card`, `CardLayoutVertical`,
`EmptyState`, `Field`, `Progress`, `Switch` and `Toast`. Everything else in `src/components/` is
internal — `docs/public-api.md` records what was kept out of the public surface and why.

Dark mode is the design system's own: `tokens.css` scopes its overrides to `[data-theme="dark"]`,
so setting that attribute on `<html>` is the whole of it.

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
