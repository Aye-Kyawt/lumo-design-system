/**
 * Figma node under test:
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=141-3144
 *
 * Component set: node 141:3144, `field`, MOLECULES. One variant property,
 * `State`, with four values — `default` (141:3118), `error` (141:3126),
 * `disabled` (141:3136) and `Type` (258:258, capital T as the set spells it).
 * Three rows per variant: Label row (141:3119) with a `Required` mark hidden in
 * all four, the `↳Control` slot (an instance of `_Slot/Content` 41:21), and the
 * Helper row — which in `error` alone carries `Icon/close` (90:8).
 *
 * WHICH STORIES ARE THE NODE AND WHICH ARE THIS BUILD'S READING
 *
 *   From the node:       Default, Error, Disabled, Type, AllStates
 *                        Required, WithoutHelper  (both are node properties —
 *                        the `Required` layer and the Helper row — shown at
 *                        their other value)
 *   This build's reading: WithRealControl, WithAGroupControl, LongText
 *
 * WithRealControl is the important one and it is not drawn in Figma at all.
 * A field is a wrapper with no tab stop, so hover, focus and press belong to
 * whatever sits in the slot — that story puts a real `<input>` in it so those
 * states can be clicked through, and shows the custom-property contract by
 * which the field hands its error skin to a control it does not own.
 *
 * LABEL-TO-CONTROL ASSOCIATION, AND WHY MOST OF THESE STORIES HAVE NONE
 *
 * `Field` emits the label's `for` only when `controlId` names a control. There
 * is no guessed default, because the field cannot see what is in the slot.
 * `WithRealControl` is the only story that names one, and it is the only story
 * whose `for` resolves and whose label is clickable. Every story that fills the
 * slot with the `_Slot/Content` placeholder names nothing and carries no `for`,
 * which is the truth of those stories: the placeholder is a `<div>`, and a
 * `<label for>` cannot name a `<div>`.
 *
 * The label row publishes `id="${id}-label"` in every story regardless. That is
 * the path for a slot holding something `for` is not allowed to address at all,
 * and `WithAGroupControl` is there to show it working.
 *
 * KNOWN REPORTED DIFFERENCES — all seven are in docs/field.md:
 *   1. The control's 40px height binds no variable. Bound to size/control/md,
 *      so it is 40px in web, 32px in admin, 44px in mobile. Check the Admin
 *      platform in the toolbar to see it move.
 *   2. The error icon's 14px box binds no variable. Bound to size/icon/sm, so
 *      it renders 16px against the node's 14px.
 *   3. The error icon's fill binds no variable; it is a flat exported SVG.
 *      Bound to color/icon/negative, which is the same value by hand.
 *   4. The node reports `text/secondary` for two different colours — #bfc2cf
 *      on the slot text and #636679 on the helper. The slot is bound by value
 *      to color/text/placeholder.
 *   5. The control borrows radius/card (12px) rather than radius/input (8px),
 *      and `error` borrows the *focused* rung of the negative border ramp
 *      although it is not drawn focused. Both followed exactly as drawn.
 *   6. `disabled` keeps the ordinary border and the red asterisk, while
 *      `Type` greys its helper to text/disabled. All three followed as drawn
 *      and raised rather than normalised.
 *   7. The component is fluid where the node is a fixed 320px frame. Always
 *      stated at its declaration in field.css; it is why these stories need
 *      the `lumo-field-frame` decorator below to be held against the node.
 */
import { Field } from './field.jsx';
import { FieldControlSlot } from './fieldControlSlot.jsx';
import './field.stories.css';

/** The strings the node itself draws, so a story matches the frame by default. */
const NODE_LABEL = 'Initiative name';
const NODE_HELPER = 'Shown to your team on the roadmap.';

