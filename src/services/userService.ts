import apiClient from "./apiClient";

interface UserOption {
  value: string;
  label: string;
}

/**
 * A scalable function to fetch users by any role.
 * @param roleName The name of the role (e.g., "Operator", "Admin")
 */
export async function getUsersByRole(roleName: string): Promise<UserOption[]> {
  const response = await apiClient.get<UserOption[]>(`/api/users/role/${roleName}`);
  return response.data;
}

/**
 * A specific function for getting operators, which now uses the scalable service.
 * This ensures existing code that calls getOperators() continues to work without changes.
 */
export async function getOperators(): Promise<UserOption[]> {
  return getUsersByRole("Operator");
}