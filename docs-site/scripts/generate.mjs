/**
 * Build the whole reference site from the repo, at one pinned commit.
 *
 * Per `.claude/skills/astro-page/SKILL.md`. There is deliberately no mode that
 * generates one page: every page is derived from the same commit, and a site
 * built a page at a time has pages derived from different ones. A component
 * page claiming a prop exists, beside a Code tab generated two commits earlier
 * saying it does not, is worse than either page alone — the reader cannot tell
 * which is current.
 *
 * Four inputs and nothing else:
 *   1. the repo at a pinned commit (argv[2], recorded on every page)
 *   2. src/data/board-statuses.json  — written each run, NO record ids
 *   3. src/data/figma + intent files  — the live Figma reads, transposed
 *   4. src/data/storybook-stories.json — from the DEPLOYED Storybook index.json
 *
 * A sentence on a generated page that came from none of those is invented.
 *
 * Run: node docs-site/scripts/generate.mjs <sha>
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, '..');
const repo = path.resolve(site, '..');
const docs = path.join(site, 'src/content/docs');

const SHA = process.argv[2];
if (!SHA) {
  console.error('generate.mjs — refusing to run without a pinned commit sha.');
  process.exit(1);
}
const SHORT = SHA.slice(0, 12);

const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'));
const board = JSON.parse(fs.readFileSync(path.join(site, 'src/data/board-statuses.json'), 'utf8'));
const stories = JSON.parse(fs.readFileSync(path.join(site, 'src/data/storybook-stories.json'), 'utf8'));

const STORYBOOK = 'https://lumo-design-system-aye-kyawts-projects.vercel.app';
const FIGMA_FILE = 'https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress';
const GITHUB = 'https://github.com/Aye-Kyawt/lumo-design-system';

/** The ten public components, in the order src/index.ts exports them. */
const COMPONENTS = [
  { key: 'accordion', dir: 'accordion', export: 'Accordion', slug: 'accordion', sbTitle: 'Accordion', label: 'Accordion' },
  { key: 'badge', dir: 'badge', export: 'Badge', slug: 'badge', sbTitle: 'Badge', label: 'Badge' },
  { key: 'button', dir: 'button', export: 'Button', slug: 'button', sbTitle: 'Button', label: 'Button' },
  { key: 'card', dir: 'card', export: 'Card', slug: 'card', sbTitle: 'Card', label: 'Card' },
  { key: 'cardLayoutVertical', dir: 'card', export: 'CardLayoutVertical', slug: 'card-layout-vertical', sbTitle: 'Card', label: 'Card Layout Vertical' },
  { key: 'emptyState', dir: 'emptyState', export: 'EmptyState', slug: 'empty-state', sbTitle: 'Empty State', label: 'Empty State' },
  { key: 'field', dir: 'field', export: 'Field', slug: 'field', sbTitle: 'Field', label: 'Field' },
  { key: 'progress', dir: 'progress', export: 'Progress', slug: 'progress', sbTitle: 'Progress', label: 'Progress' },
  { key: 'switch', dir: 'switch', export: 'Switch', slug: 'switch', sbTitle: 'Switch', label: 'Switch' },
  { key: 'toast', dir: 'toast', export: 'Toast', slug: 'toast', sbTitle: 'Toast', label: 'Toast' },
];

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */

const GEN_BANNER = (what) =>
  `{/*\n  GENERATED — do not edit by hand.\n  ${what}\n  Written by docs-site/scripts/generate.mjs from commit ${SHORT}.\n  Fix the generator or its inputs, never this file: a hand edit is overwritten\n  by the next run and is indistinguishable from generated text until then.\n*/}\n`;

/** The missing-source notice. Keeps the section, names what is absent and whose it is. */
function notice(title, body, owner) {
  return `:::caution[${title}]\n${body}${owner ? `\n\n**Owner:** ${owner}` : ''}\n:::\n`;
}

const esc = (s) => String(s).replace(/[{}<>]/g, (c) => ({ '{': '&#123;', '}': '&#125;', '<': '&lt;', '>': '&gt;' }[c]));

function write(rel, body) {
  const out = path.join(docs, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, body);
  return rel;
}

function intentFor(c) {
  const p = path.join(repo, 'src/components', c.dir, `${c.key}.intent.json`);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
}

