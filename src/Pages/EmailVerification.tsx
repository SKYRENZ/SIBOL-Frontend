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

    if (user) {
      try {
        const parsed = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('user', JSON.stringify(parsed));
      } catch (e) {
        console.warn('Failed to parse SSO user on EmailVerification', e);
      }
    }

    if (token) {
      window.history.replaceState({}, '', location.pathname + (location.hash || ''));
    } else if (auth === 'fail') {
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  const {
    status,
    message,
    email,
    isResending,
    countdown,
    resendCooldown,
    resendMessage,
    topLogo,
    leftBg,
    leftLogo,
    handleResendEmail,
    goBackToLogin,
  } = useEmailVerification();

  const formatSeconds = (s: number) => String(s).padStart(2, '0');

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 mt-6 sm:mt-8">
              Verifying your email...
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Please wait while we verify your email address.
            </p>
            <StatusCard 
              type="info" 
              title="🔍 Checking verification token..." 
            />
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 animate-bounce">✅</div>
            <h2 className="text-xl sm:text-2xl font-bold text-green-600 mb-3 sm:mb-4">
              Email Verified Successfully!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Your email has been verified. Redirecting to admin approval...
            </p>
            
            <StatusCard 
              type="success" 
              title="🎉 Verification Complete!" 
              message="Taking you to the admin approval page..."
            >
              <CountdownProgress countdown={countdown} total={3} />
            </StatusCard>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">❌</div>
            <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-3 sm:mb-4">
              Email Verification Failed
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{message}</p>
            
            <StatusCard 
              type="error" 
              title="⚠️ The verification link may have expired or is invalid."
            />
            
            {email && (
              <StatusCard type="info" title="Need a new verification email?">
                {resendMessage && (
                  <div className={`mb-3 p-3 rounded-lg text-sm ${
                    resendMessage.includes('error') || resendMessage.includes('Network')
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {resendMessage}
                  </div>
                )}
                <ActionButton
                  onClick={handleResendEmail}
                  loading={isResending}
                  fullWidth
                  disabled={isResending || (resendCooldown ?? 0) > 0}
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </ActionButton>
                {resendCooldown > 0 && (
                  <div className="text-center mt-2">
                    <span className="text-sm text-gray-600">
                      Resend available in {formatSeconds(resendCooldown)}
                    </span>
                  </div>
                )}
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

      default:
        return (
          <div className="text-center">
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 animate-pulse">📧</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              Check Your Email
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-2">
              We've sent a verification email to
            </p>
            <p className="text-sm sm:text-base text-blue-600 font-semibold mb-4 sm:mb-6 break-words bg-blue-50 p-2 sm:p-3 rounded-lg">
              {email}
            </p>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              Please click the verification link in your email to continue.
            </p>
            
            <StatusCard 
              type="warning" 
              title="Check your inbox (and spam folder) for the verification email."
            />
            
            {email && (
              <StatusCard type="info" title="Didn't receive the email?">
                {resendMessage && (
                  <div className={`mb-3 p-3 rounded-lg text-sm ${
                    resendMessage.includes('error') || resendMessage.includes('Network')
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    {resendMessage}
                  </div>
                )}
                <div className="space-y-3 sm:space-y-4">
                  <ActionButton
                    onClick={handleResendEmail}
                    loading={isResending}
                    fullWidth
                    disabled={isResending || (resendCooldown ?? 0) > 0}
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </ActionButton>

                  {resendCooldown > 0 && (
                    <div className="text-center">
                      <span className="text-sm text-gray-600">
                        Resend available in <span className="font-bold text-blue-600">{formatSeconds(resendCooldown)}</span>
                      </span>
                    </div>
                  )}
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
      topLogo={topLogo}
    >
      {renderContent()}
    </AuthLayout>
  );
};

export default EmailVerification;