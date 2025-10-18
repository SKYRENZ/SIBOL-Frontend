import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { login as apiLogin } from '../services/authService'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({})
  const [loading, setLoading] = useState(false) // added
  const [serverError, setServerError] = useState<string | null>(null) // added

  const isValid = useMemo(() => username.trim().length > 0 && password.trim().length > 0, [username, password]);

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      navigate('/dashboard')
    }
  }, [navigate])

  // Handle OAuth errors from URL params
  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'auth_failed') {
      setServerError('Google Sign-In failed. Please ensure your account is registered and verified.')
    }
  }, [searchParams])

  const usernameError = !username.trim() && touched.username ? 'This field is required' : ''
  const passwordError = !password.trim() && touched.password ? 'This field is required' : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    setServerError(null);

    if (!isValid) return;

    try {
      setLoading(true);
      const res = await apiLogin(username.trim(), password);
      if (res && res.user) {
        navigate('/dashboard');
      } else {
        setServerError('Invalid response from server');
      }
    } catch (err: any) {
      setServerError(err?.response?.data?.message ?? err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = () => {
    // Redirect to your backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`
  }

  const googleIcon = new URL('../assets/images/flat-color-icons_google.png', import.meta.url).href
  const leftBg = new URL('../assets/images/TRASHBG.png', import.meta.url).href
  const leftLogo = new URL('../assets/images/SIBOLWORDLOGO.png', import.meta.url).href
  const topLogo = new URL('../assets/images/SIBOLOGOBULB.png', import.meta.url).href

  return (
    <div className="auth-shell signin-page">
      <div className="auth-left" style={{ backgroundImage: `url(${leftBg})` }}>
        <div className="auth-left-content">
          <img className="auth-wordmark" src={leftLogo} alt="SIBOL" />
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <img className="auth-top-logo" src={topLogo} alt="SIBOL" />
          <h1 className="auth-title">Sign in to your account</h1>

          <button className="auth-google" type="button" onClick={handleGoogleSignIn}>
            <img src={googleIcon} className="auth-google-icon" alt="Google" />
            <span>Sign in with Google</span>
          </button>

          <div className="auth-divider">
            <span>Or</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-label">Username</label>
            <input
              className={`auth-input${usernameError ? ' is-error' : ''}`}
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
            />
            {usernameError ? <div className="auth-error">{usernameError}</div> : null}

            <label className="auth-label">Password</label>
            <input
              className={`auth-input${passwordError ? ' is-error' : ''}`}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            />
            {passwordError ? <div className="auth-error">{passwordError}</div> : null}

            <div className="auth-forgot">
              <button type="button" className="auth-link" onClick={() => {}}>Forgot Password?</button>
            </div>

            {serverError && <div className="auth-error" style={{ marginBottom: 8 }}>{serverError}</div>}

            <button className="auth-submit" type="submit" disabled={!isValid || loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-bottom-text">
            Don't have an account? <button className="auth-link" type="button" onClick={() => navigate('/signup')}>Sign up</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;