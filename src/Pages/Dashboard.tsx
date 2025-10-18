import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../Components/Header'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user came from OAuth redirect
    const userParam = searchParams.get('user')
    const authStatus = searchParams.get('auth')
    
    if (userParam && authStatus === 'success') {
      try {
        // Parse user data from URL and store in localStorage
        const userData = JSON.parse(decodeURIComponent(userParam))
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        
        // Clean up URL by removing the parameters
        navigate('/dashboard', { replace: true })
      } catch (error) {
        console.error('Error parsing OAuth user data:', error)
        navigate('/login')
      }
    } else {
      // Check if user is already logged in via localStorage
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          localStorage.removeItem('user')
          navigate('/login')
        }
      } else {
        // No user data, redirect to login
        navigate('/login')
      }
    }
    
    setLoading(false)
  }, [navigate, searchParams])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      paddingTop: '64px',
      paddingLeft: '20px',
      paddingRight: '20px'
    }}>
      <Header />
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          color: '#007bff',
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}>
          Welcome, {user.FirstName} {user.LastName}!
        </h1>
        
        <p style={{
          color: '#666',
          fontSize: '18px',
          marginBottom: '20px'
        }}>
          Welcome to your SIBOL dashboard! You are logged in as: {user.Username}
        </p>

        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default Dashboard