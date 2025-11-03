import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { verifyToken, getUser } from '../../services/auth';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: number; // Optional: restrict by role
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await verifyToken();
        
        if (!isValid) {
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }

        // Get user role
        const user = getUser();
        if (user) {
          const role = user.Roles ?? user.roleId ?? user.role ?? null;
          setUserRole(role);
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole !== undefined && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on their actual role
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;