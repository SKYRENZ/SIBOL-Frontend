import React, { useEffect, useState } from "react";
import { useSignUp } from "../hooks/useSignUp";
import { useNavigate, useLocation } from 'react-router-dom';

const SignUp: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);
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
    if (!firstName || !lastName || !email || !barangay) {
      setServerError('Please fill all required fields.');
      return;
    }

    const roleMap: Record<string, number> = {
      Admin: 1,
      'Barangay Staff': 2,
      Operator: 3,
      Household: 4
    };
    const roleId = typeof role === 'string' ? (roleMap[role] ?? (Number(role) || 2)) : role;
    const areaId = Number(barangay) || 0;

    const payload = {
      firstName,
      lastName,
      areaId,
      email,
      roleId,
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
      if (!res.ok) {
        console.error('Signup failed:', res.status, text);
        setServerError(text || `HTTP ${res.status}`);
        return;
      }
      // Success - backend handles pending/admin flow
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setServerError('Network error');
    }
  }
};

export default SignUp;
