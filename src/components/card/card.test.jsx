/**
 * Card — Figma node 62:103. Padding none/md/lg/xl, states
 * default/hovered/focused/disabled. `children` is the Figma `↳Layout` slot:
 * Card renders the frame and nothing into it, which is why
 * CardLayoutVertical is public and the header and footer are not.
 *
 * Interactivity is derived, not declared: the card becomes operable only when
 * it is given an onClick and is not disabled. That derivation is the thing
 * most worth testing, because a div that gained role="button" without a
 * keyboard path would be a trap.
 */
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithTokens, screen } from '../../test/renderWithTokens.jsx';
import { Card } from './card.jsx';

const PADDING = ['none', 'md', 'lg', 'xl'];
const STATES = ['default', 'hovered', 'focused', 'disabled'];

describe('Card — padding', () => {
  for (const padding of PADDING) {
    it(`padding=${padding} renders its class`, () => {
      const { container } = renderWithTokens(<Card padding={padding}>x</Card>);
      expect(container.querySelector(`.lumo-card--padding-${padding}`)).toBeTruthy();
    });
  }

  it('defaults to none, and an unknown value falls back to it', () => {
    const { container: a } = renderWithTokens(<Card>x</Card>);
    expect(a.querySelector('.lumo-card--padding-none')).toBeTruthy();
    const { container: b } = renderWithTokens(<Card padding="huge">x</Card>);
    expect(b.querySelector('.lumo-card--padding-none')).toBeTruthy();
  });
});

describe('Card — states', () => {
  for (const state of STATES) {
    it(`state=${state} is represented exactly once`, () => {
      const { container } = renderWithTokens(<Card state={state}>x</Card>);
      const el = container.querySelector('.lumo-card');
      if (state === 'default') {
        expect(el.className).not.toMatch(/lumo-card--(hovered|focused|disabled)/);
      } else {
        expect(el).toHaveClass(`lumo-card--${state}`);
      }
    });
  }
});

describe('Card — the layout slot', () => {
  it('renders exactly what it is given and nothing of its own', () => {
    renderWithTokens(<Card><p>slot content</p></Card>);
    expect(screen.getByText('slot content')).toBeInTheDocument();
  });

  it('renders nothing into the slot when given no children', () => {
    const { container } = renderWithTokens(<Card />);
    expect(container.querySelector('.lumo-card').children).toHaveLength(0);
  });
});

describe('Card — interactivity is derived from onClick', () => {
  it('without onClick it is not interactive at all', () => {
    const { container } = renderWithTokens(<Card>x</Card>);
    const el = container.querySelector('.lumo-card');
    expect(el).not.toHaveAttribute('role');
    expect(el).not.toHaveAttribute('tabindex');
    expect(el).not.toHaveClass('lumo-card--interactive');
  });

  it('with onClick it becomes a focusable button', () => {
    renderWithTokens(<Card onClick={() => {}}>x</Card>);
    const el = screen.getByRole('button');
    expect(el).toHaveAttribute('tabindex', '0');
    expect(el).toHaveClass('lumo-card--interactive');
  });

  it('disabled wins over onClick, so it never becomes operable', () => {
    const { container } = renderWithTokens(
      <Card state="disabled" onClick={() => {}}>x</Card>,
    );
    const el = container.querySelector('.lumo-card');
    expect(el).not.toHaveAttribute('role');
    expect(el).not.toHaveAttribute('tabindex');
    expect(el).toHaveAttribute('aria-disabled', 'true');
    expect(el).not.toHaveClass('lumo-card--interactive');
  });
});

describe('Card — keyboard operation when interactive', () => {
  it('a click fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithTokens(<Card onClick={onClick}>x</Card>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Enter activates it, as the button role promises', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithTokens(<Card onClick={onClick}>x</Card>);
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Space activates it on key up, which is how a real button behaves', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithTokens(<Card onClick={onClick}>x</Card>);
    screen.getByRole('button').focus();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('a disabled card does not respond to the keyboard', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = renderWithTokens(
      <Card state="disabled" onClick={onClick}>x</Card>,
    );
    const el = container.querySelector('.lumo-card');
    el.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
  });
});
