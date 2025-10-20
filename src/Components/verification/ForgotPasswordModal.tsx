import React, { useState, useEffect } from 'react';
import { useForgotPassword } from '../../hooks/useForgotPassword';
import { Eye, EyeOff, Check, X } from 'lucide-react';

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

  // Reset local states when modal opens
  useEffect(() => {
    if (open) {
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [open]);

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
                  className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 hover:outline-none hover:ring-0 transform -translate-y-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                  className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 hover:outline-none hover:ring-0 transform -translate-y-1"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Confirm password match checker */}
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 mb-2 text-sm">
                  {newPassword === confirmPassword ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-700">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 text-rose-500" />
                      <span className="text-rose-700">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}

              {/* Password validations + strength */}
              {(() => {
                const hasUpper = /[A-Z]/.test(newPassword || '');
                const hasLower = /[a-z]/.test(newPassword || '');
                const hasNumber = /\d/.test(newPassword || '');
                const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword || '');
                const hasLength = (newPassword || '').length >= 8;
                const score = [hasUpper, hasLower, hasNumber, hasSymbol, hasLength].filter(Boolean).length;

                const strengthLabel = score <= 1 ? 'Very weak' : score === 2 ? 'Weak' : score === 3 ? 'Medium' : score === 4 ? 'Strong' : 'Very strong';
                const strengthColor =
                  score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-rose-500' : score === 3 ? 'bg-yellow-400' : score === 4 ? 'bg-emerald-400' : 'bg-emerald-600';

                return (
                  <>
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 transition-colors duration-150 ${i < score ? strengthColor : 'bg-gray-200'}`}
                            />
                          ))}
                        </div>
                        <div className="text-xs font-medium text-gray-700 ml-2">{strengthLabel}</div>
                      </div>

                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2 text-gray-700">
                          {hasLength ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500" />}
                          <span className={`${hasLength ? 'text-gray-800' : 'text-gray-500'}`}>At least 8 characters</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          {hasUpper ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500" />}
                          <span className={`${hasUpper ? 'text-gray-800' : 'text-gray-500'}`}>At least 1 uppercase</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          {hasLower ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500" />}
                          <span className={`${hasLower ? 'text-gray-800' : 'text-gray-500'}`}>At least 1 lowercase</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          {hasNumber ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500" />}
                          <span className={`${hasNumber ? 'text-gray-800' : 'text-gray-500'}`}>At least 1 number</span>
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          {hasSymbol ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-rose-500" />}
                          <span className={`${hasSymbol ? 'text-gray-800' : 'text-gray-500'}`}>At least 1 symbol</span>
                        </li>
                      </ul>
                    </div>
                  </>
                );
              })()}

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