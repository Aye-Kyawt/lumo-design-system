import { Page, Section, TokenTable, Note, Grid, TokenName, Alias } from './lib/kit.jsx';
import { tokensFor, isCore, matching, groupBy, shortName } from './lib/tokens.js';

export default { title: 'Foundations/Border' };

function RadiusCard({ token }) {
  return (
    <div className="lumo-swatch">
      <div
        style={{
          height: 72,
          margin: 12,
          background: 'var(--color-bg-primary-tonal-idle, #efe9fd)',
          border: '1px solid var(--color-border-brand-default, #a687ed)',
          borderRadius: `var(${token.name})`,
        }}
      />
      <div className="lumo-swatch__body">
        <TokenName name={token.name} />
        <span className="lumo-value">{token.value}</span>
        <Alias token={token} />
      </div>
    </div>
  );
}

function WidthRow({ token }) {
  return (
    <div
      style={{
        width: 120,
        height: 32,
        borderStyle: 'solid',
        borderColor: 'var(--color-border-primary-default, #e2e4ed)',
        borderWidth: `var(${token.name})`,
        borderRadius: 'var(--border-radius-sm)',
        background: 'var(--color-bg-surfacesecondary, #f7f8fc)',
      }}
    />
  );
}

function Border({ platform, theme }) {
  const border = tokensFor(platform, theme).filter(matching(/^--border-/));
  const groups = Object.fromEntries(
    groupBy(border, (t) => shortName(t.name, 'border').split('-')[0]),
  );

  const radius = groups.radius ?? [];
  const semanticRadius = radius.filter((t) => !isCore(t));
  const coreRadius = radius.filter(isCore);

  return (
    <Page
      title="Border"
      intro="Radii, widths and dash patterns. The named radii (button, card, modal…) are the
             ones to use: they keep a component's corner consistent even if the scale moves."
    >
      <Section title="Radius — by component role">
        <Grid min={180}>
          {semanticRadius.map((token) => (
            <RadiusCard key={token.name} token={token} />
          ))}
        </Grid>
      </Section>

      <Section title="Radius — core scale">
        <Grid min={180}>
          {coreRadius.map((token) => (
            <RadiusCard key={token.name} token={token} />
          ))}
        </Grid>
      </Section>

      <Section title="Width">
        <TokenTable
          tokens={groups.width ?? []}
          columns={[{ header: 'Preview', render: (token) => <WidthRow token={token} /> }]}
        />
      </Section>

      <Section
        title="Dash"
        note="Segment and gap lengths for dashed and dotted strokes, kept as separate numbers
              so each platform can compose its own stroke syntax."
      >
        <TokenTable tokens={groups.dash ?? []} />
      </Section>

      <Note label="Missing">
        <p>
          The export also declares <code>border-style-solid</code>, <code>-dashed</code> and{' '}
          <code>-dotted</code>, but each one points at itself and carries no value, so the build
          drops them and they are absent here.
        </p>
        <p>
          In Figma these are string variables; the DTCG export writes a self-reference instead of
          the string, which is why nothing downstream can resolve them.
        </p>
      </Note>
    </Page>
  );
}

export const Borders = {
  name: 'Border',
  render: (_args, { globals }) => <Border {...globals} />,
};
