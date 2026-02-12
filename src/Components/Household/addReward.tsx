import React, { useState } from "react";
import { ImageIcon } from "lucide-react";
import { useCreateReward } from "../../hooks/household/useRewardHooks";
import { updateReward, uploadRewardImage } from "../../services/rewardService";
import FormModal from "../common/FormModal";
import SnackBar from "../common/SnackBar";
import CustomScrollbar from "../common/CustomScrollbar";

interface AddRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const AddRewardModal: React.FC<AddRewardModalProps> = ({ isOpen, onClose, onSave }) => {
  const { createReward, loading, error } = useCreateReward();

  // ✅ snackbar state FIRST (fix ordering)
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
    Account_id: "",
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

  // ✅ digit-only helpers
  const digitsOnly = (v: string, maxLen: number) => v.replace(/\D/g, "").slice(0, maxLen);

  const blockNonDigitKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];
    if (allowed.includes(e.key)) return;

    // allow copy/paste/select all
    if (e.ctrlKey || e.metaKey) return;

    // allow digits only
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = digitsOnly(e.target.value, 6); // ✅ max 6 digits
    setFormData((prev) => ({ ...prev, Points_cost: cleaned }));
    if (errors.Points_cost) setErrors((prev) => ({ ...prev, Points_cost: "" }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = digitsOnly(e.target.value, 4); // ✅ max 4 digits
    setFormData((prev) => ({ ...prev, Quantity: cleaned }));
    if (errors.Quantity) setErrors((prev) => ({ ...prev, Quantity: "" }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // route numeric fields to sanitizers
    if (name === "Points_cost") return handlePointsChange(e as React.ChangeEvent<HTMLInputElement>);
    if (name === "Quantity") return handleQuantityChange(e as React.ChangeEvent<HTMLInputElement>);

    setFormData((prev) => ({ ...prev, [name]: value }));
    if ((errors as any)[name]) setErrors((prev) => ({ ...prev, [name]: "" as any }));
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

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    e.currentTarget.value = "";
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
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
    if (!validateForm()) return;

    try {
      const result = await createReward({
        Item: formData.Item.trim(),
        Description: formData.Description.trim() || undefined,
        Points_cost: Number(formData.Points_cost),
        Quantity: Number(formData.Quantity),
      });

      if (selectedFile && result?.Reward_id) {
        const { imageUrl, publicId } = await uploadRewardImage(selectedFile);
        await updateReward(result.Reward_id, {
          Image_url: imageUrl,
          Image_public_id: publicId,
        });
      }

      // ✅ include Account_id in reset
      setFormData({ Account_id: "", Item: "", Description: "", Points_cost: "", Quantity: "" });
      setImagePreview(null);
      setSelectedFile(null);

      onSave();
      onClose();
    } catch (err: any) {
      console.error("Failed to create reward:", err);
      showSnack(err?.message ?? "Failed to create reward", "error");
    }
  };

  const handleClose = () => {
    // ✅ include Account_id in reset
    setFormData({ Account_id: "", Item: "", Description: "", Points_cost: "", Quantity: "" });
    setErrors({ Item: "", Points_cost: "", Quantity: "" });
    setImagePreview(null);
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <FormModal isOpen={isOpen} onClose={handleClose} title="Add Reward" width="720px">
        <CustomScrollbar maxHeight="max-h-[calc(100vh-220px)]" className="pr-6 px-4">
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
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="Points_cost"
                    value={formData.Points_cost}
                    onChange={handleChange}
                    onKeyDown={blockNonDigitKey}
                    maxLength={6} // ✅ 6 digits max
                    placeholder="e.g. 200"
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
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="Quantity"
                    value={formData.Quantity}
                    onChange={handleChange}
                    onKeyDown={blockNonDigitKey}
                    maxLength={4} // ✅ 4 digits max
                    placeholder="e.g. 50"
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
            <div className="flex justify-end mt-8">
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
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </CustomScrollbar>
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

export default AddRewardModal;
