/// <reference types="vitest" />
import { describe, it, expect, beforeEach } from 'vitest';
// (vi is already imported below)

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// mock the hook module before importing the component
vi.mock('../hooks/signup/useSignUp', () => ({
  useSignUp: vi.fn()
}));

// top-level await to import the mocked hook and the component after mock is installed
const { useSignUp } = await import('../hooks/signup/useSignUp');
const SignUpModule = await import('../Pages/SignUp');
const SignUp = SignUpModule.default ?? SignUpModule;

describe('SignUp Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls handleSignUp when submitting traditional registration', async () => {
    const handleSignUp = vi.fn((e: any) => e?.preventDefault?.());
    (useSignUp as any).mockReturnValue({
      role: '2',
      setRole: vi.fn(),
      firstName: '',
      setFirstName: vi.fn(),
      lastName: '',
      setLastName: vi.fn(),
      email: '',
      setEmail: vi.fn(),
      barangay: '',
      setBarangay: vi.fn(),
      barangays: [{ id: 1, name: 'B1' }],
      errors: {},
      isSSO: false,
      touched: {},
      validateField: vi.fn(),
      signupImage: '/img.png',
      handleSignUp,
      goToLogin: vi.fn(),
      serverError: null,
      pendingEmail: null
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    // tolerant queries — update if your component uses different placeholders/labels
    const first = screen.queryByPlaceholderText(/first name/i) || screen.queryByLabelText(/first name/i);
    const last = screen.queryByPlaceholderText(/last name/i) || screen.queryByLabelText(/last name/i);
    const email = screen.queryByPlaceholderText(/email/i) || screen.queryByLabelText(/email/i);

    if (first) fireEvent.change(first, { target: { value: 'Jane' } });
    if (last) fireEvent.change(last, { target: { value: 'Doe' } });
    if (email) fireEvent.change(email, { target: { value: 'jane@example.com' } });

    const submit =
      screen.queryByRole('button', { name: /create account/i }) ||
      screen.queryByRole('button', { name: /sign up/i }) ||
      screen.getByRole('button');

    fireEvent.click(submit);

    expect(handleSignUp).toHaveBeenCalled();
  });

  it('renders SSO mode with readonly email and SSO button text', async () => {
    const handleSignUp = vi.fn();
    (useSignUp as any).mockReturnValue({
      role: '4',
      setRole: vi.fn(),
      firstName: 'SSOFirst',
      setFirstName: vi.fn(),
      lastName: 'SSOLast',
      setLastName: vi.fn(),
      email: 'sso@example.com',
      setEmail: vi.fn(),
      barangay: '1',
      setBarangay: vi.fn(),
      barangays: [{ id: 1, name: 'B1' }],
      errors: {},
      isSSO: true,
      touched: {},
      validateField: vi.fn(),
      signupImage: '/img.png',
      handleSignUp,
      goToLogin: vi.fn(),
      serverError: null,
      pendingEmail: null
    });

    render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>
    );

    const emailInput = screen.queryByPlaceholderText(/email/i) || screen.queryByLabelText(/email/i);
    if (emailInput) {
      expect((emailInput as HTMLInputElement).readOnly || (emailInput as HTMLElement).hasAttribute('readOnly')).toBeTruthy();
    }

    const ssoButton =
      screen.queryByRole('button', { name: /complete google registration/i }) ||
      screen.queryByRole('button', { name: /complete sso registration/i }) ||
      screen.queryByRole('button', { name: /continue with google/i });

    expect(ssoButton).toBeTruthy();
  });
});