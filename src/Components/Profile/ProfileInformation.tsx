import React, { useRef, useState } from "react";

// =============================
// MOCK DATA (Replace with backend later)
// =============================
const mockProfile = {
  firstName: "Mark Laurenz",
  middleInitial: "R",
  lastName: "Listangco",
  role: "Barangay Staff",
  email: "siboluc@gmail.com",
  phone: "+639 123 456 789",
  position: "Barangay Staff",
  suffix: "-",
  avatar: "", // image url
  address: {
    fullAddress: "Congressional Road ext. Bagumbong",
    areaAssigned: "Petunia Street",
    barangay: "165",
  },
};

const ProfileInformation: React.FC = () => {
  const [profile, setProfile] = useState(mockProfile);
  const [formData, setFormData] = useState(profile);

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // =============================
  // HANDLERS
  // =============================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditingPersonal(false);
    setIsEditingAddress(false);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditingPersonal(false);
    setIsEditingAddress(false);
  };

  // =============================
  // PHOTO UPLOAD
  // =============================
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
            {profile.firstName} {profile.middleInitial}. {profile.lastName}
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
          onEdit={() => setIsEditingPersonal(true)}
          onSave={handleSave}
          onCancel={handleCancel}
        />

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
              <Info label="First Name" value={profile.firstName} />
              <Info label="Middle Initial" value={profile.middleInitial} />
              <Info label="Last Name" value={profile.lastName} />
              <Info label="Suffix" value={profile.suffix} />
              <Info label="Email Address" value={profile.email} />
              <Info label="Phone Number" value={profile.phone} />
              <Info label="Position" value={profile.position} />
            </>
          )}
        </div>
      </div>

      {/* ================= Address ================= */}
      <div className="rounded-xl bg-white p-6 shadow">
        <Header
          title="Address"
          isEditing={isEditingAddress}
          onEdit={() => setIsEditingAddress(true)}
          onSave={handleSave}
          onCancel={handleCancel}
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
              <Info label="Full Address" value={profile.address.fullAddress} />
              <Info label="Area Assigned" value={profile.address.areaAssigned} />
              <Info label="Barangay" value={profile.address.barangay} />
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
}: any) => (
  <div className="mb-4 flex items-center justify-between">
    <h3 className="font-semibold text-[#1c3c2d]">{title}</h3>
    {!isEditing ? (
      <button onClick={onEdit} className="rounded-full bg-[#6b8f71] px-4 py-1 text-xs text-white">
        Edit
      </button>
    ) : (
      <ActionButtons onSave={onSave} onCancel={onCancel} />
    )}
  </div>
);

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-[#1c3c2d]">{value}</p>
  </div>
);

const Input = ({ label, name, value, onChange }: any) => (
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

const ActionButtons = ({ onSave, onCancel }: any) => (
  <div className="flex gap-2">
    <button onClick={onSave} className="rounded-full bg-[#2E523A] px-4 py-1 text-xs text-white">
      Save
    </button>
    <button onClick={onCancel} className="rounded-full bg-gray-300 px-4 py-1 text-xs">
      Cancel
    </button>
  </div>
);

export default ProfileInformation;
