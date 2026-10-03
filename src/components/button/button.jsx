/**
 * button — Figma component set 26:1665
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=26-1657
 *
 * "Use this component when need CTA. Don't use it for opening external link."
 *
 * State x Type, 5 x 3. Type picks the skin; State picks the colours within it.
 */
import { ButtonIcon } from './buttonIcon.jsx';
import './button.css';

const TYPE = ['fill', 'outline', 'transparent'];
const STATE = ['default', 'hovered', 'focused', 'disabled', 'error'];

/**
 * @param {object} props
 * @param {'fill'|'outline'|'transparent'} [props.type]
 *   Figma `Type`. The skin. Note this is **not** the DOM button type — see
 *   `htmlType`, and `docs/naming-conflicts.md` for why.
 * @param {'default'|'hovered'|'focused'|'disabled'|'error'} [props.state]
 *   Figma `State`. Forces the visual state. Left at `default` the button still
 *   reacts to real hover, focus and the disabled attribute.
 * @param {string} [props.label]        Figma `label`. The button text.
 * @param {boolean} [props.text]        Figma `text`. Shows the label.
 * @param {boolean} [props.iconLeft]    Figma `iconLeft`. Shows the leading icon.
 * @param {boolean} [props.iconRight]   Figma `iconRight`. Shows the trailing icon.
 * @param {string} [props.iconLeftName]  Material Symbols glyph for the leading icon.
 * @param {string} [props.iconRightName] Material Symbols glyph for the trailing icon.
 * @param {'button'|'submit'|'reset'} [props.htmlType] The real DOM `type` attribute.
 * @param {() => void} [props.onClick]
 * @param {string} [props.className]
 */
export function Button({
  type = 'fill',
  state = 'default',
  label = 'Button',
  text = true,
  iconLeft = true,
  iconRight = true,
  iconLeftName = 'add',
  iconRightName = 'add',
  htmlType = 'button',
  onClick,
  className = '',
  ...rest
}) {
  const disabled = state === 'disabled';

  const classes = [
    'lumo-button',
    `lumo-button--${TYPE.includes(type) ? type : 'fill'}`,
    STATE.includes(state) && state !== 'default' ? `lumo-button--${state}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // An icon-only button has no accessible name from its contents, so the label
  // has to survive as one even when `text` hides it.
  const iconOnly = !text && (iconLeft || iconRight);

  return (
    <button
      type={htmlType}
      className={classes}
      disabled={disabled}
      aria-label={iconOnly ? label : undefined}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {iconLeft && <ButtonIcon name={iconLeftName} />}
      {text && <span className="lumo-button__label">{label}</span>}
      {iconRight && <ButtonIcon name={iconRightName} />}
    </button>
  );
}

export default Button;
