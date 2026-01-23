import React, { useEffect, useRef, useState } from "react";
import { getMyProfile, updateMyProfile } from "../../services/profile/profileService";
import { getUser } from "../../services/authService";

type UiProfile = {
  firstName: string;
  middleInitial: string;
  lastName: string;
  role: string;
  email: string;
  phone: string;
  position: string;
  suffix: string;
  avatar: string;
  address: {
    fullAddress: string;
    areaAssigned: string;
    barangay: string;
  };
};

const emptyProfile: UiProfile = {
  firstName: "",
  middleInitial: "",
  lastName: "",
  role: "",
  email: "",
  phone: "",
  position: "",
  suffix: "-",
  avatar: "",
  address: {
    fullAddress: "",
    areaAssigned: "",
    barangay: "",
  },
};

function roleLabel(roleId?: number | null) {
  if (roleId === 1) return "Admin";
  if (roleId === 2) return "Barangay Staff";
  if (roleId === 3) return "Operator";
  return "User";
}

function normalizeProfile(apiProfile: any): UiProfile {
  const localUser = getUser();
  const rolesNum =
    Number(localUser?.Roles ?? localUser?.roleId ?? localUser?.role ?? NaN);

  // Try common backend fields; fall back to blanks.
  const firstName = apiProfile?.FirstName ?? apiProfile?.firstName ?? "";
  const lastName = apiProfile?.LastName ?? apiProfile?.lastName ?? "";
  const email = apiProfile?.Email ?? apiProfile?.email ?? "";
  const phoneVal =
    apiProfile?.Contact ?? apiProfile?.contact ?? apiProfile?.Phone ?? apiProfile?.phone ?? "";
  const phone = phoneVal == null ? "" : String(phoneVal);

  // Address fields are not guaranteed by your backend; map if present.
  const fullAddress =
    apiProfile?.FullAddress ??
    apiProfile?.fullAddress ??
    apiProfile?.Address ??
    apiProfile?.address ??
    "";

  const areaAssigned =
    apiProfile?.AreaAssigned ??
    apiProfile?.areaAssigned ??
    apiProfile?.Area_Name ??
    apiProfile?.areaName ??
    "";

  const barangay =
    apiProfile?.Barangay ??
    apiProfile?.barangay ??
    apiProfile?.Barangay_Name ??
    apiProfile?.barangayName ??
    "";

  const roleText = roleLabel(Number.isFinite(rolesNum) ? rolesNum : null);

  const barangayName =
    apiProfile?.Barangay_Name ?? apiProfile?.barangayName ?? "";

  return {
    ...emptyProfile,
    firstName,
    lastName,
    email,
    phone,
    role: roleText,
    position: roleText, // ✅ position comes from role
    address: {
      fullAddress: barangayName || "-", // ✅ address comes from Barangay_id -> Barangay_Name
      areaAssigned: apiProfile?.Area_Name ?? apiProfile?.areaName ?? "-",
      barangay: barangayName || "-",
    },
  };
}

