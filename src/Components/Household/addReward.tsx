import React, { useState } from "react";
import { Award, Upload, Image, X } from "lucide-react";

interface AddRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const AddRewardModal: React.FC<AddRewardModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    reward: "",
    status: "Available",
    eligibility: "",
    images: [] as File[],
  });

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) =>
      ["image/png", "image/jpeg"].includes(file.type)
    );

    if (validFiles.length !== files.length) {
      alert("Only PNG and JPEG files are allowed.");
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl relative border border-gray-200">
        {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#355842] text-white rounded-full p-1 hover:bg-[#2e4a36] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 🏆 Header */}
        <div className="flex items-start justify-between px-8 pt-8">
          <div className="flex items-start gap-3">
            <Award className="w-10 h-10 text-[#355842]" />
            <div>
              <h2 className="text-2xl font-semibold text-[#355842]">Rewards</h2>
              <p className="text-[#355842]/80 text-sm">
                Give back to your community with rewards!
              </p>
            </div>
          </div>
          <p className="text-gray-400 text-sm font-medium mt-1">
            Date Added: {currentDate}
          </p>
        </div>

        {/* 📋 Form Content */}
        <div className="px-8 pb-8 pt-6 flex gap-8">
          {/* Left Form */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Reward */}
            <div>
              <label className="block text-[#355842] font-medium mb-1 text-sm">
                Reward
              </label>
              <input
                type="text"
                name="reward"
                value={formData.reward}
                onChange={handleChange}
                placeholder="e.g. 1kg of Rice"
                className="w-full border border-[#355842] rounded-md px-3 py-2 text-sm text-[#355842] bg-white placeholder-gray-400 focus:ring-2 focus:ring-[#AFC8AD] focus:outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[#355842] font-medium mb-1 text-sm">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-[#355842] rounded-md px-3 py-2 text-sm text-[#355842] bg-white focus:ring-2 focus:ring-[#AFC8AD] focus:outline-none appearance-none"
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
              </select>
            </div>

            {/* Eligibility */}
            <div>
              <label className="block text-[#355842] font-medium mb-1 text-sm">
                Eligibility
              </label>
              <input
                type="text"
                name="eligibility"
                value={formData.eligibility}
                onChange={handleChange}
                placeholder="e.g. 200 Points"
                className="w-full border border-[#355842] rounded-md px-3 py-2 text-sm text-[#355842] bg-white placeholder-gray-400 focus:ring-2 focus:ring-[#AFC8AD] focus:outline-none"
              />
            </div>
          </div>

          {/* 📷 Upload Section */}
          <div className="flex-1 flex flex-col items-center justify-start border border-dashed border-[#AFC8AD] rounded-xl p-6 text-center relative">
            <Upload className="w-10 h-10 text-[#355842] mb-3" />
            <p className="text-[#355842] font-medium text-sm">
              Click to Upload or drag & drop file
            </p>
            <p className="text-xs text-gray-500 mb-3">
              PNG or JPEG only — max file size 10MB
            </p>

            <input
              type="file"
              id="reward-image"
              accept=".png, .jpeg"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />

            <label
              htmlFor="reward-image"
              className="cursor-pointer px-4 py-1.5 border border-[#355842] text-[#355842] text-sm rounded-md hover:bg-[#355842] hover:text-white transition"
            >
              Choose File
            </label>

            {/* Uploaded Files List */}
            {formData.images.length > 0 && (
              <div className="mt-4 w-full flex flex-col gap-2">
                {formData.images.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border border-[#D8E3D8] rounded-md px-3 py-2 text-sm text-[#355842] bg-[#F8FAF8]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Image className="w-4 h-4 text-[#355842] flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="text-gray-400 hover:text-red-500 text-xs font-semibold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 💾 Save Button */}
        <div className="flex justify-center pb-8">
          <button
            onClick={handleSave}
            className="bg-[#355842] text-white font-medium px-12 py-2.5 rounded-md hover:bg-[#2e4a36] transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRewardModal;
