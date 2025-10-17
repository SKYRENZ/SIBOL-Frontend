import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({})

  const isValid = useMemo(() => username.trim().length > 0 && password.trim().length > 0, [username, password])

  const usernameError = !username.trim() && touched.username ? 'This field is required' : ''
  const passwordError = !password.trim() && touched.password ? 'This field is required' : ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ username: true, password: true })
    if (isValid) {
      navigate('/dashboard')
    }
  }

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

          {/* Third-party sign-in removed as requested */}

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

            <button className="auth-submit" type="submit" disabled={!isValid}>Sign in</button>
          </form>

          <p className="auth-bottom-text">
            Don't have an account? <button className="auth-link" type="button" onClick={() => navigate('/signup')}>Sign up</button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login