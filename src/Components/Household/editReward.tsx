import React, { useState, useEffect } from "react";
import { X, Gift, ImageIcon } from "lucide-react";
import { useUpdateReward } from "../../hooks/household/useRewardHooks";
import type { Reward } from "../../services/rewardService";
import { uploadRewardImage } from "../../services/rewardService";
import FormModal from "../common/FormModal";
import SnackBar from "../common/SnackBar";

interface EditRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  reward: Reward | null;
}

const EditRewardModal: React.FC<EditRewardModalProps> = ({ isOpen, onClose, onSave, reward }) => {
  const { updateReward, loading, error } = useUpdateReward();

  // ✅ snackbar state (declare BEFORE using showSnack)
  const [snackKey, setSnackKey] = useState<number>(0);
  const [snack, setSnack] = useState<{
    visible: boolean;
    message: string;
    type: "error" | "success" | "info";
  }>({ visible: false, message: "", type: "info" });

  const showSnack = (message: string, type: "error" | "success" | "info" = "info") => {
    setSnackKey((k) => k + 1);
    setSnack({ visible: true, message, type });
  };

  const dismissSnack = () => setSnack((prev) => ({ ...prev, visible: false }));

  const [formData, setFormData] = useState({
    Item: "",
    Description: "",
    Points_cost: "",
    Quantity: "",
  });

  const [errors, setErrors] = useState({
    Item: "",
    Points_cost: "",
    Quantity: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (reward?.Reward_id) {
      setFormData({
        Item: reward.Item || "",
        Description: reward.Description || "",
        Points_cost: String(reward.Points_cost || ""),
        Quantity: String(reward.Quantity || ""),
      });
      setImagePreview(reward.Image_url || null);
      setSelectedFile(null);
      setRemoveImage(false);
    }
  }, [reward]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const okType = /^image\/(jpeg|png)$/i.test(file.type);
    if (!okType) {
      showSnack("Please select a PNG or JPEG image", "error");
      e.currentTarget.value = "";
      return;
    }

    const MAX = 5 * 1024 * 1024;
    if (file.size > MAX) {
      showSnack("File size must be less than 5MB", "error");
      e.currentTarget.value = "";
      return;
    }

    setSelectedFile(file);
    setRemoveImage(false);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    e.currentTarget.value = "";
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setRemoveImage(true);
  };

  const validateForm = (): boolean => {
    const newErrors = {
      Item: "",
      Points_cost: "",
      Quantity: "",
    };

    if (!formData.Item.trim()) {
      newErrors.Item = "Reward name is required";
    }

    const pointsCost = Number(formData.Points_cost);
    if (!formData.Points_cost || pointsCost <= 0) {
      newErrors.Points_cost = "Points cost must be greater than 0";
    }

    const quantity = Number(formData.Quantity);
    if (!formData.Quantity || quantity <= 0) {
      newErrors.Quantity = "Quantity must be greater than 0";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((err) => err !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !reward?.Reward_id) return;

    try {
      const patch: any = {
        Item: formData.Item.trim(),
        Description: formData.Description.trim() || undefined,
        Points_cost: Number(formData.Points_cost),
        Quantity: Number(formData.Quantity),
      };

      if (selectedFile) {
        const { imageUrl, publicId } = await uploadRewardImage(selectedFile);
        patch.Image_url = imageUrl;
        patch.Image_public_id = publicId;
      }

      if (removeImage) {
        patch.Image_url = null;
        patch.Image_public_id = null;
      }

      await updateReward(reward.Reward_id, patch);

      onSave();
      onClose();
    } catch (err: any) {
      console.error("Failed to update reward:", err);
      showSnack(err?.message ?? "Failed to update reward", "error");
    }
  };

  const handleClose = () => {
    setErrors({
      Item: "",
      Points_cost: "",
      Quantity: "",
    });
    setImagePreview(null);
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen || !reward) return null;

  return (
    <>
      <FormModal isOpen={isOpen} onClose={handleClose} title="Edit Reward" width="720px">
        <form onSubmit={handleSubmit} className="p-0">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>{error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Name
                </label>
                <input
                  type="text"
                  name="Item"
                  value={formData.Item}
                  onChange={handleChange}
                  placeholder="e.g. 1kg of Rice"
                  className={`w-full px-4 py-3 border rounded-lg text-sm transition-colors ${
                    errors.Item
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                  } outline-none`}
                  disabled={loading}
                />
                {errors.Item && <p className="text-red-500 text-xs mt-1.5">{errors.Item}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="Description"
                  value={formData.Description}
                  onChange={handleChange}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200 outline-none resize-none transition-colors"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points Cost
                </label>
                <input
                  type="number"
                  name="Points_cost"
                  value={formData.Points_cost}
                  onChange={handleChange}
                  placeholder="e.g. 200 Points"
                  min="1"
                  className={`w-full px-4 py-3 border rounded-lg text-sm transition-colors ${
                    errors.Points_cost
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                  } outline-none`}
                  disabled={loading}
                />
                {errors.Points_cost && <p className="text-red-500 text-xs mt-1.5">{errors.Points_cost}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="Quantity"
                  value={formData.Quantity}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  min="1"
                  className={`w-full px-4 py-3 border rounded-lg text-sm transition-colors ${
                    errors.Quantity
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                  } outline-none`}
                  disabled={loading}
                />
                {errors.Quantity && <p className="text-red-500 text-xs mt-1.5">{errors.Quantity}</p>}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reward Image
              </label>

              {imagePreview ? (
                <div className="flex-1 border-2 border-gray-300 rounded-2xl overflow-hidden relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-gray-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <div className="w-16 h-16 mb-4 text-gray-400">
                    <ImageIcon className="w-16 h-16" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Click to Upload or drag & drop file
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    PNG or JPEG only — max file size 5MB
                  </p>
                  <span className="px-5 py-2 bg-[#2d5f4a] hover:bg-[#234a39] text-white rounded-xl text-sm font-medium transition-colors">
                    Choose File
                  </span>
                </label>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-[#2d5f4a] hover:bg-[#234a39] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[96px] rounded-[6px]"
              style={{ borderRadius: '6px' }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Reward"
              )}
            </button>
          </div>
        </form>
      </FormModal>

      <SnackBar
        key={snackKey}
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={dismissSnack}
      />
    </>
  );
};

export default EditRewardModal;