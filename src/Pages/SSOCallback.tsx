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
        const sso = searchParams.get('sso');
        const email = searchParams.get('email');
        const username = searchParams.get('username');
        const firstName = searchParams.get('firstName');
        const lastName = searchParams.get('lastName');

        console.log('🔍 SSOCallback params:', {
          token: !!token,
          user: !!user,
          auth,
          errorParam,
          message: errorMessage,
          sso,
          email,
          username,
          firstName,
          lastName
        });

        // Check if this is a popup window
        const isPopup = window.opener && !window.opener.closed;

        // Handle authentication failure
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

        // Handle successful authentication with token
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

        // Handle admin pending (check message parameter first)
        if (errorMessage === 'admin_pending' && email) {
          console.log('⏳ Admin pending - redirecting to pending-approval');
          const pendingUrl = `/pending-approval?email=${encodeURIComponent(email)}${
            sso ? '&sso=true' : ''
          }${username ? `&username=${encodeURIComponent(username)}` : ''}`;
          
          setMessage('Account pending approval...');
          
          if (isPopup) {
            window.opener.location.href = pendingUrl;
            setTimeout(() => window.close(), 500);
          } else {
            window.location.href = pendingUrl;
          }
          return;
        }

        // Handle email verification needed
        if (errorMessage === 'email_pending' && email) {
          console.log('📧 Email verification needed');
          const verifyUrl = `/email-verification?email=${encodeURIComponent(email)}${
            username ? `&username=${encodeURIComponent(username)}` : ''
          }`;
          
          setMessage('Email verification required...');
          
          if (isPopup) {
            window.opener.location.href = verifyUrl;
            setTimeout(() => window.close(), 500);
          } else {
            window.location.href = verifyUrl;
          }
          return;
        }

        // Handle SSO signup flow (no account exists)
        if (sso === 'google' && email) {
          console.log('📝 SSO Signup flow - redirecting to signup');
          const signupUrl = `/signup?sso=google&email=${encodeURIComponent(email)}${
            firstName ? `&firstName=${encodeURIComponent(firstName)}` : ''
          }${lastName ? `&lastName=${encodeURIComponent(lastName)}` : ''}`;
          
          setMessage('Redirecting to signup...');
          
          if (isPopup) {
            window.opener.location.href = signupUrl;
            setTimeout(() => window.close(), 500);
          } else {
            window.location.href = signupUrl;
          }
          return;
        }

        // No valid params - redirect to login
        console.log('⚠️ No valid SSO params - Redirecting to login');
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