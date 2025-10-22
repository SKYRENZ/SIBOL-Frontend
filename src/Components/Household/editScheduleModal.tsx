import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    maintenance: string;
    contact: string;
    area: string[]; // multiple areas
    date: string;
  } | null;
  onSave: (data: {
    maintenance: string;
    contact: string;
    area: string[];
    date: string;
  }) => void;
}

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    maintenance: "",
    contact: "",
    area: [] as string[],
    date: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAreaAdd = (areaName: string) => {
    setFormData((prev) => ({
      ...prev,
      area: [...prev.area, areaName],
    }));
  };

  const handleAreaRemove = (areaName: string) => {
    setFormData((prev) => ({
      ...prev,
      area: prev.area.filter((a) => a !== areaName),
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-8 relative border border-gray-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="flex items-center mb-6 gap-3">
          <div className="text-green-800">
            {/* Optional icon placeholder */}
            🗓️
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-green-800">
              Edit Schedule
            </h2>
            <p className="text-gray-600">
              Modify your scheduled collection area or assignment.
            </p>
          </div>
        </div>

        <hr className="border-gray-200 mb-6" />

        {/* Form */}
        <form className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance
            </label>
            <input
              type="text"
              name="maintenance"
              value={formData.maintenance}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-600 focus:outline-none"
              placeholder="Enter maintenance name"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact of Maintenance
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-600 focus:outline-none"
              placeholder="Enter contact number or email"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area
            </label>
            <div className="w-full border border-gray-300 rounded-md px-3 py-2 focus-within:ring-green-600 focus-within:outline-none">
            {formData.area.map((areaName, idx) => (
              <span
                key={idx}
                className="inline-flex items-center bg-[#7B9B7B] text-white text-sm font-medium rounded-full px-4 py-2 mr-2 mb-2 transition"
              >
                {areaName}
                <button
                type="button"
                onClick={() => handleAreaRemove(areaName)}
                className="ml-2 text-white text-lg font-bold hover:text-gray-200 focus:outline-none p-0 bg-transparent border-none"
              >
                ×
              </button>
              </span>
            ))}

              <input
                type="text"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                    handleAreaAdd((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                    e.preventDefault();
                  }
                }}
                className="w-full border-none focus:ring-0 focus:outline-none text-sm px-0 py-1"
                placeholder="Type area and hit Enter"
              />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Collection
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-600 focus:outline-none"
            />
          </div>
        </form>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-green-800 text-white px-6 py-2 rounded-md hover:bg-green-900 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditScheduleModal;
