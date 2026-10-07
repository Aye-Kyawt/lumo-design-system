# tools.md - what this project is built with

Stack facts and commands only. Rules about how we work live in 'CLAUDE.md'.

## Stack

- Framework : React 19 with Vite
- Language : JavaScript with JSX. `typescript` is not installed and there is no `tsconfig.json`.
  A component is `src/components/<name>/<name>.jsx` with `<name>.css`, `<name>.stories.jsx` and an
  `index.js`; subcomponents sit beside it in the same folder, camelCase (`buttonIcon.jsx`)
- Package manager : npm
- Styling : CSS custom properties, generated from tokens
- Tokens : Style Dictionary v5, driven by `build-tokens.js`, reading the Figma "Design Tokens" plugin export
- Component workshop : Storybook 10 (react-vite)

## Commands
| Job | Command |
|---|---|
|Install | `npm install` |
|Build tokens | `npm run build:tokens` |
|Run Storybook | `npm run storybook` |
|Build Storybook | `npm run build:storybook` (outputs `storybook-static/`) |

## Paths
- Token source : `tokens/*.tokens.json` — 23 files plus `manifest.json`, exported from Figma, committed
- Token config : `build-tokens.js` at the repo root. There is no `style-dictionary.config.js`
- Generated output : `build/` — CSS at `build/css/<platform>/tokens.css` and `tokens-dark.css` for
  `web`, `admin` and `mobile`, breakpoints at `build/css/layout/tokens.<breakpoint>.css`, plus
  `build/json/`, `build/ios/` and `build/android/`. Never edit by hand; gitignored. There is no
  `build/tokens/` directory
- Components : `src/components/<Name>/`
- Agents : `.claude/agents/`
- Skills : `.claude/skills/`

## Not set up yet
These were listed as stack facts before anything implemented them. They are kept here as
intent so nobody re-adds them as commands that fail, and nobody assumes the guarantee exists.

- **Tests.** No `test` script and `vitest` is not installed. There is no test command to run
- **Type checking.** No `Lint` or `typecheck` script, and no `typescript` dependency. "Typescript,
  strict" was never true of this repo, so nothing enforces it. TypeScript has since been dropped
  from the build skill and `engineer.md` too, which used to specify `.tsx`; adopting it later
  means revisiting those two files and this section together
- **Accessibility.** `@storybook/addon-a11y` is not installed, so the a11y checks CLAUDE.md
  implies for every interaction state are manual

## Repo root deployment
- The repo root is **not** a deployable site. It is the component library, and the only thing it
  builds is Storybook
- `vercel.json` at the root holds only `{"git": {"deploymentEnabled": false}}`. Two Vercel
  projects (`lumo-design-system` and `lumo-design-system-l2n7`, team `aye-kyawts-projects`) are
  connected to this repo with the root as their root directory, and both failed on every pull
  request. The error was `Command "vite build" exited with 1`: Vercel detects `vite` in
  devDependencies, applies its Vite preset, and runs `vite build`, which looks for an
  `index.html` entry at the root. A component library has none, so Rollup resolves zero entry
  modules and exits 1. Reproduce it with `npx vite build`
- `-l2n7` is Vercel's collision suffix, so the second project is this repo connected twice
- A `vercel.json` only applies to commits on branches that contain it, so the failing checks
  clear per branch as it reaches them
- **Storybook is not deployed anywhere yet.** The registry's `Staging Storybook` and
  `Production Storybook` columns are empty for all 12 components, and the Engineer and DevOps
  agents may only write a URL they have opened and seen render. If Storybook is to be hosted on
  Vercel, it needs build command `npm run build:storybook` and output directory
  `storybook-static` on a project of its own — a human decision, recorded here before an agent
  writes either cell

## Dependency rules
- Match the package manager in this file. This project uses npm. not yarn or pnpm.
- Use the existing package scripts before inventing commands.
- Do not add a dependency without explaining why in your report.
- Do not add a UI or component library. This repo is the component library.
- If this file disagrees with `package.json`, inspect the repo and say so.
