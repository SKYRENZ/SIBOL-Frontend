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

    if (user) {
      try {
        const parsed = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('user', JSON.stringify(parsed));
      } catch (e) {
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
    username,
    queueInfo,
    loadingQueue,
    queueError,
    topLogo,
    leftBg,
    leftLogo,
    goBackToLogin,
  } = useAdminPending();

  return (
    <div className="min-h-screen flex bg-white flex-col lg:flex-row">
      {/* ✅ Left Panel - Background image style */}
      <AuthLeftPanel backgroundImage={leftBg} logoImage={leftLogo} />

      {/* Right Panel - Centered content with gradient background */}
      <div className="flex-1 flex items-center justify-center p-12 bg-white">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            {/* Logo - Show on mobile/tablet */}
            <div className="mb-6 lg:hidden">
              <img className="mx-auto w-16 h-16" src={topLogo} alt="SIBOL" />
            </div>

            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Awaiting Admin Approval
            </h2>

            {/* User Info */}
            {username && (
              <p className="text-gray-600 mb-4">
                Account: <span className="font-semibold">{username}</span>
              </p>
            )}

            {/* Queue Position */}
            {loadingQueue ? (
              <div className="py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading queue position...</p>
              </div>
            ) : queueError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{queueError}</p>
              </div>
            ) : queueInfo ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Your position in queue:</p>
                  <div className="text-5xl font-bold text-blue-600">
                    #{queueInfo.position}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    out of {queueInfo.totalPending} pending accounts
                  </p>
                </div>
                
                <div className="border-t border-blue-200 pt-4">
                  <p className="text-sm text-gray-600">Estimated approval time:</p>
                  <p className="text-lg font-semibold text-blue-700 mt-1">
                    {queueInfo.estimatedWaitTime}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Message */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700 text-sm leading-relaxed">
                Your account registration has been submitted successfully. 
                An administrator will review and approve your account soon.
              </p>
            </div>

            {/* Email notification note */}
            <div className="flex items-start text-left bg-green-50 rounded-lg p-4 mb-6">
              <svg className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">Email Notification</p>
                <p className="text-xs text-green-700 mt-1">
                  You'll receive an email at <span className="font-semibold">{email}</span> once your account is approved.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={goBackToLogin}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Back to Login
            </button>

            {/* Help Text */}
            <p className="text-xs text-gray-500 mt-4">
              Questions? Contact support at{' '}
              <a href="mailto:support@sibol.com" className="text-blue-600 hover:underline">
                support@sibol.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPending;