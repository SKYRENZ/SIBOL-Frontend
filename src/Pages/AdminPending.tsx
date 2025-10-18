import React from 'react';
import { useAdminPending } from '../hooks/useAdminPending';

const AdminPending: React.FC = () => {
  const {
    // State
    email,
    isSSO,
    checkingStatus,
    
    // Assets
    topLogo,
    leftBg,
    leftLogo,
    
    // Actions
    checkAccountStatus,
    goBackToLogin,
  } = useAdminPending();

  return (
    <div className="auth-shell min-h-screen flex">
      {/* Left Panel - Same as SignIn */}
      <div 
        className="auth-left flex-1 bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{ backgroundImage: `url(${leftBg})` }}
      >
        <div className="auth-left-content">
          <img className="auth-wordmark" src={leftLogo} alt="SIBOL" />
        </div>
      </div>

      {/* Right Panel - Admin Pending Content */}
      <div className="auth-right flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-lg shadow-lg p-8">
            
            {/* Pending Icon with Animation */}
            <div className="text-center mb-8">
              <div className="text-5xl animate-pulse mb-6">⏳</div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
              Account Pending Approval
            </h1>
            
            {/* Account Info - UNIFIED DESIGN */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-3">
                <span className="text-green-600 font-semibold">
                  {isSSO ? 'Google Registration Complete!' : 'Email Verification Complete!'}
                </span>
              </div>
              <div className="bg-white border border-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-gray-800 break-words">{email}</span>
                </div>
              </div>
            </div>
            
            {/* Admin Review Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">Admin Review Required</h3>
                <p className="text-yellow-700 mb-2">Your account is currently being reviewed by our administrators.</p>
                <p className="text-yellow-700">You will be able to sign in once your account is approved.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-8">              
              <button 
                className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                onClick={goBackToLogin}
              >
                Back to Login
              </button>
            </div>
            
            {/* Footer Info */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center space-y-3">
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold">Questions?</span> Contact support if you need assistance with your account approval.
                </p>
                <p className="text-gray-600 text-sm flex items-center justify-center">
                  <span className="mr-2">⏰</span>
                  Account reviews typically take 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPending;