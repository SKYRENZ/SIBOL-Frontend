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

export function getUserRole(): string | null {
  const user = localStorage.getItem('user');
  if (!user) return null;
  
  try {
    const userData = JSON.parse(user);
    const roleId = userData.Roles ?? userData.roleId ?? userData.role;
    return getRoleNameFromId(roleId);
  } catch (err) {
    console.error('Error parsing user data:', err);
    return null;
  }
}