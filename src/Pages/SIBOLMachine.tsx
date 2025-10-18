import React from 'react'
import Header from '../Components/Header'

const SIBOLMachine: React.FC = () => {
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
          SIBOL Machine
        </h1>
        
        <p style={{
          color: '#666',
          fontSize: '18px'
        }}>
          Welcome to your SIBOL Machine! This is where your main content will go.
        </p>
      </div>
    </div>
  )
}

export default SIBOLMachine