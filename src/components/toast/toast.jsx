/**
 * toast — Figma component set 151:162
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=151-162
 *
 * "Use a toast to confirm that something happened after the user acted —
 *  saved, sent, deleted, failed — without interrupting what they are doing.
 *  Don't use it for anything the user must act on; that is a Modal or an Alert."
 *   — the component's own description in Figma
 *
 * One variant property, `Status`, with four values:
 *   positive 151:130
 *   negative 151:138
 *   warning  151:146
 *   info     151:154
 *
 * Three layers in every variant, and they are the same three in all four:
 * an `Icon` instance (16x16), a `Text` frame holding `Title` and
 * `Description`, and a `Close` instance (16x16). Only two things change across
 * the four variants — the icon's colour, and nothing else. The glyph, the
 * copy, the spacing and the frame are identical; see gap 2.
 *
 * Because the component description rules out anything the user must act on,
 * the root is `role="status"` with `aria-live="polite"` — it announces without
 * stealing focus. It is never an alert. Both are overridable through `...rest`
 * for a caller whose live region sits further up the tree.
 *
 * Every difference from the node — six of them — is in docs/toast.md and
 * flagged at its declaration in the CSS. Nothing was guessed; where the design
 * binds no variable the nearest semantic token whose family carries the right
 * meaning is bound and marked as this build's reading.
 */
import { ToastIcon } from './toastIcon.jsx';
import { ToastClose } from './toastClose.jsx';
import './toast.css';

/** `Status`, exactly as the Figma set spells its four values. */
const STATUS = ['positive', 'negative', 'warning', 'info'];

/**
 * @param {object} props
 * @param {'positive'|'negative'|'warning'|'info'} [props.status]
 *   Figma `Status`. The only variant property in the set.
 * @param {string} [props.title]
 *   Figma `Title` (151:134). The bold first line.
 * @param {boolean} [props.description]
 *   Figma `Description`, the boolean. Shows or hides the second line.
 * @param {string} [props.descriptionText]
 *   Figma `Description`, the text. Renamed per the Empty State precedent —
 *   the set spells the boolean and the text with one name. See
 *   docs/naming-conflicts.md.
 * @param {boolean} [props.close]
 *   Figma `Close`. Shows or hides the dismiss control.
 * @param {string} [props.iconName]
 *   Figma `↳Icon`, as a Material Symbols glyph name rather than a node — the
 *   Button precedent in docs/naming-conflicts.md. Defaults to `check`, which
 *   is what the node draws in all four statuses (gap 2).
 * @param {() => void} [props.onClose]
 *   Not a Figma property. The close control is drawn but has nothing to do in
 *   a static frame; this is what it does. Without it the button still renders
 *   and is still focusable, because the node draws it — it simply has no
 *   handler, exactly as the design specifies it.
 * @param {string} [props.closeLabel]
 *   Not a Figma property. The accessible name for the close control, whose
 *   glyph is `aria-hidden` decoration.
 * @param {string} [props.className]
 */
export function Toast({
  status = 'positive',
  title = 'Report saved',
  description = true,
  descriptionText = 'Q3 2026 AI value report is ready to share.',
  close = true,
  iconName = 'check',
  onClose,
  closeLabel = 'Close',
  className = '',
  ...rest
}) {
  // Fall back to the set's own first value rather than rendering unstyled, the
  // way `field` does for its `State`.
  const safeStatus = STATUS.includes(status) ? status : 'positive';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`lumo-toast lumo-toast--${safeStatus} ${className}`.trim()}
      data-status={safeStatus}
      {...rest}
    >
      <ToastIcon name={iconName} />

      <div className="lumo-toast__text">
        <p className="lumo-toast__title">{title}</p>
        {description && <p className="lumo-toast__description">{descriptionText}</p>}
      </div>

      {close && <ToastClose label={closeLabel} onClick={onClose} />}
    </div>
  );
}

export default Toast;
