import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './Components/common/ProtectedRoute';

// Lazy load page components
const Landingpage = lazy(() => import('./Pages/Landingpage.tsx'));
const SignIN = lazy(() => import('./Pages/SignIN.tsx'));
const SignUp = lazy(() => import('./Pages/SignUp.tsx'));
const ForgotPassword = lazy(() => import('./Pages/ForgotPassword.tsx')); // ✅ NEW
const Dashboard = lazy(() => import('./Pages/Dashboard.tsx'));
const Household = lazy(() => import('./Pages/Household.tsx'));
const Admin = lazy(() => import('./Pages/Admin.tsx'));
const MaintenancePage = lazy(() => import('./Pages/MaintenancePage.tsx'));
const SibolMachinePage = lazy(() => import('./Pages/SibolMachinePage.tsx'));
const NotFound = lazy(() => import('./Pages/NotFound.tsx'));
const EmailVerification = lazy(() => import('./Pages/EmailVerification.tsx'));
const AdminPending = lazy(() => import('./Pages/AdminPending.tsx'));
const SSOCallback = lazy(() => import('./Pages/SSOCallback.tsx'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<SignIN />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* ✅ NEW */}
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/pending-approval" element={<AdminPending />} />
        <Route path="/auth/callback" element={<SSOCallback />} />

        {/* Protected Routes for any authenticated user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sibol-machines" element={<SibolMachinePage />} />
          <Route path="/household" element={<Household />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
        </Route>

        {/* Admin Only Routes */}
        <Route element={<ProtectedRoute requiredRole={1} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;