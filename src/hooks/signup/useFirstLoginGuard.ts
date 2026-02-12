import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

export default function FirstLoginGuard(): null {
  const navigate = useNavigate();
  const { isAuthenticated, isFirstLogin } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated && isFirstLogin) {
      if (window.location.pathname !== '/dashboard') {
        navigate('/dashboard', { replace: true });
      }

      const onBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
      };

      window.addEventListener('beforeunload', onBeforeUnload);
      return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }
  }, [isAuthenticated, isFirstLogin, navigate]);

  return null;
}