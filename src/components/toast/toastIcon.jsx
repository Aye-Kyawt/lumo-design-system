/**
 * Icon — the status glyph, Figma nodes 151:131 / 151:139 / 151:147 / 151:155.
 *
 * The instance is `Icon/check` (94:2), whose Figma description reads
 * "Material Icons Outlined · check". Per CLAUDE.md the icon set is Material
 * Symbols, loaded as a font from the Google Fonts CDN in
 * `.storybook/preview-head.html`, so the glyph is a font character rather than
 * an SVG asset — nothing is downloaded and the colour comes from a token.
 *
 * DESIGN GAP 2 — the node draws the *same* `check` glyph in all four statuses.
 * The four exported SVGs are byte-identical apart from their `fill`, so a
 * `negative` toast ships a green-shaped tick in red and a `warning` toast ships
 * one in orange. Only the colour carries the status. Reported in docs/toast.md,
 * not corrected: which glyph a negative toast should draw is a design decision.
 * `iconName` lets a caller pass another glyph; the default is what the node
 * draws.
 */
import './toastIcon.css';

/**
 * @param {object} props
 * @param {string} [props.name]
 *   Material Symbols glyph name. Defaults to `check`, which is what the node
 *   draws in every one of the four statuses.
 * @param {string} [props.className]
 */
export function ToastIcon({ name = 'check', className = '', ...rest }) {
  return (
    <span className={`lumo-toast__icon ${className}`.trim()} aria-hidden="true" {...rest}>
      {name}
    </span>
  );
}

export default ToastIcon;