/**
 * Which stories are variant-matrix rows and which are worked examples.
 *
 * Matrix rows belong on the Design tab; repeating them under Examples makes
 * Examples a second matrix instead of a set of examples. The rule: a story is
 * a matrix row when its name matches a variant value from the intent file, or
 * when it says so ("all", "variants", "states", "as the set is drawn").
 */
function classifyStories(c, intent) {
  const all = stories[c.sbTitle] || [];
  const values = new Set();
  for (const prop of Object.values(intent?.variant_intent ?? {})) {
    for (const v of Object.keys(prop)) values.add(v.toLowerCase());
  }
  const isMatrix = (name) => {
    const n = name.toLowerCase();
    if (values.has(n)) return true;
    // A story named `Property=Value` is a matrix row by construction -- that is
    // how Figma names a variant. Without this, Switch's `On=true` / `On=false`
    // land under Examples, which is the one thing Examples must not contain.
    // Matches `On=true`, `Tone=Primary`, `Size = sm (94:7)` and
    // `Tone=Primary, Size=md`: a property name, then `=`. The trailing node
    // reference some stories carry is deliberately not part of the test.
    if (/^[A-Za-z][\w ]{0,24}=/.test(name.trim())) return true;
    return /\b(all|variants?|states?|as the set is drawn|matrix|sizes)\b/.test(n);
  };
  return {
    matrix: all.filter((s) => isMatrix(s.name)),
    examples: all.filter((s) => !isMatrix(s.name)),
  };
}

function embed(story, theme) {
  const url = `${STORYBOOK}/iframe.html?id=${story.id}&globals=theme:${theme}`;
  return `<iframe\n  src="${url}"\n  title="${esc(story.name)} — ${theme}"\n  loading="lazy"\n  style="width:100%;height:220px;border:1px solid var(--lumo-docs-border);border-radius:8px;background:var(--lumo-docs-surface)"\n></iframe>`;
}

/** Props with defaults and doc comments, read from the JSDoc on the component. */
function propsFor(c) {
  const file = path.join(repo, 'src/components', c.dir, `${c.key}.jsx`);
  if (!fs.existsSync(file)) return { props: [], unions: [] };
  const code = fs.readFileSync(file, 'utf8');

  const docs = [];
  for (const m of code.matchAll(/@param \{([^}]+)\} \[?props\.(\w+)\]?([\s\S]*?)(?=\n \* @param|\n \*\/)/g)) {
    const text = m[3].replace(/\n \*/g, ' ').replace(/\s+/g, ' ').trim();
    docs.push({ name: m[2], type: m[1], doc: text });
  }
  const sig = code.match(/export function \w+\(\{([\s\S]*?)\}\)/);
  const defaults = {};
  if (sig) {
    for (const line of sig[1].split('\n')) {
      const d = line.match(/^\s*(\w+)\s*=\s*(.+?),?\s*$/);
      if (d) defaults[d[1]] = d[2].replace(/,$/, '');
      else {
        const bare = line.match(/^\s*(\w+),\s*$/);
        if (bare && bare[1] !== '...rest') defaults[bare[1]] = undefined;
      }
    }
  }
  const props = docs.map((d) => ({ ...d, default: defaults[d.name] }));
  const unions = docs.filter((d) => d.type.includes('|') && d.type.includes("'"));
  return { props, unions };
}

/** Token values, light and dark, from the generated output. */
const tokenValues = (() => {
  const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');
  const parse = (css) => {
    const out = {};
    for (const m of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gm)) out[m[1]] = m[2].trim();
    return out;
  };
  return {
    light: parse(read(path.join(repo, 'build/css/web/tokens.css'))),
    dark: parse(read(path.join(repo, 'build/css/web/tokens-dark.css'))),
  };
})();

