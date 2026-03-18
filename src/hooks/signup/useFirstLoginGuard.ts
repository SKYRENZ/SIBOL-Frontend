import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { getLandingRoute } from '../../utils/routeUtils';

function getUserRole(user: any): number | null {
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

export default function FirstLoginGuard(): null {
  const navigate = useNavigate();
  const { isAuthenticated, isFirstLogin, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const role = getUserRole(user);
    const isAdmin = role === 1 || role === 5;
    const adminHome = getLandingRoute(user);

    if (isFirstLogin) {
      const target = adminHome;
      if (window.location.pathname !== target) {
        navigate(target, { replace: true });
      }

      const onBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
      };

      window.addEventListener('beforeunload', onBeforeUnload);
      return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }

    // Redirect admin/superadmin users from /dashboard to their home route
    if (isAdmin && window.location.pathname === '/dashboard') {
      navigate(adminHome, { replace: true });
    }
  }, [isAuthenticated, isFirstLogin, user, navigate]);

  return null;
}
