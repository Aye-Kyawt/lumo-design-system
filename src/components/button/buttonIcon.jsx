/**
 * Icon/add and friends — Figma node 22:75, "Material Icons Outlined · add"
 *
 * Renders a Material Symbols Outlined glyph at icon/md. Per CLAUDE.md the icon
 * set is Material Symbols, loaded from the Google Fonts CDN in
 * `.storybook/preview-head.html` — the glyph is a font character, not an SVG
 * asset, so it inherits colour and needs nothing downloaded.
 */
import './buttonIcon.css';

/**
 * @param {object} props
 * @param {string} props.name  Material Symbols glyph name, e.g. `add`.
 * @param {string} [props.className]
 */
export function ButtonIcon({ name, className = '', ...rest }) {
  return (
    <span className={`lumo-button__icon ${className}`.trim()} aria-hidden="true" {...rest}>
      {name}
    </span>
  );
}

export default ButtonIcon;
