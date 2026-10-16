import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { components as componentStatus, toneFor } from './src/componentStatus.js';

// The reference site for the Lumo Design System.
//
// It is a second Vercel project on this same repo, with `docs-site/` as its root
// directory. The repo root stays the Storybook project — see `tools.md`.
//
// Token CSS is read from the repo root's generated `build/` output rather than
// restated here, so the site cannot drift from the tokens. `npm run build` in
// this folder runs the root `build:tokens` first, which is what produces it.

// Sidebar entries are generated from the same snapshot the pages read, so a
// component's status cannot say one thing in the nav and another on its page.
// Starlight's badge variants are mapped from the registry's own vocabulary.
const badgeVariant = {
  positive: 'success',
  info: 'note',
  negative: 'danger',
  warning: 'caution',
  neutral: 'default',
};

const group = (label, level) => ({
  label,
  items: Object.entries(componentStatus)
    .filter(([, c]) => c.hasPage && c.level === level)
    .map(([slug, c]) => ({
      label: c.name,
      slug: `components/${slug}`,
      badge: { text: c.status, variant: badgeVariant[toneFor(c.status)] },
    })),
});

export default defineConfig({
  outDir: './dist',
  integrations: [
    starlight({
      title: 'Lumo Design System',
      description:
        'The reference for the Lumo Design System — what each component is for, ' +
        'when to reach for it, and which tokens it is built from.',
      // Generated token CSS first, then the site's own rules. The dark file is
      // scoped to `[data-theme="dark"]`, which is the attribute Starlight's own
      // theme toggle sets — so dark mode is the design system's dark mode, not a
      // second palette maintained here.
      customCss: [
        '../build/css/web/tokens.css',
        '../build/css/web/tokens-dark.css',
        './src/styles/lumo.css',
      ],
      head: [
        // CLAUDE.md: load the required font from the Google Fonts CDN. The type
        // tokens all resolve to Inter; Material Symbols is the icon set.
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,100..700,0..1,-50..200&display=block',
          },
        },
      ],
      // Starlight's Hero is overridden so the landing page can carry a release
      // card with the version, the way large public design-system sites do.
      components: {
        Hero: './src/components/Hero.astro',
      },
      sidebar: [
        { label: 'Start here', link: '/' },
        group('Atoms', 'Atoms'),
        group('Molecules', 'Molecules'),
        group('Organisms', 'Organisms'),
        { label: 'Tokens', slug: 'tokens' },
        { label: 'Figma vs the repo', slug: 'disagreements' },
      ],
    }),
  ],
  vite: {
    // The token CSS above lives outside this project's root.
    server: { fs: { allow: ['..'] } },
  },
});
