/**
 * field — Figma component set 141:3144
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=141-3144
 *
 * "Use field to wrap any input control with a label, an optional required mark
 *  and helper or error text — used by Input, Select, Textarea and Checkbox
 *  groups alike. Don't write the field's own error styling into the control;
 *  field carries it."
 *   — the component's own description in Figma
 *
 * One variant property, `State`, with four values:
 *   default  141:3118
 *   error    141:3126
 *   disabled 141:3136
 *   Type     258:258   (capital T, exactly as the set spells it)
 *
 * Three rows in every variant: a Label row (label plus a `Required` mark that
 * is hidden in all four), a Control row, and a Helper row — which in `error`
 * alone also carries an `Icon/close` instance (141:3133).
 *
 * The Control is an instance of `_Slot/Content` (41:21), whose own description
 * reads "Placeholder slot. Swap it for the real component you want inside this
 * area. Never ship a screen with a slot still showing." So the control is not
 * a fixed sub-component — it is `children`, and this component imports no
 * other component in the registry. `fieldControlSlot.jsx` reproduces the
 * placeholder for the stories; it is never a default.
 *
 * How the field "carries" the control's error styling without restyling a
 * component it does not own: it publishes two custom properties on the root,
 * `--lumo-field-control-border-color` and `--lumo-field-control-text-color`.
 * Any control dropped into the slot binds those and inherits the state. The
 * contract is spelled out in docs/field.md.
 *
 * Every difference from the node — seven of them — is in docs/field.md. None
 * was guessed; the unbound values are each bound to the nearest semantic token
 * whose family carries the right meaning, and flagged at their declaration.
 */
import { useId } from 'react';

import { FieldIcon } from './fieldIcon.jsx';
import './field.css';

/** `State`, exactly as the Figma set spells its four values. */
const STATE = ['default', 'error', 'disabled', 'Type'];

/**
 * @param {object} props
 * @param {'default'|'error'|'disabled'|'Type'} [props.state]
 *   Figma `State`. `Type` is the set's own spelling for the filled state — see
 *   docs/naming-conflicts.md for why it was kept and what was suggested back.
 * @param {string} [props.label]
 *   Figma `Label` (141:3120). The text of the label row.
 * @param {boolean} [props.required]
 *   Figma `Required` (141:3121), the mark hidden in all four variants. Shows
 *   the red asterisk and appends `requiredText` for screen readers.
 * @param {string} [props.requiredText]
 *   Not a Figma property. The asterisk is decoration, so the word a screen
 *   reader announces has to come from somewhere; this is it.
 * @param {boolean} [props.helper]
 *   Whether the helper row shows at all. The node draws it in every variant.
 * @param {string} [props.helperText]
 *   Figma `Helper` (141:3125 / 141:3135). In `error` this is the error message
 *   and the row grows an icon.
 * @param {string} [props.iconName]
 *   Material Symbols glyph for the error icon. Defaults to `close`, which is
 *   what node 90:8 draws.
 * @param {React.ReactNode} [props.children]
 *   The `↳Control` slot (141:3122 and friends). Put the real Input, Select,
 *   Textarea or Checkbox group here. Named `children` per the Card precedent
 *   in docs/naming-conflicts.md, since the field has exactly one slot.
 * @param {string} [props.id]
 *   Seeds the ids of the label row (`${id}-label`) and the helper row
 *   (`${id}-helper`), so a control in the slot can reference either. Generated
 *   when absent — and a generated id is useless to you, so pass one whenever
 *   you need to wire `aria-labelledby` or `aria-describedby`.
 * @param {string} [props.controlId]
 *   The `id` of the labelable control inside the slot. Pass it and the label
 *   gets `for`; omit it and the label gets no `for` at all. There is no
 *   guessed default: the field cannot see what you put in the slot, and a `for`
 *   pointing at nothing is worse than none. Only pass this for an element `for`
 *   can legally name — input, select, textarea, button, meter, output,
 *   progress. For anything else (a checkbox or radio group, a custom
 *   combobox), leave it off and point that thing at `${id}-label` with
 *   `aria-labelledby`.
 * @param {string} [props.className]
 */
