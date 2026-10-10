/**
 * Figma node under test:
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=17-1201
 *
 * Component set: node 17:1201, named `Toggle` on the canvas and `Switch` in the
 * registry. One property, `On`, with two values — `On=true` (17:1202) and
 * `On=false` (17:1204). No size property, no state property. One child layer,
 * `Knob` (17:1203), built as the `switchKnob` sub-component.
 *
 * Known reported differences, see docs/switch.md:
 *   1. The node's 40x22 track, 16px knob and 3px knob inset bind no variables.
 *      Bound to size/control/md, size/icon/sm and spacing/padding/xs instead,
 *      so the switch renders 40x24 in web, 32x20 in admin and 44x24 in mobile
 *      against the node's 40x22. Check this story in both the Web and Admin
 *      platform modes in the toolbar.
 *   2. Neither radius binds a variable; radius/chip and radius/avatar are
 *      borrowed, and are exact in every mode.
 *   3. Hovered, pressed, focused and disabled are not drawn in Figma at all.
 *      The States story below is this build's mapping onto existing semantic
 *      tokens, not a reproduction of a node, and needs a designer's eye.
 *   4. The knob transition has a duration token and no easing token — all five
 *      motion/easing tokens are valueless in the export.
 */
import { useState } from 'react';
import { useArgs } from 'storybook/preview-api';

import { Switch } from './switch.jsx';
import './switch.stories.css';

export default {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    controls: { disable: false },
    options: { layout: { showPanel: true } },
    docs: {
      description: {
        component:
          'Use a toggle for one setting that takes effect immediately — "Write summary ' +
          'with AI" in the report builder. Do not use it when the change needs a Save ' +
          'action; use Checkbox for that. `On` is the only property the Figma set ' +
          'defines. The node carries no label, so the accessible name comes from the ' +
          'caller via `aria-label` or `aria-labelledby`.',
      },
    },
  },
  argTypes: {
    on: {
      control: 'boolean',
      description: 'Figma `On`. Which side the knob sits on and how the track is filled.',
      table: { defaultValue: { summary: 'true' } },
    },
    defaultOn: {
      control: 'boolean',
      description:
        'Starting value when `on` is not supplied. Defaults to the Figma set’s own ' +
        'default variant, `On=true` (17:1202).',
      table: { defaultValue: { summary: 'true' } },
    },
    disabled: {
      control: 'boolean',
      description:
        'Not a Figma variant — see docs/switch.md, gap 3. Blocks the change and is ' +
        'announced, while the control stays focusable.',
      table: { defaultValue: { summary: 'false' } },
    },
    onChange: { action: 'change', table: { disable: true } },
  },
  args: { on: true, disabled: false, 'aria-label': 'Write summary with AI' },

  /*
   * Passing `on` as an arg makes the switch controlled, which would leave the
   * arg-driven stories frozen under the pointer — the component is working and
   * looks broken. Feeding the change back into the args keeps them live, so
   * the Controls panel and the switch itself stay in step.
   *
   * The render-based stories below ignore args, so this is a no-op for them.
   */
  decorators: [
    (Story, context) => {
      const [, updateArgs] = useArgs();
      return (
        <Story
          args={{
            ...context.args,
            onChange: (next, event) => {
              updateArgs({ on: next });
              if (context.args.onChange) context.args.onChange(next, event);
            },
          }}
        />
      );
    },
  ],
};

/* ---------------------------------------------------- the 2-row matrix ---- */

/** `On=true` — node 17:1202. Track on `bg/primary/idle`, knob at the right inset. */
export const OnTrue = {
  name: 'On=true',
  args: { on: true },
};

/** `On=false` — node 17:1204. Track on `border/primary/default`, knob at the left inset. */
export const OnFalse = {
  name: 'On=false',
  args: { on: false },
};

/** Both variants side by side, the way the component set is laid out on the canvas. */
export const BothVariants = {
  name: 'The matrix',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-switch-stack">
      <div className="lumo-switch-row">
        <p className="lumo-switch-row__head">On=true</p>
        <Switch on aria-label="On" />
      </div>
      <div className="lumo-switch-row">
        <p className="lumo-switch-row__head">On=false</p>
        <Switch on={false} aria-label="Off" />
      </div>
    </div>
  ),
};

