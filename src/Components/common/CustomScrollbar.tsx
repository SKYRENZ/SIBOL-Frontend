import React from 'react';

interface CustomScrollbarProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

const CustomScrollbar: React.FC<CustomScrollbarProps> = ({ 
  children, 
  className = '',
  maxHeight = 'max-h-96'
}) => {
  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #355842 0%, #4a7c5d 100%);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2d4a37 0%, #3d6a4d 100%);
        }
      `}</style>
      <div className={`custom-scrollbar overflow-y-auto ${maxHeight} ${className}`}>
        {children}
      </div>
    </>
  );
};

export default CustomScrollbar;