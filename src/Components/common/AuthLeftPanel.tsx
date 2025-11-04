import React from 'react';

interface AuthLeftPanelProps {
  backgroundImage: string;
  logoImage: string;
  whiteBackground?: boolean;
}

const AuthLeftPanel: React.FC<AuthLeftPanelProps> = ({ backgroundImage, logoImage, whiteBackground = false }) => {
  return (
    <div 
      className={`hidden lg:flex lg:flex-1 relative items-center justify-start px-8 xl:px-12 py-12 min-h-screen bg-bottom bg-no-repeat bg-contain border-r border-gray-200 shadow-[8px_0_20px_-16px_rgba(0,0,0,0.35)] ${whiteBackground ? 'bg-white' : ''}`}
      style={!whiteBackground ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      <div className="w-full max-w-xl flex flex-col items-start text-left gap-5 ml-8 xl:ml-12">
        <img 
          className="w-56 xl:w-64 h-auto" 
          src={logoImage} 
          alt="SIBOL" 
        />
      </div>
      
      {/* Trash bin image when white background is enabled */}
      {whiteBackground && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <img 
            className="w-full max-w-md xl:max-w-lg h-auto object-contain" 
            src={backgroundImage} 
            alt="SIBOL Trash Bin" 
          />
        </div>
      )}
    </div>
  );
};

export default AuthLeftPanel;