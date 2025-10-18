import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [barangay, setBarangay] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSSO, setIsSSO] = useState(false);
  const [ssoMessage, setSsoMessage] = useState("");

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!role) newErrors.role = "Role is required";
    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Enter a valid email";
    if (!barangay) newErrors.barangay = "Barangay is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const requestData = {
          firstName,
          lastName,
          email,
          areaId: parseInt(barangay),
          roleId: getRoleId(role),
          isSSO: isSSO,
        };

        console.log('🚀 Submitting registration:', requestData);

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
            // For SSO users, redirect directly to admin pending (email already verified)
            console.log('✅ SSO Registration successful, redirecting to admin pending');
            navigate(`/admin-pending?email=${encodeURIComponent(email)}&sso=true&username=${encodeURIComponent(data.username)}`);
          } else {
            // For regular users, redirect to email verification page
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

  return (
    <div className="auth-shell signup-page">
      {/* Left Panel (Sign Up Form) */}
      <div className="auth-left signup-left">
        <div className="auth-card">
          {isSSO && (
            <div className="sso-message" style={{ 
              background: '#e8f5e8', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              color: '#2e7d32',
              border: '1px solid #a5d6a7'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <svg style={{ width: '20px', height: '20px', marginRight: '8px' }} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <strong>Google Account Registration</strong>
              </div>
              <div style={{ fontSize: '0.9em' }}>
                Complete your SIBOL registration with Google
              </div>
              <div style={{ fontSize: '0.85em', marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.7)', borderRadius: '4px' }}>
                📧 <strong>{email}</strong> <span style={{ color: '#1b5e20' }}>✅ Verified by Google</span>
              </div>
            </div>
          )}
          
          <h1 className="auth-title">
            {isSSO ? 'Complete Your Google Registration' : 'Create your account with us below'}
          </h1>
          <p className="auth-subtitle">
            Already have an account?{" "}
            <button
              className="auth-link"
              type="button"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </p>

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
                  {isSSO && firstName && <span style={{ color: '#1976d2', fontSize: '0.8em', marginLeft: '8px' }}>✅ From Google</span>}
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
                  {isSSO && lastName && <span style={{ color: '#1976d2', fontSize: '0.8em', marginLeft: '8px' }}>✅ From Google</span>}
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
              {isSSO && <span style={{ color: '#2e7d32', fontSize: '0.8em', marginLeft: '8px' }}>✅ Verified by Google</span>}
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
        </div>
      </div>

      {/* Right Panel (Image) */}
      <div
        className="auth-right"
        style={{
          backgroundImage: `url(${new URL("../assets/images/lilisignup.png", import.meta.url).href})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </div>
  );
};

export default SignUp;
