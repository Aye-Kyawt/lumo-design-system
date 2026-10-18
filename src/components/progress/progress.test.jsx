/**
 * Progress — four statuses, two sizes.
 *
 * `percent` is a code-only prop: Figma's `Value` is the boolean that shows the
 * percentage text, so the number needed a different name
 * (docs/naming-conflicts.md). The accessibility shape is the thing worth
 * guarding: role="progressbar" sits on the TRACK, not the wrapper, because a
 * progressbar's contents are not exposed to assistive tech and putting it on
 * the wrapper would swallow the label and the value text.
 */
import { describe, it, expect } from 'vitest';
import { renderWithTokens, screen } from '../../test/renderWithTokens.jsx';
import { Progress } from './progress.jsx';

const STATUSES = ['brand', 'positive', 'warning', 'negative'];

describe('Progress — statuses and sizes', () => {
  for (const status of STATUSES) {
    it(`status=${status} renders its class`, () => {
      const { container } = renderWithTokens(<Progress status={status} />);
      expect(container.querySelector(`.lumo-progress--${status}`)).toBeTruthy();
    });
  }

  for (const size of ['sm', 'md']) {
    it(`size=${size} renders its class`, () => {
      const { container } = renderWithTokens(<Progress size={size} />);
      expect(container.querySelector(`.lumo-progress--${size}`)).toBeTruthy();
    });
  }

  it('unknown values fall back to brand and sm', () => {
    const { container } = renderWithTokens(<Progress status="plaid" size="enormous" />);
    expect(container.querySelector('.lumo-progress--brand')).toBeTruthy();
    expect(container.querySelector('.lumo-progress--sm')).toBeTruthy();
  });
});

describe('Progress — the accessibility contract', () => {
  it('role=progressbar is on the track, not the wrapper', () => {
    const { container } = renderWithTokens(<Progress />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveClass('lumo-progress__track');
    expect(container.querySelector('.lumo-progress')).not.toHaveAttribute('role');
  });

  it('carries valuenow, valuemin and valuemax', () => {
    renderWithTokens(<Progress percent={40} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('with a label it is named by reference, not by aria-label', () => {
    renderWithTokens(<Progress labelText="Commercial strategy" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-labelledby');
    expect(bar).not.toHaveAttribute('aria-label');
    const labelId = bar.getAttribute('aria-labelledby');
    expect(document.getElementById(labelId)).toHaveTextContent('Commercial strategy');
  });

  it('with no label it falls back to aria-label so the bar is still named', () => {
    renderWithTokens(<Progress label={false} labelText="Commercial strategy" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-label', 'Commercial strategy');
    expect(bar).not.toHaveAttribute('aria-labelledby');
  });
});

describe('Progress — percent is clamped', () => {
  it('clamps above 100 and below 0', () => {
    renderWithTokens(<Progress percent={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');

    renderWithTokens(<Progress percent={-20} />);
    expect(screen.getAllByRole('progressbar')[1]).toHaveAttribute('aria-valuenow', '0');
  });

  it('keeps a value inside the range untouched', () => {
    renderWithTokens(<Progress percent={0} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('Progress — label and value text', () => {
  it('label={false} removes the label text', () => {
    const { container } = renderWithTokens(<Progress label={false} />);
    expect(container.querySelector('.lumo-progress__label')).toBeNull();
  });

  it('value={false} removes the value text', () => {
    const { container } = renderWithTokens(<Progress value={false} />);
    expect(container.querySelector('.lumo-progress__value')).toBeNull();
  });
});
