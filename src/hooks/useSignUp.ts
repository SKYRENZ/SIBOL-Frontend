import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const useSignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [barangay, setBarangay] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSSO, setIsSSO] = useState(false);
  const [ssoMessage, setSsoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Assets
  const signupImage = new URL("../assets/images/lilisignup.png", import.meta.url).href;

  // Check for SSO redirect parameters
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const ssoParam = searchParams.get('sso');
    const messageParam = searchParams.get('message');
    const firstNameParam = searchParams.get('firstName');
    const lastNameParam = searchParams.get('lastName');

    console.log('📋 SSO params detected:', {
      email: emailParam,
      sso: ssoParam,
      firstName: firstNameParam,
      lastName: lastNameParam,
      message: messageParam
    });

    if (emailParam && ssoParam === 'google') {
      setEmail(emailParam);
      setIsSSO(true);
      setSsoMessage(messageParam || 'Complete your registration to continue with Google Sign-In');
      
      // Pre-fill names if available from Google
      if (firstNameParam) {
        setFirstName(firstNameParam);
      }
      if (lastNameParam) {
        setLastName(lastNameParam);
      }
    }
  }, [searchParams]);

  // Validate form function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!role) newErrors.role = "Role is required";
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email";
    if (!barangay.trim()) newErrors.barangay = "Barangay is required";
    else if (isNaN(parseInt(barangay)) || parseInt(barangay) <= 0) {
      newErrors.barangay = "Barangay must be a valid number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get role ID mapping
  const getRoleId = (roleString: string): number => {
    // Map role strings to IDs based on your database
    const roleMap: { [key: string]: number } = {
      'Admin': 1,
      'Barangay Staff': 2,
      'Operator': 3,
      'Household': 4
    };
    return roleMap[roleString] || 4; // Default to Household
  };

  // Handle sign up submission
  const apiUrl = import.meta.env.VITE_API_URL || 'https://sibol-backend-i0i6.onrender.com';

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, firstName, lastName, email, barangay }),
      });

      const text = await res.text();
      if (!res.ok) {
        console.error('❌ Registration error:', res.status, text);
        setServerError(text || `HTTP ${res.status}`);
        return;
      }

      const data = JSON.parse(text);

      if (data.success) {
        if (isSSO) {
          console.log('✅ SSO Registration successful, redirecting to admin pending');
          navigate(`/admin-pending?email=${encodeURIComponent(email)}&sso=true&username=${encodeURIComponent(data.username)}`);
        } else {
          console.log('✅ Regular registration successful, redirecting to email verification');
          navigate(`/email-verification?email=${encodeURIComponent(email)}&username=${encodeURIComponent(data.username)}`);
        }
      } else {
        console.error('❌ Registration failed:', data.error);
        alert(`Sign Up Failed: ${data.error}`);
      }
    } catch (err) {
      console.error('❌ Signup request failed:', err);
      setServerError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const goToLogin = () => {
    navigate("/login");
  };

  return {
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
    errors,
    isSSO,
    ssoMessage,
    loading,
    serverError,
    
    // Assets
    signupImage,
    
    // Actions
    handleSignUp,
    goToLogin,
  };
};