export default {
  title: 'Components/Field',
  component: Field,
  parameters: {
    controls: { disable: false },
    options: { layout: { showPanel: true } },
    docs: {
      description: {
        component:
          'Use field to wrap any input control with a label, an optional required mark ' +
          'and helper or error text — used by Input, Select, Textarea and Checkbox ' +
          'groups alike. Do not write the field’s own error styling into the control; ' +
          'field carries it, by publishing `--lumo-field-control-border-color` and ' +
          '`--lumo-field-control-text-color` for the control to bind. The control ' +
          'itself is `children`: the Figma `↳Control` is a swappable slot, not a fixed ' +
          'sub-component, so this component imports nothing else in the registry.',
      },
    },
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['default', 'error', 'disabled', 'Type'],
      description:
        'Figma `State`. `Type` is the set’s own spelling for the filled state — kept ' +
        'verbatim because QA reads variant values off the node. See ' +
        'docs/naming-conflicts.md.',
      table: { defaultValue: { summary: 'default' } },
    },
    label: {
      control: 'text',
      description: 'Figma `Label` (141:3120).',
    },
    required: {
      control: 'boolean',
      description:
        'Figma `Required` (141:3121) — the asterisk layer, hidden in all four variants.',
      table: { defaultValue: { summary: 'false' } },
    },
    requiredText: {
      control: 'text',
      description:
        'Not a Figma property. The asterisk is `aria-hidden`, so this is the word a ' +
        'screen reader announces in its place.',
      table: { defaultValue: { summary: 'required' } },
    },
    helper: {
      control: 'boolean',
      description: 'Whether the helper row shows. The node draws it in every variant.',
      table: { defaultValue: { summary: 'true' } },
    },
    helperText: {
      control: 'text',
      description: 'Figma `Helper` (141:3125 / 141:3135). The error message when `state="error"`.',
    },
    iconName: {
      control: 'text',
      description:
        'Material Symbols glyph for the error icon. Defaults to `close`, which is what ' +
        'node 90:8 draws.',
      table: { defaultValue: { summary: 'close' } },
    },
    children: { control: false },
    id: { control: false },
    controlId: { control: false },
  },
  args: {
    label: NODE_LABEL,
    helperText: NODE_HELPER,
    required: false,
    helper: true,
    children: <FieldControlSlot />,
  },

  // The component is fluid, so without a frame every story stretches to the
  // canvas and nothing can be held against the node's 320px drawing — the long
  // strings in `LongText` stop wrapping at all. The frame is story scaffolding
  // and its width is explained in field.stories.css. The matrix stories draw
  // the same frame per cell; the outer one is the same width, so it is a
  // no-op there rather than a second constraint.
  decorators: [
    (Story) => (
      <div className="lumo-field-frame">
        <Story />
      </div>
    ),
  ],
};

/* ------------------------------------------------- one story per matrix row ---- */

/** `State=default` — node 141:3118. */
export const Default = {
  args: { state: 'default' },
  parameters: {
    docs: { description: { story: 'Node 141:3118. Placeholder grey in the control, helper at text/secondary.' } },
  },
};

/**
 * `State=error` — node 141:3126.
 * Exported as `ErrorState` so the module does not shadow the global `Error`;
 * the sidebar still reads "Error", which is what QA matches against the node.
 */
export const ErrorState = {
  name: 'Error',
  args: {
    state: 'error',
    helperText: NODE_HELPER,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Node 141:3126. The only variant whose helper row carries an icon (141:3133, ' +
          '`Icon/close` 90:8), and the only one that moves the control border — to ' +
          'border/negative/**focused**, which is what the node binds even though it is ' +
          'not drawn focused (gap 5). The helper row gets `role="alert"` so the message ' +
          'is announced; the node cannot draw that.',
      },
    },
  },
};

