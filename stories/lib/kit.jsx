/** Small presentational pieces shared by every token story. */

import { useRef, useState } from 'react';

import { stringify } from './tokens.js';

export function Page({ title, intro, children }) {
  return (
    <div className="lumo-page">
      <header className="lumo-page__head">
        <h1 className="lumo-page__title">{title}</h1>
        {intro ? <p className="lumo-page__intro">{intro}</p> : null}
      </header>
      {children}
    </div>
  );
}

export function Section({ title, note, children }) {
  return (
    <section className="lumo-section">
      {(title || note) && (
        <div className="lumo-section__head">
          {title ? <h2 className="lumo-section__title">{title}</h2> : null}
          {note ? <p className="lumo-section__note">{note}</p> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export function Note({ label = 'Note', tone = 'info', children }) {
  return (
    <div className={`lumo-note${tone === 'info' ? ' lumo-note--info' : ''}`}>
      <span className="lumo-note__label">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export function Grid({ min = 200, children }) {
  return (
    <div className="lumo-grid" style={{ '--lumo-grid-min': `${min}px` }}>
      {children}
    </div>
  );
}

/** The token name, click to copy it as a ready-to-paste `var(--name)`. */
export function TokenName({ name }) {
  const [state, setState] = useState('idle');
  const ref = useRef(null);

  const copy = async () => {
    const text = `var(${name})`;

    // The async clipboard API needs a permission the preview frame does not
    // always have, so fall back to a throwaway textarea and execCommand.
    const viaTextarea = () => {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(field);
      return ok;
    };

    const flash = (next) => {
      setState(next);
      setTimeout(() => setState('idle'), 1600);
    };

    try {
      await navigator.clipboard.writeText(text);
      flash('copied');
      return;
    } catch {
      // fall through
    }

    try {
      if (viaTextarea()) {
        flash('copied');
        return;
      }
    } catch {
      // fall through
    }

    // Both routes are blocked (some browsers refuse clipboard writes inside an
    // iframe). Select the name instead so the keyboard shortcut still works.
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(ref.current);
    selection.removeAllRanges();
    selection.addRange(range);
    flash('manual');
  };

  const label =
    state === 'copied' ? 'copied!' : state === 'manual' ? `${name}  ⌘C` : name;

  return (
    <button
      type="button"
      ref={ref}
      className={`lumo-name${state === 'copied' ? ' lumo-name--copied' : ''}`}
      onClick={copy}
      title={`Copy var(${name})`}
    >
      {label}
    </button>
  );
}

export function Alias({ token }) {
  if (!token.isAlias) return null;
  const target = String(token.original).replace(/[{}]/g, '');
  return <span className="lumo-alias">→ --{target}</span>;
}

export function Swatch({ token }) {
  return (
    <div className="lumo-swatch">
      <div
        className="lumo-swatch__chip"
        style={{ '--lumo-swatch-colour': `var(${token.name})` }}
      />
      <div className="lumo-swatch__body">
        <TokenName name={token.name} />
        <span className="lumo-value">{token.value}</span>
        <Alias token={token} />
      </div>
    </div>
  );
}

/**
 * A table of tokens. `columns` is a list of { header, render } so each story
 * can add its own preview column without re-implementing the shell.
 */
export function TokenTable({ tokens, columns = [], showAlias = true }) {
  return (
    <div className="lumo-table__wrap">
      <table className="lumo-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Value</th>
            {showAlias ? <th>Aliases</th> : null}
            {columns.map((c) => (
              <th key={c.header}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={token.name}>
              <td>
                <TokenName name={token.name} />
              </td>
              <td>
                <span className="lumo-value">{stringify(token.value)}</span>
              </td>
              {showAlias ? (
                <td>
                  {token.isAlias ? (
                    <Alias token={token} />
                  ) : (
                    <span className="lumo-alias">literal</span>
                  )}
                </td>
              ) : null}
              {columns.map((c) => (
                <td key={c.header}>{c.render(token)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
