import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { verifyToken, getUser } from '../../services/auth';

interface ProtectedRouteProps {
  requiredRole?: number;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
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

  // ❌ REMOVE THIS SECTION if you want instant redirects:
  // if (isChecking) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Verifying authentication...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Show nothing while checking (instant redirect feel)
  if (isChecking) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole !== undefined && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;