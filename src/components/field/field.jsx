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
 * Every difference from the node — six of them — is in docs/field.md. None was
 * guessed; the unbound values are each bound to the nearest semantic token
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
 *   Seeds the ids the label and helper row need. Generated when absent.
 * @param {string} [props.controlId]
 *   The `id` of the control inside the slot, so the label can point at it.
 *   Defaults to `${id}-control` — set that `id` on your control, or pass this.
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
  const helperId = `${fieldId}-helper`;
  const targetId = controlId || `${fieldId}-control`;

  // An unknown `state` would silently drop every colour, because the whole skin
  // hangs off the `data-state` attribute. Fall back to the set's own default
  // variant rather than render an unstyled field.
  const resolvedState = STATE.includes(state) ? state : 'default';

  const classes = ['lumo-field', className].filter(Boolean).join(' ');

  return (
    <div {...rest} className={classes} data-state={resolvedState}>
      {/* The `Label row` frame (141:3119) is the `<label>` itself, so the two
          text layers stay flex siblings separated by the node's own gap token
          while a screen reader still reads one label element. */}
      <label className="lumo-field__labelRow" htmlFor={targetId}>
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
