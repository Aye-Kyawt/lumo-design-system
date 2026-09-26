import { Page, Section, TokenTable, Note } from './lib/kit.jsx';
import { LAYOUT_SETS, BREAKPOINTS, numberOf } from './lib/tokens.js';

export default { title: 'Foundations/Layout & Grid' };

const valueOf = (tokens, name) => tokens.find((t) => t.name === name)?.value;

function GridPreview({ tokens }) {
  const columns = numberOf(valueOf(tokens, '--grid-columns')) || 12;
  const gutter = valueOf(tokens, '--grid-gutter') ?? '16px';
  const margin = valueOf(tokens, '--grid-margin') ?? '16px';
  const maxWidth = valueOf(tokens, '--grid-container-maxwidth');

  return (
    <div
      style={{
        border: '1px dashed var(--color-border-brand-default, #a687ed)',
        borderRadius: 'var(--border-radius-md)',
        padding: margin,
        background: 'var(--color-bg-surfacesecondary, #f7f8fc)',
        maxWidth: maxWidth && maxWidth !== 'none' ? maxWidth : undefined,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: gutter }}>
        {Array.from({ length: columns }, (_, i) => (
          <div
            key={i}
            style={{
              height: 96,
              borderRadius: 'var(--border-radius-xs)',
              background: 'var(--color-bg-primary-tonal-idle, #efe9fd)',
              border: '1px solid var(--color-border-brand-default, #a687ed)',
            }}
          />
        ))}
      </div>
      <p className="lumo-desc" style={{ marginTop: 12 }}>
        {columns} columns · {gutter} gutter · {margin} margin
        {maxWidth ? ` · max ${maxWidth}` : ''}
      </p>
    </div>
  );
}

function Layout({ breakpoint }) {
  const tokens = LAYOUT_SETS[breakpoint] ?? LAYOUT_SETS.desktop;

  return (
    <Page
      title="Layout & grid"
      intro="The responsive grid, one set of values per breakpoint. Each set ships as its own
             stylesheet scoped to [data-breakpoint], so a product can switch grids by setting one
             attribute rather than re-declaring variables."
    >
      <Note label="Breakpoint">
        Showing <strong>{breakpoint}</strong>. Use the Breakpoint control in the toolbar to switch
        — it sets <code>data-breakpoint</code> on the preview, exactly as a product would.
      </Note>

      <Section title={`${breakpoint} grid`}>
        <GridPreview tokens={tokens} />
      </Section>

      <Section title="Tokens">
        <TokenTable tokens={tokens} showAlias={false} />
      </Section>

      <Section
        title="All breakpoints"
        note="grid-columns is a count, not a length — the px suffix is the export typing Figma's
              FLOAT variables as dimensions, the same artefact seen on the opacity and motion pages."
      >
        <div className="lumo-table__wrap">
          <table className="lumo-table">
            <thead>
              <tr>
                <th>Token</th>
                {BREAKPOINTS.map((b) => (
                  <th key={b}>{b}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LAYOUT_SETS.desktop.map((token) => (
                <tr key={token.name}>
                  <td>
                    <span className="lumo-name">{token.name}</span>
                  </td>
                  {BREAKPOINTS.map((b) => (
                    <td key={b}>
                      <span className="lumo-value">{valueOf(LAYOUT_SETS[b], token.name) ?? '—'}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  );
}

export const Grid = {
  name: 'Layout & grid',
  render: (_args, { globals }) => <Layout {...globals} />,
};
