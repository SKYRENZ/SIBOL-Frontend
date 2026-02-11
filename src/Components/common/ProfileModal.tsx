import React from "react";
import FormModal from "./FormModal";
import ProfileInformation from "../Profile/ProfileInformation";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="My Profile"
      width="900px"
    >
      <div className="rounded-2xl bg-[#cdddc9] p-6">
        <ProfileInformation />
      </div>
    </FormModal>
  );
};

export default ProfileModal;
