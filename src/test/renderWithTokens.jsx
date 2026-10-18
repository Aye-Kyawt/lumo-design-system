/**
 * The shared render helper.
 *
 * Component CSS is not loaded in these tests, and that is deliberate: jsdom
 * does not resolve CSS custom properties across sheets, so a test that loaded
 * the token CSS would still not be able to assert a real computed colour. The
 * honest thing is to assert what jsdom can actually see — markup, classes,
 * roles and aria — and to leave visual fidelity to the Storybook QA pass,
 * which compares against the Figma node.
 *
 * `theme` sets `data-theme` on <html>, because that is the attribute the dark
 * token sheet is scoped to. It is here so a test can assert that a component
 * reads the attribute rather than carrying its own dark variant.
 */
import { render } from '@testing-library/react';

export function renderWithTokens(ui, { theme = 'light', ...options } = {}) {
  document.documentElement.setAttribute('data-theme', theme);
  return render(ui, options);
}

export * from '@testing-library/react';
