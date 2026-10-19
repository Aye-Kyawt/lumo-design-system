/**
 * Regenerate every src/components/<name>/<name>.intent.json.
 *
 * Per .claude/skills/component-intent/SKILL.md. What comes from where:
 *
 *   use_when, dont_use_when  <- scripts/figma-descriptions.json, which holds the
 *                               VERBATIM component-set descriptions read over the
 *                               Figma MCP. Never written here, never paraphrased.
 *   variant_intent (keys)    <- the component's own `const X = [...]` lists, plus
 *                               BOOLEAN_VARIANTS for the two sets whose variant is
 *                               a boolean. Meanings stay null: the descriptions do
 *                               not explain individual values.
 *   required_tokens          <- the component's shipped CSS, comments stripped,
 *                               minus its own --lumo-* plumbing.
 *   a11y                     <- facts stated here, each anchored to a line located
 *                               by searching the source, so the line numbers cannot
 *                               rot silently -- a fact whose marker disappears is
 *                               dropped rather than pointing at the wrong line.
 *
 * Run: node scripts/build-intent.mjs <commit-sha>
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const FIG = JSON.parse(fs.readFileSync(new URL('./figma-descriptions.json', import.meta.url), 'utf8'));
const LIB = "Lumo.Web.Component.V1.0.Complete";
const READ_ON = '2026-10-19';

/** Component sheets ship; *.stories.css does not. */
function tokensFor(dir) {
  const out = new Set();
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.css') || f.endsWith('.stories.css')) continue;
    const css = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of css.matchAll(/var\((--[a-z0-9-]+)/g)) {
      const name = m[1];
      if (name.startsWith('--lumo-')) continue;       // the component's own plumbing
      if (name.startsWith('--primitives-')) continue; // would be a finding, not a dependency
      out.add(name);
    }
  }
  return [...out].sort();
}

/** Line number of the first line in `file` containing `needle`. */
function lineOf(file, needle) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const i = lines.findIndex((l) => l.includes(needle));
  return i === -1 ? null : i + 1;
}
function src(component, file, needle) {
  const rel = `src/components/${component}/${file}`;
  const n = lineOf(path.join(root, rel), needle);
  return n ? `${rel}:${n}` : null;
}

