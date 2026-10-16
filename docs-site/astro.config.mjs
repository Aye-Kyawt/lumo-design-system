import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// The reference site for the Lumo Design System.
//
// It is a second Vercel project on this same repo, with `docs-site/` as its root
// directory. The repo root stays the Storybook project — see `tools.md`.
//
// Token CSS is read from the repo root's generated `build/` output rather than
// restated here, so the site cannot drift from the tokens. `npm run build` in
// this folder runs the root `build:tokens` first, which is what produces it.
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
      sidebar: [
        { label: 'Start here', link: '/' },
        {
          label: 'Atoms',
          items: [
            { label: 'Badge', slug: 'components/badge' },
            { label: 'Button', slug: 'components/button' },
            { label: 'Progress', slug: 'components/progress' },
            { label: 'Switch', slug: 'components/switch' },
          ],
        },
        {
          label: 'Molecules',
          items: [
            { label: 'Accordion', slug: 'components/accordion' },
            { label: 'Empty State', slug: 'components/empty-state' },
            { label: 'Field', slug: 'components/field' },
            { label: 'Toast', slug: 'components/toast' },
          ],
        },
        {
          label: 'Organisms',
          items: [{ label: 'Card', slug: 'components/card' }],
        },
        { label: 'Tokens', slug: 'tokens' },
      ],
    }),
  ],
  vite: {
    // The token CSS above lives outside this project's root.
    server: { fs: { allow: ['..'] } },
  },
});
