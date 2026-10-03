/**
 * card/footer — Figma node 63:106 (instance of 62:115)
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=63-106
 *
 * Sub-component of Card. A divider above a right-aligned row of actions.
 * Hidden by default in the card layout.
 */
import './cardFooter.css';

/**
 * @param {object} props
 * @param {React.ReactNode} [props.children] Fills the footer action row.
 * @param {string} [props.className]
 */
export function CardFooter({ children = null, className = '', ...rest }) {
  return (
    <div className={`lumo-card-footer ${className}`.trim()} {...rest}>
      <div className="lumo-card-footer__divider" />
      <div className="lumo-card-footer__row">{children}</div>
    </div>
  );
}

export default CardFooter;
