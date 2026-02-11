import React, { useEffect, useRef, useState } from "react";
import { getMyProfile, updateMyProfile, uploadProfileImage } from "../../services/profile/profileService";
import { getUser } from "../../services/authService";
import ChangeUsernameModal from "../verification/ChangeUsernameModal";
import ChangePasswordModal from "../verification/ChangePasswordModal";
import { Pencil } from "lucide-react";
import SnackBar from "../common/SnackBar";
import { useAppDispatch } from "../../store/hooks";
import { setUser as setAuthUser } from "../../store/slices/authSlice";

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

  // pick avatar from new Image_path field if available
  const avatar = apiProfile?.Image_path ?? apiProfile?.image_path ?? apiProfile?.avatar ?? "";

  return {
    ...emptyProfile,
    firstName: apiProfile?.FirstName ?? apiProfile?.firstName ?? "",
    lastName: apiProfile?.LastName ?? apiProfile?.lastName ?? "",
    email: apiProfile?.Email ?? apiProfile?.email ?? "",
    phone: String(apiProfile?.Contact ?? apiProfile?.contact ?? ""),
    role: roleLabel(Number.isFinite(rolesNum) ? rolesNum : null),
    position: roleLabel(Number.isFinite(rolesNum) ? rolesNum : null),
    avatar,
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
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<UiProfile>(emptyProfile);
  const [formData, setFormData] = useState<UiProfile>(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ replace toast with SnackBar state (page-level)
  const [toast, setToast] = useState<string | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ restriction timestamps
  const [usernameLastUpdated, setUsernameLastUpdated] = useState<string | null>(null);
  const [passwordLastUpdated, setPasswordLastUpdated] = useState<string | null>(null);
  const [profileLastUpdated, setProfileLastUpdated] = useState<string | null>(null);

  // LOAD PROFILE
  useEffect(() => {
    (async () => {
      try {
        const apiProfile = await getMyProfile();
        const normalized = normalizeProfile(apiProfile);
        setProfile(normalized);
        setFormData(normalized);

        // backend fields
        setUsernameLastUpdated(apiProfile?.Username_last_updated ?? apiProfile?.usernameLastUpdated ?? null);
        setPasswordLastUpdated(apiProfile?.Password_last_updated ?? apiProfile?.passwordLastUpdated ?? null);
        setProfileLastUpdated(apiProfile?.Profile_last_updated ?? apiProfile?.profileLastUpdated ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showPageSnack = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  };

  const openUsernameModal = () => {
    const r = remainingDays(usernameLastUpdated, USERNAME_DAYS_RESTRICTION);
    if (!r.allowed) return showPageSnack(`You can change your username again in ${r.days} day(s).`);
    setShowUsernameModal(true);
  };

  const openPasswordModal = () => {
    const r = remainingDays(passwordLastUpdated, PASSWORD_DAYS_RESTRICTION);
    if (!r.allowed) return showPageSnack(`You can change your password again in ${r.days} day(s).`);
    setShowPasswordModal(true);
  };

  const startEdit = () => {
    const r = remainingDays(profileLastUpdated, PROFILEINFO_DAYS_RESTRICTION);
    if (!r.allowed) return showPageSnack(`You can update your profile again in ${r.days} day(s).`);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const r = remainingDays(profileLastUpdated, PROFILEINFO_DAYS_RESTRICTION);
    if (!r.allowed) return showPageSnack(`You can update your profile again in ${r.days} day(s).`);

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

      // ✅ apply restriction immediately
      setProfileLastUpdated(new Date().toISOString());

      showPageSnack("Profile updated");
    } catch (err: any) {
      const retryAt = err?.payload?.retryAt ?? err?.data?.retryAt;
      if (err?.status === 429 && retryAt) {
        const days = Math.ceil((new Date(retryAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        showPageSnack(`You can update your profile again in ${Math.max(days, 1)} day(s).`);
      } else {
        showPageSnack(err?.message || "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoButtonClick = () => {
    if (isEditing) return;
    const r = remainingDays(profileLastUpdated, PROFILEINFO_DAYS_RESTRICTION);
    if (!r.allowed) return showPageSnack(`You can update your profile again in ${r.days} day(s).`);
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // block if restricted
    const r = remainingDays(profileLastUpdated, PROFILEINFO_DAYS_RESTRICTION);
    if (!r.allowed) {
      showPageSnack(`You can update your profile again in ${r.days} day(s).`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setProfile(p => ({ ...p, avatar: imageUrl }));

    setUploading(true);
    setUploadProgress(0);

    try {
      const resp: any = await uploadProfileImage(file, (pct) => setUploadProgress(pct));
      const updatedProfile = resp?.data ?? resp;
      const normalized = normalizeProfile(updatedProfile);
      setProfile(normalized);
      setFormData(normalized);

      // ✅ apply restriction immediately
      setProfileLastUpdated(new Date().toISOString());

      showPageSnack('Profile image updated');
    } catch (err: any) {
      const retryAt = err?.response?.data?.retryAt;
      if (err?.response?.status === 429 && retryAt) {
        const days = Math.ceil((new Date(retryAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        showPageSnack(`You can update your profile again in ${Math.max(days, 1)} day(s).`);
      } else {
        const serverMsg = err?.response?.data?.message ?? err?.response?.data?.error;
        showPageSnack(serverMsg || err?.message || 'Upload failed');
      }

      // refresh
      setTimeout(async () => {
        try {
          const apiProfile = await getMyProfile();
          const normalized = normalizeProfile(apiProfile);
          setProfile(normalized);
          setFormData(normalized);
        } catch {}
      }, 1200);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ✅ ADD THIS: handles inputs including nested names like "address.fullAddress"
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      // nested: address.fullAddress / address.areaAssigned / address.barangay
      if (name.startsWith("address.")) {
        const key = name.split(".")[1] as keyof UiProfile["address"];
        return {
          ...prev,
          address: {
            ...prev.address,
            [key]: value,
          },
        };
      }

      // top-level fields
      return {
        ...prev,
        [name]: value,
      } as UiProfile;
    });
  };

  // =============================
  // RENDER
  // =============================
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-[320px_1fr]">
      {/* LEFT SIDEBAR */}
      <div className="rounded-2xl bg-[#cdddc9] p-6 flex flex-col items-center text-center">
        <div className="relative">
          <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-[#e9f1e6] overflow-hidden relative">
            {profile.avatar ? (
              <img src={profile.avatar} className="h-full w-full object-cover" />
            ) : (
              <img src="../../assets/images/lili.png" className="h-full w-full object-cover" />
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-end">
                <div className="w-full px-2 pb-2">
                  <div className="h-2 bg-white/30 rounded overflow-hidden">
                    <div
                      className="h-full bg-[#355842] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handlePhotoButtonClick} // ✅ gated, no UI change
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

        <button
          onClick={openUsernameModal} // ✅ gated
          disabled={isEditing || saving}
          className="mt-6 w-full rounded-xl bg-[#6b8f71] py-2 text-sm text-white disabled:opacity-50"
        >
          Change Username
        </button>

        <button
          onClick={openPasswordModal} // ✅ gated
          disabled={isEditing || saving}
          className="mt-3 w-full rounded-xl bg-[#6b8f71] py-2 text-sm text-white disabled:opacity-50"
        >
          Change Password
        </button>
      </div>

      {/* RIGHT CONTENT */}
      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#1c3c2d]">Personal Information</h3>

          {!isEditing ? (
            <button onClick={startEdit} className="text-[#2E523A]">
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
                onClick={() => { setFormData(profile); setIsEditing(false); }}
                className="rounded-full bg-gray-300 px-4 py-1 text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

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

      {/* ✅ page snackbar (success + restriction notices) */}
      <SnackBar
        visible={!!toast}
        message={toast ?? ''}
        type="success"
        onDismiss={() => setToast(null)}
        duration={2500}
      />

      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          setPasswordLastUpdated(new Date().toISOString());
          showPageSnack("Password updated");
        }}
      />

      <ChangeUsernameModal
        open={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        currentUsername={getUser()?.Username ?? ''}
        onSuccess={(newU) => {
          setUsernameLastUpdated(new Date().toISOString());
          showPageSnack("Username updated");

          // ✅ update Redux + authService cached user so UI reflects immediately
          const u = getUser();
          dispatch(setAuthUser(u ? { ...u, Username: newU } : { Username: newU }));
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

const USERNAME_DAYS_RESTRICTION = 15;
const PASSWORD_DAYS_RESTRICTION = 15;
const PROFILEINFO_DAYS_RESTRICTION = 15;

function remainingDays(lastUpdated: string | null | undefined, restrictionDays: number) {
  if (!lastUpdated) return { allowed: true, days: 0 };
  const last = new Date(lastUpdated);
  if (Number.isNaN(last.getTime())) return { allowed: true, days: 0 };

  const retryAt = new Date(last.getTime() + restrictionDays * 24 * 60 * 60 * 1000);
  const diff = retryAt.getTime() - Date.now();
  if (diff <= 0) return { allowed: true, days: 0 };

  return { allowed: false, days: Math.ceil(diff / (24 * 60 * 60 * 1000)) };
}

export default ProfileInformation;