/* ------------------------------------------------------------- states ---- */

/**
 * Figma draws none of these. Every one is a real behaviour bound to a semantic
 * token that already carries that meaning — nothing was invented — but the
 * mapping is this build's reading and wants a designer's confirmation.
 * Reported as gap 3 in docs/switch.md.
 *
 * Hover and press are live: put a pointer on the first two rows. Focus is
 * live too — tab through the row and watch `elevation/focused`.
 */
export const States = {
  name: 'States — not drawn in Figma',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-switch-stack">
      <div className="lumo-switch-row">
        <p className="lumo-switch-row__head">default</p>
        <Switch on aria-label="On, default" />
        <Switch on={false} aria-label="Off, default" />
      </div>
      <div className="lumo-switch-row">
        <p className="lumo-switch-row__head">hovered / pressed</p>
        <Switch on aria-label="On, hover me" />
        <Switch on={false} aria-label="Off, hover me" />
      </div>
      <div className="lumo-switch-row">
        <p className="lumo-switch-row__head">focused — tab to it</p>
        <Switch on aria-label="On, focusable" />
        <Switch on={false} aria-label="Off, focusable" />
      </div>
      <div className="lumo-switch-row">
        <p className="lumo-switch-row__head">disabled</p>
        <Switch on disabled aria-label="On, disabled" />
        <Switch on={false} disabled aria-label="Off, disabled" />
      </div>
    </div>
  ),
};

/* --------------------------------------------------------- behaviour ---- */

/**
 * The switch actually switches. Uncontrolled: it keeps its own state, seeded
 * from the Figma set's default variant, `On=true`. Click it, or tab to it and
 * press Space or Enter.
 */
export const Uncontrolled = {
  name: 'It works — uncontrolled',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-switch-stack">
      <div className="lumo-switch-row">
        <p className="lumo-switch-row__head">starts on (Figma default)</p>
        <Switch aria-label="Starts on" />
      </div>
      <div className="lumo-switch-row">
        <p className="lumo-switch-row__head">starts off</p>
        <Switch defaultOn={false} aria-label="Starts off" />
      </div>
      <div className="lumo-switch-row">
        <p className="lumo-switch-row__head">disabled, will not move</p>
        <Switch defaultOn disabled aria-label="Disabled, will not move" />
      </div>
    </div>
  ),
};

/** Controlled: the caller owns the value, and `onChange` reports where it is going. */
export const Controlled = {
  name: 'It works — controlled',
  parameters: { controls: { disable: true } },
  render: function ControlledSwitch() {
    const [on, setOn] = useState(false);
    return (
      <div className="lumo-switch-stack">
        <div className="lumo-switch-row">
          <Switch on={on} onChange={setOn} aria-labelledby="lumo-switch-controlled-label" />
          <p className="lumo-switch-row__head" id="lumo-switch-controlled-label">
            Write summary with AI
          </p>
        </div>
        <p className="lumo-switch-note">
          Caller state: <code>{String(on)}</code>
        </p>
      </div>
    );
  },
};

/**
 * The setting a toggle is actually met in: one row, label beside it, taking
 * effect the moment it moves. Per the Figma description, no Save button.
 */
export const InContext = {
  name: 'In context',
  parameters: { controls: { disable: true } },
  render: function SettingsList() {
    const [settings, setSettings] = useState({
      summary: true,
      digest: false,
      sounds: true,
    });
    const rows = [
      ['summary', 'Write summary with AI'],
      ['digest', 'Email me a weekly digest'],
      ['sounds', 'Play notification sounds'],
    ];
    return (
      <div className="lumo-switch-settings">
        {rows.map(([key, label]) => (
          <div className="lumo-switch-setting" key={key}>
            <span className="lumo-switch-setting__label" id={`lumo-switch-${key}`}>
              {label}
            </span>
            <Switch
              on={settings[key]}
              onChange={(next) => setSettings((s) => ({ ...s, [key]: next }))}
              aria-labelledby={`lumo-switch-${key}`}
            />
          </div>
        ))}
      </div>
    );
  },
};
