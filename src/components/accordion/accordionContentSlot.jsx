/**
 * _Slot/Content — Figma node 41:21, the content instance inside `State=open`
 * (208:4904).
 *
 * "Placeholder slot. Swap it for the real component you want inside this area.
 *  Never ship a screen with a slot still showing."
 *   — the slot's own description in Figma
 *
 * That last sentence is why this is NOT what `Accordion` renders when you give
 * it no children. `Accordion` renders exactly what you put in it; this
 * component is the slot drawn as the node draws it, exported so the stories can
 * stand the `open` variant next to its Figma frame and so QA has something to
 * compare. In product code you pass the real answer text instead.
 *
 * `fieldControlSlot.jsx` is the same component for the field set's own
 * instance of 41:21, and the two are deliberately separate: each carries its
 * parent's CSS namespace, so neither reaches into a sheet it does not own.
 */

/**
 * @param {object} props
 * @param {React.ReactNode} [props.children]
 *   The slot's own text. Defaults to the string the node draws.
 * @param {string} [props.className]
 */
export function AccordionContentSlot({
  children = 'Content slot — swap in any component',
  className = '',
  ...rest
}) {
  return (
    <div className={`lumo-accordion__slot ${className}`.trim()} {...rest}>
      <span className="lumo-accordion__slotText">{children}</span>
    </div>
  );
}

export default AccordionContentSlot;
