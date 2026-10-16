# tools.md - what this project is built with

Stack facts and commands only. Rules about how we work live in 'CLAUDE.md'.

## Stack

- Framework : React 19 with Vite
- Language : JavaScript with JSX. `typescript` is not installed at the repo root and there is
  no `tsconfig.json` there. `docs-site/` has one, because Astro ships its own TypeScript and
  Starlight's content config is a `.ts` file; that does not make this a TypeScript repo.
  A component is `src/components/<name>/<name>.jsx` with `<name>.css`, `<name>.stories.jsx` and an
  `index.js`; subcomponents sit beside it in the same folder, camelCase (`buttonIcon.jsx`)
- Package manager : npm
- Styling : CSS custom properties, generated from tokens
- Tokens : Style Dictionary v5, driven by `build-tokens.js`, reading the Figma "Design Tokens" plugin export
- Component workshop : Storybook 10 (react-vite)
- Reference site : Astro 7 with Starlight 0.42, in `docs-site/`. It has its **own**
  `package.json` and its own `node_modules`, and is not a workspace of the root project

## Commands
| Job | Command |
|---|---|
|Install | `npm install` |
|Build tokens | `npm run build:tokens` |
|Run Storybook | `npm run storybook` |
|Build Storybook | `npm run build:storybook` (outputs `storybook-static/`) |
|Install the reference site | `npm --prefix docs-site install` |
|Run the reference site | `npm --prefix docs-site run dev` (port 4321) |
|Build the reference site | `npm --prefix docs-site run build` (outputs `docs-site/dist/`) |

The reference site's `dev` and `build` both run the root `build:tokens` first, the same
way `build:storybook` does, so its token CSS is generated and never committed.

## Paths
- Token source : `tokens/*.tokens.json` — 23 files plus `manifest.json`, exported from Figma, committed
- Token config : `build-tokens.js` at the repo root. There is no `style-dictionary.config.js`
- Generated output : `build/` — CSS at `build/css/<platform>/tokens.css` and `tokens-dark.css` for
  `web`, `admin` and `mobile`, breakpoints at `build/css/layout/tokens.<breakpoint>.css`, plus
  `build/json/`, `build/ios/` and `build/android/`. Never edit by hand; gitignored. There is no
  `build/tokens/` directory
- Components : `src/components/<Name>/`
- Reference site : `docs-site/` — pages at `docs-site/src/content/docs/`, config at
  `docs-site/astro.config.mjs`, output `docs-site/dist/` (gitignored)
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

## docs-site deployment — the reference site

**Not deployed yet.** The project `lumo-reference-site` exists and the site builds locally and
renders, but no deployment has succeeded, so there is no URL and `Components/Astro Link` stays
empty until there is one.

- Intended shape : a **second** Vercel project on this same repo with the root directory set
  to `docs-site`, leaving the existing repo-root Storybook project untouched. The root project
  is fragile in a documented way (see above) and nothing here changes it
- Build config : `docs-site/vercel.json` — framework `astro`, install
  `npm install && npm --prefix .. install`, build `npm run build`, output `dist`. Framework
  detection is safe here, unlike at the root: Astro is a framework Vercel detects correctly
  and `docs-site/` has a real entry point
- **Root Directory = `docs-site` must be set on the project.** It is not expressible in
  `vercel.json`, because `vercel.json` is itself read *from* the root directory — which is
  exactly the trap below
- **The failure when it is not set.** Every deployment up to 2026-10-16 failed this way, and
  the message names a directory that has nothing to do with this site:

  ```
  Error: [STATIC_BUILD_NO_OUT_DIR] No Output Directory named "storybook-static"
  found after the Build completed.
  ```

  `storybook-static` is the repo root's `outputDirectory`. It appears in the root
  `vercel.json` and nowhere else. Seeing it in this project's log means the project is
  building at the **repo root** against the root config and has never looked at `docs-site/`
  at all. The fix is the Root Directory field, not the build config

  Worth keeping because it is counter-intuitive: a reference-site build that fails complaining
  about Storybook is not a confused build. It is the right error for a project pointed at the
  wrong directory

- **A second, separate question, still unresolved.** The site's build runs the root
  `build:tokens` first, so once the build *is* running inside `docs-site/` it needs the repo
  root present and its devDependencies installed — which is why the install command installs
  twice. `build-tokens.js` resolves its token source from its own `__dirname` but writes
  `build/` relative to the working directory, so it must run with the repo root as cwd;
  `npm --prefix ..` does that.

  Whether Vercel makes the parent available by default is **not yet known**. Extracting
  `docs-site/` on its own and running the two commands against it does fail:

  ```
  npm error enoent Could not read package.json: Error: ENOENT: no such file or
  directory, open '<parent>/package.json'
  ```

  — once at `npm --prefix .. install`, once at `npm --prefix .. run build:tokens`. But that
  is a **local reproduction of a hypothesis, never observed in a real build**, and it was
  reproduced while the real failure was the Root Directory one above. Treat it as a thing to
  watch for in the first build that actually runs inside `docs-site/`, not as a known cause.

  An older version of this section named a project setting, *"Include source files outside of
  the Root Directory in the Build Step"*, as the required fix. **That was written from memory
  and could not be found in the dashboard or in Vercel's current documentation.** Do not go
  looking for it on this file's say-so; if the parent turns out to be missing, find out what
  the current control is called before writing it down again
- **Why the dependency on the parent is hard to remove.** Reading the generated tokens from
  `build/` is the whole point — it is what stops the site restating values and drifting from
  them, and every route to that output crosses the root directory boundary. Pointing the
  project at the repo root instead does not work: Vercel reads `vercel.json` from the root
  directory, and the root one builds Storybook — which is precisely the failure above. The
  remaining alternative is committing generated token CSS into `docs-site/`, which breaks the
  rule that `build/` is never committed and reintroduces the drift tokens exist to prevent
- Before the first deploy, set `site` in `docs-site/astro.config.mjs` to the production URL.
  It is deliberately unset today, because a sitemap pointing at a URL nobody has seen is worse
  than no sitemap. Astro warns about this on every build until it is set
- `Astro Link` is the doc-generator's cell, and the rule on it is the same as for the two
  Storybook cells: open the deployed page, see it render, then write it

### Why Astro and Starlight were added

Two dependencies, `astro` and `@astrojs/starlight`, both in `docs-site/`, neither at the root.

They were not added to solve a problem the existing stack already solves. Storybook renders
components; it does not carry intent — when to reach for a component, when not to, what it
pairs with. `.claude/agents/doc-generator.md` names "the Astro Starlight site" as the thing it
writes, and the registry's `Astro Link` column is a cell with nowhere to point. Six components
currently sit at `Completed` with a `Blocked` release verdict, and the first reason in all six
reviews is that no reference page exists and no site exists to hold one.

Keeping them out of the root `package.json` is deliberate. The root carries `vite` for
Storybook and Astro bundles its own; one `node_modules` for both invites a hoisting conflict
in the only build that currently reaches production.

## Dependency rules
- Match the package manager in this file. This project uses npm. not yarn or pnpm.
- Use the existing package scripts before inventing commands.
- Do not add a dependency without explaining why in your report.
- Do not add a UI or component library. This repo is the component library.
- If this file disagrees with `package.json`, inspect the repo and say so.
