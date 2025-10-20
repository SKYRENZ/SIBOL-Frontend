import { useState, useCallback } from 'react';

type Step = 'email' | 'verify' | 'reset' | 'done';

export function useForgotPassword(initialEmail = '') {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

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
  }, []);

  const sendResetRequest = useCallback(async () => {
    setError(null);
    if (!emailValid) return setError('Please enter a valid email.');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to request reset');
      setInfo(data?.debugCode ? `Debug code: ${data.debugCode}` : 'Reset code sent. Check your email.');
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  }, [email, emailValid]);

  const verifyCode = useCallback(async () => {
    setError(null);
    if (!codeValid) return setError('Code must be a 6-digit number.');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || 'Invalid code');
      setInfo('Code verified. Enter your new password.');
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  }, [email, code, codeValid]);

  const submitNewPassword = useCallback(async () => {
    setError(null);
    if (!passwordValid) return setError('Password must be at least 8 chars and include upper, lower, number, and symbol.');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || 'Failed to reset password');
      setInfo('Password reset successfully. You can now sign in with your new password.');
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Server error');
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
    emailValid,
    codeValid,
    passwordValid,
    sendResetRequest,
    verifyCode,
    submitNewPassword,
    closeAndReset
  } as const;
}