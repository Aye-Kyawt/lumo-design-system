import { useLayoutEffect } from 'react';

import '../stories/lib/docs.css';

// Every stylesheet is imported as a string rather than injected by Vite: the
// platform toolbar swaps which one is live, and three `:root` sheets loaded at
// once would just fight each other.
import webCss from '../build/css/web/tokens.css?inline';
import webDarkCss from '../build/css/web/tokens-dark.css?inline';
import mobileCss from '../build/css/mobile/tokens.css?inline';
import mobileDarkCss from '../build/css/mobile/tokens-dark.css?inline';
import adminCss from '../build/css/admin/tokens.css?inline';
import adminDarkCss from '../build/css/admin/tokens-dark.css?inline';

import layoutMobileCss from '../build/css/layout/tokens.mobile.css?inline';
import layoutTabletCss from '../build/css/layout/tokens.tablet.css?inline';
import layoutDesktopCss from '../build/css/layout/tokens.desktop.css?inline';
import layoutWideCss from '../build/css/layout/tokens.wide.css?inline';

const PLATFORM_CSS = {
  web: [webCss, webDarkCss],
  mobile: [mobileCss, mobileDarkCss],
  admin: [adminCss, adminDarkCss],
};

// All four layout sheets can sit side by side -- each is scoped to its own
// [data-breakpoint] attribute, so the toolbar just picks which one applies.
const LAYOUT_CSS = [layoutMobileCss, layoutTabletCss, layoutDesktopCss, layoutWideCss].join('\n');

function TokenScope({ platform, theme, breakpoint, children }) {
  useLayoutEffect(() => {
    let style = document.getElementById('lumo-tokens');
    if (!style) {
      style = document.createElement('style');
      style.id = 'lumo-tokens';
      document.head.appendChild(style);
    }
    style.textContent = [...PLATFORM_CSS[platform], LAYOUT_CSS].join('\n');
  }, [platform]);

  useLayoutEffect(() => {
    // The dark and layout sheets are attribute-scoped; putting the attributes
    // on <html> lets the whole preview frame -- not just the story -- respond.
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-breakpoint', breakpoint);
    root.style.colorScheme = theme;
  }, [theme, breakpoint]);

  return (
    <div className="lumo-docs" data-theme={theme}>
      {children}
    </div>
  );
}

/** @type {import('@storybook/react-vite').Preview} */
const preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    docs: { toc: true },
    options: {
      // These pages are documentation, not component playgrounds -- the
      // addons panel has nothing to show for them.
      showPanel: false,
      storySort: {
        order: [
          'Introduction',
          'Foundations',
          [
            'Colour',
            'Typography',
            'Spacing',
            'Sizing',
            'Border',
            'Elevation',
            'Opacity',
            'Motion',
            'Z-index',
            'Layout & Grid',
          ],
          'Reference',
        ],
      },
    },
  },

  globalTypes: {
    platform: {
      description: 'Which platform build of the tokens to load',
      toolbar: {
        title: 'Platform',
        icon: 'browser',
        items: [
          { value: 'web', title: 'Web' },
          { value: 'mobile', title: 'Mobile' },
          { value: 'admin', title: 'Admin' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'Colour mode',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    breakpoint: {
      description: 'Layout breakpoint for the grid tokens',
      toolbar: {
        title: 'Breakpoint',
        icon: 'grid',
        items: [
          { value: 'mobile', title: 'Mobile' },
          { value: 'tablet', title: 'Tablet' },
          { value: 'desktop', title: 'Desktop' },
          { value: 'wide', title: 'Wide' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: { platform: 'web', theme: 'light', breakpoint: 'desktop' },

  decorators: [
    (Story, context) => (
      <TokenScope {...context.globals}>
        <Story />
      </TokenScope>
    ),
  ],
};

export default preview;
