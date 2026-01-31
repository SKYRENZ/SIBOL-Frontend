import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { verifyEmail, resendVerification, clearError, clearSuccess, setUser } from '../store/slices/authSlice';
import AuthLayout from '../Components/verification/AuthLayout';
import LoadingSpinner from '../Components/verification/LoadingSpinner';
import StatusCard from '../Components/verification/StatusCard';
import ActionButton from '../Components/verification/ActionButton';
import CountdownProgress from '../Components/verification/CountdownProgress';

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();

  // ✅ Redux state
  const { isLoading, error: authError, successMessage } = useAppSelector((state) => state.auth);

  // ✅ Local state
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'waiting'>('waiting');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [hasVerified, setHasVerified] = useState(false); // ✅ NEW: Prevent multiple verifications

  const COOLDOWN_SECONDS = 60;

  const topLogo = new URL('../assets/images/SIBOLOGOBULB.png', import.meta.url).href;
  const leftBg = new URL('../assets/images/TRASHBG.png', import.meta.url).href;
  const leftLogo = new URL('../assets/images/SIBOLWORDLOGO.png', import.meta.url).href;

  // ✅ Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // ✅ Extract email and username from URL
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const usernameParam = searchParams.get('username');
    
    if (emailParam) setEmail(emailParam);
    if (usernameParam) setUsername(usernameParam);
    
    // ✅ CHANGED: Don't redirect if there's a token
    const token = searchParams.get('token') || searchParams.get('access_token');
    if (!emailParam && !token) {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  // ✅ FIX: Handle verification token from URL
  useEffect(() => {
    // ✅ Don't run if already verified
    if (hasVerified) return;

    const params = new URLSearchParams(location.search);
    const token = params.get('token') || params.get('access_token');
    const user = params.get('user');
    const auth = params.get('auth');

    console.log('📧 EmailVerification params:', { token: token ? 'present' : 'none', auth, user: user ? 'present' : 'none' });

    if (user) {
      try {
        const parsed = JSON.parse(decodeURIComponent(user));
        dispatch(setUser(parsed)); // populate Redux instead of localStorage
      } catch (e) {
        console.warn('Failed to parse SSO user', e);
      }
    }

    // ✅ FIX: Only redirect on explicit auth=fail, not when token exists
    if (auth === 'fail' && !token) {
      console.log('❌ Auth failed, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    if (token) {
      console.log('✅ Token found, starting verification...');
      setHasVerified(true); // ✅ Mark as verified
      
      // ✅ FIX: Don't clean URL yet - wait for verification to complete
      setStatus('loading');
      
      // Add small delay to show loading state
      setTimeout(async () => {
        try {
          const result = await dispatch(verifyEmail(token)).unwrap();
          console.log('✅ Verification successful:', result);
          setStatus('success');
          setEmail(result.email || email);
          
          // ✅ NOW clean the URL after successful verification
          window.history.replaceState({}, '', location.pathname + `?email=${encodeURIComponent(result.email || email)}${username ? `&username=${encodeURIComponent(username)}` : ''}`);
        } catch (error) {
          console.error('❌ Verification failed:', error);
          setStatus('error');
          
          // Clean URL on error too
          window.history.replaceState({}, '', location.pathname + (email ? `?email=${encodeURIComponent(email)}` : ''));
        }
      }, 500);
    }
  }, [location, navigate, dispatch, email, username, hasVerified]);

  // ✅ Countdown after success
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      const redirectUrl = `/pending-approval?email=${encodeURIComponent(email)}${
        username ? `&username=${encodeURIComponent(username)}` : ''
      }`;
      navigate(redirectUrl);
    }
  }, [status, countdown, email, username, navigate]);

  // ✅ Resend cooldown timer
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

  const handleResendEmail = async () => {
    if (resendAvailableAt && Date.now() < resendAvailableAt) {
      return;
    }
    
    if (!email) {
      return;
    }

    try {
      await dispatch(resendVerification(email)).unwrap();
      setResendAvailableAt(Date.now() + COOLDOWN_SECONDS * 1000);
      setResendCooldown(COOLDOWN_SECONDS);
    } catch (error) {
      // Error is in Redux state
    }
  };

  const goBackToLogin = () => {
    navigate('/login');
  };

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
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {authError || 'The verification link may have expired or is invalid.'}
            </p>
            
            <StatusCard 
              type="error" 
              title="⚠️ The verification link may have expired or is invalid."
            />
            
            {email && (
              <StatusCard type="info" title="Need a new verification email?">
                {successMessage && (
                  <div className="mb-3 p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
                    {successMessage}
                  </div>
                )}
                {authError && !successMessage && (
                  <div className="mb-3 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                    {authError}
                  </div>
                )}
                <ActionButton
                  onClick={handleResendEmail}
                  loading={isLoading}
                  fullWidth
                  disabled={isLoading || resendCooldown > 0}
                >
                  {isLoading ? 'Sending...' : 'Resend Verification Email'}
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
                {successMessage && (
                  <div className="mb-3 p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200">
                    {successMessage}
                  </div>
                )}
                {authError && !successMessage && (
                  <div className="mb-3 p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
                    {authError}
                  </div>
                )}
                <div className="space-y-3 sm:space-y-4">
                  <ActionButton
                    onClick={handleResendEmail}
                    loading={isLoading}
                    fullWidth
                    disabled={isLoading || resendCooldown > 0}
                  >
                    {isLoading ? 'Sending...' : 'Resend Verification Email'}
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