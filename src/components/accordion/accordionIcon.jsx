/**
 * Chevron — Figma node 208:4900, an instance of `Icon/expand_more` (208:4895),
 * whose own description reads "Material Icons Outlined · expand_more".
 *
 * Renders a Material Symbols Outlined glyph at size/icon/md (20px, the node's
 * own box). Per CLAUDE.md the icon set is Material Symbols, loaded as a font
 * from the Google Fonts CDN in `.storybook/preview-head.html` — the glyph is a
 * font character, not an SVG asset, so nothing is downloaded into the repo and
 * the icon inherits colour from its token. `buttonIcon.jsx` and
 * `fieldIcon.jsx` do the same.
 *
 * `aria-hidden` because the button it sits in already carries `aria-expanded`.
 * The chevron and that attribute say the same thing, and a screen reader
 * should hear it once.
 */
import './accordionIcon.css';

/**
 * @param {object} props
 * @param {string} props.name  Material Symbols glyph name, e.g. `expand_more`.
 * @param {string} [props.className]
 */
export function AccordionIcon({ name, className = '', ...rest }) {
  return (
    <span className={`lumo-accordion__icon ${className}`.trim()} aria-hidden="true" {...rest}>
      {name}
    </span>
  );
}

export default AccordionIcon;
