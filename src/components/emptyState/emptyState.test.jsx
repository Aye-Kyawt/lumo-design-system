/**
 * EmptyState — two sizes, sm and md.
 */
import { describe, it, expect } from 'vitest';
import { renderWithTokens, screen } from '../../test/renderWithTokens.jsx';
import { EmptyState } from './emptyState.jsx';

describe('EmptyState — sizes', () => {
  for (const size of ['sm', 'md']) {
    it(`size=${size} renders its class`, () => {
      const { container } = renderWithTokens(<EmptyState size={size} title="Nothing here" />);
      expect(container.querySelector(`.lumo-empty-state--${size}`)).toBeTruthy();
    });
  }

  it('defaults to sm, and an unknown size falls back to it', () => {
    const { container: a } = renderWithTokens(<EmptyState title="t" />);
    expect(a.querySelector('.lumo-empty-state--sm')).toBeTruthy();
    const { container: b } = renderWithTokens(<EmptyState size="jumbo" title="t" />);
    expect(b.querySelector('.lumo-empty-state--sm')).toBeTruthy();
  });
});

describe('EmptyState — content', () => {
  it('renders the title', () => {
    renderWithTokens(<EmptyState title="No components yet" />);
    expect(screen.getByText('No components yet')).toHaveClass('lumo-empty-state__title');
  });

  it('titleAs promotes the title into a real heading', () => {
    renderWithTokens(<EmptyState title="No components yet" titleAs="h2" />);
    expect(screen.getByRole('heading', { level: 2, name: 'No components yet' })).toBeTruthy();
  });

  it('by default the title is a paragraph, not a heading', () => {
    renderWithTokens(<EmptyState title="No components yet" />);
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('description shows and can be turned off', () => {
    renderWithTokens(<EmptyState title="t" descriptionText="Add one to begin." />);
    expect(screen.getByText('Add one to begin.')).toBeInTheDocument();

    const { container } = renderWithTokens(
      <EmptyState title="t" description={false} descriptionText="hidden" />,
    );
    expect(container.querySelector('.lumo-empty-state__description')).toBeNull();
  });

  it('the action slot is shown by default and holds its children', () => {
    renderWithTokens(<EmptyState title="t"><button>Add</button></EmptyState>);
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('action={false} removes the slot, children and all', () => {
    const { container } = renderWithTokens(
      <EmptyState title="t" action={false}><button>Add</button></EmptyState>,
    );
    expect(container.querySelector('.lumo-empty-state__action')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add' })).toBeNull();
  });

  it('a supplied icon replaces the default one', () => {
    const { container } = renderWithTokens(
      <EmptyState title="t" icon={<svg data-testid="mine" />} />,
    );
    expect(container.querySelector('[data-testid="mine"]')).toBeTruthy();
    expect(container.querySelector('.lumo-empty-state__icon')).toBeNull();
  });
});
