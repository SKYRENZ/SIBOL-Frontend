// filepath: c:\Users\Renz\OneDrive\Documents\GitHub\SIBOL\SIBOL-Frontend\src\services\areaService.ts
import { fetchJson } from '../apiClient';

export interface Area {
  Area_id: number;
  Area_Name: string;
}

export const getAllAreas = async (): Promise<Area[]> => {
  const data = await fetchJson('/api/areas');
  return data ?? [];
};