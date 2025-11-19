import React, { useEffect, useState, useRef } from 'react';
import { useSignUp } from '../hooks/signup/useSignUp';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchJson } from '../services/apiClient';
import { isAuthenticated } from '../services/auth';

const SignUp: React.FC = () => {
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isBarangayOpen, setIsBarangayOpen] = useState(false);
  const barangayRef = useRef<HTMLDivElement>(null);
  
  const {
    // State
    role,
    setRole,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    barangay,
    setBarangay,
    barangays,
    errors,
    isSSO,
    touched,
    validateField,
    loading,
    
    // Assets
    signupImage,
    
    // Actions
    handleSignUp,
    goToLogin,
    serverError,
    pendingEmail,
  } = useSignUp();

  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (barangayRef.current && !barangayRef.current.contains(event.target as Node)) {
        setIsBarangayOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        // ✅ REMOVED: console.warn - Silent error handling
      }
    }

    if (token) {
      window.history.replaceState({}, '', location.pathname);
      navigate('/dashboard', { replace: true });
    } else if (auth === 'fail') {
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  async function handleResendVerification() {
    if (!pendingEmail) return;
    setResendMessage(null);
    try {
      const data = await fetchJson('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email: pendingEmail }),
      });
      setResendMessage(data?.message || 'Verification email resent. Check your inbox.');
      if (data?.token) {
        const userStr = data.user ? encodeURIComponent(JSON.stringify(data.user)) : '';
        navigate(`/email-verification?token=${encodeURIComponent(data.token)}&user=${userStr}`, { replace: true });
      }
    } catch (err: any) {
      // ✅ REMOVED: console.error - Silent error handling
      setResendMessage(err?.message ?? 'Network error');
    }
  }

  const handleBarangaySelect = (id: number, name: string) => {
    setBarangay(id.toString());
    setIsBarangayOpen(false);
  };

  const selectedBarangay = barangays.find(b => b.id.toString() === barangay);

  return (
    <div className="min-h-screen w-full bg-white lg:grid lg:grid-cols-2">
      {/* Left Panel - Sign Up Form */}
      <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-6 sm:mb-8">
            {isSSO ? 'Complete Your Google Registration' : 'Create your account with us below'}
          </h1>

          <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleSignUp} noValidate>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                You're creating an account as?
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onBlur={() => validateField('role')}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base outline-none transition-all ${
                  errors.role 
                    ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100'
                }`}
                aria-invalid={Boolean(errors.role)}
              >
                <option value="">Select Role</option>
                <option value="1">Admin</option>
                <option value="2">Barangay Staff</option>
              </select>
              {errors.role && <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.role}</div>}
            </div>

            {/* First Name & Last Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  First Name
                  {isSSO && firstName && <span className="text-blue-600 text-xs ml-2"></span>}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => validateField('firstName')}
                  placeholder="First Name"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base outline-none transition-all ${
                    errors.firstName 
                      ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100'
                  } ${isSSO && firstName ? 'bg-gray-50 border-blue-200' : ''}`}
                  aria-invalid={Boolean(errors.firstName)}
                />
                {errors.firstName && <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.firstName}</div>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Last Name
                  {isSSO && lastName && <span className="text-blue-600 text-xs ml-2"></span>}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => validateField('lastName')}
                  placeholder="Last Name"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base outline-none transition-all ${
                    errors.lastName 
                      ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100'
                  } ${isSSO && lastName ? 'bg-gray-50 border-blue-200' : ''}`}
                  aria-invalid={Boolean(errors.lastName)}
                />
                {errors.lastName && <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.lastName}</div>}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Email Address
                {isSSO && <span className="text-green-700 text-xs ml-2">Verified</span>}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => !isSSO && setEmail(e.target.value)}
                onBlur={() => validateField('email')}
                placeholder="Enter your email address"
                readOnly={isSSO}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base outline-none transition-all ${
                  errors.email 
                    ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100'
                } ${isSSO ? 'bg-green-50 border-green-400 cursor-not-allowed text-green-700' : ''}`}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.email}</div>}
            </div>

            {/* Custom Barangay Dropdown */}
            <div className="relative" ref={barangayRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Barangay
              </label>
              <button
                type="button"
                onClick={() => setIsBarangayOpen(!isBarangayOpen)}
                onBlur={() => validateField('barangay')}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base outline-none transition-all text-left flex justify-between items-center bg-white hover:bg-gray-50 ${
                  errors.barangay 
                    ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100'
                }`}
                aria-invalid={Boolean(errors.barangay)}
              >
                <span className={selectedBarangay ? 'text-gray-900 font-normal' : 'text-gray-400 font-normal'}>
                  {selectedBarangay ? selectedBarangay.name : 'Select Barangay'}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform text-gray-600 ${isBarangayOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isBarangayOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {barangays && barangays.map((b, index) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleBarangaySelect(b.id, b.name)}
                      className={`w-full px-3 sm:px-4 py-2 text-left text-sm sm:text-base font-normal bg-white text-black hover:bg-gray-100 active:bg-gray-200 transition-colors block outline-none border-none ${
                        index === 0 ? 'rounded-t-lg' : ''
                      } ${
                        index === barangays.length - 1 ? 'rounded-b-lg' : ''
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
              
              {errors.barangay && <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.barangay}</div>}
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="text-red-600 text-xs sm:text-sm text-center bg-red-50 p-2 sm:p-3 rounded-lg">
                {serverError}
              </div>
            )}

            {/* Submit Button */}
            <button 
              className="w-full bg-sibol-green hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-3 sm:py-3.5 rounded-full text-sm sm:text-base transition-all mt-2 sm:mt-3 lg:mt-[10%] flex items-center justify-center gap-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                isSSO ? 'Complete Google Registration' : 'Create Account'
              )}
            </button>

          </form>

          {/* Sign In Link */}
          <p className="text-center mt-6 sm:mt-8 text-gray-700 text-sm sm:text-base">
            Already have an account?{' '}
            <button 
              className="bg-transparent border-0 p-0 text-sibol-green hover:text-green-700 font-bold transition-colors cursor-pointer"
              type="button" 
              onClick={goToLogin}
            >
              Sign In
            </button>
          </p>

          {/* Pending Verification Section */}
          {pendingEmail && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                Account for <strong>{pendingEmail}</strong> is pending verification.
              </p>
              <button 
                type="button" 
                onClick={handleResendVerification}
                className="bg-transparent border-0 p-0 text-sibol-green hover:text-green-700 font-bold text-sm transition-colors cursor-pointer"
              >
                Resend verification email
              </button>
              {resendMessage && <p className="text-xs text-gray-600 mt-2">{resendMessage}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Image (Hidden on mobile/tablet) */}
      <div
        className="hidden lg:block bg-cover bg-center bg-no-repeat min-h-screen"
        style={{ backgroundImage: `url(${signupImage})` }}
      />
    </div>
  );
};

export default SignUp;
