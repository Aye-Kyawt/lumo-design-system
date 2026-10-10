/**
 * Knob — Figma node 17:1203, the one named child layer inside the Toggle set.
 *
 * It is a 16x16 ellipse filled with `semantic.color.bg.base`, the only variable
 * the layer binds. Its position is the whole of the component's state: at the
 * left inset when `On=false`, at the right inset when `On=true`. The travel is
 * a transform on this element, so the track never relayouts while it moves.
 *
 * Presentational and inert on purpose — the parent is the `<button>`, so the
 * knob must not be focusable or announced.
 */
import './switchKnob.css';

/**
 * @param {object} props
 * @param {string} [props.className]
 */
export function SwitchKnob({ className = '', ...rest }) {
  return <span {...rest} aria-hidden="true" className={`lumo-switch__knob ${className}`.trim()} />;
}

export default SwitchKnob;
