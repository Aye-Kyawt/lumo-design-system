/**
 * Badge — Figma set 17:1139. One variant property, Tone, five values.
 *
 * The set defines no size and no interaction state, which follows from its own
 * description: a badge is read, not clicked. So there is nothing to test about
 * hover, focus or disabled, and asserting the absence is the point.
 */
import { describe, it, expect } from 'vitest';
import { renderWithTokens, screen } from '../../test/renderWithTokens.jsx';
import { Badge } from './badge.jsx';

const TONES = ['primary', 'success', 'warning', 'danger', 'neutral'];

describe('Badge — the five tones', () => {
  for (const tone of TONES) {
    it(`tone=${tone} renders its modifier class`, () => {
      const { container } = renderWithTokens(<Badge tone={tone} label="Status" />);
      expect(container.querySelector(`.lumo-badge--${tone}`)).toBeTruthy();
    });
  }

  it('defaults to primary', () => {
    const { container } = renderWithTokens(<Badge label="Status" />);
    expect(container.querySelector('.lumo-badge--primary')).toBeTruthy();
  });

  it('an unknown tone falls back to primary rather than rendering unstyled', () => {
    const { container } = renderWithTokens(<Badge tone="chartreuse" label="Status" />);
    expect(container.querySelector('.lumo-badge--primary')).toBeTruthy();
    expect(container.querySelector('.lumo-badge--chartreuse')).toBeNull();
  });
});

describe('Badge — content', () => {
  it('renders the label', () => {
    renderWithTokens(<Badge label="Cleared" />);
    expect(screen.getByText('Cleared')).toHaveClass('lumo-badge__label');
  });

  it('forwards className without losing its own', () => {
    const { container } = renderWithTokens(<Badge label="x" className="mine" />);
    const el = container.querySelector('.lumo-badge');
    expect(el).toHaveClass('lumo-badge', 'lumo-badge--primary', 'mine');
  });
});

describe('Badge — it is read, not operated', () => {
  it('renders a span, so it is not in the tab order and has no button role', () => {
    const { container } = renderWithTokens(<Badge label="Status" />);
    const el = container.querySelector('.lumo-badge');
    expect(el.tagName).toBe('SPAN');
    expect(el).not.toHaveAttribute('tabindex');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
