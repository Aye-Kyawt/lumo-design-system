/**
 * Figma node under test:
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=17-1139
 *
 * Component set: `badge`, node 17:1139 — one property, Tone, with five values
 * (Primary 17:1140 | Success 17:1142 | Warning 17:1144 | Danger 17:1146 |
 * Neutral 17:1148). No size property, no state property, no sub-components.
 * Each variant is 65x24 with a single `Label` text layer.
 *
 * Known reported differences, see docs/badge.md:
 *   1. horizontal padding renders 8px (spacing/padding/sm) against the node's
 *      unbound 10px, so the badge measures 61x24, not 65x24.
 *   2. Success and Warning labels take colour/icon tokens, as the node binds
 *      them, not the darker colour/text equivalents.
 */
import { Badge } from './badge.jsx';
import './badge.stories.css';

const TONES = ['primary', 'success', 'warning', 'danger', 'neutral'];

export default {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    controls: { disable: false },
    options: { layout: { showPanel: true } },
    docs: {
      description: {
        component:
          'Use a badge to label a status or category the user reads, not clicks — ' +
          'a category tag, a status pill, a "Most popular" flag. Do not use it for ' +
          'something the user can interact with; use Chip for that. Tone is the ' +
          'only property: it picks the tonal surface and the label colour.',
      },
    },
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: TONES,
      description: 'Figma `Tone`. Picks the tonal surface and the label colour.',
      table: { defaultValue: { summary: 'primary' } },
    },
    label: {
      control: 'text',
      description: 'Figma `Label`. The text the badge shows.',
      table: { defaultValue: { summary: 'Primary' } },
    },
  },
  args: { tone: 'primary', label: 'Primary' },
};

/* ---------------------------------------------------- the 5-row matrix ---- */

export const Primary = { args: { tone: 'primary', label: 'Primary' } };
export const Success = { args: { tone: 'success', label: 'Success' } };
export const Warning = { args: { tone: 'warning', label: 'Warning' } };
export const Danger = { args: { tone: 'danger', label: 'Danger' } };
export const Neutral = { args: { tone: 'neutral', label: 'Neutral' } };

/** Every tone at once, laid out the way the Figma component set is. */
export const AllTones = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-badge-row">
      {TONES.map((tone) => (
        <div key={tone} className="lumo-badge-stack">
          <p className="lumo-badge-stack__head">{tone}</p>
          <Badge tone={tone} label="Primary" />
        </div>
      ))}
    </div>
  ),
};

/* --------------------------------------------------------- the label ---- */

/**
 * The node draws every variant at the same 45px label width because every one
 * says "Primary". The box is auto-layout hug, so real content resizes it.
 */
export const LabelLengths = {
  name: 'Label — the box hugs it',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-badge-row">
      <Badge tone="success" label="New" />
      <Badge tone="primary" label="Most popular" />
      <Badge tone="warning" label="Limited availability" />
      <Badge tone="danger" label="Sold out" />
      <Badge tone="neutral" label="Draft" />
    </div>
  ),
};

/** The setting a badge is actually read in: beside the thing it labels. */
export const InContext = {
  name: 'In context',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-badge-stack">
      <p className="lumo-badge-incontext">
        Harbour View Suite <Badge tone="primary" label="Most popular" />
      </p>
      <p className="lumo-badge-incontext">
        Garden Studio <Badge tone="success" label="Available" />
      </p>
      <p className="lumo-badge-incontext">
        Loft on Ninth <Badge tone="warning" label="2 rooms left" />
      </p>
      <p className="lumo-badge-incontext">
        Riverside Cabin <Badge tone="danger" label="Sold out" />
      </p>
      <p className="lumo-badge-incontext">
        Old Mill House <Badge tone="neutral" label="Unlisted" />
      </p>
    </div>
  ),
};
