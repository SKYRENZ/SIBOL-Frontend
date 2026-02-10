import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { changePassword, clearError, clearSuccess } from '../../store/slices/authSlice';
import FormModal from '../common/FormModal';
import SnackBar from '../common/SnackBar';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  isFirstLogin?: boolean;
};

export default function ChangePasswordModal({ open, onClose, onSuccess, isFirstLogin = false }: Props) {
  const dispatch = useAppDispatch();
  const { isLoading, error: authError } = useAppSelector((state) => state.auth);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [snack, setSnack] = useState<{ visible: boolean; message: string; type?: 'error' | 'success' | 'info' }>({
    visible: false,
    message: '',
    type: 'info',
  });
  const showModalSnack = (message: string, type: 'error' | 'success' | 'info' = 'error') =>
    setSnack({ visible: true, message, type });

  useEffect(() => {
    if (!open) return;

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);

    setSnack({ visible: false, message: '', type: 'info' });

    dispatch(clearError());
    dispatch(clearSuccess());
  }, [open, dispatch]);

  // Password strength calculation (unchanged)
  const hasUpper = /[A-Z]/.test(newPassword || '');
  const hasLower = /[a-z]/.test(newPassword || '');
  const hasNumber = /\d/.test(newPassword || '');
  const hasSymbol = /[\W_]/.test(newPassword || '');
  const hasLength = (newPassword || '').length >= 8;
  const score = [hasUpper, hasLower, hasNumber, hasSymbol, hasLength].filter(Boolean).length;

  const strengthLabel =
    score <= 1 ? 'Very weak' : score === 2 ? 'Weak' : score === 3 ? 'Medium' : score === 4 ? 'Strong' : 'Very strong';
  const strengthColor =
    score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-rose-500' : score === 3 ? 'bg-yellow-400' : score === 4 ? 'bg-emerald-400' : 'bg-emerald-600';

  const passwordValid = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  // If Redux gets an authError, show it as modal snackbar (and clear it to avoid repeats)
  useEffect(() => {
    if (!authError) return;
    showModalSnack(authError, 'error');
    dispatch(clearError());
  }, [authError, dispatch]);

  const handleSubmit = async () => {
    // validation -> modal snackbar
    if (!currentPassword || !newPassword || !confirmPassword) return showModalSnack('Please fill in all fields.', 'error');
    if (newPassword === currentPassword) return showModalSnack('New password must be different from current password.', 'error');
    if (!passwordValid) return showModalSnack('Password does not meet requirements.', 'error');
    if (!passwordsMatch) return showModalSnack('Passwords do not match.', 'error');

    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();

      // success -> page snackbar via parent callback
      onSuccess?.();
      onClose();
    } catch (e: any) {
      showModalSnack(String(e?.message ?? e ?? 'Failed to change password'), 'error');
    }
  };

  return (
    <FormModal
      isOpen={open}
      onClose={onClose}
      title={isFirstLogin ? '🔐 Set Your New Password' : 'Change Password'}
      width="520px"
      showCloseButton={!isFirstLogin}
      closeOnBackdrop={!isFirstLogin}
    >
      {/* ✅ no inline success/error blocks */}

      {/* Current Password */}
      <label className="block text-sm font-medium text-black mb-2">Current Password</label>
      <div className="relative mb-3">
        <input
          type={showCurrent ? 'text' : 'password'}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white text-black placeholder-gray-400"
          placeholder="Enter current password"
          autoFocus
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowCurrent(!showCurrent)}
          className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 hover:outline-none hover:ring-0"
          aria-label={showCurrent ? 'Hide password' : 'Show password'}
          disabled={isLoading}
        >
          {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {/* New Password */}
      <label className="block text-sm font-medium text-black mb-2">New Password</label>
      <div className="relative mb-2">
        <input
          type={showNew ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white text-black placeholder-gray-400"
          placeholder="New password"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 hover:outline-none hover:ring-0"
          aria-label={showNew ? 'Hide password' : 'Show password'}
          disabled={isLoading}
        >
          {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {/* Confirm Password */}
      <label className="block text-sm font-medium text-black mb-2">Confirm Password</label>
      <div className="relative mb-2">
        <input
          type={showConfirm ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white text-black placeholder-gray-400"
          placeholder="Confirm password"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-gray-600 bg-transparent border-0 focus:outline-none focus:ring-0 hover:outline-none hover:ring-0"
          aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
          disabled={isLoading}
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

      {/* Password Strength Indicator */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex-1 transition-colors duration-150 ${i < score ? strengthColor : 'bg-gray-200'}`} />
            ))}
          </div>
          <div className="text-xs font-medium text-gray-700 ml-2 w-20 text-right">{strengthLabel}</div>
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

      <div className="flex justify-end gap-2 mt-4">
        {!isFirstLogin && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isLoading || !passwordValid || !passwordsMatch || !currentPassword}
          className="px-4 py-2 rounded-md bg-[#2E523A] text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
        >
          {isLoading ? 'Changing...' : 'Change Password'}
        </button>
      </div>

      <SnackBar
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
        duration={3000}
      />
    </FormModal>
  );
}