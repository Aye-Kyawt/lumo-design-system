/**
 * Accordion — Figma set 208:4897, two variants (State=closed / State=open).
 *
 * The component renders the disclosure pattern: a real <button> carrying
 * aria-expanded and aria-controls over a role="region" panel. `disabled` is
 * not a Figma variant (docs/accordion.md, gap 1) and uses aria-disabled rather
 * than the DOM attribute, so the header stays focusable and can still be read.
 */
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithTokens, screen } from '../../test/renderWithTokens.jsx';
import { Accordion } from './accordion.jsx';

describe('Accordion — variants', () => {
  it('State=closed renders aria-expanded false', () => {
    renderWithTokens(<Accordion title="What is it?" state="closed">Answer</Accordion>);
    expect(screen.getByRole('button', { name: /What is it/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('State=open renders aria-expanded true', () => {
    renderWithTokens(<Accordion title="What is it?" state="open">Answer</Accordion>);
    expect(screen.getByRole('button', { name: /What is it/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('defaults to closed, the set own first variant', () => {
    renderWithTokens(<Accordion title="What is it?">Answer</Accordion>);
    expect(screen.getByRole('button', { name: /What is it/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('exposes the resolved variant as data-state for QA to read', () => {
    const { container } = renderWithTokens(
      <Accordion title="Q" state="open">Answer</Accordion>,
    );
    expect(container.querySelector('.lumo-accordion')).toHaveAttribute('data-state', 'open');
  });
});

describe('Accordion — behaviour', () => {
  it('uncontrolled: clicking the header opens and closes it', async () => {
    const user = userEvent.setup();
    renderWithTokens(<Accordion title="Q">Answer</Accordion>);
    const header = screen.getByRole('button', { name: 'Q' });
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('controlled: `state` wins and onToggle reports the value it is moving to', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWithTokens(
      <Accordion title="Q" state="closed" onToggle={onToggle}>Answer</Accordion>,
    );
    const header = screen.getByRole('button', { name: 'Q' });
    await user.click(header);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle.mock.calls[0][0]).toBe('open');
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });

  it('Space and Enter operate the header', async () => {
    const user = userEvent.setup();
    renderWithTokens(<Accordion title="Q">Answer</Accordion>);
    const header = screen.getByRole('button', { name: 'Q' });
    header.focus();
    await user.keyboard(' ');
    expect(header).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Enter}');
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Accordion — disabled', () => {
  it('is aria-disabled, stays focusable, and does not toggle', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWithTokens(
      <Accordion title="Q" disabled onToggle={onToggle}>Answer</Accordion>,
    );
    const header = screen.getByRole('button', { name: 'Q' });
    expect(header).toHaveAttribute('aria-disabled', 'true');
    header.focus();
    expect(header).toHaveFocus();
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(onToggle).not.toHaveBeenCalled();
  });
});

describe('Accordion — accessibility contract', () => {
  it('aria-controls points at a real region labelled by the header', () => {
    renderWithTokens(<Accordion title="Q" state="open">Answer</Accordion>);
    const header = screen.getByRole('button', { name: 'Q' });
    const panelId = header.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId);
    expect(panel).toBeTruthy();
    expect(panel).toHaveAttribute('role', 'region');
    expect(panel).toHaveAttribute('aria-labelledby', header.id);
  });

  it('the chevron is decoration, hidden from assistive tech', () => {
    const { container } = renderWithTokens(<Accordion title="Q">Answer</Accordion>);
    const icon = container.querySelector('.lumo-accordion__icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('headingLevel wraps the header so a screen reader can jump between questions', () => {
    const { container } = renderWithTokens(
      <Accordion title="Q" headingLevel={3}>Answer</Accordion>,
    );
    const heading = container.querySelector('h3.lumo-accordion__heading');
    expect(heading).toBeTruthy();
    expect(heading.querySelector('button')).toBeTruthy();
  });

  it('with no headingLevel there is no heading element at all', () => {
    const { container } = renderWithTokens(<Accordion title="Q">Answer</Accordion>);
    expect(container.querySelector('.lumo-accordion__heading')).toBeNull();
  });

  it('htmlTitle sets the DOM title, keeping `title` free for the Figma property', () => {
    renderWithTokens(<Accordion title="Q" htmlTitle="tooltip text">Answer</Accordion>);
    // It lands on the header button, which is the element a pointer hovers.
    const header = screen.getByRole('button', { name: 'Q' });
    expect(header).toHaveAttribute('title', 'tooltip text');
    // And the Figma `title` property is still the visible text, not the tooltip.
    expect(header).toHaveTextContent('Q');
    expect(document.querySelector('.lumo-accordion')).not.toHaveAttribute('title');
  });
});
