import React, { useState, useEffect, useRef } from 'react';
import { useForgotPassword } from '../../hooks/signup/useForgotPassword';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import MessageModal from '../common/MessageModal';

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
    resendCooldown,
    canResend,
    sendResetRequest,
    verifyCode,
    submitNewPassword,
    closeAndReset
  } = useForgotPassword() as {
    step: any;
    setStep: any;
    email: string;
    setEmail: (v: string) => void;
    code: string;
    setCode: (v: string) => void;
    newPassword: string;
    setNewPassword: (v: string) => void;
    loading: boolean;
    error: string | null;
    info: string | null;
    resendCooldown: number;
    canResend: boolean;
    sendResetRequest: () => Promise<void>;
    verifyCode: () => Promise<void>;
    submitNewPassword: () => Promise<void>;
    closeAndReset: () => void;
  };

  // Message modal state
  const [messageModal, setMessageModal] = useState<{
    open: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    open: false,
    type: 'info',
    title: '',
    message: ''
  });

  // show seconds only (padded to 2 digits), e.g. "59", "05"
  const formatSeconds = (s: number) => String(s).padStart(2, '0');
 
  // Local-only state for confirm password and show/hide toggles
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Ensure hooks run in stable order: declare OTP_LENGTH and inputsRef before any early returns
  const OTP_LENGTH = 6; // adjust to 5 if your backend expects 5 digits
  const inputsRef = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

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
      setMessageModal({
        open: true,
        type: 'error',
        title: 'Passwords Do Not Match',
        message: 'Please ensure both password fields contain the same password.'
      });
      return;
    }
    await submitNewPassword();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium text-black">Forgot Password</h3>
          </div>

          <div className="p-4">
            {info && (
              <div className="mb-3">
                <div className="bg-green-50 border border-green-100 rounded-md px-4 py-2 text-green-800 text-sm">
                  {info}
                </div>
                <div className="mt-2 bg-green-50 border border-green-100 rounded-md px-4 py-2 text-green-800 text-sm">
                  Delivery may take 1–5 minutes. If you don't see the email, please check your spam/junk folder.
                </div>
              </div>
            )}

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
                    disabled={loading || (resendCooldown ?? 0) > 0}
                    className="px-4 py-2 rounded-md bg-[#2E523A] text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending…' : 'Send Reset Code'}
                  </button>
                  <span className="ml-2 text-xs text-gray-500 font-semibold" aria-live="polite">
                    {(resendCooldown ?? 0) > 0 ? formatSeconds(resendCooldown) : ''}
                  </span>
                </div>
              </>
            )}

            { 
              /* replaced verify block to include inline "Didn't get an email? Resend code" and OTP input boxes */
              step === 'verify' && (
                <>
                  <label className="block text-sm font-medium text-black mb-2">Enter {OTP_LENGTH}-digit code</label>

                  <div className="mb-3 text-black">
                    <div className="flex justify-center">
                      <div className="flex gap-6">
                        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              (inputsRef.current as Array<HTMLInputElement | null>)[i] = el;
                            }}
                            value={(code || '')[i] ?? ''}
                            onChange={(e) => {
                              const digit = e.target.value.replace(/\D/g, '').slice(0, 1);
                              const arr = (code || '').split('').slice(0, OTP_LENGTH);
                              arr[i] = digit;
                              const newCode = arr.join('');
                              setCode(newCode);
                              if (digit && i < OTP_LENGTH - 1) {
                                (inputsRef.current as Array<HTMLInputElement | null>)[i + 1]?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !(code || '')[i] && i > 0) {
                                (inputsRef.current as Array<HTMLInputElement | null>)[i - 1]?.focus();
                              }
                            }}
                            onPaste={(e) => {
                              const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
                              if (pasted.length) {
                                setCode(pasted);
                                const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
                                setTimeout(() => {
                                  (inputsRef.current as Array<HTMLInputElement | null>)[nextIndex]?.focus();
                                }, 0);
                              }
                              e.preventDefault();
                            }}
                            inputMode="numeric"
                            className="w-12 h-12 flex-none text-center text-lg font-medium px-0 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white"
                            aria-label={`Digit ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {error && <div className="mb-3 bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}

                  <div className="flex items-center mb-5">
                    <div className="text-xs text-gray-500">Didn't get an email?</div>
                    <button
                      type="button"
                      onClick={sendResetRequest}
                      disabled={loading || (resendCooldown ?? 0) > 0}
                      className="text-sm px-3 py-1 rounded-md bg-transparent text-blue-800 hover:text-blue-600 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 hover:ring-0 border-0 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending…' : 'Resend code'}
                    </button>
                    <span className="ml-3 text-s text-gray-500 font-bold" aria-live="polite">
                      {(resendCooldown ?? 0) > 0 ? formatSeconds(resendCooldown) : ''}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { closeAndReset(); onClose(); }}
                      className="px-4 py-2 rounded-md bg-gray-100 text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={verifyCode}
                      disabled={loading}
                      className="px-4 py-2 rounded-md bg-[#2E523A] text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Verifying…' : 'Verify Code'}
                    </button>
                  </div>
                </>
              )
            }

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

      {/* Message Modal */}
      <MessageModal
        open={messageModal.open}
        onClose={() => setMessageModal({ ...messageModal, open: false })}
        type={messageModal.type}
        title={messageModal.title}
        message={messageModal.message}
      />
    </>
  );
}