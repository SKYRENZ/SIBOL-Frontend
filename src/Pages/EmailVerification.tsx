import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'waiting'>('waiting');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');
  const usernameParam = searchParams.get('username');

  // Get the same images from SignIn/SignUp
  const topLogo = new URL('../assets/images/SIBOLOGOBULB.png', import.meta.url).href;
  const leftBg = new URL('../assets/images/TRASHBG.png', import.meta.url).href;
  const leftLogo = new URL('../assets/images/SIBOLWORDLOGO.png', import.meta.url).href;

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
  }, [token, emailParam, navigate]);

  // Countdown effect for redirect
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      // Redirect when countdown reaches 0
      const redirectUrl = `/admin-pending?email=${encodeURIComponent(email)}${usernameParam ? `&username=${encodeURIComponent(usernameParam)}` : ''}`;
      console.log('🔄 Redirecting to:', redirectUrl);
      navigate(redirectUrl);
    }
  }, [status, countdown, email, usernameParam, navigate]);

  const verifyEmailToken = async (token: string) => {
    try {
      console.log('🚀 Verifying token:', token);
      
      const response = await fetch(`/api/auth/verify-email/${token}`);
      console.log('📡 Verification response status:', response.status);
      
      const data = await response.json();
      console.log('📋 Verification response data:', data);

      if (data.success) {
        setStatus('success');
        setEmail(data.email);
        setMessage('Email verified successfully! Redirecting to admin approval...');
        // Countdown will start automatically via useEffect
      } else {
        console.log('❌ Verification failed:', data.error);
        setStatus('error');
        setMessage(data.error || 'Email verification failed');
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      setStatus('error');
      setMessage('Network error occurred while verifying email');
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      alert('Email address is required to resend verification');
      return;
    }

    try {
      setIsResending(true);
      console.log('📤 Resending verification email to:', email);
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('📋 Resend response:', data);

      if (data.success) {
        alert('Verification email resent! Please check your inbox.');
      } else {
        alert(`Failed to resend email: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Resend error:', error);
      alert('Network error occurred while resending email');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="mx-auto w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-8"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
            <div className="mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-sm">🔍 Checking verification token...</p>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="text-6xl mb-6 animate-bounce">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6">Your email has been verified. Redirecting to admin approval...</p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-green-700 mb-4">
                <p className="font-medium">🎉 Verification Complete!</p>
                <p className="text-sm mt-2">Taking you to the admin approval page...</p>
              </div>
              
              {/* Countdown and progress bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">Redirecting in {countdown}...</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-1000 ease-linear"
                    style={{width: `${((3 - countdown) / 3) * 100}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Email Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <p className="text-red-700 text-sm mb-4">
                ⚠️ The verification link may have expired or is invalid.
              </p>
            </div>
            
            {email && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <p className="text-gray-700 mb-4">Need a new verification email?</p>
                <button 
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isResending 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  onClick={handleResendEmail}
                  disabled={isResending}
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Resending...
                    </div>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </div>
            )}
            
            <button 
              className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
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
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <p className="text-yellow-700 text-sm mb-4">
                Check your inbox (and spam folder) for the verification email.
              </p>
            </div>
            
            {email && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <p className="text-gray-700 mb-4">Didn't receive the email?</p>
                <button 
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-4 ${
                    isResending 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  onClick={handleResendEmail}
                  disabled={isResending}
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Resending...
                    </div>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </div>
            )}
            
            <button 
              className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </div>
        );
    }
  };

  return (
    <div className="auth-shell min-h-screen flex">
      {/* Left Panel - Same as SignIn */}
      <div 
        className="auth-left flex-1 bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: `url(${leftBg})` }}
      >
        <div className="auth-left-content">
          <img className="auth-wordmark" src={leftLogo} alt="SIBOL" />
        </div>
      </div>

      {/* Right Panel - Verification Content */}
      <div className="auth-right flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            
            {/* Content */}
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;