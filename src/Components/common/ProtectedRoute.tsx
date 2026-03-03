import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface ProtectedRouteProps {
  requiredRole?: number | number[];
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

  // Determine if user is an admin (role 1) or superadmin (role 5)
  const userRole = getRoleNumber(user);
  const isAdmin = userRole === 1 || userRole === 5;
  const adminHome = isAdmin ? '/superadmin' : '/dashboard';

  // If user is authenticated but it's their first login, force them to their home page
  // so the Change Password modal flow cannot be bypassed by navigating elsewhere.
  if (isAuthenticated && isFirstLogin && location.pathname !== adminHome) {
    return <Navigate to={adminHome} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole !== undefined) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (userRole === null || !allowedRoles.includes(userRole)) {
      return <Navigate to={adminHome} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;