/** `State=disabled` — node 141:3136. */
export const Disabled = {
  args: { state: 'disabled' },
  parameters: {
    docs: {
      description: {
        story:
          'Node 141:3136. The label and helper grey to text/disabled. Note what the node ' +
          'does *not* change: the control keeps the ordinary border, not ' +
          'border/primary/disabled, and the required asterisk would stay red. Both are ' +
          'followed as drawn and raised as gap 6. This is also only half of disabled — ' +
          'the control in the slot must be disabled by its own attribute, which the ' +
          'field cannot do for it. See WithRealControl.',
      },
    },
  },
};

/** `State=Type` — node 258:258. */
export const Type = {
  args: { state: 'Type', children: <FieldControlSlot>Q4 platform migration</FieldControlSlot> },
  parameters: {
    docs: {
      description: {
        story:
          'Node 258:258 — the field with something typed into it. One thing changes ' +
          'against `default`: the control text goes from placeholder grey to ' +
          'text/primary. The helper also drops to text/disabled here, which nothing in ' +
          'the set explains (gap 6).',
      },
    },
  },
};

/** The whole component set, in the order the frame stacks it. */
export const AllStates = {
  name: 'All states',
  parameters: {
    docs: {
      description: {
        story:
          'Every row of the matrix at once, in the order frame 141:3144 stacks them. ' +
          'This is the story to hold against the Figma screenshot.',
      },
    },
  },
  render: (args) => (
    <div className="lumo-field-matrix">
      {[
        ['default', '141:3118', <FieldControlSlot key="d" />],
        ['error', '141:3126', <FieldControlSlot key="e" />],
        ['disabled', '141:3136', <FieldControlSlot key="x" />],
        ['Type', '258:258', <FieldControlSlot key="t">Q4 platform migration</FieldControlSlot>],
      ].map(([state, node, control]) => (
        <div className="lumo-field-cell" key={state}>
          <p className="lumo-field-cell__head">
            State={state} · {node}
          </p>
          <div className="lumo-field-frame">
            <Field {...args} state={state}>
              {control}
            </Field>
          </div>
        </div>
      ))}
    </div>
  ),
};

/* ------------------------------------- the node properties at their other value ---- */

/** The `Required` layer (141:3121), hidden in all four variants, turned on. */
export const Required = {
  parameters: {
    docs: {
      description: {
        story:
          'The `Required` mark exists in every variant of the set and is hidden in every ' +
          'one of them, so this is the half of that property the node never draws. The ' +
          'asterisk is `aria-hidden`; the word in `requiredText` is what is announced, ' +
          'which is an engineering addition — an asterisk alone tells a screen reader ' +
          'nothing. Shown on `default` and on `error`, because the node keeps the mark ' +
          'red in every state including disabled (gap 6).',
      },
    },
  },
  render: (args) => (
    <div className="lumo-field-matrix">
      {['default', 'error', 'disabled'].map((state) => (
        <div className="lumo-field-cell" key={state}>
          <p className="lumo-field-cell__head">State={state} · required</p>
          <div className="lumo-field-frame">
            <Field {...args} state={state} required>
              <FieldControlSlot />
            </Field>
          </div>
        </div>
      ))}
    </div>
  ),
};

/** The helper row off. */
export const WithoutHelper = {
  name: 'Without helper',
  args: { state: 'default', helper: false },
  parameters: {
    docs: {
      description: {
        story:
          'The node draws the helper row in all four variants, so this is the other ' +
          'value of that property. The field collapses to two rows and the gap below the ' +
          'control goes with it.',
      },
    },
  },
};

/* -------------------------------------------------- this build's reading ---- */

/**
 * Not drawn in Figma. A field has no tab stop of its own, so this is where the
 * interaction states actually live.
 */
