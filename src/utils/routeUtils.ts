export function getLandingRoute(user?: any): string {
  const role = user?.Roles ?? user?.roleId ?? user?.role ?? user?.Roles_id ?? user?.RolesId;
  const roleNum = typeof role === 'string' ? Number(role) : role;

  if (roleNum === 5) return '/superadmin-dashboard';
  if (roleNum === 1) return '/admin-dashboard';
  if (roleNum === 3) return '/operator-emergency';
  return '/dashboard';
}
