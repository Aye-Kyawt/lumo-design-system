/**
 * Figma node under test:
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=151-162
 *
 * Component set: `toast`, node 151:162. One variant property, `Status`, with
 * four values — positive (151:130), negative (151:138), warning (151:146) and
 * info (151:154). Two boolean properties, `Description` and `Close`, and one
 * slot, `↳Icon`, holding `Icon/check` (94:2). The close control is an instance
 * of `Icon/close` (90:8).
 *
 * Known reported differences, see docs/toast.md:
 *   1. The 400px frame width binds no variable and no token at any layer
 *      carries 400. The component is fluid and the caller sizes it; the
 *      stories put it in a 400px frame so it can be held against the node.
 *   2. All four statuses draw the SAME `check` glyph. The four exported SVGs
 *      are byte-identical apart from their fill, so only the colour carries
 *      the status — a `negative` toast ships a tick in red. Which glyph a
 *      negative or warning toast should draw is a design decision.
 *   3. The close icon's fill binds no variable. Its exported value is #636679,
 *      which is neutral/600 exactly; `color/text/secondary` is the semantic
 *      name in front of it, and the `color/icon/*` family has no neutral rung
 *      at all. The colour is exact and the name is this build's reading.
 *   4. The set draws no hovered, pressed, focused or disabled state for the
 *      close control — the only interactive thing in a toast. The three
 *      bound here are readings of the neutral ramp, flagged in toastClose.css.
 *   5. `radius/card` reads 16 in the live Figma file and 12px in the committed
 *      token export, in all three platform modes. The token name is bound, not
 *      the number. A re-export is the Token Runner's to make.
 *   6. The node applies `elevation/level2`, whose own description reads
 *      "Dropdowns, menus, popovers, tooltips", while `elevation/level4` reads
 *      "Modals, dialogs, toasts". The node is followed; the scale disagrees.
 *
 * Platform modes: `spacing/padding/md` and both type styles shrink on admin, so
 * the toast tightens there. The Platform toolbar switches it — check Web and
 * Admin, and check Dark on each.
 */
import { useState } from 'react';

import { Toast } from './toast.jsx';
import { ToastClose } from './toastClose.jsx';
import './toast.stories.css';

/** `Status`, exactly as the Figma set spells its four values. */
const STATUSES = ['positive', 'negative', 'warning', 'info'];

/** The node ids, so each story and each matrix cell can name the one it draws. */
const NODE = {
  positive: '151:130',
  negative: '151:138',
  warning: '151:146',
  info: '151:154',
};

/** The copy the node itself carries, in both text layers. */
const NODE_TITLE = 'Report saved';
const NODE_DESCRIPTION = 'Q3 2026 AI value report is ready to share.';

export default {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    controls: { disable: false },
    options: { layout: { showPanel: true } },
    docs: {
      description: {
        component:
          'Use a toast to confirm that something happened after the user acted — saved, ' +
          'sent, deleted, failed — without interrupting what they are doing. Do not use ' +
          'it for anything the user must act on; that is a Modal or an Alert. Because of ' +
          'that, the root is `role="status"` with `aria-live="polite"` and never an ' +
          'alert: it announces without taking focus. `Status` is the only variant ' +
          'property and it changes exactly one thing — the icon colour.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: STATUSES,
      description: 'Figma `Status`. The only variant property in the set.',
    },
    title: { control: 'text', description: 'Figma `Title` (151:134).' },
    description: {
      control: 'boolean',
      description: 'Figma `Description`, the boolean. Shows or hides the second line.',
    },
    descriptionText: {
      control: 'text',
      description:
        'Figma `Description`, the text. Renamed because the set spells the boolean and ' +
        'the text with one name — see docs/naming-conflicts.md.',
    },
    close: {
      control: 'boolean',
      description: 'Figma `Close`. Shows or hides the dismiss control.',
    },
    iconName: {
      control: 'text',
      description:
        'Material Symbols glyph for the status icon. The node ships `check` in all four ' +
        'statuses (gap 2); any glyph name works.',
    },
    closeLabel: {
      control: 'text',
      description:
        'Accessible name for the close control. Not a Figma property — the glyph is ' +
        '`aria-hidden` decoration, so the announced word has to come from somewhere.',
    },
    onClose: { control: false },
  },
  args: {
    status: 'positive',
    title: NODE_TITLE,
    description: true,
    descriptionText: NODE_DESCRIPTION,
    close: true,
    iconName: 'check',
  },

  // The component is fluid (gap 1), so without a frame every story stretches to
  // the canvas and nothing can be held against the node's 400px drawing. The
  // frame is story scaffolding and its width is explained in
  // toast.stories.css. The matrix story draws the same frame per cell, so the
  // outer one is a no-op there rather than a second constraint.
  decorators: [
    (Story) => (
      <div className="lumo-toast-frame">
        <Story />
      </div>
    ),
  ],
};

