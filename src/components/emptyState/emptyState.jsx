/**
 * emptyState — Figma component set 94:1862
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=94-1862
 *
 * "Use an empty state when a list, card or page has nothing to show — no
 *  results, nothing created yet, a failed load, or no permission. Don't leave
 *  the user without a next step; always give the action."
 *
 * One variant property, `Size`, with two values: `sm` (94:7) and `md` (94:15).
 * Both draw the same four-row column — medallion, title, description, action —
 * and differ only in the medallion size and the two type styles.
 *
 * This is a molecule, and the part it composes is NOT hard-coded here. The
 * Figma `↳Action` slot (94:14 / 94:22) is empty in both variants, so the
 * action arrives as `children` and the caller supplies the real `Button`
 * component. See docs/emptyState.md for every difference from the node.
 */
import { EmptyStateIcon } from './emptyStateIcon.jsx';

const SIZE = ['sm', 'md'];

/**
 * @param {object} props
 * @param {'sm'|'md'} [props.size]
 *   Figma `Size`. Picks the medallion size and the title/description type styles.
 * @param {string} [props.title]
 *   Figma `Title`. The headline. Always shown — the node has no boolean for it.
 * @param {boolean} [props.description]
 *   Figma `Description` (the boolean property). Shows the supporting line.
 * @param {string} [props.descriptionText]
 *   Figma `Description` (the text property). Renamed because the set spells two
 *   different properties `Description`; see docs/naming-conflicts.md.
 * @param {boolean} [props.action]
 *   Figma `Action`. Reveals the `↳Action` slot.
 * @param {React.ReactNode} [props.children]
 *   The `↳Action` slot. Put a `Button` here — the component description says to
 *   always give the user a next step. Named `children` per the Card precedent in
 *   docs/naming-conflicts.md, because `action` is taken by the boolean above.
 * @param {React.ReactNode} [props.icon]
 *   The `↳Icon` slot. Swaps what sits inside the medallion. Defaults to the
 *   node's own `Icon/check` instance (94:10 / 94:18).
 * @param {string} [props.iconName]
 *   Material Symbols glyph for the default icon, when `icon` is not supplied.
 * @param {'p'|'h1'|'h2'|'h3'|'h4'|'h5'|'h6'} [props.titleAs]
 *   Not a Figma property. The node's title is a text layer, so `p` is the
 *   faithful default; pass a heading tag when the empty state owns a region of
 *   the page and a screen reader should be able to jump to it.
 * @param {string} [props.className]
 */
export function EmptyState({
  size = 'sm',
  title = 'No use cases match these filters',
  description = true,
  descriptionText = 'Try removing a filter, or ask our team to research a custom use case.',
  action = true,
  children = null,
  icon = null,
  iconName = 'check',
  titleAs: TitleTag = 'p',
  className = '',
  ...rest
}) {
  const classes = [
    'lumo-empty-state',
    `lumo-empty-state--${SIZE.includes(size) ? size : 'sm'}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      <div className="lumo-empty-state__medallion">
        {icon || <EmptyStateIcon name={iconName} />}
      </div>

      <TitleTag className="lumo-empty-state__title">{title}</TitleTag>

      {description && <p className="lumo-empty-state__description">{descriptionText}</p>}

      {action && <div className="lumo-empty-state__action">{children}</div>}
    </div>
  );
}

export default EmptyState;
