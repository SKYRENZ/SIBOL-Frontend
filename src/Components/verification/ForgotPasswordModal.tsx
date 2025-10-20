import React, { useState } from 'react';
import { useForgotPassword } from '../../hooks/useForgotPassword';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ForgotPasswordModal({ open, onClose }: Props) {
  const {
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
    sendResetRequest,
    verifyCode,
    submitNewPassword,
    closeAndReset
  } = useForgotPassword();

  // Local-only state for confirm password and show/hide toggles
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!open) return null;

  // Wrapper to validate confirm password before calling hook submit
  const handleSubmitNewPassword = async () => {
    if (newPassword !== confirmPassword) {
      // the hook exposes error state but we can set it via closeAndReset/info pattern;
      // simplest: throw local error by using info/error returned by hook - here we set a local error display via setTimeout to reuse existing UI.
      // But to keep things simple, reuse hook's error by calling submit only when valid.
      // Show temporary alert-like behavior:
      // eslint-disable-next-line no-alert
      return window.alert('Passwords do not match');
    }
    await submitNewPassword();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-black">Forgot Password</h3>
        </div>

        <div className="p-4">
          {error && <div className="mb-3 bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          {info && <div className="mb-3 bg-blue-50 text-sky-800 px-3 py-2 rounded text-sm">{info}</div>}

          {step === 'email' && (
            <>
              <label className="block text-sm font-medium text-black mb-2">Enter your account email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200 mb-3 bg-white text-black placeholder-gray-400"
                placeholder="you@example.com"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => { closeAndReset(); onClose(); }} className="px-4 py-2 rounded-md bg-gray-100 text-gray-800">Cancel</button>
                <button
                  onClick={sendResetRequest}
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-[#2E523A] text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending…' : 'Send Reset Code'}
                </button>
              </div>
            </>
          )}

          {step === 'verify' && (
            <>
              <label className="block text-sm font-medium text-black mb-2">Enter 6-digit code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200 mb-2 bg-white text-black placeholder-gray-400"
                placeholder="123456"
                inputMode="numeric"
                autoFocus
              />
              <div className="text-xs text-gray-500 mb-3">Didn't receive? You can resend from the login screen.</div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setStep('email')} className="px-4 py-2 rounded-md bg-gray-100 text-gray-800">Back</button>
                <button
                  onClick={verifyCode}
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-[#2E523A] text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying…' : 'Verify Code'}
                </button>
              </div>
            </>
          )}

          {step === 'reset' && (
            <>
              <label className="block text-sm font-medium text-black mb-2">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200 mb-2 bg-white text-black placeholder-gray-400"
                  placeholder="New password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-600 bg-transparent"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    // eye-off icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.94 10.94A3 3 0 0113.06 13.06" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c1.196 0 2.34.21 3.396.588" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.122 14.122C13.42 14.69 12.73 15 12 15c-4.478 0-8.268-2.943-9.542-7 .52-1.657 1.38-3.123 2.49-4.31" />
                    </svg>
                  ) : (
                    // eye icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              <label className="block text-sm font-medium text-black mb-2">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200 mb-2 bg-white text-black placeholder-gray-400"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-600 bg-transparent"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? (
                    // eye-off icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.94 10.94A3 3 0 0113.06 13.06" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c1.196 0 2.34.21 3.396.588" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.122 14.122C13.42 14.69 12.73 15 12 15c-4.478 0-8.268-2.943-9.542-7 .52-1.657 1.38-3.123 2.49-4.31" />
                    </svg>
                  ) : (
                    // eye icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                Password must be at least 8 characters and include uppercase, lowercase, number and symbol.
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setStep('verify')} className="px-4 py-2 rounded-md bg-gray-100 text-gray-800">Back</button>
                <button
                  onClick={handleSubmitNewPassword}
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-[#2E523A] text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>
            </>
          )}

          {step === 'done' && (
            <>
              <div className="mb-4 text-sm text-black">Your password was reset successfully.</div>
              <div className="flex justify-end">
                <button onClick={() => { closeAndReset(); onClose(); }} className="px-4 py-2 rounded-md bg-[#2E523A] text-white hover:opacity-90">Close</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}