/**
 * Icon/close — Figma node 90:8, "Material Icons Outlined · close"
 *
 * The helper row of `State=error` (141:3133) draws a 14x14 icon instance. Per
 * CLAUDE.md the icon set is Material Symbols, loaded from the Google Fonts CDN
 * in `.storybook/preview-head.html`, so the glyph is a font character rather
 * than an SVG asset — nothing is downloaded and the colour comes from a token.
 *
 * Reported, not filled: the node's 14px box and the icon's fill colour bind no
 * variable. See docs/field.md, gaps 2 and 3.
 */
import './fieldIcon.css';

/**
 * @param {object} props
 * @param {string} [props.name]
 *   Material Symbols glyph name. Defaults to `close`, which is what node 90:8
 *   draws in the error helper row.
 * @param {string} [props.className]
 */
export function FieldIcon({ name = 'close', className = '', ...rest }) {
  return (
    <span className={`lumo-field__icon ${className}`.trim()} aria-hidden="true" {...rest}>
      {name}
    </span>
  );
}

export default FieldIcon;
