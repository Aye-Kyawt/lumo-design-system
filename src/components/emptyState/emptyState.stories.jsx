/**
 * Figma node under test:
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=94-1862
 *
 * Component set: `empty-state`, node 94:1862. One variant property, `Size`,
 * with two values — `Size=sm` (94:7) and `Size=md` (94:15). Two boolean
 * properties, `Description` and `Action`, and two slots, `↳Icon` (94:9 / 94:17,
 * holding `Icon/check` 94:2) and `↳Action` (94:14 / 94:22, empty in the node).
 * The set draws no interaction states at all — see gap 6 below.
 *
 * Known reported differences, see docs/emptyState.md:
 *   1. The node's `↳Action` slot is an empty 100x100 square in BOTH variants
 *      and it is load-bearing in the measurement: the frames are 360x256 (sm)
 *      and 520x284 (md) only because of it. Here the slot is sized by the
 *      Button the caller puts in it, so a real empty state is roughly 100px
 *      shorter than the node measures. Measure the parts, not the frame height.
 *   2. The medallion corner binds `core.border.radius.full`, a core token with
 *      no semantic token in front of it. Kept as bound rather than substituted;
 *      `radius/avatar` and `radius/chip` both alias it if a designer prefers one.
 *   3. The 360px / 520px frame widths bind nothing and no token at any layer
 *      carries them. The component is fluid instead and the caller sizes it.
 *   4. The description is inset — 320px inside 360, 420px inside 520 — and
 *      binds nothing either, so it fills the container and wraps where the
 *      caller's width puts it, not where the node's screenshot does.
 *   5. The 56px and 72px medallions bind no variable and no semantic size token
 *      carries either number. Bound to core.size.56 and core.size.72, which are
 *      exact in every platform mode.
 *   6. Figma draws no hovered, pressed, focused, disabled or loading state for
 *      this component, and none is added here. Every interactive state in an
 *      empty state belongs to the Button in the action slot, which already has
 *      its own five. That is reported, not filled in.
 *
 * Platform modes: `spacing/gap/md` is 16px on web and mobile but 12px on admin,
 * and all four type styles shrink on admin, so the column tightens there. The
 * Platform toolbar switches it — check Web and Admin.
 */
import { Button } from '../button/button.jsx';
import { Card } from '../card/card.jsx';
import { EmptyState } from './emptyState.jsx';
import './emptyState.stories.css';

const SIZES = ['sm', 'md'];

/** The action the component description insists on: "always give the action". */
const Action = (props) => (
  <Button label="Clear filters" iconLeft={false} iconRight={false} {...props} />
);

