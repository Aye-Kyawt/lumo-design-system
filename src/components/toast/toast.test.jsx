/**
 * Toast — four statuses. It announces itself: role="status" with
 * aria-live="polite", so a toast that appears is read without stealing focus.
 */
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithTokens, screen } from '../../test/renderWithTokens.jsx';
import { Toast } from './toast.jsx';

const STATUSES = ['positive', 'negative', 'warning', 'info'];

describe('Toast — statuses', () => {
  for (const status of STATUSES) {
    it(`status=${status} renders its class and data-status`, () => {
      const { container } = renderWithTokens(<Toast status={status} />);
      const el = container.querySelector('.lumo-toast');
      expect(el).toHaveClass(`lumo-toast--${status}`);
      expect(el).toHaveAttribute('data-status', status);
    });
  }

  it('defaults to positive, and an unknown status falls back to it', () => {
    const { container: a } = renderWithTokens(<Toast />);
    expect(a.querySelector('.lumo-toast')).toHaveAttribute('data-status', 'positive');
    const { container: b } = renderWithTokens(<Toast status="chartreuse" />);
    expect(b.querySelector('.lumo-toast')).toHaveAttribute('data-status', 'positive');
  });
});

describe('Toast — it announces itself', () => {
  it('is a polite live status region', () => {
    renderWithTokens(<Toast />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('the status icon is decoration, hidden from assistive tech', () => {
    const { container } = renderWithTokens(<Toast />);
    expect(container.querySelector('.lumo-toast__icon')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Toast — content', () => {
  it('renders title and description', () => {
    renderWithTokens(<Toast title="Report saved" descriptionText="Ready to share." />);
    expect(screen.getByText('Report saved')).toHaveClass('lumo-toast__title');
    expect(screen.getByText('Ready to share.')).toHaveClass('lumo-toast__description');
  });

  it('description={false} removes the description', () => {
    const { container } = renderWithTokens(
      <Toast description={false} descriptionText="hidden" />,
    );
    expect(container.querySelector('.lumo-toast__description')).toBeNull();
  });
});

describe('Toast — the close button', () => {
  it('is present by default, named, and a real button', () => {
    renderWithTokens(<Toast />);
    const btn = screen.getByRole('button', { name: 'Close' });
    expect(btn.tagName).toBe('BUTTON');
  });

  it('closeLabel sets its accessible name', () => {
    renderWithTokens(<Toast closeLabel="Dismiss notification" />);
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument();
  });

  it('close={false} removes it', () => {
    renderWithTokens(<Toast close={false} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('clicking it calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTokens(<Toast onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('is keyboard operable, being a real button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTokens(<Toast onClose={onClose} />);
    screen.getByRole('button', { name: 'Close' }).focus();
    await user.keyboard('{Enter}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
