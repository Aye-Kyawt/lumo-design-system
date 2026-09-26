import { Page, Section, TokenTable, Note } from './lib/kit.jsx';
import { tokensFor, isCore, matching, groupBy, shortName, numberOf } from './lib/tokens.js';

export default { title: 'Foundations/Sizing' };

const ROLE_NOTES = {
  icon: 'Icon box sizes. Pair with the icon colour roles on the Colour page.',
  control: 'Interactive control heights — buttons, inputs, selects.',
  avatar: 'Avatar diameters.',
  touchtarget: 'The minimum tappable area. 44px is the accessibility floor, not a suggestion.',
  layout: 'Fixed chrome and container widths: sidebars, top bars, modals, drawers.',
};

function Box({ token }) {
  const px = numberOf(token.value);
  // Layout sizes run to 800px; scale the preview down rather than blowing out
  // the table, and say so with the ×N label.
  const scale = px > 120 ? 0.25 : 1;
  return (
    <div className="lumo-row">
      <span
        className="lumo-ruler__box"
        style={{
          width: px * scale,
          height: Math.min(px * scale, 48),
          borderRadius: 'var(--border-radius-xs)',
        }}
        aria-hidden="true"
      />
      {scale !== 1 ? <span className="lumo-alias">shown at ¼</span> : null}
    </div>
  );
}

function Sizing({ platform, theme }) {
  const sizes = tokensFor(platform, theme).filter(matching(/^--size-/));
  const semantic = sizes.filter((t) => !isCore(t));
  const core = sizes.filter(isCore).sort((a, b) => numberOf(a.value) - numberOf(b.value));
  const roles = groupBy(semantic, (t) => shortName(t.name, 'size').split('-')[0]);

  return (
    <Page
      title="Sizing"
      intro="Fixed dimensions for the things that have to line up across a product: icons,
             controls, avatars, touch targets and layout chrome."
    >
      <Note label="Platform">
        Sizing is authored per platform — the <strong>{platform}</strong> build is shown. Mobile
        control heights and touch targets differ from web.
      </Note>

      {roles.map(([role, tokens]) => (
        <Section key={role} title={`size-${role}`} note={ROLE_NOTES[role]}>
          <TokenTable
            tokens={tokens}
            columns={[{ header: 'Preview', render: (token) => <Box token={token} /> }]}
          />
        </Section>
      ))}

      <Section title="Core scale" note="The literal steps the roles resolve to.">
        <TokenTable tokens={core} showAlias={false} />
      </Section>
    </Page>
  );
}

export const Sizes = {
  name: 'Sizing',
  render: (_args, { globals }) => <Sizing {...globals} />,
};
