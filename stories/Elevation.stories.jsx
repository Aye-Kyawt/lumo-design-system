import { Page, Section, Grid, TokenName } from './lib/kit.jsx';
import { tokensFor, matching } from './lib/tokens.js';

export default { title: 'Foundations/Elevation' };

function Elevation({ platform, theme }) {
  const shadows = tokensFor(platform, theme).filter(matching(/^--elevation-/));

  return (
    <Page
      title="Elevation"
      intro="Four stacked levels plus a focus ring. Elevation encodes how far a surface sits
             above the canvas — pick the level by what the surface is, not by how strong the
             shadow looks."
    >
      <Section>
        <Grid min={260}>
          {shadows.map((token) => (
            <div
              key={token.name}
              style={{
                padding: 24,
                borderRadius: 'var(--border-radius-card, 12px)',
                background: 'var(--color-bg-surfaceprimary, #fff)',
                boxShadow: `var(${token.name})`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <TokenName name={token.name} />
              <span className="lumo-desc">{token.description}</span>
            </div>
          ))}
        </Grid>
      </Section>

      <Section
        title="Values"
        note="Each level is a two-layer shadow — a tight contact shadow plus a wider ambient one."
      >
        <div className="lumo-stack">
          {shadows.map((token) => (
            <div key={token.name} className="lumo-specimen">
              <TokenName name={token.name} />
              <span className="lumo-value">{token.value}</span>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}

export const Shadows = {
  name: 'Elevation',
  render: (_args, { globals }) => <Elevation {...globals} />,
};
