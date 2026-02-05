import React, { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { changePassword } from "../../services/authService";

// =============================
// TYPES
// =============================
type SecurityForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyForm: SecurityForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

// =============================
// PASSWORD INPUT
// =============================
type PasswordInputProps = {
  label: string;
  name: keyof SecurityForm;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  name,
  value,
  show,
  onToggle,
  onChange,
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-[#6b8f71]">
      {label}
    </label>

    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-full border border-[#6b8f71] px-6 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#6b8f71]"
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b8f71] hover:text-[#2E523A] bg-transparent"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

// =============================
// MODAL COMPONENT
// =============================
type PasswordModalProps = {
  onClose: () => void;
};

const PasswordModal: React.FC<PasswordModalProps> = ({ onClose }) => {
  const [form, setForm] = useState<SecurityForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // =============================
  // HANDLERS
  // =============================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      await changePassword(form.currentPassword, form.newPassword);
      setSuccess(true);
      setForm(emptyForm);

      // Auto-close after success
      setTimeout(onClose, 1200);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to change password."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-transparent"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-xl font-bold text-[#1c3c2d]">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordInput
            label="Current Password"
            name="currentPassword"
            value={form.currentPassword}
            show={show.current}
            onToggle={() =>
              setShow(prev => ({ ...prev, current: !prev.current }))
            }
            onChange={handleChange}
          />

          <PasswordInput
            label="New Password"
            name="newPassword"
            value={form.newPassword}
            show={show.new}
            onToggle={() =>
              setShow(prev => ({ ...prev, new: !prev.new }))
            }
            onChange={handleChange}
          />

          <PasswordInput
            label="Re-type Password"
            name="confirmPassword"
            value={form.confirmPassword}
            show={show.confirm}
            onToggle={() =>
              setShow(prev => ({ ...prev, confirm: !prev.confirm }))
            }
            onChange={handleChange}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && (
            <p className="text-sm text-green-700">
              Password updated successfully.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-full bg-gray-200 px-5 py-2 text-sm disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#6b8f71] px-6 py-2 text-sm text-white hover:bg-[#5a7d62] disabled:opacity-60"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
