/**
 * The token data behind every story.
 *
 * These JSON files are emitted by `npm run build:tokens` alongside the CSS,
 * from the same Style Dictionary run -- so a name or value shown here is the
 * name or value in the stylesheet, not a second transcription of it.
 */

import web from '../../build/json/web.json';
import webDark from '../../build/json/web.dark.json';
import mobile from '../../build/json/mobile.json';
import mobileDark from '../../build/json/mobile.dark.json';
import admin from '../../build/json/admin.json';
import adminDark from '../../build/json/admin.dark.json';

import layoutMobile from '../../build/json/layout.mobile.json';
import layoutTablet from '../../build/json/layout.tablet.json';
import layoutDesktop from '../../build/json/layout.desktop.json';
import layoutWide from '../../build/json/layout.wide.json';

export const PLATFORMS = ['web', 'mobile', 'admin'];
export const BREAKPOINTS = ['mobile', 'tablet', 'desktop', 'wide'];

const SETS = {
  web: { light: web, dark: webDark },
  mobile: { light: mobile, dark: mobileDark },
  admin: { light: admin, dark: adminDark },
};

export const LAYOUT_SETS = {
  mobile: layoutMobile,
  tablet: layoutTablet,
  desktop: layoutDesktop,
  wide: layoutWide,
};

/**
 * Every token for a platform, with the dark-mode colours layered over the
 * light ones -- the same thing the cascade does when tokens-dark.css loads
 * after tokens.css.
 */
export function tokensFor(platform = 'web', theme = 'light') {
  const { light, dark } = SETS[platform] ?? SETS.web;
  if (theme !== 'dark') return light;

  const overrides = new Map(dark.map((t) => [t.name, t]));
  return light.map((t) => overrides.get(t.name) ?? t);
}

/** Tokens whose literal values were authored in Figma's core collection. */
export const isCore = (t) => t.file === 'lumo.core.value.tokens.json';

export const startsWith = (...prefixes) => (t) =>
  prefixes.some((p) => t.name.startsWith(p));

export const matching = (re) => (t) => re.test(t.name);

/** Strip the `--` and the category prefix: `--color-text-bold` -> `text-bold`. */
export const shortName = (name, prefix) =>
  name.replace(/^--/, '').replace(new RegExp(`^${prefix}-?`), '');

/** `40px` -> 40, `0.5` -> 0.5, anything unparseable -> NaN. */
export const numberOf = (value) => parseFloat(String(value));

/**
 * Bucket tokens by a segment of their name, keeping first-seen order --
 * `--color-bg-primary-idle` grouped at depth 1 lands under `bg`.
 */
export function groupBy(tokens, keyFn) {
  const groups = new Map();
  for (const token of tokens) {
    const key = keyFn(token);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(token);
  }
  return [...groups.entries()];
}

export const segment = (index, prefix) => (t) =>
  shortName(t.name, prefix).split('-')[index] ?? '';

/** Composite values (typography, shadow) arrive as objects; show them as JSON. */
export const stringify = (value) =>
  typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
