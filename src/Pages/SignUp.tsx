import React, { useEffect, useState } from 'react';
import { useSignUp } from '../hooks/useSignUp';
import { useNavigate, useLocation } from 'react-router-dom';

const SignUp: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
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
    errors,
    isSSO,
    
    // Assets
    signupImage,
    
    // Actions
    handleSignUp,
    goToLogin,
  } = useSignUp();

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
        console.warn('Failed to parse SSO user on SignUp', e);
      }
    }

    if (token) {
      window.history.replaceState({}, '', location.pathname);
      // Optionally redirect after storing token
      navigate('/dashboard', { replace: true });
    } else if (auth === 'fail') {
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="auth-shell signup-page">
      {/* Left Panel (Sign Up Form) */}
      <div className="auth-left signup-left">
        <div className="auth-card">
          
          <h1 className="auth-title">
            {isSSO ? 'Complete Your Google Registration' : 'Create your account with us below'}
          </h1>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-label">You're creating an account as?</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="auth-input"
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Barangay Staff">Barangay Staff</option>
              <option value="Operator">Operator</option>
              <option value="Household">Household</option>
            </select>
            {errors.role && <div className="auth-error">{errors.role}</div>}

            <div className="auth-row">
              <div>
                <label className="auth-label">
                  First Name
                  {isSSO && firstName && <span style={{ color: '#1976d2', fontSize: '0.8em', marginLeft: '8px' }}></span>}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="auth-input"
                  style={isSSO && firstName ? { backgroundColor: '#f8f9fa', border: '2px solid #e3f2fd' } : {}}
                />
                {errors.firstName && <div className="auth-error">{errors.firstName}</div>}
              </div>
              <div>
                <label className="auth-label">
                  Last Name
                  {isSSO && lastName && <span style={{ color: '#1976d2', fontSize: '0.8em', marginLeft: '8px' }}></span>}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="auth-input"
                  style={isSSO && lastName ? { backgroundColor: '#f8f9fa', border: '2px solid #e3f2fd' } : {}}
                />
                {errors.lastName && <div className="auth-error">{errors.lastName}</div>}
              </div>
            </div>
            
            {/* Email field - always show but make it readonly for SSO */}
            <label className="auth-label">
              Email Address
              {isSSO && <span style={{ color: '#2e7d32', fontSize: '0.8em', marginLeft: '8px' }}>Verified</span>}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => !isSSO && setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="auth-input"
              readOnly={isSSO}
              style={isSSO ? { 
                backgroundColor: '#f1f8e9', 
                border: '2px solid #a5d6a7', 
                cursor: 'not-allowed',
                color: '#2e7d32'
              } : {}}
            />
            {errors.email && <div className="auth-error">{errors.email}</div>}

            <label className="auth-label">Barangay</label>
            <select
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              className="auth-input"
            >
              <option value="">Select Barangay</option>
              <option value="1">Barangay 1</option>
              <option value="2">Barangay 2</option>
              <option value="3">Barangay 3</option>
            </select>
            {errors.barangay && <div className="auth-error">{errors.barangay}</div>}

            {serverError && <div className="auth-error">{serverError}</div>}
            <button className="auth-submit signup-submit" type="submit">
              {isSSO ? 'Complete Google Registration' : 'Create Account'}
            </button>
          </form>
  
          {/* Moved "Already have an account?" to the bottom with spacing */}
          <p className="auth-subtitle" style={{ marginTop: '25px' }}>
            Already have an account?{" "}
            <button
              className="auth-link"
              type="button"
              onClick={goToLogin}
            >
              Sign In
            </button>
          </p>

          {/* Show pending section in the form area: */}
          {pendingEmail && (
            <div className="pending-box">
              <p>Account for <strong>{pendingEmail}</strong> is pending verification.</p>
              <button type="button" onClick={handleResendVerification}>Resend verification email</button>
              {resendMessage && <p className="muted">{resendMessage}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel (Image) */}
      <div
        className="auth-right"
        style={{
          backgroundImage: `url(${signupImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
  
  // Local submit handler mapped to backend's expectations
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setResendMessage(null);

    const payload = {
      firstName,
      lastName,
      areaId: Number(barangay) || 0,
      email,
      roleId: typeof role === 'string' ? (roleMap[role] ?? (Number(role) || 2)) : role,
      isSSO: !!isSSO
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://sibol-backend-i0i6.onrender.com';
      const res = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      if (!res.ok) {
        // backend should return a clear message; detect "pending" case
        const msg = data?.message || data?.error || text || `HTTP ${res.status}`;
        setServerError(msg);

        // If server indicates account pending, show resend UI
        if (/pending/i.test(String(msg)) || String(msg).includes('pending')) {
          setPendingEmail(email);
        }
        return;
      }

      // success path: server may return token or instruct next step
      if (data?.token) {
        // redirect to email verification page with token (or dashboard if auth)
        const userStr = data.user ? encodeURIComponent(JSON.stringify(data.user)) : '';
        navigate(`/email-verification?token=${encodeURIComponent(data.token)}&user=${userStr}`, { replace: true });
        return;
      }

      // fallback: navigate to dashboard or verification page as appropriate
      if (data?.next === 'verify' || data?.status === 'pending') {
        setPendingEmail(email);
        setServerError('Account created but needs admin/email verification. Check your inbox.');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error', err);
      setServerError('Network error');
    }
  }

  async function handleResendVerification() {
    if (!pendingEmail) return;
    setResendMessage(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://sibol-backend-i0i6.onrender.com';
      const res = await fetch(`${apiUrl}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await res.json().catch(() => ({ ok: res.ok, raw: '' }));
      if (!res.ok) {
        setResendMessage(data?.message || data?.error || `Failed: ${res.status}`);
        return;
      }
      // success - server may return a token or confirmation
      setResendMessage(data?.message || 'Verification email resent. Check your inbox.');
      if (data?.token) {
        const userStr = data.user ? encodeURIComponent(JSON.stringify(data.user)) : '';
        navigate(`/email-verification?token=${encodeURIComponent(data.token)}&user=${userStr}`, { replace: true });
      }
    } catch (err) {
      console.error('Resend verification error', err);
      setResendMessage('Network error');
    }
  }
};

export default SignUp;
