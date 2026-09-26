import { Page, Section, Grid, Swatch, TokenName, Alias, Note } from './lib/kit.jsx';
import { tokensFor, isCore, groupBy, shortName } from './lib/tokens.js';

export default { title: 'Foundations/Colour' };

const colours = (globals) => tokensFor(globals.platform, globals.theme).filter((t) => t.type === 'color');

/* ----------------------------------------------------------- core ramps -- */

// Figma emits the ramps in authoring order; sorting by step keeps 100 next to
// 200 even when an alpha variant (50a, 100a...) is interleaved.
const stepOf = (token) => parseInt(shortName(token.name, 'color').split('-')[1] ?? '0', 10);
const isAlpha = (token) => /\d+a$/.test(token.name);

function CoreRamps({ platform, theme }) {
  const core = colours({ platform, theme }).filter(isCore);
  const families = groupBy(core, (t) => shortName(t.name, 'color').split('-')[0]);

  return (
    <Page
      title="Colour — core palette"
      intro="The raw ramps from lumo.core: the only colours in the system that hold literal
             values. Nothing in a product should reference these directly — they exist so the
             semantic tokens on the next page have something to point at."
    >
      {families.map(([family, tokens]) => {
        const solid = tokens.filter((t) => !isAlpha(t)).sort((a, b) => stepOf(a) - stepOf(b));
        const alpha = tokens.filter(isAlpha).sort((a, b) => stepOf(a) - stepOf(b));

        return (
          <Section
            key={family}
            title={family.replace(/^./, (c) => c.toUpperCase())}
            note={`${tokens.length} steps${alpha.length ? `, ${alpha.length} of them translucent` : ''}`}
          >
            <Grid min={148}>
              {[...solid, ...alpha].map((token) => (
                <Swatch key={token.name} token={token} />
              ))}
            </Grid>
          </Section>
        );
      })}
    </Page>
  );
}

/* ------------------------------------------------------------- semantic -- */

const ROLES = [
  ['bg', 'Background', 'Surfaces, fills and the interaction states that go with them.'],
  ['text', 'Text', 'Foreground colours for copy, in the order of emphasis they carry.'],
  ['icon', 'Icon', 'Icon fills — they track the text roles but are kept separate so icons can be tuned on their own.'],
  ['border', 'Border', 'Strokes and dividers, including focus rings.'],
];

/** Text and icon roles read better as type on a surface than as a filled chip. */
function SampleSwatch({ token, kind }) {
  return (
    <div className="lumo-swatch">
      <div
        className="lumo-swatch__chip"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-surfaceprimary, #fff)',
        }}
      >
        {kind === 'icon' ? (
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2 3 20h18L12 2Zm0 5.4L17.2 18H6.8L12 7.4Z"
              fill={`var(${token.name})`}
            />
          </svg>
        ) : (
          <span style={{ color: `var(${token.name})`, font: 'var(--heading-h5, 500 18px/26px Inter)' }}>
            Ag 123
          </span>
        )}
      </div>
      <div className="lumo-swatch__body">
        <TokenName name={token.name} />
        <span className="lumo-value">{token.value}</span>
        <Alias token={token} />
      </div>
    </div>
  );
}

function Semantic({ platform, theme }) {
  const semantic = colours({ platform, theme }).filter((t) => !isCore(t));

  return (
    <Page
      title="Colour — semantic"
      intro="The layer products actually consume. Each of these aliases a core step, and the
             light and dark builds alias different ones — flip the Theme control in the toolbar
             to see the same token names resolve to the other set of values."
    >
      <Note label="Theme">
        You are viewing the <strong>{theme}</strong> build. Dark mode ships as a separate
        stylesheet (<code>tokens-dark.css</code>) scoped to <code>[data-theme="dark"]</code>, so
        a product opts in by setting that attribute — the token names never change.
      </Note>

      {ROLES.map(([role, title, note]) => {
        const tokens = semantic.filter((t) => t.name.startsWith(`--color-${role}-`));
        if (!tokens.length) return null;

        return (
          <Section key={role} title={`${title} · ${tokens.length}`} note={note}>
            <Grid min={190}>
              {tokens.map((token) =>
                role === 'bg' || role === 'border' ? (
                  <Swatch key={token.name} token={token} />
                ) : (
                  <SampleSwatch key={token.name} token={token} kind={role} />
                ),
              )}
            </Grid>
          </Section>
        );
      })}
    </Page>
  );
}

/* --------------------------------------------------------------- stories -- */

export const CorePalette = {
  name: 'Core palette',
  render: (_args, { globals }) => <CoreRamps {...globals} />,
};

export const SemanticColour = {
  name: 'Semantic',
  render: (_args, { globals }) => <Semantic {...globals} />,
};
