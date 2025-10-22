import React, { useState } from "react";
import { CalendarDays } from "lucide-react";
import FormModal from "../common/FormModal";
import FormField from "../common/FormField";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Schedule"
      subtitle="Fill out the form below to add a new collection schedule."
      icon={<CalendarDays size={22} />}
      width="600px"
    >

      <form className="space-y-4">
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

        <FormField
          label="Area"
          name="area"
          type="text"
          value={formData.area}
          onChange={handleChange}
          placeholder="Enter area (e.g., Dahlia St., Petunia St.)"
        />

        <FormField
          label="Date of Collection"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
        />

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#2E523A] hover:bg-[#3b6b4c] text-white font-medium px-8 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40"
          >
            Save Schedule
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default AddScheduleModal;