export const WithRealControl = {
  name: 'With a real control',
  parameters: {
    docs: {
      description: {
        story:
          'Not from the node. The `↳Control` is a slot, and the Input component does not ' +
          'exist in the registry yet, so this story drops a plain `<input>` into the slot ' +
          'to show two things the placeholder cannot. First, that hover, focus and press ' +
          'belong to the control and not to the field — click into these. Second, the ' +
          'contract: the input binds `--lumo-field-control-border-color` and ' +
          '`--lumo-field-control-text-color`, so it picks up the error skin without the ' +
          'field restyling it, which is what the component description asks for. The ' +
          'disabled row shows both halves — the field greys its label and helper, the ' +
          'input carries its own `disabled` attribute. The input’s styling here is story ' +
          'scaffolding; it is not a component and ships with nothing.',
      },
    },
  },
  render: (args) => (
    <div className="lumo-field-matrix">
      {[
        ['default', 'Type into it, then tab away', false],
        ['error', 'This name is already taken.', false],
        ['disabled', 'Only an owner can rename this.', true],
      ].map(([state, helperText, isDisabled]) => (
        <div className="lumo-field-cell" key={state}>
          <p className="lumo-field-cell__head">State={state} · real control</p>
          <div className="lumo-field-frame">
            <Field
              {...args}
              state={state}
              helperText={helperText}
              id={`demo-${state}`}
              controlId={`demo-${state}-control`}
              required={state === 'error'}
            >
              <input
                className="lumo-field-demo-input"
                id={`demo-${state}-control`}
                type="text"
                placeholder="Content slot — swap in any component"
                defaultValue={state === 'error' ? 'Initiative name' : ''}
                disabled={isDisabled}
                aria-invalid={state === 'error' || undefined}
                aria-describedby={`demo-${state}-helper`}
              />
            </Field>
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * Not drawn in Figma. The other half of the association story: a slot holding
 * something `<label for>` cannot reach.
 */
export const WithAGroupControl = {
  name: 'With a group control',
  parameters: {
    docs: {
      description: {
        story:
          'Not from the node, and the reason the label row publishes an `id`. The ' +
          'component description says field wraps “Input, Select, Textarea and Checkbox ' +
          'groups alike” — but a checkbox or radio *group* is not a labelable element, ' +
          'and HTML’s `for` only reaches `input`, `select`, `textarea`, `button`, ' +
          '`meter`, `output` and `progress`. So `for` can never associate this one. The ' +
          'group points back at the label row with `aria-labelledby="${id}-label"` ' +
          'instead, and `aria-describedby` picks up the helper row the same way ' +
          '`With a real control` does. Inspect the radiogroup: its accessible name is ' +
          'the label row’s text, and no `for` is rendered because nothing could carry ' +
          'the id it would name.',
      },
    },
  },
  render: (args) => (
    <div className="lumo-field-frame">
      <Field
        {...args}
        state="default"
        id="demo-group"
        label="Visibility"
        helperText="Who can see this initiative on the roadmap."
      >
        <div
          role="radiogroup"
          aria-labelledby="demo-group-label"
          aria-describedby="demo-group-helper"
          className="lumo-field-demo-group"
        >
          {['Everyone', 'My team', 'Only me'].map((option, i) => (
            <label className="lumo-field-demo-choice" key={option}>
              <input type="radio" name="demo-group-visibility" defaultChecked={i === 0} />
              {option}
            </label>
          ))}
        </div>
      </Field>
    </div>
  ),
};

/** Overflow behaviour, which a fixed 320px frame cannot show. */
export const LongText = {
  name: 'Long label and helper',
  parameters: {
    docs: {
      description: {
        story:
          'Not from the node. The label row clips and ellipses on one line, as the node’s ' +
          'own `overflow: clip` and `nowrap` say it should; the helper wraps and the ' +
          'field grows. Worth a look because the node is a fixed 320px frame with short ' +
          'strings and cannot show either.',
      },
    },
  },
  args: {
    state: 'error',
    required: true,
    label:
      'Initiative name as it will appear on the public roadmap page and in the ' +
      'quarterly board review export',
    helperText:
      'That name is already in use by another initiative in this workspace. Pick ' +
      'something else, or archive the one that has it.',
  },
};
