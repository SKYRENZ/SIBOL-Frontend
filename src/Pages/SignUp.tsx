import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register, resendVerification, clearError, clearSuccess } from '../store/slices/authSlice';
import { isAuthenticated } from '../services/authService';
import api from '../services/apiClient';
import AttachmentsUpload from '../Components/maintenance/attachments/AttachmentsUpload';

type BarangayItem = { id: number; name: string };
type BarangaysResponse = { success: boolean; barangays: BarangayItem[] };

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  
  // ✅ Redux state
  const { isLoading, error: authError, successMessage } = useAppSelector((state) => state.auth);
  
  // ✅ Local state
  const [role, setRole] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [barangay, setBarangay] = useState('');
  const [barangays, setBarangays] = useState<{ id: number; name: string }[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSSO, setIsSSO] = useState(false);
  const [isBarangayOpen, setIsBarangayOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // ✅ NEW: attachment state (Barangay only)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);

  const barangayRef = useRef<HTMLDivElement>(null);
  const signupImage = new URL('../assets/images/lilisignup.png', import.meta.url).href;

  const isBarangayRoleSelected = String(role) === '2'; // role select uses "1"/"2"

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // ✅ Load SSO params from URL
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const ssoParam = searchParams.get('sso');
    const firstNameParam = searchParams.get('firstName');
    const lastNameParam = searchParams.get('lastName');

    if (emailParam && ssoParam === 'google') {
      setEmail(emailParam);
      setIsSSO(true);
      if (firstNameParam) setFirstName(firstNameParam);
      if (lastNameParam) setLastName(lastNameParam);
    }
  }, [searchParams]);

  // ✅ Load barangays
  useEffect(() => {
    let cancelled = false;
    async function loadBarangays() {
      try {
        const res = await api.get<BarangaysResponse>('/api/auth/barangays');
        if (!cancelled && res.data?.success && Array.isArray(res.data.barangays)) {
          setBarangays(res.data.barangays);
        }
      } catch (err) {
        console.warn('Failed to load barangays', err);
      }
    }
    loadBarangays();
    return () => { cancelled = true; };
  }, []);

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

  // ✅ Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  useEffect(() => {
    // cleanup object URL
    return () => {
      if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl);
    };
  }, [attachmentPreviewUrl]);

  // If role changes away from Barangay, clear attachment
  useEffect(() => {
    if (!isBarangayRoleSelected) {
      if (attachmentPreviewUrl) URL.revokeObjectURL(attachmentPreviewUrl);
      setAttachmentPreviewUrl(null);
      setAttachmentFile(null);
      setErrors(prev => {
        const next = { ...prev };
        delete next.attachment;
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBarangayRoleSelected]);

  const nameFilter = (input: string) => input.replace(/[^A-Za-z\s.'-]/g, '');
  const nameRegex = /^[A-Za-z\s.'-]+$/;

  const validateField = (field: string) => {
    const newErrors = { ...errors };
    if (field === 'role') {
      if (!role) newErrors.role = 'Role is required';
      else delete newErrors.role;
    }
    if (field === 'firstName') {
      if (!firstName.trim()) newErrors.firstName = 'First name is required';
      else if (!nameRegex.test(firstName.trim())) newErrors.firstName = 'First name can only contain letters, spaces, hyphens, apostrophes and periods';
      else delete newErrors.firstName;
    }
    if (field === 'lastName') {
      if (!lastName.trim()) newErrors.lastName = 'Last name is required';
      else if (!nameRegex.test(lastName.trim())) newErrors.lastName = 'Last name can only contain letters, spaces, hyphens, apostrophes and periods';
      else delete newErrors.lastName;
    }
    if (field === 'email') {
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email';
      else delete newErrors.email;
    }
    if (field === 'barangay') {
      if (!barangay.trim()) newErrors.barangay = 'Barangay is required';
      else if (isNaN(parseInt(barangay)) || parseInt(barangay) <= 0) newErrors.barangay = 'Barangay must be a valid number';
      else delete newErrors.barangay;
    }
    if (field === 'attachment') {
      if (isBarangayRoleSelected && !attachmentFile) newErrors.attachment = 'Valid ID image is required';
      else delete newErrors.attachment;
    }

    setErrors(newErrors);
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!role) newErrors.role = "Role is required";
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    else if (!nameRegex.test(firstName.trim())) newErrors.firstName = "Invalid first name";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    else if (!nameRegex.test(lastName.trim())) newErrors.lastName = "Invalid last name";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email";
    if (!barangay.trim()) newErrors.barangay = "Barangay is required";
    // ✅ Barangay requires attachment
    if (isBarangayRoleSelected && !attachmentFile) {
      newErrors.attachment = 'Valid ID image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const roleId = Number(role);

    try {
      let payload: any;

      if (isBarangayRoleSelected) {
        // ✅ Send multipart only when Barangay
        const form = new FormData();
        form.append('firstName', firstName);
        form.append('lastName', lastName);
        form.append('barangayId', String(Number(barangay)));
        form.append('email', email);
        form.append('roleId', String(roleId));
        form.append('isSSO', String(Boolean(isSSO)));
        form.append('attachment', attachmentFile as File); // field name must be "attachment"

        payload = form;
      } else {
        // ✅ Non-barangay: JSON (no attachment)
        payload = {
          firstName,
          lastName,
          barangayId: Number(barangay),
          email,
          roleId: Number(roleId),
          isSSO: Boolean(isSSO),
        };
      }

      const result = await dispatch(register(payload)).unwrap();

      if (result.success) {
        setPendingEmail(null);

        const params: Record<string, string> = {
          email,
        };

        if (isSSO) params.sso = 'true';
        if (result.username) params.username = result.username; // ✅ only include if defined

        const qs = new URLSearchParams(params).toString();

        if (isSSO) {
          navigate(`/pending-approval?${qs}`);
        } else {
          navigate(`/email-verification?${qs}`);
        }
      }
    } catch (error: any) {
      if (error?.email) setPendingEmail(error.email);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingEmail) return;
    
    try {
      await dispatch(resendVerification(pendingEmail)).unwrap();
    } catch (error) {
      // Error handled by Redux
    }
  };

  const handleBarangaySelect = (id: number, name: string) => {
    setBarangay(id.toString());
    setIsBarangayOpen(false);
  };

  const selectedBarangay = barangays.find(b => b.id.toString() === barangay);

  return (
    <div className="min-h-screen w-full bg-white lg:grid lg:grid-cols-2">
      {/* Left Panel */}
      <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-6 sm:mb-8">
            {isSSO ? 'Complete Your Google Registration' : 'Create your account with us below'}
          </h1>

          <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmit} noValidate>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                You're creating an account as?
              </label>
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  const newErrors = { ...errors };
                  if (e.target.value) delete newErrors.role;
                  setErrors(newErrors);
                }}
                onBlur={() => validateField('role')}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base outline-none transition-all ${
                  errors.role 
                    ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100'
                }`}
              >
                <option value="">Select Role</option>
                <option value="1">Admin</option>
                <option value="2">Barangay Staff</option>
              </select>
              {errors.role && <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.role}</div>}
            </div>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(nameFilter(e.target.value))}
                  onBlur={() => validateField('firstName')}
                  placeholder="First Name"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base outline-none transition-all ${
                    errors.firstName 
                      ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100'
                  }`}
                />
                {errors.firstName && <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.firstName}</div>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(nameFilter(e.target.value))}
                  onBlur={() => validateField('lastName')}
                  placeholder="Last Name"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base outline-none transition-all ${
                    errors.lastName 
                      ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100'
                  }`}
                />
                {errors.lastName && <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.lastName}</div>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Email Address
                {isSSO && <span className="text-green-700 text-xs ml-2">✓ Verified</span>}
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
              />
              {errors.email && <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.email}</div>}
            </div>

            {/* Barangay Dropdown */}
            <div className="relative" ref={barangayRef}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Barangay
              </label>

              <button
                type="button"
                onClick={() => setIsBarangayOpen(!isBarangayOpen)}
                onBlur={() => validateField('barangay')}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border text-sm sm:text-base outline-none transition-all text-left flex justify-between items-center bg-white hover:bg-gray-50
                  focus:outline-none focus:ring-0 focus:ring-offset-0
                  ${errors.barangay ? 'border-red-600' : 'border-gray-200'}
                `}
              >
                <span className={selectedBarangay ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedBarangay ? selectedBarangay.name : 'Select Barangay'}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isBarangayOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isBarangayOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-lg max-h-48 overflow-y-auto rounded-none">
                  {barangays.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleBarangaySelect(b.id, b.name)}
                      className="w-full px-3 sm:px-4 py-2 text-left text-sm sm:text-base bg-white text-gray-900 hover:bg-gray-100
                               focus:outline-none focus:ring-0 focus:ring-offset-0"
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
              
              {errors.barangay && <div className="text-red-600 text-xs sm:text-sm mt-1">{errors.barangay}</div>}
            </div>

            {/* ✅ Attachment UI (Barangay only) */}
            {isBarangayRoleSelected && (
              <div>
                <AttachmentsUpload
                  label="Upload Valid ID (Image)"
                  required
                  disabled={isLoading}
                  accept="image/*"
                  multiple={false}
                  itemLayout="thumb+name"
                  files={attachmentFile ? [attachmentFile] : []}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return; // keep previous if user cancels
                    setAttachmentFile(file);
                    setTouched((prev) => ({ ...prev, attachment: true }));
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.attachment;
                      return next;
                    });
                  }}
                  onRemove={() => {
                    setAttachmentFile(null);
                    setErrors((prev) => ({ ...prev, attachment: 'Valid ID image is required' }));
                  }}
                />
              </div>
            )}

            {/* Error Message */}
            {authError && (
              <div className="text-red-600 text-xs sm:text-sm text-center bg-red-50 border border-red-200 p-3 rounded-lg">
                {authError}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="text-green-600 text-xs sm:text-sm text-center bg-green-50 border border-green-200 p-3 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Submit Button */}
            <button 
              className="w-full bg-sibol-green hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-3 sm:py-3.5 rounded-full text-sm sm:text-base transition-all mt-2 sm:mt-3"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
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
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </p>

          {/* Pending Verification */}
          {pendingEmail && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                Account for <strong>{pendingEmail}</strong> is pending verification.
              </p>
              <button 
                type="button" 
                onClick={handleResendVerification}
                disabled={isLoading}
                className="bg-transparent border-0 p-0 text-sibol-green hover:text-green-700 font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Resend verification email
              </button>
              {successMessage && <p className="text-xs text-green-600 mt-2">{successMessage}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Image */}
      <div
        className="hidden lg:block bg-cover bg-center bg-no-repeat min-h-screen"
        style={{ backgroundImage: `url(${signupImage})` }}
      />
    </div>
  );
};

export default SignUp;
