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

    if (emailParam && ssoParam) {
      setEmail(emailParam);
      setIsSSO(true);
      setSsoMessage(messageParam || 'Complete your registration to continue with Google Sign-In');
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

        if (data.success) {
          if (isSSO) {
            // For SSO users, redirect directly to admin pending (email already verified)
            navigate(`/admin-pending?email=${encodeURIComponent(email)}&sso=true&username=${encodeURIComponent(data.username)}`);
          } else {
            // For regular users, redirect to email verification page
            navigate(`/email-verification?email=${encodeURIComponent(email)}&username=${encodeURIComponent(data.username)}`);
          }
        } else {
          alert(`Sign Up Failed: ${data.error}`);
        }
      } catch (error) {
        console.error('Registration error:', error);
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
          {isSSO && ssoMessage && (
            <div className="sso-message" style={{ 
              background: '#e3f2fd', 
              padding: '10px', 
              borderRadius: '4px', 
              marginBottom: '20px',
              color: '#1976d2',
              border: '1px solid #bbdefb'
            }}>
              <strong>Google Sign-In:</strong> {ssoMessage}
              <div style={{ fontSize: '0.9em', marginTop: '5px' }}>
                📧 Email: <strong>{email}</strong> (verified by Google)
              </div>
            </div>
          )}
          
          <h1 className="auth-title">Create your account with us below</h1>
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
                <label className="auth-label">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="auth-input"
                />
                {errors.firstName && <div className="auth-error">{errors.firstName}</div>}
              </div>
              <div>
                <label className="auth-label">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="auth-input"
                />
                {errors.lastName && <div className="auth-error">{errors.lastName}</div>}
              </div>
            </div>

            {/* Only show email field for non-SSO users */}
            {!isSSO && (
              <>
                <label className="auth-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="auth-input"
                />
                {errors.email && <div className="auth-error">{errors.email}</div>}
              </>
            )}

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
              {isSSO ? 'Complete Google Sign-Up' : 'Create Account'}
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