export default {
  title: 'Components/Empty State',
  component: EmptyState,
  parameters: {
    controls: { disable: false },
    options: { layout: { showPanel: true } },
    docs: {
      description: {
        component:
          'Use an empty state when a list, card or page has nothing to show — no ' +
          'results, nothing created yet, a failed load, or no permission. Do not ' +
          'leave the user without a next step; always give the action. `Size` is ' +
          'the only variant property. The action slot is empty in Figma and takes ' +
          'the real Button component here — Empty State never draws a button of ' +
          'its own.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: 'Figma `Size`. Medallion size and the two type styles.',
      table: { defaultValue: { summary: 'sm' } },
    },
    title: {
      control: 'text',
      description: 'Figma `Title`. Always shown — the node has no boolean for it.',
    },
    description: {
      control: 'boolean',
      description: 'Figma `Description`, the boolean property. Shows the supporting line.',
      table: { defaultValue: { summary: 'true' } },
    },
    descriptionText: {
      control: 'text',
      description:
        'Figma `Description`, the text property. Renamed because the set spells ' +
        'two different properties `Description` — see docs/naming-conflicts.md.',
    },
    action: {
      control: 'boolean',
      description: 'Figma `Action`. Reveals the `↳Action` slot.',
      table: { defaultValue: { summary: 'true' } },
    },
    iconName: {
      control: 'text',
      description:
        'Material Symbols glyph inside the medallion. The node ships `check` ' +
        '(`Icon/check`, 94:2).',
      table: { defaultValue: { summary: 'check' } },
    },
    titleAs: {
      control: 'inline-radio',
      options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description:
        'Not a Figma property. The node’s title is a text layer, so `p` is the ' +
        'faithful default; pass a heading tag when the empty state owns a region.',
      table: { defaultValue: { summary: 'p' } },
    },
    icon: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    size: 'sm',
    title: 'No use cases match these filters',
    description: true,
    descriptionText: 'Try removing a filter, or ask our team to research a custom use case.',
    action: true,
    iconName: 'check',
    titleAs: 'p',
  },
};

/** Args-driven playground. Every property of the set is on the Controls panel. */
export const Playground = {
  render: (args) => (
    <div className="lumo-empty-state-frame">
      <EmptyState {...args}>
        <Action />
      </EmptyState>
    </div>
  ),
};

/* ---- One story per row of the component set ------------------------------ */

/** `Size=sm`, node 94:7 — the set's default variant. */
export const SizeSm = {
  name: 'Size = sm (94:7)',
  args: { size: 'sm' },
  render: (args) => (
    <div className="lumo-empty-state-frame lumo-empty-state-frame--sm">
      <EmptyState {...args}>
        <Action />
      </EmptyState>
    </div>
  ),
};

/** `Size=md`, node 94:15. */
export const SizeMd = {
  name: 'Size = md (94:15)',
  args: { size: 'md' },
  render: (args) => (
    <div className="lumo-empty-state-frame lumo-empty-state-frame--md">
      <EmptyState {...args}>
        <Action />
      </EmptyState>
    </div>
  ),
};

/* ---- The two boolean properties, against both sizes ---------------------- */

/** `Description=false`. The supporting line is gone; the gap closes with it. */
export const WithoutDescription = {
  name: 'Description = false',
  render: (args) => (
    <div className="lumo-empty-state-row">
      {SIZES.map((size) => (
        <div className="lumo-empty-state-cell" key={size}>
          <p className="lumo-empty-state-cell__head">Size = {size}</p>
          <div className={`lumo-empty-state-frame lumo-empty-state-frame--${size}`}>
            <EmptyState {...args} size={size} description={false}>
              <Action />
            </EmptyState>
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * `Action=false`. The slot is gone entirely. The component description argues
 * against shipping this one, but the set defines it, so it is here.
 */
export const WithoutAction = {
  name: 'Action = false',
  render: (args) => (
    <div className="lumo-empty-state-row">
      {SIZES.map((size) => (
        <div className="lumo-empty-state-cell" key={size}>
          <p className="lumo-empty-state-cell__head">Size = {size}</p>
          <div className={`lumo-empty-state-frame lumo-empty-state-frame--${size}`}>
            <EmptyState {...args} size={size} action={false} />
          </div>
        </div>
      ))}
    </div>
  ),
};

/** Both booleans off: medallion and title only. */
export const TitleOnly = {
  name: 'Description = false, Action = false',
  render: (args) => (
    <div className="lumo-empty-state-row">
      {SIZES.map((size) => (
        <div className="lumo-empty-state-cell" key={size}>
          <p className="lumo-empty-state-cell__head">Size = {size}</p>
          <div className={`lumo-empty-state-frame lumo-empty-state-frame--${size}`}>
            <EmptyState {...args} size={size} description={false} action={false} />
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * The whole matrix the set defines: Size x Description x Action, eight rows.
 * This is the one to hold against the node.
 */
export const Matrix = {
  render: (args) => (
    <div className="lumo-empty-state-matrix">
      {SIZES.map((size) =>
        [true, false].map((description) =>
          [true, false].map((action) => (
            <div className="lumo-empty-state-cell" key={`${size}-${description}-${action}`}>
              <p className="lumo-empty-state-cell__head">
                Size = {size} · Description = {String(description)} · Action = {String(action)}
              </p>
              <div className={`lumo-empty-state-frame lumo-empty-state-frame--${size}`}>
                <EmptyState
                  {...args}
                  size={size}
                  description={description}
                  action={action}
                >
                  <Action />
                </EmptyState>
              </div>
            </div>
          )),
        ),
      )}
    </div>
  ),
};

/* ---- The two slots ------------------------------------------------------- */

/**
 * The `↳Icon` slot. The node ships `Icon/check`; any Material Symbols glyph
 * swaps in, and the medallion keeps its size and fill.
 */
export const IconSlot = {
  name: '↳Icon slot',
  render: (args) => (
    <div className="lumo-empty-state-row">
      {['check', 'search_off', 'inbox', 'cloud_off', 'lock'].map((iconName) => (
        <div className="lumo-empty-state-cell" key={iconName}>
          <p className="lumo-empty-state-cell__head">{iconName}</p>
          <div className="lumo-empty-state-frame lumo-empty-state-frame--sm">
            <EmptyState {...args} iconName={iconName} description={false} action={false} />
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * The `↳Action` slot, which is empty in Figma. It takes the real `Button`
 * component — Empty State imports nothing of Button's styling and draws no
 * button of its own, so all five of Button's states keep working inside it.
 */
export const ActionSlot = {
  name: '↳Action slot (composes Button)',
  render: (args) => (
    <div className="lumo-empty-state-row">
      <div className="lumo-empty-state-cell">
        <p className="lumo-empty-state-cell__head">One button</p>
        <div className="lumo-empty-state-frame lumo-empty-state-frame--md">
          <EmptyState {...args} size="md">
            <Action />
          </EmptyState>
        </div>
      </div>
      <div className="lumo-empty-state-cell">
        <p className="lumo-empty-state-cell__head">Primary + secondary</p>
        <div className="lumo-empty-state-frame lumo-empty-state-frame--md">
          <EmptyState {...args} size="md">
            <Action />
            <Button label="Contact us" type="outline" iconLeft={false} iconRight={false} />
          </EmptyState>
        </div>
      </div>
      <div className="lumo-empty-state-cell">
        <p className="lumo-empty-state-cell__head">Button state = disabled</p>
        <div className="lumo-empty-state-frame lumo-empty-state-frame--md">
          <EmptyState {...args} size="md">
            <Action state="disabled" />
          </EmptyState>
        </div>
      </div>
    </div>
  ),
};

/**
 * In context: the empty state inside a `Card`, which is where the component
 * description says it belongs ("when a list, card or page has nothing to
 * show"). Both are imported, neither is re-drawn.
 */
export const InCard = {
  name: 'In context (inside Card)',
  render: (args) => (
    <div className="lumo-empty-state-frame lumo-empty-state-frame--md">
      <Card padding="xl">
        <EmptyState {...args} size="md" titleAs="h2">
          <Action />
        </EmptyState>
      </Card>
    </div>
  ),
};
