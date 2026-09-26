import { Page, Section, TokenName, TokenTable, Note } from './lib/kit.jsx';
import { tokensFor, isCore, matching, groupBy, shortName, numberOf } from './lib/tokens.js';

export default { title: 'Foundations/Spacing' };

function Bar({ token }) {
  return (
    <div className="lumo-row">
      <span
        className="lumo-ruler__bar"
        style={{ width: `max(var(${token.name}), 1px)` }}
        aria-hidden="true"
      />
      <span className="lumo-alias">{numberOf(token.value)}</span>
    </div>
  );
}

function Spacing({ platform, theme }) {
  const spacing = tokensFor(platform, theme).filter(matching(/^--spacing-/));
  const core = spacing.filter(isCore).sort((a, b) => numberOf(a.value) - numberOf(b.value));
  const semantic = spacing.filter((t) => !isCore(t));
  const roles = groupBy(semantic, (t) => shortName(t.name, 'spacing').split('-')[0]);

  return (
    <Page
      title="Spacing"
      intro="One 2/4-based scale underneath, and a small set of named roles on top of it. Reach
             for the roles — padding, gap, margin — and let them decide which step of the scale
             is right, so the rhythm stays consistent when the scale is retuned."
    >
      <Note label="Platform">
        Spacing roles are authored per platform. You are seeing the{' '}
        <strong>{platform}</strong> build; switch the Platform control to compare.
      </Note>

      {roles.map(([role, tokens]) => (
        <Section
          key={role}
          title={`spacing-${role}`}
          note={
            role === 'padding'
              ? 'Space inside a component, between its border and its content.'
              : role === 'gap'
                ? 'Space between sibling elements in a stack or row.'
                : 'Space between a block and the page or section around it.'
          }
        >
          <TokenTable
            tokens={tokens}
            columns={[{ header: 'Scale', render: (token) => <Bar token={token} /> }]}
          />
        </Section>
      ))}

      <Section
        title="Core scale"
        note="The literal steps the roles above resolve to. Prefer a role over reaching in here directly."
      >
        <div className="lumo-stack">
          {core.map((token) => (
            <div key={token.name} className="lumo-row">
              <span style={{ width: 160, flex: 'none' }}>
                <TokenName name={token.name} />
              </span>
              <span
                className="lumo-ruler__bar"
                style={{ width: `max(var(${token.name}), 1px)` }}
                aria-hidden="true"
              />
              <span className="lumo-value">{token.value}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="In context" note="The same three roles applied to a card.">
        <div
          className="lumo-card"
          style={{ padding: 'var(--spacing-padding-lg)', display: 'grid', gap: 'var(--spacing-gap-md)' }}
        >
          <strong style={{ font: 'var(--heading-h6)' }}>padding-lg · gap-md</strong>
          <span style={{ font: 'var(--body-body3)', color: 'var(--color-text-secondary)' }}>
            Each block below is separated by <code>--spacing-gap-md</code>, and the card is inset by{' '}
            <code>--spacing-padding-lg</code>.
          </span>
          <div style={{ display: 'flex', gap: 'var(--spacing-gap-horizontal-sm)' }}>
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                style={{
                  padding: 'var(--spacing-padding-sm) var(--spacing-padding-md)',
                  borderRadius: 'var(--border-radius-chip)',
                  background: 'var(--color-bg-primary-tonal-idle)',
                  color: 'var(--color-text-primary)',
                  font: 'var(--body-body4)',
                }}
              >
                chip {n}
              </span>
            ))}
          </div>
        </div>
      </Section>
    </Page>
  );
}

export const Scale = {
  name: 'Spacing',
  render: (_args, { globals }) => <Spacing {...globals} />,
};
