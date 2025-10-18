import React from 'react';
import { useEmailVerification } from '../hooks/useEmailVerification';

const EmailVerification: React.FC = () => {
  const {
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
  } = useEmailVerification();

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
              onClick={goBackToLogin}
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
              <p className="text-yellow-700 text-sm">
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
              onClick={goBackToLogin}
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