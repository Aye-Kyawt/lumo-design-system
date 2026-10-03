import { Page, Section, TokenName, TokenTable, Note } from './lib/kit.jsx';
import { tokensFor, matching, groupBy, shortName } from './lib/tokens.js';

export default { title: 'Foundations/Typography' };

/* ------------------------------------------------------------ specimens -- */

const SAMPLES = [
  ['heading', 'Headings', 'Lumo ships a calm interface', null],
  ['body', 'Body', 'Body copy carries the weight of the interface: it has to stay readable at every size, in both themes, on every platform build.', null],
  ['label', 'Label', 'Form label', null],
  ['caption', 'Caption', 'Overline caption', 'uppercase'],
  ['button', 'Button', 'Continue', null],
];

// The CSS `font` shorthand can't carry letter-spacing, so the build drops it.
// It survives in the JSON as the token's unresolved value — read it back here
// so the specimen matches what Figma intended.
function letterSpacing(token) {
  const ls = token.original?.letterSpacing;
  if (!ls) return undefined;
  if (typeof ls === 'string') return `var(--${ls.replace(/[{}]/g, '')})`;
  return `${ls.value}${ls.unit ?? 'px'}`;
}

function Specimen({ token, sample, transform }) {
  return (
    <div className="lumo-specimen">
      <div
        style={{
          font: `var(${token.name})`,
          letterSpacing: letterSpacing(token),
          textTransform: transform ?? 'none',
          textDecoration: token.name.includes('underlined') ? 'underline' : 'none',
          color: 'var(--color-text-primary, #30344b)',
          margin: 0,
        }}
      >
        {sample}
      </div>
      <div className="lumo-specimen__meta">
        <TokenName name={token.name} />
        <span className="lumo-value">{token.value}</span>
        {letterSpacing(token) ? (
          <span className="lumo-alias">letter-spacing {letterSpacing(token)}</span>
        ) : null}
      </div>
      {token.description ? <span className="lumo-desc">{token.description}</span> : null}
    </div>
  );
}

function Styles({ platform, theme }) {
  const tokens = tokensFor(platform, theme).filter((t) => t.type === 'typography');

  return (
    <Page
      title="Typography — styles"
      intro="The composite styles from the Figma text-style library. Each one builds on the
             family, size, line-height and weight tokens on the Scales page, and lands in CSS as
             a single font shorthand you can apply with one declaration."
    >
      <Note label="Usage">
        <code>font: var(--body-body2);</code> sets family, size, line-height and weight at once.
        Letter-spacing is not part of the CSS <code>font</code> shorthand, so where a style
        defines one, set it alongside.
      </Note>

      {SAMPLES.map(([prefix, title, sample, transform]) => {
        const group = tokens.filter((t) => t.name.startsWith(`--${prefix}-`));
        if (!group.length) return null;

        return (
          <Section key={prefix} title={title}>
            <div className="lumo-panel">
              {group.map((token) => (
                <Specimen key={token.name} token={token} sample={sample} transform={transform} />
              ))}
            </div>
          </Section>
        );
      })}
    </Page>
  );
}

/* --------------------------------------------------------------- scales -- */

function Scales({ platform, theme }) {
  const tokens = tokensFor(platform, theme).filter(matching(/^--typography-/));
  const scales = groupBy(tokens, (t) => shortName(t.name, 'typography').split('-')[0]);

  const order = ['fontfamily', 'fontsize', 'lineheight', 'fontweight', 'letterspacing'];
  const titles = {
    fontfamily: 'Font family',
    fontsize: 'Font size',
    lineheight: 'Line height',
    fontweight: 'Font weight',
    letterspacing: 'Letter spacing',
  };

  scales.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));

  return (
    <Page
      title="Typography — scales"
      intro="The primitives the composite styles are assembled from. The semantic entries (md,
             lg, 2xl…) are what you reach for; the numbered core entries underneath them are the
             literal pixel values they resolve to."
    >
      <Note label="Platform">
        This is the <strong>{platform}</strong> build. The size, line-height and family scales
        are authored per platform, so switching the Platform control changes the values below
        while the token names stay identical.
      </Note>

      {scales.map(([key, group]) => (
        <Section key={key} title={titles[key] ?? key}>
          <TokenTable
            tokens={group}
            columns={[
              {
                header: 'Preview',
                render: (token) => <ScalePreview kind={key} token={token} />,
              },
            ]}
          />
        </Section>
      ))}
    </Page>
  );
}

function ScalePreview({ kind, token }) {
  const style = { color: 'var(--color-text-primary, #30344b)', whiteSpace: 'nowrap' };

  if (kind === 'fontfamily') {
    return <span style={{ ...style, fontFamily: `var(${token.name})`, fontSize: 18 }}>Ag — Lumo</span>;
  }
  if (kind === 'fontsize') {
    return <span style={{ ...style, fontSize: `var(${token.name})`, lineHeight: 1.1 }}>Ag</span>;
  }
  if (kind === 'fontweight') {
    return <span style={{ ...style, fontWeight: `var(${token.name})`, fontSize: 18 }}>Ag — Lumo</span>;
  }
  if (kind === 'lineheight') {
    return (
      <span
        style={{
          ...style,
          display: 'inline-block',
          height: `var(${token.name})`,
          borderTop: '1px solid var(--color-border-brand-default, #a687ed)',
          borderBottom: '1px solid var(--color-border-brand-default, #a687ed)',
          width: 96,
        }}
      />
    );
  }
  return <span className="lumo-alias">—</span>;
}

/* -------------------------------------------------------------- stories -- */

export const TextStyles = {
  name: 'Styles',
  render: (_args, { globals }) => <Styles {...globals} />,
};

export const TypeScales = {
  name: 'Scales',
  render: (_args, { globals }) => <Scales {...globals} />,
};
