import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AdminPending: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSSO, setIsSSO] = useState(false);
  const [username, setUsername] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Get the same images from SignIn/SignUp
  const topLogo = new URL('../assets/images/SIBOLOGOBULB.png', import.meta.url).href;
  const leftBg = new URL('../assets/images/TRASHBG.png', import.meta.url).href;
  const leftLogo = new URL('../assets/images/SIBOLWORDLOGO.png', import.meta.url).href;

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const ssoParam = searchParams.get('sso');
    const usernameParam = searchParams.get('username');

    if (emailParam) {
      setEmail(emailParam);
    }
    if (ssoParam === 'true') {
      setIsSSO(true);
    }
    if (usernameParam) {
      setUsername(usernameParam);
    }

    // If no email or username, redirect to login
    if (!emailParam && !usernameParam) {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const checkAccountStatus = async () => {
    if (!username && !email) {
      alert('Username or email is required to check status');
      return;
    }

    try {
      setCheckingStatus(true);
      
      // Extract username from email if username is not available
      let usernameToCheck = username;
      if (!usernameToCheck && email) {
        // Assume username format is firstname.lastname
        const emailPrefix = email.split('@')[0];
        usernameToCheck = emailPrefix.replace(/[^a-zA-Z.]/g, '').toLowerCase();
      }

      const response = await fetch(`/api/auth/check-status/${usernameToCheck}`);
      const data = await response.json();

      if (data.status === 'active') {
        alert('Your account has been approved! You can now sign in.');
        navigate('/login');
      } else if (data.status === 'email_pending') {
        alert('Please verify your email first before admin approval.');
        navigate(`/email-verification?email=${encodeURIComponent(email)}`);
      } else {
        alert(`Status: ${data.message}`);
      }
    } catch (error) {
      alert('Error checking account status. Please try again later.');
    } finally {
      setCheckingStatus(false);
    }
  };

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
            {/* Logo */}
            <div className="text-center mb-8">
              <img className="mx-auto w-16 h-16" src={topLogo} alt="SIBOL" />
            </div>
            
            {/* Pending Icon with Animation */}
            <div className="text-center mb-8">
              <div className="text-8xl animate-pulse">⏳</div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
              Account Pending Approval
            </h1>
            
            {/* Account Info */}
            {isSSO ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-3">
                  <span className="text-green-600 font-semibold">Google Account Registration Complete!</span>
                </div>
                <div className="bg-white border border-green-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">📧 Email:</span>
                    <span className="font-semibold text-gray-800">{email}</span>
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-green-600 text-sm">✅ Verified by Google</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-3">
                  <span className="text-blue-600 font-semibold">Email Verification Complete!</span>
                </div>
                <div className="bg-white border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">📧 Email:</span>
                    <span className="font-semibold text-gray-800">{email}</span>
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    <span className="text-blue-600 text-sm">✅ Verified</span>
                  </div>
                </div>
              </div>
            )}
            
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
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  checkingStatus 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                onClick={checkAccountStatus}
                disabled={checkingStatus}
              >
                {checkingStatus ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Checking...
                  </div>
                ) : (
                  'Check Approval Status'
                )}
              </button>
              
              <button 
                className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                onClick={() => navigate('/login')}
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