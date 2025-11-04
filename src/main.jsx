import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './tailwind.css'
import './index.css'
import 'leaflet/dist/leaflet.css';

// Import your page components
import Login from './Pages/SignIN.tsx'
import SignUp from './Pages/SignUp.tsx'
import EmailVerification from './Pages/EmailVerification.tsx'
import AdminPending from './Pages/AdminPending.tsx'
import Dashboard from './Pages/Dashboard.tsx'
import Admin from './Pages/Admin.tsx';
import TestPage from './Pages/TestPage.tsx';
import SibolMachinePage from './Pages/SibolMachinePage.tsx';
import Household from './Pages/Household.tsx';
import Landingpage from './Pages/Landingpage.tsx';
import MaintenancePage from './Pages/MaintenancePage.tsx';
import SSOCallback from './Pages/SSOCallback.tsx';

// Import ProtectedRoute
import ProtectedRoute from './Components/common/ProtectedRoute.tsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Landing Page - Public route that redirects if authenticated */}
        <Route path="/" element={<Landingpage />} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/pending-approval" element={<AdminPending />} />
        
        {/* SSO Callback Route */}
        <Route path="/auth/callback" element={<SSOCallback />} />
        
        {/* Protected Routes - Authentication required */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/sibol-machines" 
          element={
            <ProtectedRoute>
              <SibolMachinePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/household" 
          element={
            <ProtectedRoute>
              <Household />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/maintenance" 
          element={
            <ProtectedRoute>
              <MaintenancePage />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all route - redirects to landing page instead of login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
