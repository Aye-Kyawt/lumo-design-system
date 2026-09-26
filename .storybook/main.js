import react from '@vitejs/plugin-react';

/**
 * Storybook reads the *built* tokens (build/css + build/json), never the raw
 * Figma export -- so what the docs show is exactly what ships to consumers.
 * `npm run storybook` runs the token build first for that reason.
 *
 * @type {import('@storybook/react-vite').StorybookConfig}
 */
const config = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.jsx'],
  addons: ['@storybook/addon-docs'],
  framework: { name: '@storybook/react-vite', options: {} },

  // The framework no longer ships the React plugin, and this repo has no Vite
  // config of its own -- without it JSX falls back to the classic runtime and
  // every story dies on "React is not defined".
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), react()];
    return viteConfig;
  },
};

export default config;
