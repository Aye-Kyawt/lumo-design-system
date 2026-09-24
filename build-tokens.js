import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, 'tokens');
const CLEAN_DIR = path.join(__dirname, '.tokens-clean');

const PLATFORMS = ['web', 'mobile', 'admin'];
const LAYOUTS = ['mobile', 'tablet', 'desktop', 'wide'];

// Files that are the same regardless of platform / colour mode.
const SHARED = [
  'lumo.core.value.tokens.json',
  'lumo.semantic.border.value.tokens.json',
  'lumo.semantic.opacity.value.tokens.json',
  'lumo.semantic.z-index.value.tokens.json',
  'lumo.semantic.motion.value.tokens.json',
];
const STYLES = ['typography.styles.tokens.json', 'effects.styles.tokens.json'];

const perPlatform = (p) => [
  `lumo.semantic.typography.${p}.tokens.json`,
  `lumo.semantic.spacing.${p}.tokens.json`,
  `lumo.semantic.size.${p}.tokens.json`,
];

const LIGHT = 'lumo.semantic.color.on-light.tokens.json';
const DARK = 'lumo.semantic.color.on-dark.tokens.json';

// ---------------------------------------------------------------------------
// 1. Clean pass
//
// The Figma export emits some tokens that alias their own name, e.g.
//   "border-style-solid": { "$value": "{border-style-solid}" }
// Style Dictionary can't resolve those (circular). For each one we either
// fall back to a real literal defined elsewhere under the same name, or --
// if no real value exists anywhere in the export -- drop it and report it.
// ---------------------------------------------------------------------------
const isSelfRef = (key, value) => typeof value === 'string' && value === `{${key}}`;
const isAlias = (value) => typeof value === 'string' && /^\{.+\}$/.test(value);

function cleanTokens() {
  const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.tokens.json'));
  const parsed = Object.fromEntries(
    files.map((f) => [f, JSON.parse(fs.readFileSync(path.join(SRC_DIR, f), 'utf8'))]),
  );

  // Every token name that has a real (non-alias) value somewhere.
  const literals = new Set();
  for (const data of Object.values(parsed)) {
    for (const [key, def] of Object.entries(data)) {
      if (def && typeof def === 'object' && '$value' in def && !isAlias(def.$value)) {
        literals.add(key);
      }
    }
  }

  const deduped = [];
  const dropped = [];

  fs.rmSync(CLEAN_DIR, { recursive: true, force: true });
  fs.mkdirSync(CLEAN_DIR, { recursive: true });

  for (const [file, data] of Object.entries(parsed)) {
    const out = {};
    for (const [key, def] of Object.entries(data)) {
      if (def && typeof def === 'object' && isSelfRef(key, def.$value)) {
        (literals.has(key) ? deduped : dropped).push(`${file}  ->  ${key}`);
        continue;
      }
      out[key] = def;
    }
    fs.writeFileSync(path.join(CLEAN_DIR, file), JSON.stringify(out, null, 2));
  }

  return { deduped, dropped };
}

// ---------------------------------------------------------------------------
// 2. Font weight normalisation
//
// Figma writes weights as human names -- "Semi Bold" inside typography
// styles, "semi-bold" on the core tokens. CSS, iOS and Android all want
// numbers. Normalise both spellings to the numeric scale.
// ---------------------------------------------------------------------------
const WEIGHTS = {
  thin: 100,
  hairline: 100,
  extralight: 200,
  ultralight: 200,
  light: 300,
  regular: 400,
  normal: 400,
  book: 400,
  medium: 500,
  semibold: 600,
  demibold: 600,
  bold: 700,
  extrabold: 800,
  ultrabold: 800,
  black: 900,
  heavy: 900,
};

const toWeight = (v) => {
  if (typeof v !== 'string') return v;
  const key = v.toLowerCase().replace(/[^a-z]/g, '');
  return WEIGHTS[key] ?? v;
};

