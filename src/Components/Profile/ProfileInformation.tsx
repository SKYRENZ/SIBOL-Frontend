import React, { useEffect, useRef, useState } from "react";
import { getMyProfile, updateMyProfile } from "../../services/profile/profileService";
import { getUser } from "../../services/authService";
import ChangeUsernameModal from "../verification/ChangeUsernameModal";
import ChangePasswordModal from "../verification/ChangePasswordModal"; // ✅ use this instead of PasswordModal
import { Pencil } from "lucide-react";

// =============================
// TYPES
// =============================
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
  suffix: "../../assets/images/lili.png",
  avatar: "",
  address: {
    fullAddress: "",
    areaAssigned: "",
    barangay: "",
  },
};

// =============================
// HELPERS
// =============================
function roleLabel(roleId?: number | null) {
  if (roleId === 1) return "Admin";
  if (roleId === 2) return "Barangay Staff";
  if (roleId === 3) return "Operator";
  return "User";
}

function normalizeProfile(apiProfile: any): UiProfile {
  const localUser = getUser();
  const rolesNum = Number(localUser?.Roles ?? localUser?.roleId ?? NaN);
  const barangayName = apiProfile?.Barangay_Name ?? apiProfile?.barangayName ?? "-";

  return {
    ...emptyProfile,
    firstName: apiProfile?.FirstName ?? apiProfile?.firstName ?? "",
    lastName: apiProfile?.LastName ?? apiProfile?.lastName ?? "",
    email: apiProfile?.Email ?? apiProfile?.email ?? "",
    phone: String(apiProfile?.Contact ?? apiProfile?.contact ?? ""),
    role: roleLabel(Number.isFinite(rolesNum) ? rolesNum : null),
    position: roleLabel(Number.isFinite(rolesNum) ? rolesNum : null),
    address: {
      fullAddress: barangayName,
      areaAssigned: apiProfile?.Area_Name ?? apiProfile?.areaName ?? "-",
      barangay: barangayName,
    },
  };
}

// =============================
// MAIN COMPONENT
// =============================
const ProfileInformation: React.FC = () => {
  const [profile, setProfile] = useState<UiProfile>(emptyProfile);
  const [formData, setFormData] = useState<UiProfile>(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // =============================
  // LOAD PROFILE
  // =============================
  useEffect(() => {
    (async () => {
      try {
        const apiProfile = await getMyProfile();
        const normalized = normalizeProfile(apiProfile);
        setProfile(normalized);
        setFormData(normalized);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // =============================
  // HANDLERS
  // =============================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1] as keyof UiProfile["address"];
      setFormData(p => ({ ...p, address: { ...p.address, [key]: value } }));
    } else {
      setFormData(p => ({ ...p, [name]: value } as UiProfile));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const resp = await updateMyProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contact: formData.phone,
      });

      const normalized = normalizeProfile(resp?.data ?? resp);
      setProfile(normalized);
      setFormData(normalized);
      setIsEditing(false);

      setToast("Profile updated");
      setTimeout(() => setToast(null), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfile(p => ({ ...p, avatar: imageUrl }));
    setFormData(p => ({ ...p, avatar: imageUrl }));
  };

  // =============================
  // RENDER
  // =============================
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[320px_1fr]">
      {/* LEFT SIDEBAR */}
      <div className="rounded-2xl bg-[#cdddc9] p-6 flex flex-col items-center text-center">
        <div className="relative">
          <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-[#e9f1e6] overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} className="h-full w-full object-cover" />
            ) : (
              <img src="../../assets/images/lili.png" className="h-full w-full object-cover" />
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isEditing}
            className={`absolute bottom-2 right-2 rounded-full p-2 shadow ${
              isEditing ? "bg-gray-300 opacity-50" : "bg-white"
            }`}
          >
            <Pencil size={16} />
          </button>

          <input ref={fileInputRef} type="file" hidden onChange={handlePhotoChange} />
        </div>

        <h2 className="mt-4 font-semibold text-[#1c3c2d]">
          {loading ? "Loading..." : `${profile.firstName} ${profile.lastName}`}
        </h2>
        <p className="text-sm text-gray-600">{profile.role}</p>

        {/* ✅ NEW: Change Username button (above Change Password) */}
        <button
          onClick={() => setShowUsernameModal(true)}
          disabled={isEditing || saving}
          className="mt-6 w-full rounded-xl bg-[#6b8f71] py-2 text-sm text-white disabled:opacity-50"
        >
          Change Username
        </button>

        <button
          onClick={() => setShowPasswordModal(true)}
          disabled={isEditing || saving}
          className="mt-3 w-full rounded-xl bg-[#6b8f71] py-2 text-sm text-white disabled:opacity-50"
        >
          Change Password
        </button>
      </div>

      {/* RIGHT CONTENT */}
      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow space-y-8">
        {/* HEADER ROW (ALIGNED) */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#1c3c2d]">Personal Information</h3>

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="text-[#2E523A]">
              <Pencil size={18} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-[#2E523A] px-4 py-1 text-xs text-white"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="rounded-full bg-gray-300 px-4 py-1 text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* PERSONAL INFO GRID */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {isEditing ? (
            <>
              <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
              <Input label="Middle Initial" name="middleInitial" value={formData.middleInitial} onChange={handleChange} />
              <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
              <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
              <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
              <Input label="Position" name="position" value={formData.position} onChange={handleChange} />
            </>
          ) : (
            <>
              <Info label="First Name" value={profile.firstName} />
              <Info label="Middle Initial" value={profile.middleInitial || "-"} />
              <Info label="Last Name" value={profile.lastName} />
              <Info label="Email" value={profile.email} />
              <Info label="Phone" value={profile.phone} />
              <Info label="Position" value={profile.position} />
            </>
          )}
        </div>

        {/* ADDRESS */}
        <div>
          <h3 className="font-semibold text-[#1c3c2d] mb-4">Address</h3>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            {isEditing ? (
              <>
                <Input label="Full Address" name="address.fullAddress" value={formData.address.fullAddress} onChange={handleChange} />
                <Input label="Area Assigned" name="address.areaAssigned" value={formData.address.areaAssigned} onChange={handleChange} />
                <Input label="Barangay" name="address.barangay" value={formData.address.barangay} onChange={handleChange} />
              </>
            ) : (
              <>
                <Info label="Full Address" value={profile.address.fullAddress} />
                <Info label="Area Assigned" value={profile.address.areaAssigned} />
                <Info label="Barangay" value={profile.address.barangay} />
              </>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed top-6 right-6 rounded-lg bg-[#2E523A] px-4 py-2 text-sm text-white shadow">
          {toast}
        </div>
      )}

      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          setToast("Password updated");
          setTimeout(() => setToast(null), 2500);
        }}
      />

      <ChangeUsernameModal
        open={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSuccess={() => {
          setToast("Username updated");
          setTimeout(() => setToast(null), 2500);
        }}
      />
    </div>
  );
};

// =============================
// REUSABLES
// =============================
const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-[#1c3c2d]">{value || "-"}</p>
  </div>
);

const Input = ({ label, name, value, onChange }: any) => (
  <div className="relative w-full mt-4">
    <label className="absolute -top-3 left-3 bg-white px-1 text-[#2E523A] text-sm font-semibold">
      {label}
    </label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-[10px] border-2 border-[#6C8770] px-4 pt-4 pb-3 text-[#2E523A]"
    />
  </div>
);

export default ProfileInformation;
