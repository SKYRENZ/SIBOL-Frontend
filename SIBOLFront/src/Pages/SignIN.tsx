import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const navigate = useNavigate()

  const green = '#8BAA95'
  const greenDark = '#779983'
  const borderColor = '#8BAA95'
  const textMuted = '#8AA08F'

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}
    if (!email) newErrors.email = 'Username is required'
    if (!password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      alert('Login Successful')
      console.log('Login:', { email, password })
    }
  }

  const handleGoogleSignIn = () => {
    alert('Google Sign In Clicked')
  }

  

  const logo = new URL('../assets/images/Caratao (3) 1.png', import.meta.url).href

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      padding: '24px'
    }}>
      <img src={logo} alt="SIBOL" style={{ position: 'absolute', top: 16, left: 16, height: 'clamp(56px, 8vw, 96px)' }} />
      <div style={{ width: '100%', maxWidth: '560px', padding: '0 8px' }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '24px',
          color: green,
          fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 700
        }}>
          Sign in
        </h1>

        <form onSubmit={handleSubmit} style={{ maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: green, marginBottom: '6px', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `2px solid ${borderColor}`,
                borderRadius: '10px',
                fontSize: 'clamp(13px, 2.5vw, 15px)',
                outline: 'none'
              }}
            />
            {errors.email && (
              <div style={{ color: '#cc0000', marginTop: '6px', fontSize: 'clamp(12px, 2.5vw, 13px)' }}>{errors.email}</div>
            )}
          </div>

          <div style={{ marginBottom: '6px' }}>
            <label style={{ display: 'block', color: green, marginBottom: '6px', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `2px solid ${borderColor}`,
                borderRadius: '10px',
                fontSize: 'clamp(13px, 2.5vw, 15px)',
                outline: 'none'
              }}
            />
            {errors.password && (
              <div style={{ color: '#cc0000', marginTop: '6px', fontSize: 'clamp(12px, 2.5vw, 13px)' }}>{errors.password}</div>
            )}
          </div>

          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <button type="button" onClick={() => {}} style={{
              background: 'none',
              border: 'none',
              color: textMuted,
              cursor: 'pointer',
              fontSize: 'clamp(12px, 2.5vw, 14px)'
            }}>Forgot Password</button>
          </div>

          <button type="button" onClick={handleGoogleSignIn} style={{
            width: '100%',
            maxWidth: '420px',
            display: 'block',
            margin: '0 auto 12px',
            padding: '10px 12px',
            backgroundColor: green,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: 'clamp(14px, 3vw, 16px)',
            cursor: 'pointer'
          }}>Sign in with Google</button>

          <button type="submit" style={{
            width: '100%',
            maxWidth: '420px',
            display: 'block',
            margin: '0 auto 8px',
            padding: '10px 12px',
            backgroundColor: greenDark,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: 'clamp(14px, 3vw, 16px)',
            cursor: 'pointer'
          }}>Sign in</button>
          
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          color: '#7b8a7f',
          fontSize: 'clamp(14px, 3.2vw, 18px)'
        }}>
          Don't have an account? <span
            onClick={() => navigate('/signup')}
            style={{ color: green, cursor: 'pointer', fontWeight: 700 }}
          >Sign up</span>
        </p>
      </div>
    </div>
  )
}

export default Login