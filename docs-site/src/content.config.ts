import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Single-language site, so only the `docs` collection is defined. Starlight
// warns that the `i18n` collection is empty; defining it with `i18nLoader()`
// swaps that for a warning about the missing `src/content/i18n/` directory, so
// the warning is cosmetic either way and this is the simpler of the two.
export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
