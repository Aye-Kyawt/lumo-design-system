/**
 * Figma node under test:
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=64-113
 *
 * Component set: `card`, node 65:230 — State (default | hovered | focused |
 * disabled) x Padding (none | md | lg | xl), 16 variants.
 * Sub-components: card/layout/vertical 63:98, card/header 62:109, card/footer 62:115.
 */
import { Card } from './card.jsx';
import { CardLayoutVertical } from './cardLayoutVertical.jsx';
import './card.stories.css';

const STATES = ['default', 'hovered', 'focused', 'disabled'];
const PADDINGS = ['none', 'md', 'lg', 'xl'];

/** Stands in for Figma's _Slot/Content (41:21). Story scaffolding, not API. */
const Slot = ({ variant = '', children = 'Content slot — swap in any component' }) => (
  <div className={`lumo-card-slot ${variant}`.trim()}>{children}</div>
);

const Stage = ({ children }) => <div className="lumo-card-stage">{children}</div>;

/** The exact arrangement drawn in the Figma variants. */
const DesignBody = (props) => (
  <CardLayoutVertical body={<Slot />} {...props} />
);

export default {
  title: 'Components/Card',
  component: Card,
  parameters: {
    controls: { disable: false },
    options: { layout: { showPanel: true } },
    docs: {
      description: {
        component:
          'Groups related content into one surface a user can scan or act on. ' +
          'The card owns the surface, border, radius and padding; everything inside ' +
          'comes from a card layout placed in the ↳Layout slot. Never nest a card in a card.',
      },
    },
  },
  argTypes: {
    state: {
      control: 'inline-radio',
      options: STATES,
      description: 'Figma `State`. Forces the visual state.',
      table: { defaultValue: { summary: 'default' } },
    },
    padding: {
      control: 'inline-radio',
      options: PADDINGS,
      description: 'Figma `Padding`. Inset around the ↳Layout slot.',
      table: { defaultValue: { summary: 'none' } },
    },
    onClick: {
      description: 'Supplying this makes the card activatable: focusable, Enter/Space, real hover and focus.',
    },
    children: { control: false, description: 'The ↳Layout slot.' },
  },
  args: { state: 'default', padding: 'none' },
  render: (args) => (
    <Stage>
      <Card {...args}>
        <DesignBody />
      </Card>
    </Stage>
  ),
};

/* ------------------------------------------------- the 16-row matrix ---- */

export const DefaultPaddingNone = { args: { state: 'default', padding: 'none' } };
export const HoveredPaddingNone = { args: { state: 'hovered', padding: 'none' } };
export const FocusedPaddingNone = { args: { state: 'focused', padding: 'none' } };
export const DisabledPaddingNone = { args: { state: 'disabled', padding: 'none' } };

export const DefaultPaddingMd = { args: { state: 'default', padding: 'md' } };
export const HoveredPaddingMd = { args: { state: 'hovered', padding: 'md' } };
export const FocusedPaddingMd = { args: { state: 'focused', padding: 'md' } };
export const DisabledPaddingMd = { args: { state: 'disabled', padding: 'md' } };

export const DefaultPaddingLg = { args: { state: 'default', padding: 'lg' } };
export const HoveredPaddingLg = { args: { state: 'hovered', padding: 'lg' } };
export const FocusedPaddingLg = { args: { state: 'focused', padding: 'lg' } };
export const DisabledPaddingLg = { args: { state: 'disabled', padding: 'lg' } };

export const DefaultPaddingXl = { args: { state: 'default', padding: 'xl' } };
export const HoveredPaddingXl = { args: { state: 'hovered', padding: 'xl' } };
export const FocusedPaddingXl = { args: { state: 'focused', padding: 'xl' } };
export const DisabledPaddingXl = { args: { state: 'disabled', padding: 'xl' } };

/** Every row at once, laid out the way the Figma component set is. */
export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-card-grid">
      {PADDINGS.map((padding) => (
        <div key={padding} style={{ display: 'contents' }}>
          <p className="lumo-card-grid__label">Padding = {padding}</p>
          {STATES.map((state) => (
            <Card key={`${padding}-${state}`} state={state} padding={padding}>
              <DesignBody />
            </Card>
          ))}
        </div>
      ))}
    </div>
  ),
};

/* --------------------------------------------- sub-component coverage ---- */

/** card/header with its `↳Action` slot filled. */
export const HeaderWithAction = {
  name: 'Header — with action',
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Card padding="md">
        <CardLayoutVertical
          headerProps={{ action: true, children: <Slot variant="lumo-card-slot--action">Action</Slot> }}
          body={<Slot />}
        />
      </Card>
    </Stage>
  ),
};

/** card/header with `subtitle` off — title only. */
export const HeaderWithoutSubtitle = {
  name: 'Header — no subtitle',
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Card padding="md">
        <CardLayoutVertical headerProps={{ subtitle: false }} body={<Slot />} />
      </Card>
    </Stage>
  ),
};

/** card/layout/vertical with `footer` on — divider plus a trailing action row. */
export const WithFooter = {
  name: 'Layout — with footer',
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Card padding="md">
        <CardLayoutVertical
          body={<Slot />}
          footer
          footerContent={<Slot variant="lumo-card-slot--footer">Footer slot</Slot>}
        />
      </Card>
    </Stage>
  ),
};

/** card/layout/vertical with `header` off — body only. */
export const WithoutHeader = {
  name: 'Layout — no header',
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Card padding="md">
        <CardLayoutVertical header={false} body={<Slot />} />
      </Card>
    </Stage>
  ),
};

/* ------------------------------------------------------- behaviour ---- */

/**
 * With `onClick` the card becomes a role="button": tab to it, press Enter or
 * Space, and hover and focus-visible paint the states the design draws.
 */
export const Interactive = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Card padding="md" onClick={() => {}}>
        <CardLayoutVertical
          headerProps={{ title: 'Interactive card', subtitleLabel: 'Hover me, or tab to me' }}
          body={<Slot />}
        />
      </Card>
    </Stage>
  ),
};

/** A disabled card takes no focus and fires no click, whatever `onClick` says. */
export const InteractiveDisabled = {
  name: 'Interactive — disabled',
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Card padding="md" state="disabled" onClick={() => {}}>
        <CardLayoutVertical
          headerProps={{ title: 'Disabled card', subtitleLabel: 'Not focusable, not clickable' }}
          body={<Slot />}
        />
      </Card>
    </Stage>
  ),
};

/** A title long enough to prove the text block yields rather than shoves. */
export const LongTitle = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Stage>
      <Card padding="md">
        <CardLayoutVertical
          headerProps={{
            title: 'A card title long enough to wrap across more than a single line',
            subtitleLabel: 'And a supporting line that also runs past the edge of the card',
            action: true,
            children: <Slot variant="lumo-card-slot--action">Action</Slot>,
          }}
          body={<Slot />}
        />
      </Card>
    </Stage>
  ),
};