/* ------------------------------------------------- one story per matrix row ---- */

/** `Status=positive` — node 151:130. */
export const Positive = {
  args: { status: 'positive' },
  parameters: {
    docs: {
      description: {
        story: `Node ${NODE.positive}. The tick at color/icon/positive — green/600, the exact fill the node's own SVG carries.`,
      },
    },
  },
};

/** `Status=negative` — node 151:138. */
export const Negative = {
  args: { status: 'negative' },
  parameters: {
    docs: {
      description: {
        story:
          `Node ${NODE.negative}. color/icon/negative — red/600. Note the glyph: it is still ` +
          'a tick, because that is what the node draws (gap 2). A red check mark on a ' +
          'failure message is the clearest thing this build found in the node and the ' +
          'one most worth a designer looking at.',
      },
    },
  },
};

/** `Status=warning` — node 151:146. */
export const Warning = {
  args: { status: 'warning' },
  parameters: {
    docs: {
      description: {
        story: `Node ${NODE.warning}. color/icon/warning — orange/600. Same tick glyph (gap 2).`,
      },
    },
  },
};

/** `Status=info` — node 151:154. */
export const Info = {
  args: { status: 'info' },
  parameters: {
    docs: {
      description: {
        story: `Node ${NODE.info}. color/icon/info — blue/600. Same tick glyph (gap 2).`,
      },
    },
  },
};

/** The whole component set, in the order the frame stacks it. */
export const AllStatuses = {
  name: 'All statuses',
  parameters: {
    docs: {
      description: {
        story:
          'Every row of the matrix at once, in the order frame 151:162 stacks them. This ' +
          'is the story to hold against the Figma screenshot. Only the icon colour ' +
          'changes down the column — everything else in all four is identical, which is ' +
          'what the node draws and what makes gap 2 visible.',
      },
    },
  },
  render: (args) => (
    <div className="lumo-toast-matrix">
      {STATUSES.map((status) => (
        <div className="lumo-toast-cell" key={status}>
          <p className="lumo-toast-cell__head">
            Status={status} · {NODE[status]}
          </p>
          <div className="lumo-toast-frame">
            <Toast {...args} status={status} />
          </div>
        </div>
      ))}
    </div>
  ),
};

/* ------------------------------- the node properties at their other value ---- */

/**
 * `Description=false` on all four statuses. The node draws the description in
 * every variant, so this is the half of that property it never shows.
 */
export const WithoutDescription = {
  name: 'Description=false',
  parameters: {
    docs: {
      description: {
        story:
          'The `Description` boolean turned off. The toast collapses to a single line and ' +
          'the icon and close control stay on the title’s line box — they are ' +
          '`align-items: flex-start`, not centred, so a one-line toast and a two-line ' +
          'toast align their icons identically. Shown on all four statuses because the ' +
          'node draws the description in every one of them.',
      },
    },
  },
  render: (args) => (
    <div className="lumo-toast-matrix">
      {STATUSES.map((status) => (
        <div className="lumo-toast-frame" key={status}>
          <Toast {...args} status={status} description={false} />
        </div>
      ))}
    </div>
  ),
};

/**
 * `Close=false` on all four statuses. The node draws the close control in every
 * variant, so this is the half of that property it never shows.
 */
export const WithoutClose = {
  name: 'Close=false',
  parameters: {
    docs: {
      description: {
        story:
          'The `Close` boolean turned off. The text column takes the space back — it is ' +
          '`flex: 1 0 0`, so nothing else moves. A toast with no dismiss control has to ' +
          'be dismissed by whatever stacks it; the component has no timer of its own and ' +
          'the node defines none.',
      },
    },
  },
  render: (args) => (
    <div className="lumo-toast-matrix">
      {STATUSES.map((status) => (
        <div className="lumo-toast-frame" key={status}>
          <Toast {...args} status={status} close={false} />
        </div>
      ))}
    </div>
  ),
};

/** Both booleans off at once — the smallest thing the set can draw. */
export const TitleOnly = {
  name: 'Description=false, Close=false',
  args: { description: false, close: false },
  parameters: {
    docs: {
      description: {
        story:
          'Both booleans off. One line, one icon, no control. Worth a look because it is ' +
          'the only configuration where the frame height is set by the title’s line ' +
          'box alone — 20px of text in 16px of padding, so 54px against the node’s 74.',
      },
    },
  },
};

