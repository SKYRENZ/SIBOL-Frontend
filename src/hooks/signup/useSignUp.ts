import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchJson } from '../../services/apiClient';

export const useSignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [role, setRoleState] = useState("");
  const setRole = (v: string) => {
    setRoleState(v);
    setErrors(prev => {
      const next = { ...prev };
      if (v) delete next.role;
      return next;
    });
    setTouched(prev => ({ ...prev, role: true }));
  };

  const [firstName, setFirstNameState] = useState("");
  const [lastName, setLastNameState] = useState("");
  const [email, setEmail] = useState("");
  const [barangay, setBarangayState] = useState("");
  const setBarangay = (v: string) => {
    setBarangayState(v);
    setErrors(prev => {
      const next = { ...prev };
      if (v) delete next.barangay;
      return next;
    });
    setTouched(prev => ({ ...prev, barangay: true }));
  };

  const [barangays, setBarangays] = useState<{ id: number; name: string }[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSSO, setIsSSO] = useState(false);
  const [ssoMessage, setSsoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const signupImage = new URL("../../assets/images/lilisignup.png", import.meta.url).href;

  const nameFilter = (input: string) => input.replace(/[^A-Za-z\s.'-]/g, '');
  const nameRegex = /^[A-Za-z\s.'-]+$/;

  const setFirstName = (v: string) => setFirstNameState(nameFilter(v));
  const setLastName = (v: string) => setLastNameState(nameFilter(v));

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
    setErrors(newErrors);
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // ✅ REMOVED: console.log for SSO params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const ssoParam = searchParams.get('sso');
    const messageParam = searchParams.get('message');

    if (emailParam && ssoParam === 'google') {
      setEmail(emailParam);
      setIsSSO(true);
      setSsoMessage(messageParam || 'Complete your registration to continue with Google Sign-In');
    }
  }, [searchParams]);

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

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setServerError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const roleMap: Record<string, number> = {
        Admin: 1,
        User: 2,
      };
      const roleId = typeof role === 'string' ? roleMap[role] ?? Number(role) : role;

      const usernameCandidate = email
        ? email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 30)
        : `${firstName}${lastName}`.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 30);

      const payload = {
        firstName,
        lastName,
        areaId: Number(barangay),
        email,
        role: Number(roleId),
        roleId: Number(roleId),
        username: usernameCandidate,
        isSSO: Boolean(isSSO),
        FirstName: firstName,
        LastName: lastName,
        Area_id: Number(barangay),
        Email: email,
        Roles: Number(roleId),
        Username: usernameCandidate,
      };

      // ✅ REMOVED: console.log('🔁 signup payload', payload);

      const data = await fetchJson('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      // ✅ REMOVED: console.log('⬅️ signup response', data);

      if (data.success) {
        setPendingEmail(null);
        if (isSSO) {
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
    } catch (err: any) {
      // ✅ REMOVED: console.error('❌ Signup request failed:', err);
      const msg = err?.data?.error || err?.data?.message || err?.message || 'Network error';
      setServerError(msg);

      if (err?.data?.email) setPendingEmail(err.data.email);
      else if (err?.data?.pendingEmail) setPendingEmail(err.data?.pendingEmail);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return {
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
    ssoMessage,
    loading,
    serverError,
    pendingEmail,
    touched,
    setTouched,
    validateField,
    signupImage,
    handleSignUp,
    goToLogin,
  };
};