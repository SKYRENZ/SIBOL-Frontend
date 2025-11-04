import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminPending } from '../hooks/useAdminPending';
import AuthLeftPanel from '../Components/common/AuthLeftPanel';

const AdminPending: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token') || params.get('access_token');
    const user = params.get('user');
    const auth = params.get('auth');

    if (token) localStorage.setItem('token', token);
    if (user) {
      try {
        const parsed = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('user', JSON.stringify(parsed));
      } catch (e) {
        console.warn('Failed to parse SSO user on AdminPending', e);
      }
    }

    if (token) {
      window.history.replaceState({}, '', location.pathname);
      navigate('/dashboard', { replace: true });
    } else if (auth === 'fail') {
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  const {
    email,
    isSSO,
    checkingStatus,
    topLogo,
    leftBg,
    leftLogo,
    checkAccountStatus,
    goBackToLogin,
  } = useAdminPending();

  return (
    <div className="min-h-screen flex bg-white flex-col lg:flex-row">
      {/* Left Panel - Background image style (no white background) */}
      <AuthLeftPanel backgroundImage={leftBg} logoImage={leftLogo} />

      {/* Right Panel - Full width on mobile/tablet, half on desktop */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">

            {/* Logo - Show on mobile/tablet */}
            <div className="text-center mb-6 lg:hidden">
              <img className="mx-auto w-12 h-12 sm:w-16 sm:h-16" src={topLogo} alt="SIBOL" />
            </div>

            {/* Pending Icon with Animation */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="text-4xl sm:text-5xl animate-pulse mb-4 sm:mb-6">⏳</div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">
              Account Pending Approval
            </h1>
            
            {/* Account Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-center mb-3">
                <span className="text-sm sm:text-base text-green-600 font-semibold text-center">
                  {isSSO ? 'Google Registration Complete!' : 'Email Verification Complete!'}
                </span>
              </div>
              <div className="bg-white border border-blue-100 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                  <span className="text-sm sm:text-base text-gray-600">Email:</span>
                  <span className="text-sm sm:text-base font-semibold text-gray-800 break-words text-center">
                    {email}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Admin Review Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🔍</div>
                <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-2 sm:mb-3">
                  Admin Review Required
                </h3>
                <p className="text-xs sm:text-sm text-yellow-700 mb-2">
                  Your account is currently being reviewed by our administrators.
                </p>
                <p className="text-xs sm:text-sm text-yellow-700">
                  You will be able to sign in once your account is approved.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">              
              <button 
                className="w-full py-2.5 sm:py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                onClick={goBackToLogin}
              >
                Back to Login
              </button>
            </div>
            
            {/* Footer Info */}
            <div className="border-t border-gray-200 pt-4 sm:pt-6">
              <div className="text-center space-y-2 sm:space-y-3">
                <p className="text-gray-600 text-xs sm:text-sm">
                  <span className="font-semibold">Questions?</span> Contact support if you need assistance with your account approval.
                </p>
                <p className="text-gray-600 text-xs sm:text-sm flex items-center justify-center flex-wrap gap-2">
                  <span>⏰</span>
                  <span>Account reviews typically take 1-2 business days.</span>
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