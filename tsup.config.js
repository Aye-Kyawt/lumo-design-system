/**
 * Library build. Storybook keeps its own Vite config; this is only for the
 * published package.
 *
 * The sources are JSX with JSDoc types, not TypeScript — see tools.md. `dts`
 * therefore reads the JSDoc through `allowJs` and emits declarations from it,
 * which is why the JSDoc blocks on every component's props are load-bearing
 * and not decoration.
 */
export default {
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Peer dependencies. Bundling React would give a consumer two copies and
  // break hooks; these must resolve to the host app's React.
  external: ['react', 'react-dom'],
  // CSS is shipped by build:css as real stylesheets a consumer imports by
  // path. Nothing in src/index.ts imports CSS, so there is none to bundle.
  injectStyle: false,
};
