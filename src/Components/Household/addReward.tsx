import React, { useState } from "react";
import { X, Upload } from "lucide-react";

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
            <label>Reward</label>
            <input
              type="text"
              name="reward"
              placeholder="e.g. 1kg of Rice"
              value={formData.reward}
              onChange={handleChange}
            />

            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option>Available</option>
              <option>Not Available</option>
            </select>

            <label>Eligibility</label>
            <input
              type="text"
              name="eligibility"
              placeholder="e.g. 200 Points"
              value={formData.eligibility}
              onChange={handleChange}
            />
          </div>

          <div className="upload-section">
            <div className="upload-box">
              <Upload size={32} className="upload-icon" />
              <p className="upload-title">Click to Upload or drag & drop file</p>
              <p className="upload-subtext">maximum file size 10MB</p>
              <input type="file" onChange={handleImageUpload} />

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
