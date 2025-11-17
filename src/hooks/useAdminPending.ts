import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchJson } from '../services/apiClient';

export const useAdminPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State
  const [email, setEmail] = useState('');
  const [isSSO, setIsSSO] = useState(false);
  const [username, setUsername] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  // ✅ NEW: Queue position state
  const [queueInfo, setQueueInfo] = useState<{
    position: number;
    totalPending: number;
    estimatedWaitTime: string;
  } | null>(null);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [queueError, setQueueError] = useState<string | null>(null);

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

  // ✅ NEW: Fetch queue position when email is available
  useEffect(() => {
    const fetchQueuePosition = async () => {
      if (!email) {
        setLoadingQueue(false);
        return;
      }

      try {
        setLoadingQueue(true);
        setQueueError(null);
        console.log('🔍 Fetching queue position for:', email);
        
        const data = await fetchJson(`/api/auth/queue-position?email=${encodeURIComponent(email)}`);
        
        console.log('📊 Queue position data:', data);
        setQueueInfo(data);
      } catch (err: any) {
        console.error('❌ Failed to get queue position:', err);
        setQueueError(err?.message || 'Failed to get queue position');
      } finally {
        setLoadingQueue(false);
      }
    };

    fetchQueuePosition();

    // Refresh queue position every 30 seconds
    const interval = setInterval(fetchQueuePosition, 30000);

    return () => clearInterval(interval);
  }, [email]);

  // Check account status function
  const checkAccountStatus = async () => {
    if (!username && !email) {
      alert('Username or email is required to check status');
      return;
    }

    try {
      setCheckingStatus(true);
      console.log('🔍 Checking account status for:', { username, email });

      let usernameToCheck = username;
      if (!usernameToCheck && email) {
        const emailPrefix = email.split('@')[0];
        usernameToCheck = emailPrefix.replace(/[^a-zA-Z.]/g, '').toLowerCase();
        console.log('📧 Extracted username from email:', usernameToCheck);
      }

      const data = await fetchJson(`/api/auth/check-status/${usernameToCheck}`);
      console.log('📋 Status check response:', data);

      if (data.status === 'active') {
        alert('Your account has been approved! You can now sign in.');
        navigate('/login');
      } else if (data.status === 'email_pending') {
        alert('Please verify your email first before admin approval.');
        navigate(`/email-verification?email=${encodeURIComponent(email)}`);
      } else {
        alert(`Status: ${data.message || data.status}`);
      }
    } catch (error: any) {
      console.error('❌ Error checking account status:', error);
      alert(error?.message ?? 'Error checking account status. Please try again later.');
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
    
    // ✅ NEW: Queue info
    queueInfo,
    loadingQueue,
    queueError,
    
    // Assets
    topLogo,
    leftBg,
    leftLogo,
    
    // Actions
    checkAccountStatus,
    goBackToLogin,
  };
};