import { Page, Section, TokenTable, TokenName } from './lib/kit.jsx';
import { tokensFor, matching, numberOf } from './lib/tokens.js';

export default { title: 'Foundations/Z-index' };

function ZIndex({ platform, theme }) {
  const layers = tokensFor(platform, theme)
    .filter(matching(/^--z-index-/))
    .sort((a, b) => numberOf(a.value) - numberOf(b.value));

  return (
    <Page
      title="Z-index"
      intro="The stacking order, named. Every floating surface in the system has a slot here, so
             nothing has to invent a number and nothing ends up behind the modal it opened."
    >
      <Section title="The stack" note="Lowest at the back, highest in front.">
        <div style={{ position: 'relative', height: 260, marginBottom: 16 }}>
          {layers.map((token, i) => (
            <div
              key={token.name}
              style={{
                position: 'absolute',
                left: i * 44,
                top: i * 18,
                width: 260,
                padding: '10px 14px',
                borderRadius: 'var(--border-radius-md)',
                background: 'var(--color-bg-surfaceprimary, #fff)',
                border: '1px solid var(--color-border-primary-default, #e2e4ed)',
                boxShadow: 'var(--elevation-level2)',
                zIndex: i,
              }}
            >
              <TokenName name={token.name} />
              <div className="lumo-alias">{numberOf(token.value)}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Values">
        <TokenTable tokens={layers} showAlias={false} />
      </Section>
    </Page>
  );
}

export const Stack = {
  name: 'Z-index',
  render: (_args, { globals }) => <ZIndex {...globals} />,
};
