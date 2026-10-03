/**
 * card/layout/vertical — Figma node 63:98
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=63-98
 *
 * Stacks header, body and footer down the card. The default arrangement.
 * Use card/layout/horizontal when the card leads with an image or chart.
 */
import { CardHeader } from './cardHeader.jsx';
import { CardFooter } from './cardFooter.jsx';
import './cardLayoutVertical.css';

/**
 * @param {object} props
 * @param {boolean} [props.header]            Figma `header`. Shows the header row.
 * @param {object} [props.headerProps]        Props forwarded to `CardHeader`.
 * @param {React.ReactNode} [props.body]      Figma `↳Body`. The card's main content.
 * @param {boolean} [props.footer]            Figma `footer`. Shows the footer row.
 * @param {React.ReactNode} [props.footerContent] Fills the footer action row.
 * @param {string} [props.className]
 */
export function CardLayoutVertical({
  header = true,
  headerProps = {},
  body = null,
  footer = false,
  footerContent = null,
  className = '',
  ...rest
}) {
  return (
    <div className={`lumo-card-layout-vertical ${className}`.trim()} {...rest}>
      {header && <CardHeader {...headerProps} />}
      {body}
      {footer && <CardFooter>{footerContent}</CardFooter>}
    </div>
  );
}

export default CardLayoutVertical;
