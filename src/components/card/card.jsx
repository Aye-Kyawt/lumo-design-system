/**
 * card — Figma component set 65:230
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=64-113
 *
 * Groups related content into one surface a user can scan or act on. The card
 * owns the surface, border, radius and padding; everything inside comes from a
 * card layout placed in the `↳Layout` slot. Don't nest a card inside a card.
 */
import './card.css';

const PADDING = ['none', 'md', 'lg', 'xl'];
const STATE = ['default', 'hovered', 'focused', 'disabled'];

/**
 * @param {object} props
 * @param {'default'|'hovered'|'focused'|'disabled'} [props.state]
 *   Figma `State`. Forces the visual state. Left at `default` the card still
 *   reacts to real hover and focus when it is interactive.
 * @param {'none'|'md'|'lg'|'xl'} [props.padding] Figma `Padding`.
 * @param {React.ReactNode} [props.children] The `↳Layout` slot.
 * @param {() => void} [props.onClick]
 *   Supplying this makes the card an activatable surface: it takes focus, it
 *   answers Enter and Space, and hover and focus-visible drive the states the
 *   design draws. Without it the card is a plain, inert surface.
 * @param {string} [props.className]
 */
export function Card({
  state = 'default',
  padding = 'none',
  children = null,
  onClick,
  className = '',
  ...rest
}) {
  const disabled = state === 'disabled';
  const interactive = typeof onClick === 'function' && !disabled;

  const classes = [
    'lumo-card',
    `lumo-card--padding-${PADDING.includes(padding) ? padding : 'none'}`,
    STATE.includes(state) && state !== 'default' ? `lumo-card--${state}` : '',
    interactive ? 'lumo-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Enter fires on keydown and Space on keyup for a native button; matching
  // that here keeps a keyboard user's muscle memory intact on the role we claim.
  const handleKeyDown = (event) => {
    if (!interactive) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      onClick(event);
    } else if (event.key === ' ') {
      event.preventDefault();
    }
  };

  const handleKeyUp = (event) => {
    if (!interactive) return;
    if (event.key === ' ') {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <div
      className={classes}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-disabled={disabled || undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      onKeyUp={interactive ? handleKeyUp : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
