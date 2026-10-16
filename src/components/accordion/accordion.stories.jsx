/**
 * Figma node under test:
 * https://www.figma.com/design/UbWxCGi4FaV4Ficg2iDnu0/Lumo.Web.Component.V1.0.In-Progress?node-id=208-4912
 *
 * Component set: node 208:4912, `accordion`, MOLECULES. One variant property,
 * `State`, with two values — `closed` (208:4897, 480×70) and `open`
 * (208:4904, 480×158). No size property and no interaction state.
 *
 * Each variant is a card with a Header row (208:4898 / 208:4905) holding a
 * title (208:4899 / 208:4906) and a 20px Chevron (208:4900, an instance of
 * `Icon/expand_more` 208:4895). In `open` the chevron is wrapped in a
 * container rotated 180° (208:4907) and a content region appears below — an
 * instance of `_Slot/Content` (41:21), reproduced here as
 * `AccordionContentSlot` for comparison only.
 *
 * WHICH STORIES ARE THE NODE AND WHICH ARE THIS BUILD'S READING
 *
 *   From the node:        Closed, Open, BothVariants
 *   This build's reading: States, Disabled, Uncontrolled, OneAtATime,
 *                         WithHeading, WithRealContent, LongTitle
 *
 * `States` is the important one and it is not drawn in Figma at all. The set
 * defines `State` and nothing else — no hovered, pressed, focused or disabled
 * variant exists anywhere in 208:4912. An accordion header is a button, so
 * those states were implemented as behaviour against existing semantic tokens.
 * No token was invented; the mapping is this build's reading and needs a
 * designer's eye. See docs/accordion.md, gap 1.
 *
 * KNOWN REPORTED DIFFERENCES — all seven are in docs/accordion.md:
 *   1. Figma draws no interaction state at all. The States story is a mapping,
 *      not a reproduction of a node.
 *   2. The node's 480px frame is a raw number. The component is fluid and
 *      takes its container's width; BothVariants pins 480px as story chrome so
 *      the frames can be compared.
 *   3. The content region has no padding in the node — the slot is flush to
 *      the card's edges and bottom corners. Reproduced as drawn, which
 *      WithRealContent shows is probably not what is intended.
 *   4. The node renders its 16px corner as `border/radius/card`, which this
 *      export resolves to 12px in every platform mode. The card renders 12px.
 *   5. The chevron's fill binds `color/text/secondary` — a text token on an
 *      icon. Correct value, wrong family; the icon family has no neutral rung.
 *   6. `border.style.solid` and `border.style.dashed` have no value anywhere
 *      in the export and are skipped by the token build. The CSS keywords
 *      stand in.
 *   7. All five `motion/easing/*` tokens are valueless, so the chevron's
 *      rotation has a duration token and no easing token.
 */
import { useState } from 'react';

import { Accordion } from './accordion.jsx';
import { AccordionContentSlot } from './accordionContentSlot.jsx';
import './accordion.stories.css';

/** The string the node itself draws, so a story matches the frame by default. */
const NODE_TITLE = 'How does pricing work?';

/** Real answer copy, for the stories that are not reproducing the placeholder. */
const ANSWER =
  'Every plan is billed per seat, per month. You can change plan at any time and ' +
  'we prorate the difference on your next invoice.';

export default {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    controls: { disable: false },
    options: { layout: { showPanel: true } },
    docs: {
      description: {
        component:
          'Use an accordion to let the user expand one answer at a time without leaving ' +
          'the page — an FAQ list on a marketing page. Do not use it for primary content ' +
          'the user needs to see without an extra click. `State` is the only property the ' +
          'Figma set defines. The content is `children`: the node draws a swappable ' +
          '`_Slot/Content` placeholder, not a fixed sub-component, so this component ' +
          'imports nothing else in the registry. The header is a real `<button ' +
          'aria-expanded>` over a `role="region"` panel, so Space and Enter operate it ' +
          'and the closed panel is out of the tab order.',
      },
    },
  },
  argTypes: {
    state: {
      control: 'radio',
      options: ['closed', 'open'],
      description:
        'Figma `State`. Supply it to drive the accordion from your own state; leave it ' +
        'out and it keeps its own, seeded from `defaultState`.',
    },
    defaultState: {
      control: 'radio',
      options: ['closed', 'open'],
      description:
        'Starting value when `state` is not supplied. Defaults to the set’s own first ' +
        'variant, `State=closed` (208:4897).',
      table: { defaultValue: { summary: 'closed' } },
    },
    title: {
      control: 'text',
      description:
        'The header text (208:4899). The DOM `title` attribute is exposed separately as ' +
        '`htmlTitle` — see docs/naming-conflicts.md.',
    },
    disabled: {
      control: 'boolean',
      description:
        'Not a variant in Figma — see docs/accordion.md, gap 1. Blocks the toggle and is ' +
        'announced, while the header stays focusable.',
      table: { defaultValue: { summary: 'false' } },
    },
    headingLevel: {
      control: { type: 'number', min: 0, max: 6 },
      description:
        'Not a Figma property. Wraps the header button in an `<h1>`–`<h6>` so a screen ' +
        'reader user can jump between questions. `0` means no wrapper, which is what the ' +
        'node draws.',
      table: { defaultValue: { summary: '0' } },
    },
    iconName: {
      control: 'text',
      description: 'Material Symbols glyph for the chevron. Node 208:4895 draws `expand_more`.',
      table: { defaultValue: { summary: 'expand_more' } },
    },
    children: { control: false },
    onToggle: { action: 'toggled' },
  },
};

