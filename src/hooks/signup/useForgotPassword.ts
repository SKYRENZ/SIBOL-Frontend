import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchJson } from '../../services/apiClient';

type Step = 'email' | 'verify' | 'reset' | 'done';

export function useForgotPassword(initialEmail = '') {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ✅ Get email and step from URL params
  const emailParam = searchParams.get('email');
  const stepParam = searchParams.get('step') as Step | null;
  
  // ✅ FIX: Initialize state with URL params immediately
  const [step, setStep] = useState<Step>(() => {
    // If step is in URL and is valid, use it
    if (stepParam && ['email', 'verify', 'reset', 'done'].includes(stepParam)) {
      return stepParam;
    }
    return 'email';
  });
  
  const [email, setEmail] = useState(() => emailParam || initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // ✅ Sync with URL params when they change
  useEffect(() => {
    if (emailParam && emailParam !== email) {
      setEmail(emailParam);
    }
    if (stepParam && stepParam !== step && ['email', 'verify', 'reset', 'done'].includes(stepParam)) {
      setStep(stepParam as Step);
    }
  }, [emailParam, stepParam]);

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
    setSearchParams({});
  }, [setSearchParams]);

  const sendResetRequest = useCallback(async () => {
    setError(null);
    setInfo(null);
    
    if (resendAvailableAt && Date.now() < resendAvailableAt) {
      return setError(`Please wait ${Math.ceil((resendAvailableAt - Date.now()) / 1000)}s before resending.`);
    }
    
    if (!emailValid) {
      return setError('Please enter a valid email address.');
    }
    
    setLoading(true);
    try {
      const data = await fetchJson('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      
      setInfo(data?.message || 'Reset code sent. Check your email.');
      setResendAvailableAt(Date.now() + COOLDOWN_SECONDS * 1000);
      setResendCooldown(COOLDOWN_SECONDS);
      setStep('verify');
      setSearchParams({ email, step: 'verify' });
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, emailValid, resendAvailableAt, setSearchParams]);

  const verifyCode = useCallback(async () => {
    setError(null);
    setInfo(null);
    
    if (!codeValid) {
      return setError('Code must be a 6-digit number.');
    }
    
    setLoading(true);
    try {
      const data = await fetchJson('/api/auth/verify-reset-code', {
        method: 'POST',
        body: JSON.stringify({ email, code })
      });
      
      setInfo(data?.message || 'Code verified. Enter your new password.');
      setStep('reset');
      
      // Update URL
      setSearchParams({ email, step: 'reset' });
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, code, codeValid, setSearchParams]);

  const submitNewPassword = useCallback(async () => {
    setError(null);
    setInfo(null);
    
    if (!passwordValid) {
      return setError('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.');
    }
    
    setLoading(true);
    try {
      const data = await fetchJson('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, newPassword })
      });
      
      setInfo(data?.message || 'Password reset successfully. You can now sign in with your new password.');
      setStep('done');
      
      // Update URL
      setSearchParams({ step: 'done' });
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, code, newPassword, passwordValid, setSearchParams]);

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