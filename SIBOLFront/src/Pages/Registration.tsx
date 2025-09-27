import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Registration: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple validation
    if (username && password && confirmPassword) {
      if (password !== confirmPassword) {
        alert('Passwords do not match')
        return
      }
      
      // TODO: Add your registration logic here
      console.log('Registration:', { username, password })
      
      // Navigate to login after successful registration
      navigate('/login')
    } else {
      alert('Please fill in all fields')
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '350px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '8px',
          color: '#007bff',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          SIBOL
        </h1>
        
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          color: '#333',
          fontSize: '18px',
          fontWeight: 'normal'
        }}>
          Create Account
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            Create Account
          </button>
        </form>
        
        <p style={{ 
          textAlign: 'center', 
          marginTop: '15px',
          color: '#666',
          fontSize: '12px'
        }}>
          Already have an account?{' '}
          <span 
            onClick={() => navigate('/login')}
            style={{ 
              color: '#007bff', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  )
}

export default Registration