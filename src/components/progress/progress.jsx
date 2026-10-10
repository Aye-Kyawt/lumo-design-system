/**
 * progress — Figma component set 69:1151
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=69-1151
 *
 * "Use progress to show how far along a measurable thing is — a score against a
 * target, an initiative's completion, a multi-step flow. Don't use it for an
 * unknown wait; use Spinner instead."
 *   — the component's own description in Figma
 *
 * Two variant properties, Status (brand | positive | warning | negative) and
 * Size (sm | md), so eight variants. Four more properties are not variants:
 * `Label` and `Value` are booleans that show or hide the two text layers, and
 * `Label text` / `Value text` carry their strings.
 *
 * The set defines no hovered, pressed, focused, disabled or loading variant,
 * and no indeterminate one — the description points at Spinner for the unknown
 * wait. Progress is therefore an output, not a control: it renders as plain
 * elements, takes no click handler and is not focusable. See docs/progress.md.
 *
 * `percent` is a code-only prop: Figma's `Value` is the boolean that shows the
 * percentage text, so the number itself needed a different name. Registered in
 * docs/naming-conflicts.md.
 */
import { useId } from 'react';

import './progress.css';

const STATUS = ['brand', 'positive', 'warning', 'negative'];
const SIZE = ['sm', 'md'];

const clampPercent = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return 0;
  return Math.min(100, Math.max(0, num));
};

/**
 * @param {object} props
 * @param {'brand'|'positive'|'warning'|'negative'} [props.status]
 *   Figma `Status`. Picks the indicator colour. Nothing else changes.
 * @param {'sm'|'md'} [props.size]
 *   Figma `Size`. Picks the track height, and nothing else.
 * @param {boolean} [props.label] Figma `Label`. Shows the label line above the bar.
 * @param {string} [props.labelText]
 *   Figma `Label text`. Names what is progressing. Still used as the bar's
 *   accessible name when `label` is false, so it is never pointless to set.
 * @param {boolean} [props.value] Figma `Value`. Shows the value text beside the bar.
 * @param {string} [props.valueText]
 *   Figma `Value text`. Defaults to `percent` rendered as a percentage.
 * @param {number} [props.percent]
 *   How far along, 0–100. Code-only — Figma draws the fill at a fixed width and
 *   has no property for it. See docs/naming-conflicts.md and docs/progress.md.
 * @param {string} [props.className]
 */
export function Progress({
  status = 'brand',
  size = 'sm',
  label = true,
  labelText = 'Commercial strategy',
  value = true,
  valueText,
  percent = 72,
  className = '',
  ...rest
}) {
  const labelId = useId();
  const pct = clampPercent(percent);
  const shownValueText = valueText ?? `${pct}%`;

  const classes = [
    'lumo-progress',
    `lumo-progress--${STATUS.includes(status) ? status : 'brand'}`,
    `lumo-progress--${SIZE.includes(size) ? size : 'sm'}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div {...rest} className={classes}>
      {label && (
        <p className="lumo-progress__label" id={labelId}>
          {labelText}
        </p>
      )}
      <div className="lumo-progress__row">
        {/*
          role="progressbar" sits on the track, not on the wrapper. A
          progressbar's contents are not exposed to assistive technology, so
          putting it on the wrapper would swallow the label and the value text.
          Here they stay ordinary text and the bar is named by reference.
        */}
        <div
          className="lumo-progress__track"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={valueText === undefined ? undefined : valueText}
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : labelText}
        >
          <div
            className="lumo-progress__indicator"
            style={{ '--lumo-progress-fill': `${pct}%` }}
          />
        </div>
        {value && <p className="lumo-progress__value">{shownValueText}</p>}
      </div>
    </div>
  );
}

export default Progress;
