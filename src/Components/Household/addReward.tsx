import React, { useState } from "react";
import { X } from "lucide-react";
import { useCreateReward } from "../../hooks/household/useRewardHooks";

interface AddRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const AddRewardModal: React.FC<AddRewardModalProps> = ({ isOpen, onClose, onSave }) => {
  const { createReward, loading, error } = useCreateReward();
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
      await createReward({
        Item: formData.Item.trim(),
        Description: formData.Description.trim() || undefined,
        Points_cost: Number(formData.Points_cost),
        Quantity: Number(formData.Quantity),
      });

      setFormData({
        Item: "",
        Description: "",
        Points_cost: "",
        Quantity: "",
      });
      
      onSave();
      onClose();
    } catch (err) {
      console.error("Failed to create reward:", err);
    }
  };

  const handleClose = () => {
    setFormData({
      Item: "",
      Description: "",
      Points_cost: "",
      Quantity: "",
    });
    setErrors({
      Item: "",
      Points_cost: "",
      Quantity: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-[#355842] to-[#2e4a36]">
          <h2 className="text-xl font-bold text-white">Add New Reward</h2>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Server Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r text-sm">
              <p className="font-medium">Authentication required</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}

          {/* Reward Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reward Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Item"
              value={formData.Item}
              onChange={handleChange}
              placeholder="e.g., Eco Bag, Water Bottle"
              className={`w-full px-4 py-3 border-2 rounded-xl text-sm transition-all ${
                errors.Item
                  ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  : "border-gray-200 focus:border-[#355842] focus:ring-4 focus:ring-green-50"
              } outline-none`}
              disabled={loading}
            />
            {errors.Item && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <span>⚠</span> {errors.Item}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              placeholder="Optional description"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#355842] focus:ring-4 focus:ring-green-50 outline-none resize-none transition-all"
              disabled={loading}
            />
          </div>

          {/* Points Cost & Quantity Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Points Cost */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Points Cost <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="Points_cost"
                value={formData.Points_cost}
                onChange={handleChange}
                placeholder="100"
                min="1"
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm transition-all ${
                  errors.Points_cost
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-gray-200 focus:border-[#355842] focus:ring-4 focus:ring-green-50"
                } outline-none`}
                disabled={loading}
              />
              {errors.Points_cost && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.Points_cost}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="Quantity"
                value={formData.Quantity}
                onChange={handleChange}
                placeholder="50"
                min="1"
                className={`w-full px-4 py-3 border-2 rounded-xl text-sm transition-all ${
                  errors.Quantity
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-gray-200 focus:border-[#355842] focus:ring-4 focus:ring-green-50"
                } outline-none`}
                disabled={loading}
              />
              {errors.Quantity && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.Quantity}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#355842] to-[#2e4a36] text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </span>
              ) : (
                "Add Reward"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRewardModal;
