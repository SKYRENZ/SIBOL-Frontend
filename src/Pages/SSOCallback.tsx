import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const SSOCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Processing...');

  useEffect(() => {
    const handleSSOCallback = () => {
      try {
        const token = searchParams.get('token') || searchParams.get('access_token');
        const user = searchParams.get('user');
        const auth = searchParams.get('auth');
        const errorParam = searchParams.get('error');
        const errorMessage = searchParams.get('message');

        // Check if this is a popup window
        const isPopup = window.opener && !window.opener.closed;

        if (auth === 'fail' || errorParam) {
          const error = errorMessage || errorParam || 'Authentication failed';
          setMessage(error);
          
          if (isPopup) {
            window.opener.postMessage({
              type: 'SSO_ERROR',
              message: error
            }, window.location.origin);
            setTimeout(() => window.close(), 1000);
          }
          return;
        }

        if (token && user) {
          try {
            const parsedUser = JSON.parse(decodeURIComponent(user));
            
            if (isPopup) {
              // Send success message to parent window
              window.opener.postMessage({
                type: 'SSO_SUCCESS',
                token,
                user: parsedUser
              }, window.location.origin);
              
              setMessage('Success! Closing window...');
              setTimeout(() => window.close(), 500);
            } else {
              // Fallback: store and redirect if not in popup
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(parsedUser));
              window.location.href = '/dashboard';
            }
          } catch (e) {
            console.error('Failed to parse user:', e);
            setMessage('Error parsing user data');
          }
          return;
        }

        // Handle other cases (signup needed, verification needed, etc.)
        const sso = searchParams.get('sso');
        const email = searchParams.get('email');
        
        if (sso === 'google' && email) {
          const firstName = searchParams.get('firstName');
          const lastName = searchParams.get('lastName');
          const signupUrl = `/signup?sso=google&email=${encodeURIComponent(email)}${
            firstName ? `&firstName=${encodeURIComponent(firstName)}` : ''
          }${lastName ? `&lastName=${encodeURIComponent(lastName)}` : ''}`;
          
          if (isPopup) {
            window.opener.location.href = signupUrl;
            window.close();
          } else {
            window.location.href = signupUrl;
          }
          return;
        }

        setMessage('Redirecting to login...');
        setTimeout(() => {
          if (isPopup) {
            window.opener.location.href = '/login';
            window.close();
          } else {
            window.location.href = '/login';
          }
        }, 1000);

      } catch (err: any) {
        console.error('SSO Callback error:', err);
        setMessage('An error occurred');
        setTimeout(() => window.close(), 2000);
      }
    };

    handleSSOCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default SSOCallback;