import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface ProtectedRouteProps {
  requiredRole?: number;
}

function getRoleNumber(user: any): number | null {
  const role =
    user?.Roles ??
    user?.roleId ??
    user?.role ??
    user?.Roles_id ??
    user?.RolesId ??
    null;

  const n = typeof role === 'string' ? Number(role) : role;
  return Number.isFinite(n) ? (n as number) : null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const location = useLocation();

  const { isAuthenticated, user, isCheckingAuth, hasCheckedAuth, isFirstLogin } = useAppSelector((s) => s.auth);

  // ✅ Only block rendering while checking *if not authenticated yet*
  if (!isAuthenticated && (!hasCheckedAuth || isCheckingAuth)) {
    return null; // or a spinner
  }

  // If user is authenticated but it's their first login, force them to `/dashboard`
  // so the Change Password modal flow cannot be bypassed by navigating elsewhere.
  if (isAuthenticated && isFirstLogin && location.pathname !== '/dashboard') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = getRoleNumber(user);

  if (requiredRole !== undefined && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;