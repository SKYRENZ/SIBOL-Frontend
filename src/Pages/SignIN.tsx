import React, { useMemo, useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom'
import ForgotPasswordModal from '../Components/verification/ForgotPasswordModal';
import { login as apiLogin, isAuthenticated } from '../services/auth';
import AuthLeftPanel from '../Components/common/AuthLeftPanel';

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [fpOpen, setFpOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if user is already logged in - IMMEDIATE check
  useEffect(() => {
    if (isAuthenticated()) {
      setIsRedirecting(true);
      // Use replace to prevent back button issues
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Listen for SSO messages from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const allowedOrigin = new URL(API_URL).origin;
      
      if (event.origin !== allowedOrigin && event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'SSO_SUCCESS') {
        const { token, user } = event.data;
        if (token) localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
        setIsRedirecting(true);
        navigate('/dashboard', { replace: true });
      } else if (event.data?.type === 'SSO_ERROR') {
        setServerError(event.data.message || 'Google sign-in failed');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const isValid = useMemo(() => username.trim().length > 0 && password.trim().length > 0, [username, password])

  const usernameError = !username.trim() && touched.username ? 'This field is required' : ''
  const passwordError = !password.trim() && touched.password ? 'This field is required' : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ username: true, password: true })
    setServerError(null)

    if (!isValid) return

    try {
      setLoading(true)
      const data = await apiLogin(username.trim(), password);
      if (data?.user) {
        if (data?.token) localStorage.setItem('token', data.token);
        if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
        setIsRedirecting(true);
        navigate('/dashboard', { replace: true });
      } else {
        setServerError(data?.message || 'Invalid response from server');
      }
    } catch (err: any) {
      setServerError(err?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const authUrl = `${API_URL}/api/auth/google`;
    
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      authUrl,
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      setServerError('Popup blocked. Please allow popups for this site.');
    }
  };

  const googleIcon = new URL('../assets/images/flat-color-icons_google.png', import.meta.url).href
  const leftBg = new URL('../assets/images/TRASHBG.png', import.meta.url).href
  const leftLogo = new URL('../assets/images/SIBOLWORDLOGO.png', import.meta.url).href
  const topLogo = new URL('../assets/images/SIBOLOGOBULB.png', import.meta.url).href

  // Show loading state while redirecting to prevent flash of old content
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white lg:grid lg:grid-cols-2">
      {/* Left Panel */}
      <AuthLeftPanel backgroundImage={leftBg} logoImage={leftLogo} />

      {/* Right side - Form section */}
      <div className="flex items-center justify-center px-4 sm:px-6 md:px-8 py-8 sm:py-12 lg:py-16">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
          {/* Logo */}
          <img 
            className="block w-12 sm:w-14 md:w-16 h-auto mx-auto mb-4 sm:mb-6" 
            src={topLogo} 
            alt="SIBOL" 
          />
          
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-6 sm:mb-8">
            Sign in to your account
          </h1>

          {/* Form */}
          <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Username
              </label>
              <input
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base outline-none transition-all ${
                  usernameError 
                    ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100'
                }`}
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              />
              {usernameError && (
                <div className="text-red-600 text-xs sm:text-sm mt-1">{usernameError}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 border rounded-lg sm:rounded-xl text-sm sm:text-base outline-none transition-all ${
                    passwordError 
                      ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-green-300 focus:ring-2 focus:ring-green-100'
                  }`}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-600 bg-transparent border-0 p-0 focus:outline-none hover:text-gray-800"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
              {passwordError && (
                <div className="text-red-600 text-xs sm:text-sm mt-1">{passwordError}</div>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end mt-1">
              <button 
                type="button" 
                className="bg-transparent border-0 p-0 text-sibol-green hover:text-green-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                onClick={() => setFpOpen(true)}
              >
                Forgot Password?
              </button>
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="text-red-600 text-xs sm:text-sm text-center bg-red-50 p-2 sm:p-3 rounded-lg">
                {serverError}
              </div>
            )}

            {/* Submit Button */}
            <button 
              className="w-full bg-sibol-green hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-3 sm:py-3.5 rounded-full text-sm sm:text-base transition-all mt-2 sm:mt-3"
              type="submit" 
              disabled={!isValid || loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 sm:gap-4 my-5 sm:my-6 text-gray-400 font-semibold text-sm">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span>Or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 bg-white border-2 border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
          >
            <img src={googleIcon} className="w-5 h-5" alt="Google" />
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              Continue with Google
            </span>
          </button>

          {/* Sign Up Link */}
          <p className="text-center mt-6 sm:mt-8 text-gray-700 text-sm sm:text-base">
            Don't have an account?{' '}
            <button 
              className="bg-transparent border-0 p-0 text-sibol-green hover:text-green-700 font-bold transition-colors cursor-pointer"
              type="button" 
              onClick={() => navigate('/signup')}
            >
              Sign up
            </button>
          </p>

          <ForgotPasswordModal open={fpOpen} onClose={() => setFpOpen(false)} />
        </div>
      </div>
    </div>
  )
}

export default Login