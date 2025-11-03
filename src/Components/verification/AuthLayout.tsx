import React from 'react';
import AuthLeftPanel from '../common/AuthLeftPanel';

interface AuthLayoutProps {
  children: React.ReactNode;
  leftBg: string;
  leftLogo: string;
  topLogo?: string;
  showTopLogo?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  leftBg, 
  leftLogo, 
  topLogo,
  showTopLogo = true 
}) => {
  return (
    <div className="min-h-screen flex bg-white flex-col lg:flex-row">
      {/* Left Panel - Background image style (no white background) */}
      <AuthLeftPanel backgroundImage={leftBg} logoImage={leftLogo} />

      {/* Right Panel - Full width on mobile/tablet, half on desktop */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
            {/* Top Logo - Show on mobile/tablet, hide on desktop (since left panel shows logo) */}
            {showTopLogo && topLogo && (
              <div className="text-center mb-6 lg:hidden">
                <img className="mx-auto w-12 h-12 sm:w-16 sm:h-16" src={topLogo} alt="SIBOL" />
              </div>
            )}
            
            {/* Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;