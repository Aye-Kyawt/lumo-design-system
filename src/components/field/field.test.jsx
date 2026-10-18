/**
 * Field — Figma set 141:3144, states default / error / disabled / Type.
 *
 * `state="Type"` is spelled exactly as the Figma set spells it; the naming is
 * recorded in docs/naming-conflicts.md rather than tidied up here.
 *
 * The thing worth testing hardest is the label/control association: Field
 * renders the label and the caller supplies the control, so `controlId` is
 * what ties them together and a broken tie is invisible on screen.
 */
import { describe, it, expect } from 'vitest';
import { renderWithTokens, screen } from '../../test/renderWithTokens.jsx';
import { Field } from './field.jsx';

const STATES = ['default', 'error', 'disabled', 'Type'];

describe('Field — states', () => {
  // The state is carried on `data-state`, not as a modifier class -- field.css
  // hangs its state styling off the attribute. Asserting a `--state` class here
  // would pass against a component that had never implemented the state at all.
  for (const state of STATES) {
    it(`state=${state} is exposed on data-state`, () => {
      const { container } = renderWithTokens(
        <Field state={state} label="Email"><input /></Field>,
      );
      expect(container.querySelector('.lumo-field')).toHaveAttribute('data-state', state);
    });
  }

  it('defaults to the default state', () => {
    const { container } = renderWithTokens(<Field label="Email"><input /></Field>);
    expect(container.querySelector('.lumo-field')).toHaveAttribute('data-state', 'default');
  });

  it('an unknown state falls back to default rather than rendering unstyled', () => {
    const { container } = renderWithTokens(
      <Field state="nonsense" label="Email"><input /></Field>,
    );
    expect(container.querySelector('.lumo-field')).toHaveAttribute('data-state', 'default');
  });
});

describe('Field — label and control association', () => {
  it('controlId ties the label to the caller own control', () => {
    renderWithTokens(
      <Field label="Email" controlId="email-input">
        <input id="email-input" />
      </Field>,
    );
    // getByLabelText only resolves when the association is real.
    expect(screen.getByLabelText(/Email/)).toBe(document.getElementById('email-input'));
  });

  it('renders exactly one label element', () => {
    const { container } = renderWithTokens(
      <Field label="Email" controlId="e"><input id="e" /></Field>,
    );
    expect(container.querySelectorAll('label')).toHaveLength(1);
  });

  it('renders whatever control it is given, and nothing when given none', () => {
    const { container } = renderWithTokens(<Field label="Email" />);
    expect(container.querySelector('input')).toBeNull();
    // The control slot still exists -- Field renders the frame, not the control.
    expect(container.querySelector('.lumo-field__control')).toBeTruthy();
  });

  it('omits htmlFor entirely when no control has been named', () => {
    const { container } = renderWithTokens(<Field label="Email"><input /></Field>);
    expect(container.querySelector('label')).not.toHaveAttribute('for');
  });
});

describe('Field — required', () => {
  it('the required marker is decoration, hidden from assistive tech', () => {
    const { container } = renderWithTokens(
      <Field label="Email" required><input /></Field>,
    );
    const marker = container.querySelector('.lumo-field__required');
    expect(marker).toBeTruthy();
    expect(marker).toHaveAttribute('aria-hidden', 'true');
    // The asterisk is decoration; this is the word actually announced.
    expect(container.querySelector('.lumo-field__srOnly')).toHaveTextContent('required');
  });

  it('no marker when not required', () => {
    const { container } = renderWithTokens(<Field label="Email"><input /></Field>);
    expect(container.querySelector('.lumo-field__required')).toBeNull();
  });
});

describe('Field — helper text', () => {
  it('helper text is rendered and carries an id', () => {
    const { container } = renderWithTokens(
      <Field label="Email" helperText="We never share it."><input /></Field>,
    );
    expect(container.querySelector('.lumo-field__helper')).toHaveTextContent(
      'We never share it.',
    );
    // The id sits on the row, which is what a caller points aria-describedby at.
    expect(container.querySelector('.lumo-field__helperRow').id).toBeTruthy();
  });

  it('helper={false} removes it', () => {
    const { container } = renderWithTokens(
      <Field label="Email" helper={false} helperText="hidden"><input /></Field>,
    );
    expect(container.querySelector('.lumo-field__helperRow')).toBeNull();
    expect(container.querySelector('.lumo-field__helper')).toBeNull();
  });

  it('in the error state the helper becomes a live alert', () => {
    renderWithTokens(
      <Field label="Email" state="error" helperText="That address is not valid.">
        <input />
      </Field>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('That address is not valid.');
  });

  it('outside the error state it is not an alert', () => {
    renderWithTokens(
      <Field label="Email" helperText="We never share it."><input /></Field>,
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('Field — the error icon', () => {
  it('appears only in the error state', () => {
    const { container: err } = renderWithTokens(
      <Field label="Email" state="error"><input /></Field>,
    );
    expect(err.querySelector('.lumo-field__icon')).toBeTruthy();

    const { container: ok } = renderWithTokens(
      <Field label="Email" state="default"><input /></Field>,
    );
    expect(ok.querySelector('.lumo-field__icon')).toBeNull();
  });
});
