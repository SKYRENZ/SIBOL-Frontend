import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchJson } from '../../services/apiClient';

export const useEmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'waiting'>('waiting');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const COOLDOWN_SECONDS = 60;
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const usernameParam = searchParams.get('username');

  const topLogo = new URL('../../assets/images/SIBOLOGOBULB.png', import.meta.url).href;
  const leftBg = new URL('../../assets/images/TRASHBG.png', import.meta.url).href;
  const leftLogo = new URL('../../assets/images/SIBOLWORDLOGO.png', import.meta.url).href;

  const verifyEmailToken = useCallback(async (token: string) => {
    try {
      const data = await fetchJson(`/api/auth/verify-email/${token}`);

      if (data.success) {
        setStatus('success');
        setEmail(data.email);
        setMessage('Email verified successfully! Redirecting to admin approval...');
      } else {
        setStatus('error');
        setMessage(data.error || 'Email verification failed');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error?.message ?? 'Network error occurred while verifying email');
    }
  }, []);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      setStatus('loading');
      setTimeout(() => {
        verifyEmailToken(token);
      }, 500);
    } else if (!emailParam) {
      navigate('/login');
    } else {
      setStatus('waiting');
    }
  }, [token, emailParam, usernameParam, navigate, verifyEmailToken]);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      const redirectUrl = `/pending-approval?email=${encodeURIComponent(email)}${usernameParam ? `&username=${encodeURIComponent(usernameParam)}` : ''}`;
      navigate(redirectUrl);
    }
  }, [status, countdown, email, usernameParam, navigate]);

  const handleResendEmail = async () => {
    if (resendAvailableAt && Date.now() < resendAvailableAt) {
      return;
    }
    if (!email) {
      setResendMessage('Email address is required to resend verification');
      return;
    }
    try {
      setIsResending(true);
      setResendMessage(null);
      const data = await fetchJson('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setResendAvailableAt(Date.now() + COOLDOWN_SECONDS * 1000);
      setResendCooldown(COOLDOWN_SECONDS);
      setResendMessage(data?.message || 'Verification email resent! Please check your inbox.');
    } catch (error: any) {
      setResendMessage(error?.message ?? 'Network error occurred while resending email');
    } finally {
      setIsResending(false);
    }
  };

  const goBackToLogin = () => {
    navigate('/login');
  };

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

  return {
    status,
    message,
    email,
    isResending,
    countdown,
    resendCooldown,
    resendMessage,
    canResend: resendCooldown === 0,
    topLogo,
    leftBg,
    leftLogo,
    handleResendEmail,
    goBackToLogin,
  };
};