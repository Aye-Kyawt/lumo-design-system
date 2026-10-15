/**
 * _Slot/Content — Figma node 41:21, the `↳Control` instance in every variant
 * of the field set (141:3122, 141:3130, 141:3140, 258:262).
 *
 * "Placeholder slot. Swap it for the real component you want inside this area.
 *  Never ship a screen with a slot still showing."
 *   — the slot's own description in Figma
 *
 * That last sentence is why this is NOT what `Field` renders when you give it
 * no children. `Field` renders exactly what you put in it; this component is
 * the slot drawn as the node draws it, exported so that the stories can stand
 * the four variants next to their Figma frames and so QA has something to
 * compare. In product code you pass a real control instead.
 *
 * It takes no colours of its own. Its border and its text colour read the two
 * custom properties `Field` publishes — see field.css — which is the mechanism
 * behind the component description's instruction: "Don't write the field's own
 * error styling into the control; field carries it."
 */
import './fieldControlSlot.css';

/**
 * @param {object} props
 * @param {React.ReactNode} [props.children]
 *   The slot's own text. Defaults to the string the node draws.
 * @param {string} [props.className]
 */
export function FieldControlSlot({
  children = 'Content slot — swap in any component',
  className = '',
  ...rest
}) {
  return (
    <div className={`lumo-field__slot ${className}`.trim()} {...rest}>
      <span className="lumo-field__slotText">{children}</span>
    </div>
  );
}

export default FieldControlSlot;
