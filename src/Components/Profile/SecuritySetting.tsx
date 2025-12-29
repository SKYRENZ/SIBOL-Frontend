import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// =============================
// TYPES & MOCK DATA
// =============================
type SecurityForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const mockSecurityData: SecurityForm = {
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
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent p-0 text-[#6b8f71] hover:text-[#2E523A] focus:outline-none"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

// =============================
// MAIN COMPONENT
// =============================
const SecuritySetting: React.FC = () => {
  const [form, setForm] = useState<SecurityForm>(mockSecurityData);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    console.log("Password updated:", form);
    setSuccess(true);
    setForm(mockSecurityData);
  };

  const handleCancel = () => {
    setForm(mockSecurityData);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="mx-auto max-w-3xl rounded-xl bg-white p-10 shadow">
      <h2 className="mb-8 text-2xl font-bold text-[#1c3c2d]">
        Change Password
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="flex justify-center gap-6 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full bg-[#f3f4f1] px-8 py-3 font-medium text-[#6b8f71] hover:bg-[#e6ebe7]"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-full bg-[#6b8f71] px-10 py-3 font-medium text-white hover:bg-[#5a7d62]"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySetting;
