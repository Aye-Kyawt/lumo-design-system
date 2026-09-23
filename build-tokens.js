const fs = require('fs');
const path = require('path');
const StyleDictionary = require('style-dictionary').default;

const TOKENS_DIR = path.join(__dirname, 'tokens');
const CLEAN_DIR = path.join(__dirname, '.tokens-clean');

const PLATFORMS = ['web', 'mobile', 'admin'];
const COLOR_MODES = ['on-light', 'on-dark'];
const LAYOUT_MODES = ['mobile', 'tablet', 'desktop', 'wide'];

const SHARED_FILES = [
  'lumo.core.value.tokens.json',
  'lumo.semantic.border.value.tokens.json',
  'lumo.semantic.opacity.value.tokens.json',
  'lumo.semantic.z-index.value.tokens.json',
  'lumo.semantic.motion.value.tokens.json',
  'typography.styles.tokens.json',
  'effects.styles.tokens.json',
];

// ---------------------------------------------------------------------------
// Unit step: Figma variables of type FLOAT carry no unit, and the exporter
// stamps every one of them as a px dimension. That is correct for spacing,
// sizing and radii, but opacity, z-index and durations are not lengths —
// left as px they emit invalid CSS (`z-index: 1400px`) that browsers drop
// silently, so the tokens appear to work while doing nothing.
// ---------------------------------------------------------------------------
function numericValue(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const match = /^(-?\d*\.?\d+)(?:px|rem|ms|s)?$/.exec(value.trim());
    return match ? parseFloat(match[1]) : null;
  }
  if (value && typeof value === 'object' && typeof value.value === 'number') return value.value;
  return null;
}

// Runs after the built-in css transforms, so it overrides their px output
// regardless of whether the value still an object or is already a string.
function registerUnitTransform(name, prefix, render) {
  StyleDictionary.registerTransform({
    name,
    type: 'value',
    transitive: true,
    filter: (token) =>
      String(token.path[0] || '').startsWith(prefix) && numericValue(token.$value) !== null,
    transform: (token) => render(numericValue(token.$value)),
  });
}

registerUnitTransform('lumo/opacity-ratio', 'opacity-', (n) => String(n / 100));
registerUnitTransform('lumo/z-index-unitless', 'z-index-', (n) => String(n));
registerUnitTransform('lumo/duration-ms', 'motion-duration-', (n) => `${n}ms`);

StyleDictionary.registerTransformGroup({
  name: 'lumo/css',
  transforms: [
    ...StyleDictionary.hooks.transformGroups.css,
    'lumo/opacity-ratio',
    'lumo/z-index-unitless',
    'lumo/duration-ms',
  ],
});

// ---------------------------------------------------------------------------
// Clean step: some tokens exported from Figma alias to their own name
// (e.g. "border-style-solid": "{border-style-solid}"), which Style
// Dictionary can't resolve. We build a lookup of every literal (non-alias)
// value across all source files, then for each self-referencing token:
//   - if a literal value exists elsewhere under the same name, drop the
//     duplicate so that literal wins (no data lost, no collision)
//   - otherwise there is no real value anywhere in the export, so we drop
//     the token and report it — it needs a real value added at the source
//     (Figma) and re-exporting.
// ---------------------------------------------------------------------------
function loadAllTokenFiles() {
  const files = fs.readdirSync(TOKENS_DIR).filter((f) => f.endsWith('.tokens.json'));
  const byFile = {};
  for (const f of files) {
    byFile[f] = JSON.parse(fs.readFileSync(path.join(TOKENS_DIR, f), 'utf8'));
  }
  return byFile;
}

function isSelfReference(key, value) {
  return typeof value === 'string' && value === `{${key}}`;
}

function cleanTokens() {
  const byFile = loadAllTokenFiles();

  // literal (non-alias) values, keyed by token name, across every file
  const literalsByKey = {};
  for (const data of Object.values(byFile)) {
    for (const [key, def] of Object.entries(data)) {
      if (def && typeof def === 'object' && '$value' in def && !isSelfReference(key, def.$value)) {
        if (typeof def.$value !== 'object' && typeof def.$value !== 'string') continue;
        if (typeof def.$value === 'string' && /^\{.*\}$/.test(def.$value)) continue; // still an alias, just to something else
        literalsByKey[key] = def.$value;
      }
    }
  }

  const dropped = []; // tokens with no real value anywhere
  const deduped = []; // tokens dropped because a literal already exists elsewhere

  fs.mkdirSync(CLEAN_DIR, { recursive: true });

  for (const [file, data] of Object.entries(byFile)) {
    const cleaned = {};
    for (const [key, def] of Object.entries(data)) {
      if (def && typeof def === 'object' && isSelfReference(key, def.$value)) {
        if (key in literalsByKey) {
          deduped.push(`${file}: ${key}`);
          continue; // drop duplicate; the literal elsewhere will resolve it
        }
        dropped.push(`${file}: ${key}`);
        continue; // no real value anywhere; drop and report
      }
      cleaned[key] = def;
    }
    fs.writeFileSync(path.join(CLEAN_DIR, file), JSON.stringify(cleaned, null, 2));
  }

  return { dropped, deduped };
}

function cleanSrc(file) {
  return path.join(CLEAN_DIR, file);
}

async function buildThemePlatform(platform, colorMode) {
  const sd = new StyleDictionary({
    usesDtcg: true,
    source: [
      ...SHARED_FILES,
      `lumo.semantic.color.${colorMode}.tokens.json`,
      `lumo.semantic.typography.${platform}.tokens.json`,
      `lumo.semantic.spacing.${platform}.tokens.json`,
      `lumo.semantic.size.${platform}.tokens.json`,
    ].map(cleanSrc),
    platforms: {
      css: {
        transformGroup: 'lumo/css',
        buildPath: `build/css/${platform}/`,
        files: [
          {
            destination: `tokens.${colorMode}.css`,
            format: 'css/variables',
            options: { outputReferences: true },
          },
        ],
      },
    },
  });
  await sd.hasInitialized;
  await sd.buildAllPlatforms();
}

async function buildLayout(mode) {
  const sd = new StyleDictionary({
    usesDtcg: true,
    source: [cleanSrc(`lumo.semantic.layout.${mode}.tokens.json`)],
    platforms: {
      css: {
        transformGroup: 'lumo/css',
        buildPath: 'build/css/layout/',
        files: [{ destination: `tokens.${mode}.css`, format: 'css/variables' }],
      },
    },
  });
  await sd.hasInitialized;
  await sd.buildAllPlatforms();
}

(async () => {
  const { dropped, deduped } = cleanTokens();

  for (const platform of PLATFORMS) {
    for (const colorMode of COLOR_MODES) {
      console.log(`Building ${platform} / ${colorMode}...`);
      await buildThemePlatform(platform, colorMode);
    }
  }
  for (const mode of LAYOUT_MODES) {
    console.log(`Building layout / ${mode}...`);
    await buildLayout(mode);
  }

  console.log('\nDone.');

  if (deduped.length) {
    console.log(`\nNote: ${deduped.length} duplicate self-referencing tokens were skipped (a real value from the core tier was used instead):`);
    deduped.forEach((d) => console.log('  - ' + d));
  }
  if (dropped.length) {
    console.log(`\nWARNING: ${dropped.length} tokens had NO real value anywhere in the export and were skipped entirely. Fix these in Figma and re-export:`);
    dropped.forEach((d) => console.log('  - ' + d));
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
