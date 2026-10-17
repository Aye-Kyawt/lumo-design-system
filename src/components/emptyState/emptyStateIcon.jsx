/**
 * Icon/check and friends — Figma node 94:2, "Material Icons Outlined · check"
 *
 * The glyph that sits inside the empty state's medallion. Per CLAUDE.md the
 * icon set is Material Symbols, loaded from the Google Fonts CDN in
 * `.storybook/preview-head.html`, so the icon is a font character rather than
 * an SVG asset and nothing is downloaded into the repo.
 *
 * This is a sibling of `button/buttonIcon.jsx`, not a reuse of it: that one
 * paints itself from `--lumo-button-icon`, a custom property only `.lumo-button`
 * defines, so outside a button it renders with no colour at all. The system has
 * no shared Icon component to import — see docs/emptyState.md, gap 5.
 */

/**
 * @param {object} props
 * @param {string} props.name  Material Symbols glyph name, e.g. `check`.
 * @param {string} [props.className]
 */
export function EmptyStateIcon({ name, className = '', ...rest }) {
  return (
    <span className={`lumo-empty-state__glyph ${className}`.trim()} aria-hidden="true" {...rest}>
      {name}
    </span>
  );
}

export default EmptyStateIcon;
