import React, { useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom'
import ForgotPasswordModal from '../Components/verification/ForgotPasswordModal';
import { login as apiLogin } from '../services/authService'; // added

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({})
  const [loading, setLoading] = useState(false) // added
  const [serverError, setServerError] = useState<string | null>(null) // added
  const [fpOpen, setFpOpen] = useState(false);

  const isValid = useMemo(() => username.trim().length > 0 && password.trim().length > 0, [username, password])

  const usernameError = !username.trim() && touched.username ? 'This field is required' : ''
  const passwordError = !password.trim() && touched.password ? 'This field is required' : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ username: true, password: true })
    setServerError(null)

    if (!isValid) return

    try {
      setLoading(true)
      const data = await apiLogin(username.trim(), password);
      if (data?.user) {
        if (data?.token) localStorage.setItem('token', data.token);
        if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setServerError(data?.message || 'Invalid response from server');
      }
    } catch (err: any) {
      setServerError(err?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Add Google Sign In handler
  const handleGoogleSignIn = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://sibol-backend-i0i6.onrender.com';
    window.location.href = `${apiUrl}/api/auth/google`;
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
          {/* <p className="auth-tagline"></p> */}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <img className="auth-top-logo" src={topLogo} alt="SIBOL" />
          <h1 className="auth-title">Sign in to your account</h1>

          {/* ✅ Fixed Google Sign In button */}
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
            <div className="relative">
              <input
                className={`auth-input${passwordError ? ' is-error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center justify-center px-2 text-gray-600 bg-transparent border-0 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {passwordError ? <div className="auth-error">{passwordError}</div> : null}

            <div className="auth-forgot">
              <button type="button" className="auth-link" onClick={() => setFpOpen(true)}>Forgot Password?</button>
            </div>

            {serverError && <div className="auth-error" style={{ marginBottom: 8 }}>{serverError}</div>}

            <button className="auth-submit" type="submit" disabled={!isValid || loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-bottom-text">
            Don't have an account? <button className="auth-link" type="button" onClick={() => navigate('/signup')}>Sign up</button>
          </p>

          <ForgotPasswordModal open={fpOpen} onClose={() => setFpOpen(false)} />
        </div>
      </div>
    </div>
  )
}

export default Login