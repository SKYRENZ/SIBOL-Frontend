import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useForgotPassword } from '../hooks/signup/useForgotPassword';
import AuthLeftPanel from '../Components/common/AuthLeftPanel';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const {
    step,
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
    canResend,
    emailValid,
    codeValid,
    passwordValid,
    sendResetRequest,
    verifyCode,
    submitNewPassword,
  } = useForgotPassword();

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const leftBg = new URL('../assets/images/TRASHBG.png', import.meta.url).href;
  const leftLogo = new URL('../assets/images/SIBOLWORDLOGO.png', import.meta.url).href;
  const topLogo = new URL('../assets/images/SIBOLOGOBULB.png', import.meta.url).href;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'email') {
      await sendResetRequest();
    } else if (step === 'verify') {
      await verifyCode();
    } else if (step === 'reset') {
      if (newPassword !== confirmPassword) {
        return;
      }
      await submitNewPassword();
    }
  };

  const handleDone = () => {
    navigate('/login');
  };

  // Password strength calculation
  const hasUpper = /[A-Z]/.test(newPassword || '');
  const hasLower = /[a-z]/.test(newPassword || '');
  const hasNumber = /\d/.test(newPassword || '');
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword || '');
  const hasLength = (newPassword || '').length >= 8;
  const score = [hasUpper, hasLower, hasNumber, hasSymbol, hasLength].filter(Boolean).length;

  const strengthLabel = 
    score <= 1 ? 'Very weak' : 
    score === 2 ? 'Weak' : 
    score === 3 ? 'Medium' : 
    score === 4 ? 'Strong' : 
    'Very strong';

  const strengthColor = 
    score <= 1 ? '#EF4444' : 
    score === 2 ? '#F87171' : 
    score === 3 ? '#FBBF24' : 
    score === 4 ? '#34D399' : 
    '#10B981';

  return (
    <div className="min-h-screen w-full bg-white lg:grid lg:grid-cols-2">
      {/* Left Panel */}
      <AuthLeftPanel backgroundImage={leftBg} logoImage={leftLogo} />

      {/* Right Panel */}
      <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
          {/* Logo - Show on mobile/tablet */}
          <div className="text-center mb-6 lg:hidden">
            <img className="mx-auto w-12 sm:w-14 md:w-16 h-auto" src={topLogo} alt="SIBOL" />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-3">
            {step === 'email' && 'Forgot Password?'}
            {step === 'verify' && 'Verify Code'}
            {step === 'reset' && 'Reset Password'}
            {step === 'done' && 'Password Reset Successful'}
          </h1>

          {/* Subtitle */}
          <p className="text-center text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
            {step === 'email' && "Enter your email address and we'll send you a verification code."}
            {step === 'verify' && 'Enter the 6-digit code sent to your email.'}
            {step === 'reset' && 'Enter your new password.'}
            {step === 'done' && 'Your password has been reset successfully.'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Info Message */}
          {info && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-700 text-sm">{info}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Step 1: Email Input */}
            {step === 'email' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-3 border rounded-lg text-base outline-none transition-all ${
                    !emailValid && email
                      ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                      : 'border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100'
                  }`}
                  disabled={loading}
                />
              </div>
            )}

            {/* Step 2: OTP Code Input */}
            {step === 'verify' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                  Verification Code
                </label>
                
                <div className="flex justify-center gap-2 mb-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={code[i] || ''}
                      onChange={(e) => {
                        const digit = e.target.value.replace(/\D/g, '');
                        const newCode = code.split('');
                        newCode[i] = digit;
                        setCode(newCode.join(''));
                        
                        // Auto-focus next input if digit entered
                        if (digit && i < 5) {
                          const nextInput = e.target.nextElementSibling as HTMLInputElement;
                          nextInput?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace') {
                          e.preventDefault();
                          const newCode = code.split('');
                          
                          // If current box has a digit, clear it
                          if (code[i]) {
                            newCode[i] = '';
                            setCode(newCode.join(''));
                          } 
                          // If current box is empty, move to previous and clear it
                          else if (i > 0) {
                            newCode[i - 1] = '';
                            setCode(newCode.join(''));
                            const prevInput = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                            prevInput?.focus();
                          }
                        }
                      }}
                      className="w-12 h-12 text-center text-lg font-medium border border-gray-200 rounded-lg focus:outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100"
                      disabled={loading}
                    />
                  ))}
                </div>

                {/* Resend Code */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-gray-600">Didn't get an email?</span>
                  <button
                    type="button"
                    onClick={sendResetRequest}
                    disabled={!canResend || loading}
                    className={`bg-transparent border-0 text-green-600 font-medium hover:text-green-700 hover:underline focus:outline-none ${
                      (!canResend || loading) && 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {canResend ? 'Resend Code' : `Resend in ${resendCooldown}s`}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: New Password Input */}
            {step === 'reset' && (
              <div className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg text-base outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-0 text-gray-600 hover:text-gray-800 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg text-base outline-none focus:border-green-300 focus:ring-2 focus:ring-green-100"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-0 text-gray-600 hover:text-gray-800 focus:outline-none cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-2">
                    {newPassword === confirmPassword ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}

                {/* Password Strength Bar */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-gray-200 flex gap-1 overflow-hidden">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 transition-colors"
                          style={{
                            backgroundColor: i < score ? strengthColor : '#E5E7EB'
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-700 min-w-[80px]">
                      {strengthLabel}
                    </span>
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {hasLength ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-xs ${hasLength ? 'text-gray-800' : 'text-gray-500'}`}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasUpper ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-xs ${hasUpper ? 'text-gray-800' : 'text-gray-500'}`}>
                        At least 1 uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasLower ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-xs ${hasLower ? 'text-gray-800' : 'text-gray-500'}`}>
                        At least 1 lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasNumber ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-xs ${hasNumber ? 'text-gray-800' : 'text-gray-500'}`}>
                        At least 1 number
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasSymbol ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={`text-xs ${hasSymbol ? 'text-gray-800' : 'text-gray-500'}`}>
                        At least 1 special character
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {step !== 'done' && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sibol-green hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-3 rounded-full text-base transition-all mt-4"
              >
                {loading && 'Processing...'}
                {!loading && step === 'email' && 'Send Code'}
                {!loading && step === 'verify' && 'Verify Code'}
                {!loading && step === 'reset' && 'Reset Password'}
              </button>
            )}

            {/* Done Button */}
            {step === 'done' && (
              <button
                type="button"
                onClick={handleDone}
                className="w-full bg-sibol-green hover:bg-green-700 text-white font-bold px-4 py-3 rounded-full text-base transition-all mt-4"
              >
                Back to Sign In
              </button>
            )}

            {/* Back to Sign In (except on done step) */}
            {step !== 'done' && (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full text-center bg-transparent border-0 text-sibol-green hover:text-green-700 hover:underline font-medium text-sm sm:text-base focus:outline-none"
              >
                Back to Sign In
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;