/**
 * Test config for the component library.
 *
 * Storybook keeps its own Vite config and the library build keeps tsup; this
 * is a third, separate thing, and it stays separate for the reason tools.md
 * gives about the root Vite config being load-bearing for the only build that
 * reaches production.
 *
 * jsdom rather than a real browser: these tests assert structure, behaviour
 * and accessibility semantics — roles, aria state, what a key press does.
 * They deliberately do NOT assert computed colour or spacing. Those come from
 * generated tokens, and a test that hardcodes a token's value is a second
 * place for that value to live, which is the drift tokens exist to prevent.
 */
import react from '@vitejs/plugin-react';

export default {
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    // The stories are Storybook's; vitest should not try to collect them.
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.stories.jsx'],
  },
};
