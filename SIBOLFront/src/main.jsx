import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Import your page components
import Login from './Pages/Login.tsx'
import Registration from './Pages/Registration.tsx'
import Dashboard from './Pages/Dashboard.tsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* makes the login page as our main page (starting point) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        
        {/* Protected/Main Application Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* 
          HOW TO ADD MORE ROUTES IN THE FUTURE:
          
          1. Create your new component file in the Pages folder
          2. Import it at the top of this file
          3. Add a new Route element below
          
          Examples:
          - For a Profile page: <Route path="/profile" element={<Profile />} />
          - For Settings page: <Route path="/settings" element={<Settings />} />
          - For nested routes: <Route path="/users/:id" element={<UserDetail />} />
          - For a catch-all 404: <Route path="*" element={<NotFound />} />
          
          Route Structure:
          - path="/routename" - defines the URL path (with leading slash)
          - element={<Component />} - the component to render
          - Use path="*" for catch-all routes (404 pages)
          - Use path="/users/:id" for dynamic parameters
          
          To change the default page:
          - Modify the Navigate component's "to" prop on line 15
          - Example: <Navigate to="/dashboard" replace /> for dashboard as default
        */}
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
