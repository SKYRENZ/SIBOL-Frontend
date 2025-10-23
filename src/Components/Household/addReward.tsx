import React, { useState } from "react";
import { X, Upload } from "lucide-react";
import FormField from "../common/FormField";

interface AddRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const AddRewardModal: React.FC<AddRewardModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    reward: "",
    status: "Available",
    eligibility: "",
    image: null as File | null,
  });

  

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="reward-modal-overlay">
      <div className="reward-modal-container">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="reward-header">
          <h2>Rewards</h2>
          <p>Give back to your community with rewards!</p>
          <span className="date-text">Date Added: 11/21/2003</span>
        </div>

        <hr />

        <div className="reward-form">
          <div className="left-section">
            <FormField
              label="Reward"
              name="reward"
              value={formData.reward}
              onChange={(e) => setFormData((p) => ({ ...p, reward: (e.target as HTMLInputElement).value }))}
              placeholder="e.g. 1kg of Rice"
              variant="transparent"
            />

            <FormField
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={(e) => setFormData((p) => ({ ...p, status: (e.target as HTMLSelectElement).value }))}
              options={[
                { value: "Available", label: "Available" },
                { value: "Not Available", label: "Not Available" },
              ]}
              variant="transparent"
            />

            <FormField
              label="Eligibility"
              name="eligibility"
              value={formData.eligibility}
              onChange={(e) => setFormData((p) => ({ ...p, eligibility: (e.target as HTMLInputElement).value }))}
              placeholder="e.g. 200 Points"
              variant="transparent"
            />
          </div>

          <div className="upload-section">
            <div className="upload-box">
              <Upload size={32} className="upload-icon" />
              <p className="upload-title">Click to Upload or drag & drop file</p>
              <p className="upload-subtext">maximum file size 10MB</p>
              <input type="file" className="hidden" id="reward-file" onChange={handleImageUpload} />
              <label htmlFor="reward-file" className="choose-file-btn">Choose File</label>

              {formData.image && (
                <div className="uploaded-file">
                  📷 {formData.image.name}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="save-btn-wrapper">
          <button className="save-btn" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default AddRewardModal;