StyleDictionary.registerPreprocessor({
  name: 'lumo/normalise',
  preprocessor: (dict) => {
    const walk = (node) => {
      for (const key of Object.keys(node)) {
        const token = node[key];
        if (!token || typeof token !== 'object') continue;

        if (token.$type === 'fontWeight' && !isAlias(token.$value)) {
          token.$value = toWeight(token.$value);
        } else if (token.$type === 'typography' && token.$value) {
          token.$value = { ...token.$value, fontWeight: toWeight(token.$value.fontWeight) };
        } else if (!('$value' in token)) {
          walk(token);
        }
      }
      return node;
    };
    return walk(dict);
  },
});

// ---------------------------------------------------------------------------
// 3. Builds
// ---------------------------------------------------------------------------
const src = (files) => files.map((f) => path.join(CLEAN_DIR, f));

const cssDict = (sources, buildPath, files) =>
  new StyleDictionary({
    usesDtcg: true,
    log: { warnings: 'disabled' },
    source: src(sources),
    preprocessors: ['lumo/normalise'],
    platforms: { css: { transformGroup: 'css', buildPath, files } },
  });

async function buildPlatform(platform) {
  // :root -- core + light colours + this platform's type/space/size + styles
  await cssDict(
    [...SHARED, LIGHT, ...perPlatform(platform), ...STYLES],
    `build/css/${platform}/`,
    [
      {
        destination: 'tokens.css',
        format: 'css/variables',
        options: { selector: ':root', outputReferences: true },
      },
    ],
  ).buildAllPlatforms();

  // dark -- only the colours that actually change
  await cssDict([...SHARED, DARK], `build/css/${platform}/`, [
    {
      destination: 'tokens-dark.css',
      format: 'css/variables',
      options: { selector: '[data-theme="dark"]' },
      filter: (t) => t.filePath.includes('color.on-dark'),
    },
  ]).buildAllPlatforms();
}

async function buildLayout(mode) {
  await cssDict([`lumo.semantic.layout.${mode}.tokens.json`], 'build/css/layout/', [
    {
      destination: `tokens.${mode}.css`,
      format: 'css/variables',
      options: { selector: `[data-breakpoint="${mode}"]` },
    },
  ]).buildAllPlatforms();
}

async function buildNative() {
  const sources = src([...SHARED, LIGHT, ...perPlatform('mobile'), ...STYLES]);
  await new StyleDictionary({
    usesDtcg: true,
    log: { warnings: 'disabled' },
    source: sources,
    preprocessors: ['lumo/normalise'],
    platforms: {
      ios: {
        transformGroup: 'ios-swift',
        buildPath: 'build/ios/',
        files: [
          {
            destination: 'Tokens.swift',
            format: 'ios-swift/class.swift',
            options: { className: 'Tokens' },
          },
        ],
      },
      android: {
        transformGroup: 'android',
        buildPath: 'build/android/',
        files: [
          {
            destination: 'colors.xml',
            format: 'android/resources',
            resourceType: 'color',
            filter: (t) => (t.$type ?? t.type) === 'color',
          },
        ],
      },
    },
  }).buildAllPlatforms();
}

// ---------------------------------------------------------------------------
const { deduped, dropped } = cleanTokens();

for (const platform of PLATFORMS) {
  console.log(`css    ${platform}`);
  await buildPlatform(platform);
}
for (const mode of LAYOUTS) {
  console.log(`css    layout/${mode}`);
  await buildLayout(mode);
}
console.log('native ios + android');
await buildNative();

console.log('\nBuild complete.');

if (deduped.length) {
  console.log(
    `\n${deduped.length} self-referencing tokens resolved from the core tier instead:`,
  );
  for (const d of deduped) console.log(`  ${d}`);
}
if (dropped.length) {
  console.log(
    `\nWARNING -- ${dropped.length} tokens have no real value anywhere in the export and were skipped.`,
  );
  console.log('Give these a value in Figma and re-export:');
  for (const d of dropped) console.log(`  ${d}`);
}
