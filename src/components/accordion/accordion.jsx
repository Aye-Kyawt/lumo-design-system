/**
 * accordion — Figma component set 208:4912
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=208-4912
 *
 * "Use an accordion to let the user expand one answer at a time without leaving
 *  the page — an FAQ list on a marketing page. Don't use it for primary content
 *  the user needs to see without an extra click."
 *   — the component's own description in Figma
 *
 * One variant property, `State`, two values:
 *   closed  208:4897   480×70
 *   open    208:4904   480×158
 *
 * There is no size property and no interaction state anywhere in the set — no
 * hovered, pressed, focused or disabled variant. That absence is gap 1 in
 * docs/accordion.md; it could not be honoured the way Badge honoured it,
 * because a disclosure is a control you click.
 *
 * Both variants are one card: a Header row (208:4898 / 208:4905) holding a
 * title (208:4899 / 208:4906) and a 20px Chevron (208:4900, an instance of
 * `Icon/expand_more` 208:4895, "Material Icons Outlined · expand_more"). In
 * `open` the chevron sits in a wrapper (208:4907) rotated 180°, and a content
 * region appears below it.
 *
 * That content region is an instance of `_Slot/Content` (41:21), whose own
 * description reads "Placeholder slot. Swap it for the real component you want
 * inside this area. Never ship a screen with a slot still showing." So the
 * content is not a fixed sub-component — it is `children`, and this component
 * imports no other component in the library. `Composes` in the registry is
 * therefore empty. `accordionContentSlot.jsx` reproduces the placeholder for
 * the stories; it is never a default.
 *
 * WHY THE HEADER IS A REAL <button>
 *
 * The description says the user expands an answer, so the header is unarguably
 * interactive. It renders a `<button aria-expanded aria-controls>` over a
 * `role="region"` panel — the disclosure pattern. Space and Enter operate it,
 * which a native button gives for free, and the panel carries the `hidden`
 * attribute when closed so its content is out of the tab order and out of the
 * accessibility tree rather than merely invisible.
 *
 * `disabled` uses `aria-disabled` rather than the DOM `disabled` attribute, so
 * the control stays reachable by keyboard and can be read before it is skipped
 * — the same choice switch.jsx made, and for the same reason. The click guard
 * is therefore in the handler rather than left to the DOM.
 *
 * Every difference from the node — seven of them — is in docs/accordion.md.
 * None was guessed, and no token was invented.
 */
import { useId, useState } from 'react';

import { AccordionIcon } from './accordionIcon.jsx';

/** `State`, exactly as the Figma set spells its two values. */
const STATE = ['closed', 'open'];

/**
 * @param {object} props
 * @param {'closed'|'open'} [props.state]
 *   Figma `State`. Supply it to drive the accordion from your own state — an
 *   FAQ list that allows only one open answer does exactly that; leave it out
 *   and the accordion keeps its own, seeded from `defaultState`.
 * @param {'closed'|'open'} [props.defaultState]
 *   Starting value when `state` is not supplied. Defaults to `closed`, which
 *   is the set's own first variant (208:4897).
 * @param {string} [props.title]
 *   The header text (208:4899 / 208:4906). `title` is also a global HTML
 *   attribute, so the DOM one is exposed separately as `htmlTitle` — see
 *   docs/naming-conflicts.md for why the Figma name keeps the prop.
 * @param {string} [props.htmlTitle]
 *   The DOM `title` attribute, i.e. the browser's own hover tooltip. Nothing
 *   in the node asks for one; this is the escape hatch that keeps `title`
 *   free for the Figma property. Unset by default.
 * @param {boolean} [props.disabled]
 *   Not a variant in Figma — see docs/accordion.md, gap 1. Blocks the toggle
 *   and is announced, while the header stays focusable so it can be read.
 * @param {string} [props.iconName]
 *   Material Symbols glyph for the chevron. Defaults to `expand_more`, which
 *   is what node 208:4895 draws.
 * @param {number} [props.headingLevel]
 *   Not a Figma property and not claimed to be one. The node draws a card, not
 *   a document outline, so it has no heading level. Pass 1–6 to wrap the
 *   header button in that heading element, which is what lets a screen reader
 *   user jump between the questions in an FAQ list. Defaults to `0` — no
 *   wrapper — so the default output is exactly what the node draws.
 * @param {(state: 'closed'|'open', event: React.MouseEvent) => void} [props.onToggle]
 *   Called with the state the accordion is moving to.
 * @param {React.ReactNode} [props.children]
 *   The content region — the `_Slot/Content` instance (41:21) in the `open`
 *   variant. Named `children` per the Card precedent in
 *   docs/naming-conflicts.md, since the accordion has exactly one slot.
 * @param {string} [props.className]
 * @param {string} [props.id]
 *   Seeds the ids the button and the panel need to point at each other.
 *   Generated when absent.
 */
export function Accordion({
  state,
  defaultState = 'closed',
  title = '',
  htmlTitle,
  disabled = false,
  iconName = 'expand_more',
  headingLevel = 0,
  onToggle,
  children,
  className = '',
  id,
  ...rest
}) {
  // An unknown `defaultState` would seed the component with a value its own
  // skin has no rule for. Fall back to the set's first variant rather than
  // render an accordion that is neither open nor closed.
  const [internalState, setInternalState] = useState(
    STATE.includes(defaultState) ? defaultState : 'closed',
  );

  const generatedId = useId();
  const rootId = id || generatedId;
  const buttonId = `${rootId}-header`;
  const panelId = `${rootId}-panel`;

  // Controlled when the caller passes `state`, uncontrolled otherwise.
  const isControlled = state !== undefined;
  const rawState = isControlled ? state : internalState;
  const resolvedState = STATE.includes(rawState) ? rawState : 'closed';
  const isOpen = resolvedState === 'open';

  const handleClick = (event) => {
    // `aria-disabled` keeps the button focusable, so the guard has to be here
    // rather than left to the DOM's own `disabled` attribute.
    if (disabled) {
      event.preventDefault();
      return;
    }

    const next = isOpen ? 'closed' : 'open';
    if (!isControlled) setInternalState(next);
    if (onToggle) onToggle(next, event);
  };

  const classes = ['lumo-accordion', className].filter(Boolean).join(' ');

  const header = (
    <button
      type="button"
      id={buttonId}
      className="lumo-accordion__header"
      title={htmlTitle}
      aria-expanded={isOpen}
      aria-controls={panelId}
      aria-disabled={disabled || undefined}
      onClick={handleClick}
    >
      <span className="lumo-accordion__title">{title}</span>
      {/* The chevron is decoration: `aria-expanded` on the button already
          carries the open/closed state, so announcing the glyph too would say
          it twice. AccordionIcon is aria-hidden for that reason. */}
      <AccordionIcon name={iconName} />
    </button>
  );

  // `headingLevel` is an addition, not a node property — see the prop docs.
  const Heading = headingLevel >= 1 && headingLevel <= 6 ? `h${headingLevel}` : null;

  return (
    <div {...rest} id={rootId} className={classes} data-state={resolvedState}>
      {Heading ? <Heading className="lumo-accordion__heading">{header}</Heading> : header}

      {/*
        The panel is always rendered and carries `hidden` when closed, rather
        than being dropped from the tree. `aria-controls` on the button has to
        point at an element that exists, and `hidden` is what takes the content
        out of the tab order as well as out of view — which `display: none`
        alone, applied by a class, would not guarantee against a later
        override.
      */}
      <div
        id={panelId}
        className="lumo-accordion__panel"
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
}

export default Accordion;