function git(args) {
  try {
    return execSync(`git ${args}`, { cwd: repo, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const TAGS = git('tag --list').split('\n').filter(Boolean);

/* ------------------------------------------------------------------ *
 * The component page: a header strip, then five tabs
 * ------------------------------------------------------------------ */

function componentPage(c) {
  const intent = intentFor(c);
  const { matrix, examples } = classifyStories(c, intent);
  const { props, unions } = propsFor(c);
  const status = board.components?.[c.key] ?? {};
  const buildReport = path.join(repo, 'docs', `${c.key}.md`);
  const hasReport = fs.existsSync(buildReport);

  const L = [];
  L.push('---');
  L.push(`title: ${c.label}`);
  L.push(`description: ${c.label} in the Lumo Design System — what it is for, how to use it, and what it is built from.`);
  L.push('---');
  L.push('');
  L.push("import { Tabs, TabItem, Badge as SlBadge } from '@astrojs/starlight/components';");
  L.push('');
  L.push(GEN_BANNER(`The reference page for ${c.label}.`));

  /* ---- the header strip ---- */
  const sbTop = (stories[c.sbTitle] || [])[0];
  L.push('## ' + '​'); // keep Starlight's ToC from swallowing the strip
  L.pop();
  L.push('<div class="lumo-strip">');
  if (status.development) {
    L.push(`<span class="lumo-strip__status" data-status="${status.development}">${status.development}</span>`);
  } else {
    L.push('<span class="lumo-strip__status" data-status="unknown">status unknown</span>');
  }
  if (status.shipped_in) {
    L.push(`<span class="lumo-strip__version">shipped in ${status.shipped_in}</span>`);
  } else {
    L.push('<span class="lumo-strip__version">no shipped version</span>');
  }
  if (status.verdict) {
    L.push(`<span class="lumo-strip__verdict" data-verdict="${status.verdict}">${status.verdict}</span>`);
  }
  L.push('<span class="lumo-strip__links">');
  if (sbTop) L.push(`<a href="${STORYBOOK}/?path=/story/${sbTop.id}">Storybook</a>`);
  if (intent?.figma_node) L.push(`<a href="${FIGMA_FILE}?node-id=${intent.figma_node.replace(':', '-')}">Figma node ${intent.figma_node}</a>`);
  L.push(`<a href="${GITHUB}/blob/${SHA}/src/components/${c.dir}/${c.key}.jsx">Source</a>`);
  L.push('</span>');
  L.push('</div>');
  L.push('');

  if (!status.development) {
    L.push(
      notice(
        'This component has no status',
        status._note ??
          board._unavailable?.reason ??
          'The registry has no row for this component, so there is no status to show.',
        board._unavailable?.owner ?? 'human:designer',
      ),
    );
  }

  L.push('<Tabs>');

  /* ---- 1. Usage ---- */
  L.push('<TabItem label="Usage">');
  if (!intent) {
    L.push(notice('No intent file', `\`src/components/${c.dir}/${c.key}.intent.json\` does not exist, so there is nothing to publish here. It is written by the component-intent skill.`, 'doc-generator'));
  } else {
    L.push('### When to use it');
    if (intent.use_when.length) {
      for (const u of intent.use_when) L.push(`> ${esc(u.verbatim)}`);
      L.push('');
      L.push(`<small>From the ${intent.use_when[0].source.library} library — the \`${intent.use_when[0].source.component}\` description, read ${intent.use_when[0].source.read_on}.</small>`);
    } else {
      L.push(notice('Not decided', 'No usage region could be sourced for this component, so there is no statement of when to use it. An empty field here is deliberate: a plausible sentence nobody decided would be read as the design system’s position.', 'human:designer'));
    }
    L.push('');

    L.push('### Where it goes');
    if (intent.placement.length) for (const p of intent.placement) L.push(`- ${esc(p.statement)}`);
    else L.push(notice('Not recorded', 'The stories do not demonstrate placement for this component.', 'human:designer'));
    L.push('');

    L.push('### When not to use it');
    if (intent.dont_use_when.length) {
      for (const d of intent.dont_use_when) {
        L.push(`- ${esc(d.verbatim)}`);
        if (d.use_instead) L.push(`  - **Use instead:** \`${d.use_instead}\` — not implemented in this library yet.`);
        else L.push('  - **No alternative named.** The source states the prohibition without saying what to reach for instead.');
      }
    } else {
      L.push(notice('Not decided', 'No prohibition could be sourced.', 'human:designer'));
    }
    L.push('');

    L.push('### What each variant is for');
    const vi = intent.variant_intent ?? {};
    if (Object.keys(vi).length) {
      L.push('| Property | Value | What it is for |');
      L.push('|---|---|---|');
      for (const [prop, values] of Object.entries(vi)) {
        for (const [v, meta] of Object.entries(values)) {
          L.push(`| \`${prop}\` | \`${v}\` | ${meta.meaning ? esc(meta.meaning) : '_not stated in the source_'} |`);
        }
      }
      if (Object.values(vi).some((p) => Object.values(p).some((m) => !m.meaning))) {
        L.push('');
        L.push(notice('Variant meanings are not stated', 'The component description says what the component is for, never what an individual value means. Every value above is implemented and tested; what each one is *for* is a design decision nobody has written down.', 'human:designer'));
      }
    }
    L.push('');

    L.push('### Accessibility');
    if (intent.a11y.length) {
      for (const a of intent.a11y) {
        L.push(`- ${esc(a.fact)}  \n  <small><a href="${GITHUB}/blob/${SHA}/${a.source.split(':')[0]}#L${a.source.split(':')[1]}">${a.source}</a></small>`);
      }
    } else L.push(notice('Not recorded', 'No accessibility facts are recorded for this component.', 'engineer'));
    L.push('');

    L.push('### Composition');
    if (intent.pairs_with.length) for (const p of intent.pairs_with) L.push(`- Used with \`${esc(p.component)}\``);
    else L.push('Nothing in the stories shows this component composed with another.');
    L.push('');

    L.push('### What this version promises');
    L.push(`See [Versioning](/get-started/versioning/). At \`${pkg.version}\` the public surface is the named exports of \`src/index.ts\`; this component is one of them.`);
    if (!TAGS.length) L.push('');
    if (status.verdict === 'Cleared') {
      L.push(
        `This component's release verdict is **Cleared** and its \`Development\` status reads ` +
          `**${status.development}**. A \`Cleared\` verdict is a recommendation with reasons, ` +
          'recorded in its release review — [a human decides whether a release happens]' +
          '(/get-started/versioning/), and no agent approves its own work.',
      );
    } else if (status.verdict === 'Blocked') {
      L.push(
        notice(
          'This component is Blocked',
          `Its release verdict reads **Blocked**, so it is documented and shipped but has not been ` +
            `cleared for release. Its \`Development\` status reads **${status.development}**. ` +
            'The reasons are in its release review; `Blocked` is terminal and only a human restarts it.',
          'a human',
        ),
      );
    } else {
      L.push(
        notice(
          'No release review',
          `No release verdict has been recorded for this component${status.development ? `, and its \`Development\` status reads **${status.development}**` : ''}. ` +
            'It has not been independently reviewed against its Figma node by anything but the test suite, ' +
            'which compares it against its own documented API.',
          'release',
        ),
      );
    }
  }
  L.push('</TabItem>');

  /* ---- 2. Examples ---- */
  L.push('<TabItem label="Examples">');
  const readme = fs.readFileSync(path.join(repo, 'README.md'), 'utf8');
  const usageBlock = readme.match(/```jsx\n([\s\S]*?)```/);
  if (usageBlock && c.key === 'card') {
    L.push("### The README's own example");
    L.push('```jsx');
    L.push(usageBlock[1].trimEnd());
    L.push('```');
    L.push('');
  }
  if (examples.length) {
    L.push('Every story that is not a variant-matrix row, embedded live from the deployed Storybook in both themes. The matrix itself is on the **Design** tab.');
    L.push('');
    for (const s of examples) {
      L.push(`#### ${esc(s.name)}`);
      L.push('<div class="lumo-embeds">');
      L.push(embed(s, 'light'));
      L.push(embed(s, 'dark'));
      L.push('</div>');
      L.push('');
    }
  } else {
    L.push(notice('No worked examples', `Every story for ${c.label} is a variant-matrix row, so there is nothing here that is not already on the Design tab.`, 'engineer'));
  }
  L.push('</TabItem>');

  /* ---- 3. Code ---- */
  L.push('<TabItem label="Code">');
  L.push('### Import');
  L.push('```js');
  L.push(`import { ${c.export} } from '${pkg.name}';`);
  L.push('```');
  L.push('');
  L.push('### Props');
  if (props.length) {
    L.push('| Prop | Type | Default | Notes |');
    L.push('|---|---|---|---|');
    for (const p of props) {
      L.push(`| \`${p.name}\` | \`${esc(p.type)}\` | ${p.default === undefined ? '—' : `\`${esc(p.default)}\``} | ${esc(p.doc)} |`);
    }
  } else L.push(notice('No documented props', 'No JSDoc @param entries were found on this component.', 'engineer'));
  L.push('');
  if (unions.length) {
    L.push('### Union types');
    for (const u of unions) L.push(`- \`${u.name}\`: \`${esc(u.type)}\``);
    L.push('');
  }
  L.push('### Tokens it needs');
  if (intent?.required_tokens?.length) {
    L.push('| Token | Light | Dark |');
    L.push('|---|---|---|');
    for (const t of intent.required_tokens) {
      const l = tokenValues.light[t];
      const d = tokenValues.dark[t];
      L.push(`| \`${t}\` | ${l ? `\`${esc(l)}\`` : '_not in the build_'} | ${d ? `\`${esc(d)}\`` : '—'} |`);
    }
    L.push('');
    L.push('A dash under **Dark** means the token does not change between themes.');
  } else L.push(notice('No tokens recorded', 'The intent file lists no required tokens.', 'doc-generator'));
  L.push('');
  L.push("### Storybook's own props table");
  if (sbTop) {
    L.push(`<iframe src="${STORYBOOK}/iframe.html?id=${sbTop.id}&viewMode=docs" title="${c.label} props table" loading="lazy" style="width:100%;height:420px;border:1px solid var(--lumo-docs-border);border-radius:8px"></iframe>`);
  } else L.push(notice('No Storybook entry', 'The deployed Storybook index has no story for this component.', 'engineer'));
  L.push('</TabItem>');

  /* ---- 4. Design ---- */
  L.push('<TabItem label="Design">');
  L.push('### The Figma node');
  if (intent?.figma_node) {
    L.push(`<iframe src="https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(`${FIGMA_FILE}?node-id=${intent.figma_node.replace(':', '-')}`)}" title="${c.label} in Figma" loading="lazy" style="width:100%;height:420px;border:1px solid var(--lumo-docs-border);border-radius:8px"></iframe>`);
    L.push('');
    L.push(notice('The embed may not load', 'The Figma file is team-only. If the frame above is blank, open the node directly from the header link — a 403 from a team-only file is expected, not a broken link.', null));
  } else L.push(notice('No Figma node recorded', 'The intent file names no node for this component.', 'doc-generator'));
  L.push('');
  L.push('### The variant matrix');
  if (matrix.length) {
    L.push('Each row as the set draws it, in both themes.');
    L.push('');
    for (const s of matrix) {
      L.push(`#### ${esc(s.name)}`);
      L.push(`<small><a href="${STORYBOOK}/?path=/story/${s.id}">Open in Storybook</a></small>`);
      L.push('<div class="lumo-embeds">');
      L.push(embed(s, 'light'));
      L.push(embed(s, 'dark'));
      L.push('</div>');
      L.push('');
    }
  } else L.push(notice('No matrix stories', 'No story for this component looks like a variant-matrix row.', 'engineer'));
  L.push('');
  L.push('### What Figma never bound, and the gaps recorded against it');
  if (hasReport) {
    const report = fs.readFileSync(buildReport, 'utf8');
    const gapSection = report.split(/^## Design gaps/m)[1];
    if (gapSection) {
      const body = gapSection.split(/^## /m)[0].trim();
      // Build reports contain prose like "the node's <Label> layer", which MDX
      // reads as JSX. Escape bare angle brackets outside code spans: a report is
      // prose, not markup, and must never be parsed as a component.
      const safe = body
        .split(/(`[^`]*`)/)
        .map((part, i) => (i % 2 ? part : part.replace(/</g, '&lt;').replace(/>/g, '&gt;')))
        .join('');
      L.push(safe.replace(/^#/gm, '####'));
    } else {
      L.push(`The build report [\`docs/${c.key}.md\`](${GITHUB}/blob/${SHA}/docs/${c.key}.md) records no "Design gaps" section.`);
    }
    L.push('');
    L.push(`<small>From the build report, <a href="${GITHUB}/blob/${SHA}/docs/${c.key}.md">docs/${c.key}.md</a>.</small>`);
  } else {
    L.push(notice('No build report', `\`docs/${c.key}.md\` does not exist, so the unbound values and design gaps for this component are not recorded anywhere.`, 'engineer'));
  }
  L.push('');
  L.push(`Where Figma and this repo disagree across the system, see the [disagreements record](${GITHUB}/blob/${SHA}/docs-site/src/content/docs/disagreements.mdx).`);
  L.push('</TabItem>');

  /* ---- 5. Changelog ---- */
  L.push('<TabItem label="Changelog">');
  const log = git(`log --pretty=format:%h%x09%ad%x09%s --date=short ${SHA} -- src/components/${c.dir}/`);
  if (log) {
    L.push('Every commit touching this component **and its subcomponents** — a change to a subcomponent changes the component, and a log that reads only the parent file misses it.');
    L.push('');
    L.push('| Commit | Date | Shipped in | Subject |');
    L.push('|---|---|---|---|');
    for (const line of log.split('\n')) {
      const [h, date, ...rest] = line.split('\t');
      const subject = rest.join('\t');
      const shipped = TAGS.length ? '_unknown_' : '_no tags exist_';
      L.push(`| [\`${h}\`](${GITHUB}/commit/${h}) | ${date} | ${shipped} | ${esc(subject)} |`);
    }
    L.push('');
    if (!TAGS.length) {
      L.push(notice('No commit can be marked with a version', 'The repository carries no git tags, so there is no way to say which release a commit shipped in.', 'a human — cut a tagged release'));
    }
  } else L.push(notice('No history', 'No commits touch this component at the pinned commit.', null));
  L.push('</TabItem>');

  L.push('</Tabs>');
  L.push('');
  L.push(`<small>Generated from commit <a href="${GITHUB}/commit/${SHA}"><code>${SHORT}</code></a>.</small>`);
  return write(`core/components/${c.slug}.mdx`, L.join('\n') + '\n');
}

/* ------------------------------------------------------------------ *
 * Home — a splash page
 * ------------------------------------------------------------------ */

function homePage() {
  const readme = fs.readFileSync(path.join(repo, 'README.md'), 'utf8');
  // The hero line is the README's first paragraph. Transposed, not improved:
  // today it describes the token pipeline rather than the system, which reads
  // oddly as a hero. That is a finding for a human, not licence to rewrite it.
  const firstPara = readme
    .split(/\n#{1,6} /)[0]
    .split('\n')
    .slice(1)
    .join('\n')
    .trim()
    .split(/\n\s*\n/)[0]
    .replace(/\n/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();

  const L = [];
  L.push('---');
  L.push('title: Lumo Design System');
  L.push('description: The reference for the Lumo Design System — what each component is for, when to reach for it, and which tokens it is built from.');
  L.push('template: splash');
  L.push('hero:');
  L.push('  tagline: |');
  L.push(`    ${firstPara}`);
  L.push('  actions:');
  L.push('    - text: Start designing');
  L.push('      link: /designing/introduction/');
  L.push('      icon: right-arrow');
  L.push('      variant: primary');
  L.push('    - text: Start coding');
  L.push('      link: /developing/introduction/');
  L.push('      icon: right-arrow');
  L.push('    - text: Open Storybook');
  L.push(`      link: ${STORYBOOK}/`);
  L.push('      icon: external');
  L.push('      attrs:');
  L.push('        target: _blank');
  L.push('---');
  L.push('');
  L.push("import { Card, CardGrid, LinkCard } from '@astrojs/starlight/components';");
  L.push('');
  L.push(GEN_BANNER('The home page.'));

  L.push('## The latest release');
  if (TAGS.length) {
    const latest = TAGS[TAGS.length - 1];
    L.push(`**${latest}**`);
    L.push('');
    L.push('```bash');
    L.push(`npm install ${pkg.name}@${pkg.version}`);
    L.push('```');
  } else {
    L.push('```bash');
    L.push(`npm install ${pkg.name}`);
    L.push('```');
    L.push('');
    L.push(
      notice(
        'No tagged release',
        `The package is published at \`${pkg.version}\`, but this repository carries no git tags, so there is no release record behind that number. The install command above is derived from \`package.json\` rather than typed out, so it cannot drift from the package.`,
        'a human — cut a tagged release',
      ),
    );
  }
  L.push('');
  L.push('<CardGrid>');
  L.push('  <LinkCard title="Designing" description="What the system is for, and how to work in the Figma library." href="/designing/introduction/" />');
  L.push('  <LinkCard title="Developing" description="Install it, import it, and load the two stylesheets in the right order." href="/developing/introduction/" />');
  L.push('  <LinkCard title="Components" description="All ten public components, each with usage, examples, code, design and history." href="/core/components/" />');
  L.push('  <LinkCard title="Tokens" description="Every generated token, with its light and dark value." href="/core/tokens/" />');
  L.push('</CardGrid>');
  L.push('');
  L.push(`<small>Generated from commit <a href="${GITHUB}/commit/${SHA}"><code>${SHORT}</code></a>.</small>`);
  return write('index.mdx', L.join('\n') + '\n');
}

/* ------------------------------------------------------------------ *
 * All components
 * ------------------------------------------------------------------ */

function allComponentsPage() {
  const L = [];
  L.push('---');
  L.push('title: All components');
  L.push('description: The ten public components of the Lumo Design System, with their status and what each is for.');
  L.push('---');
  L.push('');
  L.push(GEN_BANNER('The component index.'));
  L.push(`Ten components are exported from \`src/index.ts\`. Everything else in \`src/components/\` is internal — see [the public API record](${GITHUB}/blob/${SHA}/docs/public-api.md) for what was kept out and why.`);
  L.push('');
  L.push('| Component | Status | What it is for |');
  L.push('|---|---|---|');
  for (const c of COMPONENTS) {
    const intent = intentFor(c);
    const status = board.components?.[c.key]?.development ?? '_unknown_';
    const use = intent?.use_when?.[0]?.verbatim ?? '_not decided_';
    L.push(`| [${c.label}](/core/components/${c.slug}/) | ${status} | ${esc(use)} |`);
  }
  L.push('');
  if (!Object.values(board.components ?? {}).some((v) => v.development)) {
    L.push(notice('No statuses', board._unavailable?.reason ?? '', board._unavailable?.owner));
  }
  L.push('');
  L.push(`<small>Generated from commit <a href="${GITHUB}/commit/${SHA}"><code>${SHORT}</code></a>.</small>`);
  return write('core/components/index.mdx', L.join('\n') + '\n');
}

/* ------------------------------------------------------------------ *
 * Tokens — from the built output, never from tokens/
 * ------------------------------------------------------------------ */

function tokensPage() {
  const L = [];
  L.push('---');
  L.push('title: Tokens');
  L.push('description: Every generated token in the web platform build, with its light and dark value.');
  L.push('---');
  L.push('');
  L.push(GEN_BANNER('The token reference, read from build/css/web/.'));
  const names = Object.keys(tokenValues.light);
  if (!names.length) {
    L.push(notice('No token build', 'The generated token CSS is missing. Run `npm run build:tokens` at the repo root first.', 'engineer'));
    return write('core/tokens.mdx', L.join('\n') + '\n');
  }
  L.push(`${names.length} tokens in the **web** platform build. Values come from \`build/css/web/tokens.css\` and \`tokens-dark.css\` — the generated output, never \`tokens/\`, so this page cannot drift from what ships.`);
  L.push('');
  L.push('The package exposes the web build only. `mobile` and `admin` are separate `:root` sheets and concatenating them would have them overwrite each other; see the public API record.');
  L.push('');
  const groups = {};
  for (const n of names) {
    const family = n.replace(/^--/, '').split('-')[0];
    (groups[family] = groups[family] || []).push(n);
  }
  for (const family of Object.keys(groups).sort()) {
    L.push(`## ${family}`);
    L.push('');
    L.push('| Token | Light | Dark |');
    L.push('|---|---|---|');
    for (const n of groups[family].sort()) {
      const d = tokenValues.dark[n];
      L.push(`| \`${n}\` | \`${esc(tokenValues.light[n])}\` | ${d ? `\`${esc(d)}\`` : '—'} |`);
    }
    L.push('');
  }
  L.push(`<small>Generated from commit <a href="${GITHUB}/commit/${SHA}"><code>${SHORT}</code></a>.</small>`);
  return write('core/tokens.mdx', L.join('\n') + '\n');
}

/* ------------------------------------------------------------------ *
 * Changelog, Roadmap, News
 * ------------------------------------------------------------------ */

function changelogPage() {
  const L = [];
  L.push('---');
  L.push('title: Changelog');
  L.push('description: What changed in the Lumo Design System, from the repository history.');
  L.push('---');
  L.push('');
  L.push(GEN_BANNER('The site-level changelog, from git history.'));
  if (!TAGS.length) {
    L.push(
      notice(
        'There are no releases to list',
        'This repository carries no git tags and no `CHANGELOG.md`, so there is no release history to render. [Versioning](/get-started/versioning/) says that until there is, `git log` between two tags *is* the changelog — and there are no tags to sit between.',
        'a human — cut a tagged release',
      ),
    );
    L.push('');
  }
  L.push('## Recent commits');
  L.push('');
  const log = git(`log --pretty=format:%h%x09%ad%x09%s --date=short -n 40 ${SHA}`);
  L.push('| Commit | Date | Subject |');
  L.push('|---|---|---|');
  for (const line of log.split('\n').filter(Boolean)) {
    const [h, date, ...rest] = line.split('\t');
    L.push(`| [\`${h}\`](${GITHUB}/commit/${h}) | ${date} | ${esc(rest.join('\t'))} |`);
  }
  L.push('');
  L.push(`<small>The 40 most recent commits at <a href="${GITHUB}/commit/${SHA}"><code>${SHORT}</code></a>.</small>`);
  return write('get-started/changelog.mdx', L.join('\n') + '\n');
}

/**
 * Roadmap and News state no date, owner or priority that a source does not
 * state. This is the field most likely to go wrong: a roadmap with no dates
 * looks unfinished, and a plausible quarter is easy to write and is read as a
 * commitment. There is no roadmap source in this repository, so the page says
 * so and lists nothing.
 */
function roadmapPage() {
  const L = [];
  L.push('---');
  L.push('title: Roadmap');
  L.push('description: What is planned for the Lumo Design System.');
  L.push('---');
  L.push('');
  L.push(GEN_BANNER('The roadmap. Carries only what a source states.'));
  L.push(
    notice(
      'There is no roadmap source',
      'Nothing in this repository records planned work with a date, an owner or a priority. This page deliberately lists nothing rather than inferring a plan from open questions and TODOs: a date nobody committed to is read as a commitment.\n\nWhat *is* recorded, and is not a roadmap, is the set of open questions in `tools.md` and in the release-review skill.',
      'a human',
    ),
  );
  L.push('');
  L.push('## Known gaps, without dates');
  L.push('');
  L.push('These are stated in the repository as unresolved. None carries a date, an owner or a priority, so none is given one here.');
  L.push('');
  const gaps = [
    ['No component has a `Cleared` release verdict', 'The registry is not reachable from the release machinery, so no release review has run.'],
    ['The reference site is not the production branch', 'The Vercel project still builds `main`; this site is specified to be built from `astro`.'],
    ['Five named alternatives do not exist', 'The usage guidance points at `Chip`, `Checkbox`, `Spinner`, `Modal or an Alert` and `card/layout/horizontal`, none of which is implemented.'],
    ['Variant meanings are unwritten', 'Every component description says what the component is for, never what an individual variant value means.'],
    ['No accessibility audit', '`@storybook/addon-a11y` is not installed, so the per-state a11y checks are manual.'],
  ];
  L.push('| Gap | What is recorded |');
  L.push('|---|---|');
  for (const [g, d] of gaps) L.push(`| ${g} | ${d} |`);
  L.push('');
  L.push(`<small>Generated from commit <a href="${GITHUB}/commit/${SHA}"><code>${SHORT}</code></a>.</small>`);
  return write('get-started/roadmap.mdx', L.join('\n') + '\n');
}

function newsPage() {
  const L = [];
  L.push('---');
  L.push('title: News');
  L.push('description: What has happened in the Lumo Design System.');
  L.push('---');
  L.push('');
  L.push(GEN_BANNER('News. Carries only what a source states.'));
  L.push(
    notice(
      'There is no news source',
      'Nothing in this repository is a news feed — no announcements file, no release notes, no dated entries. Rather than invent a timeline, this page reports only what the repository can prove: the published package and the commit history.',
      'a human',
    ),
  );
  L.push('');
  L.push('## What the repository can prove');
  L.push('');
  L.push(`- \`${pkg.name}\` is published at \`${pkg.version}\`.`);
  L.push(`- Tags in this repository: ${TAGS.length ? TAGS.map((t) => `\`${t}\``).join(', ') : '**none**'}.`);
  const last = git(`log -1 --pretty=format:%ad --date=short ${SHA}`);
  if (last) L.push(`- The commit this site was generated from is dated ${last}.`);
  L.push('');
  L.push('For anything finer-grained, see the [Changelog](/get-started/changelog/).');
  L.push('');
  L.push(`<small>Generated from commit <a href="${GITHUB}/commit/${SHA}"><code>${SHORT}</code></a>.</small>`);
  return write('get-started/news.mdx', L.join('\n') + '\n');
}

/* ------------------------------------------------------------------ *
 * run
 * ------------------------------------------------------------------ */

const written = [];
written.push(homePage());
written.push(allComponentsPage());
for (const c of COMPONENTS) written.push(componentPage(c));
written.push(tokensPage());
written.push(changelogPage());
written.push(roadmapPage());
written.push(newsPage());

console.log(`generate.mjs — ${written.length} pages from ${SHORT}`);
for (const w of written) console.log(`  ${w}`);
