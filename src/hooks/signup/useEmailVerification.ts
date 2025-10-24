import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchJson } from '../../services/apiClient';

export const useEmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'waiting'>('waiting');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // URL params
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const usernameParam = searchParams.get('username');

  // Assets
  const topLogo = new URL('../assets/images/SIBOLOGOBULB.png', import.meta.url).href;
  const leftBg = new URL('../assets/images/TRASHBG.png', import.meta.url).href;
  const leftLogo = new URL('../assets/images/SIBOLWORDLOGO.png', import.meta.url).href;

  // Verify email token function - use useCallback to prevent recreation
  const verifyEmailToken = useCallback(async (token: string) => {
    try {
      console.log('🚀 Verifying token:', token);
      const data = await fetchJson(`/api/auth/verify-email/${token}`);
      console.log('📋 Verification response data:', data);

      if (data.success) {
        setStatus('success');
        setEmail(data.email);
        setMessage('Email verified successfully! Redirecting to admin approval...');
      } else {
        setStatus('error');
        setMessage(data.error || 'Email verification failed');
      }
    } catch (error: any) {
      console.error('❌ Verification error:', error);
      setStatus('error');
      setMessage(error?.message ?? 'Network error occurred while verifying email');
    }
  }, []);

  // Initialize from URL params and handle verification
  useEffect(() => {
    console.log('📋 EmailVerification - URL params:', {
      token,
      emailParam,
      usernameParam
    });

    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      // If token is present, start verification immediately with loading state
      console.log('🔍 Token found, starting verification...');
      setStatus('loading');
      // Small delay to show the loading state
      setTimeout(() => {
        verifyEmailToken(token);
      }, 500);
    } else if (!emailParam) {
      // If no token and no email, redirect to login
      console.log('❌ No token or email found, redirecting to login');
      navigate('/login');
    } else {
      // Show waiting state if email is present but no token
      console.log('📧 Email found, showing waiting state');
      setStatus('waiting');
    }
  }, [token, emailParam, usernameParam, navigate, verifyEmailToken]); // Added verifyEmailToken to deps

  // Countdown effect for redirect
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      // Redirect when countdown reaches 0
      const redirectUrl = `/pending-approval?email=${encodeURIComponent(email)}${usernameParam ? `&username=${encodeURIComponent(usernameParam)}` : ''}`;
      console.log('🔄 Redirecting to:', redirectUrl);
      navigate(redirectUrl);
    }
  }, [status, countdown, email, usernameParam, navigate]);

  // Resend verification email function
  const handleResendEmail = async () => {
    if (!email) {
      alert('Email address is required to resend verification');
      return;
    }
    try {
      setIsResending(true);
      console.log('📤 Resending verification email to:', email);
      const data = await fetchJson('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      alert(data?.message || 'Verification email resent! Please check your inbox.');
    } catch (error: any) {
      console.error('❌ Resend error:', error);
      alert(error?.message ?? 'Network error occurred while resending email');
    } finally {
      setIsResending(false);
    }
  };

  // Navigate back to login
  const goBackToLogin = () => {
    navigate('/login');
  };

  return {
    // State
    status,
    message,
    email,
    isResending,
    countdown,
    
    // Assets
    topLogo,
    leftBg,
    leftLogo,
    
    // Actions
    handleResendEmail,
    goBackToLogin,
  };
};