export function Field({
  state = 'default',
  label = '',
  required = false,
  requiredText = 'required',
  helper = true,
  helperText = '',
  iconName = 'close',
  children,
  id,
  controlId,
  className = '',
  ...rest
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const labelId = `${fieldId}-label`;
  const helperId = `${fieldId}-helper`;

  // `for` is emitted when, and only when, the caller has NAMED the control —
  // that is, passed `controlId`. There is no longer a `${id}-control` fallback,
  // and that removal is the repair.
  //
  // The fallback was `controlId || `${fieldId}-control``, which guessed a
  // target in two situations where no target existed:
  //
  //   1. No `id` either, so `fieldId` was React's `useId` value — opaque, never
  //      reaching the caller, so no control anywhere could be holding
  //      `${fieldId}-control`. QA found this on the deployed build in 7 of the
  //      9 stories: every story filling the slot with the `_Slot/Content`
  //      placeholder (Staging Testing, "label-to-control association through
  //      the slot").
  //   2. `id` passed, which says only "seed my label and helper ids" and does
  //      NOT say "and I put `${id}-control` on a control". Narrowing the guess
  //      to this case was the first repair attempted here, and the group story
  //      below broke it immediately: it passes `id` for the helper wiring and
  //      has no labelable control at all, and the field dutifully emitted
  //      `for="demo-group-control"` pointing at nothing.
  //
  // A `for` pointing at no element is worse than no `for`: it tells assistive
  // tech the label has a target and then hands over an empty reference, and
  // clicking the label moves focus nowhere. Guessing cannot be made safe here,
  // because only the caller knows what is in the slot — so the field stops
  // guessing and asks.
  //
  // `labelId` is the other half, and it is published in every case. A slot can
  // hold something `<label for>` is not allowed to address at all: a checkbox
  // group, a radio group, a custom combobox, or the placeholder — `for` reaches
  // only input, select, textarea, button, meter, output and progress. Those
  // point back at the label row with `aria-labelledby` instead.
  //
  // There is no `targetId` local any more, deliberately: `controlId` now goes
  // straight onto `htmlFor` below, so there is no place left for a default to
  // creep back in.

  // An unknown `state` would silently drop every colour, because the whole skin
  // hangs off the `data-state` attribute. Fall back to the set's own default
  // variant rather than render an unstyled field.
  const resolvedState = STATE.includes(state) ? state : 'default';

  const classes = ['lumo-field', className].filter(Boolean).join(' ');

  return (
    <div {...rest} className={classes} data-state={resolvedState}>
      {/* The `Label row` frame (141:3119) is the `<label>` itself, so the two
          text layers stay flex siblings separated by the node's own gap token
          while a screen reader still reads one label element. `htmlFor` is
          `undefined` when no control has been named, and React then omits the
          attribute rather than writing an empty reference. */}
      <label className="lumo-field__labelRow" id={labelId} htmlFor={controlId}>
        <span className="lumo-field__label">{label}</span>
        {required && (
          <>
            <span className="lumo-field__required" aria-hidden="true">
              *
            </span>
            {/* The asterisk is decoration; this is the word that is announced. */}
            <span className="lumo-field__srOnly">{requiredText}</span>
          </>
        )}
      </label>

      <div className="lumo-field__control">{children}</div>

      {helper && (
        <div
          className="lumo-field__helperRow"
          id={helperId}
          // In `error` the helper row is the error message. Announcing a change
          // to it is behaviour the node cannot draw but the state implies.
          role={resolvedState === 'error' ? 'alert' : undefined}
        >
          {resolvedState === 'error' && <FieldIcon name={iconName} />}
          <p className="lumo-field__helper">{helperText}</p>
        </div>
      )}
    </div>
  );
}

export default Field;
