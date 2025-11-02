import { useState, useCallback, useEffect } from 'react';
import { fetchJson } from '../../services/apiClient';

type Step = 'email' | 'verify' | 'reset' | 'done';

export function useForgotPassword(initialEmail = '') {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Resend cooldown logic
  const COOLDOWN_SECONDS = 60;
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  useEffect(() => {
    if (!resendAvailableAt) {
      setResendCooldown(0);
      return;
    }

    const update = () => {
      const remaining = Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000));
      setResendCooldown(remaining);
    };

    update();
    const id = window.setInterval(() => {
      update();
      if ((resendAvailableAt ?? 0) - Date.now() <= 0) {
        clearInterval(id);
        setResendAvailableAt(null);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [resendAvailableAt]);

  const emailValid = !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const codeValid = /^\d{6}$/.test(code);
  const passwordValid = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}/.test(newPassword);

  const resetState = useCallback(() => {
    setStep('email');
    setEmail('');
    setCode('');
    setNewPassword('');
    setError(null);
    setInfo(null);
    setLoading(false);
    setResendAvailableAt(null);
    setResendCooldown(0);
  }, []);

  const sendResetRequest = useCallback(async () => {
    setError(null);
    // prevent resending while cooldown active
    if (resendAvailableAt && Date.now() < resendAvailableAt) {
      return setError(`Please wait ${Math.ceil((resendAvailableAt - Date.now()) / 1000)}s before resending.`);
    }
    if (!emailValid) return setError('Please enter a valid email.');
    setLoading(true);
    try {
      const data = await fetchJson('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setInfo(data?.debugCode ? `Debug code: ${data.debugCode}` : 'Reset code sent. Check your email.');
      // start cooldown
      setResendAvailableAt(Date.now() + COOLDOWN_SECONDS * 1000);
      setResendCooldown(COOLDOWN_SECONDS);
      setStep('verify');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  }, [email, emailValid, resendAvailableAt]);

  const verifyCode = useCallback(async () => {
    setError(null);
    if (!codeValid) return setError('Code must be a 6-digit number.');
    setLoading(true);
    try {
      await fetchJson('/api/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ email, code })
      });
      setInfo('Code verified. Enter your new password.');
      setStep('reset');
    } catch (err: any) {
      setError(err?.message ?? 'Invalid code');
    } finally {
      setLoading(false);
    }
  }, [email, code, codeValid]);

  const submitNewPassword = useCallback(async () => {
    setError(null);
    if (!passwordValid) return setError('Password must be at least 8 chars and include upper, lower, number, and symbol.');
    setLoading(true);
    try {
      await fetchJson('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, newPassword })
      });
      setInfo('Password reset successfully. You can now sign in with your new password.');
      setStep('done');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }, [email, code, newPassword, passwordValid]);

  const closeAndReset = useCallback(() => {
    resetState();
  }, [resetState]);

  return {
    step,
    setStep,
    email,
    setEmail,
    code,
    setCode,
    newPassword,
    setNewPassword,
    loading,
    error,
    info,
    resendCooldown,
    canResend: resendCooldown === 0,
    emailValid,
    codeValid,
    passwordValid,
    sendResetRequest,
    verifyCode,
    submitNewPassword,
    closeAndReset
  } as const;
}