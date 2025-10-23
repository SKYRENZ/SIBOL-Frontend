import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchJson } from '../services/apiClient';

export const useSignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [role, setRole] = useState("");
  const [firstName, setFirstNameState] = useState("");
  const [lastName, setLastNameState] = useState("");
  const [email, setEmail] = useState("");
  const [barangay, setBarangay] = useState("");
  const [barangays, setBarangays] = useState<{ id: number; name: string }[]>([]); // NEW
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSSO, setIsSSO] = useState(false);
  const [ssoMessage, setSsoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // Assets
  const signupImage = new URL("../assets/images/lilisignup.png", import.meta.url).href;

  // name filter + validation regex (allow letters, spaces, hyphen, apostrophe, period)
  const nameFilter = (input: string) => input.replace(/[^A-Za-z\s.'-]/g, '');
  const nameRegex = /^[A-Za-z\s.'-]+$/;

  // Exposed setters that filter invalid characters
  const setFirstName = (v: string) => setFirstNameState(nameFilter(v));
  const setLastName = (v: string) => setLastNameState(nameFilter(v));

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
      if (firstNameParam) setFirstName(firstNameParam); // will be filtered
      if (lastNameParam) setLastName(lastNameParam);     // will be filtered
    }
  }, [searchParams]);

  // Fetch barangays on mount
  useEffect(() => {
    let cancelled = false;
    async function loadBarangays() {
      try {
        const data = await fetchJson('/api/auth/barangays');
        if (!cancelled && data?.success && Array.isArray(data.barangays)) {
          setBarangays(data.barangays);
        }
      } catch (err) {
        console.warn('Failed to load barangays', err);
      }
    }
    loadBarangays();
    return () => { cancelled = true; };
  }, []);

  // Validate form function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!role) newErrors.role = "Role is required";

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    else if (!nameRegex.test(firstName.trim())) newErrors.firstName = "First name can only contain letters, spaces, hyphens, apostrophes and periods";

    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    else if (!nameRegex.test(lastName.trim())) newErrors.lastName = "Last name can only contain letters, spaces, hyphens, apostrophes and periods";

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

  // Handle sign up submission
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setServerError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Map role label -> id expected by backend
      const roleMap: Record<string, number> = {
        Admin: 1,
        User: 2,
      };
      const roleId = typeof role === 'string' ? roleMap[role] ?? Number(role) : role;

      // derive a simple username
      const usernameCandidate = email
        ? email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 30)
        : `${firstName}${lastName}`.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 30);

      // build payload with both naming variants
      const payload = {
        // camelCase
        firstName,
        lastName,
        areaId: Number(barangay),
        email,
        role: Number(roleId),
        roleId: Number(roleId),
        username: usernameCandidate,
        isSSO: Boolean(isSSO),
        // snake_case/DB style
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
        setPendingEmail(null);
        if (isSSO) {
          // Always redirect SSO to /pending-approval
          navigate(`/pending-approval?email=${encodeURIComponent(email)}&sso=true&username=${encodeURIComponent(data.username)}`);
        } else {
          navigate(`/email-verification?email=${encodeURIComponent(email)}&username=${encodeURIComponent(data.username)}`);
        }
      } else {
        const msg = data?.message || data?.error || 'Registration failed';
        setServerError(msg);
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
    setFirstName, // now filtered
    lastName,
    setLastName,  // now filtered
    email,
    setEmail,
    barangay,
    setBarangay,
    barangays, // EXPOSED
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