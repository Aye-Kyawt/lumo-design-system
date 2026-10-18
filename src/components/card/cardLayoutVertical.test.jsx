/**
 * CardLayoutVertical — Figma node 63:98. The default arrangement, and the one
 * subcomponent that is public: Card's `children` IS the layout slot, so a
 * consumer cannot use Card without supplying this. CardHeader and CardFooter
 * are driven through it and stay internal (docs/public-api.md).
 */
import { describe, it, expect } from 'vitest';
import { renderWithTokens, screen } from '../../test/renderWithTokens.jsx';
import { CardLayoutVertical } from './cardLayoutVertical.jsx';

describe('CardLayoutVertical — the three regions', () => {
  it('shows the header by default and hides the footer by default', () => {
    const { container } = renderWithTokens(<CardLayoutVertical body={<p>body</p>} />);
    expect(container.querySelector('.lumo-card-header')).toBeTruthy();
    expect(container.querySelector('.lumo-card-footer')).toBeNull();
  });

  it('header={false} removes the header', () => {
    const { container } = renderWithTokens(
      <CardLayoutVertical header={false} body={<p>body</p>} />,
    );
    expect(container.querySelector('.lumo-card-header')).toBeNull();
  });

  it('footer renders only when asked, and holds what it is given', () => {
    const { container } = renderWithTokens(
      <CardLayoutVertical body={<p>body</p>} footer footerContent={<button>Act</button>} />,
    );
    expect(container.querySelector('.lumo-card-footer')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument();
  });

  it('renders the body it is given', () => {
    renderWithTokens(<CardLayoutVertical body={<p>the body</p>} />);
    expect(screen.getByText('the body')).toBeInTheDocument();
  });
});

describe('CardLayoutVertical — headerProps is the path to the internal header', () => {
  it('forwards a title through to CardHeader', () => {
    renderWithTokens(
      <CardLayoutVertical headerProps={{ title: 'Release 0.2.0' }} body={<p>b</p>} />,
    );
    expect(screen.getByText('Release 0.2.0')).toBeInTheDocument();
  });

  it('forwards subtitle={false} through to CardHeader', () => {
    const { container } = renderWithTokens(
      <CardLayoutVertical
        headerProps={{ title: 'T', subtitle: false }}
        body={<p>b</p>}
      />,
    );
    expect(container.querySelector('.lumo-card-header__subtitle')).toBeNull();
  });
});
