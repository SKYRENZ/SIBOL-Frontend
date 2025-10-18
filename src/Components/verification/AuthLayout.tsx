import React from 'react';

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
    <div className="auth-shell min-h-screen flex">
      {/* Left Panel */}
      <div 
        className="auth-left flex-1 bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: `url(${leftBg})` }}
      >
        <div className="auth-left-content">
          <img className="auth-wordmark" src={leftLogo} alt="SIBOL" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Top Logo */}
            {showTopLogo && topLogo && (
              <div className="text-center mb-8">
                <img className="mx-auto w-16 h-16" src={topLogo} alt="SIBOL" />
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