/* ------------------------------------------------- the two node variants ---- */

/**
 * `State=closed` — node 208:4897, 480×70.
 *
 * The panel is rendered and `hidden`, so its content is out of the tab order
 * and out of the accessibility tree rather than merely invisible.
 */
export const Closed = {
  args: {
    state: 'closed',
    title: NODE_TITLE,
    children: <AccordionContentSlot />,
  },
};

/**
 * `State=open` — node 208:4904, 480×158.
 *
 * The chevron is rotated 180° and the content region shows. The dashed box is
 * `_Slot/Content` (41:21) drawn as the node draws it — a placeholder, never a
 * default; its own description says never to ship a screen with a slot still
 * showing.
 */
export const Open = {
  args: {
    state: 'open',
    title: NODE_TITLE,
    children: <AccordionContentSlot />,
  },
};

/**
 * Both variants side by side, laid out the way the component set is arranged
 * on the canvas and pinned to the node's own 480px so the frames can be
 * compared directly. The component itself is fluid — see gap 2.
 */
export const BothVariants = {
  name: 'Both variants — as the set is drawn',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-accordion-set">
      <div className="lumo-accordion-frame">
        <p className="lumo-accordion-frame__head">State=closed · 208:4897</p>
        <Accordion state="closed" title={NODE_TITLE}>
          <AccordionContentSlot />
        </Accordion>
      </div>
      <div className="lumo-accordion-frame">
        <p className="lumo-accordion-frame__head">State=open · 208:4904</p>
        <Accordion state="open" title={NODE_TITLE}>
          <AccordionContentSlot />
        </Accordion>
      </div>
    </div>
  ),
};

/* ------------------------------------------------------------- states ---- */

/**
 * GAP 1 — none of these is drawn in Figma.
 *
 * 208:4912 defines `State=closed` and `State=open` and nothing else. These
 * four rows are this build's mapping onto semantic tokens that already exist,
 * not a reproduction of any node, and they need a designer's eye.
 *
 * Hover and press are live: put a pointer on the second row. Focus is live
 * too — tab to a header and watch `elevation/focused` ring the card's radius.
 */
export const States = {
  name: 'States — not drawn in Figma',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-accordion-stack">
      <div className="lumo-accordion-case">
        <p className="lumo-accordion-case__head">default</p>
        <Accordion state="closed" title={NODE_TITLE}>
          <AccordionContentSlot />
        </Accordion>
      </div>
      <div className="lumo-accordion-case">
        <p className="lumo-accordion-case__head">
          hovered / pressed — bg/surfacePrimary, then bg/surfaceSecondary
        </p>
        <Accordion state="closed" title="Hover me, then hold the mouse down">
          <AccordionContentSlot />
        </Accordion>
      </div>
      <div className="lumo-accordion-case">
        <p className="lumo-accordion-case__head">focused — tab to it, elevation/focused</p>
        <Accordion state="closed" title="Tab to me">
          <AccordionContentSlot />
        </Accordion>
      </div>
      <div className="lumo-accordion-case">
        <p className="lumo-accordion-case__head">
          disabled — opacity/disabled, still focusable, still announced
        </p>
        <Accordion state="closed" disabled title="You cannot open me">
          <AccordionContentSlot />
        </Accordion>
      </div>
    </div>
  ),
};

/**
 * `disabled` on its own, in both states. Not a Figma variant.
 *
 * It is `aria-disabled`, not the DOM `disabled` attribute, so the header stays
 * reachable by keyboard and a screen reader can read it before skipping it.
 * Tab to either one and press Space or Enter: nothing moves.
 */
export const Disabled = {
  name: 'Disabled — not drawn in Figma',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-accordion-stack">
      <Accordion state="closed" disabled title={NODE_TITLE}>
        <AccordionContentSlot />
      </Accordion>
      <Accordion state="open" disabled title="Disabled while open">
        <AccordionContentSlot />
      </Accordion>
    </div>
  ),
};

/* --------------------------------------------------------- behaviour ---- */

/**
 * The accordion actually opens. Uncontrolled: it keeps its own state, seeded
 * from the Figma set's first variant, `State=closed`. Click the header, or tab
 * to it and press Space or Enter.
 *
 * Watch the chevron rotate and the panel's `hidden` attribute come and go in
 * the inspector.
 */
