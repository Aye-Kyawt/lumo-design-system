import { useState } from 'react';

import { Page, Section, TokenTable, Note } from './lib/kit.jsx';
import { tokensFor, isCore, matching, numberOf } from './lib/tokens.js';

export default { title: 'Foundations/Motion' };

const asMs = (token) => numberOf(token.value);

function Runner({ token }) {
  const [moved, setMoved] = useState(false);

  return (
    <div className="lumo-row">
      <button
        type="button"
        onClick={() => setMoved((m) => !m)}
        style={{
          width: 180,
          height: 28,
          padding: 2,
          borderRadius: 'var(--border-radius-full)',
          border: '1px solid var(--color-border-primary-default, #e2e4ed)',
          background: 'var(--color-bg-surfacesecondary, #f7f8fc)',
          cursor: 'pointer',
          display: 'block',
        }}
        title={`Play ${asMs(token)}ms`}
      >
        <span
          style={{
            display: 'block',
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'var(--color-bg-primary-idle, #5416e3)',
            transform: `translateX(${moved ? 150 : 0}px)`,
            transitionProperty: 'transform',
            transitionDuration: `${asMs(token)}ms`,
            transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
          }}
        />
      </button>
      <span className="lumo-alias">{asMs(token)}ms</span>
    </div>
  );
}

function Motion({ platform, theme }) {
  const motion = tokensFor(platform, theme).filter(matching(/^--motion-/));
  const semantic = motion.filter((t) => !isCore(t));
  const core = motion.filter(isCore).sort((a, b) => numberOf(a.value) - numberOf(b.value));

  return (
    <Page
      title="Motion"
      intro="Duration steps for transitions. Click a track to play it — the difference between
             fast and moderate is easier to feel than to read."
    >
      <Note label="Easing" tone="warning">
        <p>
          <strong>The easing tokens are missing entirely.</strong>{' '}
          <code>motion-easing-standard</code>, <code>-decelerate</code>, <code>-accelerate</code>,{' '}
          <code>-emphasized</code> and <code>-linear</code> are exported as self-references with no
          value, so the build drops them — the previews here use a hardcoded curve instead of a
          token.
        </p>
      </Note>

      <Section title="Duration — roles">
        <TokenTable
          tokens={semantic}
          columns={[{ header: 'Play', render: (token) => <Runner token={token} /> }]}
        />
      </Section>

      <Section title="Duration — core scale">
        <TokenTable
          tokens={core}
          showAlias={false}
          columns={[{ header: 'Play', render: (token) => <Runner token={token} /> }]}
        />
      </Section>
    </Page>
  );
}

export const Durations = {
  name: 'Motion',
  render: (_args, { globals }) => <Motion {...globals} />,
};
