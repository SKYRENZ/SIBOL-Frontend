/// <reference types="vitest" />
import '@testing-library/jest-dom';
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// install mock before importing the real module
vi.mock('../hooks/signup/useEmailVerification', () => ({
  useEmailVerification: vi.fn()
}));

// dynamically import mocked hook and page after mock is installed
const { useEmailVerification } = await import('../hooks/signup/useEmailVerification');
const EmailVerificationModule = await import('../Pages/EmailVerification');
const EmailVerification = EmailVerificationModule.default ?? EmailVerificationModule;

describe('EmailVerification page', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders waiting state with email', () => {
    (useEmailVerification as any).mockReturnValue({
      status: 'waiting',
      message: '',
      email: 'test@example.com',
      isResending: false,
      countdown: 3,
      topLogo: '',
      leftBg: '',
      leftLogo: '',
      handleResendEmail: () => {},
      goBackToLogin: () => {}
    });

    render(
      <MemoryRouter>
        <EmailVerification />
      </MemoryRouter>
    );

    expect(screen.getByText(/Check Your Email/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it('renders success state and shows countdown', () => {
    (useEmailVerification as any).mockReturnValue({
      status: 'success',
      message: '',
      email: 'test@example.com',
      isResending: false,
      countdown: 2,
      topLogo: '',
      leftBg: '',
      leftLogo: '',
      handleResendEmail: () => {},
      goBackToLogin: () => {}
    });

    render(
      <MemoryRouter>
        <EmailVerification />
      </MemoryRouter>
    );

    expect(screen.getByText(/Email Verified Successfully/i)).toBeInTheDocument();
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });
});