const ProfileInformation: React.FC = () => {
  const [profile, setProfile] = useState<UiProfile>(emptyProfile);
  const [formData, setFormData] = useState<UiProfile>(emptyProfile);

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const apiProfile = await getMyProfile(); // ✅ GET /api/profile/me (cookie auth)
        const normalized = normalizeProfile(apiProfile);
        if (cancelled) return;
        setProfile(normalized);
        setFormData(normalized);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // =============================
  // HANDLERS
  // =============================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setSuccessMsg(null);
    setError(null);

    if (name.startsWith("address.")) {
      const field = name.split(".")[1] as keyof UiProfile["address"];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value } as UiProfile));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // Only send fields your backend supports (ProfileUpdatePayload)
      const resp = await updateMyProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contact: formData.phone,
      });

      const updatedApiProfile = resp?.data ?? resp;
      const normalized = normalizeProfile(updatedApiProfile);

      setProfile(normalized);
      setFormData(normalized);

      setIsEditingPersonal(false);
      setIsEditingAddress(false);

      setSuccessMsg("Profile updated.");

      setToastMsg("Profile updated");
      setTimeout(() => setToastMsg(null), 2500);
    } catch (e: any) {
      // fetchJson attaches status + payload
      if (e?.status === 429 && e?.payload?.retryAt) {
        setError(`You can update profile again after: ${String(e.payload.retryAt)}`);
      } else {
        setError(e?.message ?? "Update failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditingPersonal(false);
    setIsEditingAddress(false);
    setError(null);
    setSuccessMsg(null);
  };

  // =============================
  // PHOTO UPLOAD (local preview only)
  // =============================
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("Only PNG and JPEG images are allowed.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev, avatar: imageUrl }));
    setFormData(prev => ({ ...prev, avatar: imageUrl }));
  };

  return (
    <div className="space-y-8">
      {/* ================= Profile Header ================= */}
      <div className="rounded-xl bg-white p-6 shadow flex items-center gap-6">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-[#f5eddc] flex items-center justify-center">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-3xl">🐻</span>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#1c3c2d]">
            {loading ? "Loading..." : `${profile.firstName} ${profile.middleInitial ? profile.middleInitial + "." : ""} ${profile.lastName}`.trim()}
          </h2>
          <p className="text-sm text-gray-600">{profile.role}</p>

          <button
            onClick={handlePhotoClick}
            className="mt-2 rounded-full border border-[#2E523A] px-4 py-1 text-xs font-medium text-[#2E523A] hover:bg-[#2E523A] hover:text-white transition"
          >
            Upload New Photo
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg"
            onChange={handlePhotoChange}
            hidden
          />
        </div>
      </div>

      {/* ================= Personal Information ================= */}
      <div className="rounded-xl bg-white p-6 shadow">
        <Header
          title="Personal Information"
          isEditing={isEditingPersonal}
          onEdit={() => {
            setIsEditingPersonal(true);
            setSuccessMsg(null);
            setError(null);
          }}
          onSave={handleSave}
          onCancel={handleCancel}
          disabled={loading || saving}
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {successMsg && <p className="mb-3 text-sm text-green-700">{successMsg}</p>}
        {toastMsg && (
          <div className="fixed right-6 top-6 z-50 rounded-lg bg-[#2E523A] px-4 py-2 text-sm text-white shadow">
            {toastMsg}
          </div>
        )}

        <div className="grid gap-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {isEditingPersonal ? (
            <>
              <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
              <Input label="Middle Initial" name="middleInitial" value={formData.middleInitial} onChange={handleChange} />
              <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
              <Input label="Suffix" name="suffix" value={formData.suffix} onChange={handleChange} />
              <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} />
              <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
              <Input label="Position" name="position" value={formData.position} onChange={handleChange} />
            </>
          ) : (
            <>
              <Info label="First Name" value={profile.firstName || "-"} />
              <Info label="Middle Initial" value={profile.middleInitial || "-"} />
              <Info label="Last Name" value={profile.lastName || "-"} />
              <Info label="Suffix" value={profile.suffix || "-"} />
              <Info label="Email Address" value={profile.email || "-"} />
              <Info label="Phone Number" value={profile.phone || "-"} />
              <Info label="Position" value={profile.position || "-"} />
            </>
          )}
        </div>
      </div>

      {/* ================= Address ================= */}
      <div className="rounded-xl bg-white p-6 shadow">
        <Header
          title="Address"
          isEditing={isEditingAddress}
          onEdit={() => {
            setIsEditingAddress(true);
            setSuccessMsg(null);
            setError(null);
          }}
          onSave={handleSave}
          onCancel={handleCancel}
          disabled={loading || saving}
        />

        <div className="grid gap-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {isEditingAddress ? (
            <>
              <Input label="Full Address" name="address.fullAddress" value={formData.address.fullAddress} onChange={handleChange} />
              <Input label="Area Assigned" name="address.areaAssigned" value={formData.address.areaAssigned} onChange={handleChange} />
              <Input label="Barangay" name="address.barangay" value={formData.address.barangay} onChange={handleChange} />
            </>
          ) : (
            <>
              <Info label="Full Address" value={profile.address.fullAddress || "-"} />
              <Info label="Area Assigned" value={profile.address.areaAssigned || "-"} />
              <Info label="Barangay" value={profile.address.barangay || "-"} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================
// REUSABLE COMPONENTS
// =============================
const Header = ({
  title,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  disabled,
}: {
  title: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
}) => (
  <div className="mb-4 flex items-center justify-between">
    <h3 className="font-semibold text-[#1c3c2d]">{title}</h3>
    {!isEditing ? (
      <button
        onClick={onEdit}
        disabled={disabled}
        className="rounded-full bg-[#6b8f71] px-4 py-1 text-xs text-white disabled:opacity-60"
      >
        Edit
      </button>
    ) : (
      <ActionButtons onSave={onSave} onCancel={onCancel} disabled={disabled} />
    )}
  </div>
);

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-[#1c3c2d]">{value}</p>
  </div>
);

const Input = ({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <input
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-[#6b8f71]"
    />
  </div>
);

const ActionButtons = ({
  onSave,
  onCancel,
  disabled,
}: {
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
}) => (
  <div className="flex gap-2">
    <button
      onClick={onSave}
      disabled={disabled}
      className="rounded-full bg-[#2E523A] px-4 py-1 text-xs text-white disabled:opacity-60"
    >
      Save
    </button>
    <button
      onClick={onCancel}
      disabled={disabled}
      className="rounded-full bg-gray-300 px-4 py-1 text-xs disabled:opacity-60"
    >
      Cancel
    </button>
  </div>
);

export default ProfileInformation;
