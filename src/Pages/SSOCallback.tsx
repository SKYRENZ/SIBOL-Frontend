import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';

const SSOCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [message, setMessage] = useState('Processing...');

  useEffect(() => {
    const handleSSOCallback = () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const user = queryParams.get('user');
        const auth = queryParams.get('auth');
        const errorParam = queryParams.get('error');
        const errorMessage = queryParams.get('message');
        const email = queryParams.get('email');
        const sso = queryParams.get('sso');
        const username = queryParams.get('username');
        const firstName = queryParams.get('firstName');
        const lastName = queryParams.get('lastName');

        const isPopup = window.opener && !window.opener.closed;

        console.log('SSO Callback params:', { 
          user: user ? 'present' : 'null', 
          auth, 
          errorParam, 
          errorMessage, 
          email,
          isPopup 
        });

        // ✅ Handle authentication failure
        if (auth === 'fail' || errorParam) {
          const error = errorParam || errorMessage || 'Authentication failed';
          setMessage(`Error: ${error}`);
          console.error('SSO Error:', error);
          
          if (isPopup) {
            window.opener.postMessage({
              type: 'SSO_ERROR',
              message: error
            }, window.location.origin);
            setTimeout(() => window.close(), 2000);
          } else {
            // Not a popup - redirect directly
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
          return;
        }

        // ✅ Handle successful authentication
        if (auth === 'success' && user) {
          try {
            const parsedUser = JSON.parse(decodeURIComponent(user));
            console.log('SSO Success - User:', parsedUser);
            
            // ✅ Store user in localStorage (cookie is already set by backend)
            localStorage.setItem('user', JSON.stringify(parsedUser));
            
            if (isPopup) {
              // ✅ POPUP: Send message to parent window
              setMessage('Success! Redirecting...');
              
              window.opener.postMessage({
                type: 'SSO_SUCCESS',
                user: parsedUser
              }, window.location.origin);
              
              // Close popup after sending message
              setTimeout(() => window.close(), 500);
            } else {
              // ✅ DIRECT ACCESS: Redirect to dashboard
              setMessage('Success! Redirecting to dashboard...');
              window.location.href = '/dashboard';
            }
            return;
          } catch (e) {
            console.error('Failed to parse user:', e);
            setMessage('Error parsing user data');
            setTimeout(() => {
              if (isPopup) {
                window.close();
              } else {
                window.location.href = '/login';
              }
            }, 2000);
          }
          return;
        }

        // ✅ Handle admin pending
        if (errorMessage === 'admin_pending' && email) {
          console.log('Admin pending - redirecting');
          const pendingUrl = `/pending-approval?email=${encodeURIComponent(email)}${
            sso ? '&sso=true' : ''
          }${username ? `&username=${encodeURIComponent(username)}` : ''}`;
          
          if (isPopup) {
            // ✅ INSTANT: No loading screen
            window.opener.location.href = pendingUrl;
            window.close();
          } else {
            window.location.href = pendingUrl;
          }
          return;
        }

        // ✅ Handle email verification needed
        if (errorMessage === 'email_pending' && email) {
          console.log('Email verification needed');
          const verifyUrl = `/email-verification?email=${encodeURIComponent(email)}${
            username ? `&username=${encodeURIComponent(username)}` : ''
          }`;
          
          if (isPopup) {
            // ✅ INSTANT: No loading screen
            window.opener.location.href = verifyUrl;
            window.close();
          } else {
            window.location.href = verifyUrl;
          }
          return;
        }

        // ✅ Handle SSO signup flow - INSTANT REDIRECT
        if (sso === 'google' && email) {
          console.log('SSO Signup flow');
          const signupUrl = `/signup?sso=google&email=${encodeURIComponent(email)}${
            firstName ? `&firstName=${encodeURIComponent(firstName)}` : ''
          }${lastName ? `&lastName=${encodeURIComponent(lastName)}` : ''}`;
          
          if (isPopup) {
            // ✅ INSTANT: No loading screen or message
            window.opener.location.href = signupUrl;
            window.close();
          } else {
            window.location.href = signupUrl;
          }
          return;
        }

        // No valid params - redirect to login
        console.warn('No valid SSO params:', { user, auth, errorParam, errorMessage });
        setMessage('Invalid SSO response. Redirecting to login...');
        setTimeout(() => {
          if (isPopup) {
            window.opener.location.href = '/login';
            window.close();
          } else {
            window.location.href = '/login';
          }
        }, 2000);

      } catch (err: any) {
        console.error('SSO Callback error:', err);
        setMessage('An error occurred');
        setTimeout(() => {
          if (window.opener && !window.opener.closed) {
            window.close();
          } else {
            window.location.href = '/login';
          }
        }, 2000);
      }
    };

    handleSSOCallback();
  }, [searchParams, location]);

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