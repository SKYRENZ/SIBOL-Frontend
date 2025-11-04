import { useState, useCallback } from 'react';
import { fetchJson } from '../../services/apiClient';

export function useChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordValid = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  const resetState = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  const changePassword = useCallback(async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (!currentPassword) {
      return setError('Current password is required');
    }

    if (!passwordValid) {
      return setError('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.');
    }

    if (!passwordsMatch) {
      return setError('New passwords do not match');
    }

    setLoading(true);
    try {
      const data = await fetchJson('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      setSuccess(true);
      return data;
    } catch (err: any) {
      setError(err?.message || 'Failed to change password. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPassword, newPassword, passwordValid, passwordsMatch]);

  return {
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
  } as const;
}