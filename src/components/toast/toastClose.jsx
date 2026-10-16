/**
 * Close — Figma nodes 151:136 / 151:144 / 151:152 / 151:160, an instance of
 * `Icon/close` (90:8), "Material Icons Outlined · close".
 *
 * The node draws a bare 16 x 16 icon instance. It is not an instance of the
 * Button component, so this does not compose `button` — copying Button's styles
 * would be the failure CLAUDE.md names, and importing Button would ship a
 * control the node does not draw.
 *
 * What the node does not draw is any of its behaviour. It is the only
 * interactive thing in a toast and the set gives it no hovered, pressed,
 * focused or disabled state — see DESIGN GAP 3 in toastClose.css, where every
 * state colour is bound and flagged. The element is a real `<button>` so it is
 * reachable by keyboard and announces as a button; the glyph itself is
 * `aria-hidden` decoration and the accessible name comes from `label`.
 */
import './toastClose.css';

/**
 * @param {object} props
 * @param {string} [props.name]
 *   Material Symbols glyph name. Defaults to `close`, which is what node 90:8
 *   draws.
 * @param {string} [props.label]
 *   The button's accessible name. Not a Figma property — the glyph is
 *   decoration, so the word a screen reader announces has to come from
 *   somewhere; this is it.
 * @param {(event: MouseEvent) => void} [props.onClick]
 * @param {string} [props.className]
 */
export function ToastClose({ name = 'close', label = 'Close', onClick, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`lumo-toast__close ${className}`.trim()}
      aria-label={label}
      onClick={onClick}
      {...rest}
    >
      <span className="lumo-toast__closeGlyph" aria-hidden="true">
        {name}
      </span>
    </button>
  );
}

export default ToastClose;
