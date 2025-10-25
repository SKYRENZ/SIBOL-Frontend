import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEmailVerification } from '../hooks/signup/useEmailVerification';
import AuthLayout from '../Components/verification/AuthLayout';
import LoadingSpinner from '../Components/verification/LoadingSpinner';
import StatusCard from '../Components/verification/StatusCard';
import ActionButton from '../Components/verification/ActionButton';
import CountdownProgress from '../Components/verification/CountdownProgress';

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token') || params.get('access_token');
    const user = params.get('user');
    const auth = params.get('auth');

    console.log('EmailVerification: raw params', { token, user, auth });

    if (token) {
      // persist token so verification hook / API can use it
      localStorage.setItem('token', token);
    }
    if (user) {
      try {
        const parsed = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('user', JSON.stringify(parsed));
      } catch (e) {
        console.warn('Failed to parse SSO user on EmailVerification', e);
      }
    }

    if (token) {
      // only clean URL here — DO NOT navigate away immediately.
      // let useEmailVerification() perform the verification and redirect on success.
      window.history.replaceState({}, '', location.pathname + (location.hash || ''));
      console.log('EmailVerification: token stored, awaiting verification hook');
    } else if (auth === 'fail') {
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  const {
    // State
    status,
    message,
    email,
    isResending,
    countdown,
    resendCooldown,
    
    // Assets
    topLogo,
    leftBg,
    leftLogo,
    
    // Actions
    handleResendEmail,
    goBackToLogin,
  } = useEmailVerification();

  // seconds-only format, padded to 2 digits
  const formatSeconds = (s: number) => String(s).padStart(2, '0');

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
            <StatusCard 
              type="info" 
              title="🔍 Checking verification token..." 
            />
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="text-6xl mb-6 animate-bounce">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6">Your email has been verified. Redirecting to admin approval...</p>
            
            <StatusCard type="success" title="🎉 Verification Complete!" message="Taking you to the admin approval page...">
              <CountdownProgress countdown={countdown} total={3} />
            </StatusCard>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Email Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <StatusCard 
              type="error" 
              title="⚠️ The verification link may have expired or is invalid."
            />
            
            {email && (
              <StatusCard type="info" title="Need a new verification email?">
                <ActionButton
                  onClick={handleResendEmail}
                  loading={isResending}
                  fullWidth
                >
                  Resend Verification Email
                </ActionButton>
              </StatusCard>
            )}
            
            <ActionButton
              onClick={goBackToLogin}
              variant="secondary"
              fullWidth
            >
              Back to Login
            </ActionButton>
          </div>
        );

      default: // waiting state
        return (
          <div className="text-center">
            <div className="text-6xl mb-6 animate-pulse">📧</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-2">We've sent a verification email to</p>
            <p className="text-blue-600 font-semibold mb-6 break-words bg-blue-50 p-3 rounded-lg">{email}</p>
            <p className="text-gray-600 mb-8">Please click the verification link in your email to continue.</p>
            
            <StatusCard 
              type="warning" 
              title="Check your inbox (and spam folder) for the verification email."
            />
            
            {email && (
              <StatusCard type="info" title="Didn't receive the email?">
                <div className="space-y-4">
                  <ActionButton
                    onClick={handleResendEmail}
                    loading={isResending}
                    fullWidth
                    disabled={isResending || (resendCooldown ?? 0) > 0}
                  >
                    Resend Verification Email
                  </ActionButton>

                  {/* Cooldown shown below the button (seconds only, bold) */}
                  <div className="text-center">
                    <span className="text-xl text-blue-600 font-bold mt-1 block" aria-live="polite">
                      {(resendCooldown ?? 0) > 0 ? formatSeconds(resendCooldown) : ''}
                    </span>
                  </div>
                </div>
              </StatusCard>
            )}
            
            <ActionButton
              onClick={goBackToLogin}
              variant="secondary"
              fullWidth
            >
              Back to Login
            </ActionButton>
          </div>
        );
    }
  };

  return (
    <AuthLayout 
      leftBg={leftBg} 
      leftLogo={leftLogo} 
    >
      {renderContent()}
    </AuthLayout>
  );
};

export default EmailVerification;