export const Uncontrolled = {
  name: 'It works — uncontrolled',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-accordion-stack">
      <Accordion title={NODE_TITLE}>
        <div className="lumo-accordion-answer">{ANSWER}</div>
      </Accordion>
      <p className="lumo-accordion-note">
        No <code>state</code> prop. The component holds its own, from{' '}
        <code>defaultState=&quot;closed&quot;</code>.
      </p>
    </div>
  ),
};

/**
 * Controlled — "one answer at a time", which is exactly what the component
 * description asks for: the parent owns which row is open, so opening one
 * closes the others.
 *
 * This is the shape an FAQ list actually takes, and it is why `state` is a
 * controlled prop rather than internal-only. `headingLevel` is passed here
 * too, so each question is a real `<h3>` a screen reader can jump between.
 */
export const OneAtATime = {
  name: 'It works — one open at a time',
  parameters: { controls: { disable: true } },
  render: function OneAtATimeStory() {
    const faq = [
      { q: NODE_TITLE, a: ANSWER },
      {
        q: 'Can I change plan later?',
        a: 'Yes. Upgrades take effect immediately and downgrades at the end of the period.',
      },
      {
        q: 'Do you offer a nonprofit discount?',
        a: 'We do — write to us and we will apply it to your account.',
      },
    ];
    const [openIndex, setOpenIndex] = useState(0);

    return (
      <div className="lumo-accordion-faq">
        {faq.map((row, index) => (
          <Accordion
            key={row.q}
            title={row.q}
            headingLevel={3}
            state={openIndex === index ? 'open' : 'closed'}
            onToggle={(next) => setOpenIndex(next === 'open' ? index : -1)}
          >
            <div className="lumo-accordion-answer">{row.a}</div>
          </Accordion>
        ))}
      </div>
    );
  },
};

/* -------------------------------------------------------- the slot ---- */

/**
 * Real content instead of the placeholder — and the reason gap 3 matters.
 *
 * The node draws `_Slot/Content` flush to the card's left, right and bottom
 * edges with no padding anywhere around it. Reproduced exactly as drawn, which
 * means real answer text runs into the card's border and across its bottom
 * corner radius. The left card shows that. The right card shows the same
 * content with padding applied by the caller.
 *
 * The component does not add that padding itself, because the number is not in
 * the node and inventing one is a design decision. See docs/accordion.md,
 * gap 3, for the recommendation.
 */
export const WithRealContent = {
  name: 'With real content — shows gap 3',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-accordion-set">
      <div className="lumo-accordion-frame">
        <p className="lumo-accordion-frame__head">as drawn — content is flush to the edge</p>
        <Accordion state="open" title={NODE_TITLE}>
          <p className="lumo-accordion-bare">{ANSWER}</p>
        </Accordion>
      </div>
      <div className="lumo-accordion-frame">
        <p className="lumo-accordion-frame__head">caller adds padding</p>
        <Accordion state="open" title={NODE_TITLE}>
          <div className="lumo-accordion-answer">{ANSWER}</div>
        </Accordion>
      </div>
    </div>
  ),
};

/**
 * `headingLevel` — an addition, not a Figma property.
 *
 * The node draws a card, not a document outline, so it carries no heading
 * level. The default is `0`, which renders exactly what the node draws: a bare
 * button. Pass 1–6 and the button is wrapped in that heading element, which is
 * what lets a screen reader user list and jump between the questions.
 *
 * The heading element contributes outline semantics and no style — the card
 * below is pixel-identical to `Closed`.
 */
export const WithHeading = {
  name: 'Heading level — an addition',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-accordion-stack">
      <div className="lumo-accordion-case">
        <p className="lumo-accordion-case__head">headingLevel={0} — a bare button, as drawn</p>
        <Accordion state="closed" title={NODE_TITLE}>
          <AccordionContentSlot />
        </Accordion>
      </div>
      <div className="lumo-accordion-case">
        <p className="lumo-accordion-case__head">
          headingLevel={3} — the same button inside an &lt;h3&gt;
        </p>
        <Accordion state="closed" headingLevel={3} title={NODE_TITLE}>
          <AccordionContentSlot />
        </Accordion>
      </div>
    </div>
  ),
};

/**
 * A question longer than one line. The node draws a single short line, so this
 * is this build's reading of what should happen beyond it: the title takes the
 * row and wraps, and the chevron keeps its 20px box rather than being squeezed
 * or pushed out of the card.
 */
export const LongTitle = {
  name: 'Long title — wraps, chevron holds',
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="lumo-accordion-stack">
      <Accordion
        state="open"
        title="What happens to my data if I cancel my subscription part-way through a billing period?"
      >
        <div className="lumo-accordion-answer">{ANSWER}</div>
      </Accordion>
    </div>
  ),
};
