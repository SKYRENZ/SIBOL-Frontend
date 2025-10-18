import React from "react";
import { useSignUp } from "../hooks/useSignUp";

const SignUp: React.FC = () => {
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
};

export default SignUp;
