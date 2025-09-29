import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SignUp: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('')
  const [barangay, setBarangay] = useState('')
  // Step 2
  const [email, setEmail] = useState('')

  const [errors, setErrors] = useState<{ [k: string]: string }>({})

  const green = '#8BAA95'
  const borderColor = '#8BAA95'
  const thinBorder = `1px solid ${borderColor}`

  const logo = new URL('../assets/images/Caratao (3) 1.png', import.meta.url).href

  const validateStep1 = () => {
    const newErrors: { [k: string]: string } = {}
    if (!firstName) newErrors.firstName = 'First name is required'
    if (!lastName) newErrors.lastName = 'Last name is required'
    if (!role) newErrors.role = 'Role is required'
    if (!barangay) newErrors.barangay = 'Barangay is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: { [k: string]: string } = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) newErrors.email = 'Email is required'
    else if (!emailRegex.test(email)) newErrors.email = 'Enter a valid email'
    if (!lastName) newErrors.lastName = 'Last name is required'
    if (!role) newErrors.role = 'Role is required'
    if (!barangay) newErrors.barangay = 'Barangay is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep1()) setStep(2)
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep2()) {
      alert('Sign Up Successful')
      navigate('/login')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: thinBorder,
    borderRadius: '10px',
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    outline: 'none'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: green,
    marginBottom: '6px',
    fontSize: 'clamp(14px, 2.5vw, 16px)'
  }

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      padding: '8vh 24px 24px'
    }}>
      <img src={logo} alt="SIBOL" style={{ position: 'absolute', top: 16, left: 16, height: 'clamp(56px, 8vw, 96px)' }} />
      <div style={{ width: '100%', maxWidth: '640px', padding: '0 8px' }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '24px',
          color: green,
          fontSize: 'clamp(28px, 4vw, 36px)',
          fontWeight: 700
        }}>
          {step === 1 ? 'Sign up' : 'Other Details'}
        </h1>

        {step === 1 ? (
          <form onSubmit={handleProceed} style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
              {errors.firstName && <div style={{ color: '#cc0000', marginTop: 6, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>{errors.firstName}</div>}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
              {errors.lastName && <div style={{ color: '#cc0000', marginTop: 6, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>{errors.lastName}</div>}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Role</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle} />
              {errors.role && <div style={{ color: '#cc0000', marginTop: 6, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>{errors.role}</div>}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Baranggay</label>
              <input type="text" value={barangay} onChange={(e) => setBarangay(e.target.value)} style={inputStyle} />
              {errors.barangay && <div style={{ color: '#cc0000', marginTop: 6, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>{errors.barangay}</div>}
            </div>
            <button type="submit" style={{
              width: '100%', maxWidth: '420px', display: 'block', margin: '8px auto 0', padding: '12px',
              backgroundColor: '#8BAA95', color: 'white', border: 'none', borderRadius: 12,
              fontSize: 'clamp(14px, 3vw, 16px)', cursor: 'pointer'
            }}>Proceed</button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
              {errors.email && <div style={{ color: '#cc0000', marginTop: 6, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>{errors.email}</div>}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
              {errors.lastName && <div style={{ color: '#cc0000', marginTop: 6, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>{errors.lastName}</div>}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Role</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} style={inputStyle} />
              {errors.role && <div style={{ color: '#cc0000', marginTop: 6, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>{errors.role}</div>}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Baranggay</label>
              <input type="text" value={barangay} onChange={(e) => setBarangay(e.target.value)} style={inputStyle} />
              {errors.barangay && <div style={{ color: '#cc0000', marginTop: 6, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>{errors.barangay}</div>}
            </div>
            <button type="submit" style={{
              width: '100%', maxWidth: '420px', display: 'block', margin: '8px auto 0', padding: '12px',
              backgroundColor: '#8BAA95', color: 'white', border: 'none', borderRadius: 12,
              fontSize: 'clamp(14px, 3vw, 16px)', cursor: 'pointer'
            }}>Sign Up</button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#7b8a7f', fontSize: 'clamp(14px, 3.2vw, 18px)' }}>
          Already have an account? <span onClick={() => navigate('/login')} style={{ color: green, cursor: 'pointer', fontWeight: 700 }}>Sign in</span>
        </p>
      </div>
    </div>
  )
}

export default SignUp


