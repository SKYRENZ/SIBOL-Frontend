/// <reference types="vitest" />
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, afterEach } from 'vitest';

// mock API client before importing the modal/hook
vi.mock('../services/apiClient', () => ({
  fetchJson: vi.fn()
}));

// dynamically import mocked fetchJson and the modal after mock is installed
const { fetchJson } = await import('../services/apiClient');
const ModalModule = await import('../Components/verification/ForgotPasswordModal');
const ForgotPasswordModal = ModalModule.default ?? ModalModule;

describe('ForgotPasswordModal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends reset request and shows verify (OTP) inputs', async () => {
    (fetchJson as any).mockResolvedValueOnce({ debugCode: '123456' });

    render(<ForgotPasswordModal open={true} onClose={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    await userEvent.type(emailInput, 'test@example.com');

    const sendBtn = screen.getByRole('button', { name: /send reset code/i });
    await userEvent.click(sendBtn);

    await waitFor(() => {
      expect(fetchJson).toHaveBeenCalledWith('/api/auth/forgot-password', expect.objectContaining({ method: 'POST' }));
    });

    // OTP inputs appear (aria-label "Digit 1" etc.)
    expect(screen.getByLabelText('Digit 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 6')).toBeInTheDocument();
  });

  it('completes full flow: verify code -> reset password -> shows done message', async () => {
    // order: sendResetRequest, verifyCode, submitNewPassword
    (fetchJson as any).mockResolvedValueOnce({}) // send reset
      .mockResolvedValueOnce({}) // verify code
      .mockResolvedValueOnce({}); // reset password

    const onClose = vi.fn();
    render(<ForgotPasswordModal open={true} onClose={onClose} />);

    // send reset
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send reset code/i }));

    await waitFor(() => expect(fetchJson).toHaveBeenCalledWith('/api/auth/forgot-password', expect.any(Object)));

    // fill OTP digits
    const digits = ['1','2','3','4','5','6'];
    for (let i = 0; i < digits.length; i++) {
      const input = screen.getByLabelText(`Digit ${i + 1}`);
      await userEvent.type(input, digits[i]);
    }

    // verify
    await userEvent.click(screen.getByRole('button', { name: /verify code/i }));
    await waitFor(() => expect(fetchJson).toHaveBeenCalledWith('/api/auth/verify-reset-code', expect.any(Object)));

    // new password step appears
    expect(screen.getByPlaceholderText(/New password/i)).toBeInTheDocument();

    // fill new password and confirm
    await userEvent.type(screen.getByPlaceholderText(/New password/i), 'Aa1!strong');
    await userEvent.type(screen.getByPlaceholderText(/Confirm password/i), 'Aa1!strong');

    // submit reset
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(fetchJson).toHaveBeenCalledWith('/api/auth/reset-password', expect.any(Object));
    });

    // done message shown
    expect(screen.getByText(/Your password was reset successfully/i)).toBeInTheDocument();
  });
});