import React, { useState } from "react";
import { CalendarDays, X } from "lucide-react";

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    maintenance: "",
    contact: "",
    area: "",
    date: "",
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Data to send to backend:", formData);
    // 🔜 later: replace with fetch/axios POST request
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-[600px] p-6 relative border border-gray-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-green-900 hover:text-green-700"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="text-green-800" size={22} />
          <div>
            <h2 className="text-lg font-semibold text-green-800">
              Add Schedule
            </h2>
            <p className="text-gray-600 text-sm">
              Fill out the form below to add a new collection schedule.
            </p>
          </div>
        </div>

        <hr className="border-gray-300 mb-4" />

        {/* Form Section */}
        <form className="space-y-4">
          {/* Maintenance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance
            </label>
            <input
              type="text"
              name="maintenance"
              value={formData.maintenance}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-green-600 focus:outline-none"
              placeholder="Enter maintenance name"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact of Maintenance
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-green-600 focus:outline-none"
              placeholder="Enter contact number or email"
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area
            </label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-green-600 focus:outline-none"
              placeholder="Enter area (e.g., Dahlia St., Petunia St.)"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Collection
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-green-600 focus:outline-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="bg-green-800 hover:bg-green-900 text-white font-medium px-6 py-2 rounded-md"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddScheduleModal;
