export function getRoleNameFromId(roleId: number | string | null | undefined): string | null {
  const numericRoleId = typeof roleId === 'string' ? Number(roleId) : roleId;
  
  switch (numericRoleId) {
    case 1:
      return 'Admin';
    case 2:
      return 'Barangay';
    case 3:
      return 'Operator';
    case 4:
      return 'Household';
    default:
      return null;
  }
}

export function getUserRole(user?: any): string | null {
  if (!user) return null;
  const roleId = user.Roles ?? user.roleId ?? user.role;
  return getRoleNameFromId(roleId);
}