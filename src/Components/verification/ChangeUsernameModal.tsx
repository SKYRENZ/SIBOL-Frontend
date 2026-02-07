import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { updateMyProfile } from '../../services/profile/profileService';
import FormModal from '../common/FormModal';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: (newUsername: string) => void;
  isFirstLogin?: boolean;
};

export default function ChangeUsernameModal({
  open,
  onClose,
  onSuccess,
  isFirstLogin = false,
}: Props) {
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setNewUsername('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
    setError(null);
    setSuccessMessage(null);
    setIsLoading(false);
  }, [open]);

  useEffect(() => {
    if (!successMessage) return;

    const t = window.setTimeout(() => {
      onSuccess?.(newUsername);
      onClose();
    }, 2000);

    return () => window.clearTimeout(t);
  }, [successMessage, onClose, onSuccess, newUsername]);

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!newUsername.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await updateMyProfile({
        username: newUsername.trim(),
        password,
      });
      setSuccessMessage('Username updated successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to change username. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={open}
      onClose={onClose}
      title={isFirstLogin ? '👤 Set Your Username' : 'Change Username'}
      width="520px"
      showCloseButton={!isFirstLogin}
      closeOnBackdrop={!isFirstLogin}
    >
      {isFirstLogin && (
        <div className="mb-3 bg-blue-50 border border-blue-100 rounded-md px-4 py-2 text-blue-800 text-sm">
          <p className="font-medium">Welcome! 👋</p>
          <p className="mt-1">Please set your username before continuing.</p>
        </div>
      )}

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-md px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-3 bg-green-50 border border-green-100 rounded-md px-4 py-2 text-green-800 text-sm flex items-center gap-2">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {!successMessage && (
        <>
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
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-[#2E523A] text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? 'Saving...' : 'Change Username'}
            </button>
          </div>
        </>
      )}
    </FormModal>
  );
}