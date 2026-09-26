import { useMemo, useState } from 'react';

import { Page, Section, TokenTable } from './lib/kit.jsx';
import { tokensFor } from './lib/tokens.js';

export default { title: 'Reference/All tokens' };

function AllTokens({ platform, theme }) {
  const all = tokensFor(platform, theme);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');

  const types = useMemo(() => ['all', ...new Set(all.map((t) => t.type))], [all]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((token) => {
      if (type !== 'all' && token.type !== type) return false;
      if (!q) return true;
      return (
        token.name.toLowerCase().includes(q) ||
        String(token.value).toLowerCase().includes(q) ||
        String(token.original).toLowerCase().includes(q) ||
        token.description.toLowerCase().includes(q)
      );
    });
  }, [all, query, type]);

  return (
    <Page
      title="All tokens"
      intro="Every token in the current build, searchable by name, value, alias target or
             description. Click a token name to copy it as var(--name)."
    >
      <Section>
        <div className="lumo-toolbar">
          <input
            className="lumo-search"
            type="search"
            placeholder="Search tokens…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="lumo-search"
            style={{ maxWidth: 180 }}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All types' : t}
              </option>
            ))}
          </select>
          <span className="lumo-count">
            {shown.length} of {all.length} · {platform} · {theme}
          </span>
        </div>
      </Section>

      <Section>
        <TokenTable
          tokens={shown}
          columns={[
            { header: 'Type', render: (token) => <span className="lumo-alias">{token.type}</span> },
            {
              header: 'Source file',
              render: (token) => (
                <span className="lumo-alias">{token.file.replace(/\.tokens\.json$/, '')}</span>
              ),
            },
          ]}
        />
      </Section>
    </Page>
  );
}

export const Everything = {
  name: 'All tokens',
  render: (_args, { globals }) => <AllTokens {...globals} />,
};
