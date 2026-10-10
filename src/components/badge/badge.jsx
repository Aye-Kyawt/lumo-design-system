/**
 * badge — Figma component set 17:1139
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=17-1139
 *
 * "Use a badge to label a status or category the user reads, not clicks — a
 * category tag, a status pill, a 'Most popular' flag. Don't use it for
 * something the user can interact with; use Chip for that."
 *
 * One variant property: Tone, five values. The set defines no size and no
 * interaction state, which follows from that description — a badge is read,
 * so it renders as a <span> and carries no hover, focus or disabled behaviour.
 */
import './badge.css';

const TONE = ['primary', 'success', 'warning', 'danger', 'neutral'];

/**
 * @param {object} props
 * @param {'primary'|'success'|'warning'|'danger'|'neutral'} [props.tone]
 *   Figma `Tone`. Picks the tonal surface and the label colour.
 * @param {string} [props.label] Figma `Label`. The text the badge shows.
 * @param {string} [props.className]
 */
export function Badge({ tone = 'primary', label = 'Primary', className = '', ...rest }) {
  const classes = [
    'lumo-badge',
    `lumo-badge--${TONE.includes(tone) ? tone : 'primary'}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span {...rest} className={classes}>
      <span className="lumo-badge__label">{label}</span>
    </span>
  );
}

export default Badge;
