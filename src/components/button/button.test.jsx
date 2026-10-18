/**
 * Button — three types, five states.
 *
 * Two behaviours here are not visual and are the reason this file exists:
 * `rest` is spread first so a caller cannot reach past the component and
 * cancel what `state` promises, and `data-forced-state` tells the CSS that a
 * state is pinned so the live :hover rules stand down.
 */
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithTokens, screen } from '../../test/renderWithTokens.jsx';
import { Button } from './button.jsx';

const TYPES = ['fill', 'outline', 'transparent'];
const STATES = ['default', 'hovered', 'focused', 'disabled', 'error'];

describe('Button — types', () => {
  for (const type of TYPES) {
    it(`type=${type} renders its modifier class`, () => {
      const { container } = renderWithTokens(<Button type={type} label="Go" />);
      expect(container.querySelector(`.lumo-button--${type}`)).toBeTruthy();
    });
  }

  it('an unknown type falls back to fill', () => {
    const { container } = renderWithTokens(<Button type="ghost" label="Go" />);
    expect(container.querySelector('.lumo-button--fill')).toBeTruthy();
  });
});

describe('Button — states', () => {
  for (const state of STATES) {
    it(`state=${state} is represented exactly once`, () => {
      const { container } = renderWithTokens(<Button state={state} label="Go" />);
      const el = container.querySelector('.lumo-button');
      if (state === 'default') {
        // default is the absence of a modifier, not a `--default` class
        expect(el.className).not.toMatch(/lumo-button--(hovered|focused|disabled|error)/);
        expect(el).not.toHaveAttribute('data-forced-state');
      } else {
        expect(el).toHaveClass(`lumo-button--${state}`);
        expect(el).toHaveAttribute('data-forced-state', state);
      }
    });
  }
});

describe('Button — disabled', () => {
  it('state=disabled sets the real DOM disabled attribute', () => {
    renderWithTokens(<Button state="disabled" label="Go" />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disabled blocks onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithTokens(<Button state="disabled" label="Go" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('a caller cannot re-enable it through rest props', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    // `rest` is spread first precisely so this cannot defeat state="disabled".
    renderWithTokens(
      <Button state="disabled" label="Go" onClick={onClick} disabled={false} />,
    );
    expect(screen.getByRole('button')).toBeDisabled();
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('enabled buttons do fire onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithTokens(<Button label="Go" onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Button — label and icons', () => {
  it('shows the label by default, with both icons', () => {
    const { container } = renderWithTokens(<Button label="Save" />);
    expect(screen.getByText('Save')).toHaveClass('lumo-button__label');
    expect(container.querySelectorAll('.lumo-button__icon')).toHaveLength(2);
  });

  it('icons can be turned off individually', () => {
    const { container } = renderWithTokens(
      <Button label="Save" iconLeft={false} iconRight={false} />,
    );
    expect(container.querySelectorAll('.lumo-button__icon')).toHaveLength(0);
  });

  it('text={false} removes the label', () => {
    renderWithTokens(<Button label="Save" text={false} />);
    expect(screen.queryByText('Save')).toBeNull();
  });

  it('icon-only takes its accessible name from label, since no text is drawn', () => {
    renderWithTokens(<Button label="Add item" text={false} iconRight={false} />);
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('with text there is no aria-label competing with the visible text', () => {
    renderWithTokens(<Button label="Save" />);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-label');
  });

  it('the icons are decoration, hidden from assistive tech', () => {
    const { container } = renderWithTokens(<Button label="Save" />);
    for (const icon of container.querySelectorAll('.lumo-button__icon')) {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    }
  });
});

describe('Button — the DOM type attribute', () => {
  it('defaults to button, so it does not submit a form by accident', () => {
    renderWithTokens(<Button label="Go" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('htmlType sets the real attribute, keeping `type` free for the Figma property', () => {
    renderWithTokens(<Button label="Go" type="outline" htmlType="submit" />);
    const el = screen.getByRole('button');
    expect(el).toHaveAttribute('type', 'submit');
    expect(el).toHaveClass('lumo-button--outline');
  });
});
