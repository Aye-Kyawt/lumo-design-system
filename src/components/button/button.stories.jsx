/**
 * Figma node under test:
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=26-1657
 *
 * Component set: `button`, node 26:1665 — State (default | hovered | focused |
 * disabled | error) x Type (fill | outline | transparent), 15 variants.
 * Sub-component: Icon/add 22:75 (Material Symbols Outlined).
 */
import { Button } from './button.jsx';
import './button.stories.css';

const STATES = ['default', 'hovered', 'focused', 'disabled', 'error'];
const TYPES = ['fill', 'outline', 'transparent'];

export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    controls: { disable: false },
    options: { layout: { showPanel: true } },
    docs: {
      description: {
        component:
          'Use this component when you need a CTA. Do not use it for opening an ' +
          'external link. Type picks the skin; State picks the colours within it.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: TYPES,
      description: 'Figma `Type`. Not the DOM button type — see `htmlType`.',
      table: { defaultValue: { summary: 'fill' } },
    },
    state: {
      control: 'inline-radio',
      options: STATES,
      description: 'Figma `State`. Forces the visual state.',
      table: { defaultValue: { summary: 'default' } },
    },
    label: { control: 'text', description: 'Figma `label`.' },
    text: { control: 'boolean', description: 'Figma `text`. Shows the label.' },
    iconLeft: { control: 'boolean', description: 'Figma `iconLeft`.' },
    iconRight: { control: 'boolean', description: 'Figma `iconRight`.' },
    iconLeftName: { control: 'text', description: 'Material Symbols glyph, leading.' },
    iconRightName: { control: 'text', description: 'Material Symbols glyph, trailing.' },
    htmlType: { control: 'inline-radio', options: ['button', 'submit', 'reset'] },
  },
  args: { type: 'fill', state: 'default', label: 'Button' },
};

/* ------------------------------------------------- the 15-row matrix ---- */

export const FillDefault = { args: { type: 'fill', state: 'default' } };
export const FillHovered = { args: { type: 'fill', state: 'hovered' } };
export const FillFocused = { args: { type: 'fill', state: 'focused' } };
export const FillDisabled = { args: { type: 'fill', state: 'disabled' } };
export const FillError = { args: { type: 'fill', state: 'error' } };

export const OutlineDefault = { args: { type: 'outline', state: 'default' } };
export const OutlineHovered = { args: { type: 'outline', state: 'hovered' } };
export const OutlineFocused = { args: { type: 'outline', state: 'focused' } };
export const OutlineDisabled = { args: { type: 'outline', state: 'disabled' } };
export const OutlineError = { args: { type: 'outline', state: 'error' } };

export const TransparentDefault = { args: { type: 'transparent', state: 'default' } };
export const TransparentHovered = { args: { type: 'transparent', state: 'hovered' } };
export const TransparentFocused = { args: { type: 'transparent', state: 'focused' } };
export const TransparentDisabled = { args: { type: 'transparent', state: 'disabled' } };
export const TransparentError = { args: { type: 'transparent', state: 'error' } };

/** Every row at once, laid out the way the Figma component set is. */
export const AllVariants = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-button-grid">
      <p className="lumo-button-grid__head" />
      {STATES.map((state) => (
        <p key={state} className="lumo-button-grid__head">
          {state}
        </p>
      ))}
      {TYPES.map((type) => (
        <div key={type} style={{ display: 'contents' }}>
          <p className="lumo-button-grid__row">{type}</p>
          {STATES.map((state) => (
            <Button key={`${type}-${state}`} type={type} state={state} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/* ----------------------------------------------- content permutations ---- */

/** Figma `text`, `iconLeft` and `iconRight` are independent booleans. */
export const ContentPermutations = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-button-row">
      <Button label="Both icons" />
      <Button label="Leading only" iconRight={false} />
      <Button label="Trailing only" iconLeft={false} />
      <Button label="Label only" iconLeft={false} iconRight={false} />
      <Button label="Add item" text={false} iconRight={false} />
      <Button label="Add item" text={false} iconLeft={false} />
    </div>
  ),
};

/** The icons are Material Symbols, named rather than swapped as instances. */
export const IconNames = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-button-row">
      <Button label="Download" iconLeftName="download" iconRight={false} />
      <Button label="Next" iconLeft={false} iconRightName="arrow_forward" />
      <Button type="outline" label="Favourite" iconLeftName="favorite" iconRight={false} />
      <Button type="transparent" label="Delete" iconLeftName="delete" iconRight={false} />
    </div>
  ),
};

/** Transparent has no surface, so its states read better on a tinted backdrop. */
export const TransparentOnSurface = {
  name: 'Transparent — on a surface',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-button-stage--inverse lumo-button-row">
      {STATES.map((state) => (
        <Button key={state} type="transparent" state={state} label={state} />
      ))}
    </div>
  ),
};

/* ------------------------------------------------------- behaviour ---- */

/**
 * Real interaction, with no `state` forced: hover, tab to it, press Enter or
 * Space. A native `<button>` carries the keyboard behaviour for free.
 */
export const Interactive = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-button-row">
      <Button label="Fill" onClick={() => {}} />
      <Button type="outline" label="Outline" onClick={() => {}} />
      <Button type="transparent" label="Transparent" onClick={() => {}} />
    </div>
  ),
};

/** `state="disabled"` sets the real `disabled` attribute: no focus, no click. */
export const DisabledIsInert = {
  name: 'Disabled — genuinely inert',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-button-row">
      {TYPES.map((type) => (
        <Button key={type} type={type} state="disabled" label={type} onClick={() => {}} />
      ))}
    </div>
  ),
};

/** An icon-only button keeps its label as the accessible name. */
export const IconOnlyIsLabelled = {
  name: 'Icon only — still labelled',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-button-row">
      <Button label="Add to basket" text={false} iconRight={false} />
      <Button type="outline" label="Add to basket" text={false} iconRight={false} />
      <Button type="transparent" label="Add to basket" text={false} iconRight={false} />
    </div>
  ),
};
