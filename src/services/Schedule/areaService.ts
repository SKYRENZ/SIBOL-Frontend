// filepath: c:\Users\Renz\OneDrive\Documents\GitHub\SIBOL\SIBOL-Frontend\src\services\areaService.ts
import { fetchJson } from '../apiClient';

export interface Area {
  Area_id: number;
  Area_Name: string;
  Full_Address: string;
}

/**
 * Fetches all areas from the backend.
 * The API returns an object with a 'data' property containing the array of areas.
 */
export const getAllAreas = async (): Promise<{ data: Area[] }> => {
  return await fetchJson('/api/areas');
};