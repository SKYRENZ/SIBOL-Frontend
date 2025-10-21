import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchJson } from '../services/apiClient'; // removed unused API_URL/apiFetch

export const useSignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // State
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [barangay, setBarangay] = useState("");
  // password is handled by backend default; don't collect on frontend
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSSO, setIsSSO] = useState(false);
  const [ssoMessage, setSsoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

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
    // password handled by backend; do not validate here
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle sign up submission
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setServerError('');
 
    // validate before sending
    if (!validateForm()) {
      setLoading(false);
      return;
    }
 
    try {
      // Map role label -> id expected by backend (adjust numbers to match your DB)
      const roleMap: Record<string, number> = {
        Admin: 1,
        User: 2,
        // add others if needed
      };
      const roleId = typeof role === 'string' ? roleMap[role] ?? Number(role) : role;
 
      // derive a simple username (backend may require it)
      const usernameCandidate = email
        ? email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 30)
        : `${firstName}${lastName}`.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 30);
 
      // build payload with both naming variants (backend may accept either)
      const payload = {
        // camel / lowercase variants
        firstName,
        lastName,
        areaId: Number(barangay),
        email,
        role: Number(roleId),
        roleId: Number(roleId),
        username: usernameCandidate,
        isSSO: Boolean(isSSO),

        // backend / admin-style variants
        FirstName: firstName,
        LastName: lastName,
        Area_id: Number(barangay),
        Email: email,
        Roles: Number(roleId),
        Username: usernameCandidate,
        // omit Password so backend will apply DEFAULT_PASSWORD when appropriate
      };
 
      console.log('🔁 signup payload', payload);
 
      const data = await fetchJson('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      console.log('⬅️ signup response', data);
 
      if (data.success) {
        // clear any previous pending state
        setPendingEmail(null);
        if (isSSO) {
          navigate(`/admin-pending?email=${encodeURIComponent(email)}&sso=true&username=${encodeURIComponent(data.username)}`);
        } else {
          navigate(`/email-verification?email=${encodeURIComponent(email)}&username=${encodeURIComponent(data.username)}`);
        }
      } else {
        const msg = data?.message || data?.error || 'Registration failed';
        setServerError(msg);
        // backend may return email or pending flag for pending accounts — surface it
        if (data?.email) setPendingEmail(data.email);
        else if (data?.pendingEmail) setPendingEmail(data.pendingEmail);
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
    // removed password and setPassword (backend provides default)
    errors,
    isSSO,
    ssoMessage,
    loading,
    serverError,
    pendingEmail,
    
    // Assets
    signupImage,
    
    // Actions
    handleSignUp,
    goToLogin,
  };
};