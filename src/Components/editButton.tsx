import React from 'react';

interface EditButtonProps {
  onClick: () => void;
  disable?: boolean;
  label?: string;
}

const EditButton: React.FC<EditButtonProps> = ({ onClick, label = 'Edit' }) => {
  return (
    <button
      onClick={onClick}
      className="bg-[#355842] text-white font-bold px-6 py-2 rounded-full hover:bg-[#2a4a36] transition"
    >
      {label}
    </button>
  );
};

export default EditButton;