/** Split a Figma description into its "use" sentence(s) and its "don't" sentence(s). */
function split(desc) {
  const lines = desc.split('\n').map((l) => l.trim()).filter(Boolean);
  const dont = lines.filter((l) => /^Don[’']?t/i.test(l));
  const use = lines.filter((l) => !/^Don[’']?t/i.test(l));
  return { use, dont };
}

/** The alternative a "don't" sentence names, if it names one. */
function alternativeIn(sentence) {
  let m = sentence.match(/use ([A-Z][\w/\-]*(?: [a-z]+)?) (?:for that|instead)/);
  if (m) return m[1];
  m = sentence.match(/use ([a-z][\w/\-]*\/[\w/\-]+)/);        // card/layout/horizontal
  if (m) return m[1];
  m = sentence.match(/that is (?:a )?([A-Z]\w+(?: or an? [A-Z]\w+)?)/); // "that is a Modal or an Alert"
  if (m) return m[1];
  return null;
}

const A11Y = {
  badge: (c) => [
    ['renders a <span>, so it is not focusable and carries no interactive role — the set defines no interaction state because a badge is read, not clicked', src(c, 'badge.jsx', '<span {...rest}')],
  ],
  switch: (c) => [
    ['renders a real <button role="switch"> with aria-checked, so Space and Enter operate it and a screen reader reads the state', src(c, 'switch.jsx', 'role="switch"')],
    ['uses aria-disabled rather than the DOM disabled attribute, so a disabled switch stays focusable and can still be read', src(c, 'switch.jsx', 'aria-disabled=')],
    ['the node carries no label layer, so the accessible name must come from the caller via aria-label or aria-labelledby', src(c, 'switch.jsx', 'aria-label`, or `aria-labelledby')],
    ['the knob is aria-hidden; the parent button is the control, so the knob must not be focusable or announced', src(c, 'switchKnob.jsx', 'aria-hidden')],
  ],
  accordion: (c) => [
    ['the header is a real <button> carrying aria-expanded and aria-controls over a role="region" panel — the disclosure pattern, so Space and Enter operate it', src(c, 'accordion.jsx', 'aria-expanded=')],
    ['the panel is role="region" labelled by the header button, so its content is reachable and named', src(c, 'accordion.jsx', 'role="region"')],
    ['uses aria-disabled rather than the DOM attribute, keeping a disabled header focusable so it can still be read', src(c, 'accordion.jsx', 'aria-disabled=')],
    ['the chevron is aria-hidden decoration; aria-expanded already conveys the state, so announcing it twice is worse', src(c, 'accordionIcon.jsx', 'aria-hidden')],
    ['headingLevel wraps the header in a real heading, which is what lets a screen reader jump between questions in an FAQ list', src(c, 'accordion.jsx', 'Heading ?')],
  ],
  button: (c) => [
    ['state="disabled" sets the real DOM disabled attribute, and rest props are spread first so a caller cannot reach past the component and re-enable it', src(c, 'button.jsx', 'disabled={disabled}')],
    ['an icon-only button takes its accessible name from label via aria-label, because no text is drawn', src(c, 'button.jsx', 'aria-label={iconOnly')],
    ['the icons are aria-hidden decoration', src(c, 'buttonIcon.jsx', 'aria-hidden')],
    ['htmlType defaults to "button", so it cannot submit a form by accident', src(c, 'button.jsx', 'htmlType = ')],
  ],
  card: (c) => [
    ['becomes operable only when given an onClick and not disabled: it then takes role="button" and tabIndex 0, so it is never a focusable element with nothing to do', src(c, 'card.jsx', 'role={interactive')],
    ['when interactive, Enter activates on key down and Space on key up, which is how a real button behaves', src(c, 'card.jsx', 'handleKeyDown')],
    ['aria-disabled marks a disabled card without removing it from the accessibility tree', src(c, 'card.jsx', 'aria-disabled=')],
  ],
  cardLayoutVertical: (c) => [
    ['a layout frame only: it adds no role of its own, so the card around it decides whether the surface is operable', src(c, 'cardLayoutVertical.jsx', 'className={')],
  ],
  emptyState: (c) => [
    ['the title is a <p> by default and titleAs promotes it to a real heading, so a page-level empty state can take its place in the outline', src(c, 'emptyState.jsx', 'titleAs')],
    ['the medallion icon is decoration', src(c, 'emptyStateIcon.jsx', 'aria-hidden')],
  ],
  field: (c) => [
    ['renders exactly one <label> whose htmlFor points at the caller own control, so the label and the control are genuinely associated', src(c, 'field.jsx', 'htmlFor={controlId}')],
    ['htmlFor is omitted entirely when no control has been named, rather than writing an empty reference', src(c, 'field.jsx', 'htmlFor={controlId}')],
    ['in the error state the helper row becomes role="alert", so a validation message is announced when it appears', src(c, 'field.jsx', "role={resolvedState === 'error'")],
    ['the required asterisk is aria-hidden and the announced word is in a screen-reader-only span, so "required" is read rather than "star"', src(c, 'field.jsx', 'lumo-field__srOnly')],
    ['the error icon is decoration', src(c, 'fieldIcon.jsx', 'aria-hidden')],
  ],
  progress: (c) => [
    ['role="progressbar" sits on the track, not the wrapper: a progressbar’s contents are not exposed to assistive tech, so putting it on the wrapper would swallow the label and the value text', src(c, 'progress.jsx', 'role="progressbar"')],
    ['carries aria-valuenow, aria-valuemin and aria-valuemax, with the percent clamped to 0-100', src(c, 'progress.jsx', 'aria-valuenow=')],
    ['named by reference via aria-labelledby when a label is shown, and by aria-label when it is not, so the bar is never unnamed', src(c, 'progress.jsx', 'aria-labelledby={label')],
  ],
  toast: (c) => [
    ['is role="status" with aria-live="polite", so it is announced when it appears without stealing focus', src(c, 'toast.jsx', 'role="status"')],
    ['the close control is a real <button> whose accessible name comes from closeLabel', src(c, 'toastClose.jsx', 'aria-label={label}')],
    ['the status icon is aria-hidden decoration; the title carries the meaning', src(c, 'toastIcon.jsx', 'aria-hidden')],
  ],
};

/** Variant properties and values, taken from the code's own const lists. */
/**
 * Variant properties whose values are booleans rather than a string union, so
 * they never appear as a `const X = [...]` list. Taken from the Figma property
 * names: Switch's set is On=true/false, and the vertical card layout toggles
 * its header and footer rows.
 */
const BOOLEAN_VARIANTS = {
  switch: { on: ['true', 'false'] },
  cardLayoutVertical: { header: ['true', 'false'], footer: ['true', 'false'] },
};

function variantsFor(component, file) {
  const code = fs.readFileSync(path.join(root, `src/components/${component}/${file}`), 'utf8');
  const out = {};
  for (const m of code.matchAll(/^const ([A-Z_]+) = \[([^\]]+)\];/gm)) {
    const prop = m[1].toLowerCase();
    const values = [...m[2].matchAll(/'([^']+)'/g)].map((v) => v[1]);
    if (values.length) out[prop] = values;
  }
  return out;
}

const PLACEMENT = {
  badge: [['in a card header Action slot, and in a table cell or list row as a status', 'src/components/badge/badge.stories.jsx']],
  switch: [['in a settings row, with the label naming the setting', 'src/components/switch/switch.stories.jsx']],
  accordion: [['stacked in a list, as an FAQ', 'src/components/accordion/accordion.stories.jsx']],
  button: [['in a card footer action row, and in an empty state Action slot', 'src/components/button/button.stories.jsx']],
  card: [['as a page-level surface holding a card layout in its Layout slot', 'src/components/card/card.stories.jsx']],
  cardLayoutVertical: [['inside Card, filling its Layout slot', 'src/components/card/card.stories.jsx']],
  emptyState: [['in the empty region of a list, card or page', 'src/components/emptyState/emptyState.stories.jsx']],
  field: [['in a form, wrapping one input control', 'src/components/field/field.stories.jsx']],
  progress: [['in a card body beneath a metric, and in a kanban card', 'src/components/progress/progress.stories.jsx']],
  toast: [['overlaid, away from the content the user is working in', 'src/components/toast/toast.stories.jsx']],
};

const PAIRS = {
  badge: [], switch: [], accordion: [], button: [],
  card: [['CardLayoutVertical', 'src/components/card/card.stories.jsx']],
  cardLayoutVertical: [['Card', 'src/components/card/card.stories.jsx']],
  emptyState: [], field: [], progress: [], toast: [],
};

const DIRS = {
  badge: 'badge', switch: 'switch', accordion: 'accordion', button: 'button',
  card: 'card', cardLayoutVertical: 'card', emptyState: 'emptyState',
  field: 'field', progress: 'progress', toast: 'toast',
};
const FILES = {
  badge: 'badge.jsx', switch: 'switch.jsx', accordion: 'accordion.jsx', button: 'button.jsx',
  card: 'card.jsx', cardLayoutVertical: 'cardLayoutVertical.jsx', emptyState: 'emptyState.jsx',
  field: 'field.jsx', progress: 'progress.jsx', toast: 'toast.jsx',
};

const sha = process.argv[2];
let warnings = 0;

for (const [key, fig] of Object.entries(FIG)) {
  if (key.startsWith('_')) continue;
  const dir = DIRS[key];
  const { use, dont } = split(fig.desc);
  const source = { kind: 'figma:description', library: LIB, component: fig.figmaName, node: fig.node, read_on: READ_ON };

  const dontEntries = dont.map((sentence) => {
    const alt = alternativeIn(sentence);
    if (!alt) warnings += 1;
    // The sentence is rendered as the designer wrote it. Stripping "Don't" to
    // build a `situation` field produced "use it for something the user can
    // interact with", which reads as an instruction TO use it -- a paraphrase,
    // and the one thing component-intent forbids. `use_instead` carries the
    // alternative structurally; `verbatim` is what gets published.
    return { verbatim: sentence, use_instead: alt, source };
  });

  const variants = { ...variantsFor(dir, FILES[key]), ...(BOOLEAN_VARIANTS[key] || {}) };
  const variant_intent = {};
  const gaps = [];
  for (const [prop, values] of Object.entries(variants)) {
    variant_intent[prop] = {};
    for (const v of values) {
      variant_intent[prop][v] = { meaning: null, source: null };
      gaps.push({
        field: `variant_intent.${prop}.${v}`,
        reason: 'the description does not say what this value is for; the Figma documentation page that would carry a per-variant usage region could not be located',
        owner: 'human:designer',
      });
    }
  }

  const doc = {
    component: key,
    figma_component: fig.figmaName,
    figma_node: fig.node,
    figma_docs_page: null,
    source_commit: sha,
    use_when: use.map((s) => ({ statement: s, verbatim: s, source })),
    dont_use_when: dontEntries,
    variant_intent,
    placement: (PLACEMENT[key] || []).map(([s, f]) => ({ statement: s, source: f })),
    pairs_with: (PAIRS[key] || []).map(([c, f]) => ({ component: c, source: f })),
    required_tokens: tokensFor(path.join(root, 'src/components', dir)),
    a11y: (A11Y[key] || ((c) => []))(dir)
      .filter(([, s]) => s)
      .map(([fact, s]) => ({ fact, source: s })),
    gaps: [
      {
        field: 'figma_docs_page',
        reason: `no documentation page could be located for this component. The Figma MCP lists only one top-level page ("Thumbnail") for file UbWxCGi4FaV4Ficg2iDnu0, so the usage region the component-intent skill names as source 1 was unreachable. use_when and dont_use_when below are transposed from the component-set DESCRIPTION in the ${LIB} library instead, which is designer-authored but is a different surface.`,
        owner: 'human:designer',
      },
      ...gaps,
    ],
  };

  const out = path.join(root, 'src/components', dir, `${key}.intent.json`);
  fs.writeFileSync(out, JSON.stringify(doc, null, 2) + '\n');
  console.log(
    `  ${key.padEnd(19)} use:${doc.use_when.length} dont:${doc.dont_use_when.length}` +
      ` alt:${dontEntries.filter((d) => d.use_instead).length}` +
      ` tokens:${doc.required_tokens.length} a11y:${doc.a11y.length} gaps:${doc.gaps.length}`,
  );
}
console.log(`\n  check-2 warnings (a dont_use_when with no alternative): ${warnings}`);
