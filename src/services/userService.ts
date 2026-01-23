import apiClient from "./apiClient";

interface UserOption {
  value: number;
  label: string;
}

/**
 * Get users by role name (scalable approach)
 * Examples: 'Admin', 'Barangay', 'Operator', 'Household'
 */
export async function getUsersByRole(roleName: string): Promise<UserOption[]> {
  const response = await apiClient.get<UserOption[]>(`/api/users/role/${roleName}`);
  return response.data;
}

/**
 * Get users from multiple roles combined
 * @param roleNames - Array of role names to fetch (e.g., ['Admin', 'Barangay'])
 * @returns Combined list of users from all specified roles, sorted by label
 */
export async function getUsersByRoles(roleNames: string[]): Promise<UserOption[]> {
  try {
    if (roleNames.length === 0) {
      return [];
    }

    // Fetch all roles in parallel
    const rolePromises = roleNames.map(roleName => getUsersByRole(roleName));
    const results = await Promise.all(rolePromises);
    
    // Flatten and combine all results
    const combined = results.flat();
    
    // Remove duplicates (in case a user has multiple roles)
    const uniqueUsers = Array.from(
      new Map(combined.map(user => [user.value, user])).values()
    );
    
    // Sort by label
    return uniqueUsers.sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    console.error('Error fetching users by roles:', error);
    return [];
  }
}

/**
 * A specific function for getting operators, which now uses the scalable service.
 * This ensures existing code that calls getOperators() continues to work without changes.
 */
export async function getOperators(): Promise<UserOption[]> {
  return getUsersByRole("Operator");
}

/**
 * Get Barangay staff (Admin + Barangay roles combined)
 * This is a convenience function that uses getUsersByRoles()
 */
export async function getBarangayStaff(): Promise<UserOption[]> {
  return getUsersByRoles(['Admin', 'Barangay']);
}

/**
 * Get all users from all roles
 */
export async function getAllUsers(): Promise<UserOption[]> {
  return getUsersByRoles(['Admin', 'Barangay', 'Operator', 'Household']);
}