/* ----------------------------------------- the states the node does not draw ---- */

/**
 * The close control's four interaction states (gap 4). These are real CSS
 * states, not props — the set has no state variants, so there is nothing to
 * set. They have to be exercised rather than screenshotted.
 */
export const CloseControlStates = {
  name: 'Close control states',
  parameters: {
    docs: {
      description: {
        story:
          'The set draws no interaction state at all, and the close control is the only ' +
          'interactive thing in a toast (gap 4). Each state below is a reading of the ' +
          'neutral ramp — idle is text/secondary, which is the node’s exact exported ' +
          'fill; hovered is text/primary; pressed is text/bold; focused keeps the hovered ' +
          'colour and adds elevation/focused, the token whose own description reads ' +
          '"Keyboard focus indicator". No hover background and no padding are added, ' +
          'because the node fixes this control at 16x16 and a background plate would ' +
          'need a radius and an inset that no token carries for it. **Exercise them:** ' +
          'hover the first, Tab to the second, click and hold the third. The fourth is ' +
          '`disabled`, which is settable on the sub-component and is styled defensively ' +
          '— a toast itself is never disabled.',
      },
    },
  },
  render: () => (
    <div className="lumo-toast-states">
      {[
        ['idle — text/secondary, the node’s exported fill', false],
        ['hovered — text/primary · hover it', false],
        ['pressed — text/bold · click and hold', false],
        ['focused — elevation/focused · Tab to it', false],
        ['disabled — icon/disabled · sub-component only', true],
      ].map(([caption, isDisabled]) => (
        <div className="lumo-toast-states__row" key={caption}>
          <ToastClose disabled={isDisabled || undefined} />
          <span className="lumo-toast-states__caption">{caption}</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * The behaviour the node cannot draw: the close control actually closing it.
 */
export const Dismissible = {
  parameters: {
    docs: {
      description: {
        story:
          'The close control is drawn in every variant of the set and has nothing to do ' +
          'in a static frame. `onClose` is what it does, and it is an engineering ' +
          'addition rather than a Figma property — documented as one. Click the X; press ' +
          'Reset to bring it back. Without an `onClose` the button still renders and is ' +
          'still focusable, which is exactly what the design specifies.',
      },
    },
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div className="lumo-toast-dismissible">
        {open ? (
          <Toast {...args} onClose={() => setOpen(false)} />
        ) : (
          <p className="lumo-toast-dismissible__empty">Dismissed.</p>
        )}
        <button type="button" className="lumo-toast-reset" onClick={() => setOpen(true)}>
          Reset
        </button>
      </div>
    );
  },
};

/**
 * Wrapping. The node's strings both fit on one line, so nothing in the design
 * says what a long one does.
 */
export const LongText = {
  name: 'Long text',
  args: {
    title: 'Report saved to the shared Q3 workspace for the whole value team',
    descriptionText:
      'Q3 2026 AI value report is ready to share with everyone on the distribution list, ' +
      'including the regional leads who asked for it last week.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Both strings past the width the node draws. The text column is `flex: 1 0 0` ' +
          'with `min-inline-size: 0` and `word-break: break-word`, so long copy wraps ' +
          'instead of pushing the close control out of the frame. The icon and the close ' +
          'control stay on the first line. Nothing in the node specifies this — its own ' +
          'two strings both fit — so the wrapping behaviour is a reading, not a drawing.',
      },
    },
  },
};

/**
 * `↳Icon` at a glyph other than the one the node ships, which is the only way
 * to see gap 2 resolved.
 */
export const OtherGlyphs = {
  name: 'Other glyphs',
  parameters: {
    docs: {
      description: {
        story:
          'The `↳Icon` slot, as a Material Symbols glyph name (the Button precedent in ' +
          'docs/naming-conflicts.md). The node ships `check` in all four statuses; these ' +
          'are the glyphs each status would plausibly want instead. **This is a ' +
          'demonstration of the gap, not a fix** — nothing in the component defaults to ' +
          'them, because which glyph a negative toast draws is a design decision and the ' +
          'Designer makes it.',
      },
    },
  },
  render: (args) => (
    <div className="lumo-toast-matrix">
      {[
        ['positive', 'check_circle'],
        ['negative', 'error'],
        ['warning', 'warning'],
        ['info', 'info'],
      ].map(([status, iconName]) => (
        <div className="lumo-toast-frame" key={status}>
          <Toast {...args} status={status} iconName={iconName} />
        </div>
      ))}
    </div>
  ),
};
