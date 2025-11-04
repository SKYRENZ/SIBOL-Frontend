import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Check, X } from 'lucide-react';
import { useChangePassword } from '../../hooks/signup/useChangePassword';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isFirstLogin?: boolean;
};

export default function ChangePasswordModal({ open, onClose, onSuccess, isFirstLogin = false }: Props) {
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    success,
    passwordValid,
    passwordsMatch,
    changePassword,
    resetState
  } = useChangePassword();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      resetState();
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open, resetState]);

  useEffect(() => {
    if (success && onSuccess) {
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }
  }, [success, onSuccess, onClose]);

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      await changePassword();
    } catch (err) {
      // Error handled by hook
    }
  };

  // Password strength calculation
  const hasUpper = /[A-Z]/.test(newPassword || '');
  const hasLower = /[a-z]/.test(newPassword || '');
  const hasNumber = /\d/.test(newPassword || '');
  const hasSymbol = /[\W_]/.test(newPassword || '');
  const hasLength = (newPassword || '').length >= 8;
  const score = [hasUpper, hasLower, hasNumber, hasSymbol, hasLength].filter(Boolean).length;

  const strengthLabel = score <= 1 ? 'Very weak' : score === 2 ? 'Weak' : score === 3 ? 'Medium' : score === 4 ? 'Strong' : 'Very strong';
  const strengthColor =
    score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-rose-500' : score === 3 ? 'bg-yellow-400' : score === 4 ? 'bg-emerald-400' : 'bg-emerald-600';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" 
      role="dialog" 
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-black">
            {isFirstLogin ? 'Set Your New Password' : 'Change Password'}
          </h3>
          {!isFirstLogin && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-4">
          {/* First Login Message */}
          {isFirstLogin && (
            <div className="mb-3 bg-blue-50 border border-blue-100 rounded-md px-4 py-2 text-blue-800 text-sm">
              <p className="font-medium">Welcome! 👋</p>
              <p className="mt-1">For security reasons, please change your default password before continuing.</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-md px-4 py-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-3 bg-green-50 border border-green-100 rounded-md px-4 py-2 text-green-800 text-sm">
              Password changed successfully! Redirecting...
            </div>
          )}

          {!success && (
            <>
              {/* Current Password */}
              <label className="block text-sm font-medium text-black mb-2">
                Current Password
              </label>
              <div className="relative mb-3">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white text-black placeholder-gray-400"
                  placeholder="Enter current password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 hover:outline-none hover:ring-0"
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* New Password */}
              <label className="block text-sm font-medium text-black mb-2">
                New Password
              </label>
              <div className="relative mb-2">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white text-black placeholder-gray-400"
                  placeholder="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 hover:outline-none hover:ring-0"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <label className="block text-sm font-medium text-black mb-2">
                Confirm Password
              </label>
              <div className="relative mb-2">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white text-black placeholder-gray-400"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 hover:outline-none hover:ring-0"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Passwords Match Indicator */}
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

              {/* Password Strength Indicator - ALWAYS VISIBLE */}
              <div className="mb-2">
                {/* Strength bar - ALWAYS VISIBLE */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 transition-colors duration-150 ${i < score ? strengthColor : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-medium text-gray-700 ml-2 w-20 text-right">{strengthLabel}</div>
                </div>

                {/* Password Requirements - ALWAYS VISIBLE */}
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                {!isFirstLogin && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !passwordValid || !passwordsMatch || !currentPassword}
                  className="px-4 py-2 rounded-md bg-[#2E523A] text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}