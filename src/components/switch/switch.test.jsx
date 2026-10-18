/**
 * Switch — Figma set 17:1201 ("Toggle" on the canvas).
 *
 * The set defines one variant property, `On`, with two values, and no state
 * property — docs/switch.md records what that absence cost. So the variant
 * coverage here is small and the behaviour coverage is not: the component's
 * own file says the setting "takes effect immediately", which is why it is a
 * real button with role="switch" rather than a styled div.
 */
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithTokens, screen } from '../../test/renderWithTokens.jsx';
import { Switch } from './switch.jsx';

describe('Switch — variants', () => {
  it('On=true renders aria-checked true and the on class', () => {
    renderWithTokens(<Switch aria-label="AI summary" on />);
    const el = screen.getByRole('switch');
    expect(el).toHaveAttribute('aria-checked', 'true');
    expect(el).toHaveClass('lumo-switch--on');
  });

  it('On=false renders aria-checked false and not the on class', () => {
    renderWithTokens(<Switch aria-label="AI summary" on={false} />);
    const el = screen.getByRole('switch');
    expect(el).toHaveAttribute('aria-checked', 'false');
    expect(el).not.toHaveClass('lumo-switch--on');
  });

  it('defaults to on, which is the set own first variant', () => {
    renderWithTokens(<Switch aria-label="AI summary" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });
});

describe('Switch — behaviour', () => {
  it('uncontrolled: a click flips aria-checked', async () => {
    const user = userEvent.setup();
    renderWithTokens(<Switch aria-label="AI summary" defaultOn={false} />);
    const el = screen.getByRole('switch');
    expect(el).toHaveAttribute('aria-checked', 'false');
    await user.click(el);
    expect(el).toHaveAttribute('aria-checked', 'true');
    await user.click(el);
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('controlled: `on` wins, and the component does not move on its own', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTokens(<Switch aria-label="AI summary" on={false} onChange={onChange} />);
    const el = screen.getByRole('switch');
    await user.click(el);
    // The documented signature is (on, event) -- both are part of the contract.
    expect(onChange).toHaveBeenCalledTimes(1);
    const [next, event] = onChange.mock.calls[0];
    expect(next).toBe(true);
    expect(event).toBeTruthy();
    expect(event.type).toBe('click');
    // Still false: the caller owns the value.
    expect(el).toHaveAttribute('aria-checked', 'false');
  });

  it('Space and Enter operate it, because it is a real button', async () => {
    const user = userEvent.setup();
    renderWithTokens(<Switch aria-label="AI summary" defaultOn={false} />);
    const el = screen.getByRole('switch');
    el.focus();
    await user.keyboard(' ');
    expect(el).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{Enter}');
    expect(el).toHaveAttribute('aria-checked', 'false');
  });
});

describe('Switch — disabled', () => {
  it('uses aria-disabled, so it stays focusable and still announces', () => {
    renderWithTokens(<Switch aria-label="AI summary" disabled />);
    const el = screen.getByRole('switch');
    expect(el).toHaveAttribute('aria-disabled', 'true');
    el.focus();
    expect(el).toHaveFocus();
  });

  it('disabled blocks the toggle and the callback', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTokens(
      <Switch aria-label="AI summary" defaultOn={false} disabled onChange={onChange} />,
    );
    const el = screen.getByRole('switch');
    await user.click(el);
    expect(el).toHaveAttribute('aria-checked', 'false');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Switch — accessibility contract', () => {
  it('is role=switch on a real button of type button', () => {
    renderWithTokens(<Switch aria-label="AI summary" />);
    const el = screen.getByRole('switch');
    expect(el.tagName).toBe('BUTTON');
    expect(el).toHaveAttribute('type', 'button');
  });

  it('takes its accessible name from the caller, since the node has no label layer', () => {
    renderWithTokens(<Switch aria-label="Write summary with AI" />);
    expect(screen.getByRole('switch', { name: 'Write summary with AI' })).toBeInTheDocument();
  });

  it('the knob is hidden from assistive tech', () => {
    const { container } = renderWithTokens(<Switch aria-label="AI summary" />);
    expect(container.querySelector('.lumo-switch__knob')).toHaveAttribute('aria-hidden', 'true');
  });
});
