/**
 * The public surface.
 *
 * This file exists to catch an accidental export. Everything in src/index.ts
 * is API we owe a version bump on; everything else is internal and may change
 * freely (docs/public-api.md). A component that leaks into the barrel by
 * accident becomes a promise nobody made, and nothing else in the repo would
 * notice.
 */
import { describe, it, expect } from 'vitest';
import * as surface from './index.ts';

/** Exactly these, in this order. Changing this list is an API decision. */
const PUBLIC = [
  'Accordion',
  'Badge',
  'Button',
  'Card',
  'CardLayoutVertical',
  'EmptyState',
  'Field',
  'Progress',
  'Switch',
  'Toast',
];

/**
 * Documented as internal in docs/public-api.md: rendered by their parent from
 * its own props, Figma placeholder slots, or marked "not for use outside a
 * card". If one of these appears in the barrel, the decision was reversed
 * without the record being updated.
 */
const INTERNAL = [
  'AccordionIcon',
  'AccordionContentSlot',
  'ButtonIcon',
  'CardHeader',
  'CardFooter',
  'EmptyStateIcon',
  'FieldIcon',
  'FieldControlSlot',
  'SwitchKnob',
  'ToastIcon',
  'ToastClose',
];

describe('the public surface', () => {
  it('exports exactly the ten public components and nothing else', () => {
    expect(Object.keys(surface).sort()).toEqual([...PUBLIC].sort());
  });

  it('every public export is a component function', () => {
    for (const name of PUBLIC) {
      expect(typeof surface[name]).toBe('function');
    }
  });

  it('exports no default, because a package root with ten components has no obvious one', () => {
    expect(surface.default).toBeUndefined();
  });

  it('leaks none of the internal components', () => {
    for (const name of INTERNAL) {
      expect(surface[name], `${name} must stay internal`).toBeUndefined();
    }
  });
});
