/**
 * Figma node under test:
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=69-1151
 *
 * Component set: `progress`, node 69:1151 — two variant properties giving
 * eight variants:
 *
 *   Status=brand,    Size=sm  69:27    Status=brand,    Size=md  69:33
 *   Status=positive, Size=sm  69:39    Status=positive, Size=md  69:45
 *   Status=warning,  Size=sm  69:51    Status=warning,  Size=md  69:57
 *   Status=negative, Size=sm  69:63    Status=negative, Size=md  69:69
 *
 * Four further properties are not variants: `Label` and `Value` are booleans
 * that show or hide the two text layers, `Label text` and `Value text` carry
 * their strings. The set defines no interaction state and no indeterminate
 * variant, and composes no other component.
 *
 * Known reported differences, see docs/progress.md:
 *   1. the sm and md track heights (6px / 8px) are unbound in the node and are
 *      composed from core spacing primitives here;
 *   2. the track radius takes core/border/radius/full, as the node binds it —
 *      there is no semantic radius that means "progress track";
 *   3. the fill does not animate, because all five motion/easing tokens are
 *      valueless in the Figma export and are skipped by the token build;
 *   4. the node draws the fill at a fixed 158px while the value text reads
 *      "72%"; here the fill is driven by `percent`, so 72% renders at 72%.
 */
import { Progress } from './progress.jsx';
import './progress.stories.css';

const STATUSES = ['brand', 'positive', 'warning', 'negative'];
const SIZES = ['sm', 'md'];

export default {
  title: 'Components/Progress',
  component: Progress,
  parameters: {
    controls: { disable: false },
    options: { layout: { showPanel: true } },
    docs: {
      description: {
        component:
          'Use progress to show how far along a measurable thing is — a score ' +
          'against a target, an initiative’s completion, a multi-step flow. Do ' +
          'not use it for an unknown wait; use Spinner instead. Status picks the ' +
          'indicator colour, Size picks the track height, and the label and ' +
          'value lines can each be turned off.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: STATUSES,
      description: 'Figma `Status`. Picks the indicator colour.',
      table: { defaultValue: { summary: 'brand' } },
    },
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: 'Figma `Size`. Picks the track height: sm 6px, md 8px.',
      table: { defaultValue: { summary: 'sm' } },
    },
    label: {
      control: 'boolean',
      description: 'Figma `Label`. Shows the label line above the bar.',
      table: { defaultValue: { summary: 'true' } },
    },
    labelText: {
      control: 'text',
      description:
        'Figma `Label text`. Also the bar’s accessible name when `label` is off.',
      table: { defaultValue: { summary: 'Commercial strategy' } },
    },
    value: {
      control: 'boolean',
      description: 'Figma `Value`. Shows the value text beside the bar.',
      table: { defaultValue: { summary: 'true' } },
    },
    valueText: {
      control: 'text',
      description: 'Figma `Value text`. Defaults to `percent` as a percentage.',
      table: { defaultValue: { summary: '`${percent}%`' } },
    },
    percent: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description:
        'How far along, 0–100. Code-only — Figma draws the fill at a fixed ' +
        'width and has no property for it. See docs/naming-conflicts.md.',
      table: { defaultValue: { summary: '72' } },
    },
  },
  args: {
    status: 'brand',
    size: 'sm',
    label: true,
    labelText: 'Commercial strategy',
    value: true,
    percent: 72,
  },
  decorators: [
    (Story) => (
      <div className="lumo-progress-frame">
        <Story />
      </div>
    ),
  ],
};

/* ------------------------------------------------ the 8-row matrix ---- */

export const BrandSm = {
  name: 'Status=brand, Size=sm',
  args: { status: 'brand', size: 'sm' },
};
export const BrandMd = {
  name: 'Status=brand, Size=md',
  args: { status: 'brand', size: 'md' },
};
export const PositiveSm = {
  name: 'Status=positive, Size=sm',
  args: { status: 'positive', size: 'sm' },
};
export const PositiveMd = {
  name: 'Status=positive, Size=md',
  args: { status: 'positive', size: 'md' },
};
export const WarningSm = {
  name: 'Status=warning, Size=sm',
  args: { status: 'warning', size: 'sm' },
};
export const WarningMd = {
  name: 'Status=warning, Size=md',
  args: { status: 'warning', size: 'md' },
};
export const NegativeSm = {
  name: 'Status=negative, Size=sm',
  args: { status: 'negative', size: 'sm' },
};
export const NegativeMd = {
  name: 'Status=negative, Size=md',
  args: { status: 'negative', size: 'md' },
};

/** All eight variants, laid out the way the Figma component set is. */
export const AllVariants = {
  name: 'All eight variants',
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <div className="lumo-progress-grid">
      {STATUSES.flatMap((status) =>
        SIZES.map((size) => (
          <div className="lumo-progress-stack" key={`${status}-${size}`}>
            <p className="lumo-progress-stack__head">
              Status={status}, Size={size}
            </p>
            <Progress status={status} size={size} />
          </div>
        )),
      )}
    </div>
  ),
};

/* ------------------------------------- the two booleans, on and off ---- */

/** Figma `Label=false`. The bar keeps `labelText` as its accessible name. */
export const NoLabel = {
  name: 'Label off',
  args: { label: false },
};

/** Figma `Value=false`. The bar fills the full width of the row. */
export const NoValue = {
  name: 'Value off',
  args: { value: false },
};

/** Both off: the bar alone, named only to assistive technology. */
export const BarOnly = {
  name: 'Label and Value off',
  args: { label: false, value: false },
};

/** `Value text` is free text, not only a percentage. */
export const CustomValueText = {
  name: 'Value text — not a percentage',
  args: { labelText: 'Onboarding', valueText: '3 of 5 steps', percent: 60 },
};

/* ----------------------------------------------------- the fill ---- */

/**
 * The ends of the range and the middle. 0% must draw nothing at all rather
 * than a stub of radius, and 100% must reach the end of the track.
 */
export const FillRange = {
  name: 'Fill — 0, 50 and 100',
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <div className="lumo-progress-page">
      {[0, 25, 50, 75, 100].map((percent) => (
        <div className="lumo-progress-frame" key={percent}>
          <Progress labelText={`${percent} per cent`} percent={percent} />
        </div>
      ))}
    </div>
  ),
};

/**
 * The component is fluid; only the Figma frame is 280px. This story lets it
 * take the width it is given, which is how it will actually be used.
 */
export const Fluid = {
  name: 'Fluid width',
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <div className="lumo-progress-page">
      <Progress labelText="Commercial strategy" percent={72} />
      <Progress status="positive" size="md" labelText="Due diligence" percent={100} />
    </div>
  ),
};

/** The setting progress is actually read in: a list of things being measured. */
export const InContext = {
  name: 'In context',
  parameters: { controls: { disable: true } },
  decorators: [],
  render: () => (
    <div className="lumo-progress-page">
      <Progress status="positive" size="md" labelText="Due diligence" percent={100} />
      <Progress status="brand" size="md" labelText="Commercial strategy" percent={72} />
      <Progress status="warning" size="md" labelText="Technical review" percent={41} />
      <Progress status="negative" size="md" labelText="Legal sign-off" percent={12} />
    </div>
  ),
};
