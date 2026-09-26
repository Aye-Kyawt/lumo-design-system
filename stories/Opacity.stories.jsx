import { Page, Section, TokenTable } from './lib/kit.jsx';
import { tokensFor, isCore, matching, numberOf } from './lib/tokens.js';

export default { title: 'Foundations/Opacity' };

const asAlpha = (token) => numberOf(token.value);

function Preview({ token }) {
  return (
    <div className="lumo-row">
      <span
        style={{
          width: 96,
          height: 24,
          borderRadius: 'var(--border-radius-xs)',
          background: 'var(--color-bg-primary-idle, #5416e3)',
          opacity: asAlpha(token),
        }}
        aria-hidden="true"
      />
      <span className="lumo-alias">{asAlpha(token)}</span>
    </div>
  );
}

function Opacity({ platform, theme }) {
  const opacity = tokensFor(platform, theme).filter(matching(/^--opacity-/));
  const semantic = opacity.filter((t) => !isCore(t));
  const core = opacity.filter(isCore).sort((a, b) => numberOf(a.value) - numberOf(b.value));

  return (
    <Page
      title="Opacity"
      intro="Alpha levels for disabled states, hover and press overlays, scrims and skeletons."
    >
      <Section title="Roles">
        <TokenTable
          tokens={semantic}
          columns={[{ header: 'Preview', render: (token) => <Preview token={token} /> }]}
        />
      </Section>

      <Section title="Core scale">
        <TokenTable
          tokens={core}
          showAlias={false}
          columns={[{ header: 'Preview', render: (token) => <Preview token={token} /> }]}
        />
      </Section>
    </Page>
  );
}

export const Levels = {
  name: 'Opacity',
  render: (_args, { globals }) => <Opacity {...globals} />,
};
