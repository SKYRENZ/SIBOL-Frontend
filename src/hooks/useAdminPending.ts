import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const useAdminPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [email, setEmail] = useState('');
  const [isSSO, setIsSSO] = useState(false);
  const [username, setUsername] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Assets
  const topLogo = new URL('../assets/images/SIBOLOGOBULB.png', import.meta.url).href;
  const leftBg = new URL('../assets/images/TRASHBG.png', import.meta.url).href;
  const leftLogo = new URL('../assets/images/SIBOLWORDLOGO.png', import.meta.url).href;

  // Initialize from URL params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const ssoParam = searchParams.get('sso');
    const usernameParam = searchParams.get('username');

    console.log('📋 AdminPending - URL params:', {
      email: emailParam,
      sso: ssoParam,
      username: usernameParam
    });

    if (emailParam) {
      setEmail(emailParam);
    }
    if (ssoParam === 'true') {
      setIsSSO(true);
    }
    if (usernameParam) {
      setUsername(usernameParam);
    }

    // If no email or username, redirect to login
    if (!emailParam && !usernameParam) {
      console.log('❌ No email or username found, redirecting to login');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  // Check account status function
  const checkAccountStatus = async () => {
    if (!username && !email) {
      alert('Username or email is required to check status');
      return;
    }

    try {
      setCheckingStatus(true);
      console.log('🔍 Checking account status for:', { username, email });
      
      // Extract username from email if username is not available
      let usernameToCheck = username;
      if (!usernameToCheck && email) {
        // Assume username format is firstname.lastname
        const emailPrefix = email.split('@')[0];
        usernameToCheck = emailPrefix.replace(/[^a-zA-Z.]/g, '').toLowerCase();
        console.log('📧 Extracted username from email:', usernameToCheck);
      }

      const response = await fetch(`/api/auth/check-status/${usernameToCheck}`);
      const data = await response.json();
      console.log('📋 Status check response:', data);

      if (data.status === 'active') {
        alert('Your account has been approved! You can now sign in.');
        navigate('/login');
      } else if (data.status === 'email_pending') {
        alert('Please verify your email first before admin approval.');
        navigate(`/email-verification?email=${encodeURIComponent(email)}`);
      } else {
        alert(`Status: ${data.message}`);
      }
    } catch (error) {
      console.error('❌ Error checking account status:', error);
      alert('Error checking account status. Please try again later.');
    } finally {
      setCheckingStatus(false);
    }
  };

  // Navigate back to login
  const goBackToLogin = () => {
    navigate('/login');
  };

  return {
    // State
    email,
    isSSO,
    username,
    checkingStatus,
    
    // Assets
    topLogo,
    leftBg,
    leftLogo,
    
    // Actions
    checkAccountStatus,
    goBackToLogin,
  };
};