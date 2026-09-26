import { useState } from 'react';

import { Page, Section, Note, TokenName } from './lib/kit.jsx';
import { tokensFor, PLATFORMS } from './lib/tokens.js';

export default { title: 'Reference/Platforms' };

/**
 * Typography, spacing and sizing are authored once per platform. Everything
 * else is shared, so the interesting view is the set of tokens whose value
 * actually differs between the three builds.
 */
function Platforms({ theme }) {
  const [onlyDifferences, setOnlyDifferences] = useState(true);

  const sets = Object.fromEntries(PLATFORMS.map((p) => [p, tokensFor(p, theme)]));
  const index = Object.fromEntries(
    PLATFORMS.map((p) => [p, new Map(sets[p].map((t) => [t.name, t]))]),
  );

  const rows = sets.web
    .map((token) => {
      const values = PLATFORMS.map((p) => index[p].get(token.name)?.value ?? '—');
      return { name: token.name, values, differs: new Set(values.map(String)).size > 1 };
    })
    .filter((row) => (onlyDifferences ? row.differs : true));

  return (
    <Page
      title="Platforms"
      intro="Web, mobile and admin share one colour, border, elevation, motion and z-index layer.
             What they don't share is type, spacing and sizing — those are authored per platform
             so a dense admin table and a touch-first mobile screen can each get sensible values
             from the same token names."
    >
      <Note label="How to read this">
        The token names are identical across all three builds; only the values move. A consumer
        picks a stylesheet once (<code>build/css/&lt;platform&gt;/tokens.css</code>) and never
        branches on platform again.
      </Note>

      <Section>
        <div className="lumo-toolbar">
          <label className="lumo-count" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={onlyDifferences}
              onChange={(e) => setOnlyDifferences(e.target.checked)}
            />
            Only tokens that differ
          </label>
          <span className="lumo-count">
            {rows.length} token{rows.length === 1 ? '' : 's'} · {theme} theme
          </span>
        </div>
      </Section>

      <Section>
        <div className="lumo-table__wrap">
          <table className="lumo-table">
            <thead>
              <tr>
                <th>Token</th>
                {PLATFORMS.map((p) => (
                  <th key={p}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <td>
                    <TokenName name={row.name} />
                  </td>
                  {row.values.map((value, i) => (
                    <td key={PLATFORMS[i]}>
                      <span className="lumo-value">{value}</span>
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

export const Comparison = {
  name: 'Platform comparison',
  render: (_args, { globals }) => <Platforms {...globals} />,
};
