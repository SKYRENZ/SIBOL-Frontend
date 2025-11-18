import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchJson } from '../services/apiClient';

export const useAdminPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isSSO, setIsSSO] = useState(false);
  const [username, setUsername] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  const [queueInfo, setQueueInfo] = useState<{
    position: number;
    totalPending: number;
    estimatedWaitTime: string;
  } | null>(null);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [queueError, setQueueError] = useState<string | null>(null);

  const topLogo = new URL('../assets/images/SIBOLOGOBULB.png', import.meta.url).href;
  const leftBg = new URL('../assets/images/TRASHBG.png', import.meta.url).href;
  const leftLogo = new URL('../assets/images/SIBOLWORDLOGO.png', import.meta.url).href;

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const ssoParam = searchParams.get('sso');
    const usernameParam = searchParams.get('username');

    if (emailParam) {
      setEmail(emailParam);
    }
    if (ssoParam === 'true') {
      setIsSSO(true);
    }
    if (usernameParam) {
      setUsername(usernameParam);
    }

    if (!emailParam && !usernameParam) {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const fetchQueuePosition = async () => {
      if (!email) {
        setLoadingQueue(false);
        return;
      }

      try {
        setLoadingQueue(true);
        setQueueError(null);
        
        const data = await fetchJson(`/api/auth/queue-position?email=${encodeURIComponent(email)}`);
        
        setQueueInfo(data);
      } catch (err: any) {
        setQueueError(err?.message || 'Failed to get queue position');
      } finally {
        setLoadingQueue(false);
      }
    };

    fetchQueuePosition();

    const interval = setInterval(fetchQueuePosition, 30000);

    return () => clearInterval(interval);
  }, [email]);

  const checkAccountStatus = async () => {
    if (!username && !email) {
      alert('Username or email is required to check status');
      return;
    }

    try {
      setCheckingStatus(true);

      let usernameToCheck = username;
      if (!usernameToCheck && email) {
        const emailPrefix = email.split('@')[0];
        usernameToCheck = emailPrefix.replace(/[^a-zA-Z.]/g, '').toLowerCase();
      }

      const data = await fetchJson(`/api/auth/check-status/${usernameToCheck}`);

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
      alert(error?.message ?? 'Error checking account status. Please try again later.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const goBackToLogin = () => {
    navigate('/login');
  };

  return {
    email,
    isSSO,
    username,
    checkingStatus,
    queueInfo,
    loadingQueue,
    queueError,
    topLogo,
    leftBg,
    leftLogo,
    checkAccountStatus,
    goBackToLogin,
  };
};