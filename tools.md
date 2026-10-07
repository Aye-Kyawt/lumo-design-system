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

## Repo root deployment — Storybook
- Vercel project : imported from this repo with the repo root as its root directory. It publishes
  **Storybook**, which is the only thing this repo builds
- Build config : `vercel.json` at the root — `framework: null`, `npm install`,
  `npm run build:storybook`, output `storybook-static`
- `framework: null` is the part that matters. Left to detect, Vercel sees `vite` in
  devDependencies, applies its Vite preset and runs `vite build`, which looks for an `index.html`
  entry at the root. A component library has none, so Rollup resolves zero entry modules and the
  build fails with `Command "vite build" exited with 1`. Setting the framework to Other stops
  that. Reproduce the failure with `npx vite build`
- Install is `npm install`, not `npm ci`: a lockfile written on macOS can omit packages Linux
  needs, and `npm ci` refuses it
- `npm run build:storybook` runs `build:tokens` first, so the generated token CSS that
  `.storybook/preview.jsx` imports from `build/css/` is produced during the build. Nothing
  generated needs to be committed for the deploy to work — verified from a clean tree with
  `build/`, `.tokens-clean/` and `storybook-static/` all absent
- Previews and production : every branch gets a preview URL, `main` gets production. These are
  the URLs the registry's `Staging Storybook` and `Production Storybook` columns are for — a
  preview build for the Engineer, the production build for DevOps. Both agents must still open
  the URL and see it render before writing the cell; a link to a build nobody looked at is a lie
  in a cell
- History : the root carried `{"git": {"deploymentEnabled": false}}` while no project was meant
  to build it. Note for anyone re-reading that period — the flag only suppresses deployments
  triggered by a **git push**. Importing a project, or deploying from the dashboard or the CLI,
  is not a push and builds regardless

## Dependency rules
- Match the package manager in this file. This project uses npm. not yarn or pnpm.
- Use the existing package scripts before inventing commands.
- Do not add a dependency without explaining why in your report.
- Do not add a UI or component library. This repo is the component library.
- If this file disagrees with `package.json`, inspect the repo and say so.
