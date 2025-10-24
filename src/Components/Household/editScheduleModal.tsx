import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import FormModal from "../common/FormModal";
import FormField from "../common/FormField";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAreaAdd = (areaName: string) => {
    if (!areaName) return;
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
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Schedule"
      subtitle="Modify your scheduled collection area or assignment."
      width="720px"
    >
      <form className="grid grid-cols-2 gap-x-8 gap-y-4">
        <FormField
          label="Maintenance"
          name="maintenance"
          type="text"
          value={formData.maintenance}
          onChange={handleChange}
          placeholder="Enter maintenance name"
        />

        <FormField
          label="Contact of Maintenance"
          name="contact"
          type="text"
          value={formData.contact}
          onChange={handleChange}
          placeholder="Enter contact number or email"
        />

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

        <FormField
          label="Date of Collection"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
        />
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
    </FormModal>
  );
};

export default EditScheduleModal;
