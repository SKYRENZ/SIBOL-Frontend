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
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const areaId = parseInt(barangay);
        const requestData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          areaId,  // Now guaranteed to be a valid number
          roleId: getRoleId(role),
          isSSO,
        };

        console.log('🚀 Submitting registration:', requestData);  // Now logs actual values

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📋 Registration response:', data);

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
      } catch (error) {
        console.error('❌ Registration error:', error);
        alert(`Sign Up Failed: ${error instanceof Error ? error.message : 'Network error'}`);
      }
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
    
    // Assets
    signupImage,
    
    // Actions
    handleSignUp,
    goToLogin,
  };
};