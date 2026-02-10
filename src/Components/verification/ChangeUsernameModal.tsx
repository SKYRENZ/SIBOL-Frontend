import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { updateMyProfile } from '../../services/profile/profileService';
import FormModal from '../common/FormModal';
import SnackBar from '../common/SnackBar';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: (newUsername: string) => void;
  isFirstLogin?: boolean;

  // ✅ used to block "no changes"
  currentUsername?: string;
};

export default function ChangeUsernameModal({
  open,
  onClose,
  onSuccess,
  isFirstLogin = false,
  currentUsername,
}: Props) {
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState(''); // this is CURRENT password
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // ✅ modal snackbar (validation + API errors)
  const [snack, setSnack] = useState<{ visible: boolean; message: string; type?: 'error' | 'success' | 'info' }>({
    visible: false,
    message: '',
    type: 'info',
  });
  const showModalSnack = (message: string, type: 'error' | 'success' | 'info' = 'error') =>
    setSnack({ visible: true, message, type });

  useEffect(() => {
    if (!open) return;

    setNewUsername('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
    setIsLoading(false);
    setSnack({ visible: false, message: '', type: 'info' });
  }, [open]);

  const trimmedNew = newUsername.trim();
  const trimmedCurrent = String(currentUsername ?? '').trim();

  const allFilled = trimmedNew.length > 0 && password.trim().length > 0 && confirmPassword.trim().length > 0;
  const canSubmit = !isLoading && allFilled;

  const handleSubmit = async () => {
    if (!allFilled) return;

    if (trimmedCurrent && trimmedNew.toLowerCase() === trimmedCurrent.toLowerCase()) {
      return showModalSnack('No changes detected. Please enter a different username.');
    }
    if (password !== confirmPassword) {
      return showModalSnack('Passwords do not match.');
    }

    setIsLoading(true);
    try {
      await updateMyProfile({
        username: trimmedNew,
        currentPassword: password, // ✅ required by backend for username change
      });

      onSuccess?.(trimmedNew);
      onClose();
    } catch (err: any) {
      // fetchJson throws Error(msg) + attaches payload/data/status
      const retryAt = err?.payload?.retryAt ?? err?.data?.retryAt;
      if (err?.status === 429 && retryAt) {
        const days = Math.ceil((new Date(retryAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        return showModalSnack(`You can change your username again in ${Math.max(days, 1)} day(s).`, 'error');
      }

      showModalSnack(err?.message || 'Failed to change username. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={open}
      onClose={onClose}
      title={isFirstLogin ? 'Set Your Username' : 'Change Username'}
      width="520px"
      showCloseButton={!isFirstLogin}
      closeOnBackdrop={!isFirstLogin}
    >
      {/* ✅ no inline success/error blocks */}

      <label className="block text-sm font-medium text-black mb-2">New Username</label>
      <div className="relative mb-3">
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 bg-white text-black placeholder-gray-400"
          placeholder="Enter new username"
          autoFocus
          disabled={isLoading}
        />
      </div>

      <label className="block text-sm font-medium text-black mb-2">Password</label>
      <div className="relative mb-3">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 bg-white text-black placeholder-gray-400"
          placeholder="Enter password"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-gray-600 bg-transparent border-0 focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          disabled={isLoading}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      <label className="block text-sm font-medium text-black mb-2">Confirm Password</label>
      <div className="relative mb-2">
        <input
          type={showConfirm ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 bg-white text-black placeholder-gray-400"
          placeholder="Confirm password"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          className="absolute inset-y-0 right-2 flex items-center justify-center px-2 text-gray-600 bg-transparent border-0 focus:outline-none"
          aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
          disabled={isLoading}
        >
          {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
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
          disabled={!canSubmit}
          className="px-4 py-2 rounded-md bg-[#2E523A] text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
        >
          {isLoading ? 'Saving...' : 'Change Username'}
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