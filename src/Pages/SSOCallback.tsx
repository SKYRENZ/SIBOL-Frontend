import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SSOCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSSOCallback = async () => {
      try {
        console.log('🔐 SSO Callback - Processing...');
        
        // Get all params
        const token = searchParams.get('token') || searchParams.get('access_token');
        const user = searchParams.get('user');
        const auth = searchParams.get('auth');
        const errorParam = searchParams.get('error');
        const message = searchParams.get('message');
        const sso = searchParams.get('sso');
        const email = searchParams.get('email');
        const firstName = searchParams.get('firstName');
        const lastName = searchParams.get('lastName');

        console.log('📋 SSO Params:', { 
          token: !!token, 
          user: !!user, 
          auth, 
          errorParam, 
          message, 
          sso, 
          email 
        });

        // Handle authentication failure
        if (auth === 'fail' || errorParam) {
          console.log('❌ SSO Auth failed:', errorParam || 'Unknown error');
          setError(message || errorParam || 'Authentication failed');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
          return;
        }

        // Handle successful authentication with token
        if (token && user) {
          console.log('✅ SSO Success - Storing credentials');
          
          // Store token
          localStorage.setItem('token', token);
          
          // Parse and store user
          try {
            const parsedUser = JSON.parse(decodeURIComponent(user));
            localStorage.setItem('user', JSON.stringify(parsedUser));
            console.log('👤 User stored:', parsedUser);
          } catch (e) {
            console.error('Failed to parse user:', e);
          }

          // Redirect to dashboard
          console.log('🔄 Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard', { replace: true }), 500);
          return;
        }

        // Handle SSO signup flow (no account exists)
        if (sso === 'google' && email) {
          console.log('📝 SSO Signup flow - Redirecting to signup');
          const signupUrl = `/signup?sso=google&email=${encodeURIComponent(email)}${
            firstName ? `&firstName=${encodeURIComponent(firstName)}` : ''
          }${lastName ? `&lastName=${encodeURIComponent(lastName)}` : ''}${
            message ? `&message=${encodeURIComponent(message)}` : ''
          }`;
          
          navigate(signupUrl, { replace: true });
          return;
        }

        // Handle email verification needed
        if (message === 'email_pending' && email) {
          console.log('📧 Email verification needed');
          navigate(`/email-verification?email=${encodeURIComponent(email)}`, { replace: true });
          return;
        }

        // Handle admin approval needed
        if (message === 'admin_pending' && email) {
          console.log('⏳ Admin approval needed');
          navigate(`/pending-approval?email=${encodeURIComponent(email)}${sso ? '&sso=true' : ''}`, { replace: true });
          return;
        }

        // No valid params - redirect to login
        console.log('⚠️ No valid SSO params - Redirecting to login');
        navigate('/login', { replace: true });

      } catch (err: any) {
        console.error('❌ SSO Callback error:', err);
        setError(err?.message || 'An error occurred during sign-in');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    handleSSOCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8">
        {error ? (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Sign-In...</h2>
            <p className="text-gray-600">Please wait while we complete your authentication.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SSOCallback;