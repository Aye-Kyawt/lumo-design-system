/**
 * card/header — Figma node 62:109
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=62-109
 *
 * Sub-component of Card. Holds the card title, an optional supporting line and
 * an Action slot for a button, badge or avatar. Not for use outside a card.
 */
import './cardHeader.css';

/**
 * @param {object} props
 * @param {string} [props.title]         Figma `title`. The card heading.
 * @param {boolean} [props.subtitle]     Figma `subtitle`. Shows the supporting line.
 * @param {string} [props.subtitleLabel]  Figma `subtitleLabel`. Text of the supporting line.
 * @param {boolean} [props.action]       Figma `action`. Reveals the `↳Action` slot.
 * @param {React.ReactNode} [props.children] Fills the `↳Action` slot.
 * @param {string} [props.className]
 */
export function CardHeader({
  title = 'Card title',
  subtitle = true,
  subtitleLabel = 'Supporting line',
  action = false,
  children = null,
  className = '',
  ...rest
}) {
  return (
    <div className={`lumo-card-header ${className}`.trim()} {...rest}>
      <div className="lumo-card-header__text">
        <p className="lumo-card-header__title">{title}</p>
        {subtitle && <p className="lumo-card-header__subtitle">{subtitleLabel}</p>}
      </div>
      {action && <div className="lumo-card-header__action">{children}</div>}
    </div>
  );
}

export default CardHeader;
