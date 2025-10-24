import React, { useEffect, useState } from 'react';
import { useSignUp } from '../hooks/useSignUp';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchJson } from '../services/apiClient';

const SignUp: React.FC = () => {
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  // NOTE: serverError now comes from the useSignUp hook (returned as serverError)
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
    barangays, // NEW
    errors,
    isSSO,
    touched,
    validateField,
    
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

          <form className="auth-form" onSubmit={handleSignUp} noValidate>
            <label className="auth-label">You're creating an account as?</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onBlur={() => validateField('role')}
              className={`auth-input${errors.role ? ' is-error' : ''}`}
              aria-invalid={Boolean(errors.role)}
            >
              <option value="">Select Role</option>
              <option value="1">Admin</option>
              <option value="2">Barangay Staff</option>
              <option value="3">Operator</option>
              <option value="4">Household</option>
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
                  onBlur={() => validateField('firstName')}
                  placeholder="First Name"
                  className={`auth-input${errors.firstName ? ' is-error' : ''}`}
                  aria-invalid={Boolean(errors.firstName)}
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
                  onBlur={() => validateField('lastName')}
                  placeholder="Last Name"
                  className={`auth-input${errors.lastName ? ' is-error' : ''}`}
                  aria-invalid={Boolean(errors.lastName)}
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
              onBlur={() => validateField('email')}
              placeholder="Enter your email address"
              className={`auth-input${errors.email ? ' is-error' : ''}`}
              aria-invalid={Boolean(errors.email)}
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
              onBlur={() => validateField('barangay')}
              className={`auth-input${errors.barangay ? ' is-error' : ''}`}
              aria-invalid={Boolean(errors.barangay)}
            >
              <option value="">Select Barangay</option>
              {barangays && barangays.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {errors.barangay && <div className="auth-error">{errors.barangay}</div>}

            {/* show backend/hook error */}
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
      console.error('Resend verification error', err);
      setResendMessage(err?.message ?? 'Network error');
    }
  }
};

export default SignUp;
