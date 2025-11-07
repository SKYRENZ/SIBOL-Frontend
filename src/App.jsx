import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Import ProtectedRoute
import ProtectedRoute from './Components/common/ProtectedRoute.tsx';

// Lazy load page components
const Landingpage = lazy(() => import('./Pages/Landingpage.tsx'));
const Login = lazy(() => import('./Pages/SignIN.tsx'));
const SignUp = lazy(() => import('./Pages/SignUp.tsx'));
const EmailVerification = lazy(() => import('./Pages/EmailVerification.tsx'));
const AdminPending = lazy(() => import('./Pages/AdminPending.tsx'));
const SSOCallback = lazy(() => import('./Pages/SSOCallback.tsx'));
const Dashboard = lazy(() => import('./Pages/Dashboard.tsx'));
const Admin = lazy(() => import('./Pages/Admin.tsx'));
const SibolMachinePage = lazy(() => import('./Pages/SibolMachinePage.tsx'));
const Household = lazy(() => import('./Pages/Household.tsx'));
const MaintenancePage = lazy(() => import('./Pages/MaintenancePage.tsx'));
const NotFound = lazy(() => import('./Pages/NotFound.tsx')); // Recommended to create this page

// Define role IDs for clarity
const ROLES = {
  ADMIN: 1,
  // Add other roles here, e.g., USER: 2
};

function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
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

        {/* Protected Routes for Admins only */}
        <Route element={<ProtectedRoute requiredRole={ROLES.ADMIN} />}>
          <Route path="/admin" element={<Admin />} />
          {/* Add other admin-only routes here */}
        </Route>

        {/* Catch-all route for pages that don't exist */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;