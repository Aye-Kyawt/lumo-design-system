/**
 * switch — Figma component set 17:1201, named "Toggle" on the canvas
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=17-1201
 *
 * "Use a toggle for one setting that takes effect immediately — 'Write summary
 * with AI' in the report builder. Don't use it when the change needs a Save
 * action; use Checkbox for that."
 *   — the component's own description in Figma
 *
 * One variant property, `On`, two values: `On=true` (17:1202) and `On=false`
 * (17:1204). No size property and no state property — see docs/switch.md for
 * what that absence cost and what was raised rather than guessed.
 *
 * The folder is `switch/` to match the registry row, while the Figma set is
 * called Toggle; the exported identifier is `Switch` because `switch` is a
 * reserved word in JavaScript. Both notes are in docs/naming-conflicts.md.
 *
 * Because the setting "takes effect immediately", this renders a real
 * `<button role="switch">`: it is focusable, Space and Enter operate it, and
 * `aria-checked` is what a screen reader reads. The Figma node carries no
 * label layer, so the accessible name must come from the caller — pass
 * `aria-label`, or `aria-labelledby` pointing at your own text.
 */
import { useState } from 'react';

import { SwitchKnob } from './switchKnob.jsx';
import './switch.css';

/**
 * @param {object} props
 * @param {boolean} [props.on]
 *   Figma `On`. Supply it to drive the switch from your own state; leave it
 *   out and the switch keeps its own, seeded from `defaultOn`.
 * @param {boolean} [props.defaultOn]
 *   Starting value when `on` is not supplied. Defaults to `true`, which is the
 *   Figma set's own default variant (17:1202).
 * @param {boolean} [props.disabled]
 *   Not a variant in Figma — see docs/switch.md, gap 3. Blocks the change and
 *   is announced, while the control stays focusable so it can be read.
 * @param {(on: boolean, event: React.MouseEvent) => void} [props.onChange]
 *   Called with the value the switch is moving to.
 * @param {string} [props.className]
 */
export function Switch({
  on,
  defaultOn = true,
  disabled = false,
  onChange,
  className = '',
  ...rest
}) {
  const [internalOn, setInternalOn] = useState(defaultOn);

  // Controlled when the caller passes `on`, uncontrolled otherwise.
  const isControlled = on !== undefined;
  const isOn = isControlled ? on : internalOn;

  const handleClick = (event) => {
    // `aria-disabled` keeps the button focusable, so the guard has to be here
    // rather than left to the DOM's own `disabled` attribute.
    if (disabled) {
      event.preventDefault();
      return;
    }

    const next = !isOn;
    if (!isControlled) setInternalOn(next);
    if (onChange) onChange(next, event);
  };

  const classes = ['lumo-switch', isOn && 'lumo-switch--on', className].filter(Boolean).join(' ');

  return (
    <button
      {...rest}
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-disabled={disabled || undefined}
      className={classes}
      onClick={handleClick}
    >
      <SwitchKnob />
    </button>
  );
}

export default Switch;
