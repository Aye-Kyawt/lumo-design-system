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
// 3. A flat JSON mirror of every stylesheet
//
// Storybook needs more than CSS can carry: each token's $type, whether it
// aliases another token or holds a literal, and the Figma path behind it.
// Rather than re-parse the stylesheets, every CSS build emits the same
// tokens as JSON -- same names, same transformed values, plus that metadata.
// ---------------------------------------------------------------------------
const valueOf = (t) => t.$value ?? t.value;

StyleDictionary.registerFormat({
  name: 'lumo/json-flat',
  format: ({ dictionary }) =>
    `${JSON.stringify(
      dictionary.allTokens.map((t) => ({
        name: `--${t.name}`,
        value: valueOf(t),
        type: t.$type ?? t.type,
        // The unresolved right-hand side: "{color-neutral-800}" for an alias,
        // the literal itself for a core token. Lets the docs show the chain.
        original: valueOf(t.original),
        isAlias: isAlias(valueOf(t.original)),
        description: t.$description ?? t.comment ?? '',
        path: t.path.join('.'),
        file: path.basename(t.filePath),
      })),
      null,
      2,
    )}\n`,
});

// ---------------------------------------------------------------------------
// 4. Unitless families
//
// Figma variables of type FLOAT carry no unit, so the export stamps every one
// of them as a px dimension. Right for spacing, sizing and radii; wrong for
// opacity, z-index and durations, which are not lengths. Left as px they emit
// invalid CSS (`z-index: 1400px`) that browsers drop, so the token looks
// applied while doing nothing.
// ---------------------------------------------------------------------------
function numeric(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const match = /^(-?\d*\.?\d+)(?:px|rem|ms|s)?$/.exec(value.trim());
    return match ? parseFloat(match[1]) : null;
  }
  if (value && typeof value === 'object' && typeof value.value === 'number') return value.value;
  return null;
}

// Appended after the built-in css transforms so these win, whether the value
// still an object at that point or has already been stringified to px.
//
// Deliberately NOT transitive: an alias like `opacity-disabled -> opacity-40`
// resolves to the value the core token was already given, so re-running the
// transform down the chain would divide a second time and yield 0.004.
const unitFix = (name, prefix, render) => {
  StyleDictionary.registerTransform({
    name,
    type: 'value',
    filter: (t) => String(t.path[0] ?? '').startsWith(prefix) && numeric(valueOf(t)) !== null,
    transform: (t) => render(numeric(valueOf(t))),
  });
  return name;
};

const UNIT_FIXES = [
  unitFix('lumo/opacity-ratio', 'opacity-', (n) => String(n / 100)),
  unitFix('lumo/z-index-unitless', 'z-index-', (n) => String(n)),
  unitFix('lumo/duration-ms', 'motion-duration-', (n) => `${n}ms`),
  // A column count. The other grid tokens really are lengths, so this is the
  // one name rather than the whole `grid-` family.
  unitFix('lumo/grid-columns-unitless', 'grid-columns', (n) => String(n)),
];

StyleDictionary.registerTransformGroup({
  name: 'lumo/css',
  transforms: [...StyleDictionary.hooks.transformGroups.css, ...UNIT_FIXES],
});

// ---------------------------------------------------------------------------
// 5. Builds
// ---------------------------------------------------------------------------
const src = (files) => files.map((f) => path.join(CLEAN_DIR, f));

const dict = (sources, buildPath, files, json) =>
  new StyleDictionary({
    usesDtcg: true,
    log: { warnings: 'disabled' },
    source: src(sources),
    preprocessors: ['lumo/normalise'],
    platforms: {
      css: { transformGroup: 'lumo/css', buildPath, files },
      json: {
        transformGroup: 'lumo/css',
        buildPath: 'build/json/',
        files: [
          { destination: json.destination, format: 'lumo/json-flat', filter: json.filter },
        ],
      },
    },
  });

const isDarkColour = (t) => t.filePath.includes('color.on-dark');

async function buildPlatform(platform) {
  // :root -- core + light colours + this platform's type/space/size + styles
  await dict(
    [...SHARED, LIGHT, ...perPlatform(platform), ...STYLES],
    `build/css/${platform}/`,
    [
      {
        destination: 'tokens.css',
        format: 'css/variables',
        options: { selector: ':root', outputReferences: true },
      },
    ],
    { destination: `${platform}.json` },
  ).buildAllPlatforms();

  // dark -- only the colours that actually change
  await dict(
    [...SHARED, DARK],
    `build/css/${platform}/`,
    [
      {
        destination: 'tokens-dark.css',
        format: 'css/variables',
        options: { selector: '[data-theme="dark"]' },
        filter: isDarkColour,
      },
    ],
    { destination: `${platform}.dark.json`, filter: isDarkColour },
  ).buildAllPlatforms();
}

async function buildLayout(mode) {
  await dict(
    [`lumo.semantic.layout.${mode}.tokens.json`],
    'build/css/layout/',
    [
      {
        destination: `tokens.${mode}.css`,
        format: 'css/variables',
        options: { selector: `[data-breakpoint="${mode}"]` },
      },
    ],
    { destination: `layout.${mode}.json` },
  ).buildAllPlatforms();
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

// Start from an empty build/ so a renamed or removed output can't linger.
fs.rmSync(path.join(__dirname, 'build'), { recursive: true, force: true });

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
